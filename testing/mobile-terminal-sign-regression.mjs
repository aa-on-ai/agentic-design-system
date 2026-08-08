#!/usr/bin/env node

import { chromium, webkit } from "playwright";

const url = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!url) {
  console.error("usage: node testing/mobile-terminal-sign-regression.mjs <running-demo-url>");
  process.exit(2);
}

const viewports = [320, 375, 390, 768, 1040];
const failures = [];

for (const [browserName, browserType] of [["Chromium", chromium], ["WebKit", webkit]]) {
  const browser = await browserType.launch({ headless: true });

  try {
    for (const width of viewports) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.locator('main[data-ads-homepage][data-page-ready="true"]').waitFor();
      await page.locator(".track-end").scrollIntoViewIfNeeded();

      const layout = await page.evaluate(() => {
        const sign = document.querySelector(".track-end");
        const label = sign?.querySelector("span");
        const track = document.querySelector(".continuous-track");
        if (!sign || !label || !track) return null;

        const signRect = sign.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        const labelRange = document.createRange();
        labelRange.selectNodeContents(label);
        const labelRect = labelRange.getBoundingClientRect();

        return {
          viewportWidth: window.innerWidth,
          sign: { left: signRect.left, right: signRect.right },
          label: { left: labelRect.left, right: labelRect.right },
          trackCenter: (trackRect.left + trackRect.right) / 2,
          centerDelta: Math.abs(
            (trackRect.left + trackRect.right) / 2 -
            (signRect.left + signRect.right) / 2,
          ),
        };
      });

      const scope = `${browserName} ${width}px`;
      if (!layout) {
        failures.push(`${scope}: missing terminal sign, label, or track`);
      } else {
        const minimumGutter = width <= 390 ? 4 : 0;
        if (layout.sign.left < minimumGutter || layout.sign.right > layout.viewportWidth) {
          failures.push(`${scope}: End of run sign is clipped or misses its ${minimumGutter}px gutter ${JSON.stringify(layout.sign)}`);
        }
        if (layout.label.left < 0 || layout.label.right > layout.viewportWidth) {
          failures.push(`${scope}: End of run label is clipped by the viewport ${JSON.stringify(layout.label)}`);
        }
        const trackEntersSign = layout.trackCenter >= layout.sign.left && layout.trackCenter <= layout.sign.right;
        if (width <= 390 && !trackEntersSign) {
          failures.push(`${scope}: End of run sign disconnects from the track ${JSON.stringify({ sign: layout.sign, trackCenter: layout.trackCenter })}`);
        } else if (width > 390 && layout.centerDelta > 1) {
          failures.push(`${scope}: End of run sign leaves the track centerline by ${layout.centerDelta.toFixed(1)}px`);
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

console.log("mobile terminal sign regression passed: sign and label stay visible while the track enters the sign");
