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
const heroRoutes = ["/", "/mcp", "/trace", "/trace/002"];
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
      const header = document.querySelector(".site-shell-header");
      const hero = document.querySelector(".hero-section");
      const nav = document.querySelector(".ads-system-nav");
      const current = nav?.querySelector(
        ".ads-system-nav-list [aria-current='page']",
      );
      const other = nav?.querySelector(
        ".ads-system-nav-list a:not([aria-current='page'])",
      );
      if (
        !(header instanceof HTMLElement) ||
        !(hero instanceof HTMLElement) ||
        !(nav instanceof HTMLElement)
      )
        return null;
      const headerBounds = header.getBoundingClientRect();
      const heroBounds = hero.getBoundingClientRect();
      const navBounds = nav.getBoundingClientRect();
      return {
        headerPosition: getComputedStyle(header).position,
        headerNavs: header.querySelectorAll(
          "nav[aria-label='Agentic Design System']",
        ).length,
        navs: document.querySelectorAll(
          "nav[aria-label='Agentic Design System']",
        ).length,
        navTop: navBounds.top,
        navWidth: navBounds.width,
        heroBottom: heroBounds.bottom,
        headerBottom: headerBounds.bottom,
        currentIndicatorHeight: current
          ? parseFloat(getComputedStyle(current, "::after").height)
          : 0,
        currentIndicatorOpacity: current
          ? parseFloat(getComputedStyle(current, "::after").opacity)
          : 0,
        otherCursor: other ? getComputedStyle(other).cursor : null,
      };
    });

    if (!desktopContract) {
      failures.push(`${browserName}: chapter seam could not be measured`);
    } else {
      if (
        desktopContract.headerPosition === "fixed" ||
        desktopContract.headerPosition === "sticky"
      ) {
        failures.push(
          `${browserName}: utility header still follows the user as permanent chrome`,
        );
      }
      if (desktopContract.headerNavs !== 0) {
        failures.push(
          `${browserName}: system navigation still lives inside the top header`,
        );
      }
      if (desktopContract.navs !== 1) {
        failures.push(
          `${browserName}: expected one chapter seam, found ${desktopContract.navs}`,
        );
      }
      if (
        desktopContract.navTop < desktopContract.heroBottom - 2 ||
        desktopContract.navTop < desktopContract.headerBottom
      ) {
        failures.push(
          `${browserName}: chapter navigation does not enter after the hero`,
        );
      }
      if (Math.abs(desktopContract.navWidth - 2048) > 1) {
        failures.push(`${browserName}: chapter seam is not edge-to-edge`);
      }
      if (
        desktopContract.currentIndicatorHeight < 3 ||
        desktopContract.currentIndicatorOpacity < 0.9
      ) {
        failures.push(
          `${browserName}: current destination lacks a persistent orange rule`,
        );
      }
      if (desktopContract.otherCursor !== "pointer") {
        failures.push(
          `${browserName}: other destinations do not read as clickable`,
        );
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
        `${browserName}: chapter destinations are incomplete or reordered`,
      );
    }

    const navDocumentTop = await page
      .locator(".ads-system-nav")
      .evaluate(
        (element) => element.getBoundingClientRect().top + window.scrollY,
      );
    await page.evaluate((top) => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, top + 320);
    }, navDocumentTop);
    await page.waitForTimeout(160);
    const stickyTop = await page
      .locator(".ads-system-nav")
      .evaluate((element) => element.getBoundingClientRect().top);
    if (Math.abs(stickyTop) > 2)
      failures.push(
        `${browserName}: chapter seam does not become sticky after it is reached`,
      );

    const themeButton = page.locator("button[aria-label*='theme']").first();
    if ((await themeButton.count()) !== 1) {
      failures.push(
        `${browserName}: theme control is missing from the utility header`,
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
      const routeContract = await page.evaluate((expectsHero) => {
        const nav = document.querySelector(".ads-system-nav");
        const hero = document.querySelector(
          ".hero-section, article > section:first-child, [data-chapter-hero]",
        );
        const navTop = nav?.getBoundingClientRect().top ?? -1;
        const heroBottom = hero?.getBoundingClientRect().bottom ?? -1;
        return {
          navs: document.querySelectorAll(
            "nav[aria-label='Agentic Design System']",
          ).length,
          current: nav
            ?.querySelector("[aria-current='page']")
            ?.textContent?.trim(),
          followsHero: expectsHero
            ? heroBottom > 0 && navTop >= heroBottom - 2
            : true,
        };
      }, heroRoutes.includes(path));
      if (
        routeContract.navs !== 1 ||
        routeContract.current !== label ||
        !routeContract.followsHero
      ) {
        failures.push(
          `${browserName} ${path}: chapter navigation model or placement is inconsistent`,
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
    const summary = mobile.locator(".ads-system-nav-menu summary");
    const summaryText = (await summary.innerText()).replace(/\s+/g, " ").trim();
    if (
      !summaryText.includes("Proof case") ||
      !summaryText.includes("5 of 5")
    ) {
      failures.push(
        `${browserName} mobile: selector does not name the current page and position`,
      );
    }
    await summary.click();
    const menuLabels = await mobile
      .locator(".ads-system-nav-menu a")
      .allTextContents();
    for (const [label] of routes) {
      if (!menuLabels.some((menuLabel) => menuLabel.includes(label))) {
        failures.push(`${browserName} mobile: page sheet is missing ${label}`);
      }
    }
    const sheet = await mobile
      .locator(".ads-system-nav-menu > div")
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
  "site shell regression passed: quiet utility header, hero-earned chapter seam, clear current page, mobile bottom sheet, synchronized theme, and no Workbench interstitial",
);
