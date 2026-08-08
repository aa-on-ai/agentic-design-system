import { webkit } from "playwright";

const url = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!url) {
  console.error(
    "usage: node testing/mobile-nav-regression.mjs <running-demo-url>",
  );
  process.exit(2);
}

const viewports = [320, 375, 390];
const failures = [];
const browser = await webkit.launch({ headless: true });

try {
  for (const width of viewports) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto(url, { waitUntil: "networkidle" });

    const layout = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLElement)) return null;
        const box = element.getBoundingClientRect();
        return {
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
        };
      };
      return {
        legacyHeader: rect(".site-shell-header"),
        rail: rect(".ads-system-nav"),
        brand: rect(".brand-lockup"),
        selector: rect(".ads-system-nav-trigger"),
      };
    });

    const scope = `${width}px`;
    if (
      layout.legacyHeader ||
      !layout.rail ||
      !layout.brand ||
      !layout.selector
    ) {
      failures.push(`${scope}: integrated navigation rail is missing or legacy header remains`);
      await page.close();
      continue;
    }
    if (layout.brand.right + 8 > layout.selector.left)
      failures.push(`${scope}: brand and current-page menu are cramped`);
    if (
      layout.brand.height < 48 ||
      layout.selector.height < 48
    ) {
      failures.push(
        `${scope}: a mobile control falls below the 48px touch target`,
      );
    }
    if (
      layout.rail.left < 8 ||
      layout.rail.right > width - 8
    ) {
      failures.push(`${scope}: navigation rail does not preserve its hero gutter`);
    }

    const selectorText = (
      await page.locator(".ads-system-nav-trigger").innerText()
    )
      .replace(/\s+/g, " ")
      .trim();
    if (
      !selectorText.includes("Overview") ||
      !selectorText.includes("Menu")
    ) {
      failures.push(
        `${scope}: mobile selector does not expose the current page and Menu affordance`,
      );
    }

    await page.locator(".ads-system-nav-trigger").click();
    await page.waitForFunction(
      () =>
        document
          .querySelector(".ads-system-nav-layer")
          ?.getAttribute("data-state") === "open",
    );
    const sheet = await page
      .locator(".ads-system-nav-sheet")
      .boundingBox();
    if (
      !sheet ||
      Math.abs(sheet.x) > 1 ||
      Math.abs(sheet.width - width) > 2 ||
      Math.abs(sheet.y + sheet.height - 844) > 2
    ) {
      failures.push(`${scope}: system pages do not open as a bottom sheet`);
    }
    const githubInMenu = page.locator(
      '.ads-system-nav-menu a[href*="github.com"]',
    );
    if (
      (await githubInMenu.count()) !== 1 ||
      !(await githubInMenu.isVisible())
    ) {
      failures.push(`${scope}: page sheet does not preserve GitHub access`);
    }
    const themeInMenu = page.locator(
      '.ads-system-nav-sheet button[aria-label*="theme"]',
    );
    if (
      (await themeInMenu.count()) !== 1 ||
      !(await themeInMenu.isVisible())
    ) {
      failures.push(`${scope}: page sheet does not preserve theme access`);
    }
    const currentLink = page.locator(
      '.ads-system-nav-menu a[aria-current="page"]',
    );
    if (
      (await currentLink.count()) !== 1 ||
      !(await currentLink.innerText()).includes("Current page")
    ) {
      failures.push(
        `${scope}: page sheet does not identify the current destination`,
      );
    }

    await page.close();
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "mobile nav regression passed: one hero-integrated rail, explicit current-page menu, 48px targets, and bottom-sheet utilities",
);
