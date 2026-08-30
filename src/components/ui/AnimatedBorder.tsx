import { cn } from "@/lib/cn";

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  radius?: number;
  thickness?: number;
}

export function AnimatedBorder({
  children,
  className,
  innerClassName,
  radius = 9999,
  thickness = 2,
}: AnimatedBorderProps) {
  return (
    <div
      className={cn("aura-border-wrapper relative overflow-hidden inline-block shrink-0", className)}
      style={{ borderRadius: radius, padding: thickness }}
    >
      <div
        className="aura-border-sweep pointer-events-none absolute"
        style={{
          top: "50%",
          left: "50%",
          width: "250%",
          height: "250%",
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 240deg, rgba(167,139,250,0.6) 280deg, rgba(255,255,255,0.9) 335deg, rgba(184,255,61,0.9) 355deg, transparent 360deg)",
        }}
      />
      <div
        className={cn("relative", innerClassName)}
        style={{ borderRadius: Math.max(0, radius - thickness) }}
      >
        {children}
      </div>
    </div>
  );
}
