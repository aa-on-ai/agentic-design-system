#!/usr/bin/env node

import { webkit } from "playwright";

const url = process.argv[2];
if (!url) {
  console.error("usage: node testing/homepage-recovery-webkit.mjs <running-demo-url>");
  process.exit(2);
}

const browser = await webkit.launch();
const pageReadySelector = 'main[data-ads-homepage][data-page-ready="true"]';
const browserStepTimeoutMs = 20_000;

async function withBrowserStepTimeout(promise, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`${label} timed out after ${browserStepTimeoutMs}ms`)),
      browserStepTimeoutMs,
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId);
  }
}

try {
  const page = await withBrowserStepTimeout(
    browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" }),
    "WebKit page startup",
  );
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.addInitScript(() => {
    window.__adsLayoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__adsLayoutShift += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(`${url}?theme=light`, { waitUntil: "domcontentloaded" });
  await page.locator(pageReadySelector).waitFor({ state: "attached", timeout: 20_000 });
  const initialClimber = await page.locator(".assembly-climber").evaluate((node) => ({
    documentTop: window.scrollY + node.getBoundingClientRect().top,
    transform: getComputedStyle(node.querySelector(".assembly-climber-figure")).transform,
  }));
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const climberTransforms = new Set([initialClimber.transform]);

  for (let step = 0; step <= 24; step += 1) {
    await page.evaluate(({ step, pageHeight }) => {
      document.documentElement.style.scrollBehavior = "auto";
      document.documentElement.scrollTop = (pageHeight * step) / 24;
      document.body.scrollTop = (pageHeight * step) / 24;
    }, { step, pageHeight });
    await page.waitForTimeout(35);
    climberTransforms.add(await page.locator(".assembly-climber-figure").evaluate((node) => getComputedStyle(node).transform));
  }

  const facts = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
    layoutShift: window.__adsLayoutShift || 0,
    artifacts: document.querySelectorAll(".ads-artifact").length,
    artifactStages: [...document.querySelectorAll(".ads-artifact")].map((node) => node.getAttribute("data-artifact")),
    climberImages: document.querySelectorAll(".assembly-climber img").length,
    climberMotion: document.querySelector(".assembly-climber").getAttribute("data-motion"),
    climberPosition: getComputedStyle(document.querySelector(".assembly-climber")).position,
    handoffs: document.querySelectorAll(".release-handoff").length,
    activeStations: document.querySelectorAll(".station[data-active]").length,
    releaseBackground: getComputedStyle(document.querySelector(".release-bay")).backgroundColor,
  }));
  const finalClimber = await page.locator(".assembly-climber").evaluate((node) => ({
    documentTop: window.scrollY + node.getBoundingClientRect().top,
  }));

  const failures = [];
  if (errors.length) failures.push(`page errors: ${errors.join(" | ")}`);
  if (facts.horizontalOverflow) failures.push("horizontal overflow detected");
  if (facts.layoutShift > 0.1) failures.push(`layout shift ${facts.layoutShift.toFixed(3)} exceeds 0.1`);
  if (facts.artifacts !== 5) failures.push(`expected 5 ADS artifacts, found ${facts.artifacts}`);
  if (new Set(facts.artifactStages).size !== 5) failures.push("ADS artifact stages are not distinct");
  if (facts.climberImages !== 1) failures.push(`expected one stable Ember image, found ${facts.climberImages}`);
  if (facts.climberMotion !== "rail-follow") failures.push(`Ember motion is ${facts.climberMotion}, expected rail-follow`);
  if (facts.climberPosition !== "sticky") failures.push(`Ember position is ${facts.climberPosition}, expected sticky`);
  if (finalClimber.documentTop - initialClimber.documentTop < 200) failures.push(`Ember only traveled ${Math.round(finalClimber.documentTop - initialClimber.documentTop)}px with the rail`);
  if (climberTransforms.size < 3) failures.push(`Ember climb cadence only produced ${climberTransforms.size} transform state(s)`);
  if (facts.handoffs) failures.push("release handoff is still rendered");
  if (facts.activeStations) failures.push("scroll-driven station state is still rendered");
  if (facts.releaseBackground !== "rgb(232, 93, 38)") failures.push(`release background is ${facts.releaseBackground}`);

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`WebKit recovery passed: 5 artifacts, smooth rail-following Ember, no overflow, CLS ${facts.layoutShift.toFixed(3)}, orange release`);
  }
} finally {
  await browser.close();
}
