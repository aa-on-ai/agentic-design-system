import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium, webkit } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3104";
const evidenceDir = "evidence/workbench-step3-step4";
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

  await page.goto(`${baseUrl}/workbench`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal, [data-react-grab] { display: none !important; }" });
  await page.getByRole("button", { name: "Review project identity" }).click();
  await page.getByRole("checkbox", { name: /I reviewed this exact project identity change/ }).check();
  await page.getByRole("button", { name: "Confirm identity" }).click();
  await page.getByRole("heading", { name: "What should the agent do?" }).waitFor();

  const continueButton = page.getByRole("button", { name: "Review agent handoff" });
  assert.equal(await continueButton.isDisabled(), true, `${target.name}: job selection advanced before the user chose a job`);
  await page.getByText("Your choice sets the route.", { exact: true }).waitFor();

  await page.getByRole("radio", { name: /Explore options/ }).check();
  const task = page.getByRole("textbox", { name: /Name the exact task/ });
  await task.fill("Make it better");
  await page.getByRole("heading", { name: "Name one concrete target." }).waitFor();
  assert.equal(await continueButton.isDisabled(), true, `${target.name}: ambiguous task created a handoff`);

  await task.fill("Compare three onboarding structures for the first-run dashboard");
  await page.getByRole("heading", { name: "Disposable browser exploration" }).waitFor();
  await page.getByText("Human choose, blend, or reject gate", { exact: true }).waitFor();
  assert.equal(await continueButton.isDisabled(), true, `${target.name}: route advanced before explicit review`);
  await page.getByRole("checkbox", { name: /I reviewed this route/ }).check();
  assert.equal(await continueButton.isEnabled(), true, `${target.name}: route review did not unlock the handoff`);

  await page.getByRole("radio", { name: /Review existing interface/ }).check();
  await page.getByRole("heading", { name: "Adversarial rendered review" }).waitFor();
  assert.equal(await continueButton.isDisabled(), true, `${target.name}: changing the job preserved stale route approval`);
  await task.fill("Review the mobile checkout confirmation before merge");
  await page.getByRole("heading", { name: "Two-pass mobile review" }).waitFor();
  await page.getByText("workflows/mobile-review.md", { exact: true }).waitFor();
  await page.getByRole("checkbox", { name: /I reviewed this route/ }).check();
  await page.waitForTimeout(180);

  const stepThree = await renderedState(page);
  assert.equal(stepThree.overflow, false, `${target.name}: Step 3 has horizontal overflow`);
  assert.deepEqual(stepThree.uppercaseTransforms, [], `${target.name}: Step 3 uses uppercase transformation`);
  assert.deepEqual(stepThree.uppercaseWords, [], `${target.name}: Step 3 exposes all-caps interface text`);
  assert.deepEqual(await smallTargets(page), [], `${target.name}: Step 3 has controls smaller than 48 pixels`);
  if (target.screenshot) await page.screenshot({ path: `${evidenceDir}/${target.name}-step3.png`, fullPage: true });

  await continueButton.click();
  await page.getByRole("heading", { name: "Review the exact job." }).waitFor();
  assert.equal(
    await page.getByRole("progressbar", { name: "Project setup progress" }).getAttribute("aria-valuenow"),
    "4",
    `${target.name}: route review did not advance to the exact handoff`,
  );
  await page.getByText("Two-pass mobile review", { exact: true }).waitFor();
  const handoff = await page.getByLabel("Generated agent handoff").textContent();
  assert.match(handoff ?? "", /Human intent: Review existing interface/);
  assert.match(handoff ?? "", /Canonical route: workflows\/mobile-review\.md/);
  assert.match(handoff ?? "", /Agent execution inside Workbench/);
  assert.doesNotMatch(handoff ?? "", /Make it better/);

  const axe = await new AxeBuilder({ page }).analyze();
  const seriousOrCritical = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""));
  assert.deepEqual(
    seriousOrCritical.map((item) => ({ id: item.id, targets: item.nodes.flatMap((node) => node.target) })),
    [],
    `${target.name}: serious or critical accessibility findings`,
  );

  const stepFour = await renderedState(page);
  assert.equal(stepFour.overflow, false, `${target.name}: Step 4 has horizontal overflow`);
  assert.deepEqual(stepFour.uppercaseTransforms, [], `${target.name}: Step 4 uses uppercase transformation`);
  assert.deepEqual(stepFour.uppercaseWords, [], `${target.name}: Step 4 exposes all-caps interface text`);
  assert.deepEqual(await smallTargets(page), [], `${target.name}: Step 4 has controls smaller than 48 pixels`);
  if (target.screenshot) await page.screenshot({ path: `${evidenceDir}/${target.name}-step4.png`, fullPage: true });

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("heading", { name: "What should the agent do?" }).waitFor();
  assert.equal(await page.getByRole("radio", { name: /Review existing interface/ }).isChecked(), true, `${target.name}: Back lost the chosen job`);
  assert.equal(await task.inputValue(), "Review the mobile checkout confirmation before merge", `${target.name}: Back lost the exact task`);
  await page.getByRole("button", { name: "Review agent handoff" }).click();
  await page.getByRole("button", { name: "Copy agent handoff" }).click();
  await page.getByRole("status").filter({ hasText: /Agent handoff copied|Clipboard access is unavailable/ }).waitFor();

  const finalState = await renderedState(page);
  assert.ok(finalState.cls <= 0.01, `${target.name}: cumulative layout shift was ${finalState.cls}`);
  await browser.close();
}

console.log("workbench Step 3 and Step 4 browser regression passed");

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
      uppercaseTransforms: visible
        .filter((element) => getComputedStyle(element).textTransform === "uppercase")
        .map((element) => element.textContent?.trim().slice(0, 80)),
      uppercaseWords: visible.flatMap((element) => {
        if (element.closest("pre, code")) return [];
        const ownText = [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent?.trim() ?? "")
          .filter(Boolean)
          .join(" ");
        return /\b[A-Z]{2,}\b/.test(ownText) ? [ownText.slice(0, 80)] : [];
      }),
    };
  });
}

async function smallTargets(page) {
  return page.locator("button, a, label:has(input)").evaluateAll((elements) => elements.flatMap((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    if (style.display === "none" || style.visibility === "hidden" || box.width === 0 || box.height === 0) return [];
    return box.width < 48 || box.height < 48
      ? [{ text: element.textContent?.trim().slice(0, 60), width: box.width, height: box.height }]
      : [];
  }));
}
