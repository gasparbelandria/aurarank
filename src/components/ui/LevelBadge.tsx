import { cn } from "@/lib/cn";
import { AURA_LEVELS } from "@/lib/constants";
import type { AuraLevel } from "@/lib/types";

interface LevelBadgeProps {
  level: AuraLevel;
  size?: "sm" | "md";
  className?: string;
}

export function LevelBadge({ level, size = "sm", className }: LevelBadgeProps) {
  const config = AURA_LEVELS[level];
  const isLegendary = level === "LEGENDARY";

  return (
    <span
      className={cn(
        "inline-flex items-center font-black uppercase tracking-widest border rounded px-1.5",
        size === "sm" && "text-[9px] py-0.5",
        size === "md" && "text-xs py-1 px-2",
        isLegendary
          ? "aura-gradient text-background border-transparent"
          : config.badgeClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}
