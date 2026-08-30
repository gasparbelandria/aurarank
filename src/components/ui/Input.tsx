import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export function Input({ label, error, prefix, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-wider text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-muted font-medium select-none">{prefix}</span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full bg-surface border border-border rounded-lg px-3 py-3 text-foreground placeholder-muted/50 text-sm transition-colors",
            "focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30",
            error && "border-danger focus:border-danger focus:ring-danger/30",
            prefix && "pl-7",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
