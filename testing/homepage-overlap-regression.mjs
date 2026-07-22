#!/usr/bin/env node

import { chromium, webkit } from "playwright";

const url = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!url) {
  console.error("usage: node testing/homepage-overlap-regression.mjs <running-demo-url>");
  process.exit(2);
}

const widths = [267, 320, 390, 479, 610, 664, 720, 768, 811, 958, 1040, 1074, 1280, 1622];
const issues = [];
const requestedBrowser = (process.env.ADS_OVERLAP_BROWSER ?? "chromium").toLowerCase();
const browserOptions = {
  chromium: ["Chromium", chromium],
  webkit: ["WebKit", webkit],
};
const selectedBrowser = browserOptions[requestedBrowser];

if (!selectedBrowser) {
  console.error(`unsupported ADS_OVERLAP_BROWSER: ${requestedBrowser}`);
  process.exit(2);
}

const [browserName, browserType] = selectedBrowser;
const browser = await browserType.launch({ headless: true });

function fail(width, message) {
  issues.push(`${browserName} ${width}px: ${message}`);
}

try {
  for (const width of widths) {
    console.log(`[homepage-overlap] ${browserName} ${width}px`);
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.locator('main[data-ads-homepage][data-page-ready="true"]').waitFor();

    const layout = await page.evaluate(() => {
      const rect = (selector) => {
        const box = document.querySelector(selector)?.getBoundingClientRect();
        return box
          ? {
              top: box.top,
              right: box.right,
              bottom: box.bottom,
              left: box.left,
              width: box.width,
              height: box.height,
            }
          : null;
      };
      const overlap = (a, b) => Boolean(a && b && Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top));
      const commandFit = (rootSelector) => {
        const root = document.querySelector(rootSelector);
        const code = root?.querySelector(".hero-command-code")?.getBoundingClientRect();
        const copy = root?.querySelector(".hero-command-copy")?.getBoundingClientRect();
        const lines = [...(root?.querySelectorAll(".hero-command-text > span") ?? [])].map((line) => {
          const box = line.getBoundingClientRect();
          return {
            text: line.textContent?.trim() ?? "",
            top: box.top,
            left: box.left,
            right: box.right,
          };
        });
        const textRightEdge = code && copy ? Math.min(code.right, copy.left) : null;
        return {
          code: code ? { left: code.left, right: code.right } : null,
          copy: copy ? { left: copy.left, right: copy.right } : null,
          lines,
          singleRow: lines.length === 3 && Math.max(...lines.map((line) => line.top)) - Math.min(...lines.map((line) => line.top)) < 1,
          fits: Boolean(code && copy && lines.length === 3 && textRightEdge !== null && lines.every((line) => line.left >= code.left - 1 && line.right <= textRightEdge - 4)),
        };
      };

      const heroCommand = rect(".hero-actions .hero-command-strip");
      const tour = rect(".tour-link");
      const introHeading = rect(".line-intro h2");
      const rail = rect(".continuous-track");

      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        heroActionOverlap: overlap(heroCommand, tour),
        heroCommand: commandFit(".hero-actions .hero-command-strip"),
        releaseCommand: commandFit(".release-primary-action .hero-command-strip"),
        introRailOverlap: overlap(introHeading, rail),
        heroCommandBox: heroCommand,
        tourBox: tour,
        introHeading,
        rail,
      };
    });

    if (layout.overflow > 0) fail(width, `page overflows horizontally by ${layout.overflow}px`);
    if (layout.heroActionOverlap) {
      fail(width, `hero install command overlaps “See one UI run”: ${JSON.stringify({ command: layout.heroCommandBox, tour: layout.tourBox })}`);
    }
    if (!layout.heroCommand.fits) {
      fail(width, `hero command text clips into its Copy control: ${JSON.stringify(layout.heroCommand)}`);
    }
    if (!layout.releaseCommand.fits) {
      fail(width, `release command text clips into its Copy control: ${JSON.stringify(layout.releaseCommand)}`);
    }
    if (width >= 1041 && !layout.releaseCommand.singleRow) {
      fail(width, `desktop release install command is not a single row: ${JSON.stringify(layout.releaseCommand)}`);
    }
    if (layout.introRailOverlap) {
      fail(width, `“One request” heading occupies the rail lane: ${JSON.stringify({ heading: layout.introHeading, rail: layout.rail })}`);
    }

    if (width <= 720) {
      const startState = await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = "auto";
        const floor = document.querySelector(".factory-floor");
        const climber = document.querySelector(".assembly-climber");
        const figure = document.querySelector(".assembly-climber-figure");
        if (!floor || !climber || !figure) return { missing: true };

        const floorTop = floor.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, Math.max(0, floorTop - 320));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const figureRect = figure.getBoundingClientRect();
        const initial = {
          phase: climber.getAttribute("data-phase"),
          pose: climber.getAttribute("data-pose"),
          figureAnimation: getComputedStyle(figure).animationName,
          imageAnimation: getComputedStyle(figure.querySelector(".assembly-climber-image")).animationName,
        };

        window.scrollTo(0, floorTop + 40);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        window.scrollTo(0, Math.max(0, floorTop - 320));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await new Promise((resolve) => setTimeout(resolve, 240));

        return {
          missing: false,
          ...initial,
          returnPhase: climber.getAttribute("data-phase"),
          returnPose: climber.getAttribute("data-pose"),
          floorTop: floor.getBoundingClientRect().top,
          figureTop: figureRect.top,
        };
      });

      if (startState.missing) fail(width, "missing mobile Ember start-state target");
      else if (startState.phase !== "staged" || startState.pose !== "peek" || startState.figureAnimation !== "none" || startState.imageAnimation !== "none" || startState.returnPhase !== "staged" || startState.returnPose !== "peek") {
        fail(width, `Ember is not staged in a still pose at the top of the rail: ${JSON.stringify(startState)}`);
      }
    }

    const terminalDock = await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto";
      const floor = document.querySelector(".factory-floor");
      const sign = document.querySelector(".track-end");
      const climber = document.querySelector(".assembly-climber");
      const ember = document.querySelector(".assembly-climber-figure");
      const image = ember?.querySelector("img");
      if (!floor || !sign || !climber || !ember || !image) return { missing: true };

      image.dataset.mountProbe = "terminal-dock-ember";

      const floorTop = floor.getBoundingClientRect().top + window.scrollY;
      const floorBottom = floorTop + floor.getBoundingClientRect().height;
      const signTop = sign.getBoundingClientRect().top + window.scrollY;
      const stickyTop = Number.parseFloat(getComputedStyle(ember.parentElement).top) || 0;
      const figureOffset = Number.parseFloat(getComputedStyle(ember).top) || 0;
      const alignmentScroll = signTop - stickyTop - figureOffset;
      const contactScroll = alignmentScroll - ember.offsetHeight;
      const start = Math.max(0, floorTop - window.innerHeight, contactScroll - 152);
      const end = Math.min(document.documentElement.scrollHeight - window.innerHeight, floorBottom, contactScroll + 48);
      const positions = [];
      for (let scrollY = start; scrollY <= end; scrollY += 12) positions.push(scrollY);
      positions.push(Math.min(document.documentElement.scrollHeight - window.innerHeight, floorBottom, alignmentScroll), Math.min(document.documentElement.scrollHeight - window.innerHeight, floorBottom, alignmentScroll + sign.offsetHeight));
      positions.sort((a, b) => a - b);

      const states = new Set();
      const forwardDockX = new Map();
      let maxOverlapArea = 0;
      let worstOverlap = null;
      let dockedFrame = null;
      let maxForwardStep = 0;
      let previousLeft = null;

      const capture = async (scrollY) => {
        window.scrollTo(0, scrollY);
        window.dispatchEvent(new Event("scroll"));
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const a = sign.getBoundingClientRect();
        const b = ember.getBoundingClientRect();
        const overlapWidth = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const overlapHeight = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const overlapArea = overlapWidth * overlapHeight;
        const terminal = climber.getAttribute("data-terminal");
        const dockSide = climber.getAttribute("data-dock-side");
        const dockX = Number.parseFloat(getComputedStyle(climber).getPropertyValue("--climber-dock-x")) || 0;
        const visibilityPoints = [0.15, 0.5, 0.85].flatMap((x) => [0.15, 0.5, 0.85].map((y) => document.elementFromPoint(b.left + b.width * x, b.top + b.height * y)));
        const frame = {
          scrollY,
          terminal,
          dockSide,
          dockX,
          gapX: b.left - a.right,
          verticalGap: a.top - b.bottom,
          verticalOverlap: overlapHeight,
          withinViewport: b.left >= -0.5 && b.right <= window.innerWidth + 0.5,
          unoccluded: visibilityPoints.every((element) => element === ember || ember.contains(element)),
          sign: {
            top: a.top,
            right: a.right,
            bottom: a.bottom,
            left: a.left,
          },
          ember: {
            top: b.top,
            right: b.right,
            bottom: b.bottom,
            left: b.left,
          },
        };
        states.add(terminal);
        if (overlapArea > maxOverlapArea) {
          maxOverlapArea = overlapArea;
          worstOverlap = {
            ...frame,
            overlapArea,
            overlapWidth,
            overlapHeight,
          };
        }
        if (terminal === "docked" && overlapHeight > 1 && (!dockedFrame || Math.abs(frame.verticalGap) < Math.abs(dockedFrame.verticalGap))) {
          dockedFrame = frame;
        }
        return frame;
      };

      for (const scrollY of positions) {
        const frame = await capture(scrollY);
        forwardDockX.set(scrollY, frame.dockX);
        if (previousLeft !== null) maxForwardStep = Math.max(maxForwardStep, Math.abs(frame.ember.left - previousLeft));
        previousLeft = frame.ember.left;
      }

      let maxReverseDelta = 0;
      const reversePositions = positions.filter((_, index) => index % 2 === 0 || index === positions.length - 1);
      for (const scrollY of [...reversePositions].reverse()) {
        const frame = await capture(scrollY);
        maxReverseDelta = Math.max(maxReverseDelta, Math.abs(frame.dockX - (forwardDockX.get(scrollY) ?? frame.dockX)));
      }

      const signRect = sign.getBoundingClientRect();
      const signCenter = document.elementFromPoint((signRect.left + signRect.right) / 2, (signRect.top + signRect.bottom) / 2);
      return {
        missing: false,
        states: [...states],
        maxOverlapArea,
        worstOverlap,
        dockedFrame,
        maxForwardStep,
        maxReverseDelta,
        returnedTerminal: climber.getAttribute("data-terminal"),
        imageCount: ember.querySelectorAll("img").length,
        imageStayedMounted: image.dataset.mountProbe === "terminal-dock-ember",
        signLegible: signCenter === sign || sign.contains(signCenter),
      };
    });

    if (terminalDock.missing) fail(width, "missing End of run or Ember terminal-dock target");
    else {
      if (terminalDock.maxOverlapArea > 1) {
        fail(width, `Ember overlaps the End of run sign: ${JSON.stringify(terminalDock.worstOverlap)}`);
      }
      if (!terminalDock.states.includes("approaching") || !terminalDock.states.includes("docked")) {
        fail(width, `Ember terminal states are incomplete: ${JSON.stringify(terminalDock.states)}`);
      }
      if (!terminalDock.dockedFrame) {
        fail(width, "Ember never reaches a visible docked frame beside the End of run sign");
      } else {
        if (terminalDock.dockedFrame.dockSide !== "right") {
          fail(width, `Ember docks on ${terminalDock.dockedFrame.dockSide ?? "no side"}, expected the open right side`);
        }
        if (terminalDock.dockedFrame.gapX < 15.5 || terminalDock.dockedFrame.gapX > 32) {
          fail(width, `Ember terminal gap is ${terminalDock.dockedFrame.gapX.toFixed(1)}px, expected 16–32px`);
        }
        if (!terminalDock.dockedFrame.withinViewport) {
          fail(width, `Ember is clipped at the terminal dock: ${JSON.stringify(terminalDock.dockedFrame.ember)}`);
        }
        if (!terminalDock.dockedFrame.unoccluded) {
          fail(width, `Ember is still occluded at the terminal dock: ${JSON.stringify(terminalDock.dockedFrame.ember)}`);
        }
      }
      if (terminalDock.maxForwardStep > 18) {
        fail(width, `Ember teleports ${terminalDock.maxForwardStep.toFixed(1)}px between adjacent terminal frames`);
      }
      if (terminalDock.maxReverseDelta > 0.75) {
        fail(width, `reverse scroll diverges by ${terminalDock.maxReverseDelta.toFixed(2)}px from the forward path`);
      }
      if (terminalDock.returnedTerminal !== "none") {
        fail(width, `Ember returns from the terminal as ${terminalDock.returnedTerminal}, expected none`);
      }
      if (terminalDock.imageCount !== 1 || !terminalDock.imageStayedMounted) {
        fail(width, `Ember image continuity failed: ${JSON.stringify({ imageCount: terminalDock.imageCount, stayedMounted: terminalDock.imageStayedMounted })}`);
      }
      if (!terminalDock.signLegible) fail(width, "End of run sign is not topmost at its center");
    }

    const footerLayout = await page.evaluate(() => {
      const footer = document.querySelector(".site-footer");
      const ember = document.querySelector(".footer-ember");
      const metaLink = document.querySelector(".footer-meta a");
      if (!footer || !ember || !metaLink) return { missing: true };

      const footerRect = footer.getBoundingClientRect();
      const emberRect = ember.getBoundingClientRect();
      const metaLinkRect = metaLink.getBoundingClientRect();
      const overlap = (a, b) => Boolean(Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top));
      const clipped = [...footer.querySelectorAll("p, a")]
        .filter((element) => {
          const styles = getComputedStyle(element);
          const box = element.getBoundingClientRect();
          return styles.display !== "none" && styles.visibility !== "hidden" && box.width > 1 && box.height > 1;
        })
        .map((element) => {
          const box = element.getBoundingClientRect();
          return {
            text: element.textContent?.trim().replace(/\s+/g, " ") ?? "",
            left: box.left,
            right: box.right,
          };
        })
        .filter((element) => element.left < footerRect.left - 1 || element.right > footerRect.right + 1);

      return {
        missing: false,
        emberMetaOverlap: overlap(emberRect, metaLinkRect),
        clipped,
        ember: {
          top: emberRect.top,
          right: emberRect.right,
          bottom: emberRect.bottom,
          left: emberRect.left,
        },
        metaLink: {
          top: metaLinkRect.top,
          right: metaLinkRect.right,
          bottom: metaLinkRect.bottom,
          left: metaLinkRect.left,
        },
      };
    });

    if (footerLayout.missing) fail(width, "missing footer collision target");
    else {
      if (footerLayout.emberMetaOverlap) {
        fail(width, `footer Ember overlaps the author link: ${JSON.stringify({ ember: footerLayout.ember, metaLink: footerLayout.metaLink })}`);
      }
      if (footerLayout.clipped.length > 0) {
        fail(width, `footer content clips outside its lane: ${JSON.stringify(footerLayout.clipped)}`);
      }
    }

    await page.close();
  }
} finally {
  await browser.close();
}

if (issues.length > 0) {
  console.error("homepage overlap regression failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`homepage overlap regression passed in ${browserName} at ${widths.join("/")}px`);
