import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Shared social-share card for pardical.com pages. */
export function ogCard(eyebrow: string, headline: string, accent: string, sub: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#142942",
          color: "white",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#1e3a5f",
              border: "2px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Pardical</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#fbbf24", fontWeight: 600 }}>{eyebrow}</div>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 84, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>
            <span>{headline}&nbsp;</span>
            <span style={{ color: "#f59e0b" }}>{accent}</span>
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.75)", marginTop: 24 }}>{sub}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
