import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { RankingEntry } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { AuraScore } from "@/components/ui/AuraScore";
import { cn } from "@/lib/cn";
import { formatAuraScore } from "@/lib/aura-utils";

const RANK_ICONS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface LeaderboardRowProps {
  entry: RankingEntry;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  const rankIcon = RANK_ICONS[entry.rank];

  return (
    <Link
      href={`/@${entry.user.username}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
        isCurrentUser
          ? "bg-brand/10 border-brand/30 hover:bg-brand/15"
          : "bg-elevated border-border hover:border-brand/20 hover:bg-elevated"
      )}
    >
      {/* Rank */}
      <div className="w-8 text-center shrink-0">
        {rankIcon ? (
          <span className="text-xl">{rankIcon}</span>
        ) : (
          <span className={cn("text-sm font-black tabular-nums", isCurrentUser ? "text-brand-light" : "text-muted")}>
            #{entry.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <Avatar user={entry.user} size="sm" showRing />

      {/* Name + Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("font-black text-sm truncate", isCurrentUser ? "text-brand-light" : "text-foreground")}>
            @{entry.user.username}
          </span>
          <LevelBadge level={entry.user.level} />
        </div>
        {isCurrentUser && (
          <span className="text-xs text-muted font-bold">You</span>
        )}
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <AuraScore score={entry.auraScore} size="sm" />
      </div>

      {/* Movement */}
      <div className="w-12 text-right shrink-0">
        {entry.movement === "up" && (
          <span className="flex items-center justify-end gap-0.5 text-xs font-black text-acid">
            <TrendingUp size={12} />
            +{entry.movementDelta}
          </span>
        )}
        {entry.movement === "down" && (
          <span className="flex items-center justify-end gap-0.5 text-xs font-black text-danger">
            <TrendingDown size={12} />
            -{entry.movementDelta}
          </span>
        )}
        {entry.movement === "same" && (
          <span className="flex items-center justify-end text-xs text-muted">
            <Minus size={12} />
          </span>
        )}
        {entry.movement === "new" && (
          <span className="text-[9px] font-black text-acid border border-acid/50 rounded px-1 py-0.5 uppercase tracking-wider">
            NEW
          </span>
        )}
      </div>
    </Link>
  );
}
