import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { getLevel } from "@/lib/aura-utils";
import { captureYoutubeFrame } from "@/lib/capture-frame";
import { logServerError } from "@/lib/logger";
import type { Post, PostCategory } from "@/lib/types";

const PAGE_SIZE = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

function youtubeThumbnail(mediaUrl: string): string | undefined {
  const match = mediaUrl.match(/youtube\.com\/embed\/([^?/]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(p: any): Post {
  const un = Array.isArray(p.aura_usernames) ? p.aura_usernames[0] : p.aura_usernames;
  const u = Array.isArray(p.aura_users) ? p.aura_users[0] : p.aura_users;
  // Prefer the stored captured frame; fall back to YouTube CDN thumbnail
  const thumbnailUrl: string | undefined =
    p.thumbnail_url ??
    (p.media_type === "youtube" ? youtubeThumbnail(p.media_url ?? "") : undefined);
  return {
    id: p.id,
    authorId: p.user_id,
    author: {
      id: p.user_id,
      username: p.username,
      displayName: un?.display_name ?? p.username,
      avatarUrl: u?.avatar_url ?? null,
      level: getLevel(0),
      bio: "",
      auraScore: 0,
      globalRank: 0,
      weeklyRank: 0,
      badges: [],
      postCount: 0,
      ratingCount: 0,
      joinedAt: "",
    },
    mediaType: p.media_type as Post["mediaType"],
    mediaUrl: p.media_url,
    thumbnailUrl,
    caption: p.caption ?? "",
    category: p.category as PostCategory,
    auraScore: Number(p.aura_score),
    ratingCount: p.rating_count,
    createdAt: p.created_at,
    aspectRatio: (p.aspect_ratio as "1:1" | "9:16" | null) ?? "1:1",
  };
}

async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ar_token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token).sub;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
  const followingOnly = searchParams.get("following") === "1";

  if (followingOnly) {
    const { data: followRows } = await supabase
      .from("aura_follows")
      .select("following_id")
      .eq("follower_id", userId);

    const followingIds = (followRows ?? []).map((r) => r.following_id);

    if (followingIds.length === 0) {
      return NextResponse.json({ posts: [], hasMore: false });
    }

    let query = supabase
      .from("aura_posts")
      .select(`
        id, user_id, username, media_type, media_url, thumbnail_url, caption, category,
        aura_score, rating_count, created_at, aspect_ratio,
        aura_usernames!username(display_name),
        aura_users!user_id(avatar_url)
      `)
      .eq("status", "published")
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (category) query = query.eq("category", category);

    const { data, error } = await query;

    if (error) {
      void logServerError("Feed fetch error (following)", { message: error.message, section: "feed" });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const posts: Post[] = (data ?? []).map(mapPost);
    return NextResponse.json({ posts, hasMore: posts.length === PAGE_SIZE });
  }

  let query = supabase
    .from("aura_posts")
    .select(`
      id, user_id, username, media_type, media_url, caption, category,
      aura_score, rating_count, created_at, aspect_ratio,
      aura_usernames!username(display_name),
      aura_users!user_id(avatar_url)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) {
    void logServerError("Feed fetch error", { message: error.message, section: "feed" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const posts: Post[] = (data ?? []).map(mapPost);
  return NextResponse.json({ posts, hasMore: posts.length === PAGE_SIZE });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const { ok } = rateLimit(`posts:create:${ip}`, 10, 60_000);
  if (!ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: usernameRow } = await supabase
    .from("aura_usernames")
    .select("username")
    .eq("user_id", userId)
    .maybeSingle();

  if (!usernameRow) {
    return NextResponse.json({ error: "Claim a username before posting" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const caption = ((formData.get("caption") as string | null) ?? "").trim();
  const category = (formData.get("category") as string | null) ?? null;
  const aspectRatio = (formData.get("aspectRatio") as string | null) ?? "1:1";
  const mediaType = (formData.get("mediaType") as string | null) ?? null;

  // ── YouTube post (no file upload) ──────────────────────────────────────────
  if (mediaType === "youtube") {
    const mediaUrl = (formData.get("mediaUrl") as string | null) ?? null;
    if (!caption) return NextResponse.json({ error: "Caption required" }, { status: 400 });
    if (!mediaUrl) return NextResponse.json({ error: "Media URL required" }, { status: 400 });

    // Parse videoId + startSec from embed URL: .../embed/VIDEO_ID?start=X&end=Y
    const videoIdMatch = mediaUrl.match(/embed\/([^?/]+)/);
    const videoId = videoIdMatch?.[1] ?? "";
    const startSec = parseInt(new URL(mediaUrl).searchParams.get("start") ?? "0", 10);
    const ytAspectRatio = (aspectRatio === "9:16" ? "9:16" : "16:9") as "9:16" | "16:9";

    // Insert post first (without thumbnail — we add it below)
    const { data: post, error: insertError } = await supabase
      .from("aura_posts")
      .insert({
        user_id: userId,
        username: usernameRow.username,
        media_type: "youtube",
        media_url: mediaUrl,
        caption,
        category,
        aspect_ratio: aspectRatio,
      })
      .select("id")
      .single();

    if (insertError || !post) {
      void logServerError("YouTube post insert error", { message: insertError?.message, section: "create" });
      return NextResponse.json({ error: `DB error: ${insertError?.message}` }, { status: 500 });
    }

    // Capture frame at startSec (max 12s; graceful fallback if it fails)
    if (videoId) {
      const frameBuffer = await Promise.race([
        captureYoutubeFrame(videoId, startSec, ytAspectRatio),
        new Promise<null>(r => setTimeout(() => r(null), 12_000)),
      ]);

      if (frameBuffer) {
        const thumbPath = `thumbnails/${userId}/${post.id}.jpg`;
        const { error: thumbErr } = await supabase.storage
          .from("post-media")
          .upload(thumbPath, frameBuffer, { contentType: "image/jpeg" });

        if (!thumbErr) {
          const { data: { publicUrl } } = supabase.storage.from("post-media").getPublicUrl(thumbPath);
          await supabase.from("aura_posts").update({ thumbnail_url: publicUrl }).eq("id", post.id);
        } else {
          void logServerError("Thumbnail upload error", { message: thumbErr.message, section: "create", priority: "low" });
        }
      }
    }

    return NextResponse.json({ id: post.id }, { status: 201 });
  }

  const file = formData.get("file");

  if (!caption) return NextResponse.json({ error: "Caption required" }, { status: 400 });
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  // Ensure the bucket exists (creates it on first use)
  const { error: bucketError } = await supabase.storage.createBucket("post-media", {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (bucketError && bucketError.message !== "The resource already exists") {
    void logServerError("Bucket create error", { message: bucketError.message, section: "create" });
    return NextResponse.json({ error: `Bucket error: ${bucketError.message}` }, { status: 500 });
  }

  const { error: uploadError } = await supabase.storage
    .from("post-media")
    .upload(path, bytes, { contentType: file.type });

  if (uploadError) {
    void logServerError("Post upload error", { message: uploadError.message, section: "create" });
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from("post-media").getPublicUrl(path);

  const { data: post, error: insertError } = await supabase
    .from("aura_posts")
    .insert({
      user_id: userId,
      username: usernameRow.username,
      media_type: "photo",
      media_url: publicUrl,
      caption,
      category,
      aspect_ratio: aspectRatio,
    })
    .select("id")
    .single();

  if (insertError || !post) {
    void logServerError("Post insert error", { message: insertError?.message, section: "create" });
    return NextResponse.json({ error: `DB error: ${insertError?.message}` }, { status: 500 });
  }

  return NextResponse.json({ id: post.id }, { status: 201 });
}
