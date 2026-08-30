"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface RatingSliderProps {
  onSubmit: (score: number) => void;
  isSubmitting?: boolean;
}

export function RatingSlider({ onSubmit, isSubmitting }: RatingSliderProps) {
  const [value, setValue] = useState(50);

  const trackStyle = {
    background:
      value === 0
        ? "rgba(255,255,255,0.12)"
        : `linear-gradient(to right, var(--color-brand) 0%, var(--color-acid) ${value}%, rgba(255,255,255,0.12) ${value}%)`,
  };

  const numberGradient = {
    background: `linear-gradient(to right, var(--color-brand), var(--color-acid))`,
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  };

  const rateButtonStyle = {
    background: `linear-gradient(to right, var(--color-brand), var(--color-acid))`,
  };

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        .aura-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          width: 100%;
        }
        .aura-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #0d0d14;
          box-shadow: 0 0 0 3px var(--color-brand);
          cursor: pointer;
          transition: box-shadow 0.15s ease;
        }
        .aura-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px rgba(139,92,246,0.35);
        }
        .aura-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #0d0d14;
          box-shadow: 0 0 0 3px var(--color-brand);
          cursor: pointer;
        }
        .aura-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
        }
        .aura-slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.12);
        }
      `}</style>

      {/* Title */}
      <h2 className="text-2xl font-black text-foreground">How much aura?</h2>

      {/* Score number */}
      <div className="flex justify-center py-2 select-none">
        <span className="text-[108px] font-black leading-none tabular-nums" style={numberGradient}>
          {value}
        </span>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="aura-slider"
          style={trackStyle}
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs font-bold text-muted/60 px-0.5">
          <span>0 · NPC</span>
          <span>100 · LEGENDARY</span>
        </div>
      </div>

      {/* RATE button + score */}
      <div className="flex items-center gap-3 mt-1">
        <button
          onClick={() => !isSubmitting && onSubmit(value)}
          disabled={isSubmitting}
          className="flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white cursor-pointer disabled:opacity-60 active:scale-[0.98] transition-transform"
          style={rateButtonStyle}
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin mx-auto" />
          ) : (
            "RATE"
          )}
        </button>
        <span className="text-2xl font-black text-acid w-16 text-right tabular-nums">
          +{value}
        </span>
      </div>
    </div>
  );
}
