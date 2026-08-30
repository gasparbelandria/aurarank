import { cn } from "@/lib/cn";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-bold uppercase tracking-wider text-muted"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full bg-surface border border-border rounded-lg px-3 py-3 text-foreground placeholder-muted/50 text-sm resize-none transition-colors",
          "focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30",
          error && "border-danger focus:border-danger focus:ring-danger/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
