import type { AuraLevel } from "./types";
import { AURA_LEVELS, TOTAL_USERS } from "./constants";

export function getLevel(score: number): AuraLevel {
  const levels = Object.entries(AURA_LEVELS).sort((a, b) => b[1].min - a[1].min);
  for (const [level, config] of levels) {
    if (score >= config.min) return level as AuraLevel;
  }
  return "NPC";
}

export function formatAuraScore(score: number): string {
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
  if (score >= 1_000) return score.toLocaleString("en-US");
  return score.toString();
}

export function getTierPercent(rank: number, total: number = TOTAL_USERS): string | null {
  if (rank <= 0) return null;
  const pct = (rank / total) * 100;
  if (pct < 0.1) return "TOP 0.1%";
  if (pct < 1) return `TOP ${pct.toFixed(1)}%`;
  return `TOP ${Math.round(pct)}%`;
}

export function getAuraLabel(score: number): { emoji: string; label: string } {
  if (score >= 90) return { emoji: "👑", label: "Legendary" };
  if (score >= 70) return { emoji: "💀", label: "Insane" };
  if (score >= 50) return { emoji: "🔥", label: "Aura" };
  if (score >= 25) return { emoji: "🗿", label: "Cold" };
  return { emoji: "😂", label: "No Aura" };
}

export function getScoreColor(score: number): string {
  if (score <= 30) return "text-danger";
  if (score <= 60) return "text-brand-light";
  return "text-acid";
}

export function getNextLevelInfo(score: number): { next: AuraLevel | null; needed: number; progress: number } {
  const levels = Object.entries(AURA_LEVELS).sort((a, b) => a[1].min - b[1].min);
  const currentIdx = levels.findLastIndex(([, cfg]) => score >= cfg.min);
  if (currentIdx === levels.length - 1) return { next: null, needed: 0, progress: 100 };

  const [, currentCfg] = levels[currentIdx];
  const [nextLevel, nextCfg] = levels[currentIdx + 1];
  const needed = nextCfg.min - score;
  const progress = ((score - currentCfg.min) / (nextCfg.min - currentCfg.min)) * 100;
  return { next: nextLevel as AuraLevel, needed, progress };
}
