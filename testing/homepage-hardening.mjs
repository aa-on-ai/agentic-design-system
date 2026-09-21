#!/usr/bin/env node

import AxeBuilder from "@axe-core/playwright";
import { chromium, webkit } from "playwright";

const url = process.argv[2];

if (!url) {
  console.error("usage: node testing/homepage-hardening.mjs <running-demo-url>");
  process.exit(2);
}

const expectedInstallUrl = "https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md";
const viewports = [
  { name: "narrow", width: 320, height: 568 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];
const themes = ["light", "dark"];
const failures = [];
const receipts = [];

function fail(scope, message) {
  failures.push(`${scope}: ${message}`);
}

function visibleControls(page) {
  return page.locator('a[href], button:not([disabled])').filter({ visible: true });
}

async function inspectStaticPage(page, scope, viewport, theme) {
  await page.goto(`${url}?theme=${theme}&hardening=${scope}`, { waitUntil: "domcontentloaded" });
  await page.locator('[data-ads-homepage][data-page-ready="true"]').waitFor({ timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.locator("[data-ember-character]").scrollIntoViewIfNeeded();
  await page.locator("[data-ember-character] img").evaluate(async (image) => {
    await image.decode();
  });

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blockingAxe = axe.violations.filter(({ impact }) => impact === "serious" || impact === "critical");
  for (const violation of blockingAxe) {
    fail(scope, `axe ${violation.id} has ${violation.nodes.length} serious or critical node(s)`);
  }

  const state = await page.evaluate(() => {
    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const controls = [...document.querySelectorAll('a[href], button:not([disabled])')]
      .filter(isVisible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: element.getAttribute("aria-label") || element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80),
          width: rect.width,
          height: rect.height,
        };
      });
    const images = [...document.querySelectorAll("img")]
      .filter(isVisible)
      .map((image) => ({
        src: image.currentSrc,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        width: image.getBoundingClientRect().width,
        height: image.getBoundingClientRect().height,
      }));
    const heroImage = document.querySelector("main figure img");
    const heroRect = heroImage?.getBoundingClientRect();
    return {
      theme: document.documentElement.dataset.theme,
      mainCount: document.querySelectorAll("main").length,
      h1Count: document.querySelectorAll("h1").length,
      practice: Boolean(document.querySelector("#practice")),
      start: Boolean(document.querySelector("#start")),
      ember: Boolean(document.querySelector("[data-ember-step]")),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      installLinks: [...document.querySelectorAll('a[href*="docs/INSTALL.md"]')].map((link) => link.href),
      controls,
      images,
      heroRatio: heroRect ? heroRect.width / heroRect.height : null,
      heroNaturalRatio: heroImage instanceof HTMLImageElement && heroImage.naturalHeight
        ? heroImage.naturalWidth / heroImage.naturalHeight
        : null,
    };
  });

  if (state.theme !== theme) fail(scope, `resolved ${state.theme ?? "no"} theme instead of ${theme}`);
  if (state.mainCount !== 1) fail(scope, `found ${state.mainCount} main landmarks`);
  if (state.h1Count !== 1) fail(scope, `found ${state.h1Count} h1 elements`);
  if (!state.practice || !state.start || !state.ember) fail(scope, "practice, start, or Ember section is missing");
  if (state.overflow > 1) fail(scope, `horizontal overflow is ${state.overflow}px`);
  if (state.installLinks.length !== 2 || state.installLinks.some((href) => href !== expectedInstallUrl)) {
    fail(scope, `install links are ${JSON.stringify(state.installLinks)}`);
  }
  for (const control of state.controls) {
    if (control.width < 44 || control.height < 44) {
      fail(scope, `control "${control.label}" is ${control.width.toFixed(1)}x${control.height.toFixed(1)}px`);
    }
  }
  for (const image of state.images) {
    if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
      fail(scope, `image failed to load: ${image.src || "missing src"}`);
    }
  }
  if (viewport.width <= 390 && state.heroRatio && state.heroNaturalRatio &&
      Math.abs(state.heroRatio - state.heroNaturalRatio) > 0.03) {
    fail(scope, `mobile hero ratio ${state.heroRatio.toFixed(3)} crops source ratio ${state.heroNaturalRatio.toFixed(3)}`);
  }

  receipts.push({ scope, viewport, theme, blockingAxe: blockingAxe.length, ...state });
}

