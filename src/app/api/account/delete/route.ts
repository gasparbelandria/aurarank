import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";

async function resolveUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return null;
  try { return verifyToken(token).sub; } catch { return null; }
}

// POST /api/account/delete — verify email only, no deletion
export async function POST(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { data: user } = await supabase
    .from("aura_users")
    .select("email")
    .eq("id", userId)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (email !== user.email.trim().toLowerCase()) {
    return NextResponse.json({ error: "email_mismatch" }, { status: 400 });
  }

  return NextResponse.json({ valid: true });
}

// DELETE /api/account/delete — full account deletion
export async function DELETE(_req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try { userId = verifyToken(token).sub; } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gather IDs needed for cascaded deletion
  const [{ data: posts }, { data: ownedGroups }] = await Promise.all([
    supabase.from("aura_posts").select("id").eq("user_id", userId),
    supabase.from("aura_groups").select("id").eq("owner_id", userId),
  ]);

  const postIds = (posts ?? []).map((p) => p.id);
  const ownedGroupIds = (ownedGroups ?? []).map((g) => g.id);

  // 1. Delete ratings on user's posts (before deleting posts)
  if (postIds.length > 0) {
    await supabase.from("aura_ratings").delete().in("post_id", postIds);
  }

  // 2. Delete ratings the user gave
  await supabase.from("aura_ratings").delete().eq("rater_id", userId);

  // 3. Delete all follow relationships
  await supabase
    .from("aura_follows")
    .delete()
    .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

  // 4. Delete user's notifications
  await supabase.from("aura_notifications").delete().eq("user_id", userId);

  // 5. Delete group invites (as inviter or invitee)
  await supabase
    .from("aura_group_invites")
    .delete()
    .or(`invitee_id.eq.${userId},inviter_id.eq.${userId}`);

  // 6. Remove all members from groups the user owns
  if (ownedGroupIds.length > 0) {
    await supabase.from("aura_group_members").delete().in("group_id", ownedGroupIds);
  }

  // 7. Remove user from any group they are a member of
  await supabase.from("aura_group_members").delete().eq("user_id", userId);

  // 8. Delete groups the user owns
  if (ownedGroupIds.length > 0) {
    await supabase.from("aura_groups").delete().in("id", ownedGroupIds);
  }

  // 9. Delete all posts
  await supabase.from("aura_posts").delete().eq("user_id", userId);

  // 10. Delete profile and username (can run in parallel)
  await Promise.all([
    supabase.from("aura_profiles").delete().eq("user_id", userId),
    supabase.from("aura_usernames").delete().eq("user_id", userId),
  ]);

  // 11. Delete user record (must be last due to FK references)
  await supabase.from("aura_users").delete().eq("id", userId);

  // 12. Delete avatar from storage (all possible extensions)
  await supabase.storage
    .from("avatars")
    .remove(["jpg", "png", "webp"].map((ext) => `${userId}.${ext}`));

  // 13. Delete post media files
  const { data: postMediaFiles } = await supabase.storage
    .from("post-media")
    .list(userId, { limit: 1000 });
  if (postMediaFiles?.length) {
    await supabase.storage
      .from("post-media")
      .remove(postMediaFiles.map((f) => `${userId}/${f.name}`));
  }

  // 14. Delete YouTube thumbnails
  const { data: thumbFiles } = await supabase.storage
    .from("post-media")
    .list(`thumbnails/${userId}`, { limit: 1000 });
  if (thumbFiles?.length) {
    await supabase.storage
      .from("post-media")
      .remove(thumbFiles.map((f) => `thumbnails/${userId}/${f.name}`));
  }

  // 15. Invalidate session cookie
  cookieStore.set("ar_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
