"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, PlayCircle, Video, X,
  Check, Loader2,
  Square, RectangleVertical, RectangleHorizontal,
  Play, AlertCircle,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PrimaryActionButton } from "@/components/ui/PrimaryActionButton";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { POST_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/hooks/useToast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/cn";
import type { PostCategory, AspectRatio } from "@/lib/types";

type MediaMode = "photo" | "video" | "youtube";

const MEDIA_TABS: { mode: MediaMode; icon: typeof Upload; labelKey: string }[] = [
  { mode: "photo", icon: Upload, labelKey: "create.tabPhoto" },
  { mode: "video", icon: Video, labelKey: "create.tabVideo" },
  { mode: "youtube", icon: PlayCircle, labelKey: "create.tabYouTube" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

// ─── YouTube IFrame API (minimal types) ──────────────────────────────────────
declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayerInstance;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
  interface YTPlayerInstance {
    getDuration(): number;
    getCurrentTime(): number;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    playVideo(): void;
    pauseVideo(): void;
    mute(): void;
    unMute(): void;
    destroy(): void;
  }
  interface YTPlayerOptions {
    videoId: string;
    playerVars?: Record<string, number | string>;
    events?: {
      onReady?: (e: { target: YTPlayerInstance }) => void;
      onError?: () => void;
      onStateChange?: (e: { data: number }) => void;
    };
  }
}

function parseYoutubeUrl(url: string): { id: string; isShort: boolean } | null {
  const raw = url.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.replace("/shorts/", "").split("/")[0];
      if (id) return { id, isShort: true };
    }
    if (u.hostname.includes("youtube.com") && u.searchParams.has("v")) {
      return { id: u.searchParams.get("v")!, isShort: false };
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0];
      if (id) return { id, isShort: false };
    }
    return null;
  } catch { return null; }
}

