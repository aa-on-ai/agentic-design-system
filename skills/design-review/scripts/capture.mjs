#!/usr/bin/env node
// capture.mjs — render-based evidence primitive for ADS.
//
// The python checks in this directory are SOURCE heuristics: they grep .tsx text.
// They are cheap and gameable (a comment containing "loading" passes state-check).
// This script produces RENDERED evidence: it loads the real page in a headless
// browser, screenshots each state at each breakpoint, runs axe against the live
// DOM, and records the computed font/color the user actually sees. That evidence
// is what a grader (or human) should sign off on — not the source.
//
// Usage:
//   node capture.mjs <url> [options]
//
// Options:
//   --states a,b,c        states to capture; each sets `#state=<name>` before snapshot
//                         (default: "default")
//   --breakpoints WxH,... viewport sizes (default: "390x844,1280x800")
//   --selectors "a,b"     extra CSS selectors to probe for computed styles
//   --out <dir>           evidence output directory (default: ./evidence/<host>)
//   --wait <selector>     wait for this selector before snapshot (optional)
//   --settle <ms>         extra settle time after load (default: 250)
//   --max-cls <number>    maximum allowed cumulative layout shift (default: 0.1)
//
// Output (in --out):
//   evidence.json         structured facts: axe, semantics, CLS, overflow + computed styles
//   <state>-<WxH>.png     one screenshot per state per breakpoint
//
// Exit codes: 0 = captured (read evidence.json for gate verdicts), 2 = could not run.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SETUP_SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'setup-capture.mjs');

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args[0].startsWith('-')) {
    console.error('Usage: node capture.mjs <url> [--states ...] [--breakpoints WxH,...] [--out dir]');
    process.exit(2);
  }
  const get = (name, dflt) => {
    const i = args.indexOf(name);
    return i === -1 ? dflt : args[i + 1];
  };
  const url = args[0];
  const maxCls = Number(get('--max-cls', '0.1'));
  if (!Number.isFinite(maxCls) || maxCls < 0) {
    console.error('--max-cls must be a finite number greater than or equal to 0');
    process.exit(2);
  }
  return {
    url,
    states: get('--states', 'default').split(',').map((s) => s.trim()).filter(Boolean),
    breakpoints: get('--breakpoints', '390x844,1280x800').split(',').map((b) => {
      const [w, h] = b.trim().split('x').map(Number);
      return { w, h, label: `${w}x${h}` };
    }),
    selectors: (get('--selectors', '') || '').split(',').map((s) => s.trim()).filter(Boolean),
    waitFor: get('--wait', null),
    settle: Number(get('--settle', '250')),
    maxCls,
    out: get('--out', null),
  };
}

async function loadDeps() {
  // playwright + @axe-core/playwright are peer deps, kept out of the skill install.
  // One-command setup: node skills/design-review/scripts/setup-capture.mjs
  let chromium;
  let AxeBuilder = null;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error(
      'capture.mjs needs Playwright + @axe-core/playwright. One-command setup\n' +
        '(run from your project root):\n' +
        `  node ${SETUP_SCRIPT}\n` +
        '  (verify only: add --check)',
    );
    process.exit(2);
  }
  try {
    ({ default: AxeBuilder } = await import('@axe-core/playwright'));
  } catch {
    // axe is optional; we still capture screenshots + computed styles without it.
    AxeBuilder = null;
  }
  return { chromium, AxeBuilder };
}

