import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

const UpdateSchema = z.object({
  bio: z.string().max(160).optional(),
  countryCode: z.string().regex(/^[A-Z]{2}$/).optional().nullable(),
  countryName: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  town: z.string().max(100).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("aura_profiles")
    .select("bio, country_code, country_name, city, town")
    .eq("user_id", payload.sub)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });

  return NextResponse.json(data ?? {});
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const { ok, retryAfter } = rateLimit(`profile-update:${ip}`, 10, 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = UpdateSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { error } = await supabase.from("aura_profiles").upsert(
    {
      user_id: payload.sub,
      bio: body.bio ?? null,
      country_code: body.countryCode ?? null,
      country_name: body.countryName ?? null,
      city: body.city ?? null,
      town: body.town ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
