"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { LangToggle } from "@/components/ui/LangToggle";
import { AuraCTALink } from "@/components/ui/AuraCTALink";
import { useCurrentUser } from "@/hooks/useCurrentUser";


const MONO = { fontFamily: "'JetBrains Mono', monospace" } as const;

const BOARD = [
  { rank: "🥇 #1", handle: "@vex", badge: "LEGENDARY", aura: "31,208", move: "▲ 2", moveColor: "#B8FF3D", rowBg: "transparent", initial: "V", avatarBg: "linear-gradient(140deg,#A78BFA,#8B5CF6)" },
  { rank: "🥈 #2", handle: "@sol", badge: "ELITE", aura: "28,940", move: "▼ 1", moveColor: "#FF4D67", rowBg: "transparent", initial: "S", avatarBg: "linear-gradient(140deg,#F5F5F5,#A1A1AA)" },
  { rank: "🥉 #3", handle: "@nyx", badge: "ELITE", aura: "26,117", move: "▲ 5", moveColor: "#B8FF3D", rowBg: "transparent", initial: "N", avatarBg: "linear-gradient(140deg,#B8FF3D,#7ecb1f)" },
  { rank: "#4", handle: "@juno", badge: "AURA FARMER", aura: "24,880", move: "— 0", moveColor: "#6b6b76", rowBg: "transparent", initial: "J", avatarBg: "linear-gradient(140deg,#A78BFA,#6d3ff0)" },
  { rank: "#5", handle: "@rell", badge: "AURA FARMER", aura: "23,401", move: "▲ 12", moveColor: "#B8FF3D", rowBg: "transparent", initial: "R", avatarBg: "linear-gradient(140deg,#FF4D67,#c22a41)" },
  { rank: "#184", handle: "@alex", badge: "YOU · TOP 4.2%", aura: "9,482", move: "#184 → #171", moveColor: "#B8FF3D", rowBg: "#150f22", initial: "A", avatarBg: "linear-gradient(140deg,#A78BFA,#8B5CF6)" },
];

const TABS = ["GLOBAL", "WEEKLY", "FRIENDS"] as const;
type Tab = (typeof TABS)[number];

