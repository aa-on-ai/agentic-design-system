import { ImageResponse } from "next/og";
import { SITE_URL, SOCIAL_IMAGE_ALT } from "./site";

export const alt = SOCIAL_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#071524",
          color: "#f9ecd2",
        }}
      >
        <img
          alt=""
          src={`${SITE_URL}/hero/creative-pipeline-dark.png`}
          width="1200"
          height="800"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            display: "flex",
            width: 700,
            borderRight: "1px solid rgba(249,236,210,0.16)",
            backgroundColor: "rgba(7,21,36,0.97)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            padding: "54px 60px 48px",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              alt=""
              src={`${SITE_URL}/brand/ads-mark.png`}
              width="68"
              height="68"
              style={{ width: 68, height: 68, borderRadius: 34 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em" }}>
                Agentic Design
              </span>
              <span
                style={{
                  color: "#c5b595",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                System
              </span>
            </div>
          </div>

          <div style={{ display: "flex", width: 650, flexDirection: "column", lineHeight: 0.95 }}>
            <span style={{ fontSize: 72, fontWeight: 720, letterSpacing: "-0.055em" }}>
              A design system
            </span>
            <span style={{ fontSize: 72, fontWeight: 720, letterSpacing: "-0.055em" }}>
              for agents.
            </span>
            <span
              style={{
                marginTop: 12,
                color: "#ff8b43",
                fontFamily: "serif",
                fontSize: 66,
                fontStyle: "italic",
                fontWeight: 600,
                letterSpacing: "-0.04em",
              }}
            >
              Proof for humans.
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span
              style={{
                display: "flex",
                padding: "8px 11px",
                background: "#c94518",
                color: "#fff8e9",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              Open source
            </span>
            <span style={{ color: "#f9ecd2", fontSize: 14, fontWeight: 700, letterSpacing: "0.055em" }}>
              Brief, browser-tested repair, evidence, and verdict
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
