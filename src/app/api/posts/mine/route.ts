import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token).sub;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("aura_posts")
    .select("id, media_type, media_url, thumbnail_url, caption, category, aura_score, rating_count, created_at, aspect_ratio, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const posts = (data ?? []).map((p) => {
    const ytMatch = p.media_type === "youtube"
      ? p.media_url?.match(/\/embed\/([^?/]+)/)
      : null;
    const thumbnailUrl: string = ytMatch
      ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
      : (p.thumbnail_url ?? p.media_url);
    return { ...p, thumbnailUrl };
  });

  return NextResponse.json({ posts });
}
