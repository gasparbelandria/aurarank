import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: user }, { data: usernameRow }, { count: totalUsers }] = await Promise.all([
    supabase
      .from("aura_users")
      .select("id, display_name, avatar_url, role")
      .eq("id", payload.sub)
      .single(),
    supabase
      .from("aura_usernames")
      .select("username")
      .eq("user_id", payload.sub)
      .maybeSingle(),
    supabase
      .from("aura_usernames")
      .select("*", { count: "exact", head: true }),
  ]);

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    username: usernameRow?.username ?? null,
    displayName: user.display_name ?? "Anon",
    avatarUrl: user.avatar_url ?? null,
    role: user.role,
    totalUsers: totalUsers ?? 0,
  });
}
