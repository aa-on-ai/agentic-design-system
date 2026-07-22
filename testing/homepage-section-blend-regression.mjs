#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { chromium, webkit } from "playwright";
import { PNG } from "pngjs";

const url = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!url) {
  console.error("usage: node testing/homepage-section-blend-regression.mjs <running-demo-url>");
  process.exit(2);
}

const widths = [1024, 1280, 1622];
const requestedBrowser = (process.env.ADS_SECTION_BLEND_BROWSER ?? "chromium").toLowerCase();
const browserOptions = {
  chromium: ["Chromium", chromium],
  webkit: ["WebKit", webkit],
};
const selectedBrowser = browserOptions[requestedBrowser];

if (!selectedBrowser) {
  console.error(`unsupported ADS_SECTION_BLEND_BROWSER: ${requestedBrowser}`);
  process.exit(2);
}

const [browserName, browserType] = selectedBrowser;
const artifactDir = path.resolve("evidence/homepage-section-blend", requestedBrowser);
const issues = [];
const browser = await browserType.launch({ headless: true });

fs.mkdirSync(artifactDir, { recursive: true });

function averageColor(png, centerX, centerY, radiusX = 10, radiusY = 2) {
  const totals = [0, 0, 0];
  let count = 0;

  for (let y = Math.max(0, centerY - radiusY); y <= Math.min(png.height - 1, centerY + radiusY); y += 1) {
    for (let x = Math.max(0, centerX - radiusX); x <= Math.min(png.width - 1, centerX + radiusX); x += 1) {
      const offset = (y * png.width + x) * 4;
      if (png.data[offset + 3] < 250) continue;
      totals[0] += png.data[offset];
      totals[1] += png.data[offset + 1];
      totals[2] += png.data[offset + 2];
      count += 1;
    }
  }

  return totals.map((value) => value / count);
}

function colorDistance(a, b) {
  return Math.sqrt(a.reduce((sum, channel, index) => sum + (channel - b[index]) ** 2, 0));
}

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.locator('main[data-ads-homepage][data-page-ready="true"]').waitFor();

    const floor = await page.locator(".factory-floor").boundingBox();
    if (!floor) {
      issues.push(`${width}px: missing factory floor`);
      await page.close();
      continue;
    }

    const imagePath = path.join(artifactDir, `${width}.png`);
    await page.screenshot({ path: imagePath, fullPage: true });
    const png = PNG.sync.read(fs.readFileSync(imagePath));
    const seamY = Math.round(floor.y);
    const sampleXs = {
      left: Math.round(width * 0.18),
      right: Math.round(width * 0.82),
    };
    const result = {};

    for (const [side, sampleX] of Object.entries(sampleXs)) {
      const before = averageColor(png, sampleX, seamY - 4);
      const after = averageColor(png, sampleX, seamY + 4);
      result[side] = {
        before: before.map((value) => Number(value.toFixed(1))),
        after: after.map((value) => Number(value.toFixed(1))),
        delta: Number(colorDistance(before, after).toFixed(2)),
      };
    }

    console.log(`[homepage-section-blend] ${browserName} ${width}px ${JSON.stringify(result)}`);

    if (result.left.delta > 4) {
      issues.push(`${browserName} ${width}px: left hero/factory seam changes by ${result.left.delta} RGB units (expected <= 4)`);
    }
    if (result.right.delta > 4) {
      issues.push(`${browserName} ${width}px: right hero/factory seam changes by ${result.right.delta} RGB units (expected <= 4)`);
    }

    await page.close();
  }
} finally {
  await browser.close();
}

if (issues.length > 0) {
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log(`homepage section blend regression passed in ${browserName}`);
