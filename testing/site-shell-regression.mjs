#!/usr/bin/env node

import { chromium, webkit } from "playwright";

const baseUrl = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!baseUrl) {
  console.error("usage: node testing/site-shell-regression.mjs <running-demo-url>");
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

for (const [browserName, browserType] of [["Chromium", chromium], ["WebKit", webkit]]) {
  const browser = await browserType.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 2048, height: 1054 } });
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const shellCount = await page.locator(".site-shell-header").count();
    if (shellCount !== 1) failures.push(`${browserName}: expected one shared site shell, found ${shellCount}`);

    const desktopChrome = await page.evaluate(() => {
      const header = document.querySelector(".site-shell-header");
      const content = document.querySelector(".site-shell-content");
      const current = document.querySelector(".ads-system-nav-list [aria-current='page']");
      const other = document.querySelector(".ads-system-nav-list a:not([aria-current='page'])");
      if (!(header instanceof HTMLElement) || !(content instanceof HTMLElement)) return null;
      const bounds = header.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        width: bounds.width,
        radius: getComputedStyle(header).borderRadius,
        contentPaddingTop: parseFloat(getComputedStyle(content).paddingTop),
        currentIndicatorHeight: current
          ? parseFloat(getComputedStyle(current, "::after").height)
          : 0,
        currentIndicatorOpacity: current
          ? parseFloat(getComputedStyle(current, "::after").opacity)
          : 0,
        otherCursor: other ? getComputedStyle(other).cursor : null,
      };
    });

    if (!desktopChrome) {
      failures.push(`${browserName}: site chrome could not be measured`);
    } else {
      if (Math.abs(desktopChrome.left) > 1 || Math.abs(desktopChrome.right - 2048) > 1 || Math.abs(desktopChrome.width - 2048) > 1) {
        failures.push(`${browserName}: desktop header is still a floating inset island instead of edge-docked site chrome`);
      }
      if (Math.abs(desktopChrome.top) > 1 || desktopChrome.radius !== "0px") {
        failures.push(`${browserName}: desktop header still reads as a floating rounded panel`);
      }
      if (desktopChrome.contentPaddingTop < 64) {
        failures.push(`${browserName}: page content still sits underneath the fixed navigation`);
      }
      if (desktopChrome.currentIndicatorHeight < 2 || desktopChrome.currentIndicatorOpacity < 0.9) {
        failures.push(`${browserName}: current desktop destination lacks an unmistakable persistent indicator`);
      }
      if (desktopChrome.otherCursor !== "pointer") {
        failures.push(`${browserName}: non-current desktop destinations do not read as clickable`);
      }
    }

    const desktopLabels = await page.locator(".site-shell-header .ads-system-nav-list a").allTextContents();
    if (JSON.stringify(desktopLabels) !== JSON.stringify(routes.map(([label]) => label))) {
      failures.push(`${browserName}: shared navigation destinations are incomplete or reordered`);
    }

    const themeButton = page.locator("button[aria-label*='theme']").first();
    if (await themeButton.count() !== 1) {
      failures.push(`${browserName}: theme control is missing`);
    } else {
      const themeLayers = await page.locator(".hero-image[data-theme-image]").evaluateAll((images) =>
        images.map((image) => ({
          complete: image instanceof HTMLImageElement && image.complete,
          width: image instanceof HTMLImageElement ? image.naturalWidth : 0,
        })),
      );
      if (themeLayers.length !== 2 || themeLayers.some((image) => !image.complete || image.width === 0)) {
        failures.push(`${browserName}: both hero theme images are not decoded before interaction`);
      }

      const initialTheme = await page.locator("html").getAttribute("data-theme");
      await themeButton.click();
      await page.waitForFunction((before) => document.documentElement.dataset.theme !== before, initialTheme);

      const themeContract = await page.evaluate(() => {
        const root = document.documentElement;
        const pageElement = document.querySelector(".theme-page");
        const activeImage = document.querySelector(`.hero-image[data-theme-image="${root.dataset.theme}"]`);
        return {
          transition: root.dataset.themeTransition,
          pageDuration: pageElement ? getComputedStyle(pageElement).transitionDuration : null,
          activeImageOpacity: activeImage ? getComputedStyle(activeImage).opacity : null,
          pendingLayerCount: document.querySelectorAll(".hero-image--pending").length,
        };
      });
      if (themeContract.transition !== "radial") {
        failures.push(`${browserName}: theme change is not one radial page transition`);
      }
      if (themeContract.pageDuration !== "0s" || themeContract.activeImageOpacity !== "1") {
        failures.push(`${browserName}: page background and hero image do not enter the new theme on the same frame`);
      }
      if (themeContract.pendingLayerCount !== 0) {
        failures.push(`${browserName}: hero still owns a delayed independent theme reveal`);
      }
    }

    if (shellCount === 1) {
      await page.locator(".site-shell-header").evaluate((element) => {
        element.setAttribute("data-regression-instance", "original");
      });

      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, 900);
      });
      await page.waitForFunction(() => document.querySelector(".site-shell-header")?.getAttribute("data-scroll-state") === "hidden");
      await page.evaluate(() => window.scrollTo(0, 520));
      await page.waitForFunction(() => document.querySelector(".site-shell-header")?.getAttribute("data-scroll-state") === "visible");

      await page.evaluate(() => {
        window.__adsLoadingSeen = false;
        const markLoading = () => {
          if (document.querySelector("[data-workbench-loading], main[aria-busy='true']")) window.__adsLoadingSeen = true;
        };
        markLoading();
        new MutationObserver(markLoading).observe(document.body, { childList: true, subtree: true });
      });

      await page.locator(".site-shell-header .ads-system-nav-list a", { hasText: "Workbench" }).click();
      await page.waitForURL((url) => url.pathname === "/workbench");
      await page.locator("[data-workbench-session]").waitFor();

      const workbenchContract = await page.evaluate(() => ({
        loadingSeen: window.__adsLoadingSeen === true,
        shellPersisted: document.querySelector(".site-shell-header")?.getAttribute("data-regression-instance") === "original",
        shellCount: document.querySelectorAll(".site-shell-header").length,
        current: document.querySelector(".site-shell-header [aria-current='page']")?.textContent?.trim(),
      }));
      if (workbenchContract.loadingSeen) failures.push(`${browserName}: Workbench exposes a route-loading interstitial`);
      if (!workbenchContract.shellPersisted || workbenchContract.shellCount !== 1) {
        failures.push(`${browserName}: shared navigation is replaced during route changes`);
      }
      if (workbenchContract.current !== "Workbench") failures.push(`${browserName}: Workbench is not marked current`);

      for (const [label, path] of routes) {
        await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "networkidle" });
        const routeContract = await page.evaluate(() => ({
          shells: document.querySelectorAll(".site-shell-header").length,
          navs: document.querySelectorAll("nav[aria-label='Agentic Design System']").length,
          current: document.querySelector(".site-shell-header [aria-current='page']")?.textContent?.trim(),
        }));
        if (routeContract.shells !== 1 || routeContract.navs !== 1 || routeContract.current !== label) {
          failures.push(`${browserName} ${path}: navigation contract differs from the shared shell`);
        }
      }
    }

    await page.close();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(new URL("/trace/002", baseUrl).toString(), { waitUntil: "networkidle" });
    const mobileShell = mobile.locator(".site-shell-header");
    if (await mobileShell.count() !== 1) {
      failures.push(`${browserName} mobile: shared site shell is missing`);
    } else {
      const bounds = await mobileShell.boundingBox();
      if (!bounds || Math.abs(bounds.x) > 1 || Math.abs(bounds.width - 390) > 1) {
        failures.push(`${browserName} mobile: site chrome is not edge-docked to the viewport`);
      }
      const menuLabel = (await mobile.locator(".ads-system-nav-menu summary").innerText()).trim();
      if (menuLabel !== "Menu") failures.push(`${browserName} mobile: navigation trigger is not explicitly labeled Menu`);
      await mobile.locator(".ads-system-nav-menu summary").click();
      const menuLabels = await mobile.locator(".ads-system-nav-menu a").allTextContents();
      for (const [label] of routes) {
        if (!menuLabels.some((menuLabel) => menuLabel.trim().startsWith(label))) {
          failures.push(`${browserName} mobile: Menu is missing ${label}`);
        }
      }
      const currentMobileLink = mobile.locator(".ads-system-nav-menu a[aria-current='page']");
      if (await currentMobileLink.count() !== 1 || !((await currentMobileLink.innerText()).includes("Current"))) {
        failures.push(`${browserName} mobile: open menu does not clearly label the current destination`);
      }
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

console.log("site shell regression passed: edge-docked navigation, explicit current state, synchronized theme reveal, and no Workbench interstitial");
