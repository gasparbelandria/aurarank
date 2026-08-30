import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

const createSchema = z.object({
  name: z.string().min(2).max(60).trim(),
  description: z.string().max(280).trim().optional(),
  countryCode: z.string().length(2).optional(),
  countryName: z.string().max(80).trim().optional(),
  city: z.string().max(80).trim().optional(),
});

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try { userId = verifyToken(token).sub; } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: memberships } = await supabase
    .from("aura_group_members")
    .select("group_id, role")
    .eq("user_id", userId);

  if (!memberships?.length) return NextResponse.json([]);

  const groupIds = memberships.map((m) => m.group_id);
  const roleMap = Object.fromEntries(memberships.map((m) => [m.group_id, m.role]));

  const { data: groups } = await supabase
    .from("aura_groups")
    .select("id, name, slug, description, country_code, country_name, city, owner_id, created_at")
    .in("id", groupIds);

  if (!groups) return NextResponse.json([]);

  const counts = await Promise.all(
    groups.map((g) =>
      supabase.from("aura_group_members").select("*", { count: "exact", head: true }).eq("group_id", g.id)
    )
  );

  const result = groups.map((g, i) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    description: g.description ?? null,
    countryCode: g.country_code ?? null,
    countryName: g.country_name ?? null,
    city: g.city ?? null,
    ownerId: g.owner_id,
    memberCount: counts[i].count ?? 0,
    createdAt: g.created_at,
    myRole: roleMap[g.id] ?? "member",
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = rateLimit(`groups:create:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try { userId = verifyToken(token).sub; } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { name, description, countryCode, countryName, city } = parsed.data;
  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: group, error } = await supabase
    .from("aura_groups")
    .insert({ name, slug, description: description ?? null, country_code: countryCode ?? null, country_name: countryName ?? null, city: city ?? null, owner_id: userId })
    .select("id, name, slug")
    .single();

  if (error || !group) return NextResponse.json({ error: "Server error" }, { status: 500 });

  await supabase.from("aura_group_members").insert({ group_id: group.id, user_id: userId, role: "owner" });

  return NextResponse.json({ id: group.id, name: group.name, slug: group.slug });
}
