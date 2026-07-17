#!/usr/bin/env node

import { chromium, webkit } from "playwright";

const url = process.argv[2];

if (!url) {
  console.error("usage: node testing/homepage-hardening.mjs <running-demo-url>");
  process.exit(2);
}

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];

const browserTypes = [
  ["Chromium", chromium],
  ["WebKit", webkit],
];

const failures = [];
const receipts = [];

function fail(scope, message) {
  failures.push(`${scope}: ${message}`);
}

async function installObservers(page) {
  await page.addInitScript(() => {
    window.__adsHardening = { cls: 0, firstFrameTheme: null };
    requestAnimationFrame(() => {
      window.__adsHardening.firstFrameTheme = document.documentElement.dataset.theme ?? null;
    });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__adsHardening.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}

async function waitForHero(page, theme) {
  await page.waitForFunction((expectedTheme) => {
    const images = [...document.querySelectorAll(".hero-media img")];
    return images.length === 1 && images[0].complete && images[0].naturalWidth > 0 &&
      images[0].currentSrc.includes(`creative-pipeline-${expectedTheme}`);
  }, theme);
}

async function inspectPage(page) {
  return page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    firstFrameTheme: window.__adsHardening.firstFrameTheme,
    cls: window.__adsHardening.cls,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    heroResources: performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("creative-pipeline"))
      .map((entry) => entry.name),
    heroImages: [...document.querySelectorAll(".hero-media img")].map((image) => image.currentSrc),
    artifacts: [...document.querySelectorAll(".ads-artifact")].map((node) => node.getAttribute("data-artifact")),
    handoffs: document.querySelectorAll(".release-handoff").length,
    activeStations: document.querySelectorAll(".station[data-active]").length,
    releaseBackground: getComputedStyle(document.querySelector(".release-bay")).backgroundColor,
  }));
}

async function verifyKeyboard(page, scope) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(50);

  const expectedCount = await page.locator('a[href], button:not([disabled])').count();
  const visited = [];
  for (let index = 0; index < expectedCount; index += 1) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(60);
    const focused = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return null;
      const controls = [...document.querySelectorAll('a[href], button:not([disabled])')];
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName,
        index: controls.indexOf(element),
        label: element.getAttribute("aria-label") || element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) || "",
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
        inViewport: rect.bottom >= 0 && rect.top <= innerHeight && rect.right >= 0 && rect.left <= innerWidth,
      };
    });

    if (!focused) {
      fail(scope, `keyboard step ${index + 1} has no HTMLElement focus target`);
      continue;
    }
    visited.push(focused.index);
    if (focused.outlineStyle === "none" || focused.outlineWidth < 2) {
      fail(scope, `focus is not visibly outlined on ${focused.tag}:${focused.label}`);
    }
    if (!focused.inViewport) {
      fail(scope, `focused control is offscreen: ${focused.tag}:${focused.label}`);
    }
  }

  if (new Set(visited).size !== expectedCount) {
    fail(scope, `keyboard reached ${new Set(visited).size}/${expectedCount} unique controls`);
  }
  return visited;
}

async function verifyReducedMotion(browser, browserName) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    colorScheme: "dark",
  });
  const page = await context.newPage();
  const scope = `${browserName}/reduced-motion`;
  await page.goto(`${url}?theme=dark&reduced=${Date.now()}`, { waitUntil: "networkidle" });
  await waitForHero(page, "dark");

  await page.getByRole("button", { name: "Make Ember hop" }).click();
  const climberAnimation = await page.locator(".assembly-climber-image").evaluate((node) => ({
    name: getComputedStyle(node).animationName,
    duration: getComputedStyle(node).animationDuration,
  }));
  if (climberAnimation.name !== "none") fail(scope, `climber animation is ${climberAnimation.name}`);
  const climberCadence = await page.locator(".assembly-climber-figure").evaluate((node) => getComputedStyle(node).animationName);
  if (climberCadence !== "none") fail(scope, `reduced-motion climber cadence is ${climberCadence}`);
  const climberPosition = await page.locator(".assembly-climber").evaluate((node) => getComputedStyle(node).position);
  if (climberPosition !== "absolute") fail(scope, `reduced-motion climber position is ${climberPosition}`);

  await page.getByRole("button", { name: "Make Ember pop up" }).click();
  const footerAnimation = await page.locator(".footer-ember-image").evaluate((node) => ({
    name: getComputedStyle(node).animationName,
    duration: getComputedStyle(node).animationDuration,
  }));
  if (footerAnimation.name !== "none") fail(scope, `footer animation is ${footerAnimation.name}`);

  const pageTransition = await page.locator(".theme-page").evaluate((node) => getComputedStyle(node).transitionDuration);
  const longestTransition = Math.max(...pageTransition.split(",").map((value) => Number.parseFloat(value)));
  if (longestTransition > 0.00002) fail(scope, `theme transition duration is ${pageTransition}`);

  receipts.push({ scope, climberAnimation, climberCadence, climberPosition, footerAnimation, pageTransition });
  await context.close();
}

