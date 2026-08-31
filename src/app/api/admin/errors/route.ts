import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(0, parseInt(req.nextUrl.searchParams.get("page") ?? "0"));
  const priority = req.nextUrl.searchParams.get("priority") ?? "";
  const showResolved = req.nextUrl.searchParams.get("resolved") === "1";

  let query = supabase
    .from("aura_error_logs")
    .select("id, created_at, title, message, priority, source, section, url, resolved, user_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (!showResolved) query = query.eq("resolved", false);
  if (priority && priority !== "all") query = query.eq("priority", priority);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

  return NextResponse.json({ errors: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE });
}

export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, resolved } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("aura_error_logs")
    .update({ resolved: !!resolved })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
