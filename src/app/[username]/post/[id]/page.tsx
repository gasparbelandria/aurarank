"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Share2, Flag, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProfileBar } from "@/components/layout/ProfileBar";
import { PublicProfileBar } from "@/components/layout/ProfileBar";
import { ProfileCard } from "@/components/composed/ProfileCard";
import { AuraScore } from "@/components/ui/AuraScore";
import { AuraLabel } from "@/components/ui/AuraLabel";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { RatingModal } from "@/components/modals/RatingModal";
import { useRatingModal } from "@/hooks/useRatingModal";
import { useToast } from "@/hooks/useToast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Post, User } from "@/lib/types";

export default function PostPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username: usernameParam, id } = use(params);
  const cleanUsername = usernameParam.startsWith("%40")
    ? usernameParam.slice(3)
    : usernameParam.replace(/^@/, "");
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const modal = useRatingModal();
  const { addToast } = useToast();
  const { user, loading: authLoading } = useCurrentUser();

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${id}`).then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      }),
      fetch(`/api/users/${cleanUsername}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/follows/${cleanUsername}`).then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([postData, userData, followData]) => {
        if (postData?.post) setPost(postData.post);
        if (userData && !userData.error) setProfileUser(userData as User);
        if (followData) {
          setIsFollowing(followData.isFollowing ?? false);
          setFollowerCount(followData.followerCount ?? 0);
          setFollowingCount(followData.followingCount ?? 0);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setDataLoading(false));
  }, [id, cleanUsername]);

  const handleRate = () => {
    if (!user) { router.push(`/login?redirect=/@${cleanUsername}/post/${id}`); return; }
    if (!post) return;
    modal.openModal(post.id, post.caption, post.mediaUrl, post.author.username);
  };

  const handleRated = (score: number, newAuraScore: number | null, newRatingCount: number | null) => {
    addToast(`+${score} AURA rated!`, "success");
    if (post) setPost({
      ...post,
      auraScore: newAuraScore ?? post.auraScore,
      ratingCount: newRatingCount ?? post.ratingCount + 1,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `@${cleanUsername}'s post`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast("Link copied to clipboard", "info");
    }
  };

  const handleReport = () => {
    addToast("Report submitted. We'll review it shortly.", "info");
  };

  const handleFollowToggle = async () => {
    if (!user) { router.push(`/login?redirect=/@${cleanUsername}/post/${id}`); return; }
    setFollowLoading(true);
    const method = isFollowing ? "DELETE" : "POST";
    await fetch(`/api/follows/${cleanUsername}`, { method }).catch(() => null);
    setIsFollowing((v) => !v);
    setFollowerCount((c) => c + (isFollowing ? -1 : 1));
    setFollowLoading(false);
  };

  const loading = dataLoading || authLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted font-bold text-sm uppercase tracking-widest">Post not found</p>
        <Link href="/feed" className="text-brand-light text-sm font-bold hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  const isLoggedIn = !!user;
  const isOwnPost = isLoggedIn && post.authorId === user.id;

  const postContent = (
    <div className="flex flex-col items-center px-4 pt-4 gap-4 md:pt-10">

      {/* Author ProfileCard */}
      {profileUser && (
        <div className="w-full max-w-[400px]">
          <ProfileCard
            user={profileUser}
            isOwn={isOwnPost}
            backHref={`/@${cleanUsername}`}
            isFollowing={isFollowing}
            followerCount={followerCount}
            followingCount={followingCount}
            followLoading={followLoading}
            onFollowToggle={!isOwnPost ? handleFollowToggle : undefined}
          />
        </div>
      )}

      {/* Post card */}
      <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden bg-black flex-shrink-0 flex flex-col justify-center">
        {/* Ambient blurred background — skip for YouTube (player covers everything) */}
        {post.mediaType !== "youtube" && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={post.thumbnailUrl ?? post.mediaUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl pointer-events-none"
          />
        )}

        {/* Main content */}
        {post.mediaType === "youtube" ? (
          <div
            className={cn(
              "relative z-10 w-full",
              post.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"
            )}
          >
            <iframe
              src={`${post.mediaUrl}&autoplay=1&playsinline=1`}
              title={post.caption}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <Link href="#" onClick={(e) => e.preventDefault()} className="relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.mediaUrl}
              alt={post.caption}
              style={{ display: "block", width: "100%", maxWidth: "none" }}
            />
          </Link>
        )}

        {/* Category — top right (always visible) */}
        <div className="absolute top-3 right-3 z-30">
          <CategoryPill category={post.category} />
        </div>

        {/* Gradient + score/rate overlay — only for photo posts */}
        {post.mediaType !== "youtube" && (
          <>
            <div
              className="absolute bottom-0 left-0 right-0 h-[56px] z-20 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)" }}
            />
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
                  onClick={handleRate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider bg-brand text-white hover:bg-brand-light active:scale-95 shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all cursor-pointer flex-shrink-0"
                >
                  <Star size={12} strokeWidth={2.5} />
                  RATE
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Score + rate bar — below the card for YouTube posts */}
      {post.mediaType === "youtube" && (
        <div className="w-full max-w-[400px] flex items-center justify-between px-1 -mt-1">
          <div>
            <div className="flex items-center gap-2">
              <AuraScore score={post.auraScore} size="sm" className="items-start" />
              <AuraLabel score={post.auraScore} ratingCount={post.ratingCount} />
            </div>
            <p className="text-xs text-muted mt-0.5 line-clamp-1">{post.caption}</p>
          </div>
          {isOwnPost ? (
            <span className="text-xs font-black text-muted/60 uppercase tracking-wider px-3 py-2 flex-shrink-0">
              Your post
            </span>
          ) : (
            <button
              onClick={handleRate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider bg-brand text-white hover:bg-brand-light active:scale-95 shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all cursor-pointer flex-shrink-0"
            >
              <Star size={12} strokeWidth={2.5} />
              RATE
            </button>
          )}
        </div>
      )}

      {/* Secondary actions */}
      <div className="w-full max-w-[400px] flex items-center justify-between pb-4">
        <p className="text-xs text-muted">
          {new Date(post.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          {" · "}
          {post.ratingCount} ratings
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black text-muted hover:text-foreground hover:bg-elevated border border-border transition-colors cursor-pointer uppercase tracking-wide"
          >
            <Share2 size={13} />
            Share
          </button>
          {!isOwnPost && (
            <button
              onClick={handleReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black text-muted hover:text-danger hover:bg-danger/10 border border-border transition-colors cursor-pointer uppercase tracking-wide"
            >
              <Flag size={13} />
              Report
            </button>
          )}
        </div>
      </div>

    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <PublicProfileBar />
        {postContent}
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

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <BottomNav />
      <main className="md:pl-60 pb-24 md:pb-8">
        {postContent}
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
