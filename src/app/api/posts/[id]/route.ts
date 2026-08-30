import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token).sub;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("aura_posts")
    .select(`
      id, user_id, username, media_type, media_url, caption, category,
      aura_score, rating_count, created_at, aspect_ratio,
      aura_usernames!username(display_name),
      aura_users!user_id(avatar_url)
    `)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const un = Array.isArray(data.aura_usernames) ? data.aura_usernames[0] : data.aura_usernames;
  const u = Array.isArray(data.aura_users) ? data.aura_users[0] : data.aura_users;

  return NextResponse.json({
    post: {
      id: data.id,
      authorId: data.user_id,
      author: {
        id: data.user_id,
        username: data.username,
        displayName: un?.display_name ?? data.username,
        avatarUrl: u?.avatar_url ?? null,
        level: "NPC",
        bio: "", auraScore: 0, globalRank: 0, weeklyRank: 0,
        badges: [], postCount: 0, ratingCount: 0, joinedAt: "",
      },
      mediaType: data.media_type,
      mediaUrl: data.media_url,
      caption: data.caption ?? "",
      category: data.category,
      auraScore: Number(data.aura_score),
      ratingCount: data.rating_count,
      createdAt: data.created_at,
      aspectRatio: data.aspect_ratio ?? "1:1",
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership before deleting
  const { data: post } = await supabase
    .from("aura_posts")
    .select("id, media_url")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from storage
  const url = new URL(post.media_url);
  const storagePath = url.pathname.split("/post-media/")[1];
  if (storagePath) {
    await supabase.storage.from("post-media").remove([storagePath]);
  }

  const { error } = await supabase
    .from("aura_posts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
