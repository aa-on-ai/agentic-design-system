import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3104";
const evidenceDir = "evidence/workbench-step1-step2";
await mkdir(evidenceDir, { recursive: true });

for (const target of [
  { name: "chromium-desktop", engine: chromium, viewport: { width: 1280, height: 800 } },
  { name: "webkit-desktop", engine: webkit, viewport: { width: 1440, height: 1000 }, screenshot: true },
  { name: "webkit-mobile", engine: webkit, viewport: { width: 390, height: 844 }, screenshot: true },
]) {
  const browser = await target.engine.launch({ headless: true });
  const context = await browser.newContext({ viewport: target.viewport });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__workbenchCls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__workbenchCls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(`${baseUrl}/workbench`, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: "nextjs-portal, [data-react-grab] { display: none !important; }" });
  const startingHeading = page.getByRole("heading", { name: "Choose a starting point." });
  await startingHeading.waitFor();

  const beforeFonts = await startingHeading.boundingBox();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
  const afterFonts = await startingHeading.boundingBox();
  assert.ok(beforeFonts && afterFonts, `${target.name}: starting heading was not measurable`);
  for (const key of ["x", "y", "width", "height"]) {
    assert.ok(
      Math.abs(beforeFonts[key] - afterFonts[key]) <= 1,
      `${target.name}: heading ${key} changed after fonts settled`,
    );
  }

  const marketing = page.getByRole("radio", { name: /Marketing and editorial/ });
  const utility = page.getByRole("radio", { name: /Utilitarian app/ });
  await assertChecked(marketing, target.name, "recommended starting point");
  await utility.check();
  await page.getByText("A calm product workflow that prioritizes task completion, plain language, and predictable interaction.").waitFor();
  await marketing.check();
  await page.getByText("A type-led public product with deliberate narrative pacing and a clear visual point of view.").waitFor();
  if (target.screenshot) await page.screenshot({ path: `${evidenceDir}/${target.name}-step1.png` });
  if (target.name === "webkit-mobile") {
    for (const principle of [
      "Lead with narrative hierarchy and strong typography.",
      "Use pacing and composition before adding interface chrome.",
      "Keep the public product expressive and the workflow clear.",
    ]) {
      assert.equal(await page.getByText(principle, { exact: true }).isVisible(), true, `webkit-mobile: hidden principle: ${principle}`);
    }
  }

  assert.equal(
    await page.getByRole("heading", { name: /What do you need from/ }).count(),
    0,
    `${target.name}: a future job-selection step was exposed before identity review`,
  );

  const reviewButton = page.getByRole("button", { name: "Review project identity" });
  assert.equal(await reviewButton.isEnabled(), true, `${target.name}: primary action was not enabled`);
  await reviewButton.click();
  await page.getByRole("heading", { name: "Review project identity." }).waitFor();
  await page.getByRole("heading", { name: "Review the project identity diff." }).waitFor();
  assert.equal(
    await page.getByRole("progressbar", { name: "Project setup progress" }).getAttribute("aria-valuenow"),
    "2",
    `${target.name}: progress did not advance to project identity review`,
  );
  if (target.screenshot) await page.screenshot({ path: `${evidenceDir}/${target.name}-step2.png` });
  const stepTwoRendered = await renderedState(page);
  assert.equal(stepTwoRendered.overflow, false, `${target.name}: Step 2 has horizontal overflow`);
  assert.deepEqual(stepTwoRendered.uppercaseTransforms, [], `${target.name}: Step 2 uses uppercase transformation`);

  const confirmButton = page.getByRole("button", { name: "Confirm identity" });
  if (target.name === "webkit-mobile") {
    const diffViewport = await page.getByRole("region", { name: "Project identity line diff" }).evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    assert.ok(
      diffViewport.scrollWidth <= diffViewport.clientWidth,
      `webkit-mobile: identity diff requires hidden horizontal scrolling (${diffViewport.scrollWidth}px > ${diffViewport.clientWidth}px)`,
    );
    const buttonFit = await confirmButton.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const textRange = document.createRange();
      textRange.selectNodeContents(element);
      return {
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        scrollWidth: element.scrollWidth,
        left: box.left,
        right: box.right,
        viewport: innerWidth,
        textRects: [...textRange.getClientRects()].map((rect) => ({ left: rect.left, right: rect.right })),
      };
    });
    assert.ok(buttonFit.scrollWidth <= buttonFit.clientWidth, "webkit-mobile: confirmation label is clipped");
    assert.ok(buttonFit.scrollHeight <= buttonFit.clientHeight, "webkit-mobile: confirmation label wraps outside the action height");
    assert.equal(buttonFit.textRects.length, 1, "webkit-mobile: confirmation label wraps to multiple lines");
    assert.ok(
      buttonFit.textRects[0].left >= buttonFit.left && buttonFit.textRects[0].right <= buttonFit.right,
      "webkit-mobile: confirmation label renders outside its action",
    );
    assert.ok(buttonFit.left >= 0 && buttonFit.right <= buttonFit.viewport, "webkit-mobile: confirmation action leaves the viewport");
  }
  assert.equal(await confirmButton.isDisabled(), true, `${target.name}: identity confirmation unlocked before review`);
  await page.getByRole("checkbox", { name: /I reviewed this exact project identity change/ }).check();
  assert.equal(await confirmButton.isEnabled(), true, `${target.name}: reviewed identity did not unlock confirmation`);
  await confirmButton.click();
  await page.getByRole("heading", { name: "What should the agent do?" }).waitFor();
  assert.equal(
    await page.getByRole("progressbar", { name: "Project setup progress" }).getAttribute("aria-valuenow"),
    "3",
    `${target.name}: identity confirmation did not advance to job selection`,
  );

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("heading", { name: "Review project identity." }).waitFor();
  const confirmedButton = page.getByRole("button", { name: "Continue to choose job" });
  assert.equal(await confirmedButton.isEnabled(), true, `${target.name}: reviewed identity could not continue after Back`);

  await page.getByRole("button", { name: "Back" }).click();
  await startingHeading.waitFor();
  await assertChecked(marketing, target.name, "preserved starting point after Back");

  const rendered = await renderedState(page);
  assert.ok(rendered.cls <= 0.01, `${target.name}: cumulative layout shift was ${rendered.cls}`);
  assert.equal(rendered.overflow, false, `${target.name}: page has horizontal overflow`);
  assert.deepEqual(rendered.uppercaseTransforms, [], `${target.name}: rendered text uses uppercase transformation`);

  await browser.close();
}

console.log("workbench Step 1 and Step 2 browser regression passed");

async function renderedState(page) {
  return page.evaluate(() => {
    const visible = [...document.querySelectorAll("body *")].filter((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
    });
    return {
      cls: window.__workbenchCls ?? 0,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      uppercaseTransforms: visible.filter((element) => getComputedStyle(element).textTransform === "uppercase").map((element) => element.textContent?.trim().slice(0, 80)),
    };
  });
}

async function assertChecked(locator, target, label) {
  assert.equal(await locator.isChecked(), true, `${target}: ${label} was not selected`);
}
