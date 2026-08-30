import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ username: z.string().min(3).max(20) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = rateLimit(`invite:${ip}`, 20, 60 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let inviterId: string;
  try { inviterId = verifyToken(token).sub; } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { data: group } = await supabase
    .from("aura_groups")
    .select("id, name, owner_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group.owner_id !== inviterId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { data: unameRow } = await supabase
    .from("aura_usernames")
    .select("user_id")
    .eq("username", parsed.data.username.replace(/^@/, "").toLowerCase())
    .maybeSingle();

  if (!unameRow) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const inviteeId = unameRow.user_id;

  const { data: existingMember } = await supabase
    .from("aura_group_members")
    .select("user_id")
    .eq("group_id", group.id)
    .eq("user_id", inviteeId)
    .maybeSingle();

  if (existingMember) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  const { data: invite, error: inviteError } = await supabase.from("aura_group_invites").insert({
    group_id: group.id,
    invitee_id: inviteeId,
    inviter_id: inviterId,
    status: "pending",
  }).select("id").single();

  if (inviteError || !invite) {
    if (inviteError?.code === "23505") return NextResponse.json({ error: "Already invited" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const [{ data: inviterRow }, { data: inviterUser }] = await Promise.all([
    supabase.from("aura_usernames").select("username").eq("user_id", inviterId).maybeSingle(),
    supabase.from("aura_users").select("display_name").eq("id", inviterId).single(),
  ]);

  await supabase.from("aura_notifications").insert({
    user_id: inviteeId,
    type: "group_invite",
    payload: {
      invite_id: invite.id,
      group_id: group.id,
      group_name: group.name,
      group_slug: slug,
      inviter_id: inviterId,
      inviter_username: inviterRow?.username ?? null,
      inviter_display_name: inviterUser?.display_name ?? "Someone",
    },
    read: false,
  });

  return NextResponse.json({ ok: true });
}
