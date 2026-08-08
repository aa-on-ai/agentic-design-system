#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, webkit } from "playwright";

const url = process.argv[2];

if (!url) {
  console.error("usage: node testing/homepage-faq-icons.mjs <running-demo-url>");
  process.exit(2);
}

const failures = [];
const requestedBrowser = process.env.ADS_TEST_BROWSER?.toLowerCase();
const browserTypes = [["Chromium", chromium], ["WebKit", webkit]]
  .filter(([name]) => !requestedBrowser || name.toLowerCase() === requestedBrowser);

for (const [browserName, browserType] of browserTypes) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const controls = await page.evaluate(() => {
    const actionSelector = [
      ".install-guide-link",
      ".tour-link",
      ".release-action-links a",
      ".release-boundaries > a",
    ].join(", ");
    const symbolPattern = /[↗↘↙↖↑↓←→✕✖]/;
    const actionLinks = [...document.querySelectorAll(actionSelector)];
    const faqButtons = [...document.querySelectorAll(".release-faq-item button")];

    return {
      actionCount: actionLinks.length,
      actionIcons: actionLinks.filter((link) => link.querySelector("svg.lucide")).length,
      rawActionSymbols: actionLinks.filter((link) => symbolPattern.test(link.textContent ?? "")).length,
      faqCount: faqButtons.length,
      faqIcons: faqButtons.filter((button) => button.querySelector("svg.lucide-plus")).length,
      timing: getComputedStyle(document.querySelector(".release-faq-answer")).transitionTimingFunction,
      duration: getComputedStyle(document.querySelector(".release-faq-answer")).transitionDuration,
    };
  });

  if (controls.actionCount !== 6 || controls.actionIcons !== 1) {
    failures.push(`${browserName}: homepage actions expose ${controls.actionIcons} icons across ${controls.actionCount} links (expected one GitHub mark and no decorative arrows)`);
  }
  if (controls.rawActionSymbols !== 0) {
    failures.push(`${browserName}: ${controls.rawActionSymbols} homepage actions still use symbol glyphs`);
  }
  if (controls.faqCount !== 4 || controls.faqIcons !== controls.faqCount) {
    failures.push(`${browserName}: ${controls.faqIcons}/${controls.faqCount} FAQ controls use Lucide Plus icons`);
  }
  if (!controls.timing.includes("0.645") || controls.duration !== "0.22s") {
    failures.push(`${browserName}: FAQ timing is ${controls.duration} ${controls.timing}`);
  }

  const trigger = page.getByRole("button", { name: "Do I need the evidence server?" });
  const panel = page.locator("#release-faq-panel-0");
  const icon = trigger.locator(".release-faq-icon");
  const closedHeight = await panel.evaluate((node) => node.getBoundingClientRect().height);
  await trigger.click();
  await page.waitForTimeout(100);
  const openingHeight = await panel.evaluate((node) => node.getBoundingClientRect().height);
  await page.waitForTimeout(160);
  const openState = await Promise.all([
    trigger.getAttribute("aria-expanded"),
    panel.getAttribute("aria-hidden"),
    panel.evaluate((node) => node.getBoundingClientRect().height),
    icon.evaluate((node) => getComputedStyle(node).transform),
  ]);

  if (!(openingHeight > closedHeight && openingHeight < openState[2])) {
    failures.push(`${browserName}: FAQ panel did not interpolate through an opening frame`);
  }
  if (openState[0] !== "true" || openState[1] !== "false" || openState[2] <= 0 || openState[3] === "none") {
    failures.push(`${browserName}: FAQ open state is ${JSON.stringify(openState)}`);
  }

  await trigger.click();
  await page.waitForTimeout(320);
  const closedState = await Promise.all([
    trigger.getAttribute("aria-expanded"),
    panel.getAttribute("aria-hidden"),
    panel.evaluate((node) => node.getBoundingClientRect().height),
    icon.evaluate((node) => getComputedStyle(node).transform),
  ]);
  if (closedState[0] !== "false" || closedState[1] !== "true" || closedState[2] > 0.5 || closedState[3] !== "none") {
    failures.push(`${browserName}: FAQ close state is ${JSON.stringify(closedState)}`);
  }

  await context.close();
  await browser.close();
}

const reducedBrowser = await chromium.launch({ headless: true });
const reducedContext = await reducedBrowser.newContext({ reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(url, { waitUntil: "networkidle" });
const reducedDuration = await reducedPage.locator(".release-faq-answer").first().evaluate(
  (node) => getComputedStyle(node).transitionDuration,
);
if (Number.parseFloat(reducedDuration) > 0.001) {
  failures.push(`Reduced motion duration is ${reducedDuration}`);
}
await reducedBrowser.close();

const screenshotDir = process.env.ADS_SCREENSHOT_DIR;
if (screenshotDir) {
  await mkdir(screenshotDir, { recursive: true });
  const screenshotBrowser = await chromium.launch({ headless: true });
  for (const viewport of [{ name: "desktop", width: 1280, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
    const context = await screenshotBrowser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Do I need the evidence server?" }).click();
    await page.waitForTimeout(240);
    await page.locator(".release-faq").screenshot({ path: join(screenshotDir, `faq-${viewport.name}.png`) });
    await page.locator(".release-actions").screenshot({ path: join(screenshotDir, `actions-${viewport.name}.png`) });
    await page.locator(".release-boundaries").screenshot({ path: join(screenshotDir, `contract-${viewport.name}.png`) });
    await context.close();
  }
  await screenshotBrowser.close();
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`PASS: FAQ motion, reduced motion, and arrow-free homepage action coverage verified in ${browserTypes.map(([name]) => name).join(" and ")}`);
