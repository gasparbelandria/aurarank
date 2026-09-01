"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle, X, Layers, Zap, ChevronUp, ChevronDown, Star, Users, PlayCircle, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { AuraScore } from "@/components/ui/AuraScore";
import { AuraLabel } from "@/components/ui/AuraLabel";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { EmptyState } from "@/components/composed/EmptyState";
import { RatingModal } from "@/components/modals/RatingModal";
import { useRatingModal } from "@/hooks/useRatingModal";
import { useToast } from "@/hooks/useToast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/cn";
import type { Post, PostCategory } from "@/lib/types";

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;
type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

function ClaimUsernameBanner({
  displayName,
  onClaimed,
  onDismiss,
}: {
  displayName: string;
  onClaimed: () => void;
  onDismiss: () => void;
}) {
  const { t } = useI18n();
  const [handle, setHandle] = useState("");
  const [availability, setAvailability] = useState<Availability>("idle");
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!handle) { setAvailability("idle"); return; }
    if (!HANDLE_RE.test(handle)) { setAvailability("invalid"); return; }
    setAvailability("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?handle=${handle}`);
        const data = await res.json();
        setAvailability(data.available ? "available" : "taken");
      } catch {
        setAvailability("idle");
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [handle]);

  const handleClaim = useCallback(async () => {
    if (availability !== "available" || claiming) return;
    setClaiming(true);
    setError("");
    try {
      const res = await fetch("/api/username/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: handle, displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      onClaimed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setClaiming(false);
    }
  }, [availability, claiming, handle, displayName, onClaimed]);

  return (
    <div className="bg-elevated border border-brand/20 rounded-2xl p-5 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-black text-foreground">{t("claimBanner.heading")}</p>
          <p className="text-xs text-muted mt-0.5">{t("claimBanner.sub")}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted hover:text-foreground transition-colors cursor-pointer p-1 -m-1"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold text-sm select-none">@</span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder={t("claimBanner.placeholder")}
            maxLength={20}
            autoComplete="off"
            autoCapitalize="off"
            className={cn(
              "w-full pl-7 pr-8 py-2.5 rounded-xl bg-surface border text-sm font-bold text-foreground placeholder:text-muted/40 outline-none transition-all",
              availability === "available" && "border-acid/60",
              availability === "taken" && "border-danger/60",
              (availability === "idle" || availability === "invalid" || availability === "checking") && "border-border focus:border-brand"
            )}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {availability === "checking" && <Loader2 size={14} className="animate-spin text-muted" />}
            {availability === "available" && <CheckCircle2 size={14} className="text-acid" />}
            {availability === "taken" && <XCircle size={14} className="text-danger" />}
          </span>
        </div>
        <button
          onClick={handleClaim}
          disabled={availability !== "available" || claiming}
          className={cn(
            "px-4 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap cursor-pointer",
            availability === "available" && !claiming
              ? "bg-gradient-to-r from-brand-light via-brand to-acid text-background hover:brightness-110"
              : "bg-elevated border border-border text-muted cursor-not-allowed"
          )}
        >
          {claiming ? <Loader2 size={14} className="animate-spin" /> : t("claimBanner.claimBtn")}
        </button>
      </div>

      {error && <p className="text-xs text-danger font-bold mt-2">{error}</p>}
      {availability === "invalid" && handle && (
        <p className="text-xs text-muted/60 mt-2 font-bold">{t("setup.rules")}</p>
      )}
      {availability === "taken" && (
        <p className="text-xs text-danger font-bold mt-2">{t("claimBanner.takenHint")}</p>
      )}
      <button
        onClick={onDismiss}
        className="text-xs text-muted/50 hover:text-muted mt-3 block transition-colors cursor-pointer"
      >
        {t("claimBanner.skipBtn")}
      </button>
    </div>
  );
}

interface FeedSlideProps {
  post: Post;
  isOwnPost: boolean;
  isActive: boolean;
  onRate: (post: Post) => void;
}

function parseEmbedUrl(mediaUrl: string): { videoId: string; startSec: number; endSec: number } {
  try {
    const u = new URL(mediaUrl);
    const videoId = mediaUrl.match(/embed\/([^?/]+)/)?.[1] ?? "";
    const startSec = parseInt(u.searchParams.get("start") ?? "0", 10);
    const endSec = parseInt(u.searchParams.get("end") ?? "0", 10);
    return { videoId, startSec, endSec };
  } catch {
    return { videoId: "", startSec: 0, endSec: 0 };
  }
}

