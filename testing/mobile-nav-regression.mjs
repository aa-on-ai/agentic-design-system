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
        header: rect(".site-header"),
        brand: rect(".brand-lockup"),
        menu: rect(".ads-system-nav-menu summary"),
        toolbar: rect(".hero-toolbar"),
        github: rect('.hero-toolbar a[aria-label*="GitHub"]'),
        theme: rect('.hero-toolbar button[aria-label*="theme"]'),
      };
    });

    const scope = `${width}px`;
    if (!layout.header || !layout.brand || !layout.menu || !layout.toolbar || !layout.theme) {
      failures.push(`${scope}: missing mobile navigation element`);
      await page.close();
      continue;
    }

    if (layout.brand.right + 12 > layout.menu.left) {
      failures.push(`${scope}: brand and Explore control have less than 12px breathing room`);
    }
    if (layout.menu.right + 12 > layout.toolbar.left) {
      failures.push(`${scope}: Explore and theme controls have less than 12px breathing room`);
    }
    if (layout.header.left < 16 || layout.header.right > width - 16) {
      failures.push(`${scope}: header escapes the 16px mobile gutter`);
    }
    if (layout.brand.height < 48 || layout.brand.width < 48 || layout.menu.height < 48 || layout.theme.height < 48 || layout.theme.width < 48) {
      failures.push(`${scope}: mobile controls fall below the 48px touch target`);
    }
    if (layout.github?.visible) {
      failures.push(`${scope}: standalone GitHub control still crowds the mobile header`);
    }

    await page.locator(".ads-system-nav-menu summary").click();
    const githubInMenu = page.locator('.ads-system-nav-menu a[href*="github.com"]');
    if (await githubInMenu.count() !== 1 || !await githubInMenu.isVisible()) {
      failures.push(`${scope}: Explore menu does not preserve GitHub access`);
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

console.log("mobile nav regression passed: calm spacing, 48px targets, and GitHub preserved in Explore");
