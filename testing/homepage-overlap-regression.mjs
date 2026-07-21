#!/usr/bin/env node

import { chromium } from "playwright";

const url = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!url) {
  console.error("usage: node testing/homepage-overlap-regression.mjs <running-demo-url>");
  process.exit(2);
}

const widths = [267, 320, 390, 479, 664, 720, 768, 811, 958, 1040, 1280, 1622];
const issues = [];
const browser = await chromium.launch({ headless: true });

function fail(width, message) {
  issues.push(`${width}px: ${message}`);
}

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.locator('main[data-ads-homepage][data-page-ready="true"]').waitFor();

    const layout = await page.evaluate(() => {
      const rect = (selector) => {
        const box = document.querySelector(selector)?.getBoundingClientRect();
        return box ? { top: box.top, right: box.right, bottom: box.bottom, left: box.left, width: box.width, height: box.height } : null;
      };
      const overlap = (a, b) => Boolean(
        a && b && Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
        Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)
      );
      const commandFit = (rootSelector) => {
        const root = document.querySelector(rootSelector);
        const code = root?.querySelector(".hero-command-code")?.getBoundingClientRect();
        const copy = root?.querySelector(".hero-command-copy")?.getBoundingClientRect();
        const lines = [...(root?.querySelectorAll(".hero-command-text > span") ?? [])].map((line) => {
          const box = line.getBoundingClientRect();
          return { text: line.textContent?.trim() ?? "", left: box.left, right: box.right };
        });
        const textRightEdge = code && copy ? Math.min(code.right, copy.left) : null;
        return {
          code: code ? { left: code.left, right: code.right } : null,
          copy: copy ? { left: copy.left, right: copy.right } : null,
          lines,
          fits: Boolean(
            code && copy && lines.length === 3 && textRightEdge !== null &&
            lines.every((line) => line.left >= code.left - 1 && line.right <= textRightEdge - 4)
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
    if (layout.introRailOverlap) {
      fail(width, `“One request” heading occupies the rail lane: ${JSON.stringify({ heading: layout.introHeading, rail: layout.rail })}`);
    }

    const endLayering = await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto";
      const floor = document.querySelector(".factory-floor");
      const sign = document.querySelector(".track-end");
      const ember = document.querySelector(".assembly-climber-figure");
      if (!floor || !sign || !ember) return { missing: true };

      const floorTop = floor.getBoundingClientRect().top + window.scrollY;
      const floorBottom = floorTop + floor.getBoundingClientRect().height;
      const signTop = sign.getBoundingClientRect().top + window.scrollY;
      const stickyTop = Number.parseFloat(getComputedStyle(ember.parentElement).top) || 0;
      const figureOffset = Number.parseFloat(getComputedStyle(ember).top) || 0;
      const alignmentScroll = signTop - stickyTop - figureOffset;
      const start = Math.max(0, floorTop - window.innerHeight, alignmentScroll - 180);
      const end = Math.min(document.documentElement.scrollHeight - window.innerHeight, floorBottom, alignmentScroll + 180);

      for (let scrollY = start; scrollY <= end; scrollY += 8) {
        window.scrollTo(0, scrollY);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const a = sign.getBoundingClientRect();
        const b = ember.getBoundingClientRect();
        const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (overlapWidth > 1 && overlapHeight > 1) {
          const overlapX = (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2;
          const overlapY = (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2;
          const stack = document.elementsFromPoint(overlapX, overlapY);
          const signIndex = stack.findIndex((element) => element === sign || sign.contains(element));
          const emberIndex = stack.findIndex((element) => element === ember || ember.contains(element));
          return {
            missing: false,
            collision: true,
            scrollY,
            overlapWidth,
            overlapHeight,
            centerDelta: Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2),
            signAboveEmber: signIndex >= 0 && emberIndex >= 0 && signIndex < emberIndex,
            signBackground: getComputedStyle(sign).backgroundColor,
            sign: { top: a.top, right: a.right, bottom: a.bottom, left: a.left },
            ember: { top: b.top, right: b.right, bottom: b.bottom, left: b.left },
          };
        }
      }
      const a = sign.getBoundingClientRect();
      const b = ember.getBoundingClientRect();
      return {
        missing: false,
        collision: false,
        centerDelta: Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2),
      };
    });

    if (endLayering.missing) fail(width, "missing End of run or Ember layering target");
    else if (width >= 1041 && !endLayering.collision) {
      fail(width, `Ember never passes behind the End of run background: ${JSON.stringify(endLayering)}`);
    } else if (endLayering.collision && !endLayering.signAboveEmber) {
      fail(width, `Ember paints above the End of run background: ${JSON.stringify(endLayering)}`);
    } else if (width >= 1041 && endLayering.centerDelta > 20) {
      fail(width, `End of run is offset from Ember's rail lane: ${JSON.stringify(endLayering)}`);
    }

    const footerLayout = await page.evaluate(() => {
      const footer = document.querySelector(".site-footer");
      const ember = document.querySelector(".footer-ember");
      const metaLink = document.querySelector(".footer-meta a");
      if (!footer || !ember || !metaLink) return { missing: true };

      const footerRect = footer.getBoundingClientRect();
      const emberRect = ember.getBoundingClientRect();
      const metaLinkRect = metaLink.getBoundingClientRect();
      const overlap = (a, b) => Boolean(
        Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
        Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)
      );
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
        ember: { top: emberRect.top, right: emberRect.right, bottom: emberRect.bottom, left: emberRect.left },
        metaLink: { top: metaLinkRect.top, right: metaLinkRect.right, bottom: metaLinkRect.bottom, left: metaLinkRect.left },
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

console.log(`homepage overlap regression passed at ${widths.join("/")}px`);
