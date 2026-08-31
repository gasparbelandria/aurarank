import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";

export async function requireAdmin(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("ar_token")?.value;
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    const { data: user } = await supabase
      .from("aura_users")
      .select("role")
      .eq("id", payload.sub)
      .single();
    return user?.role === "admin" ? payload.sub : null;
  } catch {
    return null;
  }
}
