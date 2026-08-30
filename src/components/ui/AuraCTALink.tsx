"use client";

import Link from "next/link";

interface AuraCTALinkProps {
  href: string;
  children: React.ReactNode;
  fontSize?: number;
  padding?: string;
  borderRadius?: number;
}

export function AuraCTALink({
  href,
  children,
  fontSize = 14,
  padding = "11px 18px",
  borderRadius = 11,
}: AuraCTALinkProps) {
  return (
    <div
      className="aura-cta-wrapper"
      style={{ position: "relative", display: "inline-block", borderRadius, padding: 2, overflow: "hidden" }}
    >
      <div
        className="aura-cta-sweep"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "220%",
          height: "220%",
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 245deg, rgba(167,139,250,0.5) 280deg, rgba(255,255,255,0.95) 338deg, rgba(184,255,61,0.95) 356deg, transparent 360deg)",
        }}
      />
      <Link
        href={href}
        style={{
          position: "relative",
          display: "inline-block",
          background: "linear-gradient(100deg, #A78BFA, #8B5CF6 55%, #B8FF3D)",
          color: "#08080A",
          fontWeight: 800,
          fontSize,
          padding,
          borderRadius: borderRadius - 2,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </Link>
    </div>
  );
}
