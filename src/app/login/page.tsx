"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/hooks/useI18n";
import { LangToggle } from "@/components/ui/LangToggle";

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.701" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gisReady, setGisReady] = useState(false);

  // Sanitize redirect: only allow internal paths
  const rawRedirect = searchParams.get("redirect") ?? "";
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/feed";

  useEffect(() => {
    if (!CLIENT_ID || CLIENT_ID === "PASTE_YOUR_NEW_CLIENT_ID_HERE") return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGisReady(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleGoogle = () => {
    if (!gisReady || !window.google) {
      setError(t("auth.errorGis"));
      return;
    }
    setError("");
    setLoading(true);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "openid email profile",
      callback: async (resp) => {
        if (resp.error || !resp.access_token) {
          setLoading(false);
          setError(t("auth.errorCancelled"));
          return;
        }
        try {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: resp.access_token, lang: locale }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? t("auth.errorGeneric"));
          router.push(redirectTo);
        } catch (e) {
          setLoading(false);
          setError(e instanceof Error ? e.message : t("auth.errorGeneric"));
        }
      },
    });
    client.requestAccessToken();
  };

  const soon = (
    <span style={MONO} className="ml-auto text-[9px] tracking-wider border border-acid/30 text-acid/50 px-1.5 py-0.5 rounded">
      {t("auth.soon")}
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="flex items-center gap-3 mb-10">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aurarank-logo.png" alt="AuraRank" style={{ height: 30, width: "auto" }} />
        </Link>
        <LangToggle />
      </div>

      <div className="w-full max-w-sm bg-elevated border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-black tracking-tight text-foreground mb-1">{t("auth.signupHeading")}</h1>
        <p className="text-sm text-muted mb-7">{t("auth.signupSub")}</p>

        {error && (
          <p className="text-xs text-danger font-bold mb-4 p-3 bg-danger/10 rounded-lg border border-danger/20">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-sm font-bold text-foreground transition-all cursor-pointer",
              "hover:border-brand/40 hover:bg-background",
              loading && "opacity-60 cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 size={20} className="animate-spin text-muted shrink-0" /> : <GoogleIcon />}
            <span className="flex-1 text-center">{t("auth.googleBtn")}</span>
          </button>

          <div className="flex items-center gap-3 w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-sm font-bold text-foreground opacity-40 pointer-events-none select-none">
            <AppleIcon />
            <span className="flex-1 text-center">{t("auth.appleBtn")}</span>
            {soon}
          </div>

          <div className="flex items-center gap-3 w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-sm font-bold text-foreground opacity-40 pointer-events-none select-none">
            <XIcon />
            <span className="flex-1 text-center">{t("auth.xBtn")}</span>
            {soon}
          </div>
        </div>

        <p className="text-[11px] text-muted/50 text-center mt-6 leading-relaxed">
          {t("auth.termsNotice")}{" "}
          <Link href="/terms" className="underline hover:text-muted">{t("auth.termsLink")}</Link>
          {" "}{t("auth.and")}{" "}
          <Link href="/privacy" className="underline hover:text-muted">{t("auth.privacyLink")}</Link>.
        </p>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
