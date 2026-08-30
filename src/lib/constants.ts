import type { AuraLevel, PostCategory } from "./types";

export const AURA_LEVELS: Record<
  AuraLevel,
  { min: number; label: string; icon: string; badgeClass: string; ringClass: string }
> = {
  NPC: {
    min: 0,
    label: "NPC",
    icon: "🤖",
    badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
    ringClass: "ring-zinc-600",
  },
  ROOKIE: {
    min: 1000,
    label: "ROOKIE",
    icon: "⭐",
    badgeClass: "bg-zinc-700 text-zinc-200 border-zinc-600",
    ringClass: "ring-zinc-500",
  },
  RISING: {
    min: 5000,
    label: "RISING",
    icon: "🔥",
    badgeClass: "bg-blue-950 text-blue-300 border-blue-800",
    ringClass: "ring-blue-600",
  },
  "AURA FARMER": {
    min: 15000,
    label: "AURA FARMER",
    icon: "⚡",
    badgeClass: "bg-violet-950 text-brand-light border-brand/50",
    ringClass: "ring-brand",
  },
  ELITE: {
    min: 40000,
    label: "ELITE",
    icon: "💎",
    badgeClass: "bg-brand/20 text-brand-light border-brand",
    ringClass: "ring-brand-light",
  },
  LEGENDARY: {
    min: 80000,
    label: "LEGENDARY",
    icon: "👑",
    badgeClass: "border-acid/50 text-foreground",
    ringClass: "ring-acid",
  },
};

export const POST_CATEGORIES: PostCategory[] = [
  "Gaming",
  "Sports",
  "Fashion",
  "Gym",
  "Music",
  "Funny",
  "Random",
];

export const CATEGORY_COLORS: Record<PostCategory, string> = {
  Gaming: "bg-violet-900/60 text-violet-300 border-violet-700",
  Sports: "bg-blue-900/60 text-blue-300 border-blue-700",
  Fashion: "bg-pink-900/60 text-pink-300 border-pink-700",
  Gym: "bg-orange-900/60 text-orange-300 border-orange-700",
  Music: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  Funny: "bg-green-900/60 text-green-300 border-green-700",
  Random: "bg-zinc-800 text-zinc-300 border-zinc-600",
};

export const TOTAL_USERS = 48200;
