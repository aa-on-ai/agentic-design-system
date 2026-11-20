#!/usr/bin/env node

import { chromium, webkit } from "playwright";

const baseUrl = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!baseUrl) {
  console.error(
    "usage: node testing/wide-screen-typography.mjs <running-demo-url>",
  );
  process.exit(2);
}

const viewports = [1412, 1440, 1512, 1728, 1920];
const routeCases = [
  { path: "/trace", selector: "#trace-title", maxLines: 2 },
  { path: "/workbench", selector: "#starting-point-title", maxLines: 1 },
  { path: "/mcp", selector: "#mcp-title", maxLines: 2 },
  { path: "/trace/002", selector: "#result-title", maxLines: 4 },
];
const failures = [];

function formatMeasurement(measurement) {
  return `${measurement.lines} lines at ${measurement.fontSize}px in ${measurement.width}px`;
}

for (const [browserName, browserType] of [
  ["Chromium", chromium],
  ["WebKit", webkit],
]) {
  const browser = await browserType.launch({ headless: true });

  try {
    for (const routeCase of routeCases) {
      const measurements = [];

      for (const width of viewports) {
        const page = await browser.newPage({
          viewport: { width, height: 1100 },
          deviceScaleFactor: 1,
        });
        const url = new URL(routeCase.path, baseUrl);
        await page.goto(url.href, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);

        const measurement = await page.locator(routeCase.selector).evaluate((element) => {
          const lineTops = [];
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          let textNode = walker.nextNode();

          while (textNode) {
            const text = textNode.textContent ?? "";
            for (let index = 0; index < text.length; index += 1) {
              if (/\s/.test(text[index])) continue;
              const range = document.createRange();
              range.setStart(textNode, index);
              range.setEnd(textNode, index + 1);
              for (const rect of range.getClientRects()) {
                if (rect.width > 0 && rect.height > 0) lineTops.push(rect.top);
              }
            }
            textNode = walker.nextNode();
          }

          const lines = lineTops
            .sort((a, b) => a - b)
            .reduce((unique, top) => {
              if (!unique.some((knownTop) => Math.abs(knownTop - top) < 2)) {
                unique.push(top);
              }
              return unique;
            }, []);
          const style = getComputedStyle(element);

          return {
            lines: lines.length,
            fontSize: Number.parseFloat(style.fontSize),
            width: element.getBoundingClientRect().width,
          };
        });

        measurements.push({ viewport: width, ...measurement });
        await page.close();
      }

      for (const measurement of measurements) {
        if (measurement.lines > routeCase.maxLines) {
          failures.push(
            `${browserName} ${routeCase.path} ${measurement.viewport}px: ${formatMeasurement(measurement)}, expected at most ${routeCase.maxLines}`,
          );
        }
      }

      const baselineLines = measurements[0].lines;
      for (const measurement of measurements.slice(1)) {
        if (measurement.lines > baselineLines) {
          failures.push(
            `${browserName} ${routeCase.path}: line count grew from ${baselineLines} at 1440px to ${measurement.lines} at ${measurement.viewport}px`,
          );
        }
      }
    }

    const stationMeasurements = [];
    for (const width of viewports) {
      const page = await browser.newPage({
        viewport: { width, height: 1100 },
        deviceScaleFactor: 1,
      });
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const headings = await page.locator(".station-copy h2").evaluateAll((elements) =>
        elements.map((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const lineTops = [...range.getClientRects()]
            .filter((rect) => rect.width > 0 && rect.height > 0)
            .map((rect) => rect.top)
            .sort((a, b) => a - b)
            .reduce((unique, top) => {
              if (!unique.some((knownTop) => Math.abs(knownTop - top) < 2)) {
                unique.push(top);
              }
              return unique;
            }, []);
          const style = getComputedStyle(element);
          return {
            id: element.id,
            lines: lineTops.length,
            fontSize: Number.parseFloat(style.fontSize),
            width: element.getBoundingClientRect().width,
          };
        }),
      );
      stationMeasurements.push({ viewport: width, headings });
      await page.close();
    }

    const stationBaseline = new Map(
      stationMeasurements[0].headings.map((heading) => [heading.id, heading.lines]),
    );
    for (const { viewport, headings } of stationMeasurements) {
      for (const heading of headings) {
        if (heading.lines > 2) {
          failures.push(
            `${browserName} / ${viewport}px #${heading.id}: ${formatMeasurement(heading)}, expected at most 2`,
          );
        }
        if (heading.lines > stationBaseline.get(heading.id)) {
          failures.push(
            `${browserName} / #${heading.id}: line count grew from ${stationBaseline.get(heading.id)} at 1440px to ${heading.lines} at ${viewport}px`,
          );
        }
      }
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
  `wide-screen typography passed in Chromium and WebKit at ${viewports.join(", ")}px`,
);
