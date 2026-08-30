import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logServerError } from "@/lib/logger";

const PAGE_SIZE = 18;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const clean = username.replace(/^@/, "").toLowerCase();

  const offset = Math.max(0, parseInt(new URL(req.url).searchParams.get("offset") ?? "0", 10));

  const { data, error } = await supabase
    .from("aura_posts")
    .select("id, media_type, media_url, thumbnail_url, aura_score, rating_count, aspect_ratio, caption")
    .eq("username", clean)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    void logServerError("User posts fetch error", { message: error.message, section: "profile" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const posts = (data ?? []).map((p) => {
    // For YouTube posts always use CDN thumbnail — stored captures may contain error screens
    // from videos that block embedding. CDN thumbnails work for any public video.
    const ytMatch = p.media_type === "youtube"
      ? p.media_url?.match(/\/embed\/([^?/]+)/)
      : null;
    const thumbnailUrl: string = ytMatch
      ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
      : (p.thumbnail_url ?? p.media_url);

    return {
      id: p.id,
      mediaType: p.media_type as "photo" | "youtube",
      mediaUrl: p.media_url,
      thumbnailUrl,
      auraScore: Number(p.aura_score),
      ratingCount: p.rating_count,
      aspectRatio: (p.aspect_ratio as "1:1" | "9:16" | null) ?? "1:1",
      caption: p.caption ?? "",
    };
  });

  return NextResponse.json({ posts, hasMore: posts.length === PAGE_SIZE });
}
