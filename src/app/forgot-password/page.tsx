import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sign In Help",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-baseline gap-0.5 mb-10">
        <span className="text-2xl font-black text-brand">AURA</span>
        <span className="text-2xl font-black text-acid">RANK</span>
      </Link>

      <div className="w-full max-w-sm bg-elevated border border-border rounded-2xl p-8 text-center">
        <span className="text-5xl mb-4 block">🔑</span>
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground mb-3">
          No Password Needed
        </h1>
        <p className="text-sm text-muted mb-2">
          AuraRank uses <span className="text-foreground font-bold">Google Sign-In</span> exclusively.
        </p>
        <p className="text-sm text-muted mb-8">
          There is no password to reset. Just tap the Google button on the login page and you&apos;re in.
        </p>
        <Link href="/login">
          <Button variant="primary" size="lg" className="w-full cursor-pointer">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
