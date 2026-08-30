"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { RatingSlider } from "@/components/composed/RatingSlider";
import { AnimatedAuraGain } from "@/components/composed/AnimatedAuraGain";

type ModalState = "idle" | "submitting" | "submitted" | "already_rated" | "error";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
  postCaption: string;
  postThumbnail: string;
  authorUsername: string;
  onRated?: (score: number, newAuraScore: number | null, newRatingCount: number | null) => void;
}

export function RatingModal({
  isOpen,
  onClose,
  postId,
  onRated,
}: RatingModalProps) {
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [submittedScore, setSubmittedScore] = useState(0);

  const handleSubmit = async (score: number) => {
    if (!postId || modalState === "submitting") return;
    setModalState("submitting");

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, score }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmittedScore(score);
        setModalState("submitted");
        onRated?.(score, data.newAuraScore ?? null, data.newRatingCount ?? null);
      } else if (res.status === 409) {
        setModalState("already_rated");
      } else {
        setModalState("error");
      }
    } catch {
      setModalState("error");
    }
  };

  const handleAnimationComplete = () => {
    setTimeout(() => {
      handleClose();
    }, 300);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setModalState("idle"), 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal — bottom sheet on mobile, centered on desktop */}
          <m.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 right-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 px-4 pb-4 md:pb-0 pointer-events-none"
          >
            <div className="relative w-full max-w-sm pointer-events-auto bg-elevated border border-border rounded-2xl p-6 shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface cursor-pointer"
              >
                <X size={18} />
              </button>

              <AnimatePresence mode="wait">
                {modalState === "idle" || modalState === "submitting" ? (
                  <m.div key="slider" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <RatingSlider
                      onSubmit={handleSubmit}
                      isSubmitting={modalState === "submitting"}
                    />
                  </m.div>
                ) : modalState === "submitted" ? (
                  <m.div key="gain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AnimatedAuraGain score={submittedScore} onComplete={handleAnimationComplete} />
                  </m.div>
                ) : (
                  <m.div
                    key="message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-10 text-center"
                  >
                    <p className="text-2xl font-black text-foreground">
                      {modalState === "already_rated" ? "Already rated" : "Something went wrong"}
                    </p>
                    <p className="text-sm text-muted">
                      {modalState === "already_rated"
                        ? "You've already rated this post."
                        : "Please try again later."}
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-2 px-6 py-2.5 rounded-xl bg-elevated border border-border text-sm font-black text-foreground hover:border-brand/50 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
