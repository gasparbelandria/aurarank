import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { logServerError } from "@/lib/logger";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const { ok, retryAfter } = rateLimit(`avatar:${ip}`, 5, 60_000);
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

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
  }

  const ext = EXT_MAP[file.type] ?? "jpg";
  const path = `${payload.sub}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    void logServerError("Avatar upload error", { message: uploadError.message, section: "profile" });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: dbError } = await supabase
    .from("aura_users")
    .update({ avatar_url: publicUrl })
    .eq("id", payload.sub);

  if (dbError) {
    void logServerError("Avatar DB update error", { message: dbError.message, section: "profile" });
    return NextResponse.json({ error: "Failed to save avatar" }, { status: 500 });
  }

  return NextResponse.json({ avatarUrl: publicUrl });
}
