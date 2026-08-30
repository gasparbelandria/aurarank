"use client";

import { cn } from "@/lib/cn";
import { getAuraLabel } from "@/lib/aura-utils";

interface AuraLabelProps {
  score: number;
  ratingCount: number;
  className?: string;
}

export function AuraLabel({ score, ratingCount, className }: AuraLabelProps) {
  if (ratingCount === 0) return null;
  const { emoji, label } = getAuraLabel(score);
  return (
    <span className={cn("flex items-center gap-1.5 font-black text-white/90 text-2xl leading-none", className)}>
      <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
