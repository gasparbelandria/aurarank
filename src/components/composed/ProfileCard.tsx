"use client";

import Link from "next/link";
import { Share2, MapPin, ChevronLeft } from "lucide-react";
import type { User } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { AuraScore } from "@/components/ui/AuraScore";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatAuraScore } from "@/lib/aura-utils";
import { AURA_LEVELS } from "@/lib/constants";
import { useI18n } from "@/hooks/useI18n";

interface ProfileCardProps {
  user: User;
  isOwn?: boolean;
  compact?: boolean;
  className?: string;
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
  followLoading?: boolean;
  onFollowToggle?: () => void;
  backHref?: string;
}

export function ProfileCard({ user, isOwn = false, compact = false, className, isFollowing = false, followerCount, followingCount, followLoading = false, onFollowToggle, backHref }: ProfileCardProps) {
  const { t } = useI18n();

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-xl border border-border bg-surface",
          className
        )}
      >
        <Avatar user={user} size="md" showRing />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-foreground">@{user.username}</span>
            <LevelBadge level={user.level} />
          </div>
          <AuraScore score={user.auraScore} size="sm" className="items-start mt-0.5" />
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-brand">#{user.globalRank}</p>
          <p className="text-xs text-muted">GLOBAL</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Back button — mobile only, integrated into card */}
      {backHref && (
        <Link
          href={backHref}
          className="md:hidden flex items-center gap-0.5 text-muted hover:text-foreground transition-colors -ml-1 p-1 mb-1 self-start cursor-pointer w-fit"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </Link>
      )}

      {/* Row 1: avatar + identity + stats */}
      <div className="flex items-center gap-4">
        <Avatar user={user} size="lg" showRing />

        <div className="flex-1 min-w-0">
          {/* Username + level */}
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h1 className="text-base font-black text-foreground leading-none">@{user.username}</h1>
            <LevelBadge level={user.level} size="sm" />
          </div>
          <p className="text-xs text-muted mb-2.5 truncate">{user.displayName}</p>

          {/* Stats inline */}
          <div className="flex items-center gap-5">
            <div>
              <p className="text-sm font-black text-foreground tabular-nums leading-tight">{formatAuraScore(user.postCount)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{t("profile.posts")}</p>
            </div>
            {followerCount !== undefined && (
              <div>
                <p className="text-sm font-black text-foreground tabular-nums leading-tight">{formatAuraScore(followerCount)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{t("follows.followers")}</p>
              </div>
            )}
            {followingCount !== undefined && (
              <div>
                <p className="text-sm font-black text-foreground tabular-nums leading-tight">{formatAuraScore(followingCount)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{t("follows.followingCount")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: aura score + level */}
      <div className="flex items-start gap-3 mt-3">
        <AuraScore score={user.auraScore} size="sm" showLabel animated className="items-start" />
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-2xl leading-none">{AURA_LEVELS[user.level].icon}</span>
          <span className="text-xl font-black leading-none text-foreground/90 uppercase tracking-wide">
            {AURA_LEVELS[user.level].label}
          </span>
        </div>
      </div>

      {/* Row 3: bio + location */}
      {(user.bio || user.city || user.countryName) && (
        <div className="mt-2 space-y-0.5">
          {user.bio && <p className="text-sm text-foreground leading-snug">{user.bio}</p>}
          {(user.city || user.countryName) && (
            <div className="flex items-center gap-1 text-xs text-muted/70">
              <MapPin size={11} className="text-brand-light/60 shrink-0" />
              <span>{[user.city, user.countryName].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* Row 4: badges */}
      {user.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {user.badges.map((badge) => (
            <Badge key={badge.id} badge={badge} />
          ))}
        </div>
      )}

      {/* Row 5: actions */}
      <div className="flex gap-2 mt-3">
        {isOwn ? (
          <Link href="/profile/edit" className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              {t("profile.editProfileBtn")}
            </Button>
          </Link>
        ) : (
          onFollowToggle && (
            <Button
              variant={isFollowing ? "secondary" : "primary"}
              size="sm"
              className="flex-1"
              onClick={onFollowToggle}
              disabled={followLoading}
            >
              {isFollowing ? t("follows.followingBtn") : t("follows.followBtn")}
            </Button>
          )
        )}
        <Button variant="secondary" size="sm" className="px-3">
          <Share2 size={14} />
        </Button>
      </div>
    </div>
  );
}
