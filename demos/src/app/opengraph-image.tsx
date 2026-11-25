import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SOCIAL_IMAGE_ALT } from "./site";

export const alt = SOCIAL_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors the homepage hero: gray paper, ink type, one rose line, and the Ember workbench art.
const PAPER = "#f1f1f0";
const INK = "#232426";
const MUTED = "#5c5d64";
const ROSE = "#b52e46";

const publicFile = (relativePath: string) => path.join(process.cwd(), "public", relativePath);

async function dataUrl(relativePath: string, mime: string) {
  const bytes = await readFile(publicFile(relativePath));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

// DM Sans matches the homepage. If the font cannot be fetched at build time, fall back to the default face.
async function loadDmSans(weight: 500 | 600) {
  try {
    const signal = AbortSignal.timeout(8000);
    const css = await fetch(`https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}`, { signal }).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const font = await fetch(url, { signal });
    if (!font.ok || !/font|octet-stream/.test(font.headers.get("content-type") ?? "")) return null;
    return { name: "DM Sans", data: await font.arrayBuffer(), weight, style: "normal" as const };
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [art, mark, medium, semibold] = await Promise.all([
    dataUrl("og/graphite-rose-atelier.jpg", "image/jpeg"),
    dataUrl("brand/peek.svg", "image/svg+xml"),
    loadDmSans(500),
    loadDmSans(600),
  ]);
  const fonts = [medium, semibold].filter((font) => font !== null);
  const line = { fontSize: 62, fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1.06 } as const;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: PAPER,
          color: INK,
          fontFamily: fonts.length ? "DM Sans" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 640,
            padding: "56px 0 52px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img alt="" src={mark} width="52" height="48" style={{ width: 52, height: 48 }} />
            <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>Agentic Design System</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={line}>Your agent.</span>
            <span style={line}>Your product.</span>
            <span style={{ ...line, color: ROSE }}>A design practice.</span>
          </div>

          <span style={{ color: MUTED, fontSize: 22, fontWeight: 500, letterSpacing: "-0.01em" }}>
            A skill pack for Claude Code, Codex and Cursor
          </span>
        </div>

        <div style={{ display: "flex", flex: 1, padding: "48px 48px 48px 8px" }}>
          <img
            alt=""
            src={art}
            width="1536"
            height="864"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", borderRadius: 28 }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