// Computed facts read from the live DOM. These replace source-grep heuristics:
// the rendered font-family is authoritative, the source `font-family: Inter` is not.
async function readComputedFacts(page, selectors) {
  return page.evaluate((sel) => {
    const styleOf = (el) => {
      if (!el) return null;
      const c = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        fontFamily: c.fontFamily,
        color: c.color,
        backgroundColor: c.backgroundColor,
        visible: rect.width > 0 && rect.height > 0 && c.visibility !== 'hidden' && c.display !== 'none',
      };
    };
    const probe = {};
    for (const s of sel) {
      try {
        probe[s] = styleOf(document.querySelector(s));
      } catch {
        probe[s] = null;
      }
    }
    const body = document.body;
    const hasRenderedElement = (selector) => [...document.querySelectorAll(selector)].some((el) => {
      const c = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && c.visibility !== 'hidden' && c.display !== 'none';
    });
    // Landmark / state-render facts: did anything actually render for this state?
    const visibleText = (body?.innerText || '').replace(/\s+/g, ' ').trim();
    const signatureInput = `${visibleText}\n${(body?.innerHTML || '').replace(/\s+/g, ' ').trim()}`;
    let signatureHash = 2166136261;
    for (let index = 0; index < signatureInput.length; index += 1) {
      signatureHash ^= signatureInput.charCodeAt(index);
      signatureHash = Math.imul(signatureHash, 16777619);
    }

    // Touch-target gate: interactive controls whose RENDERED box is under 44x44 CSS px.
    // We measure only interactive elements, so a small icon inside a large button is not
    // flagged — the button's own box is what's measured. Opt out an element with
    // data-ads-target-ok when its hit area is legitimately extended (e.g. a ::before
    // pseudo-element) — that's the explicit-exception escape hatch.
    const TARGET_MIN = 44;
    const interactiveSel =
      'a[href],button,input:not([type="hidden"]),select,textarea,summary,' +
      '[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="switch"],' +
      '[role="tab"],[role="menuitem"],[contenteditable="true"],[tabindex]:not([tabindex="-1"])';
    const cssPath = (el) => {
      const tag = el.tagName.toLowerCase();
      if (el.id) return `${tag}#${el.id}`;
      const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0];
      if (cls) return `${tag}.${cls}`;
      const label = el.getAttribute('aria-label');
      if (label) return `${tag}[aria-label="${label.slice(0, 30)}"]`;
      return tag;
    };
    const smallTouchTargets = [];
    for (const el of document.querySelectorAll(interactiveSel)) {
      if (
        el.hasAttribute('disabled') ||
        el.getAttribute('aria-hidden') === 'true' ||
        el.hasAttribute('data-ads-target-ok')
      ) {
        continue;
      }
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue; // not rendered
      if (r.width < TARGET_MIN || r.height < TARGET_MIN) {
        smallTouchTargets.push({
          selector: cssPath(el),
          width: Math.round(r.width),
          height: Math.round(r.height),
        });
      }
    }

    return {
      smallTouchTargets,
      body: styleOf(body),
      landmarks: {
        main: hasRenderedElement('main'),
        nav: hasRenderedElement('nav'),
        header: hasRenderedElement('header'),
        footer: hasRenderedElement('footer'),
      },
      // a rendered status/alert region is real evidence of a loading/error state;
      // the WORD "loading" in source is not.
      statusRegion: hasRenderedElement('[role="status"],[aria-live],[aria-busy="true"]'),
      alertRegion: hasRenderedElement('[role="alert"],[aria-live="assertive"]'),
      renderedTextLength: visibleText.length,
      renderedTextSample: visibleText.slice(0, 280),
      renderSignature: (signatureHash >>> 0).toString(16).padStart(8, '0'),
      probe,
    };
  }, selectors);
}

// Install before navigation so layout shifts from the first rendered frame onward are
// observed. The value follows the Web Vitals CLS session-window algorithm: the largest
// burst of shifts within a five-second window, with at most one second between shifts.
async function installLayoutShiftObserver(page) {
  await page.addInitScript(() => {
    const metric = {
      supported: false,
      value: 0,
      entryCount: 0,
      excludedByRecentInput: 0,
      largestShift: 0,
    };
    let observer = null;
    let windowStart = null;
    let windowLast = null;
    let windowValue = 0;

    const addEntries = (entries) => {
      for (const entry of entries) {
        if (entry.hadRecentInput) {
          metric.excludedByRecentInput += 1;
          continue;
        }
        if (
          windowStart === null ||
          entry.startTime - windowLast > 1000 ||
          entry.startTime - windowStart > 5000
        ) {
          windowStart = entry.startTime;
          windowValue = entry.value;
        } else {
          windowValue += entry.value;
        }
        windowLast = entry.startTime;
        metric.entryCount += 1;
        metric.largestShift = Math.max(metric.largestShift, entry.value);
        metric.value = Math.max(metric.value, windowValue);
      }
    };

    const supported = typeof PerformanceObserver !== 'undefined' &&
      (PerformanceObserver.supportedEntryTypes || []).includes('layout-shift');
    metric.supported = supported;
    if (supported) {
      observer = new PerformanceObserver((list) => addEntries(list.getEntries()));
      observer.observe({ type: 'layout-shift', buffered: true });
    }

    Object.defineProperty(window, '__adsLayoutShift', {
      configurable: false,
      enumerable: false,
      value: {
        read() {
          if (observer) addEntries(observer.takeRecords());
          return {
            ...metric,
            value: Number(metric.value.toFixed(5)),
            largestShift: Number(metric.largestShift.toFixed(5)),
          };
        },
      },
    });
  });
}

