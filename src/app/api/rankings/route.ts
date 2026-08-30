import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";
import { getLevel } from "@/lib/aura-utils";
import type { RankingEntry, User } from "@/lib/types";

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return null;
  try { return verifyToken(token).sub; } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildUser(row: any): User {
  return {
    id: row.user_id,
    username: row.username,
    displayName: row.display_name ?? row.username,
    avatarUrl: row.avatar_url ?? null,
    bio: "",
    auraScore: row.totalAura,
    level: getLevel(row.totalAura),
    globalRank: 0,
    weeklyRank: 0,
    badges: [],
    postCount: row.postCount ?? 0,
    ratingCount: 0,
    joinedAt: row.created_at ?? "",
    countryCode: row.country_code ?? undefined,
    countryName: row.country_name ?? undefined,
    city: row.city ?? undefined,
  };
}

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "global";

  // ── FRIENDS tab ──────────────────────────────────────────────────────────────
  if (tab === "friends") {
    const { data: followRows } = await supabase
      .from("aura_follows")
      .select("following_id")
      .eq("follower_id", userId);

    const friendIds = (followRows ?? []).map((r) => r.following_id);

    if (friendIds.length === 0) {
      return NextResponse.json({ rankings: [], currentUserEntry: null });
    }

    return NextResponse.json(await buildRankings(friendIds, userId));
  }

  // ── GLOBAL / WEEKLY tabs ─────────────────────────────────────────────────────
  const { data: usernameRows } = await supabase
    .from("aura_usernames")
    .select("user_id")
    .limit(500);

  const allUserIds = (usernameRows ?? []).map((r) => r.user_id);
  if (allUserIds.length === 0) return NextResponse.json({ rankings: [], currentUserEntry: null });

  const weeklyOnly = tab === "weekly";
  return NextResponse.json(await buildRankings(allUserIds, userId, weeklyOnly));
}

async function buildRankings(
  userIds: string[],
  currentUserId: string,
  weeklyOnly = false
): Promise<{ rankings: RankingEntry[]; currentUserEntry: RankingEntry | null }> {
  // 1. Fetch user+username+profile data
  const { data: usernameData } = await supabase
    .from("aura_usernames")
    .select("user_id, username, display_name")
    .in("user_id", userIds);

  if (!usernameData?.length) return { rankings: [], currentUserEntry: null };

  const { data: userData } = await supabase
    .from("aura_users")
    .select("id, avatar_url, created_at")
    .in("id", userIds);

  const { data: profileData } = await supabase
    .from("aura_profiles")
    .select("user_id, city, country_code, country_name")
    .in("user_id", userIds);

  // 2. Fetch aura scores from posts
  let postQuery = supabase
    .from("aura_posts")
    .select("user_id, aura_score")
    .eq("status", "published")
    .in("user_id", userIds);

  if (weeklyOnly) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    postQuery = postQuery.gte("created_at", weekAgo);
  }

  const { data: postData } = await postQuery;

  // 3. Aggregate scores per user
  const scoreMap: Record<string, number> = {};
  const postCountMap: Record<string, number> = {};
  for (const post of postData ?? []) {
    scoreMap[post.user_id] = (scoreMap[post.user_id] ?? 0) + Number(post.aura_score);
    postCountMap[post.user_id] = (postCountMap[post.user_id] ?? 0) + 1;
  }

  // Build lookup maps
  const userMap = Object.fromEntries((userData ?? []).map((u) => [u.id, u]));
  const profileMap = Object.fromEntries((profileData ?? []).map((p) => [p.user_id, p]));

  // 4. Merge and sort: totalAura DESC, then created_at ASC (first user first for ties)
  const rows = usernameData.map((un) => ({
    user_id: un.user_id,
    username: un.username,
    display_name: un.display_name,
    avatar_url: userMap[un.user_id]?.avatar_url ?? null,
    created_at: userMap[un.user_id]?.created_at ?? "",
    totalAura: scoreMap[un.user_id] ?? 0,
    postCount: postCountMap[un.user_id] ?? 0,
    city: profileMap[un.user_id]?.city ?? null,
    country_code: profileMap[un.user_id]?.country_code ?? null,
    country_name: profileMap[un.user_id]?.country_name ?? null,
  }));

  rows.sort((a, b) => {
    if (b.totalAura !== a.totalAura) return b.totalAura - a.totalAura;
    // Tie-break: earlier created_at wins (first user gets higher rank)
    return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
  });

  // 5. Build RankingEntry array
  const rankings: RankingEntry[] = rows.map((row, i) => ({
    rank: i + 1,
    user: buildUser(row),
    auraScore: row.totalAura,
    movement: "same" as const,
    movementDelta: 0,
  }));

  // 6. Find current user's entry (may be outside top 50 displayed)
  const currentUserEntry = rankings.find((r) => r.user.id === currentUserId) ?? null;

  return { rankings, currentUserEntry };
}
