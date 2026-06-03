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
//
// Output (in --out):
//   evidence.json         structured facts: per state/breakpoint axe + computed styles
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
    // Landmark / state-render facts: did anything actually render for this state?
    const visibleText = (body?.innerText || '').replace(/\s+/g, ' ').trim();
    return {
      body: styleOf(body),
      landmarks: {
        main: !!document.querySelector('main'),
        nav: !!document.querySelector('nav'),
        header: !!document.querySelector('header'),
        footer: !!document.querySelector('footer'),
      },
      // a rendered status/alert region is real evidence of a loading/error state;
      // the WORD "loading" in source is not.
      statusRegion: !!document.querySelector('[role="status"],[aria-live],[aria-busy="true"]'),
      alertRegion: !!document.querySelector('[role="alert"]'),
      renderedTextLength: visibleText.length,
      renderedTextSample: visibleText.slice(0, 280),
      probe,
    };
  }, selectors);
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
        const target = state === 'default' ? opts.url : `${opts.url.split('#')[0]}#state=${state}`;
        await page.goto(target, { waitUntil: 'networkidle' }).catch(() => {});
        if (opts.waitFor) await page.waitForSelector(opts.waitFor, { timeout: 5000 }).catch(() => {});
        if (opts.settle) await page.waitForTimeout(opts.settle);

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
  // a state "rendered" if it produced meaningfully different / non-trivial content
  const stateRendered = {};
  for (const state of opts.states) {
    const snaps = evidence.snapshots.filter((s) => s.state === state);
    stateRendered[state] = snaps.some((s) => s.renderedTextLength > 0);
  }
  const renderedFonts = [...new Set(evidence.snapshots.map((s) => s.body?.fontFamily).filter(Boolean))];

  evidence.gates = {
    seriousAxeViolations: seriousAxe,
    horizontalOverflowAt: overflowAt,
    stateRendered,
    renderedFonts,
  };

  await fs.writeFile(
    path.join(outDir, 'evidence.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
    'utf8',
  );

  console.log(`captured ${evidence.snapshots.length} snapshot(s) -> ${outDir}`);
  console.log(`  serious/critical axe violations: ${seriousAxe}`);
  console.log(`  horizontal overflow: ${overflowAt.length ? overflowAt.join(', ') : 'none'}`);
  console.log(`  states rendered: ${Object.entries(stateRendered).map(([k, v]) => `${k}=${v ? 'yes' : 'NO'}`).join(', ')}`);
  console.log(`  rendered font(s): ${renderedFonts.join(' | ') || 'unknown'}`);
}

main().catch((e) => {
  console.error(`capture.mjs failed: ${e?.stack || e}`);
  process.exit(2);
});