for (const [browserName, browserType] of browserTypes) {
  const browser = await browserType.launch({ headless: true });
  try {
    for (const viewport of viewports) {
      const scope = `${browserName}/${viewport.name}`;
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: "light",
        reducedMotion: "no-preference",
        ...(browserName === "Chromium" ? { permissions: ["clipboard-read", "clipboard-write"] } : {}),
      });
      const page = await context.newPage();
      await context.addCookies([{ name: "ads-theme", value: "light", url }]);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await installObservers(page);

      await page.goto(`${url}?matrix=${browserName}-${viewport.name}-${Date.now()}`, { waitUntil: "networkidle" });
      await waitForHero(page, "light");
      const initial = await inspectPage(page);
      if (initial.theme !== "light" || initial.firstFrameTheme !== "light") {
        fail(scope, `first theme is ${initial.firstFrameTheme}/${initial.theme}, expected light/light`);
      }
      if (initial.heroResources.length !== 1 || !initial.heroResources[0].includes("creative-pipeline-light")) {
        fail(scope, `first load requested ${initial.heroResources.join(" | ") || "no hero"}`);
      }
      if (initial.heroImages.length !== 1 || !initial.heroImages[0].includes("creative-pipeline-light")) {
        fail(scope, `rendered heroes are ${initial.heroImages.join(" | ") || "missing"}`);
      }

      const initialClimber = await page.locator(".assembly-climber").evaluate((node) => ({
        motion: node.getAttribute("data-motion"),
        position: getComputedStyle(node).position,
        documentTop: window.scrollY + node.getBoundingClientRect().top,
        transform: getComputedStyle(node.querySelector(".assembly-climber-figure")).transform,
      }));
      const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      const climberTransforms = new Set([initialClimber.transform]);
      for (let step = 0; step <= 16; step += 1) {
        await page.evaluate(({ step, pageHeight }) => {
          document.documentElement.style.scrollBehavior = "auto";
          document.documentElement.scrollTop = (pageHeight * step) / 16;
          document.body.scrollTop = (pageHeight * step) / 16;
        }, { step, pageHeight });
        await page.waitForTimeout(24);
        climberTransforms.add(await page.locator(".assembly-climber-figure").evaluate((node) => getComputedStyle(node).transform));
      }
      const finalClimber = await page.locator(".assembly-climber").evaluate((node) => ({
        documentTop: window.scrollY + node.getBoundingClientRect().top,
      }));
      const scrolled = await inspectPage(page);

      if (errors.length) fail(scope, `page errors: ${errors.join(" | ")}`);
      if (scrolled.overflow > 0) fail(scope, `horizontal overflow ${scrolled.overflow}px`);
      if (scrolled.cls > 0.1) fail(scope, `CLS ${scrolled.cls.toFixed(3)} exceeds 0.1`);
      if (initialClimber.motion !== "rail-follow" || initialClimber.position !== "sticky") {
        fail(scope, `Ember motion is ${initialClimber.motion}/${initialClimber.position}, expected rail-follow/sticky`);
      }
      if (finalClimber.documentTop - initialClimber.documentTop < 200) {
        fail(scope, `Ember only traveled ${Math.round(finalClimber.documentTop - initialClimber.documentTop)}px with the rail`);
      }
      if (climberTransforms.size < 3) fail(scope, `Ember climb cadence only produced ${climberTransforms.size} transform state(s)`);
      if (new Set(scrolled.artifacts).size !== 5) fail(scope, `artifact count is ${new Set(scrolled.artifacts).size}`);
      if (scrolled.handoffs) fail(scope, "release handoff returned");
      if (scrolled.activeStations) fail(scope, "scroll-driven station state returned");
      if (scrolled.releaseBackground !== "rgb(232, 93, 38)") {
        fail(scope, `release background is ${scrolled.releaseBackground}`);
      }

      const keyboardOrder = browserName === "Chromium" ? await verifyKeyboard(page, scope) : [];

      await page.getByRole("button", { name: "Switch to dark theme" }).click();
      await waitForHero(page, "dark");
      await page.goto(`${url}?persistence=${browserName}-${viewport.name}-${Date.now()}`, { waitUntil: "networkidle" });
      await waitForHero(page, "dark");
      const persisted = await inspectPage(page);
      if (persisted.theme !== "dark" || persisted.firstFrameTheme !== "dark") {
        fail(scope, `persisted theme is ${persisted.firstFrameTheme}/${persisted.theme}, expected dark/dark`);
      }
      if (persisted.heroResources.length !== 1 || !persisted.heroResources[0].includes("creative-pipeline-dark")) {
        fail(scope, `persisted first load requested ${persisted.heroResources.join(" | ") || "no hero"}`);
      }

      const copyButton = page.getByRole("button", { name: "Copy install command" }).first();
      const beforeCopy = await copyButton.boundingBox();
      await copyButton.click();
      await page.waitForTimeout(50);
      const afterCopy = await copyButton.boundingBox();
      const copyFeedback = await copyButton.locator("[aria-live='polite']").textContent();
      if (!copyFeedback || !["Copied", "Try again"].includes(copyFeedback.trim())) {
        fail(scope, `copy feedback is ${copyFeedback ?? "missing"}`);
      }
      if (
        !beforeCopy || !afterCopy ||
        Math.abs(beforeCopy.width - afterCopy.width) > 1 ||
        Math.abs(beforeCopy.height - afterCopy.height) > 1
      ) {
        fail(scope, "copy feedback shifted the install action");
      }

      receipts.push({
        scope,
        cls: scrolled.cls,
        initialHero: initial.heroResources,
        persistedHero: persisted.heroResources,
        emberTravel: Math.round(finalClimber.documentTop - initialClimber.documentTop),
        emberCadenceStates: climberTransforms.size,
        keyboardControls: keyboardOrder.length,
        copyFeedback: copyFeedback?.trim() ?? null,
      });
      await context.close();
    }

    await verifyReducedMotion(browser, browserName);
  } finally {
    await browser.close();
  }
}

if (failures.length) {
  console.error("homepage hardening failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify(receipts, null, 2));
console.log("homepage hardening passed: Chromium + WebKit at 390/768/1280, active-theme hero, smooth Ember rail motion, reduced motion, keyboard focus, copy feedback, and theme persistence");
