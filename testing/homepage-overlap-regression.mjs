#!/usr/bin/env node

import { chromium, webkit } from "playwright";

const url = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!url) {
  console.error("usage: node testing/homepage-overlap-regression.mjs <running-demo-url>");
  process.exit(2);
}

const widths = [267, 320, 390, 479, 544, 582, 610, 664, 720, 768, 811, 834, 958, 1040, 1074, 1280, 1622];
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
        const rootBox = root?.getBoundingClientRect();
        const code = root?.querySelector(".hero-command-code")?.getBoundingClientRect();
        const copy = root?.querySelector(".hero-command-copy")?.getBoundingClientRect();
        const text = root?.querySelector(".hero-command-text");
        const textBox = text?.getBoundingClientRect();
        const textStyle = text ? getComputedStyle(text) : null;
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
        const singleRow = Boolean(
          textBox && textStyle &&
          textBox.height <= Number.parseFloat(textStyle.lineHeight) * 1.5 &&
          (lines.length < 2 || Math.max(...lines.map((line) => line.top)) - Math.min(...lines.map((line) => line.top)) < 1)
        );
        const truncationContract = Boolean(
          textStyle &&
          textStyle.whiteSpace === "nowrap" &&
          textStyle.textAlign === "left" &&
          textStyle.textOverflow === "ellipsis" &&
          textStyle.overflowX === "hidden"
        );
        return {
          box: rootBox ? { left: rootBox.left, right: rootBox.right, width: rootBox.width } : null,
          code: code ? { left: code.left, right: code.right } : null,
          copy: copy ? { left: copy.left, right: copy.right } : null,
          lines,
          singleRow,
          truncationContract,
          truncated: Boolean(text && text.scrollWidth > text.clientWidth + 1),
          visibleText: text?.textContent?.trim() ?? "",
          accessibleCommand: root?.querySelector(".hero-command-code")?.getAttribute("aria-label") ?? "",
          fits: Boolean(
            code && copy && textBox && textRightEdge !== null &&
            code.right <= copy.left && textBox.left >= code.left - 1 && textBox.right <= textRightEdge - 4
          ),
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
    if (!layout.heroCommand.singleRow || !layout.heroCommand.truncationContract) {
      fail(width, `hero install command does not use the single-line truncation contract: ${JSON.stringify(layout.heroCommand)}`);
    }
    if (!layout.releaseCommand.singleRow || !layout.releaseCommand.truncationContract) {
      fail(width, `release install command does not use the single-line truncation contract: ${JSON.stringify(layout.releaseCommand)}`);
    }
    if (width <= 390 && (!layout.heroCommand.truncated || !layout.releaseCommand.truncated)) {
      fail(width, `narrow install commands are not truncated: ${JSON.stringify({ hero: layout.heroCommand, release: layout.releaseCommand })}`);
    }
    if ([544, 582].includes(width)) {
      for (const [name, command] of Object.entries({ hero: layout.heroCommand, release: layout.releaseCommand })) {
        if (!command.visibleText.endsWith("…") || command.visibleText.length >= command.accessibleCommand.length) {
          fail(width, `${name} install command does not use the intentionally shortened visible label: ${JSON.stringify(command)}`);
        }
      }
    }
    if (width >= 1041 && !layout.releaseCommand.singleRow) {
      fail(width, `desktop release install command is not a single row: ${JSON.stringify(layout.releaseCommand)}`);
    }
    if (width >= 1041 && width < 1400 && layout.releaseCommand.box?.width > 840) {
      fail(width, `desktop release install bar is ${layout.releaseCommand.box.width.toFixed(1)}px wide, expected a focused maximum of 840px`);
    }
    if (width >= 768 && width <= 1040 && (layout.releaseCommand.box?.width ?? 0) < Math.min(680, width - 48)) {
      fail(width, `tablet release install bar is only ${(layout.releaseCommand.box?.width ?? 0).toFixed(1)}px wide`);
    }
    if (width >= 768 && !layout.releaseCommand.singleRow) {
      fail(width, `tablet/desktop release install command should read as one line: ${JSON.stringify(layout.releaseCommand)}`);
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
      const releaseStation = document.querySelector(".station--release");
      const releaseMachine = releaseStation?.querySelector(".machine-bay");
      const climber = document.querySelector(".assembly-climber");
      const ember = document.querySelector(".assembly-climber-figure");
      const image = ember?.querySelector("img");
      if (!floor || !track || !sign || !releaseStation || !releaseMachine || !climber || !ember || !image) return { missing: true };

      image.dataset.mountProbe = "terminal-exit-ember";

      const floorTop = floor.getBoundingClientRect().top + window.scrollY;
      const floorBottom = floorTop + floor.getBoundingClientRect().height;
      const signTop = sign.getBoundingClientRect().top + window.scrollY;
      const stickyTop = Number.parseFloat(getComputedStyle(ember.parentElement).top) || 0;
      const figureOffset = Number.parseFloat(getComputedStyle(ember).top) || 0;
      const alignmentScroll = signTop - stickyTop - figureOffset;
      const contactScroll = alignmentScroll - ember.offsetHeight;
      const reverseTarget = Math.max(0, floorTop - stickyTop);
      const start = Math.max(0, floorTop - window.innerHeight, contactScroll - 176);
      const end = Math.min(document.documentElement.scrollHeight - window.innerHeight, floorBottom, alignmentScroll + ember.offsetHeight + sign.offsetHeight + 48);
      const positions = [];
      for (let scrollY = start; scrollY <= end; scrollY += 8) positions.push(scrollY);
      positions.push(alignmentScroll, alignmentScroll + sign.offsetHeight, end);
      positions.sort((a, b) => a - b);

      const states = new Set();
      let bestOcclusion = null;
      let firstExitedFrame = null;
      let visibleAfterExit = null;
      let visibleOverReleaseMachine = null;

      const capture = async (scrollY) => {
        window.scrollTo(0, scrollY);
        window.dispatchEvent(new Event("scroll"));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const a = sign.getBoundingClientRect();
        const b = ember.getBoundingClientRect();
        const overlapWidth = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const overlapHeight = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const terminal = climber.getAttribute("data-terminal");
        const terminalApproach = climber.getAttribute("data-terminal-approach") === "true";
        const centerDelta = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const coverage = b.width * b.height > 0 ? (overlapWidth * overlapHeight) / (b.width * b.height) : 0;
        const samplePoints = [0.2, 0.5, 0.8].flatMap((x) => [0.2, 0.5, 0.8].map((y) => ({ x: b.left + b.width * x, y: b.top + b.height * y })));
        const visibleSamples = samplePoints.filter(({ x, y }) => {
          if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) return false;
          const element = document.elementFromPoint(x, y);
          return element === ember || ember.contains(element);
        }).length;
        const styles = getComputedStyle(ember);
        const machine = releaseMachine.getBoundingClientRect();
        const overlapLeft = Math.max(machine.left, b.left);
        const overlapRight = Math.min(machine.right, b.right);
        const overlapTop = Math.max(machine.top, b.top);
        const overlapBottom = Math.min(machine.bottom, b.bottom);
        const overlapSamples = overlapRight > overlapLeft && overlapBottom > overlapTop
          ? [0.25, 0.5, 0.75].flatMap((x) => [0.25, 0.5, 0.75].map((y) => ({
              x: overlapLeft + (overlapRight - overlapLeft) * x,
              y: overlapTop + (overlapBottom - overlapTop) * y,
            })))
          : [];
        const emberSamplesOverMachine = overlapSamples.filter(({ x, y }) => {
          const element = document.elementFromPoint(x, y);
          return element === ember || ember.contains(element);
        }).length;
        const frame = {
          scrollY,
          terminal,
          terminalApproach,
          centerDelta,
          coverage,
          signAboveEmber: overlapWidth > 1 && overlapHeight > 1 && visibleSamples < samplePoints.length,
          visuallyPresent: styles.visibility !== "hidden" && Number.parseFloat(styles.opacity) > 0.01 && visibleSamples > 0,
          visibleSamples,
          emberSamplesOverMachine,
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
        if (terminal === "none" && emberSamplesOverMachine >= 5) {
          visibleOverReleaseMachine ??= frame;
        }
        return frame;
      };

      const preExit = await capture(reverseTarget);
      for (const scrollY of positions) await capture(scrollY);
      const exitedAtEnd = await capture(end);
      const returned = await capture(reverseTarget);

      const trackRect = track.getBoundingClientRect();
      const signRect = sign.getBoundingClientRect();
      const releaseRect = releaseStation.getBoundingClientRect();
      return {
        missing: false,
        states: [...states],
        trackCenterDelta: Math.abs((trackRect.left + trackRect.right) / 2 - (signRect.left + signRect.right) / 2),
        runwayBeforeSign: signRect.top - releaseRect.bottom,
        trackPastSign: trackRect.bottom - signRect.bottom,
        bestOcclusion,
        firstExitedFrame,
        visibleAfterExit,
        visibleOverReleaseMachine,
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
      if (width > 1040 && terminalExit.runwayBeforeSign < 104) {
        fail(width, `desktop terminal runway is only ${terminalExit.runwayBeforeSign.toFixed(1)}px, expected at least 104px after station 05`);
      }
      if (terminalExit.trackPastSign > 1) {
        fail(width, `ladder peeks ${terminalExit.trackPastSign.toFixed(1)}px below the End of run sign`);
      }
      if (terminalExit.trackPastSign < -24) {
        fail(width, `ladder ends ${Math.abs(terminalExit.trackPastSign).toFixed(1)}px inside the End of run sign, expected the sign to cap its final 0-24px`);
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
      if (terminalExit.visibleOverReleaseMachine) {
        fail(width, `Ember paints over the final machine during terminal transit: ${JSON.stringify(terminalExit.visibleOverReleaseMachine)}`);
      }
      if (terminalExit.returned.terminal !== "none" || !terminalExit.returned.visuallyPresent || terminalExit.reverseCenterDelta > 0.75) {
        fail(width, `reverse scroll does not restore Ember cleanly: ${JSON.stringify({ returned: terminalExit.returned, reverseCenterDelta: terminalExit.reverseCenterDelta })}`);
      }
      if (terminalExit.imageCount !== 1 || !terminalExit.imageStayedMounted) {
        fail(width, `Ember image continuity failed: ${JSON.stringify({ imageCount: terminalExit.imageCount, stayedMounted: terminalExit.imageStayedMounted })}`);
      }
    }

    const responsivePolish = await page.evaluate(async () => {
      const floor = document.querySelector(".factory-floor");
      const climber = document.querySelector(".assembly-climber");
      const ember = document.querySelector(".assembly-climber-figure");
      const releaseStation = document.querySelector(".station--release");
      const releaseMarker = releaseStation?.querySelector(".station-index");
      const releaseCopy = releaseStation?.querySelector(".station-copy");
      const releaseBay = document.querySelector(".release-bay");
      const releaseLink = document.querySelector(".release-github");
      const releaseDoorScrews = [...document.querySelectorAll(".release-door i")];
      const proofMark = document.querySelector(".station--release .station-proof-mark");
      if (!floor || !climber || !ember || !releaseStation || !releaseMarker || !releaseCopy || !releaseBay || !releaseLink || !proofMark) {
        return { missing: true };
      }

      const floorTop = floor.getBoundingClientRect().top + window.scrollY;
      const markerRect = releaseMarker.getBoundingClientRect();
      const markerCenter = markerRect.top + window.scrollY + markerRect.height / 2;
      const stickyTop = Number.parseFloat(getComputedStyle(climber).top) || 0;
      const figureOffset = Number.parseFloat(getComputedStyle(ember).top) || 0;
      const alignmentScroll = markerCenter - stickyTop - figureOffset - ember.offsetHeight * 0.52;
      window.scrollTo(0, Math.max(floorTop, alignmentScroll));
      window.dispatchEvent(new Event("scroll"));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise((resolve) => setTimeout(resolve, 700));

      const emberRect = ember.getBoundingClientRect();
      const copyRect = releaseCopy.getBoundingClientRect();
      const intersectsReleaseCopy = Math.min(emberRect.right, copyRect.right) > Math.max(emberRect.left, copyRect.left)
        && Math.min(emberRect.bottom, copyRect.bottom) > Math.max(emberRect.top, copyRect.top);

      releaseBay.scrollIntoView({ block: "center" });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const bayRect = releaseBay.getBoundingClientRect();
      const linkRect = releaseLink.getBoundingClientRect();
      const linkTextNode = [...releaseLink.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      const linkTextRange = linkTextNode ? document.createRange() : null;
      if (linkTextRange && linkTextNode) linkTextRange.selectNodeContents(linkTextNode);
      const linkTextRect = linkTextRange?.getBoundingClientRect();
      const visibleScrews = releaseDoorScrews.filter((screw) => {
        const styles = getComputedStyle(screw);
        const rect = screw.getBoundingClientRect();
        return styles.display !== "none" && styles.visibility !== "hidden" && rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight;
      }).length;

      const proofGlyph = proofMark.querySelector(":scope > span");
      return {
        missing: false,
        intersectsReleaseCopy,
        releaseLinkClipped: linkRect.left < bayRect.left - 1 || linkRect.right > bayRect.right + 1,
        releaseLinkContentClipped: releaseLink.scrollWidth > releaseLink.clientWidth + 1
          || Boolean(linkTextRect && linkTextRect.right > Math.min(linkRect.right, bayRect.right) + 1),
        visibleScrews,
        hasOpticalProofGlyph: Boolean(proofGlyph),
      };
    });

    if (responsivePolish.missing) fail(width, "missing responsive-polish target");
    else {
      if (width <= 720 && responsivePolish.intersectsReleaseCopy) {
        fail(width, "mobile Ember collides with the station 05 copy lane");
      }
      if (width <= 720 && (responsivePolish.releaseLinkClipped || responsivePolish.releaseLinkContentClipped)) {
        fail(width, "mobile release link clips at the edge of the release bay");
      }
      if (width <= 720 && responsivePolish.visibleScrews > 0) {
        fail(width, `mobile release bay leaves ${responsivePolish.visibleScrews} orphaned door screw(s) visible`);
      }
      if (!responsivePolish.hasOpticalProofGlyph) {
        fail(width, "proof plus lacks an optically centered glyph wrapper");
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
