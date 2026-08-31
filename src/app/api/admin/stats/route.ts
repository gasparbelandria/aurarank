import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

function groupByDay(rows: { created_at: string }[], days: number) {
  const map: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    map[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of rows) {
    const key = row.created_at.slice(0, 10);
    if (key in map) map[key]++;
  }
  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

export async function GET(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const days = Math.min(90, Math.max(7, parseInt(req.nextUrl.searchParams.get("days") ?? "30")));
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(Date.now() - 7 * 86400000);

  const [
    { count: totalUsers },
    { count: totalPosts },
    { count: totalRatings },
    { count: totalFollows },
    { data: recentUsers },
    { data: recentPosts },
    { data: allScores },
    { data: categoryRows },
    { data: mediaTypeRows },
    { count: unresolvedErrors },
  ] = await Promise.all([
    supabase.from("aura_users").select("*", { count: "exact", head: true }),
    supabase.from("aura_posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("aura_ratings").select("*", { count: "exact", head: true }),
    supabase.from("aura_follows").select("*", { count: "exact", head: true }),
    supabase.from("aura_users").select("id, created_at").gte("created_at", since).order("created_at", { ascending: true }),
    supabase.from("aura_posts").select("id, user_id, created_at").eq("status", "published").gte("created_at", since).order("created_at", { ascending: true }),
    supabase.from("aura_posts").select("aura_score, rating_count").eq("status", "published"),
    supabase.from("aura_posts").select("category").eq("status", "published"),
    supabase.from("aura_posts").select("media_type").eq("status", "published"),
    supabase.from("aura_error_logs").select("*", { count: "exact", head: true }).eq("resolved", false),
  ]);

  // Chart data
  const usersByDay = groupByDay(recentUsers ?? [], days);
  const postsByDay = groupByDay(recentPosts ?? [], days);

  // Aura score stats
  const scores = (allScores ?? []).map((p) => Number(p.aura_score));
  const avgAura = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const avgRatingsPerPost = allScores?.length
    ? Math.round((allScores.reduce((a, p) => a + (p.rating_count ?? 0), 0) / allScores.length) * 10) / 10
    : 0;

  // Category distribution
  const catCounts: Record<string, number> = {};
  for (const p of categoryRows ?? []) catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;

  // Media type distribution
  const mediaCounts: Record<string, number> = {};
  for (const p of mediaTypeRows ?? []) mediaCounts[p.media_type ?? "photo"] = (mediaCounts[p.media_type ?? "photo"] ?? 0) + 1;

  // Today / week deltas
  const usersToday = (recentUsers ?? []).filter((u) => new Date(u.created_at) >= todayStart).length;
  const usersThisWeek = (recentUsers ?? []).filter((u) => new Date(u.created_at) >= weekStart).length;
  const postsToday = (recentPosts ?? []).filter((p) => new Date(p.created_at) >= todayStart).length;
  const postsThisWeek = (recentPosts ?? []).filter((p) => new Date(p.created_at) >= weekStart).length;
  const activeUsers = new Set((recentPosts ?? []).filter((p) => new Date(p.created_at) >= weekStart).map((p) => p.user_id)).size;

  return NextResponse.json({
    stats: {
      totalUsers: totalUsers ?? 0,
      totalPosts: totalPosts ?? 0,
      totalRatings: totalRatings ?? 0,
      totalFollows: totalFollows ?? 0,
      avgAura,
      avgRatingsPerPost,
      usersToday,
      usersThisWeek,
      postsToday,
      postsThisWeek,
      activeUsers,
      unresolvedErrors: unresolvedErrors ?? 0,
    },
    charts: { usersByDay, postsByDay },
    categories: catCounts,
    mediaTypes: mediaCounts,
  });
}