export default function LandingPage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>("GLOBAL");

  const STEPS = [
    { n: "01", color: "#F5F5F5", title: t("landing.step1Title"), body: t("landing.step1Body") },
    { n: "02", color: "#A78BFA", title: t("landing.step2Title"), body: t("landing.step2Body") },
    { n: "03", color: "#B8FF3D", title: t("landing.step3Title"), body: t("landing.step3Body") },
  ];

  const WHY = [
    { tag: t("landing.whyShareTag"), title: t("landing.whyShareTitle"), body: t("landing.whyShareBody") },
    { tag: t("landing.whyRatedTag"), title: t("landing.whyRatedTitle"), body: t("landing.whyRatedBody") },
    { tag: t("landing.whyAuraTag"), title: t("landing.whyAuraTitle"), body: t("landing.whyAuraBody") },
    { tag: t("landing.whyCompeteTag"), title: t("landing.whyCompeteTitle"), body: t("landing.whyCompeteBody") },
  ];

  const FAQ = [
    { q: t("landing.faqQ1"), a: t("landing.faqA1") },
    { q: t("landing.faqQ2"), a: t("landing.faqA2") },
    { q: t("landing.faqQ3"), a: t("landing.faqA3") },
    { q: t("landing.faqQ4"), a: t("landing.faqA4") },
  ];

  const TAB_KEYS: Record<Tab, string> = {
    GLOBAL: "landing.tabGlobal",
    WEEKLY: "landing.tabWeekly",
    FRIENDS: "landing.tabFriends",
  };

  return (
    <div style={{ background: "#08080A", color: "#F5F5F5" }}>
      {/* NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(8,8,10,0.86)", backdropFilter: "blur(12px)", borderBottom: "1px solid #18181C" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aurarank-logo.png" alt="AuraRank" style={{ height: 48, width: "auto" }} />
          <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.14em", color: "#6b6b76", border: "1px solid #27272D", padding: "4px 8px", borderRadius: 5 }}>BETA</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <LangToggle />
            {!authLoading && (
              <AuraCTALink
                href={user ? "/feed" : "/login"}
                fontSize={14}
                padding="11px 18px"
                borderRadius={11}
              >
                {user ? t("nav.openApp") : t("landing.getAuraRank")}
              </AuraCTALink>
            )}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden", background: "radial-gradient(900px 520px at 18% -5%, #1b1233 0%, rgba(8,8,10,0) 70%), radial-gradient(700px 420px at 88% 10%, #16210d 0%, rgba(8,8,10,0) 65%)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "84px 24px 90px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #2c2242", background: "#150f22", padding: "7px 12px", borderRadius: 999, ...MONO, fontSize: 10, letterSpacing: "0.14em", color: "#A78BFA", marginBottom: 26 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#B8FF3D", display: "inline-block", flexShrink: 0 }} />
              <span>{t("landing.ratingsLive")}</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 84, lineHeight: 0.92, letterSpacing: "-0.045em" }}>
              {t("landing.heroTitle").split("AuraRank").map((part, i, arr) => (
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span style={{ background: "linear-gradient(100deg, #A78BFA 10%, #8B5CF6 45%, #B8FF3D 105%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                      AuraRank
                    </span>
                  </span>
                ) : part
              ))}
            </h1>
            <p style={{ margin: "22px 0 0", fontSize: 20, lineHeight: 1.5, color: "#A1A1AA", maxWidth: 480 }}>
              {t("landing.heroSubtitle")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }}>
              <AuraCTALink href="/login" fontSize={17} padding="18px 30px" borderRadius={15}>
                {t("landing.getAuraRank")}
              </AuraCTALink>
              <Link href="/rankings" style={{ border: "1px solid #27272D", background: "#111114", color: "#F5F5F5", fontWeight: 800, fontSize: 17, padding: "18px 26px", borderRadius: 15, display: "inline-block" }}>
                {t("landing.exploreRankings")}
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 26, ...MONO, fontSize: 11, color: "#6b6b76", letterSpacing: "0.08em" }}>
              <span>{t("landing.profileUrl")}</span>
              <span style={{ color: "#27272D" }}>|</span>
              <span>{t("landing.noFollowers")}</span>
            </div>
          </div>

          {/* HERO CARD */}
          <div style={{ animation: "floaty 7s ease-in-out infinite" }}>
            <div style={{ borderRadius: 26, border: "1px solid #2c2242", background: "linear-gradient(165deg, #1b1434 0%, #111114 55%)", padding: 24, boxShadow: "0 50px 90px -40px rgba(139,92,246,0.45)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(140deg, #A78BFA, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, color: "#08080A", flexShrink: 0 }}>A</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>@alex</div>
                  <div style={{ ...MONO, fontSize: 10, letterSpacing: "0.14em", color: "#6b6b76" }}>AURARANK.ME/@ALEX</div>
                </div>
                <div style={{ marginLeft: "auto", ...MONO, fontSize: 10, letterSpacing: "0.12em", color: "#08080A", background: "#B8FF3D", padding: "6px 10px", borderRadius: 6, fontWeight: 600 }}>TOP 4.2%</div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 26 }}>
                <div style={{ fontWeight: 800, fontSize: 76, lineHeight: 0.85, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums", background: "linear-gradient(100deg, #F5F5F5 5%, #A78BFA 55%, #B8FF3D 110%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  9,482
                </div>
                <div style={{ paddingBottom: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.2em", color: "#A1A1AA" }}>AURA</span>
                  <span style={{ fontWeight: 800, fontSize: 12, color: "#B8FF3D" }}>+212 TODAY</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.12em", color: "#A78BFA", background: "#150f22", border: "1px solid #2c2242", padding: "6px 10px", borderRadius: 7 }}>AURA FARMER</span>
                <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.12em", color: "#A1A1AA", background: "#18181C", border: "1px solid #27272D", padding: "6px 10px", borderRadius: 7 }}>#184 GLOBAL</span>
              </div>

              <div style={{ marginTop: 22, borderRadius: 18, border: "1px solid #27272D", overflow: "hidden", background: "#0d0d10" }}>
                <div style={{ position: "relative", aspectRatio: "16 / 11", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/cover-aura-battles.jpg"
                    alt="post"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                  />
                  <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(8,8,10,0.72)", border: "1px solid #27272D", borderRadius: 10, padding: "8px 11px", display: "flex", alignItems: "baseline", gap: 5 }}>
                    <span style={{ fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>94</span>
                    <span style={{ ...MONO, fontSize: 9, letterSpacing: "0.12em", color: "#A1A1AA" }}>AURA</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
                  <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.08em", color: "#A1A1AA" }}>234 RATINGS</span>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#B8FF3D" }}>+94</span>
                    <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", color: "#08080A", background: "linear-gradient(100deg, #A78BFA, #8B5CF6)", padding: "10px 18px", borderRadius: 10 }}>{t("landing.rateBtn")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ borderTop: "1px solid #18181C", background: "#08080A" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "76px 24px" }}>
          <div style={{ ...MONO, fontSize: 11, letterSpacing: "0.2em", color: "#6b6b76", marginBottom: 14 }}>{t("landing.howTag")}</div>
          <h2 style={{ margin: "0 0 40px", fontWeight: 800, fontSize: 44, letterSpacing: "-0.035em" }}>{t("landing.howTitle")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ border: "1px solid #27272D", background: "#111114", borderRadius: 20, padding: 26 }}>
                <div style={{ fontWeight: 800, fontSize: 46, lineHeight: 1, letterSpacing: "-0.04em", color: "#27272D" }}>{s.n}</div>
                <div style={{ fontWeight: 800, fontSize: 22, marginTop: 14, letterSpacing: "-0.02em", color: s.color }}>{s.title}</div>
                <div style={{ fontSize: 15, color: "#A1A1AA", lineHeight: 1.55, marginTop: 8 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RATING STRIP */}
      <div style={{ borderTop: "1px solid #18181C", background: "linear-gradient(180deg, #0c0a12, #08080A)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "70px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ ...MONO, fontSize: 11, letterSpacing: "0.2em", color: "#6b6b76", marginBottom: 14 }}>{t("landing.ratingTag")}</div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 44, letterSpacing: "-0.035em", lineHeight: 1.05 }}>{t("landing.ratingTitle")}</h2>
            <p style={{ fontSize: 17, color: "#A1A1AA", lineHeight: 1.6, maxWidth: 440, margin: "18px 0 0" }}>
              {t("landing.ratingBody")}
            </p>
          </div>
          <div style={{ border: "1px solid #2c2242", borderRadius: 22, background: "linear-gradient(165deg, #1a1330, #111114 60%)", padding: 30 }}>
            <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em" }}>{t("landing.howMuchAura")}</div>
            <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
              <span style={{ fontWeight: 800, fontSize: 96, lineHeight: 1, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums", background: "linear-gradient(100deg, #A78BFA, #8B5CF6 50%, #B8FF3D)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>87</span>
            </div>
            <div style={{ position: "relative", height: 26, marginBottom: 6 }}>
              <div style={{ position: "absolute", top: 10, left: 0, right: 0, height: 6, borderRadius: 999, background: "#27272D" }} />
              <div style={{ position: "absolute", top: 10, left: 0, width: "87%", height: 6, borderRadius: 999, background: "linear-gradient(90deg, #8B5CF6, #B8FF3D)" }} />
              <div style={{ position: "absolute", top: 1, left: "87%", width: 24, height: 24, marginLeft: -12, borderRadius: "50%", background: "#F5F5F5", boxShadow: "0 0 0 4px rgba(139,92,246,0.35)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", ...MONO, fontSize: 10, letterSpacing: "0.1em", color: "#6b6b76", paddingBottom: 20 }}>
              <span>{t("landing.sliderMin")}</span>
              <span>{t("landing.sliderMax")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: 15, letterSpacing: "0.1em", color: "#08080A", background: "linear-gradient(100deg, #A78BFA, #8B5CF6 55%, #B8FF3D)", padding: "16px 0", borderRadius: 14 }}>{t("landing.rateBtn")}</div>
              <div style={{ fontWeight: 800, fontSize: 26, color: "#B8FF3D", letterSpacing: "-0.02em" }}>+87</div>
            </div>
          </div>
        </div>
      </div>

      {/* RANKINGS */}
      <div id="rankings" style={{ borderTop: "1px solid #18181C" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "76px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap", marginBottom: 34 }}>
            <div>
              <div style={{ ...MONO, fontSize: 11, letterSpacing: "0.2em", color: "#6b6b76", marginBottom: 14 }}>{t("landing.rankingsTag")}</div>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: 44, letterSpacing: "-0.035em" }}>{t("landing.rankingsTitle")}</h2>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    fontWeight: 800, fontSize: 12, letterSpacing: "0.08em",
                    color: activeTab === tab ? "#F5F5F5" : "#A1A1AA",
                    background: activeTab === tab ? "#18181C" : "transparent",
                    border: activeTab === tab ? "1px solid #8B5CF6" : "1px solid #27272D",
                    padding: "9px 16px", borderRadius: 10, cursor: "pointer",
                  }}
                >
                  {t(TAB_KEYS[tab])}
                </button>
              ))}
            </div>
          </div>
          <div style={{ border: "1px solid #27272D", borderRadius: 20, overflow: "hidden", background: "#111114" }}>
            {BOARD.map((r, i) => (
              <div key={r.handle} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderTop: i === 0 ? "none" : "1px solid #18181C", background: r.rowBg }}>
                <span style={{ ...MONO, fontSize: 13, color: "#A1A1AA", width: 62, flexShrink: 0 }}>{r.rank}</span>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: r.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#08080A", flexShrink: 0 }}>{r.initial}</div>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{r.handle}</span>
                <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.12em", color: "#A78BFA" }}>{r.badge}</span>
                <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>{r.aura}</span>
                <span style={{ ...MONO, fontSize: 11, width: 88, textAlign: "right", color: r.moveColor, flexShrink: 0 }}>{r.move}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHY */}
      <div style={{ borderTop: "1px solid #18181C" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "76px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {WHY.map((w) => (
              <div key={w.tag} style={{ border: "1px solid #27272D", background: "#111114", borderRadius: 18, padding: 24 }}>
                <div style={{ ...MONO, fontSize: 10, letterSpacing: "0.16em", color: "#B8FF3D", marginBottom: 16 }}>{w.tag}</div>
                <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{w.title}</div>
                <div style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.55, marginTop: 8 }}>{w.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SHARE CARD */}
      <div style={{ borderTop: "1px solid #18181C", background: "linear-gradient(180deg, #0c0a12, #08080A)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "76px 24px", display: "grid", gridTemplateColumns: "1fr 420px", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ ...MONO, fontSize: 11, letterSpacing: "0.2em", color: "#6b6b76", marginBottom: 14 }}>{t("landing.shareTag")}</div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 44, letterSpacing: "-0.035em", lineHeight: 1.05 }}>{t("landing.shareTitle")}</h2>
            <p style={{ fontSize: 17, color: "#A1A1AA", lineHeight: 1.6, maxWidth: 460, margin: "18px 0 0" }}>
              {t("landing.shareBody")}
            </p>
          </div>
          <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid #2c2242", background: "linear-gradient(160deg, #1c1436, #0d0d10 70%)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
              <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.2em" }}>AURARANK.ME</span>
              <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.12em", color: "#08080A", background: "#B8FF3D", padding: "5px 9px", borderRadius: 6 }}>TOP 4%</span>
            </div>
            <div style={{ margin: "0 18px", borderRadius: 14, border: "1px solid #27272D", background: "repeating-linear-gradient(135deg, #111114 0 10px, #16161b 10px 20px)", aspectRatio: "5 / 4", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/aura-mascot.png"
                alt="AuraRank mascot"
                style={{
                  width: "90%",
                  height: "100%",
                  objectFit: "contain",
                  mixBlendMode: "screen",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 54, lineHeight: 0.9, letterSpacing: "-0.045em", fontVariantNumeric: "tabular-nums", background: "linear-gradient(100deg, #F5F5F5, #A78BFA 60%, #B8FF3D)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>94</div>
              <div style={{ paddingBottom: 6 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>@alex</div>
                <div style={{ ...MONO, fontSize: 10, letterSpacing: "0.14em", color: "#A1A1AA" }}>AURA</div>
              </div>
              <div style={{ marginLeft: "auto", fontWeight: 800, fontSize: 13, color: "#B8FF3D", paddingBottom: 8 }}>{t("landing.rateMyAura")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: "1px solid #18181C" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 68, letterSpacing: "-0.045em", lineHeight: 0.98 }}>
            {t("landing.ctaTitle").split("AuraRank").map((part, i, arr) => (
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <span style={{ background: "linear-gradient(100deg, #A78BFA, #B8FF3D)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>AuraRank</span>
                </span>
              ) : part
            ))}
          </h2>
          <p style={{ fontSize: 18, color: "#A1A1AA", margin: "20px 0 30px" }}>
            {t("landing.ctaSubtitle")}
          </p>
          <AuraCTALink href="/login" fontSize={18} padding="20px 36px" borderRadius={16}>
            {t("landing.ctaBtn")}
          </AuraCTALink>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ borderTop: "1px solid #18181C" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "70px 24px" }}>
          <div style={{ ...MONO, fontSize: 11, letterSpacing: "0.2em", color: "#6b6b76", marginBottom: 28 }}>{t("landing.faqTag")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {FAQ.map((f) => (
              <div key={f.q} style={{ border: "1px solid #27272D", background: "#111114", borderRadius: 16, padding: "20px 22px" }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{f.q}</div>
                <div style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.55, marginTop: 7 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #18181C", background: "#0a0a0c" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "34px 24px", display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aurarank-logo.png" alt="AuraRank" style={{ height: 22, width: "auto" }} />
          <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.14em", color: "#4b4b53" }}>{t("landing.footerTagline")}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 20, fontSize: 13, color: "#A1A1AA" }}>
            <Link href="/terms" style={{ color: "#A1A1AA" }}>{t("landing.footerTerms")}</Link>
            <Link href="/privacy" style={{ color: "#A1A1AA" }}>{t("landing.footerPrivacy")}</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
