"use client";

import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold shadow-xl animate-slide-up max-w-xs",
            toast.type === "success" && "bg-elevated border-acid/30 text-acid",
            toast.type === "error" && "bg-elevated border-danger/30 text-danger",
            toast.type === "info" && "bg-elevated border-brand/30 text-brand-light"
          )}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
