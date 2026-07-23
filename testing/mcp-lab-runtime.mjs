#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const urlIndex = process.argv.indexOf("--url");
const baseUrl = urlIndex >= 0 ? process.argv[urlIndex + 1] : "http://127.0.0.1:3010/mcp";
if (!baseUrl) throw new Error("--url requires a value");

const outputDirectory = path.resolve("evidence", "mcp-lab-pass-3");
await mkdir(outputDirectory, { recursive: true });

const cases = [
  { name: "chromium-desktop", width: 1280, height: 800, isMobile: false, hasTouch: false },
  { name: "chromium-tablet", width: 768, height: 1024, isMobile: false, hasTouch: true },
  {
    name: "chromium-ios-like",
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
  },
];

const results = [];
for (const testCase of cases) {
  process.stderr.write(`[mcp-lab] ${testCase.name}: launch\n`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: testCase.width, height: testCase.height },
    isMobile: testCase.isMobile,
    hasTouch: testCase.hasTouch,
    ...(testCase.deviceScaleFactor ? { deviceScaleFactor: testCase.deviceScaleFactor } : {}),
    ...(testCase.userAgent ? { userAgent: testCase.userAgent } : {}),
  });
  const page = await context.newPage();
  try {
    process.stderr.write(`[mcp-lab] ${testCase.name}: navigate\n`);
    await page.goto(`${baseUrl}?theme=light`, { waitUntil: "domcontentloaded", timeout: 20_000 });
    process.stderr.write(`[mcp-lab] ${testCase.name}: inspect\n`);
    await page.locator("main[data-mcp-lab]").waitFor({ timeout: 10_000 });
    assert.match(await page.locator("h1").innerText(), /design loop/i);
    assert.deepEqual(
      await page.locator("[data-mcp-tools] > li").evaluateAll((items) => items.map((item) => item.getAttribute("data-tool-name"))),
      ["ads_render", "ads_evaluate", "ads_trace"],
    );
    assert.equal(await page.locator("details").count(), 3);

    const firstDisclosure = page.locator("details").first();
    await firstDisclosure.locator("summary").dispatchEvent("click");
    assert.equal(await firstDisclosure.getAttribute("open"), "");
    assert.match(await firstDisclosure.innerText(), /request/i);
    assert.match(await firstDisclosure.innerText(), /result/i);

    let themeToggle = "not exercised";
    if (testCase.name === "chromium-desktop") {
      const themeButton = page.getByRole("button", { name: "Switch to dark theme" });
      // The control is server-rendered before React attaches its event handler. Production can
      // reach DOMContentLoaded before hydration on a cold edge response, so wait for that boundary.
      await page.waitForTimeout(750);
      await themeButton.click();
      assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
      themeToggle = "light -> dark";
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);

    let boundaryAlignment = "four columns";
    if (testCase.width <= 900) {
      const boundaryCells = await page.locator('section[aria-label="MCP boundaries"] > div').evaluateAll((items) =>
        items.map((item) => {
          const label = item.querySelector("span");
          if (!(label instanceof HTMLElement)) throw new Error("boundary item is missing its label");
          return {
            labelLeft: label.getBoundingClientRect().left,
            borderRightWidth: Number.parseFloat(getComputedStyle(item).borderRightWidth),
          };
        }),
      );
      assert.equal(boundaryCells.length, 4);
      assert.ok(Math.abs(boundaryCells[0].labelLeft - boundaryCells[2].labelLeft) < 0.5);
      assert.ok(Math.abs(boundaryCells[1].labelLeft - boundaryCells[3].labelLeft) < 0.5);
      assert.equal(boundaryCells[1].borderRightWidth, 0);
      assert.equal(boundaryCells[3].borderRightWidth, 0);
      boundaryAlignment = "two aligned rows";
    }

    const contractResponse = await fetch(new URL("/mcp/contract.json", baseUrl));
    const contract = { ok: contractResponse.ok, body: await contractResponse.json() };
    assert.equal(contract.ok, true);
    assert.deepEqual(contract.body.sequence, ["ads_render", "ads_evaluate", "ads_trace"]);
    assert.equal(contract.body.tools.length, 3);

    const screenshot = path.join(outputDirectory, `${testCase.name}-${testCase.width}x${testCase.height}.png`);
    process.stderr.write(`[mcp-lab] ${testCase.name}: screenshot\n`);
    await page.screenshot({ path: screenshot, fullPage: true, timeout: 20_000 });
    results.push({
      browser: testCase.name,
      viewport: `${testCase.width}x${testCase.height}`,
      touch: testCase.hasTouch,
      disclosures: 3,
      themeToggle,
      horizontalOverflow: false,
      boundaryAlignment,
      contractTools: contract.body.sequence,
      screenshot,
    });
  } finally {
    process.stderr.write(`[mcp-lab] ${testCase.name}: close\n`);
    await browser.close();
  }
}

process.stdout.write(`${JSON.stringify({ status: "passed", results }, null, 2)}\n`);
