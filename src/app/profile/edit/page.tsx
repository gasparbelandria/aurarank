"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Globe,
  Building2,
  TreePine,
  Camera,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { COUNTRIES } from "@/lib/countries";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";
import { PrimaryActionButton } from "@/components/ui/PrimaryActionButton";

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

type GeoState = "idle" | "requesting" | "geocoding" | "done" | "denied" | "error";

interface ProfileData {
  bio?: string;
  country_code?: string;
  country_name?: string;
  city?: string;
  town?: string;
}

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export default function EditProfilePage() {
  const router = useRouter();

  useAuthGuard();
  const { user } = useCurrentUser();
  const { t } = useI18n();

  const [authChecked, setAuthChecked] = useState(false);
  const [geoState, setGeoState] = useState<GeoState>("idle");

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const displayAvatarUrl = uploadedAvatarUrl ?? user?.avatarUrl ?? null;

  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [town, setTown] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load existing profile
  useEffect(() => {
    (async () => {
      const profileRes = await fetch("/api/profile/update");
      if (profileRes.ok) {
        const data: ProfileData = await profileRes.json();
        if (data.country_code) setCountryCode(data.country_code);
        if (data.city) setCity(data.city);
        if (data.town) setTown(data.town);
        if (data.bio) setBio(data.bio);
      }
      setAuthChecked(true);
    })();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError(t("profileEdit.errorImageType"));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t("profileEdit.errorImageSize"));
      e.target.value = "";
      return;
    }

    setAvatarError("");
    setAvatarUploading(true);
    setAvatarImgError(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUploadedAvatarUrl(data.avatarUrl);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoState("error");
      return;
    }
    setGeoState("requesting");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoState("geocoding");
        try {
          const res = await fetch(
            `/api/geo/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          if (!res.ok) throw new Error();
          const data = await res.json();
          if (data.countryCode) setCountryCode(data.countryCode);
          if (data.city) setCity(data.city);
          if (data.town) setTown(data.town);
          setGeoState("done");
        } catch {
          setGeoState("error");
        }
      },
      (err) => {
        setGeoState(err.code === 1 ? "denied" : "error");
      },
      { timeout: 10_000 }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.trim() || null,
          countryCode: countryCode || null,
          countryName: selectedCountry?.name ?? null,
          city: city.trim() || null,
          town: town.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  const geoLabel = {
    idle: t("profileEdit.detectIdle"),
    requesting: t("profileEdit.detectRequesting"),
    geocoding: t("profileEdit.detectGeocoding"),
    done: t("profileEdit.detectDone"),
    denied: t("profileEdit.detectDenied"),
    error: t("profileEdit.detectError"),
  }[geoState];

  const geoIcon =
    geoState === "requesting" || geoState === "geocoding" ? (
      <Loader2 size={15} className="animate-spin" />
    ) : geoState === "done" ? (
      <CheckCircle2 size={15} className="text-acid" />
    ) : (
      <MapPin size={15} />
    );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <BottomNav />

      <main className="md:pl-60 min-h-screen pb-28 md:pb-8">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-black uppercase tracking-widest">{t("profileEdit.titleMobile")}</span>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="hidden md:inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft size={16} />
            {t("profileEdit.backLink")}
          </button>

          <h1 className="text-2xl font-black tracking-tight text-foreground mb-1">{t("profileEdit.heading")}</h1>
          <p className="text-sm text-muted mb-8">{t("profileEdit.sub")}</p>

          {error && (
            <p className="text-xs text-danger font-bold mb-6 p-3 bg-danger/10 rounded-lg border border-danger/20">
              {error}
            </p>
          )}

          {/* ── AVATAR SECTION ── */}
          <section className="bg-elevated border border-border rounded-2xl p-6 mb-4 flex flex-col items-center gap-3">
            <div className="relative">
              <div className="size-24 rounded-full overflow-hidden bg-brand/20 border-2 border-border flex items-center justify-center">
                {displayAvatarUrl && !avatarImgError ? (
                  <Image
                    src={displayAvatarUrl}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                    onError={() => setAvatarImgError(true)}
                  />
                ) : (
                  <span className="text-2xl font-black text-brand">
                    {(user?.displayName ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 size-8 bg-brand hover:bg-brand-light rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {avatarUploading ? (
                  <Loader2 size={14} className="animate-spin text-white" />
                ) : (
                  <Camera size={14} className="text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-muted uppercase tracking-wider">
                {avatarUploading ? t("profileEdit.avatarUploading") : t("profileEdit.avatarChange")}
              </p>
              <p className="text-[11px] text-muted/50 mt-0.5">{t("profileEdit.avatarFormats")}</p>
            </div>
            {avatarError && (
              <p className="text-xs text-danger font-bold">{avatarError}</p>
            )}
          </section>

          {/* ── LOCATION SECTION ── */}
          <section className="bg-elevated border border-border rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={16} className="text-brand-light" />
              <h2 className="text-xs font-black uppercase tracking-widest text-muted">{t("profileEdit.locationSection")}</h2>
            </div>

            <div
              className="flex items-center gap-1 flex-wrap mb-6 text-[10px] font-black uppercase tracking-widest"
              style={MONO}
            >
              {[t("rankings.tabGlobal"), t("profileEdit.countryLabel"), t("profileEdit.cityLabel"), t("profileEdit.townLabel").split(" /")[0], "Team"].map((tier, i, arr) => (
                <span key={tier} className="flex items-center gap-1">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded border",
                      i === 0
                        ? "border-brand/40 text-brand"
                        : i === 1
                          ? "border-brand-light/40 text-brand-light"
                          : i === 2
                            ? "border-acid/40 text-acid"
                            : "border-border text-muted"
                    )}
                  >
                    {tier}
                  </span>
                  {i < arr.length - 1 && <span className="text-muted/40">›</span>}
                </span>
              ))}
            </div>

            {/* Detect button */}
            <button
              onClick={handleDetectLocation}
              disabled={geoState === "requesting" || geoState === "geocoding"}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all mb-5 cursor-pointer",
                geoState === "done"
                  ? "border-acid/40 text-acid bg-acid/5"
                  : geoState === "denied" || geoState === "error"
                    ? "border-danger/30 text-danger/70 bg-danger/5"
                    : "border-border text-foreground hover:border-brand/40 hover:bg-surface bg-surface"
              )}
            >
              {geoIcon}
              {geoLabel}
            </button>

            {/* Country */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted mb-2">
                <Globe size={12} />
                {t("profileEdit.countryLabel")}
              </label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border focus:border-brand text-sm font-bold text-foreground outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">{t("profileEdit.countryPlaceholder")}</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted mb-2">
                <Building2 size={12} />
                {t("profileEdit.cityLabel")}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("profileEdit.cityPlaceholder")}
                maxLength={100}
                className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border focus:border-brand text-sm font-bold text-foreground placeholder:text-muted/40 outline-none transition-all"
              />
            </div>

            {/* Town / Neighborhood */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted mb-2">
                <TreePine size={12} />
                {t("profileEdit.townLabel")}
                <span className="text-muted/40 normal-case font-bold tracking-normal ml-1">
                  {t("profileEdit.townOptional")}
                </span>
              </label>
              <input
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                placeholder={t("profileEdit.townPlaceholder")}
                maxLength={100}
                className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border focus:border-brand text-sm font-bold text-foreground placeholder:text-muted/40 outline-none transition-all"
              />
            </div>
          </section>

          {/* ── BIO SECTION ── */}
          <section className="bg-elevated border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted">{t("profileEdit.bioSection")}</h2>
              <span className="text-xs text-muted/50" style={MONO}>
                {bio.length}/160
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("profileEdit.bioPlaceholder")}
              maxLength={160}
              rows={3}
              className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border focus:border-brand text-sm font-bold text-foreground placeholder:text-muted/40 outline-none transition-all resize-none"
            />
          </section>

          {/* Save */}
          <PrimaryActionButton
            onClick={handleSave}
            loading={saving}
            loadingLabel={t("profileEdit.savingBtn")}
            success={saved}
            successLabel={t("profileEdit.savedBtn")}
          >
            {t("profileEdit.saveBtn")}
          </PrimaryActionButton>

          {/* ── DANGER ZONE ── */}
          <section className="mt-8 bg-danger/5 border border-danger/20 rounded-2xl p-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-danger mb-1">Danger Zone</h2>
            <p className="text-sm text-muted mb-4">
              Permanently delete your account, all posts, ratings, and media. This cannot be undone.
            </p>
            <Link
              href="/account/delete"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-danger/40 text-danger hover:bg-danger/10 text-sm font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              <Trash2 size={14} />
              Delete my account
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
