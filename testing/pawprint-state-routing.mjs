#!/usr/bin/env node

import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error("usage: node testing/pawprint-state-routing.mjs <running-demo-url>");
  process.exit(2);
}

const route = `${baseUrl.replace(/\/$/, "")}/after/pawprint`;
const browserName = process.env.ADS_BROWSER === "webkit" ? "webkit" : "chromium";
const browserType = browserName === "webkit" ? webkit : chromium;
const cases = [
  { hash: "default", button: "Default", text: "Daily dispatch dashboard" },
  { hash: "loading", button: "Loading", text: "Loading today's operations board" },
  { hash: "empty", button: "Empty", text: "Today’s board is clear." },
  { hash: "error", button: "Error", text: "We couldn’t load today’s operations board." },
];

const browser = await browserType.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const signatures = new Set();

  for (const testCase of cases) {
    await page.goto(`${route}#state=${testCase.hash}`, { waitUntil: "networkidle" });
    await page.getByText(testCase.text, { exact: true }).waitFor();
    await assert.doesNotReject(() => page.getByRole("button", { name: testCase.button }).evaluate((button) => {
      if (button.getAttribute("aria-pressed") !== "true") throw new Error("state button is not pressed");
    }));
    signatures.add(await page.locator("main").innerText());
  }

  assert.equal(signatures.size, cases.length, "all four direct hash states must render distinct main content");

  await page.goto(`${route}#state=default`, { waitUntil: "networkidle" });
  const shellClearance = await page.evaluate(() => {
    const systemNav = document.querySelector(".ads-system-nav");
    const eyebrow = [...document.querySelectorAll("p")].find((element) => element.textContent?.trim() === "Pawprint admin");
    if (!systemNav || !eyebrow) throw new Error("missing Pawprint shell-clearance targets");
    const navRect = systemNav.getBoundingClientRect();
    const eyebrowRect = eyebrow.getBoundingClientRect();
    return {
      navBottom: navRect.bottom,
      eyebrowTop: eyebrowRect.top,
    };
  });
  assert.ok(
    shellClearance.eyebrowTop >= shellClearance.navBottom + 8,
    `Pawprint content must clear the fixed system navigation by 8px, received ${JSON.stringify(shellClearance)}`,
  );

  const visualContract = await page.locator("main").evaluate((main) => {
    const statusLanguage = /\b(?:available|offline|online|on time|error|warning|success|failed|active|inactive|busy|away|in progress|coverage)\b/i;
    const statusDots = [...main.querySelectorAll("*")].filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const radius = Number.parseFloat(style.borderTopLeftRadius) || 0;
      const parentText = (element.parentElement?.innerText || "").replace(/\s+/g, " ").trim();
      return !element.textContent?.trim() &&
        rect.width >= 4 && rect.width <= 16 &&
        rect.height >= 4 && rect.height <= 16 &&
        Math.abs(rect.width - rect.height) <= 2 &&
        radius >= Math.min(rect.width, rect.height) / 2 &&
        style.backgroundColor !== "transparent" &&
        !/rgba?\([^)]*,\s*0\s*\)$/.test(style.backgroundColor) &&
        statusLanguage.test(parentText);
    });
    return {
      text: main.innerText,
      iconCount: main.querySelectorAll("svg.lucide").length,
      statusDotCount: statusDots.length,
    };
  });
  assert.equal(/[—★🐾🐕]/u.test(visualContract.text), false, "Pawprint must use readable text and the project icon family instead of text symbols");
  assert.ok(visualContract.iconCount >= 3, "Pawprint must use the existing Lucide icon family");
  assert.equal(visualContract.statusDotCount, 0, "Pawprint must not render status dots");

  await page.getByRole("button", { name: "Empty" }).click();
  await page.waitForURL(/#state=empty$/);
  await page.getByText("Today’s board is clear.", { exact: true }).waitFor();

  console.log(`[pawprint-state-routing] ${browserName} four direct hash states and tab-to-hash sync passed`);
} finally {
  await browser.close();
}
