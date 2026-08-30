"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Plus, Users, MapPin, Loader2, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/cn";
import type { Group } from "@/lib/types";

const COUNTRIES = [
  { code: "AR", name: "Argentina" }, { code: "US", name: "United States" },
  { code: "MX", name: "Mexico" }, { code: "ES", name: "Spain" },
  { code: "BR", name: "Brazil" }, { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" }, { code: "PE", name: "Peru" },
  { code: "GB", name: "United Kingdom" }, { code: "FR", name: "France" },
  { code: "DE", name: "Germany" }, { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" }, { code: "KR", name: "South Korea" },
  { code: "AU", name: "Australia" }, { code: "CA", name: "Canada" },
];

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (slug: string) => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: desc.trim() || undefined, countryCode: countryCode || undefined, countryName: countryName || undefined, city: city.trim() || undefined }),
    }).catch(() => null);
    setLoading(false);
    if (!res?.ok) { setError("Something went wrong."); return; }
    const data = await res.json();
    onCreated(data.slug);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-elevated border border-border rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-black uppercase tracking-widest">{t("groups.createTitle")}</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground cursor-pointer"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1.5">{t("groups.nameLabel")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("groups.namePlaceholder")}
              maxLength={60}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-brand text-foreground placeholder:text-muted"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1.5">{t("groups.descLabel")}</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t("groups.descPlaceholder")}
              rows={2}
              maxLength={280}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-brand text-foreground placeholder:text-muted resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1.5">{t("groups.countryLabel")}</label>
            <select
              value={countryCode}
              onChange={(e) => {
                const opt = COUNTRIES.find((c) => c.code === e.target.value);
                setCountryCode(e.target.value);
                setCountryName(opt?.name ?? "");
              }}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-brand text-foreground cursor-pointer"
            >
              <option value="">—</option>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1.5">{t("groups.cityLabel")}</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("groups.cityPlaceholder")}
              maxLength={80}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-brand text-foreground placeholder:text-muted"
            />
          </div>

          {error && <p className="text-xs text-danger font-bold">{error}</p>}

          <button
            onClick={submit}
            disabled={loading || !name.trim()}
            className="w-full py-3 bg-brand hover:bg-brand-light text-white font-black text-sm uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? t("groups.creatingBtn") : t("groups.createSubmitBtn")}
          </button>
        </div>
      </m.div>
    </div>
  );
}

export default function GroupsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.ok ? r.json() : [])
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <BottomNav />

      <main className="md:pl-60 min-h-screen pb-24 md:pb-8">
        <div className="md:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-widest">{t("groups.title")}</span>
          <button onClick={() => setShowCreate(true)} className="text-brand cursor-pointer">
            <Plus size={20} />
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black uppercase tracking-widest">{t("groups.title")}</h1>
              <p className="text-xs text-muted font-bold mt-0.5">{t("groups.sub")}</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-light text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} />
              {t("groups.createBtn")}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-muted" /></div>
          ) : groups.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="mx-auto mb-4 text-muted/40" />
              <p className="text-sm text-muted font-bold">{t("groups.noGroups")}</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 px-4 py-2 bg-brand text-white font-black text-xs uppercase tracking-wider rounded-lg cursor-pointer"
              >
                {t("groups.createBtn")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <m.div key={group.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Link href={`/groups/${group.slug}`}>
                    <div className="p-4 rounded-xl border border-border bg-elevated hover:border-brand/40 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-foreground text-sm">{group.name}</h3>
                            {group.myRole === "owner" && (
                              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-brand/20 text-brand rounded">
                                {t("groups.ownerBadge")}
                              </span>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-xs text-muted mt-1 line-clamp-1">{group.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted font-bold">
                            <span className="flex items-center gap-1">
                              <Users size={10} />
                              {group.memberCount}
                            </span>
                            {(group.city || group.countryName) && (
                              <span className="flex items-center gap-1">
                                <MapPin size={10} />
                                {[group.city, group.countryName].filter(Boolean).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </m.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(slug) => router.push(`/groups/${slug}`)}
        />
      )}
    </div>
  );
}
