"use client";

import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/cn";

interface LangToggleProps {
  className?: string;
  variant?: "pill" | "text";
}

export function LangToggle({ className, variant = "pill" }: LangToggleProps) {
  const { locale, setLocale } = useI18n();
  const next = locale === "en" ? "es" : "en";

  if (variant === "text") {
    return (
      <button
        onClick={() => setLocale(next)}
        className={cn(
          "text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-colors cursor-pointer",
          className
        )}
      >
        {next.toUpperCase()}
      </button>
    );
  }

  return (
    <button
      onClick={() => setLocale(next)}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-brand/40 hover:bg-elevated transition-all cursor-pointer",
        className
      )}
    >
      <span className="text-base leading-none">
        {locale === "en" ? "🇺🇸" : "🇪🇸"}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-muted">
        {next.toUpperCase()}
      </span>
    </button>
  );
}
