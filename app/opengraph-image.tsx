import { ImageResponse } from "next/og";

export const alt = "O&F Pristine Solution — Premium Cleaning Services in Nigeria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card, generated at build time — no external assets needed. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F172A 0%, #14252e 60%, #0F766E 140%)",
          color: "#FAFAF8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          <span style={{ fontSize: 96, fontStyle: "italic", fontWeight: 700 }}>O&amp;F</span>
          <span style={{ fontSize: 30, letterSpacing: 14, color: "#F59E0B" }}>
            PRISTINE SOLUTION
          </span>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 34,
            color: "rgba(250,250,248,0.85)",
            fontStyle: "italic",
          }}
        >
          Premium cleaning that gives you back your time.
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 28,
            fontSize: 20,
            letterSpacing: 3,
            color: "rgba(250,250,248,0.55)",
          }}
        >
          <span>RESIDENTIAL</span>
          <div style={{ width: 8, height: 8, borderRadius: 9999, background: "#F59E0B", marginTop: 10 }} />
          <span>COMMERCIAL</span>
          <div style={{ width: 8, height: 8, borderRadius: 9999, background: "#F59E0B", marginTop: 10 }} />
          <span>EXECUTIVE HOUSEKEEPING</span>
        </div>
      </div>
    ),
    size
  );
}
