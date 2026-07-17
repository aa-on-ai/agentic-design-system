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

  const stationPoses = {
    intent: "reach",
    baseline: "contact",
    rubric: "inspect",
    evidence: "inspect",
    release: "release",
  };

  for (const [stage, expectedPose] of Object.entries(stationPoses)) {
    await page.evaluate((nextStage) => {
      document.documentElement.style.scrollBehavior = "auto";
      const station = document.querySelector(`.station--${nextStage}`);
      station?.scrollIntoView({ block: "center" });
    }, stage);
    await page.waitForTimeout(220);

    const motionState = await page.evaluate(() => {
      const active = document.querySelector('.station[data-active="true"]');
      const climber = document.querySelector(".assembly-climber");
      const screen = active?.querySelector(".orders-window");
      const scale = screen ? new DOMMatrix(getComputedStyle(screen).transform).a : null;
      return {
        activeStage: active?.getAttribute("data-stage") ?? null,
        pose: climber?.getAttribute("data-pose") ?? null,
        screenScale: scale,
      };
    });

    if (motionState.activeStage !== stage) {
      issues.push(`active product is ${motionState.activeStage ?? "missing"} at ${stage} (expected ${stage})`);
    }
    if (motionState.pose !== expectedPose) {
      issues.push(`Ember pose is ${motionState.pose ?? "missing"} at ${stage} (expected ${expectedPose})`);
    }
    if (motionState.screenScale === null || motionState.screenScale < 1.01) {
      issues.push(`active product scale is ${motionState.screenScale ?? "missing"} at ${stage} (expected >= 1.01)`);
    }
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.querySelector(".station--baseline")?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(60);
  const reducedMotionState = await page.locator(".assembly-climber").evaluate((element) => ({
    enabled: element.getAttribute("data-reduced-motion"),
    pose: element.getAttribute("data-pose"),
  }));
  if (reducedMotionState.enabled !== "true" || reducedMotionState.pose !== "contact") {
    issues.push(
      `reduced-motion Ember state is ${reducedMotionState.enabled}/${reducedMotionState.pose} (expected true/contact)`,
    );
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

    return {
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      commandLineCount: commandLines.length,
      commandLinesFit: commandLines.every((line) => line.scrollWidth <= line.clientWidth),
      commandUsesTwoRows: commandLines.length === 2 && commandLines[0].top < commandLines[1].top,
      trackCenter: track ? track.left + track.width / 2 : null,
      stationIndexCenter: stationIndex ? stationIndex.left + stationIndex.width / 2 : null,
      stationContentLeft: stationCopy?.left ?? null,
      releaseHeight: releaseBay?.height ?? null,
    };
  });

  if (mobilePacing.pageOverflow > 0) {
    issues.push(`mobile page overflows by ${mobilePacing.pageOverflow}px`);
  }
  if (!mobilePacing.commandLinesFit || !mobilePacing.commandUsesTwoRows) {
    issues.push(
      `mobile install command is ${mobilePacing.commandLineCount} line segment(s), ` +
      `fit=${mobilePacing.commandLinesFit}, twoRows=${mobilePacing.commandUsesTwoRows}`,
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

  await mobilePage.close();
} finally {
  await browser.close();
}

if (issues.length > 0) {
  console.error("homepage regression failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("homepage regression passed: typography + footer + Ember poses + product focus + mobile pacing");
