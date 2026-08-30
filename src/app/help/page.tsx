"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useI18n } from "@/hooks/useI18n";
import { AURA_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const LEVEL_ORDER = [
  "NPC",
  "ROOKIE",
  "RISING",
  "AURA FARMER",
  "ELITE",
  "LEGENDARY",
] as const;

const LEVEL_DESC_KEY: Record<string, string> = {
  NPC: "help.levelNPC",
  ROOKIE: "help.levelROOKIE",
  RISING: "help.levelRISING",
  "AURA FARMER": "help.levelFARMER",
  ELITE: "help.levelELITE",
  LEGENDARY: "help.levelLEGENDARY",
};

export default function HelpPage() {
  useAuthGuard();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <BottomNav />

      <main className="md:pl-60 min-h-screen pb-24 md:pb-8">
        <TopBar title={t("help.title")} />

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8 hidden md:block">
            <h1 className="text-3xl font-black uppercase tracking-wide text-foreground">{t("help.title")}</h1>
            <p className="text-sm text-muted mt-1">{t("help.sub")}</p>
          </div>

          {/* Section index */}
          <div className="bg-elevated border border-border rounded-2xl overflow-hidden mb-8">
            <Link
              href="#levels"
              className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors cursor-pointer"
            >
              <div>
                <p className="text-sm font-black text-foreground">{t("help.levelsTitle")}</p>
                <p className="text-xs text-muted mt-0.5">{t("help.levelsDesc")}</p>
              </div>
              <ChevronRight size={16} className="text-muted shrink-0 ml-4" />
            </Link>
          </div>

          {/* ── LEVELS & AURA ── */}
          <section id="levels" className="scroll-mt-20">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-4">
              {t("help.levelsHeading")}
            </h2>

            <div className="bg-elevated border border-border rounded-2xl p-5 mb-4">
              <p className="text-sm text-foreground leading-relaxed">
                {t("help.auraExplanation")}
              </p>
            </div>

            <div className="space-y-3">
              {LEVEL_ORDER.map((key, i) => {
                const level = AURA_LEVELS[key];
                const nextLevel = AURA_LEVELS[LEVEL_ORDER[i + 1]];
                const rangeLabel = nextLevel
                  ? `${level.min.toLocaleString()} – ${(nextLevel.min - 1).toLocaleString()} aura`
                  : `${level.min.toLocaleString()}+ aura`;

                return (
                  <div
                    key={key}
                    className="bg-elevated border border-border rounded-2xl p-5 flex gap-4 items-start"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md border text-[11px] font-black tracking-widest shrink-0 mt-0.5",
                        level.badgeClass
                      )}
                    >
                      {level.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-muted uppercase tracking-wider mb-1">
                        {rangeLabel}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {t(LEVEL_DESC_KEY[key])}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
