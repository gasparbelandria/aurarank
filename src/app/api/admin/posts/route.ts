import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(0, parseInt(req.nextUrl.searchParams.get("page") ?? "0"));
  const category = req.nextUrl.searchParams.get("category") ?? "";
  const mediaType = req.nextUrl.searchParams.get("mediaType") ?? "";

  let query = supabase
    .from("aura_posts")
    .select(
      "id, username, caption, category, aura_score, rating_count, media_type, status, created_at, aspect_ratio, thumbnail_url, media_url",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (category) query = query.eq("category", category);
  if (mediaType) query = query.eq("media_type", mediaType);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

  return NextResponse.json({
    posts: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}

export async function DELETE(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("aura_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
