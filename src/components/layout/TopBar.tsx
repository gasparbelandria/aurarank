"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { NotificationBell } from "@/components/layout/NotificationPanel";

interface TopBarProps {
  title?: string;
  showLogo?: boolean;
}

export function TopBar({ title, showLogo = false }: TopBarProps) {
  const { user } = useCurrentUser();
  const [avatarErr, setAvatarErr] = useState(false);
  useEffect(() => { setAvatarErr(false); }, [user?.avatarUrl]);

  const profileHref = user?.username ? `/@${user.username}` : "/setup";

  return (
    <header className="md:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
      {showLogo ? (
        <Link href="/" className="inline-flex items-center">
          <Image src="/aurarank-logo.png" alt="AuraRank" width={120} height={28} style={{ height: 28, width: "auto" }} priority />
        </Link>
      ) : (
        <h1 className="text-base font-black uppercase tracking-widest text-foreground">
          {title}
        </h1>
      )}
      <div className="flex items-center gap-3">
        <NotificationBell />
        {user && (
          <Link href={profileHref}>
            {user.avatarUrl && !avatarErr ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                width={28}
                height={28}
                className="size-7 rounded-full object-cover ring-2 ring-brand/40 ring-offset-1 ring-offset-surface"
                unoptimized
                onError={() => setAvatarErr(true)}
              />
            ) : (
              <div className="size-7 rounded-full bg-brand/20 flex items-center justify-center text-xs font-black text-brand">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