function FeedSlide({ post, isOwnPost, isActive, onRate }: FeedSlideProps) {
  const isYoutube = post.mediaType === "youtube";
  const bgSrc = post.thumbnailUrl ?? (isYoutube ? "" : post.mediaUrl);

  // YT player — only active for YouTube slides
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytRafRef = useRef<number>(0);
  const ytPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRafFn = useRef<() => void>(() => {});
  const [ytPlaying, setYtPlaying] = useState(false);
  const [ytMuted, setYtMuted] = useState(true);
  const [ytProgress, setYtProgress] = useState(0);
  const [ytPulse, setYtPulse] = useState<"play" | "pause" | null>(null);

  const { videoId, startSec, endSec } = isYoutube
    ? parseEmbedUrl(post.mediaUrl)
    : { videoId: "", startSec: 0, endSec: 0 };
  const clipDuration = endSec > startSec ? endSec - startSec : 0;

  useEffect(() => {
    if (!isYoutube || !isActive || !videoId || !ytContainerRef.current) return;

    const container = ytContainerRef.current;
    const div = document.createElement("div");
    container.appendChild(div);

    function startRaf() {
      cancelAnimationFrame(ytRafRef.current);
      const player = ytPlayerRef.current;
      if (!player || !clipDuration) return;
      const tick = () => {
        const t = player.getCurrentTime();
        const p = Math.min(1, Math.max(0, (t - startSec) / clipDuration));
        setYtProgress(p);
        if (t >= endSec) {
          player.pauseVideo();
          setYtPlaying(false);
          setYtProgress(1);
          return;
        }
        ytRafRef.current = requestAnimationFrame(tick);
      };
      ytRafRef.current = requestAnimationFrame(tick);
    }
    startRafFn.current = startRaf;

    function initPlayer() {
      if (!window.YT?.Player) return;
      new window.YT.Player(div, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          start: startSec,
          ...(endSec > startSec ? { end: endSec } : {}),
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0,
          playsinline: 1,
          disablekb: 1,
        },
        events: {
          onReady: (e) => {
            ytPlayerRef.current = e.target;
            e.target.seekTo(startSec, true);
            e.target.playVideo();
            setYtPlaying(true);
            setYtProgress(0);
            startRaf();
          },
          onStateChange: (e) => {
            if (window.YT?.PlayerState) {
              setYtPlaying(e.data === window.YT.PlayerState.PLAYING);
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); initPlayer(); };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    return () => {
      cancelAnimationFrame(ytRafRef.current);
      if (ytPulseTimerRef.current) { clearTimeout(ytPulseTimerRef.current); ytPulseTimerRef.current = null; }
      try { ytPlayerRef.current?.destroy(); } catch { /* ignore */ }
      ytPlayerRef.current = null;
      div.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYoutube, isActive, videoId, startSec, endSec]);

  const handleYtTap = () => {
    const player = ytPlayerRef.current;
    if (!player) return;
    if (ytPlaying) {
      player.pauseVideo();
      setYtPulse("pause");
    } else {
      if (ytProgress >= 1 && clipDuration > 0) {
        player.seekTo(startSec, true);
        setYtProgress(0);
      }
      player.playVideo();
      startRafFn.current();
      setYtPulse("play");
    }
    if (ytPulseTimerRef.current) clearTimeout(ytPulseTimerRef.current);
    ytPulseTimerRef.current = setTimeout(() => setYtPulse(null), 600);
  };

  const handleYtMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const player = ytPlayerRef.current;
    if (!player) return;
    if (ytMuted) { player.unMute(); setYtMuted(false); }
    else { player.mute(); setYtMuted(true); }
  };

  return (
    <div className="relative w-full max-w-[400px] h-[calc(100%-48px)] rounded-2xl overflow-hidden bg-black flex-shrink-0 flex flex-col justify-center">
      {/* Ambient blurred background */}
      {bgSrc && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={bgSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl pointer-events-none"
        />
      )}

      {/* Main content */}
      {isYoutube ? (
        isActive ? (
          <div className={cn("relative z-10 w-full", post.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video")}>
            <div
              ref={ytContainerRef}
              className="absolute inset-0 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:w-full [&_iframe]:h-full"
            />
          </div>
        ) : (
          <Link href={`/@${post.author.username}/post/${post.id}`} prefetch={false} className="relative z-10">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.thumbnailUrl}
                alt={post.caption}
                style={{ display: "block", width: "100%", maxWidth: "none" }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <PlayCircle size={36} className="text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          </Link>
        )
      ) : (
        <Link href={`/@${post.author.username}/post/${post.id}`} prefetch={false} className="relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.mediaUrl}
            alt={post.caption}
            style={{ display: "block", width: "100%", maxWidth: "none" }}
          />
        </Link>
      )}

      {/* Gradient scrim — top */}
      <div
        className="absolute top-0 left-0 right-0 h-[60px] z-20 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)" }}
      />
      {/* Gradient scrim — bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[56px] z-20 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)" }}
      />

      {/* Top: author + category */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30">
        <Link href={`/@${post.author.username}`} className="flex items-center gap-2">
          <Avatar user={post.author} size="xs" showRing />
          <span className="text-xs font-black text-white drop-shadow-md">@{post.author.username}</span>
        </Link>
        <CategoryPill category={post.category} />
      </div>

      {/* Bottom: aura + caption + rate */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 z-30">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <AuraScore score={post.auraScore} size="sm" className="items-start" />
            <AuraLabel score={post.auraScore} ratingCount={post.ratingCount} />
          </div>
          <p className="text-xs text-white/80 mt-1 line-clamp-2 leading-snug">{post.caption}</p>
        </div>
        {isOwnPost ? (
          <span className="text-xs font-black text-white/60 uppercase tracking-wider px-3 py-2 flex-shrink-0">
            Your post
          </span>
        ) : (
          <button
            onClick={() => onRate(post)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider bg-brand text-white hover:bg-brand-light active:scale-95 shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all cursor-pointer flex-shrink-0"
          >
            <Star size={12} strokeWidth={2.5} />
            RATE
          </button>
        )}
      </div>

      {/* YT: tap-to-play/pause overlay (z-20, below UI buttons) */}
      {isYoutube && isActive && (
        <div className="absolute inset-0 z-20 cursor-pointer" onClick={handleYtTap} />
      )}

      {/* YT: pulse icon feedback */}
      {isYoutube && isActive && ytPulse && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            {ytPulse === "pause"
              ? <Pause size={22} className="text-white" />
              : <Play size={22} className="text-white ml-0.5" />
            }
          </div>
        </div>
      )}

      {/* YT: mute toggle (z-30, above tap overlay) */}
      {isYoutube && isActive && (
        <button
          onClick={handleYtMute}
          className="absolute bottom-16 right-3 z-30 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          {ytMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
        </button>
      )}

      {/* YT: clip progress bar */}
      {isYoutube && isActive && clipDuration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 z-30 bg-white/10">
          <div className="h-full bg-brand" style={{ width: `${ytProgress * 100}%` }} />
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  useAuthGuard();
  const { t } = useI18n();
  const { user, refresh } = useCurrentUser();
  const [activeCategory] = useState<PostCategory | null>(null);
  const [feedMode, setFeedMode] = useState<"forYou" | "following">("forYou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fetchingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const modal = useRatingModal();
  const { addToast } = useToast();

  const showClaimBanner = !!user && !user.username && !bannerDismissed;

  const fetchPosts = useCallback(async (category: PostCategory | null, offset: number, mode: "forYou" | "following") => {
    const params = new URLSearchParams({ offset: String(offset) });
    if (category) params.set("category", category);
    if (mode === "following") params.set("following", "1");
    const res = await fetch(`/api/posts?${params}`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json() as Promise<{ posts: Post[]; hasMore: boolean }>;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPosts([]);
    setHasMore(true);
    setCurrentIndex(0);
    fetchingRef.current = false;
    fetchPosts(activeCategory, 0, feedMode)
      .then(({ posts: p, hasMore: more }) => {
        if (cancelled) return;
        setPosts(p);
        setHasMore(more);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeCategory, feedMode, fetchPosts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || fetchingRef.current) return;
    fetchingRef.current = true;
    setLoadingMore(true);
    try {
      const { posts: more, hasMore: moreExists } = await fetchPosts(activeCategory, posts.length, feedMode);
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((p) => !seen.has(p.id))];
      });
      setHasMore(moreExists);
    } finally {
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [activeCategory, feedMode, fetchPosts, hasMore, loadingMore, posts.length]);

  // Track current slide index via scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      if (!el.clientHeight) return;
      setCurrentIndex(Math.round(el.scrollTop / el.clientHeight));
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Trigger load-more when approaching the last slide.
  // Skip while the initial fetch is running — both would hit offset=0 otherwise.
  useEffect(() => {
    if (loading) return;
    const bannerOffset = showClaimBanner ? 1 : 0;
    const postIndex = currentIndex - bannerOffset;
    if (postIndex >= posts.length - 2 && hasMore && !fetchingRef.current && !loadingMore) {
      loadMore();
    }
  }, [loading, currentIndex, posts.length, hasMore, loadMore, loadingMore, showClaimBanner]);

  const goPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: -el.clientHeight, behavior: "smooth" });
  }, []);

  const goNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: el.clientHeight, behavior: "smooth" });
  }, []);

  const handleRate = (post: Post) => {
    modal.openModal(post.id, post.caption, post.mediaUrl, post.author.username);
  };

  const handleRated = (score: number, newAuraScore: number | null, newRatingCount: number | null) => {
    addToast(t("feed.toastRated", { score }), "success");
    if (newAuraScore !== null) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === modal.postId
            ? { ...p, auraScore: newAuraScore, ratingCount: newRatingCount ?? p.ratingCount + 1 }
            : p
        )
      );
    }
  };

  const handleClaimed = useCallback(async () => {
    await refresh();
    setBannerDismissed(true);
  }, [refresh]);

  const totalSlides =
    posts.length +
    (showClaimBanner ? 1 : 0) +
    (!loading && !hasMore && posts.length > 0 ? 1 : 0);

  return (
    <div className="bg-background h-screen overflow-hidden">
      <Sidebar />
      <BottomNav />

      <main className="md:pl-60 h-screen overflow-hidden flex flex-col pb-[60px] md:pb-0">
        <TopBar showLogo />

        {/* Feed mode tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          <button
            onClick={() => setFeedMode("forYou")}
            className={cn(
              "flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer",
              feedMode === "forYou"
                ? "text-foreground border-b-2 border-brand -mb-px"
                : "text-muted hover:text-foreground"
            )}
          >
            {t("nav.feed")}
          </button>
          <button
            onClick={() => setFeedMode("following")}
            className={cn(
              "flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer",
              feedMode === "following"
                ? "text-foreground border-b-2 border-brand -mb-px"
                : "text-muted hover:text-foreground"
            )}
          >
            {t("follows.followingTab")}
          </button>
        </div>

        {/* Snap scroll container */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-scroll snap-y snap-mandatory feed-scroll"
        >
          {/* Claim banner slide */}
          {showClaimBanner && (
            <div className="h-full snap-start flex items-center justify-center px-4">
              <div className="w-full max-w-md">
                <ClaimUsernameBanner
                  displayName={user.displayName}
                  onClaimed={handleClaimed}
                  onDismiss={() => setBannerDismissed(true)}
                />
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="h-full snap-start flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-muted" />
            </div>
          )}

          {/* Empty */}
          {!loading && posts.length === 0 && (
            <div className="h-full snap-start flex items-center justify-center px-4">
              <EmptyState
                icon={feedMode === "following" ? <Users size={26} /> : <Layers size={26} />}
                title={feedMode === "following" ? t("feed.followingEmptyTitle") : t("feed.emptyNoPostsTitle")}
                description={feedMode === "following" ? t("feed.followingEmptyDesc") : t("feed.emptyNoPostsDesc")}
                action={feedMode === "following" ? (
                  <Link
                    href="/rankings"
                    className="inline-block px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-black uppercase tracking-wider hover:bg-brand-light transition-colors cursor-pointer"
                  >
                    {t("feed.followingExploreCta")}
                  </Link>
                ) : undefined}
              />
            </div>
          )}

          {/* Post slides */}
          {posts.map((post, idx) => {
            const slideIndex = idx + (showClaimBanner ? 1 : 0);
            return (
              <div
                key={post.id}
                className="h-full snap-start flex items-center justify-center"
              >
                <FeedSlide
                  post={post}
                  isOwnPost={!!user && post.authorId === user.id}
                  isActive={currentIndex === slideIndex}
                  onRate={handleRate}
                />
              </div>
            );
          })}

          {/* Load more indicator */}
          {loadingMore && (
            <div className="h-full snap-start flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-muted" />
            </div>
          )}

          {/* All caught up */}
          {!loading && !hasMore && posts.length > 0 && (
            <div className="h-full snap-start flex items-center justify-center px-4">
              <EmptyState
                icon={<Zap size={26} />}
                title={t("feed.caughtUpTitle")}
                description={t("feed.caughtUpDesc")}
              />
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {!loading && posts.length > 0 && (
          <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="w-11 h-11 rounded-full bg-elevated/90 backdrop-blur-sm border border-border flex items-center justify-center hover:border-brand/50 hover:text-brand-light transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronUp size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex >= totalSlides - 1}
              className="w-11 h-11 rounded-full bg-elevated/90 backdrop-blur-sm border border-border flex items-center justify-center hover:border-brand/50 hover:text-brand-light transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronDown size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </main>

      <RatingModal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        postId={modal.postId}
        postCaption={modal.postCaption}
        postThumbnail={modal.postThumbnail}
        authorUsername={modal.authorUsername}
        onRated={handleRated}
      />
    </div>
  );
}
