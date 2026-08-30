import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getLevel } from "@/lib/aura-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const clean = username.replace(/^@/, "").toLowerCase();

  const { data: usernameRow } = await supabase
    .from("aura_usernames")
    .select("username, display_name, user_id, claimed_at")
    .eq("username", clean)
    .maybeSingle();

  if (!usernameRow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: user }, { data: profile }, { count: postCount }, { data: allPosts }] = await Promise.all([
    supabase
      .from("aura_users")
      .select("avatar_url")
      .eq("id", usernameRow.user_id)
      .single(),
    supabase
      .from("aura_profiles")
      .select("bio, country_code, country_name, city, town")
      .eq("user_id", usernameRow.user_id)
      .maybeSingle(),
    supabase
      .from("aura_posts")
      .select("*", { count: "exact", head: true })
      .eq("username", usernameRow.username)
      .eq("status", "published"),
    // Fetch all published posts to compute per-user totals for ranking
    supabase
      .from("aura_posts")
      .select("username, aura_score")
      .eq("status", "published"),
  ]);

  // Compute per-user total aura scores
  const userTotals = new Map<string, number>();
  for (const p of allPosts ?? []) {
    userTotals.set(p.username, (userTotals.get(p.username) ?? 0) + (Number(p.aura_score) || 0));
  }

  const totalAura = userTotals.get(usernameRow.username) ?? 0;
  const globalRank = totalAura > 0
    ? [...userTotals.values()].filter((s) => s > totalAura).length + 1
    : 0;

  return NextResponse.json({
    id: usernameRow.user_id,
    username: usernameRow.username,
    displayName: usernameRow.display_name,
    avatarUrl: user?.avatar_url ?? null,
    bio: profile?.bio ?? "",
    auraScore: totalAura,
    level: getLevel(totalAura),
    globalRank,
    weeklyRank: 0,
    badges: [],
    postCount: postCount ?? 0,
    ratingCount: 0,
    joinedAt: usernameRow.claimed_at,
    countryCode: profile?.country_code ?? null,
    countryName: profile?.country_name ?? null,
    city: profile?.city ?? null,
    town: profile?.town ?? null,
  });
}
