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

async function settleMotionFrame(page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
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
  await page.waitForFunction(
    (targetStage) => {
      const climber = document.querySelector(".assembly-climber");
      return climber?.getAttribute("data-phase") === "arriving" &&
        climber.getAttribute("data-station") === targetStage;
    },
    stage,
    { timeout: 3_000 },
  );
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

try {
  const page = await withBrowserStepTimeout(
    browser.newPage({ viewport: { width: 390, height: 844 } }),
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
  await page.locator(".assembly-climber img").evaluate((node) => {
    node.dataset.mountProbe = "assembly-ember";
  });
  const railAlignment = await page.evaluate(() => {
    const mouth = document.querySelector(".hero-track-mouth").getBoundingClientRect();
    const track = document.querySelector(".continuous-track").getBoundingClientRect();
    return {
      centerDelta: Math.abs((mouth.left + mouth.width / 2) - (track.left + track.width / 2)),
      widthDelta: Math.abs(mouth.width - track.width),
    };
  });
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const climberTransforms = new Set([initialClimber.transform]);

  for (let step = 0; step <= 24; step += 1) {
    await page.evaluate(({ step, pageHeight }) => {
      document.documentElement.style.scrollBehavior = "auto";
      document.documentElement.scrollTop = (pageHeight * step) / 24;
      document.body.scrollTop = (pageHeight * step) / 24;
    }, { step, pageHeight });
    await settleMotionFrame(page);
    climberTransforms.add(await page.locator(".assembly-climber-figure").evaluate((node) => getComputedStyle(node).transform));
  }

  const stationStop = await settleAtStation(page, "evidence");

  const facts = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
    layoutShift: window.__adsLayoutShift || 0,
    artifacts: document.querySelectorAll(".ads-artifact").length,
    artifactStages: [...document.querySelectorAll(".ads-artifact")].map((node) => node.getAttribute("data-artifact")),
    climberImages: document.querySelectorAll(".assembly-climber img").length,
    climberMotion: document.querySelector(".assembly-climber").getAttribute("data-motion"),
    climberPosition: getComputedStyle(document.querySelector(".assembly-climber")).position,
    handoffs: document.querySelectorAll(".release-handoff").length,
    activeStations: document.querySelectorAll('.station[data-active="true"]').length,
    stationPhase: document.querySelector(".assembly-climber").getAttribute("data-phase"),
    activeStage: document.querySelector(".assembly-climber").getAttribute("data-station"),
    stopAnimation: getComputedStyle(document.querySelector(".assembly-climber-stop")).animationName,
    imageStayedMounted: document.querySelector(".assembly-climber img")?.dataset.mountProbe === "assembly-ember",
    climberZ: Number.parseInt(getComputedStyle(document.querySelector(".assembly-climber")).zIndex, 10),
    stationZ: Number.parseInt(getComputedStyle(document.querySelector('.station[data-stage="evidence"]')).zIndex, 10),
    releaseBackground: getComputedStyle(document.querySelector(".release-bay")).backgroundColor,
  }));
  const finalClimber = await page.locator(".assembly-climber").evaluate((node) => ({
    documentTop: window.scrollY + node.getBoundingClientRect().top,
  }));
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
  if (railAlignment.centerDelta > 0.5 || railAlignment.widthDelta > 0.5) failures.push(`mobile rail mismatch is ${railAlignment.centerDelta.toFixed(1)}px center / ${railAlignment.widthDelta.toFixed(1)}px width`);
  if (footerBounce.animationName !== "ember-peek-pop") failures.push(`footer bounce animation is ${footerBounce.animationName}`);
  if (!footerBounce.imageLoaded || !footerBounce.imageStayedMounted || footerBounce.opacity < 1) failures.push(`footer Ember visibility failed: ${JSON.stringify(footerBounce)}`);
  if (facts.handoffs) failures.push("release handoff is still rendered");
  const { arrival, peeking, resting, persistent, repeated } = stationStop;
  if (
    arrival.phase !== "arriving" || arrival.pose !== "climb" || arrival.station !== "evidence" ||
    arrival.animationName !== "ember-stop-evidence" || !arrival.imageSrc?.includes("ember-climbing") ||
    arrival.imageCount !== 1 || arrival.arrivingStations !== 1 || !arrival.imageStayedMounted
  ) {
    failures.push(`station arrival failed: ${JSON.stringify(arrival)}`);
  }
  if (
    peeking.phase !== "peeking" || peeking.pose !== "peek" || peeking.station !== "evidence" ||
    !peeking.imageSrc?.includes("ember-peek") || peeking.imageCount !== 1 || !peeking.imageStayedMounted
  ) {
    failures.push(`station peek failed: ${JSON.stringify(peeking)}`);
  }
  for (const [label, state] of [["resting", resting], ["persistent", persistent], ["repeated", repeated]]) {
    if (
      state.phase !== "resting" || state.pose !== "peek" || state.station !== "evidence" ||
      state.animationName !== "none" || !state.imageSrc?.includes("ember-peek") ||
      state.imageCount !== 1 || state.activeStations !== 1 || state.arrivingStations !== 0 ||
      !state.imageStayedMounted || !(state.climberZ < state.stationZ) || !state.markerOwnsTopLayer
    ) {
      failures.push(`station ${label} state/occlusion failed: ${JSON.stringify(state)}`);
    }
  }
  if (
    arrival.reactionCount !== resting.reactionCount || resting.reactionCount !== persistent.reactionCount ||
    persistent.reactionCount !== repeated.reactionCount
  ) {
    failures.push(`station reaction count changed within one visit: ${JSON.stringify({
      arrival: arrival.reactionCount,
      resting: resting.reactionCount,
      persistent: persistent.reactionCount,
      repeated: repeated.reactionCount,
    })}`);
  }
  if (facts.releaseBackground !== "rgb(232, 93, 38)") failures.push(`release background is ${facts.releaseBackground}`);

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`WebKit recovery passed: 5 artifacts, station-aware rail-following Ember behind the machines, no overflow, CLS ${facts.layoutShift.toFixed(3)}, orange release`);
  }
} finally {
  await browser.close();
}
