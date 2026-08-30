import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: group } = await supabase
    .from("aura_groups")
    .select("id, name, slug, description, country_code, country_name, city, owner_id, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  let myRole: "owner" | "member" | null = null;

  if (token) {
    try {
      const { sub } = verifyToken(token);
      const { data: membership } = await supabase
        .from("aura_group_members")
        .select("role")
        .eq("group_id", group.id)
        .eq("user_id", sub)
        .maybeSingle();
      myRole = (membership?.role as "owner" | "member") ?? null;
    } catch { /* anonymous */ }
  }

  const { data: members } = await supabase
    .from("aura_group_members")
    .select("user_id, role")
    .eq("group_id", group.id);

  const memberDetails = await Promise.all(
    (members ?? []).map(async (m) => {
      const [{ data: userRow }, { data: unameRow }] = await Promise.all([
        supabase.from("aura_users").select("display_name, avatar_url").eq("id", m.user_id).single(),
        supabase.from("aura_usernames").select("username").eq("user_id", m.user_id).maybeSingle(),
      ]);
      return {
        userId: m.user_id,
        username: unameRow?.username ?? null,
        displayName: userRow?.display_name ?? "Anon",
        avatarUrl: userRow?.avatar_url ?? null,
        role: m.role as "owner" | "member",
        joinedAt: group.created_at,
      };
    })
  );

  return NextResponse.json({
    id: group.id,
    name: group.name,
    slug: group.slug,
    description: group.description ?? null,
    countryCode: group.country_code ?? null,
    countryName: group.country_name ?? null,
    city: group.city ?? null,
    ownerId: group.owner_id,
    memberCount: memberDetails.length,
    createdAt: group.created_at,
    myRole,
    members: memberDetails,
  });
}
