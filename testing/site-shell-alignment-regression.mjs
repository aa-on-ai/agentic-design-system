#!/usr/bin/env node

import { chromium, webkit } from "playwright";

const baseUrl = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!baseUrl) {
  console.error(
    "usage: node testing/site-shell-alignment-regression.mjs <running-demo-url>",
  );
  process.exit(2);
}

const widths = [390, 720, 721, 900, 901, 1280, 1800, 2048];
const tolerance = 1;
const failures = [];

for (const [browserName, browserType] of [
  ["Chromium", chromium],
  ["WebKit", webkit],
]) {
  const browser = await browserType.launch({ headless: true });

  try {
    for (const width of widths) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
      });
      await page.goto(baseUrl, { waitUntil: "networkidle" });

      const geometry = await page.evaluate(() => {
        const nav = document.querySelector(".ads-system-nav");
        const hero = document.querySelector(".hero-workshop");
        const heroCopy = document.querySelector(".hero-copy");
        if (
          !(nav instanceof HTMLElement) ||
          !(hero instanceof HTMLElement) ||
          !(heroCopy instanceof HTMLElement)
        ) {
          return null;
        }

        const navBounds = nav.getBoundingClientRect();
        const heroBounds = hero.getBoundingClientRect();
        const heroCopyBounds = heroCopy.getBoundingClientRect();
        return {
          leftInset: navBounds.left - heroBounds.left,
          rightInset: heroBounds.right - navBounds.right,
          topInset: navBounds.top - heroBounds.top,
          topClearance: heroCopyBounds.top - navBounds.bottom,
          bottomClearance: heroBounds.bottom - heroCopyBounds.bottom,
        };
      });

      if (!geometry) {
        failures.push(`${browserName} ${width}px: navigation geometry is missing`);
      } else {
        const expectedInset = width <= 720 ? 12 : 0;
        for (const edge of ["leftInset", "rightInset", "topInset"]) {
          if (Math.abs(geometry[edge] - expectedInset) > tolerance) {
            failures.push(
              `${browserName} ${width}px: ${edge} is ${geometry[edge].toFixed(1)}px, expected ${expectedInset}px`,
            );
          }
        }
        for (const edge of ["topClearance", "bottomClearance"]) {
          if (geometry[edge] < 12 - tolerance) {
            failures.push(
              `${browserName} ${width}px: ${edge} is ${geometry[edge].toFixed(1)}px, expected at least 12px`,
            );
          }
        }
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `site shell alignment regression passed at ${widths.join("/")}px`,
);
