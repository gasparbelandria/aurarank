"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { LangToggle } from "@/components/ui/LangToggle";
import { AuraCTALink } from "@/components/ui/AuraCTALink";
import { useI18n } from "@/hooks/useI18n";

/**
 * Mobile-only sticky top bar for inner authenticated pages (profile, post detail).
 * On md+ the Sidebar handles navigation — this is hidden via md:hidden.
 */
export function ProfileBar({
  backHref,
  title,
  right,
}: {
  backHref: string;
  title: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="md:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="relative flex items-center justify-between px-4 h-12">
        <Link
          href={backHref}
          className="flex items-center gap-0.5 text-muted hover:text-foreground transition-colors -ml-1 p-1 cursor-pointer"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          {title}
        </div>

        <div className="flex items-center justify-end min-w-8">
          {right ?? null}
        </div>
      </div>
    </div>
  );
}

/**
 * Full-width sticky header for public (unauthenticated) profile views.
 */
export function PublicProfileBar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
      <Link href="/" className="inline-flex items-baseline gap-0.5">
        <span className="text-lg font-black text-brand">AURA</span>
        <span className="text-lg font-black text-acid">RANK</span>
      </Link>
      <div className="flex items-center gap-3">
        <LangToggle variant="text" />
        <AuraCTALink href={loginHref} fontSize={12} padding="9px 14px" borderRadius={10}>
          {t("nav.getAuraRank")}
        </AuraCTALink>
      </div>
    </header>
  );
}