function formatTime(secs: number): string {
  const s = Math.floor(secs);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ─── TimeRangeSlider ─────────────────────────────────────────────────────────
function TimeRangeSlider({
  duration, startSec, endSec, onChange,
}: {
  duration: number;
  startSec: number;
  endSec: number;
  onChange: (start: number, end: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"start" | "end" | null>(null);
  const stateRef = useRef({ startSec, endSec, duration });
  stateRef.current = { startSec, endSec, duration };

  useEffect(() => {
    const clientXToSec = (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(pct * stateRef.current.duration);
    };
    const onMove = (clientX: number) => {
      if (!dragging.current) return;
      const val = clientXToSec(clientX);
      const { startSec: s, endSec: e, duration: d } = stateRef.current;
      if (dragging.current === "start") onChange(Math.max(0, Math.min(val, e - 1)), e);
      else onChange(s, Math.min(d, Math.max(val, s + 1)));
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) { e.preventDefault(); onMove(e.touches[0].clientX); }
    };
    const onUp = () => { dragging.current = null; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [onChange]);

  const startPct = duration > 0 ? (startSec / duration) * 100 : 0;
  const endPct = duration > 0 ? (endSec / duration) * 100 : 100;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-muted">Clip range</span>
        <span className="text-[11px] font-black text-brand">{formatTime(endSec - startSec)} selected</span>
      </div>
      <div className="relative py-7 px-2">
        <div ref={trackRef} className="relative h-1.5 bg-border rounded-full">
          <div
            className="absolute h-full bg-brand rounded-full pointer-events-none"
            style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
          />
          {/* Start thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-brand shadow-md cursor-grab active:cursor-grabbing z-10 select-none"
            style={{ left: `${startPct}%` }}
            onMouseDown={(e) => { dragging.current = "start"; e.preventDefault(); }}
            onTouchStart={() => { dragging.current = "start"; }}
          >
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono font-black text-foreground bg-elevated border border-border px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm pointer-events-none">
              {formatTime(startSec)}
            </span>
          </div>
          {/* End thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-brand shadow-md cursor-grab active:cursor-grabbing z-10 select-none"
            style={{ left: `${endPct}%` }}
            onMouseDown={(e) => { dragging.current = "end"; e.preventDefault(); }}
            onTouchStart={() => { dragging.current = "end"; }}
          >
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono font-black text-foreground bg-elevated border border-border px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm pointer-events-none">
              {formatTime(endSec)}
            </span>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-mono text-muted">0:00</span>
          <span className="text-[10px] font-mono text-muted">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

const RATIO_CONFIG: Record<AspectRatio, {
  outputW: number;
  outputH: number;
  containerClass: string;
  Icon: typeof Square;
  label: string;
}> = {
  "1:1":  { outputW: 1080, outputH: 1080, containerClass: "w-full aspect-square",                        Icon: Square,               label: "1:1"  },
  "9:16": { outputW: 1080, outputH: 1920, containerClass: "max-w-[280px] w-full mx-auto aspect-[9/16]", Icon: RectangleVertical,    label: "9:16" },
  "16:9": { outputW: 1920, outputH: 1080, containerClass: "w-full aspect-video",                        Icon: RectangleHorizontal,  label: "16:9" },
};

// ─── ImageCropper ────────────────────────────────────────────────────────────

// Maps each ratio to the multiplier: cH = cW * RATIO_H_MULT[ratio].
// CSS aspect-ratio height is computed lazily by the browser, so reading
// getBoundingClientRect().height is unreliable — derive cH from cW instead.
const RATIO_H_MULT: Record<AspectRatio, number> = { "1:1": 1, "9:16": 16 / 9, "16:9": 9 / 16 };

interface CropState { scale: number; x: number; y: number; nW: number; nH: number }
interface ImageCropperHandle { apply: () => void }

const ImageCropper = forwardRef<ImageCropperHandle, {
  src: string;
  onApply: (blob: Blob, url: string, ratio: AspectRatio) => void;
  onCancel: () => void;
}>(function ImageCropper({ src, onApply, onCancel }, ref) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cv = useRef<CropState>({ scale: 1, x: 0, y: 0, nW: 0, nH: 0 });
  const dragging = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });

  const [ratio, setRatio] = useState<AspectRatio>("1:1");
  const ratioRef = useRef<AspectRatio>("1:1");
  ratioRef.current = ratio; // always current — safe to read inside stable callbacks
  const [disp, setDisp] = useState({ scale: 1, x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  const commit = useCallback((next: CropState) => {
    cv.current = next;
    setDisp({ scale: next.scale, x: next.x, y: next.y });
  }, []);

  // Clamp drag position so the image never reveals a gap inside the frame
  const clampPos = useCallback((x: number, y: number) => {
    const el = containerRef.current;
    if (!el) return { x, y };
    const { width: cW } = el.getBoundingClientRect();
    const cH = cW * RATIO_H_MULT[ratioRef.current];
    const { scale, nW, nH } = cv.current;
    const iW = nW * scale;
    const iH = nH * scale;
    return {
      x: iW <= cW ? (cW - iW) / 2 : Math.min(0, Math.max(cW - iW, x)),
      y: iH <= cH ? (cH - iH) / 2 : Math.min(0, Math.max(cH - iH, y)),
    };
  }, []);

  // First load: cover-scale. Ratio change: preserve scale, re-center.
  const initCrop = useCallback((currentRatio: AspectRatio) => {
    const img = imgRef.current;
    const el = containerRef.current;
    if (!img?.complete || !img.naturalWidth || !el) return;
    const { width: cW } = el.getBoundingClientRect();
    if (!cW) return;
    // Compute cH from cW — CSS aspect-ratio height is resolved lazily and
    // getBoundingClientRect().height may be stale even inside useLayoutEffect.
    const cH = cW * RATIO_H_MULT[currentRatio];
    const nW = img.naturalWidth;
    const nH = img.naturalHeight;
    const minScale = Math.max(cW / nW, cH / nH); // minimum to fully cover the frame
    const scale = cv.current.nW > 0
      ? Math.max(cv.current.scale, minScale) // ratio changed: keep scale but never below cover
      : minScale; // first load: cover
    const iW = nW * scale;
    const iH = nH * scale;
    commit({ scale, x: (cW - iW) / 2, y: (cH - iH) / 2, nW, nH });
    setReady(true);
  }, [commit]);

  // Auto-detect closest ratio on image load
  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img?.naturalWidth) return;
    const nat = img.naturalWidth / img.naturalHeight;
    const options: Array<[AspectRatio, number]> = [
      ["1:1", 1], ["9:16", 9 / 16], ["16:9", 16 / 9],
    ];
    const best = options.reduce((a, b) =>
      Math.abs(b[1] - nat) < Math.abs(a[1] - nat) ? b : a
    );
    if (best[0] === ratio) {
      initCrop(ratio); // no re-render needed; call directly
    } else {
      setRatio(best[0]); // triggers re-render → useLayoutEffect → initCrop
    }
  }, [ratio, initCrop]);

  useLayoutEffect(() => {
    setReady(false);
    initCrop(ratio);
  }, [ratio, initCrop]);

  // Non-passive touchmove so we can preventDefault and prevent page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current || e.touches.length !== 1) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - lastPt.current.x;
      const dy = e.touches[0].clientY - lastPt.current.y;
      lastPt.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const { x, y } = cv.current;
      commit({ ...cv.current, ...clampPos(x + dx, y + dy) });
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [clampPos, commit]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    lastPt.current = { x: e.clientX, y: e.clientY };
    const { x, y } = cv.current;
    commit({ ...cv.current, ...clampPos(x + dx, y + dy) });
  };
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPt.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  // Apply: crop from actual rendered position of the img element
  const handleApply = useCallback(() => {
    const img = imgRef.current;
    const el = containerRef.current;
    if (!img || !el) return;

    // Measure actual rendered positions — more reliable than cv.current which
    // may not have been flushed to the DOM yet when called imperatively.
    const containerRect = el.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const cW = containerRect.width;
    const cH = cW * RATIO_H_MULT[ratio]; // computed, not measured (aspect-ratio height)

    // CSS pixels per natural pixel
    const cssScale = imgRect.width / img.naturalWidth;
    if (!cssScale) return;

    // Where the img's top-left sits relative to the container top-left (CSS px)
    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;

    // Source region in natural pixels
    const srcX = -imgLeft / cssScale;
    const srcY = -imgTop / cssScale;
    const srcW = cW / cssScale;
    const srcH = cH / cssScale;

    const { outputW, outputH } = RATIO_CONFIG[ratio];
    const canvas = document.createElement("canvas");
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext("2d")!;

    // Clamp source rect to valid image bounds — prevents black bars when the
    // image is narrower/shorter than the crop frame (e.g. portrait in 16:9).
    const clSrcX = Math.max(0, srcX);
    const clSrcY = Math.max(0, srcY);
    const clSrcW = Math.min(srcW, img.naturalWidth - clSrcX);
    const clSrcH = Math.min(srcH, img.naturalHeight - clSrcY);
    const scaleX = outputW / srcW;
    const scaleY = outputH / srcH;
    ctx.drawImage(
      img,
      clSrcX, clSrcY, clSrcW, clSrcH,
      (clSrcX - srcX) * scaleX, (clSrcY - srcY) * scaleY,
      clSrcW * scaleX, clSrcH * scaleY,
    );
    canvas.toBlob(
      (blob) => { if (blob) onApply(blob, URL.createObjectURL(blob), ratio); },
      "image/jpeg",
      0.92,
    );
  }, [ratio, onApply]);

  useImperativeHandle(ref, () => ({ apply: handleApply }), [handleApply]);

  const { containerClass } = RATIO_CONFIG[ratio];

  return (
    <div className="space-y-3">

      {/* Crop canvas — drag to reposition */}
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-xl border border-brand/30 bg-black select-none cursor-grab active:cursor-grabbing",
          containerClass,
        )}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={() => { dragging.current = false; }}
        onMouseLeave={() => { dragging.current = false; }}
        onTouchStart={onTouchStart}
        onTouchEnd={() => { dragging.current = false; }}
      >
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-elevated">
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt=""
          onLoad={handleImageLoad}
          draggable={false}
          style={{
            position: "absolute",
            left: disp.x,
            top: disp.y,
            width: cv.current.nW * disp.scale,
            height: cv.current.nH * disp.scale,
            maxWidth: "none",   // override Tailwind Preflight: img { max-width: 100% }
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        {ready && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-white/60 rounded-tl-sm" />
            <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-white/60 rounded-tr-sm" />
            <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-white/60 rounded-bl-sm" />
            <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-white/60 rounded-br-sm" />
          </div>
        )}

        {/* Ratio selector — overlaid at the bottom of the frame */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 flex"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {(Object.entries(RATIO_CONFIG) as [AspectRatio, typeof RATIO_CONFIG["1:1"]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setRatio(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                ratio === key
                  ? "bg-brand text-white"
                  : "bg-black/50 text-white/60 hover:bg-black/70 hover:text-white backdrop-blur-sm"
              )}
            >
              <cfg.Icon size={12} />
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-border text-muted font-black text-xs uppercase tracking-wider rounded-xl hover:border-brand/40 hover:text-foreground transition-colors cursor-pointer"
        >
          {t("create.cropChangeBtn")}
        </button>
        <button
          onClick={handleApply}
          disabled={!ready}
          className="flex-1 py-2.5 bg-brand hover:bg-brand-light text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          <Check size={14} />
          {t("create.cropApplyBtn")}
        </button>
      </div>
    </div>
  );
});

