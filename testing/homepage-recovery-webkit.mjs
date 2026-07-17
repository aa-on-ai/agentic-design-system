#!/usr/bin/env node

import { webkit } from "playwright";

const url = process.argv[2];
if (!url) {
  console.error("usage: node testing/homepage-recovery-webkit.mjs <running-demo-url>");
  process.exit(2);
}

const browser = await webkit.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.addInitScript(() => {
    window.__adsLayoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__adsLayoutShift += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(`${url}?theme=light`, { waitUntil: "networkidle" });
  const initialTransform = await page.locator(".assembly-climber").evaluate((node) => getComputedStyle(node).transform);
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);

  for (let step = 0; step <= 24; step += 1) {
    await page.evaluate(({ step, pageHeight }) => scrollTo(0, (pageHeight * step) / 24), { step, pageHeight });
    await page.waitForTimeout(35);
  }

  const facts = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
    layoutShift: window.__adsLayoutShift || 0,
    artifacts: document.querySelectorAll(".ads-artifact").length,
    artifactStages: [...document.querySelectorAll(".ads-artifact")].map((node) => node.getAttribute("data-artifact")),
    climberImages: document.querySelectorAll(".assembly-climber img").length,
    climberPosition: getComputedStyle(document.querySelector(".assembly-climber")).position,
    handoffs: document.querySelectorAll(".release-handoff").length,
    activeStations: document.querySelectorAll(".station[data-active]").length,
    releaseBackground: getComputedStyle(document.querySelector(".release-bay")).backgroundColor,
  }));
  const finalTransform = await page.locator(".assembly-climber").evaluate((node) => getComputedStyle(node).transform);

  const failures = [];
  if (errors.length) failures.push(`page errors: ${errors.join(" | ")}`);
  if (facts.horizontalOverflow) failures.push("horizontal overflow detected");
  if (facts.layoutShift > 0.1) failures.push(`layout shift ${facts.layoutShift.toFixed(3)} exceeds 0.1`);
  if (facts.artifacts !== 5) failures.push(`expected 5 ADS artifacts, found ${facts.artifacts}`);
  if (new Set(facts.artifactStages).size !== 5) failures.push("ADS artifact stages are not distinct");
  if (facts.climberImages !== 1) failures.push(`expected one stable Ember image, found ${facts.climberImages}`);
  if (facts.climberPosition !== "absolute") failures.push(`Ember position is ${facts.climberPosition}, expected absolute`);
  if (initialTransform !== finalTransform) failures.push(`Ember transform changed during scroll: ${initialTransform} -> ${finalTransform}`);
  if (facts.handoffs) failures.push("release handoff is still rendered");
  if (facts.activeStations) failures.push("scroll-driven station state is still rendered");
  if (facts.releaseBackground !== "rgb(232, 93, 38)") failures.push(`release background is ${facts.releaseBackground}`);

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`WebKit recovery passed: 5 artifacts, stable Ember, no overflow, CLS ${facts.layoutShift.toFixed(3)}, orange release`);
  }
} finally {
  await browser.close();
}
