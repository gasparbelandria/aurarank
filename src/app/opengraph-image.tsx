import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AuraRank — Post. Get Ranked. Build Your Aura.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "64px 72px",
          background: "#08080A",
          position: "relative",
        }}
      >
        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -60,
            width: 700,
            height: 460,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -60,
            width: 560,
            height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(184,255,61,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Brand name */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 0,
            marginBottom: 28,
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 22, color: "#6b6b76", letterSpacing: "0.14em" }}>
            AURARANK.ME
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontWeight: 800,
            fontSize: 88,
            lineHeight: 0.92,
            letterSpacing: "-0.045em",
            color: "#F5F5F5",
            marginBottom: 28,
          }}
        >
          <span style={{ color: "#F5F5F5" }}>POST.</span>{" "}
          <span
            style={{
              background: "linear-gradient(100deg, #A78BFA 10%, #8B5CF6 45%, #B8FF3D 110%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            GET RANKED.
          </span>{" "}
          <span style={{ color: "#F5F5F5" }}>BUILD YOUR AURA.</span>
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: 24,
            color: "#A1A1AA",
            lineHeight: 1.4,
          }}
        >
          Post your best moments. Let the internet rate your aura score.
        </div>

        {/* Score pill */}
        <div
          style={{
            position: "absolute",
            top: 64,
            right: 72,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 120,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              background: "linear-gradient(100deg, #F5F5F5 5%, #A78BFA 55%, #B8FF3D 110%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            94
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "0.2em",
              color: "#6b6b76",
            }}
          >
            AURA SCORE
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
