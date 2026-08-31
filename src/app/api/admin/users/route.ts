import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(0, parseInt(req.nextUrl.searchParams.get("page") ?? "0"));
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  // Fetch from aura_usernames (only users who have claimed a username)
  // plus join aura_users for role/created_at, and count posts
  let query = supabase
    .from("aura_usernames")
    .select(
      "user_id, username, display_name, created_at, aura_users!inner(role, created_at)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (q) {
    query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

  // Also fetch users without usernames if no query
  const { count: noUsernameCount } = await supabase
    .from("aura_users")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    users: data ?? [],
    total: count ?? 0,
    totalAllUsers: noUsernameCount ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}
