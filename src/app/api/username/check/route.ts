import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

const RESERVED = new Set([
  "admin", "api", "feed", "rankings", "create", "setup", "login", "signup",
  "logout", "me", "about", "support", "help", "terms", "privacy", "aurarank",
  "aura", "rank", "null", "undefined", "root", "system", "mod", "moderator",
  "profile", "settings", "geo",
]);

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = rateLimit(`username_check:${ip}`, 30, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  const handle = req.nextUrl.searchParams.get("handle")?.toLowerCase().trim() ?? "";

  if (!HANDLE_RE.test(handle)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  if (RESERVED.has(handle)) {
    return NextResponse.json({ available: false, reason: "reserved" });
  }

  const { data } = await supabase
    .from("aura_usernames")
    .select("username")
    .eq("username", handle)
    .maybeSingle();

  return NextResponse.json({ available: !data });
}
