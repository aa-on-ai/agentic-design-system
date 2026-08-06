#!/usr/bin/env node

import { AxeBuilder } from "@axe-core/playwright";
import { chromium, webkit } from "playwright";

const baseUrl = (process.argv[2] ?? process.env.ADS_DEMO_URL)?.replace(/\/$/, "");

if (!baseUrl) {
  console.error("usage: node testing/demo-accessibility-regression.mjs <running-demo-url>");
  process.exit(2);
}

const repairedRoutes = [
  "/after/canopy",
  "/after/notion-ai-settings",
  "/after/pawprint",
];

const beforeRoutes = [
  "/before/canopy",
  "/before/notion-ai-settings",
  "/before/pawprint",
];

const requestedBrowser = process.env.ADS_TEST_BROWSER?.toLowerCase();
const browserCases = [
  { name: "Chromium", browserType: chromium },
  { name: "WebKit", browserType: webkit },
].filter(({ name }) => !requestedBrowser || name.toLowerCase() === requestedBrowser);

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 },
];

const failures = [];
const receipts = [];
const transitions = [];

function fail(scope, message) {
  failures.push(`${scope}: ${message}`);
}

function progress(scope) {
  if (process.env.ADS_TEST_PROGRESS === "1") console.error(`[demo-accessibility] ${scope}`);
}

async function auditRenderedState(page, scope) {
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blockingViolations = axe.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical"
  );
  for (const violation of blockingViolations) {
    const targets = violation.nodes
      .slice(0, 3)
      .map((node) => node.target.join(" "))
      .join(", ");
    fail(
      scope,
      `${violation.id} (${violation.nodes.length} node${violation.nodes.length === 1 ? "" : "s"}: ${targets})`
    );
  }

  const rendered = await page.evaluate(() => {
    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const isActiveRegion = (element) => isVisible(element) && !element.closest("[inert]");

    const interactive = [
      ...document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [role="switch"]'
      ),
    ]
      .filter((element, index, elements) => elements.indexOf(element) === index)
      .filter(isVisible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          element: element.tagName.toLowerCase(),
          label:
            element.getAttribute("aria-label") ||
            element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ||
            element.getAttribute("placeholder") ||
            element.getAttribute("name") ||
            "unlabelled control",
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
        };
      });

    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      undersized: interactive.filter((control) => control.width < 48 || control.height < 48),
      ambiguousNames: interactive.filter((control) =>
        ["loaded", "manage", "reconnect", "retry"].includes(control.label.toLowerCase())
      ),
      deadButtons: [...document.querySelectorAll("main button")].flatMap((element) => {
        if (!isVisible(element) || element.hasAttribute("disabled")) return [];
        const handledSubmit = element.type === "submit" && element.form?.hasAttribute("data-ads-handled-submit");
        return typeof element.onclick === "function" || handledSubmit
          ? []
          : [element.getAttribute("aria-label") || element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80)];
      }),
      textBelowFloor: [...document.querySelectorAll("main *")].flatMap((element) => {
        if (!isVisible(element)) return [];
        const ownsText = [...element.childNodes].some(
          (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
        );
        const size = Number.parseFloat(getComputedStyle(element).fontSize);
        return ownsText && size < 12
          ? [{ text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80), size }]
          : [];
      }),
      uppercaseText: [...document.querySelectorAll("main *")]
        .filter((element) => isVisible(element) && getComputedStyle(element).textTransform === "uppercase")
        .map((element) => element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80)),
      forbiddenGlyphText: /[→↗↓↑←•·]/u.test(document.querySelector("main")?.innerText ?? ""),
      hasLoadingRegion: [...document.querySelectorAll('[role="status"], [aria-live="polite"]')].some(isActiveRegion),
      hasErrorRegion: [...document.querySelectorAll('[role="alert"], [aria-live="assertive"]')].some(isActiveRegion),
    };
  });

  if (rendered.overflow > 1) {
    fail(scope, `horizontal overflow is ${rendered.overflow}px`);
  }
  for (const control of rendered.undersized) {
    fail(
      scope,
      `${control.element} "${control.label}" is ${control.width}x${control.height}px (expected >=48x48)`
    );
  }
  for (const control of rendered.ambiguousNames) {
    fail(scope, `${control.element} "${control.label}" needs more specific microcopy`);
  }
  for (const label of rendered.deadButtons) {
    fail(scope, `enabled button "${label}" has no behavior`);
  }
  for (const text of rendered.textBelowFloor) {
    fail(scope, `"${text.text}" renders at ${text.size}px (expected >=12px)`);
  }
  for (const text of rendered.uppercaseText) {
    fail(scope, `"${text}" is forced to uppercase`);
  }
  if (rendered.forbiddenGlyphText) {
    fail(scope, "main content contains a forbidden arrow or bullet glyph");
  }
  if (scope.endsWith("/loading") && !rendered.hasLoadingRegion) {
    fail(scope, "loading state has no active status or polite live region");
  }
  if (scope.endsWith("/error") && !rendered.hasErrorRegion) {
    fail(scope, "error state has no active alert or assertive live region");
  }
  receipts.push({
    scope,
    axeViolations: blockingViolations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.length,
    })),
    horizontalOverflow: rendered.overflow,
    undersizedTargets: rendered.undersized,
    ambiguousNames: rendered.ambiguousNames,
    deadButtons: rendered.deadButtons,
    textBelowFloor: rendered.textBelowFloor,
    uppercaseText: rendered.uppercaseText,
    forbiddenGlyphText: rendered.forbiddenGlyphText,
    hasLoadingRegion: rendered.hasLoadingRegion,
    hasErrorRegion: rendered.hasErrorRegion,
  });
}

