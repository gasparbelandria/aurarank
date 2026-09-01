"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, PlusCircle, HelpCircle, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { t } = useI18n();
  const profileHref = user?.username ? `/@${user.username}` : "/setup";

  const NAV_ITEMS = [
    { href: "/feed",     icon: Home,        label: t("nav.feed") },
    { href: "/my-posts", icon: Images,      label: t("nav.myPosts") },
    { href: "/create",   icon: PlusCircle,  label: t("nav.post"), isCreate: true },
    { href: "/help",     icon: HelpCircle,  label: t("nav.help") },
    { href: profileHref, icon: User,        label: t("nav.profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {NAV_ITEMS.map(({ href, icon: Icon, label, isCreate }) => {
          const isActive = pathname === href || pathname.startsWith(href.split("?")[0]);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[44px] min-h-[44px] justify-center",
                isCreate && "text-brand",
                !isCreate && isActive && "text-acid",
                !isCreate && !isActive && "text-muted hover:text-foreground"
              )}
            >
              <Icon
                size={isCreate ? 28 : 22}
                strokeWidth={isCreate ? 1.5 : isActive ? 2.5 : 1.5}
              />
              <span
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  isCreate ? "text-brand" : isActive ? "text-acid" : "text-muted"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