async function inspectInteractions(browser, browserName) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const scope = `${browserName}/interactions`;
  try {
    await page.goto(`${url}?theme=light&interactions=${Date.now()}`, { waitUntil: "domcontentloaded" });
    await page.locator('[data-ads-homepage][data-page-ready="true"]').waitFor({ timeout: 20_000 });

    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    if (await page.evaluate(() => document.documentElement.dataset.theme) !== "dark") {
      fail(scope, "theme control did not apply dark theme");
    }
    if ((await page.getByRole("button", { name: "Switch to light theme" }).count()) !== 1) {
      fail(scope, "theme control did not expose its next action");
    }

    const ember = page.getByRole("button", { name: "Next observation from Ember" });
    const expectedSteps = ["1", "2", "3", "0"];
    for (const expectedStep of expectedSteps) {
      await ember.click();
      if (await page.locator("[data-ember-step]").getAttribute("data-ember-step") !== expectedStep) {
        fail(scope, `Ember did not advance to step ${expectedStep}`);
      }
    }
    const emberStatus = await page.getByRole("status").first().innerText();
    if (!emberStatus.startsWith("1 of 4.")) fail(scope, `Ember status is ${JSON.stringify(emberStatus)}`);

    const request = await page.locator("#example-request").innerText();
    await page.getByRole("button", { name: "Copy example request" }).click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent?.length > 0);
    const copyStatus = await page.locator('[role="status"]').last().innerText();
    if (!/Copied|Request selected/.test(copyStatus)) fail(scope, `copy fallback status is ${JSON.stringify(copyStatus)}`);
    const selected = await page.evaluate(() => window.getSelection()?.toString() ?? "");
    if (selected !== request && !copyStatus.startsWith("Copied")) {
      fail(scope, "copy fallback neither copied nor kept the request selected");
    }

    await page.goto(`${url}?theme=light&keyboard=${Date.now()}`, { waitUntil: "domcontentloaded" });
    await page.locator('[data-ads-homepage][data-page-ready="true"]').waitFor({ timeout: 20_000 });
    const skip = page.getByRole("link", { name: "Skip to content" });
    if (browserName === "Chromium") {
      await page.keyboard.press("Tab");
      if (!(await skip.evaluate((node) => node === document.activeElement))) fail(scope, "skip link is not first in tab order");
    } else {
      await skip.focus();
      if (!(await skip.evaluate((node) => node === document.activeElement))) fail(scope, "skip link cannot receive focus");
    }
    const outline = await skip.evaluate((node) => getComputedStyle(node).outlineWidth);
    if (Number.parseFloat(outline) < 2) fail(scope, `skip link outline is ${outline}`);
    await skip.press("Enter");
    if (!(await page.locator("main").evaluate((node) => node === document.activeElement))) {
      fail(scope, "skip link did not move focus to main");
    }
  } finally {
    await context.close();
  }

  const reducedContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  try {
    await reducedPage.goto(`${url}?theme=light&reduced=${Date.now()}`, { waitUntil: "domcontentloaded" });
    await reducedPage.locator('[data-ads-homepage][data-page-ready="true"]').waitFor({ timeout: 20_000 });
    await reducedPage.getByRole("button", { name: "Next observation from Ember" }).click();
    const animationCount = await reducedPage.locator("[data-ember-character] img").evaluate((node) => node.getAnimations().length);
    if (animationCount !== 0) fail(`${browserName}/reduced-motion`, `Ember retained ${animationCount} animation(s)`);
  } finally {
    await reducedContext.close();
  }
}

for (const [browserName, browserType] of [["Chromium", chromium], ["WebKit", webkit]]) {
  const browser = await browserType.launch({ headless: true });
  try {
    for (const viewport of viewports) {
      for (const theme of themes) {
        const context = await browser.newContext({ viewport, colorScheme: theme });
        const page = await context.newPage();
        const scope = `${browserName}/${viewport.name}/${theme}`;
        page.on("pageerror", (error) => fail(scope, `page error: ${error.message}`));
        try {
          await inspectStaticPage(page, scope, viewport, theme);
        } finally {
          await context.close();
        }
      }
    }
    await inspectInteractions(browser, browserName);
  } finally {
    await browser.close();
  }
}

if (process.env.ADS_HOMEPAGE_RECEIPTS === "1") {
  console.log(JSON.stringify(receipts, null, 2));
}

if (failures.length > 0) {
  console.error("homepage hardening failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`homepage hardening passed: ${receipts.length} Chromium/WebKit viewport and theme cases, copy/theme/Ember/skip interactions, reduced motion, accessibility, image integrity, and mobile crop checks`);
