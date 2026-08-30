import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { logServerError } from "@/lib/logger";

async function resolveUserId(username: string): Promise<string | null> {
  const { data } = await supabase
    .from("aura_usernames")
    .select("user_id")
    .eq("username", username.replace(/^@/, "").toLowerCase())
    .maybeSingle();
  return data?.user_id ?? null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const targetId = await resolveUserId(username);
  if (!targetId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  let viewerId: string | null = null;
  if (token) {
    try { viewerId = verifyToken(token).sub; } catch { /* anonymous */ }
  }

  const [{ count: followerCount }, { count: followingCount }, isFollowingRow] = await Promise.all([
    supabase.from("aura_follows").select("*", { count: "exact", head: true }).eq("following_id", targetId),
    supabase.from("aura_follows").select("*", { count: "exact", head: true }).eq("follower_id", targetId),
    viewerId && viewerId !== targetId
      ? supabase.from("aura_follows").select("follower_id").eq("follower_id", viewerId).eq("following_id", targetId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return NextResponse.json({
    followerCount: followerCount ?? 0,
    followingCount: followingCount ?? 0,
    isFollowing: !!(isFollowingRow as { data: unknown }).data,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = rateLimit(`follow:${ip}`, 30, 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let viewerId: string;
  try { viewerId = verifyToken(token).sub; } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;
  const targetId = await resolveUserId(username);
  if (!targetId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (viewerId === targetId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  const { data: existingFollow } = await supabase
    .from("aura_follows")
    .select("follower_id")
    .eq("follower_id", viewerId)
    .eq("following_id", targetId)
    .maybeSingle();

  await supabase.from("aura_follows").upsert(
    { follower_id: viewerId, following_id: targetId },
    { onConflict: "follower_id,following_id" }
  );

  if (!existingFollow) {
    const [{ data: followerUsername }, { data: followerProfile }, { data: followerUser }] = await Promise.all([
      supabase.from("aura_usernames").select("username, display_name").eq("user_id", viewerId).maybeSingle(),
      supabase.from("aura_profiles").select("city, country_name").eq("user_id", viewerId).maybeSingle(),
      supabase.from("aura_users").select("avatar_url").eq("id", viewerId).maybeSingle(),
    ]);

    const { error: notifError } = await supabase.from("aura_notifications").insert({
      user_id: targetId,
      type: "follow",
      payload: {
        follower_username: followerUsername?.username ?? null,
        follower_display_name: followerUsername?.display_name ?? "Someone",
        follower_city: followerProfile?.city ?? null,
        follower_country_name: followerProfile?.country_name ?? null,
        follower_avatar_url: followerUser?.avatar_url ?? null,
      },
    });

    if (notifError) void logServerError("Follow notification insert error", { message: notifError.message, section: "feed", priority: "low" });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let viewerId: string;
  try { viewerId = verifyToken(token).sub; } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;
  const targetId = await resolveUserId(username);
  if (!targetId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.from("aura_follows")
    .delete()
    .eq("follower_id", viewerId)
    .eq("following_id", targetId);

  return NextResponse.json({ ok: true });
}
