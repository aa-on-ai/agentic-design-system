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
const pageReadySelector = 'main[data-ads-homepage][data-page-ready="true"]';
const expectedInstallCommand = "npx skills add aa-on-ai/agentic-design-system --agent codex --copy --yes";
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

async function settleMotionFrame(page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
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

async function gotoReady(page, target) {
  await page.goto(target, { waitUntil: "domcontentloaded" });
  await page.locator(pageReadySelector).waitFor({ state: "attached", timeout: 20_000 });
}

async function readStationState(page, stage) {
  return page.evaluate((targetStage) => {
    const climber = document.querySelector(".assembly-climber");
    const station = document.querySelector(`.station[data-stage="${targetStage}"]`);
    const marker = station?.querySelector(".station-index");
    const markerRect = marker?.getBoundingClientRect();
    const topAtMarker = markerRect
      ? document.elementsFromPoint(markerRect.left + markerRect.width / 2, markerRect.top + markerRect.height / 2)[0]
      : null;
    const image = climber?.querySelector("img");
    const stopWrap = climber?.querySelector(".assembly-climber-stop");
    return {
      phase: climber?.getAttribute("data-phase"),
      pose: climber?.getAttribute("data-pose"),
      station: climber?.getAttribute("data-station"),
      reactionCount: climber?.getAttribute("data-station-reaction-count"),
      animationName: stopWrap ? getComputedStyle(stopWrap).animationName : null,
      imageSrc: image instanceof HTMLImageElement ? image.currentSrc : null,
      imageCount: climber?.querySelectorAll("img").length ?? 0,
      activeStations: document.querySelectorAll('.station[data-active="true"]').length,
      arrivingStations: document.querySelectorAll('.station[data-arrival="true"]').length,
      imageStayedMounted: image?.dataset.mountProbe === "assembly-ember",
      climberZ: climber ? Number.parseInt(getComputedStyle(climber).zIndex, 10) : null,
      stationZ: station ? Number.parseInt(getComputedStyle(station).zIndex, 10) : null,
      markerOwnsTopLayer: topAtMarker instanceof Element && Boolean(topAtMarker.closest(".station")),
    };
  }, stage);
}

async function settleAtStation(page, stage) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.evaluate((targetStage) => {
      const figure = document.querySelector(".assembly-climber-figure");
      const marker = document.querySelector(`.station[data-stage="${targetStage}"] .station-index`);
      if (!figure || !marker) return;
      const figureRect = figure.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();
      window.scrollTo(
        0,
        window.scrollY + markerRect.top + markerRect.height / 2 - (figureRect.top + figureRect.height * 0.52),
      );
    }, stage);
    await page.waitForTimeout(60);
  }
  // The final alignment already waited 60ms; another 140ms observes arrival at ~200ms.
  await page.waitForTimeout(140);
  const arrival = await readStationState(page, stage);

  await page.waitForFunction(
    () => document.querySelector(".assembly-climber")?.getAttribute("data-phase") === "peeking",
    undefined,
    { timeout: 3_000 },
  );
  const peeking = await readStationState(page, stage);
  await page.waitForFunction(
    () => document.querySelector(".assembly-climber")?.getAttribute("data-phase") === "resting",
    undefined,
    { timeout: 3_000 },
  );
  const resting = await readStationState(page, stage);
  await page.waitForTimeout(120);
  const persistent = await readStationState(page, stage);

  await page.evaluate(() => window.scrollBy(0, 8));
  await page.waitForTimeout(60);
  await page.evaluate(() => window.scrollBy(0, -8));
  await page.waitForTimeout(760);
  const repeated = await readStationState(page, stage);

  return { arrival, peeking, resting, persistent, repeated };
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
    activeStations: document.querySelectorAll('.station[data-active="true"]').length,
    installGuideLinks: document.querySelectorAll('a[href*="docs/INSTALL.md"]').length,
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
    colorScheme: "dark",
  });
  const scope = `${browserName}/reduced-motion`;
  const page = await withBrowserStepTimeout(context.newPage(), `${scope} page startup`);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoReady(page, `${url}?theme=dark&reduced=${Date.now()}`);
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

  await page.getByRole("button", { name: "Make Ember bounce" }).click();
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
        ...(browserName === "Chromium" ? { permissions: ["clipboard-read", "clipboard-write"] } : {}),
      });
      const page = await withBrowserStepTimeout(context.newPage(), `${scope} page startup`);
      await context.addCookies([{ name: "ads-theme", value: "light", url }]);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await installObservers(page);

      await gotoReady(page, `${url}?matrix=${browserName}-${viewport.name}-${Date.now()}`);
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
      await page.locator(".assembly-climber img").evaluate((node) => {
        node.dataset.mountProbe = "assembly-ember";
      });
      const mobileRailAlignment = viewport.name === "mobile"
        ? await page.evaluate(() => {
            const mouth = document.querySelector(".hero-track-mouth").getBoundingClientRect();
            const track = document.querySelector(".continuous-track").getBoundingClientRect();
            return {
              centerDelta: Math.abs((mouth.left + mouth.width / 2) - (track.left + track.width / 2)),
              widthDelta: Math.abs(mouth.width - track.width),
            };
          })
        : null;
      const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      const climberTransforms = new Set([initialClimber.transform]);
      for (let step = 0; step <= 16; step += 1) {
        await page.evaluate(({ step, pageHeight }) => {
          document.documentElement.style.scrollBehavior = "auto";
          document.documentElement.scrollTop = (pageHeight * step) / 16;
          document.body.scrollTop = (pageHeight * step) / 16;
        }, { step, pageHeight });
        await settleMotionFrame(page);
        climberTransforms.add(await page.locator(".assembly-climber-figure").evaluate((node) => getComputedStyle(node).transform));
      }
      const finalClimber = await page.locator(".assembly-climber").evaluate((node) => ({
        documentTop: window.scrollY + node.getBoundingClientRect().top,
      }));
      const stationStop = viewport.name === "mobile" ? await settleAtStation(page, "rubric") : null;
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
      if (mobileRailAlignment && (mobileRailAlignment.centerDelta > 0.5 || mobileRailAlignment.widthDelta > 0.5)) {
        fail(scope, `mobile rail mismatch is ${mobileRailAlignment.centerDelta.toFixed(1)}px center / ${mobileRailAlignment.widthDelta.toFixed(1)}px width`);
      }
      if (new Set(scrolled.artifacts).size !== 5) fail(scope, `artifact count is ${new Set(scrolled.artifacts).size}`);
      if (scrolled.handoffs) fail(scope, "release handoff returned");
      if (scrolled.activeStations > 1) fail(scope, `${scrolled.activeStations} station states are active`);
      if (stationStop) {
        const { arrival, peeking, resting, persistent, repeated } = stationStop;
        if (
          arrival.phase !== "arriving" || arrival.pose !== "climb" || arrival.station !== "rubric" ||
          arrival.animationName !== "ember-stop-rubric" || !arrival.imageSrc?.includes("ember-climbing") ||
          arrival.imageCount !== 1 || arrival.arrivingStations !== 1 || !arrival.imageStayedMounted
        ) {
          fail(scope, `station arrival failed: ${JSON.stringify(arrival)}`);
        }
        if (
          peeking.phase !== "peeking" || peeking.pose !== "peek" || peeking.station !== "rubric" ||
          !peeking.imageSrc?.includes("ember-peek") || peeking.imageCount !== 1 || !peeking.imageStayedMounted
        ) {
          fail(scope, `station peek failed: ${JSON.stringify(peeking)}`);
        }
        for (const [label, state] of [["resting", resting], ["persistent", persistent], ["repeated", repeated]]) {
          if (
            state.phase !== "resting" || state.pose !== "peek" || state.station !== "rubric" ||
            state.animationName !== "none" || !state.imageSrc?.includes("ember-peek") ||
            state.imageCount !== 1 || state.activeStations !== 1 || state.arrivingStations !== 0 ||
            !state.imageStayedMounted || !(state.climberZ < state.stationZ) || !state.markerOwnsTopLayer
          ) {
            fail(scope, `station ${label} state/occlusion failed: ${JSON.stringify(state)}`);
          }
        }
        if (
          arrival.reactionCount !== resting.reactionCount || resting.reactionCount !== persistent.reactionCount ||
          persistent.reactionCount !== repeated.reactionCount
        ) {
          fail(scope, `station reaction count changed within one visit: ${JSON.stringify({
            arrival: arrival.reactionCount,
            resting: resting.reactionCount,
            persistent: persistent.reactionCount,
            repeated: repeated.reactionCount,
          })}`);
        }
      }
      if (scrolled.installGuideLinks !== 2) {
        fail(scope, `install/activation guide link count is ${scrolled.installGuideLinks}`);
      }
      if (scrolled.releaseBackground !== "rgb(232, 93, 38)") {
        fail(scope, `release background is ${scrolled.releaseBackground}`);
      }

      const keyboardOrder = browserName === "Chromium" ? await verifyKeyboard(page, scope) : [];

      await page.getByRole("button", { name: "Switch to dark theme" }).click();
      await waitForHero(page, "dark");
      await gotoReady(page, `${url}?persistence=${browserName}-${viewport.name}-${Date.now()}`);
      await waitForHero(page, "dark");
      const persisted = await inspectPage(page);
      if (persisted.theme !== "dark" || persisted.firstFrameTheme !== "dark") {
        fail(scope, `persisted theme is ${persisted.firstFrameTheme}/${persisted.theme}, expected dark/dark`);
      }
      if (persisted.heroResources.length !== 1 || !persisted.heroResources[0].includes("creative-pipeline-dark")) {
        fail(scope, `persisted first load requested ${persisted.heroResources.join(" | ") || "no hero"}`);
      }

      const copyButton = page.getByRole("button", { name: "Copy Codex install command" }).first();
      const renderedInstallCommand = await copyButton.locator("code").getAttribute("aria-label");
      if (renderedInstallCommand !== expectedInstallCommand) {
        fail(scope, `install command is ${renderedInstallCommand ?? "missing"}`);
      }
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

      await page.locator(".footer-ember-image img").evaluate((node) => {
        node.dataset.mountProbe = "footer-ember";
      });
      await page.getByRole("button", { name: "Make Ember bounce" }).click();
      await settleMotionFrame(page);
      const footerBounce = await page.locator(".footer-ember-image").evaluate((node) => {
        const image = node.querySelector("img");
        const style = getComputedStyle(node);
        return {
          animationName: style.animationName,
          imageLoaded: image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
          imageStayedMounted: image?.dataset.mountProbe === "footer-ember",
          opacity: Number.parseFloat(style.opacity),
        };
      });
      if (footerBounce.animationName !== "ember-peek-pop") {
        fail(scope, `footer bounce animation is ${footerBounce.animationName}`);
      }
      if (!footerBounce.imageLoaded || !footerBounce.imageStayedMounted || footerBounce.opacity < 1) {
        fail(scope, `footer Ember visibility failed: ${JSON.stringify(footerBounce)}`);
      }

      receipts.push({
        scope,
        cls: scrolled.cls,
        initialHero: initial.heroResources,
        persistedHero: persisted.heroResources,
        emberTravel: Math.round(finalClimber.documentTop - initialClimber.documentTop),
        emberCadenceStates: climberTransforms.size,
        mobileRailAlignment,
        stationStop,
        footerBounce,
        keyboardControls: keyboardOrder.length,
        copyFeedback: copyFeedback?.trim() ?? null,
      });
      await context.close();
    }

    await verifyReducedMotion(browser, browserName);
  } catch (error) {
    fail(browserName, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }
}

if (failures.length) {
  console.log(JSON.stringify(receipts, null, 2));
  console.error("homepage hardening failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify(receipts, null, 2));
console.log("homepage hardening passed: Chromium + WebKit at 390/768/1280, active-theme hero, smooth Ember rail motion, reduced motion, keyboard focus, copy feedback, and theme persistence");
