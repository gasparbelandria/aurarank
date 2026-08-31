import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { logServerError } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/email";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";

const schema = z.object({
  accessToken: z.string().min(1),
  lang: z.enum(["en", "es"]).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = rateLimit(`auth:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { accessToken, lang: bodyLang } = parsed.data;
  // Detect language: from body → Accept-Language header → default en
  const acceptLang = req.headers.get("accept-language") ?? "";
  const browserLang = acceptLang.split(",")[0]?.split(";")[0]?.trim().slice(0, 2).toLowerCase();
  const lang: "en" | "es" = bodyLang ?? (browserLang === "es" ? "es" : "en");

  // Validate token with Google and get user info
  const [tokenInfo, userInfo] = await Promise.all([
    fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`).then((r) => r.json()),
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((r) => r.json()),
  ]);

  // Validate audience to prevent token substitution attacks
  if (tokenInfo.aud !== GOOGLE_CLIENT_ID || tokenInfo.error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const providerUserId = userInfo.sub;
  const email = userInfo.email;
  const displayName = userInfo.name ?? null;
  const avatarUrl = userInfo.picture ?? null;

  if (!providerUserId || !email) {
    return NextResponse.json({ error: "Could not retrieve user info" }, { status: 400 });
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("aura_users")
    .select("id, role")
    .eq("provider", "google")
    .eq("provider_user_id", providerUserId)
    .maybeSingle();

  let user: { id: string; role: string } | null = null;

  if (existingUser) {
    // Returning user — update profile fields but never overwrite avatar_url
    // (user may have uploaded a custom photo)
    const { data, error } = await supabase
      .from("aura_users")
      .update({ email, display_name: displayName, active: true })
      .eq("id", existingUser.id)
      .select("id, role")
      .single();
    if (error || !data) {
      void logServerError("aura_users update error", { message: error?.message, section: "auth" });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    user = data;
  } else {
    // New user — seed with Google photo as initial avatar
    const { data, error } = await supabase
      .from("aura_users")
      .insert({
        provider: "google",
        provider_user_id: providerUserId,
        email,
        display_name: displayName,
        avatar_url: avatarUrl,
        active: true,
      })
      .select("id, role")
      .single();
    if (error || !data) {
      void logServerError("aura_users insert error", { message: error?.message, section: "auth" });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    user = data;
    // Fire-and-forget welcome email — never blocks auth response
    void sendWelcomeEmail({ to: email, displayName: displayName ?? "there", lang });
  }

  // Fire-and-forget last_seen_at update (never blocks response)
  void supabase
    .from("aura_users")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  // Check if user already has a username
  const { data: usernameRow } = await supabase
    .from("aura_usernames")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  const username = usernameRow?.username ?? null;
  const isNewUser = !username;

  const token = signToken({
    sub: user.id,
    username,
    role: (user.role as "user" | "admin") ?? "user",
  });

  const cookieStore = await cookies();
  cookieStore.set("ar_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ isNewUser, username });
}
