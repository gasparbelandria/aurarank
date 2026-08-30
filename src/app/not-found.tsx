"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/hooks/useI18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
      <div className="text-8xl font-black tabular-nums aura-text">404</div>
      <h1 className="text-2xl font-black uppercase tracking-wide text-foreground">
        {t("notFound.heading")}
      </h1>
      <p className="text-sm text-muted max-w-xs">
        {t("notFound.message")}
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="primary" size="md">{t("notFound.homeBtn")}</Button>
        </Link>
        <Link href="/feed">
          <Button variant="secondary" size="md">{t("notFound.feedBtn")}</Button>
        </Link>
      </div>
    </div>
  );
}
