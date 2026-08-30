"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const r = await fetch("/api/auth/verify");
      if (!r.ok) router.replace("/");
    };

    // Check on mount
    verify();

    // Check when browser restores page from bfcache (back/forward navigation)
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) verify();
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);
}
