"use client";

import { use, useState, useEffect, useCallback } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Loader2, ImageOff, Star, PlayCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProfileCard } from "@/components/composed/ProfileCard";
import { EmptyState } from "@/components/composed/EmptyState";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";
import { formatAuraScore } from "@/lib/aura-utils";
import { ProfileBar, PublicProfileBar } from "@/components/layout/ProfileBar";
import type { User } from "@/lib/types";

interface MiniPost {
  id: string;
  mediaType: "photo" | "youtube";
  mediaUrl: string;
  thumbnailUrl: string;
  auraScore: number;
  ratingCount: number;
  aspectRatio: "1:1" | "9:16";
  caption: string;
}


export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const cleanUsername = username.startsWith("%40") ? username.slice(3) : username.replace(/^@/, "");
  const router = useRouter();

  const { user: currentUser, loading: authLoading } = useCurrentUser();
  const { t } = useI18n();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [posts, setPosts] = useState<MiniPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [hasMorePosts, setHasMorePosts] = useState(false);

  const fetchPosts = useCallback(async (username: string, offset: number) => {
    setPostsLoading(true);
    try {
      const res = await fetch(`/api/users/${username}/posts?offset=${offset}`);
      if (!res.ok) return;
      const { posts: fetched, hasMore } = await res.json();
      setPosts((prev) => offset === 0 ? fetched : [...prev, ...fetched]);
      setHasMorePosts(hasMore);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    setProfileLoading(true);
    setNotFoundFlag(false);
    setPosts([]);
    setPostsLoading(true);

    Promise.all([
      fetch(`/api/users/${cleanUsername}`).then((r) => {
        if (r.status === 404) { setNotFoundFlag(true); return null; }
        return r.json();
      }),
      fetch(`/api/follows/${cleanUsername}`).then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([userData, followData]) => {
        if (userData && !userData.error) setProfileUser(userData as User);
        if (followData) {
          setIsFollowing(followData.isFollowing ?? false);
          setFollowerCount(followData.followerCount ?? 0);
          setFollowingCount(followData.followingCount ?? 0);
        }
      })
      .catch(() => setNotFoundFlag(true))
      .finally(() => setProfileLoading(false));

    fetchPosts(cleanUsername, 0);
  }, [cleanUsername, fetchPosts]);

  const loading = profileLoading || authLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (notFoundFlag || !profileUser) return notFound();

  const isLoggedIn = !!currentUser;
  const isOwn = isLoggedIn && currentUser.username === profileUser.username;

  const handleFollowToggle = async () => {
    if (!isLoggedIn) { router.push(`/login?redirect=/@${profileUser.username}`); return; }
    if (isOwn) return;
    setFollowLoading(true);
    const method = isFollowing ? "DELETE" : "POST";
    await fetch(`/api/follows/${profileUser.username}`, { method }).catch(() => null);
    setIsFollowing((v) => !v);
    setFollowerCount((c) => c + (isFollowing ? -1 : 1));
    setFollowLoading(false);
  };

  // ── Unified content (same for public and authenticated) ───────────────────
  const profileContent = (
    <div className="max-w-2xl mx-auto">
      <div className="px-4 pt-5 pb-2">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ProfileCard
            user={profileUser}
            isOwn={isOwn}
            isFollowing={isFollowing}
            followerCount={followerCount}
            followingCount={followingCount}
            followLoading={followLoading}
            onFollowToggle={!isOwn ? handleFollowToggle : undefined}
          />
        </m.div>
      </div>

      {/* Post grid */}
      <div className="mt-5">
        <div className="border-b border-border flex mb-0 mx-4">
          <button className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-foreground border-b-2 border-brand cursor-pointer">
            {t("profile.posts")} · {formatAuraScore(posts.length)}
          </button>
        </div>

        {postsLoading ? (
          <div className="grid grid-cols-3 gap-px mt-px">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square bg-elevated animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="px-4 pt-4">
            <EmptyState
              icon={<ImageOff size={26} />}
              title={t("profile.noPostsTitle")}
              description={
                isOwn
                  ? t("profile.noPostsOwn")
                  : t("profile.noPostsOther", { username: profileUser.username })
              }
              action={
                isOwn ? (
                  <Link href="/create">
                    <button className="px-4 py-2 bg-brand text-white font-black text-xs uppercase tracking-wider rounded-lg cursor-pointer">
                      {t("profile.createPostBtn")}
                    </button>
                  </Link>
                ) : null
              }
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-px mt-px">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/@${profileUser.username}/post/${post.id}`}
                  className="relative aspect-square bg-elevated overflow-hidden group"
                >
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.caption}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 33vw, 220px"
                    unoptimized
                  />
                  {post.mediaType === "youtube" && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <PlayCircle size={16} className="text-white drop-shadow" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-1.5 text-white font-black text-sm">
                      <Star size={14} strokeWidth={2.5} fill="white" />
                      {post.auraScore > 0 ? post.auraScore.toFixed(0) : "—"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMorePosts && (
              <div className="px-4">
                <button
                  onClick={() => fetchPosts(cleanUsername, posts.length)}
                  disabled={postsLoading}
                  className="w-full mt-4 py-3 text-xs font-black uppercase tracking-wider text-muted border border-border rounded-xl hover:border-brand/40 hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                >
                  {postsLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <PublicProfileBar />
        {profileContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <BottomNav />
      <main className="md:pl-60 min-h-screen pb-24 md:pb-8">
        <ProfileBar backHref="/feed" title={`@${profileUser.username}`} />
        {profileContent}
      </main>
    </div>
  );
}
