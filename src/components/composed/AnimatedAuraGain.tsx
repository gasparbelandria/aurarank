"use client";

import { useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";

interface AnimatedAuraGainProps {
  score: number;
  onComplete?: () => void;
}

export function AnimatedAuraGain({ score, onComplete }: AnimatedAuraGainProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <m.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0, y: -30 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
          }}
          className="text-center"
        >
          <span className="text-7xl font-black tabular-nums text-acid leading-none">
            +{score}
          </span>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center"
        >
          <span className="text-sm font-black uppercase tracking-widest text-acid">
            AURA GAINED
          </span>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-2"
        >
          <span className="text-xs text-muted font-bold uppercase tracking-wider">
            Your rating has been submitted
          </span>
        </m.div>
      </div>
    </AnimatePresence>
  );
}
