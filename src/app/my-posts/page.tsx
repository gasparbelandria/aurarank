"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, Trash2, Eye, Images, Star, PlayCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/composed/EmptyState";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useToast } from "@/hooks/useToast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/cn";

interface MyPost {
  id: string;
  media_type: string;
  media_url: string;
  thumbnailUrl: string;
  caption: string;
  category: string | null;
  aura_score: number;
  rating_count: number;
  created_at: string;
  aspect_ratio: string | null;
  status: string;
}

function PostCard({ post, onDelete }: { post: MyPost; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { user } = useCurrentUser();

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) onDelete(post.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const createdAt = new Date(post.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="flex gap-3 p-3 bg-elevated rounded-xl border border-border hover:border-border/80 transition-colors">
      {/* Thumbnail */}
      <Link
        href={user?.username ? `/@${user.username}/post/${post.id}` : "#"}
        className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-surface"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.thumbnailUrl}
          alt={post.caption}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {post.media_type === "youtube" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <PlayCircle size={20} className="text-white drop-shadow" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground line-clamp-1">{post.caption}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-muted font-bold">
            <Star size={10} strokeWidth={2} />
            {Number(post.aura_score).toFixed(1)}
          </span>
          <span className="text-xs text-muted/60">{post.rating_count} ratings</span>
          {post.category && (
            <span className="text-xs text-brand-light font-bold uppercase tracking-wide">{post.category}</span>
          )}
        </div>
        <p className="text-[10px] text-muted/50 mt-1">{createdAt}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href={user?.username ? `/@${user.username}/post/${post.id}` : "#"}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          title="View post"
        >
          <Eye size={15} />
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={cn(
            "flex items-center gap-1.5 px-2 py-2 rounded-lg transition-all cursor-pointer text-xs font-black",
            confirmDelete
              ? "bg-danger/10 text-danger hover:bg-danger/20"
              : "text-muted hover:text-danger hover:bg-danger/10"
          )}
          title="Delete post"
        >
          {deleting
            ? <Loader2 size={15} className="animate-spin" />
            : <Trash2 size={15} />}
          {confirmDelete && !deleting && (
            <span className="uppercase tracking-wide whitespace-nowrap">click again</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function MyPostsPage() {
  useAuthGuard();
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts/mine");
      if (!res.ok) throw new Error();
      const { posts: p } = await res.json();
      setPosts(p);
    } catch {
      addToast("Failed to load posts", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    addToast("Post deleted", "success");
  }, [addToast]);

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <BottomNav />

      <main className="md:pl-60">
        <TopBar title="My Posts" />

        <div className="max-w-2xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={24} className="animate-spin text-muted" />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<Images size={28} />}
              title="No posts yet"
              description="Create your first post and start building your aura."
              action={
                <Link
                  href="/create"
                  className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-black uppercase tracking-wider hover:bg-brand-light transition-colors"
                >
                  Create post
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted font-bold uppercase tracking-wider mb-4">
                {posts.length} post{posts.length !== 1 ? "s" : ""}
              </p>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
