import Image from "next/image";
import type { User, Post } from "@/lib/types";
import { AuraScore } from "@/components/ui/AuraScore";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Avatar } from "@/components/ui/Avatar";
import { getTierPercent } from "@/lib/aura-utils";

interface ShareCardProps {
  user: User;
  post?: Post;
}

export function ShareCard({ user, post }: ShareCardProps) {
  const tier = getTierPercent(user.globalRank);

  return (
    <div className="relative w-full max-w-xs rounded-2xl border border-border overflow-hidden bg-surface shadow-2xl">
      {/* Header gradient bar */}
      <div className="h-1 aura-gradient" />

      {/* Content */}
      <div className="p-5">
        {/* Brand */}
        <div className="flex items-baseline gap-0.5 mb-4">
          <span className="text-xs font-black text-brand">AURA</span>
          <span className="text-xs font-black text-acid">RANK</span>
          <span className="text-xs text-muted ml-1">.me</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar user={user} size="md" showRing />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-foreground text-sm">@{user.username}</span>
              <LevelBadge level={user.level} />
            </div>
            <span className="text-xs font-black text-brand-light">{tier}</span>
          </div>
        </div>

        {/* Aura Score */}
        <AuraScore score={user.auraScore} size="lg" showLabel className="mb-4" />

        {/* Post thumbnail if provided */}
        {post && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
            <Image
              src={post.mediaUrl}
              alt={post.caption}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* CTA */}
        <p className="text-xs font-black text-muted uppercase tracking-wider">
          Rate my aura →
        </p>
        <p className="text-xs text-muted/60 mt-0.5">aurarank.me/@{user.username}</p>
      </div>
    </div>
  );
}
