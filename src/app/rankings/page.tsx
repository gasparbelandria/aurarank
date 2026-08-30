"use client";

import { useState, useEffect, useCallback } from "react";
import { m } from "framer-motion";
import { Star, Trophy, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { formatAuraScore } from "@/lib/aura-utils";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";
import type { RankingEntry } from "@/lib/types";
import Link from "next/link";

type Tab = "GLOBAL" | "WEEKLY" | "FRIENDS";
const TABS: Tab[] = ["GLOBAL", "WEEKLY", "FRIENDS"];

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const W = 100;
const D = 22;
const BOX_H: Record<number, number> = { 1: 104, 2: 70, 3: 46 };

const CLR_FRONT: Record<number, string> = { 1: "#1e3260", 2: "#152040", 3: "#0f1830" };
const CLR_TOP:   Record<number, string> = { 1: "#3258a0", 2: "#1e3266", 3: "#172450" };
const CLR_SIDE:  Record<number, string> = { 1: "#0e1e40", 2: "#0a1528", 3: "#08101e" };
const BG = "#08080A";

function ScoreBadge({ score, rank }: { score: number; rank: number }) {
  const gradient =
    rank === 3 ? "from-[#facc15] to-[#f97316]" : "from-[#a3e635] to-[#4ade80]";
  return (
    <div className={cn("flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r text-black font-black text-[11px] leading-none mt-2", gradient)}>
      <Star size={10} strokeWidth={3} fill="black" />
      {formatAuraScore(score)}
    </div>
  );
}

function PodiumBox({ rank }: { rank: number }) {
  const H  = BOX_H[rank] ?? 46;
  const vw = W + D;
  const vh = D + H;
  const front = CLR_FRONT[rank] ?? "#152040";
  const top   = CLR_TOP[rank]   ?? "#1e3266";
  const side  = CLR_SIDE[rank]  ?? "#0a1528";
  const isFirst = rank === 1;
  const fgId = `pfg-${rank}`;
  const sgId = `psg-${rank}`;

  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} width="100%" style={{ display: "block" }} aria-hidden>
      <defs>
        <linearGradient id={fgId} gradientUnits="userSpaceOnUse" x1="0" y1={D} x2="0" y2={vh}>
          <stop offset="0%"   stopColor={front} />
          <stop offset="48%"  stopColor={front} />
          <stop offset="100%" stopColor={BG} />
        </linearGradient>
        <linearGradient id={sgId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={vh}>
          <stop offset="0%"   stopColor={side} />
          <stop offset="48%"  stopColor={side} />
          <stop offset="100%" stopColor={BG} />
        </linearGradient>
      </defs>
      <polygon points={`${D},0 ${vw},0 ${W},${D} 0,${D}`} fill={top} />
      <polygon points={`0,${D} ${W},${D} ${W},${vh} 0,${vh}`} fill={`url(#${fgId})`} />
      <polygon points={`${W},${D} ${vw},0 ${vw},${H} ${W},${vh}`} fill={`url(#${sgId})`} />
      <text
        x={W / 2} y={D + H * 0.52}
        textAnchor="middle" dominantBaseline="central"
        fill="rgba(255,255,255,0.10)"
        fontSize={isFirst ? 52 : 38} fontWeight="900"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        style={{ userSelect: "none" }}
      >
        {rank}
      </text>
    </svg>
  );
}

function PodiumSlot({ entry }: { entry: RankingEntry }) {
  const isFirst = entry.rank === 1;
  return (
    <div className="flex flex-col items-center flex-1">
      <div className="relative">
        <Avatar user={entry.user} size={isFirst ? "lg" : "md"} showRing />
        <span className="absolute -bottom-1 -right-1 text-lg leading-none drop-shadow">
          {MEDAL[entry.rank]}
        </span>
      </div>
      <span className="mt-2.5 text-xs font-black text-foreground text-center leading-tight px-1 truncate w-full text-center">
        @{entry.user.username}
      </span>
      <ScoreBadge score={entry.auraScore} rank={entry.rank} />
      <div className="w-full mt-2">
        <PodiumBox rank={entry.rank} />
      </div>
    </div>
  );
}

