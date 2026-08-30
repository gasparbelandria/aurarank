"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Trophy, PlusCircle, User, LogOut, HelpCircle, Images } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";
import { LangToggle } from "@/components/ui/LangToggle";
import { NotificationBell } from "@/components/layout/NotificationPanel";

const NAV_ITEMS = [
  { href: "/feed", icon: Home, labelKey: "nav.feed" },
  { href: "/my-posts", icon: Images, labelKey: "nav.myPosts" },
  { href: "/rankings", icon: Trophy, labelKey: "nav.rankings" },
  { href: "/help", icon: HelpCircle, labelKey: "nav.help" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const { t } = useI18n();
  const [avatarErr, setAvatarErr] = useState(false);

  useEffect(() => { setAvatarErr(false); }, [user?.avatarUrl]);

  const profileHref = user?.username ? `/@${user.username}` : "/setup";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const allNavItems = [
    ...NAV_ITEMS
      .filter((item) => item.href !== "/rankings" || (user?.totalUsers ?? 0) > 3)
      .map((item) => ({ ...item, label: t(item.labelKey) })),
    { href: profileHref, icon: User, label: t("nav.profile") },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col bg-surface border-r border-border z-40">
      {/* Logo + notifications */}
      <div className="px-6 py-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-baseline gap-0.5">
          <span className="text-2xl font-black text-brand">AURA</span>
          <span className="text-2xl font-black text-acid">RANK</span>
        </Link>
        <NotificationBell large />
      </div>

      {/* Create button */}
      <div className="px-4 pb-4">
        <Link
          href="/create"
          className="flex items-center justify-center gap-2 w-full py-3 bg-brand hover:bg-brand-light text-white font-black uppercase tracking-wider rounded-lg transition-all text-sm shadow-[0_0_16px_rgba(139,92,246,0.3)]"
        >
          <PlusCircle size={16} strokeWidth={2.5} />
          {t("nav.createPost")}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3">
        {allNavItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href ||
            (href !== "/feed" && !href.includes("?") && pathname.startsWith(href));

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors font-bold text-sm uppercase tracking-wide",
                isActive
                  ? "bg-brand/10 text-brand-light border border-brand/20"
                  : "text-muted hover:text-foreground hover:bg-elevated"
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-4 border-t border-border">
        {loading ? (
          <div className="flex items-center gap-3 mb-3 animate-pulse">
            <div className="size-8 rounded-full bg-elevated shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-24 bg-elevated rounded" />
              <div className="h-2 w-16 bg-elevated rounded" />
            </div>
          </div>
        ) : user ? (
          <Link
            href={profileHref}
            className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity"
          >
            {user.avatarUrl && !avatarErr ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                width={32}
                height={32}
                className="size-8 rounded-full object-cover ring-2 ring-brand/40 ring-offset-1 ring-offset-surface shrink-0"
                unoptimized
                onError={() => setAvatarErr(true)}
              />
            ) : (
              <div className="size-8 rounded-full bg-brand/20 flex items-center justify-center shrink-0 text-xs font-black text-brand">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-foreground truncate">
                {user.username ? `@${user.username}` : user.displayName}
              </p>
              <p className="text-[10px] text-muted font-bold truncate">{user.displayName}</p>
            </div>
          </Link>
        ) : null}

        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-muted hover:text-danger transition-colors font-bold uppercase tracking-wider cursor-pointer"
          >
            <LogOut size={13} />
            {t("nav.logout")}
          </button>
          <LangToggle variant="text" />
        </div>
      </div>
    </aside>
  );
}
