"use client";

import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

interface PrimaryActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  success?: boolean;
  loadingLabel?: string;
  successLabel?: string;
}

export function PrimaryActionButton({
  loading = false,
  success = false,
  loadingLabel,
  successLabel,
  children,
  disabled,
  className,
  ...props
}: PrimaryActionButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all",
        loading || disabled
          ? "bg-elevated border border-border text-muted cursor-not-allowed"
          : success
            ? "bg-acid/10 border border-acid/40 text-acid cursor-pointer"
            : "bg-gradient-to-r from-brand-light via-brand to-acid text-background hover:brightness-110 cursor-pointer",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          {loadingLabel ?? children}
        </span>
      ) : success ? (
        <span className="flex items-center justify-center gap-2">
          <CheckCircle2 size={16} />
          {successLabel ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
