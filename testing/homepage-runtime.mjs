#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const url = process.argv[2];
const outArg = process.argv[3];

if (!url || !outArg) {
  console.error("usage: node testing/homepage-runtime.mjs <running-demo-url> <output.json>");
  process.exit(2);
}

const RUNS = 3;
const profiles = {
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    cpuRate: 4,
    network: {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      connectionType: "cellular4g",
    },
  },
  desktop: {
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  },
};

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

async function addObservers(page) {
  await page.addInitScript(() => {
    window.__adsVitals = {
      cls: 0,
      lcp: null,
      interactions: new Map(),
    };

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__adsVitals.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      window.__adsVitals.lcp = entries.at(-1) ?? window.__adsVitals.lcp;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    if (PerformanceObserver.supportedEntryTypes.includes("event")) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.interactionId) continue;
          const previous = window.__adsVitals.interactions.get(entry.interactionId) ?? 0;
          window.__adsVitals.interactions.set(entry.interactionId, Math.max(previous, entry.duration));
        }
      }).observe({ type: "event", buffered: true, durationThreshold: 16 });
    }
  });
}

async function runProfile(browser, profileName, runNumber) {
  const profile = profiles[profileName];
  const context = await browser.newContext({
    viewport: profile.viewport,
    deviceScaleFactor: profile.deviceScaleFactor,
    colorScheme: "dark",
    reducedMotion: "no-preference",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  await addObservers(page);

  let cdp;
  if (profile.network || profile.cpuRate) {
    cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    if (profile.network) await cdp.send("Network.emulateNetworkConditions", profile.network);
    if (profile.cpuRate) await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpuRate });
  }

  const startedAt = Date.now();
  await page.goto(`${url}?theme=dark&runtimeRun=${profileName}-${runNumber}-${startedAt}`, {
    waitUntil: "networkidle",
  });

  const initialHeroResources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("creative-pipeline"))
      .map((entry) => ({
        url: entry.name,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        duration: entry.duration,
        initiatorType: entry.initiatorType,
      })),
  );

  const themeToggle = page.getByRole("button", { name: /Switch to light theme/i });
  await themeToggle.click();
  await page.waitForTimeout(120);

  const copyButton = page.getByRole("button", { name: "Copy install command" }).first();
  await copyButton.click();
  await page.waitForTimeout(120);

  const result = await page.evaluate(() => {
    const lcp = window.__adsVitals.lcp;
    const interactionDurations = [...window.__adsVitals.interactions.values()];
    const heroResources = performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("creative-pipeline"))
      .map((entry) => ({
        url: entry.name,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        duration: entry.duration,
        initiatorType: entry.initiatorType,
      }));

    return {
      lcp: lcp?.startTime ?? null,
      lcpElement: lcp?.element
        ? {
            tag: lcp.element.tagName,
            className: lcp.element.className,
            url: lcp.url || null,
          }
        : null,
      cls: window.__adsVitals.cls,
      inp: interactionDurations.length ? Math.max(...interactionDurations) : 0,
      heroResources,
      finalTheme: document.documentElement.dataset.theme,
    };
  });

  result.initialHeroResources = initialHeroResources;

  if (cdp) await cdp.detach();
  await context.close();
  return result;
}

async function inspectThemeRequest(browser, theme) {
  const context = await browser.newContext({
    viewport: profiles.mobile.viewport,
    deviceScaleFactor: profiles.mobile.deviceScaleFactor,
    colorScheme: theme,
  });
  const page = await context.newPage();
  const heroResponses = [];
  page.on("response", (response) => {
    if (!response.url().includes("creative-pipeline")) return;
    const headers = response.headers();
    heroResponses.push({
      url: response.url(),
      status: response.status(),
      contentType: headers["content-type"] ?? null,
      contentLength: headers["content-length"] ?? null,
      cacheControl: headers["cache-control"] ?? null,
    });
  });
  await page.goto(`${url}?theme=${theme}&networkCheck=${Date.now()}`, { waitUntil: "networkidle" });

  const result = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    heroResources: performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("creative-pipeline"))
      .map((entry) => ({
        url: entry.name,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        duration: entry.duration,
        initiatorType: entry.initiatorType,
      })),
    heroImages: [...document.querySelectorAll(".hero-media img")].map((image) => ({
      src: image.currentSrc,
      width: image.naturalWidth,
      height: image.naturalHeight,
      fetchPriority: image.fetchPriority,
      visible: getComputedStyle(image).visibility !== "hidden" && getComputedStyle(image).opacity !== "0",
    })),
  }));

  result.heroResponses = heroResponses;

  await context.close();
  return result;
}

const browser = await chromium.launch({ headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  url,
  environment: {
    browser: await browser.version(),
    runs: RUNS,
    mobile: "390x844, DPR 2, 4x CPU slowdown, 150ms latency, 1.6Mbps down, 750Kbps up",
    desktop: "1280x900, DPR 1, no synthetic throttling",
    interaction: "theme toggle then install-copy; INP from PerformanceEventTiming interaction groups",
  },
  runs: {},
  medians: {},
  firstLoadThemes: {},
};

try {
  for (const profileName of Object.keys(profiles)) {
    report.runs[profileName] = [];
    for (let run = 1; run <= RUNS; run += 1) {
      report.runs[profileName].push(await runProfile(browser, profileName, run));
    }

    const completed = report.runs[profileName];
    report.medians[profileName] = {
      lcp: round(median(completed.map((item) => item.lcp ?? Number.POSITIVE_INFINITY))),
      cls: round(median(completed.map((item) => item.cls))),
      inp: round(median(completed.map((item) => item.inp))),
    };
  }

  report.firstLoadThemes.light = await inspectThemeRequest(browser, "light");
  report.firstLoadThemes.dark = await inspectThemeRequest(browser, "dark");
} finally {
  await browser.close();
}

const outPath = path.resolve(outArg);
await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.medians, null, 2));
console.log(`runtime report: ${outPath}`);
