"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Loader2, MapPin, Users, ArrowLeft, Send } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/cn";
import type { GroupMember } from "@/lib/types";

interface GroupDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  ownerId: string;
  memberCount: number;
  createdAt: string;
  myRole: "owner" | "member" | null;
  members: GroupMember[];
}

function MemberRow({ member }: { member: GroupMember }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3 py-2.5">
      {member.avatarUrl ? (
        <Image src={member.avatarUrl} alt={member.displayName} width={32} height={32} className="size-8 rounded-full object-cover shrink-0" unoptimized />
      ) : (
        <div className="size-8 rounded-full bg-brand/20 flex items-center justify-center shrink-0 text-xs font-black text-brand">
          {member.displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {member.username ? (
          <Link href={`/@${member.username}`} className="text-sm font-black text-foreground hover:text-brand transition-colors">
            @{member.username}
          </Link>
        ) : (
          <span className="text-sm font-black text-foreground">{member.displayName}</span>
        )}
      </div>
      <span className={cn(
        "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
        member.role === "owner" ? "bg-brand/20 text-brand" : "bg-elevated text-muted"
      )}>
        {member.role === "owner" ? t("groups.ownerBadge") : t("groups.memberBadge")}
      </span>
    </div>
  );
}

export default function GroupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t } = useI18n();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "sent" | "notFound" | "already">("idle");

  useEffect(() => {
    fetch(`/api/groups/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFoundFlag(true); return null; }
        return r.json();
      })
      .then((data) => { if (data && !data.error) setGroup(data); })
      .catch(() => setNotFoundFlag(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const sendInvite = async () => {
    if (!inviteUsername.trim()) return;
    setInviteStatus("loading");
    const res = await fetch(`/api/groups/${slug}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: inviteUsername.trim().replace(/^@/, "") }),
    }).catch(() => null);

    if (!res) { setInviteStatus("idle"); return; }
    if (res.status === 404) { setInviteStatus("notFound"); return; }
    if (res.status === 409) { setInviteStatus("already"); return; }
    if (res.ok) {
      setInviteStatus("sent");
      setInviteUsername("");
      setTimeout(() => setInviteStatus("idle"), 2500);
    } else {
      setInviteStatus("idle");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-muted" />
    </div>
  );

  if (notFoundFlag || !group) return notFound();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <BottomNav />

      <main className="md:pl-60 min-h-screen pb-24 md:pb-8">
        <div className="md:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <Link href="/groups" className="text-muted hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft size={18} />
          </Link>
          <span className="text-sm font-black uppercase tracking-widest">{group.name}</span>
          <div className="w-5" />
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Header */}
            <div className="hidden md:flex items-center gap-2 mb-6 text-muted text-sm">
              <Link href="/groups" className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5">
                <ArrowLeft size={14} />
                {t("groups.title")}
              </Link>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-elevated mb-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-xl font-black text-foreground">{group.name}</h1>
                {group.myRole === "owner" && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-brand/20 text-brand rounded shrink-0">
                    {t("groups.ownerBadge")}
                  </span>
                )}
              </div>
              {group.description && (
                <p className="text-sm text-muted mb-3">{group.description}</p>
              )}
              <div className="flex items-center gap-4 text-[10px] text-muted font-bold">
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {group.memberCount} members
                </span>
                {(group.city || group.countryName) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {[group.city, group.countryName].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Invite form — owner only */}
            {group.myRole === "owner" && (
              <div className="p-4 rounded-xl border border-border bg-surface mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">{t("groups.inviteHeading")}</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-bold">@</span>
                    <input
                      value={inviteUsername}
                      onChange={(e) => { setInviteUsername(e.target.value); setInviteStatus("idle"); }}
                      onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                      placeholder={t("groups.invitePlaceholder")}
                      className="w-full pl-7 pr-3 py-2.5 bg-elevated border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-brand text-foreground placeholder:text-muted"
                    />
                  </div>
                  <button
                    onClick={sendInvite}
                    disabled={inviteStatus === "loading" || !inviteUsername.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-light text-white font-black text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send size={12} />
                    {inviteStatus === "loading" ? t("groups.invitingBtn") : t("groups.inviteBtn")}
                  </button>
                </div>
                {inviteStatus === "sent" && <p className="text-xs text-acid font-bold mt-2">{t("groups.inviteSent")}</p>}
                {inviteStatus === "notFound" && <p className="text-xs text-danger font-bold mt-2">{t("groups.inviteNotFound")}</p>}
                {inviteStatus === "already" && <p className="text-xs text-muted font-bold mt-2">{t("groups.inviteAlready")}</p>}
              </div>
            )}

            {/* Members */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">{t("groups.membersHeading")}</p>
              <div className="divide-y divide-border rounded-xl border border-border bg-elevated overflow-hidden px-4">
                {group.members.map((m) => (
                  <MemberRow key={m.userId} member={m} />
                ))}
              </div>
            </div>
          </m.div>
        </div>
      </main>
    </div>
  );
}