// ─── CreatePage ───────────────────────────────────────────────────────────────

export default function CreatePage() {
  useAuthGuard();
  const router = useRouter();
  const { addToast } = useToast();
  const { t } = useI18n();

  const [mode, setMode] = useState<MediaMode>("photo");

  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedRatio, setCroppedRatio] = useState<AspectRatio>("1:1");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<ImageCropperHandle>(null);
  const pendingPublishRef = useRef(false);

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [parsedVideo, setParsedVideo] = useState<{ id: string; isShort: boolean } | null>(null);
  const [ytDuration, setYtDuration] = useState<number | null>(null);
  const [ytStartSec, setYtStartSec] = useState(0);
  const [ytEndSec, setYtEndSec] = useState(0);
  const [ytError, setYtError] = useState(false);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytRafRef = useRef<number | null>(null);

  const [caption, setCaption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const resetPhoto = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setSourceUrl(null);
    setCroppedUrl(null);
    setCroppedBlob(null);
    setUploadError("");
  };

  const resetYoutube = useCallback(() => {
    if (ytRafRef.current) { cancelAnimationFrame(ytRafRef.current); ytRafRef.current = null; }
    ytPlayerRef.current?.destroy();
    ytPlayerRef.current = null;
    setYoutubeUrl("");
    setParsedVideo(null);
    setYtDuration(null);
    setYtStartSec(0);
    setYtEndSec(0);
    setYtError(false);
  }, []);

  const handleTabChange = (m: MediaMode) => {
    resetPhoto();
    resetYoutube();
    setMode(m);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadError("");
    if (!ALLOWED_TYPES.includes(file.type)) { setUploadError(t("create.errorType")); return; }
    if (file.size > MAX_BYTES) { setUploadError(t("create.errorSize")); return; }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(URL.createObjectURL(file));
    setCroppedUrl(null);
  };

  const doPublish = useCallback(async (blob: Blob, ratio: AspectRatio) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", blob, "post.jpg");
      form.append("aspectRatio", ratio);
      form.append("caption", caption.trim());
      form.append("category", selectedCategory ?? "Random");

      const res = await fetch("/api/posts", { method: "POST", body: form });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Error al publicar" }));
        addToast(error ?? "Error al publicar", "error");
        return;
      }
      addToast(t("create.toastPublished"), "success");
      router.push("/feed");
    } catch {
      addToast("Error al publicar", "error");
    } finally {
      setLoading(false);
    }
  }, [caption, selectedCategory, addToast, t, router]);

  const doPublishYoutube = useCallback(async (
    videoId: string, startSec: number, endSec: number, aspectRatio: AspectRatio
  ) => {
    setLoading(true);
    try {
      const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startSec}&end=${endSec}`;
      const form = new FormData();
      form.append("mediaType", "youtube");
      form.append("mediaUrl", embedUrl);
      form.append("aspectRatio", aspectRatio);
      form.append("caption", caption.trim());
      form.append("category", selectedCategory ?? "Random");
      const res = await fetch("/api/posts", { method: "POST", body: form });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Error al publicar" }));
        addToast(error ?? "Error al publicar", "error");
        return;
      }
      addToast(t("create.toastPublished"), "success");
      router.push("/feed");
    } catch {
      addToast("Error al publicar", "error");
    } finally {
      setLoading(false);
    }
  }, [caption, selectedCategory, addToast, t, router]);

  // Parse YouTube URL whenever it changes
  useEffect(() => {
    const parsed = parseYoutubeUrl(youtubeUrl);
    setParsedVideo(parsed);
    setYtDuration(null);
    setYtError(false);
    setYtStartSec(0);
    setYtEndSec(0);
  }, [youtubeUrl]);

  // Init / destroy YouTube IFrame player when parsedVideo changes
  useEffect(() => {
    if (!parsedVideo) return;
    let mounted = true;

    const createPlayer = () => {
      const el = ytContainerRef.current;
      if (!el || !mounted) return;
      const player = new window.YT!.Player(el, {
        videoId: parsedVideo.id,
        playerVars: { controls: 1, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: (e) => {
            if (!mounted) return;
            const dur = Math.floor(e.target.getDuration());
            ytPlayerRef.current = e.target;
            if (dur > 0) {
              setYtDuration(dur);
              setYtStartSec(0);
              setYtEndSec(Math.min(90, dur));
            }
          },
          onError: () => { if (mounted) setYtError(true); },
        },
      });
      ytPlayerRef.current = player;
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        createPlayer();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    return () => {
      mounted = false;
      if (ytRafRef.current) { cancelAnimationFrame(ytRafRef.current); ytRafRef.current = null; }
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
  }, [parsedVideo]);

  const handlePreviewClip = useCallback(() => {
    const player = ytPlayerRef.current;
    if (!player || ytDuration === null) return;
    if (ytRafRef.current) { cancelAnimationFrame(ytRafRef.current); ytRafRef.current = null; }
    player.seekTo(ytStartSec, true);
    player.playVideo();
    const endAt = ytEndSec;
    const tick = () => {
      if (!ytPlayerRef.current) return;
      if (ytPlayerRef.current.getCurrentTime() >= endAt) {
        ytPlayerRef.current.pauseVideo();
        ytRafRef.current = null;
      } else {
        ytRafRef.current = requestAnimationFrame(tick);
      }
    };
    ytRafRef.current = requestAnimationFrame(tick);
  }, [ytStartSec, ytEndSec, ytDuration]);

  const handleCropApply = useCallback((blob: Blob, url: string, ratio: AspectRatio) => {
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setCroppedUrl(url);
    setCroppedBlob(blob);
    setCroppedRatio(ratio);
    setSourceUrl(null);
    if (pendingPublishRef.current) {
      pendingPublishRef.current = false;
      doPublish(blob, ratio);
    }
  }, [croppedUrl, sourceUrl, doPublish]);

  const photoPhase: "idle" | "cropping" | "done" =
    croppedUrl ? "done" : sourceUrl ? "cropping" : "idle";

  const handlePublish = async () => {
    if (!caption.trim()) { addToast(t("create.toastCaption"), "error"); return; }

    if (mode === "photo") {
      if (photoPhase === "idle") { addToast(t("create.toastNoPhoto"), "error"); return; }
      if (photoPhase === "cropping") {
        pendingPublishRef.current = true;
        cropperRef.current?.apply();
        return;
      }
      if (croppedBlob) { doPublish(croppedBlob, croppedRatio); return; }
    }

    if (mode === "youtube") {
      if (!parsedVideo) { addToast(t("create.youtubeInvalidUrl"), "error"); return; }
      if (!ytDuration) { addToast(t("create.youtubeLoadingPlayer"), "error"); return; }
      doPublishYoutube(parsedVideo.id, ytStartSec, ytEndSec, parsedVideo.isShort ? "9:16" : "16:9");
      return;
    }
  };

  const previewContainerClass =
    croppedRatio === "9:16" ? "max-w-[280px] w-full mx-auto aspect-[9/16]" :
    croppedRatio === "16:9" ? "w-full aspect-video" :
    "w-full aspect-square";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <BottomNav />
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <main className="md:pl-60 min-h-screen pb-24 md:pb-8">
        <TopBar title={t("create.title")} />

        <div className="max-w-xl mx-auto px-4 py-6">
          <div className="mb-6 hidden md:block">
            <h1 className="text-3xl font-black uppercase tracking-wide text-foreground">{t("create.title")}</h1>
            <p className="text-sm text-muted mt-1">{t("create.sub")}</p>
          </div>

          {/* Media mode tabs */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-6 bg-surface">
            {MEDIA_TABS.map(({ mode: m, icon: Icon, labelKey }) => (
              <button
                key={m}
                onClick={() => handleTabChange(m)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  mode === m ? "bg-brand text-white" : "text-muted hover:text-foreground"
                )}
              >
                <Icon size={14} />
                {t(labelKey)}
              </button>
            ))}
          </div>

          {/* Media area */}
          <div className="mb-6">
            {mode === "video" && (
              <div className="w-full h-44 rounded-xl border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center gap-4 px-8 text-center">
                <Video size={36} className="text-muted/40" />
                <p className="text-sm font-bold text-muted leading-relaxed">
                  {t("create.videoComingSoonMsg")}
                </p>
              </div>
            )}

            {mode === "youtube" && (
              <div className="space-y-4">
                {/* URL input */}
                <Input
                  label={t("create.youtubeLabel")}
                  placeholder={t("create.youtubePlaceholder")}
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  type="url"
                />

                {/* Parsed: aspect ratio badge */}
                {parsedVideo && (
                  <div className="flex items-center gap-2">
                    {parsedVideo.isShort
                      ? <><RectangleVertical size={12} className="text-brand" /><span className="text-[11px] font-black text-brand uppercase tracking-wider">Short · 9:16</span></>
                      : <><RectangleHorizontal size={12} className="text-brand" /><span className="text-[11px] font-black text-brand uppercase tracking-wider">Video · 16:9</span></>
                    }
                  </div>
                )}

                {/* Player — key on video ID so React remounts the div on each new video */}
                {parsedVideo && !ytError && (
                  <div className={cn(
                    "rounded-xl overflow-hidden border border-brand/30 bg-black",
                    parsedVideo.isShort
                      ? "max-w-[280px] w-full mx-auto aspect-[9/16]"
                      : "w-full aspect-video"
                  )}>
                    <div key={parsedVideo.id} ref={ytContainerRef} className="w-full h-full" />
                  </div>
                )}

                {/* Error state */}
                {ytError && (
                  <div className="w-full h-44 rounded-xl border border-danger/30 bg-danger/5 flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={22} className="text-danger/70" />
                    <p className="text-xs font-black text-danger/80">{t("create.youtubeErrorLoad")}</p>
                  </div>
                )}

                {/* Loading state */}
                {parsedVideo && !ytError && !ytDuration && (
                  <div className="flex items-center gap-2 text-xs text-muted font-bold">
                    <Loader2 size={13} className="animate-spin" />
                    {t("create.youtubeLoadingPlayer")}
                  </div>
                )}

                {/* Range slider + preview */}
                {ytDuration !== null && ytDuration > 0 && (
                  <>
                    <TimeRangeSlider
                      duration={ytDuration}
                      startSec={ytStartSec}
                      endSec={ytEndSec}
                      onChange={(s, e) => { setYtStartSec(s); setYtEndSec(e); }}
                    />
                    <button
                      onClick={handlePreviewClip}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand/40 text-brand text-xs font-black uppercase tracking-wider hover:bg-brand/10 transition-colors cursor-pointer"
                    >
                      <Play size={12} strokeWidth={2.5} />
                      {t("create.youtubePreviewBtn")}
                    </button>
                  </>
                )}
              </div>
            )}

            {mode === "photo" && (
              <>
                {photoPhase === "idle" && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-44 rounded-xl border-2 border-dashed border-border hover:border-brand/50 transition-colors flex flex-col items-center justify-center gap-3 bg-surface hover:bg-elevated cursor-pointer"
                  >
                    <div className="size-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                      <Upload size={22} className="text-brand/70" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-foreground">{t("create.uploadCta")}</p>
                      <p className="text-xs text-muted mt-1">{t("create.uploadPhotoFormats")}</p>
                    </div>
                  </button>
                )}

                {photoPhase === "cropping" && sourceUrl && (
                  <ImageCropper
                    ref={cropperRef}
                    src={sourceUrl}
                    onApply={handleCropApply}
                    onCancel={resetPhoto}
                  />
                )}

                {photoPhase === "done" && croppedUrl && (
                  <div className={cn("relative rounded-xl overflow-hidden", previewContainerClass)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={croppedUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={resetPhoto}
                      className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (croppedUrl) URL.revokeObjectURL(croppedUrl);
                        setCroppedUrl(null);
                        fileInputRef.current?.click();
                      }}
                      className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-black rounded-lg hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      {t("create.cropChangeBtn")}
                    </button>
                    {/* Ratio badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md flex items-center gap-1.5">
                      {croppedRatio === "1:1" && <Square size={10} className="text-white/80" />}
                      {croppedRatio === "9:16" && <RectangleVertical size={10} className="text-white/80" />}
                      {croppedRatio === "16:9" && <RectangleHorizontal size={10} className="text-white/80" />}
                      <span className="text-[10px] font-black text-white/80">{croppedRatio}</span>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-danger font-bold mt-2">{uploadError}</p>
                )}
              </>
            )}
          </div>

          {/* Caption */}
          <div className="mb-6">
            <Textarea
              label={t("create.captionLabel")}
              placeholder={t("create.captionPlaceholder")}
              rows={3}
              maxLength={160}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <p className={cn(
              "text-xs mt-1 text-right font-bold tabular-nums transition-colors",
              caption.length >= 160 ? "text-danger" : caption.length >= 140 ? "text-acid" : "text-muted"
            )}>
              {caption.length}/160
            </p>
          </div>

          {/* Category */}
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-wider text-muted mb-3">
              {t("create.categoryLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {POST_CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat}
                  category={cat}
                  selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                />
              ))}
            </div>
          </div>

          {/* Publish */}
          <PrimaryActionButton
            onClick={handlePublish}
            loading={loading}
            loadingLabel={t("create.publishingBtn")}
          >
            {t("create.publishBtn")}
          </PrimaryActionButton>

          <p className="text-xs text-muted text-center mt-3">
            {t("create.publishNotice")}
          </p>
        </div>
      </main>
    </div>
  );
}
