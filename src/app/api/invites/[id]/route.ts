import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";

const schema = z.object({ action: z.enum(["accept", "reject"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try { userId = verifyToken(token).sub; } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { id } = await params;
  const { data: invite } = await supabase
    .from("aura_group_invites")
    .select("id, group_id, invitee_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invite.invitee_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (invite.status !== "pending") return NextResponse.json({ error: "Invite already resolved" }, { status: 409 });

  const newStatus = parsed.data.action === "accept" ? "accepted" : "rejected";

  await supabase.from("aura_group_invites").update({ status: newStatus }).eq("id", id);

  if (parsed.data.action === "accept") {
    await supabase.from("aura_group_members").upsert(
      { group_id: invite.group_id, user_id: userId, role: "member" },
      { onConflict: "group_id,user_id" }
    );
  }

  await supabase.from("aura_notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("type", "group_invite")
    .contains("payload", { group_id: invite.group_id });

  return NextResponse.json({ ok: true, status: newStatus });
}
