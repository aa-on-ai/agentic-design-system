import { chromium } from "playwright";

const url = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!url) {
  console.error("usage: node testing/homepage-regression.mjs <running-demo-url>");
  process.exit(2);
}

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {}),
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const issues = [];

page.on("pageerror", (error) => issues.push(`page error: ${error.message}`));

try {
  await page.goto(url, { waitUntil: "networkidle" });

  const typography = await page.evaluate(() => {
    const ratio = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      return Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize);
    };

    return {
      body: [
        ".hero-lede",
        ".station-description",
        ".release-copy > span",
        ".footer-brand p",
      ].map((selector) => ({ selector, ratio: ratio(selector) })),
      stationHeadings: [
        ".station--intent .station-copy h2",
        ".station--baseline .station-copy h2",
        ".station--release .station-copy h2",
      ].map((selector) => ({ selector, ratio: ratio(selector) })),
    };
  });

  for (const group of Object.values(typography)) {
    for (const item of group) {
      if (item.ratio === null) issues.push(`missing typography target: ${item.selector}`);
    }
  }

  const bodyRatios = typography.body.flatMap((item) => item.ratio === null ? [] : [item.ratio]);
  const bodySpread = Math.max(...bodyRatios) - Math.min(...bodyRatios);
  if (bodySpread > 0.02) {
    issues.push(`body line-height ratios drift by ${bodySpread.toFixed(3)} (expected <= 0.020)`);
  }

  const headingRatios = typography.stationHeadings.flatMap((item) => item.ratio === null ? [] : [item.ratio]);
  const headingSpread = Math.max(...headingRatios) - Math.min(...headingRatios);
  if (headingSpread > 0.01) {
    issues.push(`station heading line-height ratios drift by ${headingSpread.toFixed(3)} (expected <= 0.010)`);
  }

  const scrollBoundary = await page.evaluate(() => {
    const footer = document.querySelector(".site-footer");
    const rootStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);

    return {
      rootOverscrollY: rootStyle.overscrollBehaviorY,
      bodyOverscrollY: bodyStyle.overscrollBehaviorY,
      footerBottom: footer?.getBoundingClientRect().bottom ?? null,
      documentBottom: document.documentElement.scrollHeight,
      scrollY: window.scrollY,
    };
  });

  if (scrollBoundary.rootOverscrollY !== "none" || scrollBoundary.bodyOverscrollY !== "none") {
    issues.push(
      `page overscroll boundary is ${scrollBoundary.rootOverscrollY}/${scrollBoundary.bodyOverscrollY} (expected none/none)`,
    );
  }

  if (scrollBoundary.footerBottom === null) {
    issues.push("missing footer scroll-boundary target");
  } else {
    const footerDocumentBottom = scrollBoundary.footerBottom + scrollBoundary.scrollY;
    if (Math.abs(footerDocumentBottom - scrollBoundary.documentBottom) > 1) {
      issues.push(
        `footer ends at ${footerDocumentBottom}px but document ends at ${scrollBoundary.documentBottom}px`,
      );
    }
  }

  const footerEmber = page.getByRole("button", { name: "Make Ember pop up" });
  if (await footerEmber.count() !== 1) {
    issues.push("footer Ember is not an accessible button");
  } else {
    const box = await footerEmber.boundingBox();
    if (!box || box.width < 48 || box.height < 48) {
      issues.push(`footer Ember hit area is ${box ? `${box.width}x${box.height}` : "missing"} (expected >= 48x48)`);
    }

    await footerEmber.click();
    const reactionCount = await footerEmber.getAttribute("data-reaction-count");
    if (reactionCount !== "1") {
      issues.push(`footer Ember did not react after click (reaction count: ${reactionCount ?? "missing"})`);
    }
  }

  const climberImages = page.locator(".assembly-climber img");
  if (await climberImages.count() !== 1) {
    issues.push(`Ember renders ${await climberImages.count()} pose images (expected one stable image)`);
  }

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
  await page.waitForTimeout(80);
  const initialClimber = await page.locator(".assembly-climber").evaluate((element) => ({
    motion: element.getAttribute("data-motion"),
    position: getComputedStyle(element).position,
    documentTop: window.scrollY + element.getBoundingClientRect().top,
    transform: getComputedStyle(element.querySelector(".assembly-climber-figure")).transform,
  }));
  await page.evaluate(() => {
    document.querySelector(".station--evidence")?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(220);
  const scrolledClimber = await page.locator(".assembly-climber").evaluate((element) => ({
    motion: element.getAttribute("data-motion"),
    documentTop: window.scrollY + element.getBoundingClientRect().top,
    transform: getComputedStyle(element.querySelector(".assembly-climber-figure")).transform,
  }));

  if (initialClimber.motion !== "rail-follow" || scrolledClimber.motion !== "rail-follow") {
    issues.push(`Ember motion mode is ${initialClimber.motion}/${scrolledClimber.motion} (expected rail-follow/rail-follow)`);
  }
  if (initialClimber.position !== "sticky") {
    issues.push(`Ember position is ${initialClimber.position} (expected sticky rail-following)`);
  }
  if (scrolledClimber.documentTop - initialClimber.documentTop < 200) {
    issues.push(`Ember only traveled ${Math.round(scrolledClimber.documentTop - initialClimber.documentTop)}px with the rail (expected >= 200px)`);
  }
  if (initialClimber.transform === scrolledClimber.transform) {
    issues.push(`Ember climb cadence did not respond to scroll (${initialClimber.transform})`);
  }
  if (await page.locator(".station[data-active]").count() !== 0) {
    issues.push("stations still carry scroll-driven active state");
  }

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobilePage.on("pageerror", (error) => issues.push(`mobile page error: ${error.message}`));
  await mobilePage.goto(url, { waitUntil: "networkidle" });

  const mobilePacing = await mobilePage.evaluate(() => {
    const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect() ?? null;
    const command = document.querySelector(".release-primary-action .hero-command-text");
    const commandLines = command
      ? Array.from(command.children).map((line) => {
          const box = line.getBoundingClientRect();
          return {
            top: box.top,
            scrollWidth: line.scrollWidth,
            clientWidth: line.clientWidth,
          };
        })
      : [];
    const track = rect(".continuous-track");
    const stationIndex = rect(".station-index");
    const stationCopy = rect(".station-copy");
    const releaseBay = rect(".release-bay");
    const heroTicket = document.querySelector(".hero-job-ticket");
    const heroCommand = rect(".hero-actions .hero-command-strip");
    const proofLabels = Array.from(document.querySelectorAll(".station-proof p")).map((label) => {
      const style = getComputedStyle(label);
      const lineHeight = Number.parseFloat(style.lineHeight);
      return {
        text: label.textContent?.trim() ?? "",
        lines: lineHeight > 0 ? Math.round(label.getBoundingClientRect().height / lineHeight) : null,
      };
    });
    const artifacts = Array.from(document.querySelectorAll(".ads-artifact")).map((artifact) => {
      const label = artifact.querySelector(".ads-artifact-label");
      const summary = artifact.querySelector(".ads-artifact-summary");
      return {
        id: artifact.getAttribute("data-artifact"),
        label: label?.textContent?.trim() ?? "",
        summary: summary?.textContent?.trim() ?? "",
        labelSize: label ? Number.parseFloat(getComputedStyle(label).fontSize) : 0,
        summarySize: summary ? Number.parseFloat(getComputedStyle(summary).fontSize) : 0,
        overflow: artifact.scrollWidth - artifact.clientWidth,
      };
    });

    return {
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      commandLineCount: commandLines.length,
      commandLinesFit: commandLines.every((line) => line.scrollWidth <= line.clientWidth),
      commandUsesThreeRows: commandLines.length === 3 &&
        commandLines[0].top < commandLines[1].top && commandLines[1].top < commandLines[2].top,
      trackCenter: track ? track.left + track.width / 2 : null,
      stationIndexCenter: stationIndex ? stationIndex.left + stationIndex.width / 2 : null,
      stationContentLeft: stationCopy?.left ?? null,
      releaseHeight: releaseBay?.height ?? null,
      heroTicketVisible: heroTicket ? getComputedStyle(heroTicket).display !== "none" : false,
      heroCommandWidth: heroCommand?.width ?? null,
      proofLabels,
      artifacts,
    };
  });

  if (mobilePacing.pageOverflow > 0) {
    issues.push(`mobile page overflows by ${mobilePacing.pageOverflow}px`);
  }
  if (!mobilePacing.commandLinesFit || !mobilePacing.commandUsesThreeRows) {
    issues.push(
      `mobile install command is ${mobilePacing.commandLineCount} line segment(s), ` +
      `fit=${mobilePacing.commandLinesFit}, threeRows=${mobilePacing.commandUsesThreeRows}`,
    );
  }
  if (
    mobilePacing.trackCenter === null ||
    mobilePacing.stationIndexCenter === null ||
    Math.abs(mobilePacing.trackCenter - mobilePacing.stationIndexCenter) > 1
  ) {
    issues.push(
      `mobile rail/index centers are ${mobilePacing.trackCenter ?? "missing"}/` +
      `${mobilePacing.stationIndexCenter ?? "missing"} (expected aligned)`,
    );
  }
  if (mobilePacing.stationContentLeft === null || mobilePacing.stationContentLeft < 80 || mobilePacing.stationContentLeft > 84) {
    issues.push(
      `mobile station content starts at ${mobilePacing.stationContentLeft ?? "missing"}px (expected 80-84px)`,
    );
  }
  if (mobilePacing.releaseHeight === null || mobilePacing.releaseHeight > 660) {
    issues.push(`mobile release CTA is ${mobilePacing.releaseHeight ?? "missing"}px tall (expected <= 660px)`);
  }
  if (mobilePacing.heroTicketVisible) {
    issues.push("mobile decorative job ticket is visible and can overlap the install action");
  }
  if (mobilePacing.heroCommandWidth === null || mobilePacing.heroCommandWidth < 340) {
    issues.push(`mobile hero install action is ${mobilePacing.heroCommandWidth ?? "missing"}px wide (expected >= 340px)`);
  }

  const expectedProofLabels = ["Input", "Failed check", "Corrected screen", "Evidence report", "Grader verdict"];
  const renderedProofLabels = mobilePacing.proofLabels.map(({ text }) => text);
  if (JSON.stringify(renderedProofLabels) !== JSON.stringify(expectedProofLabels)) {
    issues.push(
      `proof labels are ${renderedProofLabels.join(" / ") || "missing"} ` +
      `(expected ${expectedProofLabels.join(" / ")})`,
    );
  }
  const wrappedProofLabels = mobilePacing.proofLabels.filter(({ lines }) => lines !== 1);
  if (wrappedProofLabels.length > 0) {
    issues.push(
      `proof labels wrap at 390px: ${wrappedProofLabels.map(({ text, lines }) => `${text} (${lines ?? "?"} lines)`).join(", ")}`,
    );
  }

  const expectedArtifacts = ["input", "failed-check", "corrected-screen", "evidence-report", "grader-verdict"];
  const renderedArtifacts = mobilePacing.artifacts.map(({ id }) => id);
  if (JSON.stringify(renderedArtifacts) !== JSON.stringify(expectedArtifacts)) {
    issues.push(
      `ADS artifacts are ${renderedArtifacts.join(" / ") || "missing"} ` +
      `(expected ${expectedArtifacts.join(" / ")})`,
    );
  }
  for (const artifact of mobilePacing.artifacts) {
    if (!artifact.label || !artifact.summary) {
      issues.push(`${artifact.id ?? "unknown"} artifact is missing a visible label or summary`);
    }
    if (artifact.labelSize < 10 || artifact.summarySize < 11) {
      issues.push(
        `${artifact.id ?? "unknown"} artifact type is ${artifact.labelSize}/${artifact.summarySize}px ` +
        `(expected label >= 10px and summary >= 11px)`,
      );
    }
    if (artifact.overflow > 0) {
      issues.push(`${artifact.id ?? "unknown"} artifact overflows by ${artifact.overflow}px`);
    }
  }

  await mobilePage.close();

  const tabletPage = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await tabletPage.goto(url, { waitUntil: "networkidle" });
  const tabletTour = await tabletPage.locator(".tour-link").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      whiteSpace: style.whiteSpace,
      fits: element.scrollWidth <= element.clientWidth,
      width: element.getBoundingClientRect().width,
    };
  });
  if (tabletTour.whiteSpace !== "nowrap" || !tabletTour.fits || tabletTour.width < 110) {
    issues.push(
      `tablet tour link is white-space=${tabletTour.whiteSpace}, fits=${tabletTour.fits}, ` +
      `width=${tabletTour.width}px (expected one readable line)`,
    );
  }
  await tabletPage.close();

  if (await page.locator(".release-handoff").count() !== 0) {
    issues.push("clipped release handoff still renders");
  }

  const releaseTreatment = await page.locator(".release-bay").evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, color: style.color };
  });
  if (releaseTreatment.background !== "rgb(232, 93, 38)") {
    issues.push(`release bay background is ${releaseTreatment.background} (expected warm orange rgb(232, 93, 38))`);
  }
  if (releaseTreatment.color !== "rgb(44, 26, 16)") {
    issues.push(`release bay text is ${releaseTreatment.color} (expected dark ink rgb(44, 26, 16))`);
  }
} finally {
  await browser.close();
}

if (issues.length > 0) {
  console.error("homepage regression failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  "homepage regression passed: typography + footer + smooth rail-following Ember + legible ADS artifacts + mobile pacing + orange release + proof labels",
);
