import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "evidence/trace-002-production-interactions");
const url = process.argv[2] || "http://127.0.0.1:3012/trace/002";
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["iPhone 13"],
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.setDefaultTimeout(10_000);
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 });
await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
await page.screenshot({ path: path.join(output, "iphone-13-top-2x.png") });

await page.getByRole("button", { name: "mobile", exact: true }).click();
await page.getByRole("button", { name: "1:1", exact: true }).click();
await page.getByRole("tab", { name: "baseline", exact: true }).click();
await page.locator("#inspect").screenshot({ path: path.join(output, "iphone-13-inspector-baseline-2x.png") });

const packet = page.locator("details");
await packet.locator("summary").click();
await packet.scrollIntoViewIfNeeded();
await packet.screenshot({ path: path.join(output, "iphone-13-packet-open-2x.png") });

const axe = await new AxeBuilder({ page }).analyze();
const serious = axe.violations.filter(({ impact }) => impact === "serious" || impact === "critical");
const facts = await page.evaluate(() => {
  const targets = [...document.querySelectorAll("a, button, summary")].filter((element) => {
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
    mobilePressed: document.querySelector('button[aria-pressed="true"]')?.textContent?.trim().toLowerCase() === "mobile",
    baselineSelected: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim().toLowerCase() === "baseline",
    zoomPressed: document.querySelector('button[aria-label="1:1"]')?.getAttribute("aria-pressed") === "true",
    packetOpen: document.querySelector("details")?.hasAttribute("open") === true,
    visiblePanels: document.querySelectorAll("#inspect figure").length,
    images: [...document.images].map((image) => ({ alt: image.alt, complete: image.complete, naturalWidth: image.naturalWidth })),
    undersized,
  };
});

const traceResponse = await context.request.get(`${url}/trace.json`);
const trace = await traceResponse.json();
const receipt = {
  engine: "chromium",
  environment: "iPhone 13 emulation at 390x844, 2x device scale, touch, and reduced motion",
  url,
  traceStatus: trace.status,
  traceId: trace.traceId,
  seriousOrCriticalAxe: serious.map(({ id, impact, help }) => ({ id, impact, help })),
  ...facts,
  consoleErrors,
};
receipt.passed = traceResponse.ok() && trace.status === "satisfied" && receipt.main &&
  receipt.mobilePressed && receipt.baselineSelected && receipt.zoomPressed && receipt.packetOpen &&
  receipt.visiblePanels === 1 && !receipt.horizontalOverflow && receipt.undersized.length === 0 &&
  receipt.images.every((image) => image.complete && image.naturalWidth > 0) &&
  receipt.seriousOrCriticalAxe.length === 0 && receipt.consoleErrors.length === 0;

await writeFile(path.join(output, "receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);
await browser.close();

if (!receipt.passed) {
  console.error(JSON.stringify(receipt, null, 2));
  process.exit(1);
}
console.log("[trace-002-mobile] 2x mobile evidence, inspector controls, packet expansion, axe, and touch targets passed");
