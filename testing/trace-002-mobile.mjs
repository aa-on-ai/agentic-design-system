import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "docs/trace-002/evidence-mobile");
const url = process.argv[2] || "http://127.0.0.1:3012/trace/002";
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["iPhone 13"],
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.setDefaultTimeout(10_000);
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15_000 });
console.log("[trace-002-mobile] page loaded");
await page.screenshot({ path: path.join(output, "iphone-13-top.png") });
console.log("[trace-002-mobile] top captured");
const themeBefore = await page.locator("html").getAttribute("data-theme");
await page.locator('button[aria-label*="theme"]').click();
const themeAfter = await page.locator("html").getAttribute("data-theme");
console.log("[trace-002-mobile] theme toggled");
await page.locator("#gallery-title").scrollIntoViewIfNeeded();
const proofImages = page.locator('section[aria-labelledby="gallery-title"] img');
for (let index = 0; index < await proofImages.count(); index += 1) {
  await proofImages.nth(index).scrollIntoViewIfNeeded();
}
await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 15_000 });
await page.locator("#gallery-title").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(output, "iphone-13-gallery.png") });
console.log("[trace-002-mobile] gallery captured");

const facts = await page.evaluate(() => {
  const targets = [...document.querySelectorAll("a, button")].filter((element) => {
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  });
  const undersized = targets.flatMap((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width < 44 || rect.height < 44
      ? [{ label: element.getAttribute("aria-label") || element.textContent?.trim() || element.tagName, width: rect.width, height: rect.height }]
      : [];
  });
  return {
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim(),
    main: Boolean(document.querySelector("main")),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    images: [...document.images].map((image) => ({ alt: image.alt, complete: image.complete, naturalWidth: image.naturalWidth })),
    undersized,
  };
});

const traceResponse = await context.request.get(`${url}/trace.json`);
console.log("[trace-002-mobile] trace fetched");
const trace = await traceResponse.json();
const receipt = {
  engine: "chromium",
  environment: "iPhone 13 emulation at 390x844 with touch and mobile Safari user agent",
  url,
  traceStatus: trace.status,
  traceId: trace.traceId,
  themeToggle: { before: themeBefore, after: themeAfter, changed: themeBefore !== themeAfter },
  ...facts,
  consoleErrors,
};
receipt.passed = traceResponse.ok() && trace.status === "satisfied" && receipt.themeToggle.changed &&
  receipt.main && !receipt.horizontalOverflow && receipt.undersized.length === 0 &&
  receipt.images.every((image) => image.complete && image.naturalWidth > 0) && receipt.consoleErrors.length === 0;
await writeFile(path.join(output, "receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);
await browser.close();

if (!receipt.passed) {
  console.error(JSON.stringify(receipt, null, 2));
  process.exit(1);
}
console.log("[trace-002-mobile] iPhone-like interaction and rendered checks passed");
