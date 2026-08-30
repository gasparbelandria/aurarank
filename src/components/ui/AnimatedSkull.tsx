"use client";

interface AnimatedSkullProps {
  size?: number;
}

export function AnimatedSkull({ size = 28 }: AnimatedSkullProps) {
  const dur = "2.8s";
  const splines = "0.45 0 0.55 1; 0.45 0 0.55 1";

  return (
    <svg
      viewBox="0 0 100 115"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", flexShrink: 0 }}
    >
      {/* Skull cranium */}
      <ellipse cx="50" cy="46" rx="42" ry="42" fill="white" />

      {/* Jaw base */}
      <rect x="22" y="74" width="56" height="28" rx="10" fill="white" />

      {/* Teeth gaps (dark squares) */}
      <rect x="28" y="87" width="11" height="17" rx="3" fill="#0d0d14" />
      <rect x="44" y="87" width="11" height="17" rx="3" fill="#0d0d14" />
      <rect x="60" y="87" width="11" height="17" rx="3" fill="#0d0d14" />

      {/* Eye sockets */}
      <ellipse cx="33" cy="44" rx="14" ry="14" fill="#0d0d14" />
      <ellipse cx="67" cy="44" rx="14" ry="14" fill="#0d0d14" />

      {/* Nose */}
      <path d="M 46 60 L 54 60 L 50 70 Z" fill="#0d0d14" />

      {/* Left pupil — animated left↔right */}
      <circle r="6.5" fill="white">
        <animate
          attributeName="cx"
          values="27;39;27"
          dur={dur}
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.5;1"
          keySplines={splines}
        />
        <animate
          attributeName="cy"
          values="44;44;44"
          dur={dur}
          repeatCount="indefinite"
        />
      </circle>

      {/* Right pupil — animated left↔right (same phase) */}
      <circle r="6.5" fill="white">
        <animate
          attributeName="cx"
          values="61;73;61"
          dur={dur}
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.5;1"
          keySplines={splines}
        />
        <animate
          attributeName="cy"
          values="44;44;44"
          dur={dur}
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
