#!/usr/bin/env node

import AxeBuilder from "@axe-core/playwright";
import { chromium, webkit } from "playwright";

const url = process.argv[2];

if (!url) {
  console.error("usage: node testing/homepage-hardening.mjs <running-demo-url>");
  process.exit(2);
}

const expectedInstallCommand =
  "npx skills add aa-on-ai/agentic-design-system --agent codex --copy --yes";
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];
const browserTypes = [
  ["Chromium", chromium],
  ["WebKit", webkit],
].filter(([name]) => {
  const requested = (process.env.ADS_HOMEPAGE_BROWSERS ?? "chromium,webkit")
    .split(",")
    .map((value) => value.trim().toLowerCase());
  return requested.includes(name.toLowerCase());
});
const failures = [];
const receipts = [];
const browserStepTimeoutMs = 20_000;

function fail(scope, message) {
  failures.push(`${scope}: ${message}`);
}

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

async function waitForPage(page) {
  await page.locator("#main-content").waitFor({ state: "attached", timeout: 20_000 });
  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    undefined,
    { timeout: 20_000 },
  );
}

async function inspectRenderedPage(page) {
  return page.evaluate(() => {
    const interactive = [...document.querySelectorAll('a[href], button:not([disabled])')]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label:
            element.getAttribute("aria-label") ||
            element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ||
            element.tagName,
          width: rect.width,
          height: rect.height,
        };
      });

    return {
      theme: document.documentElement.dataset.theme,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      headings: document.querySelectorAll("h1").length,
      mainLandmarks: document.querySelectorAll("main").length,
      proofTabs: document.querySelectorAll('[role="tab"]').length,
      proofPanels: document.querySelectorAll('[role="tabpanel"]').length,
      installButtons: [...document.querySelectorAll("button")].filter(
        (button) => button.getAttribute("aria-label") === "Copy install command",
      ).length,
      smallTargets: interactive.filter((target) => target.width < 44 || target.height < 44),
    };
  });
}

async function verifyPage(page, scope, expectedTheme, checkTargets, checkAxe) {
  const rendered = await inspectRenderedPage(page);
  if (rendered.theme !== expectedTheme) {
    fail(scope, `theme is ${rendered.theme ?? "missing"}, expected ${expectedTheme}`);
  }
  if (rendered.overflow > 1) fail(scope, `horizontal overflow is ${rendered.overflow}px`);
  if (rendered.headings !== 1) fail(scope, `expected one h1, found ${rendered.headings}`);
  if (rendered.mainLandmarks !== 1) fail(scope, `expected one main landmark, found ${rendered.mainLandmarks}`);
  if (rendered.proofTabs !== 3 || rendered.proofPanels !== 1) {
    fail(scope, `proof structure is ${rendered.proofTabs} tabs / ${rendered.proofPanels} panels`);
  }
  if (rendered.installButtons !== 2) {
    fail(scope, `expected two install-copy controls, found ${rendered.installButtons}`);
  }
  if (checkTargets && rendered.smallTargets.length > 0) {
    fail(scope, `undersized targets: ${JSON.stringify(rendered.smallTargets)}`);
  }

  let axeViolations = 0;
  if (checkAxe) {
    const axe = await new AxeBuilder({ page }).analyze();
    axeViolations = axe.violations.length;
    if (axeViolations > 0) {
      fail(
        scope,
        `axe violations: ${axe.violations.map((violation) => `${violation.id} (${violation.nodes.length})`).join(", ")}`,
      );
    }
  }

  return { rendered, axeViolations };
}

async function verifyInteractions(page, scope) {
  const tabs = page.getByRole("tab");
  await tabs.nth(2).focus();
  await page.keyboard.press("Home");
  if ((await tabs.nth(0).getAttribute("aria-selected")) !== "true") {
    fail(scope, "Home did not select the first proof tab");
  }
  await page.keyboard.press("ArrowRight");
  if ((await tabs.nth(1).getAttribute("aria-selected")) !== "true") {
    fail(scope, "ArrowRight did not select the next proof tab");
  }
  await page.keyboard.press("End");
  if ((await tabs.nth(2).getAttribute("aria-selected")) !== "true") {
    fail(scope, "End did not select the last proof tab");
  }

  const copyButton = page.getByRole("button", { name: "Copy install command" }).first();
  await copyButton.click();
  await page.getByRole("status").filter({ hasText: "Install command copied" }).waitFor();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  if (clipboard !== expectedInstallCommand) {
    fail(scope, `clipboard received ${JSON.stringify(clipboard)}`);
  }

  const controls = page.locator('a[href], button:not([disabled]):not([tabindex="-1"])');
  const expectedCount = await controls.count();
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.locator(".skip-link").focus();
  const visited = new Set();
  for (let index = 0; index < expectedCount; index += 1) {
    if (index > 0) await page.keyboard.press("Tab");
    await page.waitForTimeout(60);
    const focus = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return null;
      const all = [...document.querySelectorAll('a[href], button:not([disabled]):not([tabindex="-1"])')];
      const style = getComputedStyle(element);
      return {
        index: all.indexOf(element),
        label: element.getAttribute("aria-label") || element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80),
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    });
    if (!focus) {
      fail(scope, `keyboard step ${index + 1} has no focused element`);
      continue;
    }
    visited.add(focus.index);
    if (focus.outlineStyle === "none" || focus.outlineWidth < 2) {
      fail(scope, `focus is not visibly outlined on ${focus.label || focus.index}`);
    }
  }
  if (visited.size !== expectedCount) {
    fail(scope, `keyboard reached ${visited.size}/${expectedCount} unique controls`);
  }
}

for (const [browserName, browserType] of browserTypes) {
  const browser = await withBrowserStepTimeout(
    browserType.launch({ headless: true }),
    `${browserName} launch`,
  );
  try {
    for (const viewport of viewports) {
      const scope = `${browserName}/${viewport.name}`;
      const context = await withBrowserStepTimeout(
        browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: "light",
          ...(browserName === "Chromium"
            ? { permissions: ["clipboard-read", "clipboard-write"] }
            : {}),
        }),
        `${scope} context startup`,
      );
      const page = await withBrowserStepTimeout(context.newPage(), `${scope} page startup`);
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await page.goto(`${url}?theme=light&matrix=${browserName}-${viewport.name}-${Date.now()}`, {
        waitUntil: "domcontentloaded",
      });
      await waitForPage(page);
      const light = await verifyPage(
        page,
        `${scope}/light`,
        "light",
        viewport.name === "mobile",
        browserName === "Chromium" && viewport.name === "mobile",
      );

      await page.getByRole("button", { name: "Switch to dark theme" }).click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
      const darkUrl = new URL(page.url());
      if (darkUrl.searchParams.get("theme") !== "dark") {
        fail(`${scope}/theme`, `theme URL is ${darkUrl.searchParams.get("theme") ?? "missing"}`);
      }
      const dark = await verifyPage(
        page,
        `${scope}/dark`,
        "dark",
        viewport.name === "mobile",
        browserName === "Chromium" && viewport.name === "mobile",
      );

      if (browserName === "Chromium" && viewport.name === "desktop") {
        await verifyInteractions(page, `${scope}/interactions`);
      }
      if (pageErrors.length > 0) fail(scope, `page errors: ${pageErrors.join(" | ")}`);

      receipts.push({ scope, light, dark });
      console.log(`${scope} passed`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

if (failures.length > 0) {
  console.error("homepage hardening failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `homepage hardening passed (${receipts.length} browser/viewport pairs, light + dark, axe, overflow, touch, copy, tabs, and keyboard)`,
);
