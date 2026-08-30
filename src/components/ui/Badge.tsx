import { cn } from "@/lib/cn";
import type { Badge as BadgeType } from "@/lib/types";

interface BadgeProps {
  badge: BadgeType;
  className?: string;
}

export function Badge({ badge, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
        "bg-elevated border border-border text-muted",
        className
      )}
      title={badge.label}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
}
