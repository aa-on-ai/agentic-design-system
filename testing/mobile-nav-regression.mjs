import { webkit } from "playwright";

const url = process.argv[2] ?? process.env.ADS_DEMO_URL;

if (!url) {
  console.error("usage: node testing/mobile-nav-regression.mjs <running-demo-url>");
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
          visible: getComputedStyle(element).display !== "none",
        };
      };

      return {
        header: rect(".site-shell-header"),
        brand: rect(".brand-lockup"),
        menu: rect(".ads-system-nav-menu summary"),
        actions: rect(".site-shell-actions"),
        github: rect('.site-shell-actions a[aria-label*="GitHub"]'),
        theme: rect('.site-shell-actions button[aria-label*="theme"]'),
      };
    });

    const scope = `${width}px`;
    if (!layout.header || !layout.brand || !layout.menu || !layout.actions || !layout.theme) {
      failures.push(`${scope}: missing mobile navigation element`);
      await page.close();
      continue;
    }

    if (layout.brand.right + 12 > layout.menu.left) {
      failures.push(`${scope}: brand and Menu control have less than 12px breathing room`);
    }
    if (layout.menu.right + 12 > layout.actions.left) {
      failures.push(`${scope}: Menu and theme controls have less than 12px breathing room`);
    }
    if (Math.abs(layout.header.left) > 1 || Math.abs(layout.header.right - width) > 1) {
      failures.push(`${scope}: header is not edge-docked to the mobile viewport`);
    }
    if (layout.brand.height < 48 || layout.brand.width < 48 || layout.menu.height < 48 || layout.theme.height < 48 || layout.theme.width < 48) {
      failures.push(`${scope}: mobile controls fall below the 48px touch target`);
    }
    if (layout.github?.visible) {
      failures.push(`${scope}: standalone GitHub control still crowds the mobile header`);
    }

    const menuLabel = (await page.locator(".ads-system-nav-menu summary").innerText()).trim();
    if (menuLabel !== "Menu") {
      failures.push(`${scope}: mobile navigation trigger is not explicitly labeled Menu`);
    }

    await page.locator(".ads-system-nav-menu summary").click();
    const githubInMenu = page.locator('.ads-system-nav-menu a[href*="github.com"]');
    if (await githubInMenu.count() !== 1 || !await githubInMenu.isVisible()) {
      failures.push(`${scope}: Menu does not preserve GitHub access`);
    }
    const currentLink = page.locator('.ads-system-nav-menu a[aria-current="page"]');
    if (await currentLink.count() !== 1 || !((await currentLink.innerText()).includes("Current"))) {
      failures.push(`${scope}: Menu does not visibly identify the current destination`);
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

console.log("mobile nav regression passed: edge-docked chrome, explicit Menu, calm spacing, 48px targets, and current destination");
