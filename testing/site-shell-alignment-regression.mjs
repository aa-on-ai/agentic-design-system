#!/usr/bin/env node

import { chromium, webkit } from "playwright";

const baseUrl = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!baseUrl) {
  console.error(
    "usage: node testing/site-shell-alignment-regression.mjs <running-demo-url>",
  );
  process.exit(2);
}

const viewports = [
  { width: 390, height: 568 },
  { width: 390, height: 900 },
  { width: 720, height: 568 },
  { width: 721, height: 568 },
  { width: 900, height: 568 },
  { width: 901, height: 568 },
  { width: 1280, height: 568 },
  { width: 1800, height: 568 },
  { width: 2048, height: 900 },
];
const themes = ["light", "dark"];
const routeClearanceCases = [
  { path: "/", anchor: ".hero-copy" },
  { path: "/workbench", anchor: "main h1" },
  { path: "/mcp", anchor: "main h1" },
  { path: "/trace", anchor: "main h1" },
  { path: "/trace/002", anchor: "main h1" },
];
const routeViewports = [
  { width: 390, height: 568 },
  { width: 1800, height: 568 },
];
const tolerance = 1;
const failures = [];

for (const [browserName, browserType] of [
  ["Chromium", chromium],
  ["WebKit", webkit],
]) {
  const browser = await browserType.launch({ headless: true });
  const themeStyles = new Map();

  try {
    for (const theme of themes) {
      for (const { width, height } of viewports) {
        const page = await browser.newPage({
          viewport: { width, height },
          deviceScaleFactor: 1,
          colorScheme: theme,
        });
        const themedUrl = new URL(baseUrl);
        themedUrl.searchParams.set("theme", theme);
        await page.goto(themedUrl.href, { waitUntil: "domcontentloaded" });

        const measure = () =>
          page.evaluate(() => {
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
            const navStyle = getComputedStyle(nav);
            return {
              theme: document.documentElement.dataset.theme,
              leftInset: navBounds.left - heroBounds.left,
              rightInset: heroBounds.right - navBounds.right,
              topInset: navBounds.top - heroBounds.top,
              topClearance: heroCopyBounds.top - navBounds.bottom,
              bottomClearance: heroBounds.bottom - heroCopyBounds.bottom,
              navBackground: navStyle.backgroundColor,
              navColor: navStyle.color,
            };
          });

        const initialGeometry = await measure();
        await page.evaluate(() => document.fonts.ready);
        const settledGeometry = await measure();

        for (const [phase, geometry] of [
          ["initial", initialGeometry],
          ["settled", settledGeometry],
        ]) {
          const scope = `${browserName} ${theme} ${width}x${height} ${phase}`;
          if (!geometry) {
            failures.push(`${scope}: navigation geometry is missing`);
            continue;
          }

          if (geometry.theme !== theme) {
            failures.push(
              `${scope}: resolved ${geometry.theme ?? "no"} theme instead of ${theme}`,
            );
          }

          const expectedInset = width <= 720 ? 12 : 0;
          for (const edge of ["leftInset", "rightInset", "topInset"]) {
            if (Math.abs(geometry[edge] - expectedInset) > tolerance) {
              failures.push(
                `${scope}: ${edge} is ${geometry[edge].toFixed(1)}px, expected ${expectedInset}px`,
              );
            }
          }
          if (geometry.topClearance < 32 - tolerance) {
            failures.push(
              `${scope}: topClearance is ${geometry.topClearance.toFixed(1)}px, expected at least 32px`,
            );
          }
          if (geometry.bottomClearance < 12 - tolerance) {
            failures.push(
              `${scope}: bottomClearance is ${geometry.bottomClearance.toFixed(1)}px, expected at least 12px`,
            );
          }
        }

        if (width === 1280 && height === 568 && settledGeometry) {
          themeStyles.set(theme, {
            background: settledGeometry.navBackground,
            color: settledGeometry.navColor,
          });
        }

        await page.close();
      }
    }

    if (
      themeStyles.get("light")?.background ===
      themeStyles.get("dark")?.background
    ) {
      failures.push(
        `${browserName}: navigation background does not respond to light and dark themes`,
      );
    }

    for (const theme of themes) {
      for (const route of routeClearanceCases) {
        for (const { width, height } of routeViewports) {
          const page = await browser.newPage({
            viewport: { width, height },
            deviceScaleFactor: 1,
            colorScheme: theme,
          });
          const routeUrl = new URL(route.path, baseUrl);
          routeUrl.searchParams.set("theme", theme);
          await page.goto(routeUrl.href, { waitUntil: "domcontentloaded" });

          const measureClearance = () =>
            page.evaluate((anchorSelector) => {
              const nav = document.querySelector(".ads-system-nav");
              const anchor = document.querySelector(anchorSelector);
              if (
                !(nav instanceof HTMLElement) ||
                !(anchor instanceof HTMLElement)
              ) {
                return null;
              }
              return (
                anchor.getBoundingClientRect().top -
                nav.getBoundingClientRect().bottom
              );
            }, route.anchor);

          const initialClearance = await measureClearance();
          await page.evaluate(() => document.fonts.ready);
          const settledClearance = await measureClearance();
          for (const [phase, clearance] of [
            ["initial", initialClearance],
            ["settled", settledClearance],
          ]) {
            const scope = `${browserName} ${theme} ${route.path} ${width}x${height} ${phase}`;
            if (clearance === null) {
              failures.push(`${scope}: route clearance anchor is missing`);
            } else if (clearance < 32 - tolerance) {
              failures.push(
                `${scope}: content clearance is ${clearance.toFixed(1)}px, expected at least 32px`,
              );
            }
          }
          await page.close();
        }
      }
    }

    for (const colorScheme of themes) {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 720 },
        colorScheme,
      });
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      const resolvedTheme = await page.evaluate(
        () => document.documentElement.dataset.theme,
      );
      if (resolvedTheme !== colorScheme) {
        failures.push(
          `${browserName}: system ${colorScheme} preference resolved ${resolvedTheme ?? "no"} theme`,
        );
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
  `site shell alignment regression passed across ${viewports.length} viewport shapes in light and dark themes`,
);