for (const { name: browserName, browserType } of browserCases) {
  const browser = await browserType.launch({ headless: true });
  try {
    for (const route of repairedRoutes) {
      for (const viewport of viewports) {
        const scope = `${browserName}/${viewport.name}${route}`;
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
        page.setDefaultTimeout(10_000);
        try {
          progress(`${scope}/open`);
          await page.goto(`${baseUrl}${route}`, {
            waitUntil: "domcontentloaded",
            timeout: 30_000,
          });

          for (const state of ["Default", "Loading", "Empty", "Error"]) {
            const stateButton = page.getByRole("button", { name: state, exact: true });
            if ((await stateButton.count()) !== 1) {
              fail(scope, `missing unique ${state} demo-state control`);
              continue;
            }
            await stateButton.click();
            if (state !== "Default") {
              try {
                await page.waitForFunction(
                  () => document.querySelectorAll("[data-state-frame]").length === 2,
                  undefined,
                  { timeout: 1_000 },
                );
                const transition = await page.locator("[data-state-frame]").evaluateAll((frames) => ({
                  count: frames.length,
                  durations: frames.map((frame) => Number.parseFloat(getComputedStyle(frame).transitionDuration)),
                }));
                await page.waitForTimeout(60);
                transition.opacities = await page.locator("[data-state-frame]").evaluateAll((frames) =>
                  frames.map((frame) => Number.parseFloat(getComputedStyle(frame).opacity))
                );
                transitions.push({ scope: `${scope}/${state.toLowerCase()}`, ...transition });
                if (transition.durations.some((duration) => duration < 0.15)) {
                  fail(`${scope}/${state.toLowerCase()}`, "state change cross-fade is shorter than 150ms");
                } else if (!transition.opacities.every((opacity) => opacity > 0 && opacity < 1)) {
                  fail(`${scope}/${state.toLowerCase()}`, "state change does not visibly cross-fade both frames");
                }
              } catch {
                fail(`${scope}/${state.toLowerCase()}`, "state change did not render two transition frames");
              }
            }
            await page.waitForTimeout(100);
            progress(`${scope}/${state.toLowerCase()}`);
            await auditRenderedState(page, `${scope}/${state.toLowerCase()}`);

            if (route === "/after/pawprint" && state === "Default") {
              const metricCard = page.getByText("Walks scheduled today", { exact: true }).locator("..");
              const metricStyle = await metricCard.evaluate((element) => ({
                background: getComputedStyle(element).backgroundColor,
                color: getComputedStyle(element).color,
              }));
              if (metricStyle.background === "rgb(255, 255, 255)" || metricStyle.background === metricStyle.color) {
                fail(
                  `${scope}/default`,
                  `emphasized metric renders ${metricStyle.color} text on ${metricStyle.background}`
                );
              }
            }
          }

          if (route === "/after/canopy" && viewport.name === "mobile") {
            await page.emulateMedia({ reducedMotion: "reduce" });
            await page.getByRole("button", { name: "Default", exact: true }).click();
            await page.waitForTimeout(40);
            const reducedMotionFrames = await page.locator("[data-state-frame]").count();
            transitions.push({
              scope: `${scope}/reduced-motion`,
              count: reducedMotionFrames,
              durations: [],
              opacities: [],
            });
            if (reducedMotionFrames !== 1) {
              fail(`${scope}/reduced-motion`, `state change retained ${reducedMotionFrames} frames instead of settling immediately`);
            }
          }
        } finally {
          await context.close();
        }
      }
    }

    const metadataContext = await browser.newContext({ viewport: viewports[0] });
    const metadataPage = await metadataContext.newPage();
    try {
      for (const route of beforeRoutes) {
        const scope = `${browserName}/sandbox${route}`;
        progress(scope);
        await metadataPage.goto(`${baseUrl}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });
        const robotsLocator = metadataPage.locator('meta[name="robots"]');
        const robots = (await robotsLocator.count()) > 0
          ? await robotsLocator.first().getAttribute("content")
          : null;
        if (!robots?.toLowerCase().includes("noindex")) {
          fail(scope, `robots metadata is ${robots ?? "missing"} (expected noindex)`);
        }
      }
    } finally {
      await metadataContext.close();
    }
  } finally {
    await browser.close();
  }
}

const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
const robotsText = await robotsResponse.text();
if (!robotsResponse.ok) {
  fail("robots.txt", `request returned ${robotsResponse.status}`);
} else if (!/^Disallow: \/before\/$/m.test(robotsText)) {
  fail("robots.txt", 'missing "Disallow: /before/"');
}

if (failures.length > 0) {
  console.error(JSON.stringify({ status: "failed", failures, receipts, transitions }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: "passed", receipts, transitions }, null, 2));