function ListRow({ entry, isCurrentUser }: { entry: RankingEntry; isCurrentUser?: boolean }) {
  const movementColor =
    entry.movement === "up" ? "text-[#4ade80]" : entry.movement === "down" ? "text-danger" : "text-muted";
  const movementStr =
    entry.movement === "up" ? `+${entry.movementDelta}` :
    entry.movement === "down" ? `-${entry.movementDelta}` :
    entry.movement === "new" ? "NEW" : "—";

  return (
    <Link
      href={`/@${entry.user.username}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer",
        isCurrentUser
          ? "bg-brand/10 border-brand/30 hover:bg-brand/15"
          : "bg-elevated border-border hover:border-brand/20"
      )}
    >
      <div className="w-7 shrink-0 flex flex-col items-center gap-0.5">
        <Trophy size={11} className="text-muted/50" />
        <span className={cn("text-xs font-black tabular-nums", isCurrentUser ? "text-brand-light" : "text-muted")}>
          {entry.rank}
        </span>
      </div>
      <Avatar user={entry.user} size="sm" showRing />
      <div className="flex-1 min-w-0">
        <p className={cn("font-black text-sm leading-tight truncate", isCurrentUser ? "text-brand-light" : "text-foreground")}>
          {entry.user.displayName}
        </p>
        <p className="text-xs text-muted font-bold truncate">@{entry.user.username}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center justify-end gap-1">
          <Star size={11} strokeWidth={2.5} className="text-acid" fill="currentColor" />
          <span className="font-black text-sm text-foreground tabular-nums">{formatAuraScore(entry.auraScore)}</span>
        </div>
        <span className={cn("text-[11px] font-black", movementColor)}>{movementStr}</span>
      </div>
    </Link>
  );
}

export default function RankingsPage() {
  useAuthGuard();
  const { t } = useI18n();
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>("GLOBAL");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<RankingEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRankings = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rankings?tab=${tab.toLowerCase()}`);
      if (!res.ok) return;
      const data = await res.json();
      setRankings(data.rankings ?? []);
      setCurrentUserEntry(data.currentUserEntry ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRankings(activeTab); }, [activeTab, fetchRankings]);

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3, 50);
  const isCurrentUserInTop = currentUserEntry ? currentUserEntry.rank <= rankings.length && currentUserEntry.rank <= 50 : false;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <BottomNav />

      <main className="md:pl-60 min-h-screen pb-24 md:pb-8">
        <TopBar title={t("rankings.title")} />

        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-6 hidden md:block">
            <h1 className="text-3xl font-black uppercase tracking-wide text-foreground">{t("rankings.title")}</h1>
            <p className="text-sm text-muted mt-1">{t("rankings.sub")}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2 cursor-pointer",
                  activeTab === tab
                    ? "text-foreground border-brand"
                    : "text-muted border-transparent hover:text-foreground"
                )}
              >
                {t(`rankings.tab${tab.charAt(0) + tab.slice(1).toLowerCase()}`)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-muted" />
            </div>
          ) : (
            <>
              {/* Friends empty state */}
              {activeTab === "FRIENDS" && rankings.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <p className="text-foreground font-black text-sm uppercase tracking-wider">
                    {t("rankings.friendsEmpty")}
                  </p>
                  <p className="text-muted text-sm">{t("rankings.friendsEmptySub")}</p>
                </div>
              )}

              {/* Podium — top 3 */}
              {top3.length >= 3 && (
                <m.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-end gap-2 mb-8 px-2"
                >
                  <PodiumSlot entry={top3[1]} />
                  <PodiumSlot entry={top3[0]} />
                  <PodiumSlot entry={top3[2]} />
                </m.div>
              )}

              {/* List — rank 4+ */}
              <div className="flex flex-col gap-2">
                {rest.map((entry, i) => (
                  <m.div
                    key={entry.user.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ListRow entry={entry} isCurrentUser={entry.user.id === user?.id} />
                  </m.div>
                ))}
              </div>

              {/* Current user position outside top 50 */}
              {!isCurrentUserInTop && currentUserEntry && (
                <>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs font-black text-muted uppercase tracking-widest">
                      {t("rankings.yourRank")}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <ListRow entry={currentUserEntry} isCurrentUser />
                </>
              )}

              {rankings.length === 0 && activeTab !== "FRIENDS" && (
                <div className="text-center py-16">
                  <p className="text-muted font-bold uppercase tracking-wider text-sm">{t("rankings.empty")}</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
