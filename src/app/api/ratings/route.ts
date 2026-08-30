import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return null;
  try { return verifyToken(token).sub; } catch { return null; }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { postId, score } = body ?? {};

  if (!postId || typeof score !== "number" || score < 0 || score > 100) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Fetch post + prevent self-rating
  const { data: post } = await supabase
    .from("aura_posts")
    .select("user_id, media_url, media_type, thumbnail_url, username")
    .eq("id", postId)
    .eq("status", "published")
    .maybeSingle();

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (post.user_id === userId) {
    return NextResponse.json({ error: "Cannot rate your own post" }, { status: 403 });
  }

  // Insert rating — trigger will update aura_posts.aura_score + rating_count
  const { error } = await supabase
    .from("aura_ratings")
    .insert({ post_id: postId, rater_id: userId, score: Math.round(score) });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "already_rated" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // Fetch updated score (trigger has already run by the time we query)
  const { data: updatedPost } = await supabase
    .from("aura_posts")
    .select("aura_score, rating_count")
    .eq("id", postId)
    .single();

  // Gather rater info for notification (non-blocking)
  const [{ data: raterUsername }, { data: raterProfile }] = await Promise.all([
    supabase
      .from("aura_usernames")
      .select("username, display_name")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("aura_profiles")
      .select("city, country_name")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  // Insert notification for post author
  await supabase.from("aura_notifications").insert({
    user_id: post.user_id,
    type: "rating",
    payload: {
      score: Math.round(score),
      rater_username: raterUsername?.username ?? null,
      rater_display_name: raterUsername?.display_name ?? "Anonymous",
      rater_city: raterProfile?.city ?? null,
      rater_country_name: raterProfile?.country_name ?? null,
      post_id: postId,
      post_media_url: post.media_url,
      post_thumbnail_url: post.thumbnail_url ?? null,
      post_media_type: post.media_type ?? "photo",
      post_author_username: post.username,
    },
  });

  return NextResponse.json({
    ok: true,
    newAuraScore: updatedPost ? Number(updatedPost.aura_score) : null,
    newRatingCount: updatedPost?.rating_count ?? null,
  });
}
