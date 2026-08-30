"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(error?.message ?? "Unknown error").slice(0, 200),
        stack: String(error?.stack ?? "").slice(0, 5000),
        section: "frontend",
        source: "frontend",
        url: typeof window !== "undefined" ? window.location.href : undefined,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
      <div className="text-8xl font-black tabular-nums aura-text">!</div>
      <h1 className="text-2xl font-black uppercase tracking-wide text-foreground">
        Something went wrong
      </h1>
      <p className="text-sm text-muted max-w-xs">
        An unexpected error occurred. We&apos;ve been notified and will look into it.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" size="md" onClick={reset} className="cursor-pointer">
          Try again
        </Button>
        <Link href="/">
          <Button variant="secondary" size="md" className="cursor-pointer">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
