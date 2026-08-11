#!/usr/bin/env node

import { chromium, webkit } from "playwright";

const baseUrl = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!baseUrl) {
  console.error(
    "usage: node testing/site-shell-regression.mjs <running-demo-url>",
  );
  process.exit(2);
}

const routes = [
  ["Overview", "/"],
  ["Workbench", "/workbench"],
  ["Evidence tools", "/mcp"],
  ["Decision trace", "/trace"],
  ["Proof case", "/trace/002"],
];
const failures = [];

for (const [browserName, browserType] of [
  ["Chromium", chromium],
  ["WebKit", webkit],
]) {
  const browser = await browserType.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 2048, height: 1054 },
    });
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const desktopContract = await page.evaluate(() => {
      const hero = document.querySelector(".hero-section");
      const nav = document.querySelector(".ads-system-nav");
      const current = nav?.querySelector(
        ".ads-system-nav-list [aria-current='page']",
      );
      const other = nav?.querySelector(
        ".ads-system-nav-list a:not([aria-current='page'])",
      );
      if (
        !(hero instanceof HTMLElement) ||
        !(nav instanceof HTMLElement)
      )
        return null;
      const heroBounds = hero.getBoundingClientRect();
      const navBounds = nav.getBoundingClientRect();
      const currentStyle = current ? getComputedStyle(current) : null;
      return {
        legacyHeaders: document.querySelectorAll(".site-shell-header").length,
        navs: document.querySelectorAll(
          "nav[aria-label='Agentic Design System']",
        ).length,
        navTop: navBounds.top,
        navBottom: navBounds.bottom,
        navLeft: navBounds.left,
        navRight: navBounds.right,
        navWidth: navBounds.width,
        heroTop: heroBounds.top,
        heroBottom: heroBounds.bottom,
        currentBackground: currentStyle?.backgroundColor ?? null,
        currentRadius: currentStyle?.borderRadius ?? null,
        otherCursor: other ? getComputedStyle(other).cursor : null,
        brandInside: nav.querySelector(".brand-lockup") !== null,
        githubInside: nav.querySelector('a[href*="github.com"]') !== null,
        themeInside: nav.querySelector('button[aria-label*="theme"]') !== null,
      };
    });

    if (!desktopContract) {
      failures.push(`${browserName}: chapter seam could not be measured`);
    } else {
      if (desktopContract.legacyHeaders !== 0)
        failures.push(`${browserName}: legacy utility header still renders`);
      if (desktopContract.navs !== 1) {
        failures.push(
          `${browserName}: expected one integrated navigation rail, found ${desktopContract.navs}`,
        );
      }
      if (
        desktopContract.navTop < desktopContract.heroTop ||
        desktopContract.navBottom >= desktopContract.heroBottom
      ) {
        failures.push(
          `${browserName}: navigation rail is not composed inside the hero`,
        );
      }
      if (
        desktopContract.navLeft < 12 ||
        desktopContract.navRight > 2036 ||
        desktopContract.navWidth > 1800
      ) {
        failures.push(`${browserName}: navigation rail does not respect the hero gutter`);
      }
      if (
        !desktopContract.currentBackground ||
        desktopContract.currentBackground === "rgba(0, 0, 0, 0)" ||
        desktopContract.currentBackground === "transparent" ||
        desktopContract.currentRadius === "0px"
      ) {
        failures.push(
          `${browserName}: current destination lacks a persistent filled state`,
        );
      }
      if (desktopContract.otherCursor !== "pointer") {
        failures.push(
          `${browserName}: other destinations do not read as clickable`,
        );
      }
      if (
        !desktopContract.brandInside ||
        !desktopContract.githubInside ||
        !desktopContract.themeInside
      ) {
        failures.push(`${browserName}: the rail does not contain brand, navigation, GitHub, and theme`);
      }
    }

    const desktopLabels = await page
      .locator(".ads-system-nav-list a")
      .allTextContents();
    if (
      JSON.stringify(desktopLabels) !==
      JSON.stringify(routes.map(([label]) => label))
    ) {
      failures.push(
        `${browserName}: rail destinations are incomplete or reordered`,
      );
    }

    const initialRail = await page.locator(".ads-system-nav").evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        state: element.getAttribute("data-scroll-state"),
        position: style.position,
        top: bounds.top,
      };
    });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 48);
    });
    await page.waitForTimeout(40);
    const staticRail = await page.locator(".ads-system-nav").evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        state: element.getAttribute("data-scroll-state"),
        position: style.position,
        top: bounds.top,
        transitionProperty: style.transitionProperty,
      };
    });
    if (
      initialRail.state !== "static" ||
      initialRail.position !== "relative" ||
      staticRail.state !== "static" ||
      staticRail.position !== "relative" ||
      Math.abs(staticRail.top - (initialRail.top - 48)) > 2 ||
      staticRail.transitionProperty.includes("transform")
    ) {
      failures.push(
        `${browserName}: navigation rail does not scroll away naturally from its static page-top position (${JSON.stringify({ initialRail, staticRail })})`,
      );
    }
    await page.evaluate(() => {
      window.scrollTo(0, 720);
    });
    await page.waitForTimeout(220);
    const dormantRail = await page.locator(".ads-system-nav").evaluate((element) => ({
      state: element.getAttribute("data-scroll-state"),
      position: getComputedStyle(element).position,
      top: element.getBoundingClientRect().top,
      transitionProperty: getComputedStyle(element).transitionProperty,
    }));
    if (
      dormantRail.state !== "dormant" ||
      dormantRail.position !== "fixed" ||
      dormantRail.top > -60 ||
      dormantRail.transitionProperty.includes("transform")
    ) {
      failures.push(
        `${browserName}: navigation rail does not clear the reading path without animating its initial exit (${JSON.stringify(dormantRail)})`,
      );
    }
    for (const scrollY of [716, 712, 708]) {
      await page.evaluate((nextY) => window.scrollTo(0, nextY), scrollY);
      await page.waitForTimeout(24);
    }
    await page.waitForTimeout(180);
    const revealedRail = await page.locator(".ads-system-nav").evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        state: element.getAttribute("data-scroll-state"),
        position: style.position,
        top: element.getBoundingClientRect().top,
        transitionProperty: style.transitionProperty,
        transitionDuration: style.transitionDuration,
        transitionTimingFunction: style.transitionTimingFunction,
      };
    });
    if (
      revealedRail.state !== "visible" ||
      revealedRail.position !== "fixed" ||
      revealedRail.top < 8 ||
      revealedRail.top > 18 ||
      !revealedRail.transitionProperty.includes("transform") ||
      !revealedRail.transitionDuration.includes("0.18s") ||
      !revealedRail.transitionTimingFunction.includes(
        "cubic-bezier(0.215, 0.61, 0.355, 1)",
      )
    )
      failures.push(
        `${browserName}: navigation rail does not ease back into a fixed reading position after scrolling up (${JSON.stringify(revealedRail)})`,
      );

    await page.evaluate(() => window.scrollTo(0, 720));
    await page.waitForTimeout(220);
    const rehiddenRail = await page.locator(".ads-system-nav").evaluate((element) => ({
      state: element.getAttribute("data-scroll-state"),
      position: getComputedStyle(element).position,
      top: element.getBoundingClientRect().top,
    }));
    if (
      rehiddenRail.state !== "hidden" ||
      rehiddenRail.position !== "fixed" ||
      rehiddenRail.top > -60
    ) {
      failures.push(
        `${browserName}: revealed navigation rail does not ease away again on downward scroll (${JSON.stringify(rehiddenRail)})`,
      );
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(220);
    const returnedRail = await page.locator(".ads-system-nav").evaluate((element) => ({
      state: element.getAttribute("data-scroll-state"),
      position: getComputedStyle(element).position,
      top: element.getBoundingClientRect().top,
    }));
    if (
      returnedRail.state !== "static" ||
      returnedRail.position !== "relative" ||
      returnedRail.top < 8 ||
      returnedRail.top > 18
    ) {
      failures.push(
        `${browserName}: navigation rail does not settle back into its static page-top position (${JSON.stringify(returnedRail)})`,
      );
    }

    await page
      .locator(".ads-system-nav-list a", { hasText: "Evidence tools" })
      .click();
    await page.waitForURL((url) => url.pathname === "/mcp");
    await page.locator(".ads-system-nav").waitFor();
    const crossRouteNav = await page.evaluate(() => {
      const nav = document.querySelector(".ads-system-nav");
      const current = nav?.querySelector("[aria-current='page']");
      return {
        top: nav?.getBoundingClientRect().top ?? null,
        scrollY: window.scrollY,
        current: current?.textContent?.trim() ?? null,
      };
    });
    if (
      crossRouteNav.top === null ||
      crossRouteNav.top < 8 ||
      crossRouteNav.top > 26 ||
      crossRouteNav.scrollY !== 0 ||
      crossRouteNav.current !== "Evidence tools"
    ) {
      failures.push(
        `${browserName}: cross-route navigation loses the chapter seam (${JSON.stringify(crossRouteNav)})`,
      );
    }

    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const themeButton = page.locator("button[aria-label*='theme']").first();
    if ((await themeButton.count()) !== 1) {
      failures.push(
          `${browserName}: theme control is missing from the integrated rail`,
      );
    } else {
      const initialTheme = await page
        .locator("html")
        .getAttribute("data-theme");
      await themeButton.click();
      await page.waitForFunction(
        (before) => document.documentElement.dataset.theme !== before,
        initialTheme,
      );
      const themeContract = await page.evaluate(() => {
        const root = document.documentElement;
        const activeImage = document.querySelector(
          `.hero-image[data-theme-image="${root.dataset.theme}"]`,
        );
        return {
          transition: root.dataset.themeTransition,
          activeImageOpacity: activeImage
            ? getComputedStyle(activeImage).opacity
            : null,
          pendingLayerCount: document.querySelectorAll(".hero-image--pending")
            .length,
        };
      });
      if (
        themeContract.transition !== "radial" ||
        themeContract.activeImageOpacity !== "1" ||
        themeContract.pendingLayerCount !== 0
      ) {
        failures.push(
          `${browserName}: theme reveal is no longer synchronized across the page and hero`,
        );
      }
    }

    await page.evaluate(() => {
      window.__adsLoadingSeen = false;
      const markLoading = () => {
        if (
          document.querySelector(
            "[data-workbench-loading], main[aria-busy='true']",
          )
        )
          window.__adsLoadingSeen = true;
      };
      markLoading();
      new MutationObserver(markLoading).observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
    await page
      .locator(".ads-system-nav-list a", { hasText: "Workbench" })
      .click();
    await page.waitForURL((url) => url.pathname === "/workbench");
    await page.locator("[data-workbench-session]").waitFor();
    if (await page.evaluate(() => window.__adsLoadingSeen === true)) {
      failures.push(
        `${browserName}: Workbench exposes a route-loading interstitial`,
      );
    }

    for (const [label, path] of routes) {
      await page.goto(new URL(path, baseUrl).toString(), {
        waitUntil: "networkidle",
      });
      const routeContract = await page.evaluate(() => {
        const nav = document.querySelector(".ads-system-nav");
        return {
          navs: document.querySelectorAll(
            "nav[aria-label='Agentic Design System']",
          ).length,
          current: nav
            ?.querySelector("[aria-current='page']")
            ?.textContent?.trim(),
        };
      });
      if (
        routeContract.navs !== 1 ||
        routeContract.current !== label
      ) {
        failures.push(
          `${browserName} ${path}: integrated navigation model or selected state is inconsistent`,
        );
      }
    }

    await page.close();

    const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await mobile.goto(new URL("/trace/002", baseUrl).toString(), {
      waitUntil: "networkidle",
    });
    const summary = mobile.locator(
      ".ads-system-nav-trigger, .ads-system-nav-menu > summary",
    );
    const summaryText = (await summary.innerText()).replace(/\s+/g, " ").trim();
    const summaryLabel = await summary.getAttribute("aria-label");
    if (
      !summaryText.includes("Proof case") ||
      !summaryText.includes("Menu") ||
      !summaryLabel?.includes("5 of 5")
    ) {
      failures.push(
        `${browserName} mobile: selector does not expose Menu, current page, and accessible position`,
      );
    }
    await summary.click();
    const openingFrame = await mobile.evaluate(() => {
      const layer =
        document.querySelector(".ads-system-nav-layer") ??
        document.querySelector(".ads-system-nav-menu");
      const sheet =
        document.querySelector(".ads-system-nav-sheet") ??
        document.querySelector(".ads-system-nav-menu > div");
      const backdrop = document.querySelector(".ads-system-nav-backdrop");
      return {
        state:
          layer?.getAttribute("data-state") ??
          (layer?.hasAttribute("open") ? "open" : null),
        sheetTransform: sheet ? getComputedStyle(sheet).transform : null,
        backdropOpacity: backdrop
          ? getComputedStyle(backdrop).opacity
          : null,
      };
    });
    if (
      openingFrame.state !== "opening" ||
      openingFrame.sheetTransform === "none" ||
      openingFrame.backdropOpacity === "1"
    ) {
      failures.push(
        `${browserName} mobile: page sheet snaps open instead of entering as one connected layer (${JSON.stringify(openingFrame)})`,
      );
    }
    if (await mobile.locator(".ads-system-nav-layer").count()) {
      await mobile.waitForFunction(
        () =>
          document
            .querySelector(".ads-system-nav-layer")
            ?.getAttribute("data-state") === "open",
      );
      const openInteraction = await mobile.evaluate(() => ({
        scrollLocked:
          document.documentElement.dataset.systemMenuOpen === "true",
        focusedCurrent:
          document.activeElement ===
          document.querySelector(
            ".ads-system-nav-sheet a[aria-current='page']",
          ),
      }));
      if (!openInteraction.scrollLocked || !openInteraction.focusedCurrent) {
        failures.push(
          `${browserName} mobile: open sheet does not lock the page and move focus as one interaction (${JSON.stringify(openInteraction)})`,
        );
      }
    }
    const menuLabels = await mobile
      .locator(".ads-system-nav-menu a")
      .allTextContents();
    for (const [label] of routes) {
      if (!menuLabels.some((menuLabel) => menuLabel.includes(label))) {
        failures.push(`${browserName} mobile: page sheet is missing ${label}`);
      }
    }
    const sheet = await mobile
      .locator(".ads-system-nav-sheet")
      .boundingBox();
    if (
      !sheet ||
      Math.abs(sheet.y + sheet.height - 844) > 2 ||
      Math.abs(sheet.width - 390) > 2
    ) {
      failures.push(
        `${browserName} mobile: page selector does not open as an edge-to-edge bottom sheet`,
      );
    }
    const currentMobileLink = mobile.locator(
      ".ads-system-nav-menu a[aria-current='page']",
    );
    if (
      (await currentMobileLink.count()) !== 1 ||
      !(await currentMobileLink.innerText()).includes("Current page")
    ) {
      failures.push(
        `${browserName} mobile: sheet does not explicitly label the current destination`,
      );
    }

    const closeButton = mobile.locator(".ads-system-nav-sheet-close");
    if (await closeButton.count()) {
      await closeButton.click();
    } else {
      await mobile.locator(".ads-system-nav-backdrop").click({
        position: { x: 8, y: 8 },
      });
    }
    const closingFrame = await mobile.evaluate(() => ({
      state:
        document
          .querySelector(".ads-system-nav-layer")
          ?.getAttribute("data-state") ?? null,
      expanded:
        document
          .querySelector(
            ".ads-system-nav-trigger, .ads-system-nav-menu > summary",
          )
          ?.getAttribute("aria-expanded") ?? null,
    }));
    if (
      closingFrame.state !== "closing" ||
      closingFrame.expanded !== "false"
    ) {
      failures.push(
        `${browserName} mobile: page sheet snaps closed instead of leaving cleanly (${JSON.stringify(closingFrame)})`,
      );
    }
    if (await mobile.locator(".ads-system-nav-layer").count()) {
      await mobile.waitForFunction(
        () =>
          !document.querySelector(".ads-system-nav-layer") &&
          document.documentElement.dataset.systemMenuOpen !== "true",
      );
    }
    const closedInteraction = await mobile.evaluate(() => ({
      scrollLocked:
        document.documentElement.dataset.systemMenuOpen === "true",
      triggerFocused:
        document.activeElement ===
        document.querySelector(".ads-system-nav-trigger"),
    }));
    if (closedInteraction.scrollLocked || !closedInteraction.triggerFocused) {
      failures.push(
        `${browserName} mobile: close does not restore page control and trigger focus (${JSON.stringify(closedInteraction)})`,
      );
    }

    await summary.click();
    await mobile.waitForFunction(
      () =>
        document
          .querySelector(".ads-system-nav-layer")
          ?.getAttribute("data-visible") === "true",
    );
    await mobile.locator(".ads-system-nav-sheet-close").click();
    const interruptedState = await mobile
      .locator(".ads-system-nav-layer")
      .getAttribute("data-state");
    if (interruptedState !== "closing") {
      failures.push(
        `${browserName} mobile: rapid open-close is not interruptible (${interruptedState ?? "unmounted"})`,
      );
    }
    await mobile.waitForFunction(
      () => !document.querySelector(".ads-system-nav-layer"),
    );
    await mobile.close();
  } finally {
    await browser.close();
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "site shell regression passed: one hero-integrated rail, static page-top placement, directional reveal, mobile bottom sheet, synchronized theme, and no Workbench interstitial",
);
