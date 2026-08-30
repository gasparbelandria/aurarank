"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2, Skull } from "lucide-react";
import { cn } from "@/lib/cn";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type Step = "email" | "confirm" | "countdown" | "deleting";

const COUNTDOWN_SECONDS = 10;

export default function DeleteAccountPage() {
  const router = useRouter();
  useAuthGuard();

  const [step, setStep] = useState<Step>("email");
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [deleteError, setDeleteError] = useState("");

  const cancelledRef = useRef(false);

  // Kick off deletion when countdown hits 0
  const handleDelete = useCallback(async () => {
    setStep("deleting");
    try {
      await fetch("/api/account/delete", { method: "DELETE" });
    } finally {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (step !== "countdown") return;
    cancelledRef.current = false;

    if (countdown === 0) {
      handleDelete();
      return;
    }

    const timer = setTimeout(() => {
      if (!cancelledRef.current) setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [step, countdown, handleDelete]);

  const handleEmailSubmit = async () => {
    setEmailError("");
    const trimmed = emailInput.trim().toLowerCase();

    if (!trimmed) {
      setEmailError("Enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "email_mismatch") {
          setEmailError("That email doesn't match our records. Use the email you signed up with.");
        } else {
          setEmailError("Something went wrong. Try again.");
        }
        return;
      }

      setStep("confirm");
    } catch {
      setEmailError("Network error. Check your connection and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmYes = () => {
    setCountdown(COUNTDOWN_SECONDS);
    cancelledRef.current = false;
    setStep("countdown");
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    router.push("/feed");
  };

  // ── STEP: EMAIL ─────────────────────────────────────────────────────────────
  if (step === "email") {
    return (
      <PageShell>
        <div className="max-w-md mx-auto px-4 py-8">
          <BackButton onClick={() => router.back()} />

          <div className="flex items-center gap-3 mb-2 mt-6">
            <AlertTriangle size={20} className="text-danger shrink-0" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Delete Account</h1>
          </div>
          <p className="text-sm text-muted mb-8">
            This will permanently erase your profile, all posts, ratings, followers, and media. There is no undo.
          </p>

          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 mb-6">
            <p className="text-xs font-bold text-danger uppercase tracking-widest mb-2">What gets deleted</p>
            <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
              <li>Your profile and username</li>
              <li>All posts and uploaded media</li>
              <li>All ratings you gave and received</li>
              <li>Your aura score and rank history</li>
              <li>All follow relationships</li>
              <li>Groups you own (and their members)</li>
            </ul>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2">
              Confirm your email to continue
            </label>
            <input
              type="email"
              autoComplete="email"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
              placeholder="your@email.com"
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-surface border text-sm font-bold text-foreground placeholder:text-muted/40 outline-none transition-all",
                emailError ? "border-danger" : "border-border focus:border-danger/60"
              )}
            />
            {emailError && (
              <p className="text-xs text-danger font-bold mt-2">{emailError}</p>
            )}
          </div>

          <button
            onClick={handleEmailSubmit}
            disabled={verifying}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-danger hover:bg-danger/90 text-white text-sm font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verifying ? <Loader2 size={16} className="animate-spin" /> : null}
            {verifying ? "Verifying..." : "Continue"}
          </button>
        </div>
      </PageShell>
    );
  }

  // ── STEP: CONFIRM ────────────────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <PageShell>
        <div className="max-w-md mx-auto px-4 py-8">
          <BackButton onClick={() => setStep("email")} />

          <div className="mt-6 mb-8 text-center">
            <div className="size-16 rounded-2xl bg-danger/15 border border-danger/30 flex items-center justify-center mx-auto mb-4">
              <Skull size={28} className="text-danger" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
              Are you sure?
            </h1>
            <p className="text-sm text-muted">
              Your account will be <span className="text-danger font-bold">permanently deleted</span>. This cannot be undone.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleConfirmYes}
              className="w-full py-3.5 rounded-xl bg-danger hover:bg-danger/90 text-white text-sm font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Yes, delete my account
            </button>
            <button
              onClick={handleCancel}
              className="w-full py-3.5 rounded-xl bg-elevated border border-border hover:border-brand/40 text-foreground text-sm font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              No, keep my account
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── STEP: COUNTDOWN ──────────────────────────────────────────────────────────
  if (step === "countdown") {
    const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;
    const circumference = 2 * Math.PI * 44;
    const dashOffset = circumference * (1 - (COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS);

    return (
      <PageShell>
        <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center text-center">
          <div className="mt-10 mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">AuraRank</p>
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-3">
              Your aura fades...
            </h1>
            <p className="text-sm text-muted max-w-xs mx-auto">
              All your posts, scores, and data are about to be erased permanently. Press cancel to stay.
            </p>
          </div>

          {/* Countdown ring */}
          <div className="relative size-36 mb-8">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-border"
              />
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="text-danger transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-5xl font-black text-danger"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {countdown}
              </span>
            </div>
          </div>

          {deleteError && (
            <p className="text-xs text-danger font-bold mb-4">{deleteError}</p>
          )}

          <button
            onClick={handleCancel}
            className="w-full max-w-xs py-3.5 rounded-xl bg-elevated border border-border hover:border-acid/40 hover:text-acid text-foreground text-sm font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Cancel — Keep my account
          </button>
        </div>
      </PageShell>
    );
  }

  // ── STEP: DELETING ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 size={32} className="animate-spin text-muted mx-auto" />
        <p className="text-sm text-muted font-bold uppercase tracking-widest">Deleting account...</p>
      </div>
    </div>
  );
}

// ── Shared layout wrapper ────────────────────────────────────────────────────
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <BottomNav />
      <main className="md:pl-60 min-h-screen pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
    >
      <ArrowLeft size={15} />
      Back
    </button>
  );
}
