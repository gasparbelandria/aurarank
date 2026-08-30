"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Post } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { AuraScore } from "@/components/ui/AuraScore";
import { cn } from "@/lib/cn";
import { formatAuraScore } from "@/lib/aura-utils";

interface PostCardProps {
  post: Post;
  onRate?: (post: Post) => void;
  isOwnPost?: boolean;
  className?: string;
}

export function PostCard({ post, onRate, isOwnPost = false, className }: PostCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border overflow-hidden bg-surface transition-all duration-200",
        "hover:border-brand/30 hover:shadow-[0_0_24px_rgba(139,92,246,0.08)]",
        className
      )}
    >
      {/* Media */}
      <Link href={`/@${post.author.username}/post/${post.id}`} className="block relative">
        <div className={cn(
          "relative overflow-hidden bg-elevated",
          post.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-square"
        )}>
          <Image
            src={post.mediaUrl}
            alt={post.caption}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 576px"
            unoptimized
          />
          {/* Gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Author overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Avatar user={post.author} size="xs" showRing />
            <span className="text-xs font-black text-white drop-shadow-md">
              @{post.author.username}
            </span>
          </div>

          {/* Category pill */}
          <div className="absolute top-3 right-3">
            <CategoryPill category={post.category} />
          </div>
        </div>
      </Link>

      {/* Card footer */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <AuraScore score={post.auraScore} size="md" />
          <p className="text-xs text-muted mt-0.5">
            {formatAuraScore(post.ratingCount)} ratings
          </p>
        </div>

        {isOwnPost ? (
          <span className="text-xs font-black text-muted uppercase tracking-wider px-4 py-2">
            Your post
          </span>
        ) : (
          <button
            onClick={() => onRate?.(post)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
              "bg-brand text-white hover:bg-brand-light active:scale-95",
              "shadow-[0_0_12px_rgba(139,92,246,0.3)]"
            )}
          >
            <Star size={12} strokeWidth={2.5} />
            RATE
          </button>
        )}
      </div>

      {/* Caption preview */}
      <p className="px-4 pb-3 text-xs text-muted line-clamp-1">{post.caption}</p>
    </article>
  );
}
