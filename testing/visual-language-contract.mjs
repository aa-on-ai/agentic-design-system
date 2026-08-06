import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = process.argv[2];

if (!url) {
  console.error("usage: node testing/visual-language-contract.mjs <running-demo-url>");
  process.exit(2);
}

const componentFiles = [
  "demos/src/app/page.tsx",
  "demos/src/app/WorkshopRun.tsx",
  "demos/src/app/AdsRunArtifact.tsx",
  "demos/src/app/OrderScreenPreview.tsx",
  "demos/src/app/ReleaseClose.tsx",
  "demos/src/app/SiteFooter.tsx",
  "demos/src/app/mcp/page.tsx",
  "demos/src/app/mcp/mcpData.ts",
  "demos/src/app/trace/page.tsx",
  "demos/src/app/trace/002/page.tsx",
  "demos/src/app/trace/002/TraceTwoHero.tsx",
  "demos/src/app/trace/002/ProofGallery.tsx",
  "demos/src/app/trace/002/ProofReceipts.tsx",
  "demos/src/app/trace/002/TraceClose.tsx",
];
const cssFiles = [
  "demos/src/app/globals.css",
  "demos/src/app/mcp/mcp.module.css",
  "demos/src/app/trace/trace.module.css",
  "demos/src/app/trace/002/trace-two.module.css",
];
const forbiddenGlyphs = /[→↗↓↑←•·]/u;

for (const file of componentFiles) {
  const source = await readFile(path.join(root, file), "utf8");
  assert.equal(forbiddenGlyphs.test(source), false, `${file} contains a forbidden arrow or bullet glyph`);
}

for (const file of cssFiles) {
  const source = await readFile(path.join(root, file), "utf8");
  assert.equal(/text-transform\s*:\s*uppercase/i.test(source), false, `${file} forces uppercase text`);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });
  await page.goto(`${url}?theme=light`, { waitUntil: "networkidle" });
  await page.locator('main[data-ads-homepage][data-page-ready="true"]').waitFor();

  const homepage = await page.evaluate(() => {
    const name = document.querySelector(".brand-lockup-name")?.getBoundingClientRect();
    const descriptor = document.querySelector(".brand-lockup-descriptor")?.getBoundingClientRect();
    const mouth = document.querySelector(".hero-track-mouth")?.getBoundingClientRect();
    const track = document.querySelector(".continuous-track")?.getBoundingClientRect();
    const footerSizes = [...document.querySelectorAll(".footer-meta, .footer-meta *")]
      .map((node) => Number.parseFloat(getComputedStyle(node).fontSize));
    return {
      brandTopDelta: name && descriptor ? Math.abs(name.top - descriptor.top) : Number.POSITIVE_INFINITY,
      trackCenterDelta: mouth && track
        ? Math.abs((mouth.left + mouth.width / 2) - (track.left + track.width / 2))
        : Number.POSITIVE_INFINITY,
      trackWidthDelta: mouth && track ? Math.abs(mouth.width - track.width) : Number.POSITIVE_INFINITY,
      smallestFooterMeta: Math.min(...footerSizes),
      visibleText: document.querySelector("main")?.innerText ?? "",
    };
  });

  assert.ok(homepage.brandTopDelta <= 2, `brand lockup wraps by ${homepage.brandTopDelta}px`);
  assert.ok(homepage.trackCenterDelta <= 0.5, `track centers differ by ${homepage.trackCenterDelta}px`);
  assert.ok(homepage.trackWidthDelta <= 0.5, `track widths differ by ${homepage.trackWidthDelta}px`);
  assert.ok(homepage.smallestFooterMeta >= 13, `footer metadata drops to ${homepage.smallestFooterMeta}px`);
  assert.equal(forbiddenGlyphs.test(homepage.visibleText), false, "homepage renders a forbidden arrow or bullet glyph");

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.waitForFunction(() => document.querySelector(".hero-image--pending.is-revealing"));
  const revealStart = await page.locator(".hero-image--pending").evaluate((node) => ({
    clipPath: getComputedStyle(node).clipPath,
    duration: Number.parseFloat(getComputedStyle(node).transitionDuration),
  }));
  await page.waitForTimeout(180);
  const revealMid = await page.locator(".hero-image--pending").evaluate((node) => getComputedStyle(node).clipPath);
  assert.ok(revealStart.duration >= 0.6, `theme image reveal lasts only ${revealStart.duration}s`);
  assert.notEqual(revealStart.clipPath, revealMid, "theme image reveal did not animate");
  await page.waitForFunction(() => document.querySelectorAll(".hero-media img").length === 1);
  assert.match(await page.locator(".hero-media img").getAttribute("src"), /creative-pipeline-dark/);

  for (const route of ["/trace", "/trace/002", "/mcp"]) {
    await page.goto(`${url}${route}?theme=light`, { waitUntil: "networkidle" });
    const facts = await page.locator("main").evaluate((main) => ({
      text: main.innerText,
      uppercaseTransforms: [...main.querySelectorAll("*")]
        .filter((node) => getComputedStyle(node).textTransform === "uppercase")
        .map((node) => node.textContent?.trim().slice(0, 80)),
    }));
    assert.equal(forbiddenGlyphs.test(facts.text), false, `${route} renders a forbidden arrow or bullet glyph`);
    assert.deepEqual(facts.uppercaseTransforms, [], `${route} renders forced uppercase text`);
  }
} finally {
  await browser.close();
}

console.log("[visual-language-contract] aligned track, single-line brand, animated image reveal, readable footer, and public surface language passed");
