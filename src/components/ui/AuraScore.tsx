"use client";

import { cn } from "@/lib/cn";
import { formatAuraScore } from "@/lib/aura-utils";
import { useAnimatedCount } from "@/hooks/useAnimatedCount";

const SIZE_MAP = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
  xl: "text-8xl",
};

interface AuraScoreProps {
  score: number;
  size?: keyof typeof SIZE_MAP;
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

function StaticAuraScore({ score, size, showLabel, className }: Omit<AuraScoreProps, "animated">) {
  return (
    <div className={cn("flex flex-col items-center leading-none", className)}>
      <span
        className={cn(
          "font-black tabular-nums tracking-tighter aura-text",
          SIZE_MAP[size ?? "md"]
        )}
      >
        {formatAuraScore(score)}
      </span>
      {showLabel && (
        <span className="text-xs font-bold uppercase tracking-widest text-muted mt-1">
          AURA
        </span>
      )}
    </div>
  );
}

function AnimatedAuraScoreInner({ score, size, showLabel, className }: Omit<AuraScoreProps, "animated">) {
  const count = useAnimatedCount(score);
  return (
    <div className={cn("flex flex-col items-center leading-none", className)}>
      <span
        className={cn(
          "font-black tabular-nums tracking-tighter aura-text",
          SIZE_MAP[size ?? "md"]
        )}
      >
        {formatAuraScore(count)}
      </span>
      {showLabel && (
        <span className="text-xs font-bold uppercase tracking-widest text-muted mt-1">
          AURA
        </span>
      )}
    </div>
  );
}

export function AuraScore({ animated = false, ...props }: AuraScoreProps) {
  if (animated) return <AnimatedAuraScoreInner {...props} />;
  return <StaticAuraScore {...props} />;
}
