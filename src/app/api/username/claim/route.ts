import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { verifyToken, signToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { logServerError } from "@/lib/logger";

const RESERVED = new Set([
  "admin", "api", "feed", "rankings", "create", "setup", "login", "signup",
  "logout", "me", "about", "support", "help", "terms", "privacy", "aurarank",
  "aura", "rank", "null", "undefined", "root", "system", "mod", "moderator",
  "profile", "settings", "geo",
]);

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores"),
  displayName: z.string().min(1).max(50).trim().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = rateLimit(`username_claim:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  // Verify JWT from cookie
  const token = req.cookies.get("ar_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { username, displayName: providedDisplayName } = parsed.data;
  const handle = username.toLowerCase();

  if (RESERVED.has(handle)) {
    return NextResponse.json({ error: "Username not available" }, { status: 409 });
  }

  // Check user doesn't already have a username
  const { data: existing } = await supabase
    .from("aura_usernames")
    .select("username")
    .eq("user_id", payload.sub)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Username already claimed" }, { status: 409 });
  }

  // If displayName not provided, fall back to the user's Google display name
  let displayName = providedDisplayName;
  if (!displayName) {
    const { data: userRow } = await supabase
      .from("aura_users")
      .select("display_name")
      .eq("id", payload.sub)
      .single();
    displayName = userRow?.display_name ?? "Anon";
  }

  const { error } = await supabase.from("aura_usernames").insert({
    username: handle,
    user_id: payload.sub,
    display_name: displayName,
  });

  if (error) {
    if (error.code === "23505") {
      // unique violation — someone claimed it between check and insert
      return NextResponse.json({ error: "Username taken" }, { status: 409 });
    }
    void logServerError("aura_usernames insert error", { message: error.message, section: "auth" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // Reissue JWT with username included
  const newToken = signToken({
    sub: payload.sub,
    username: handle,
    role: payload.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("ar_token", newToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ username: handle, displayName });
}
