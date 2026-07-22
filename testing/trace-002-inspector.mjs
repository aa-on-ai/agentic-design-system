import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "evidence/trace-002-production-interactions");
const url = process.argv[2] || "http://127.0.0.1:3013/trace/002";
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 });
await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));

const inspector = page.locator("#inspect");
const initial = {
  diffSelected: await page.getByRole("tab", { name: "diff", exact: true }).getAttribute("aria-selected"),
  panels: await inspector.locator("figure").count(),
};

await page.getByRole("tab", { name: "repaired", exact: true }).click();
await page.getByRole("button", { name: "mobile", exact: true }).click();
await page.getByRole("button", { name: "1:1", exact: true }).click();
const repairedImage = inspector.locator("figure img");
const repaired = {
  selected: await page.getByRole("tab", { name: "repaired", exact: true }).getAttribute("aria-selected"),
  panels: await inspector.locator("figure").count(),
  image: await repairedImage.getAttribute("src"),
  naturalWidth: await repairedImage.evaluate((image) => image.naturalWidth),
  mobilePressed: await page.getByRole("button", { name: "mobile", exact: true }).getAttribute("aria-pressed"),
  zoomPressed: await page.getByRole("button", { name: "1:1", exact: true }).getAttribute("aria-pressed"),
};

const fullscreenButton = page.getByRole("button", { name: "View evidence full screen" });
await fullscreenButton.click();
await page.waitForFunction(() => Boolean(document.fullscreenElement));
const fullscreenEntered = await page.evaluate(() => Boolean(document.fullscreenElement));
await page.getByRole("button", { name: "Exit full screen" }).click();
await page.waitForFunction(() => !document.fullscreenElement);

await page.getByRole("tab", { name: "diff", exact: true }).click();
await page.getByRole("button", { name: "desktop", exact: true }).click();
await inspector.screenshot({ path: path.join(output, "desktop-inspector-diff.png") });
const axe = await new AxeBuilder({ page }).analyze();
const serious = axe.violations.filter(({ impact }) => impact === "serious" || impact === "critical");

const receipt = {
  engine: "chromium",
  environment: "1440x1000 production build with reduced motion",
  url,
  initial,
  repaired,
  fullscreenEntered,
  finalPanels: await inspector.locator("figure").count(),
  horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  seriousOrCriticalAxe: serious.map(({ id, impact, help }) => ({ id, impact, help })),
};
receipt.passed = receipt.initial.diffSelected === "true" && receipt.initial.panels === 2 &&
  receipt.repaired.selected === "true" && receipt.repaired.panels === 1 &&
  receipt.repaired.image?.includes("repaired-error-mobile-2x.png") && receipt.repaired.naturalWidth === 780 &&
  receipt.repaired.mobilePressed === "true" && receipt.repaired.zoomPressed === "true" &&
  receipt.fullscreenEntered && receipt.finalPanels === 2 && !receipt.horizontalOverflow &&
  receipt.seriousOrCriticalAxe.length === 0;

await writeFile(path.join(output, "desktop-receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);
await browser.close();
if (!receipt.passed) {
  console.error(JSON.stringify(receipt, null, 2));
  process.exit(1);
}
console.log("[trace-002-inspector] diff, viewport, 1:1, full-screen, 2x source, axe, and overflow passed");