async function readLayoutShift(page) {
  return page.evaluate(() => window.__adsLayoutShift?.read() || {
    supported: false,
    value: 0,
    entryCount: 0,
    excludedByRecentInput: 0,
    largestShift: 0,
  });
}

async function main() {
  const opts = parseArgs(process.argv);
  const { chromium, AxeBuilder } = await loadDeps();

  const host = (() => {
    try {
      return new URL(opts.url).hostname || 'local';
    } catch {
      return 'local';
    }
  })();
  const outDir = opts.out || path.join(process.cwd(), 'evidence', host);
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const evidence = {
    url: opts.url,
    capturedStates: opts.states,
    breakpoints: opts.breakpoints.map((b) => b.label),
    axeAvailable: !!AxeBuilder,
    snapshots: [],
  };

  try {
    for (const state of opts.states) {
      for (const bp of opts.breakpoints) {
        const context = await browser.newContext({
          viewport: { width: bp.w, height: bp.h },
          deviceScaleFactor: 1,
          reducedMotion: 'reduce',
        });
        const page = await context.newPage();
        await installLayoutShiftObserver(page);
        const target = state === 'default' ? opts.url : `${opts.url.split('#')[0]}#state=${state}`;
        await page.goto(target, { waitUntil: 'networkidle' }).catch(() => {});
        if (opts.waitFor) await page.waitForSelector(opts.waitFor, { timeout: 5000 }).catch(() => {});
        if (opts.settle) await page.waitForTimeout(opts.settle);

        const layoutShift = await readLayoutShift(page);

        const shotName = `${state}-${bp.label}.png`;
        await page.screenshot({ path: path.join(outDir, shotName), fullPage: true });

        let axe = null;
        if (AxeBuilder) {
          try {
            const res = await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa'])
              .analyze();
            axe = {
              violations: res.violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                nodes: v.nodes.length,
                help: v.help,
              })),
              violationCount: res.violations.length,
              seriousOrCritical: res.violations.filter(
                (v) => v.impact === 'serious' || v.impact === 'critical',
              ).length,
            };
          } catch (e) {
            axe = { error: String(e?.message || e) };
          }
        }

        const facts = await readComputedFacts(page, opts.selectors);

        // overflow check: does content exceed the viewport horizontally?
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );

        evidence.snapshots.push({
          state,
          breakpoint: bp.label,
          screenshot: shotName,
          horizontalOverflow: overflow,
          cumulativeLayoutShift: layoutShift,
          axe,
          ...facts,
        });

        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  // Derived gate signals — computed from rendered facts, so they can't be faked in source.
  const seriousAxe = evidence.snapshots.reduce(
    (n, s) => n + (s.axe?.seriousOrCritical || 0),
    0,
  );
  const overflowAt = evidence.snapshots.filter((s) => s.horizontalOverflow).map((s) => `${s.state}@${s.breakpoint}`);
  const landmarkFailures = evidence.snapshots
    .filter((snapshot) => snapshot.landmarks?.main !== true)
    .map((snapshot) => ({ state: snapshot.state, breakpoint: snapshot.breakpoint, missing: ['main'] }));
  const liveRegionFailures = evidence.snapshots.flatMap((snapshot) => {
    if (snapshot.state === 'loading' && snapshot.statusRegion !== true) {
      return [{ state: snapshot.state, breakpoint: snapshot.breakpoint, expected: 'status/live region' }];
    }
    if (snapshot.state === 'error' && snapshot.alertRegion !== true) {
      return [{ state: snapshot.state, breakpoint: snapshot.breakpoint, expected: 'alert/assertive live region' }];
    }
    return [];
  });
  const cumulativeLayoutShiftAt = evidence.snapshots.map((snapshot) => ({
    state: snapshot.state,
    breakpoint: snapshot.breakpoint,
    supported: snapshot.cumulativeLayoutShift?.supported === true,
    value: Number(snapshot.cumulativeLayoutShift?.value || 0),
    entryCount: Number(snapshot.cumulativeLayoutShift?.entryCount || 0),
  }));
  const clsUnavailableAt = cumulativeLayoutShiftAt
    .filter((sample) => !sample.supported)
    .map(({ state, breakpoint }) => `${state}@${breakpoint}`);
  const clsFailures = cumulativeLayoutShiftAt
    .filter((sample) => sample.supported && sample.value > opts.maxCls)
    .map(({ state, breakpoint, value }) => ({ state, breakpoint, value, threshold: opts.maxCls }));
  const maxCumulativeLayoutShift = cumulativeLayoutShiftAt.reduce(
    (max, sample) => Math.max(max, sample.value),
    0,
  );
  // Default must render non-trivial content. Every requested non-default state must also
  // differ from default at the same breakpoint; repeating the default page no longer passes.
  const stateRendered = {};
  for (const state of opts.states) {
    const snaps = evidence.snapshots.filter((s) => s.state === state);
    if (state === 'default') {
      stateRendered[state] = snaps.some((s) => s.renderedTextLength > 0);
      continue;
    }
    stateRendered[state] = snaps.some((snapshot) => {
      const defaultSnapshot = evidence.snapshots.find(
        (candidate) => candidate.state === 'default' && candidate.breakpoint === snapshot.breakpoint,
      );
      return snapshot.renderedTextLength > 0 &&
        !!defaultSnapshot &&
        snapshot.renderSignature !== defaultSnapshot.renderSignature;
    });
  }
  const renderedFonts = [...new Set(evidence.snapshots.map((s) => s.body?.fontFamily).filter(Boolean))];
  // interactive controls under 44x44 CSS px, with where they were seen (state@breakpoint).
  const touchTargetsUnder44 = evidence.snapshots.flatMap((s) =>
    (s.smallTouchTargets || []).map((t) => ({
      selector: t.selector,
      size: `${t.width}x${t.height}`,
      state: s.state,
      breakpoint: s.breakpoint,
    })),
  );

  evidence.gates = {
    axeAvailable: evidence.axeAvailable,
    seriousAxeViolations: seriousAxe,
    horizontalOverflowAt: overflowAt,
    landmarkFailures,
    liveRegionFailures,
    stateRendered,
    renderedFonts,
    touchTargetsUnder44,
    clsAvailable: clsUnavailableAt.length === 0,
    clsThreshold: opts.maxCls,
    maxCumulativeLayoutShift: Number(maxCumulativeLayoutShift.toFixed(5)),
    cumulativeLayoutShiftAt,
    clsUnavailableAt,
    clsFailures,
  };

  await fs.writeFile(
    path.join(outDir, 'evidence.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
    'utf8',
  );

  console.log(`captured ${evidence.snapshots.length} snapshot(s) -> ${outDir}`);
  console.log(`  serious/critical axe violations: ${seriousAxe}`);
  console.log(`  horizontal overflow: ${overflowAt.length ? overflowAt.join(', ') : 'none'}`);
  console.log(
    `  main landmark failures: ${
      landmarkFailures.length
        ? landmarkFailures.map((failure) => `${failure.state}@${failure.breakpoint}`).join(', ')
        : 'none'
    }`,
  );
  console.log(
    `  live-region failures: ${
      liveRegionFailures.length
        ? liveRegionFailures.map((failure) => `${failure.state}@${failure.breakpoint} (${failure.expected})`).join(', ')
        : 'none'
    }`,
  );
  console.log(
    `  CLS: ${clsUnavailableAt.length ? `unavailable at ${clsUnavailableAt.join(', ')}` : `max ${maxCumulativeLayoutShift.toFixed(5)}`} ` +
      `(threshold ${opts.maxCls}; ${clsFailures.length ? `${clsFailures.length} failure(s)` : 'pass'})`,
  );
  console.log(`  states rendered: ${Object.entries(stateRendered).map(([k, v]) => `${k}=${v ? 'yes' : 'NO'}`).join(', ')}`);
  console.log(`  rendered font(s): ${renderedFonts.join(' | ') || 'unknown'}`);
  console.log(
    `  touch targets < 44x44: ${
      touchTargetsUnder44.length
        ? touchTargetsUnder44.map((t) => `${t.selector} ${t.size} (${t.state}@${t.breakpoint})`).join(', ')
        : 'none'
    }`,
  );
}

main().catch((e) => {
  console.error(`capture.mjs failed: ${e?.stack || e}`);
  process.exit(2);
});
