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

    const terminalExit = await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto";
      const floor = document.querySelector(".factory-floor");
      const track = document.querySelector(".continuous-track");
      const sign = document.querySelector(".track-end");
      const climber = document.querySelector(".assembly-climber");
      const ember = document.querySelector(".assembly-climber-figure");
      const image = ember?.querySelector("img");
      if (!floor || !track || !sign || !climber || !ember || !image) return { missing: true };

      image.dataset.mountProbe = "terminal-exit-ember";

      const floorTop = floor.getBoundingClientRect().top + window.scrollY;
      const floorBottom = floorTop + floor.getBoundingClientRect().height;
      const signTop = sign.getBoundingClientRect().top + window.scrollY;
      const stickyTop = Number.parseFloat(getComputedStyle(ember.parentElement).top) || 0;
      const figureOffset = Number.parseFloat(getComputedStyle(ember).top) || 0;
      const alignmentScroll = signTop - stickyTop - figureOffset;
      const contactScroll = alignmentScroll - ember.offsetHeight;
      const start = Math.max(0, floorTop - window.innerHeight, contactScroll - 96);
      const end = Math.min(document.documentElement.scrollHeight - window.innerHeight, floorBottom, alignmentScroll + ember.offsetHeight + sign.offsetHeight + 48);
      const positions = [];
      for (let scrollY = start; scrollY <= end; scrollY += 8) positions.push(scrollY);
      positions.push(alignmentScroll, alignmentScroll + sign.offsetHeight, end);
      positions.sort((a, b) => a - b);

      const states = new Set();
      let bestOcclusion = null;
      let firstExitedFrame = null;
      let visibleAfterExit = null;

      const capture = async (scrollY) => {
        window.scrollTo(0, scrollY);
        window.dispatchEvent(new Event("scroll"));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const a = sign.getBoundingClientRect();
        const b = ember.getBoundingClientRect();
        const overlapWidth = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const overlapHeight = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const terminal = climber.getAttribute("data-terminal");
        const centerDelta = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const coverage = b.width * b.height > 0 ? (overlapWidth * overlapHeight) / (b.width * b.height) : 0;
        const samplePoints = [0.2, 0.5, 0.8].flatMap((x) => [0.2, 0.5, 0.8].map((y) => ({ x: b.left + b.width * x, y: b.top + b.height * y })));
        const visibleSamples = samplePoints.filter(({ x, y }) => {
          if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) return false;
          const element = document.elementFromPoint(x, y);
          return element === ember || ember.contains(element);
        }).length;
        const styles = getComputedStyle(ember);
        const frame = {
          scrollY,
          terminal,
          centerDelta,
          coverage,
          signAboveEmber: overlapWidth > 1 && overlapHeight > 1 && visibleSamples < samplePoints.length,
          visuallyPresent: styles.visibility !== "hidden" && Number.parseFloat(styles.opacity) > 0.01 && visibleSamples > 0,
          visibleSamples,
          sign: { top: a.top, right: a.right, bottom: a.bottom, left: a.left },
          ember: { top: b.top, right: b.right, bottom: b.bottom, left: b.left },
        };
        states.add(terminal);
        if (!bestOcclusion || frame.coverage > bestOcclusion.coverage) {
          bestOcclusion = frame;
        }
        if (terminal === "exited") {
          firstExitedFrame ??= frame;
          if (frame.visuallyPresent) visibleAfterExit ??= frame;
        }
        return frame;
      };

      const preExit = await capture(start);
      for (const scrollY of positions) await capture(scrollY);
      const exitedAtEnd = await capture(end);
      const returned = await capture(start);

      const trackRect = track.getBoundingClientRect();
      const signRect = sign.getBoundingClientRect();
      return {
        missing: false,
        states: [...states],
        trackCenterDelta: Math.abs((trackRect.left + trackRect.right) / 2 - (signRect.left + signRect.right) / 2),
        trackPastSign: trackRect.bottom - signRect.bottom,
        bestOcclusion,
        firstExitedFrame,
        visibleAfterExit,
        exitedAtEnd,
        returned,
        reverseCenterDelta: Math.abs((preExit.ember.left + preExit.ember.right) / 2 - (returned.ember.left + returned.ember.right) / 2),
        imageCount: ember.querySelectorAll("img").length,
        imageStayedMounted: image.dataset.mountProbe === "terminal-exit-ember",
      };
    });

    if (terminalExit.missing) fail(width, "missing End of run, ladder, or Ember terminal-exit target");
    else {
      if (terminalExit.trackCenterDelta > 1) {
        fail(width, `End of run sign leaves the ladder centerline by ${terminalExit.trackCenterDelta.toFixed(1)}px`);
      }
      if (terminalExit.trackPastSign < 28) {
        fail(width, `ladder ends ${terminalExit.trackPastSign.toFixed(1)}px past the sign, expected at least 28px of visible continuation`);
      }
      if (!terminalExit.states.includes("occluding") || !terminalExit.states.includes("exited")) {
        fail(width, `Ember terminal states are incomplete: ${JSON.stringify(terminalExit.states)}`);
      }
      if (!terminalExit.bestOcclusion || terminalExit.bestOcclusion.centerDelta > 20 || !terminalExit.bestOcclusion.signAboveEmber) {
        fail(width, `Ember does not pass behind the centered End of run sign: ${JSON.stringify(terminalExit.bestOcclusion)}`);
      }
      const requiredCoverage = width <= 720 ? 0.8 : 0.4;
      if (!terminalExit.bestOcclusion || terminalExit.bestOcclusion.coverage < requiredCoverage) {
        fail(width, `End of run covers only ${((terminalExit.bestOcclusion?.coverage ?? 0) * 100).toFixed(1)}% of Ember, expected at least ${(requiredCoverage * 100).toFixed(0)}%`);
      }
      if (!terminalExit.firstExitedFrame || terminalExit.exitedAtEnd.terminal !== "exited") {
        fail(width, `Ember never completes the terminal exit: ${JSON.stringify(terminalExit.exitedAtEnd)}`);
      }
      if (terminalExit.visibleAfterExit || terminalExit.exitedAtEnd.visuallyPresent) {
        fail(width, `assembly-line Ember reappears after passing behind the sign: ${JSON.stringify(terminalExit.visibleAfterExit ?? terminalExit.exitedAtEnd)}`);
      }
      if (terminalExit.returned.terminal !== "none" || !terminalExit.returned.visuallyPresent || terminalExit.reverseCenterDelta > 0.75) {
        fail(width, `reverse scroll does not restore Ember cleanly: ${JSON.stringify({ returned: terminalExit.returned, reverseCenterDelta: terminalExit.reverseCenterDelta })}`);
      }
      if (terminalExit.imageCount !== 1 || !terminalExit.imageStayedMounted) {
        fail(width, `Ember image continuity failed: ${JSON.stringify({ imageCount: terminalExit.imageCount, stayedMounted: terminalExit.imageStayedMounted })}`);
      }
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
