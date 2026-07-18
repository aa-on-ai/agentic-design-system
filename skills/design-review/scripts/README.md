# verification scripts — two tiers of evidence

ADS evidence comes in two tiers. Do not confuse them in a report.

## Tier 1 — source heuristics (cheap, fast, gameable)

`anti-pattern-check.py`, `state-check.py`, `accessibility-check.py` grep the `.tsx`
source. They are useful as a **pre-flight** — they catch obvious agent defaults before
you spend a render. But they are gameable and must never be the final sign-off.

Proof they are gameable:

```bash
printf 'export default function Page(){\n  // handles loading, empty, and error states\n  return <div>Orders</div>;\n}\n' > /tmp/gamed.tsx
python3 state-check.py /tmp/gamed.tsx     # → ✓ loading ✓ empty ✓ error
```

That component renders `<div>Orders</div>`. The states exist only in a comment. The
source heuristic passes anyway. A control plane cannot gate on this.

## Tier 2 — rendered evidence (authoritative, non-gameable)

`capture.mjs` loads the **live route** in a headless browser and records what the user
actually sees: a screenshot per state per breakpoint, axe run against the live DOM,
real horizontal-overflow, semantic landmarks/live regions, CLS, whether each state's
content actually rendered, and the font/color computed from the page. None of this can
be satisfied by a comment.

```bash
# one-time setup (installs playwright + @axe-core/playwright + chromium, then verifies):
node skills/design-review/scripts/setup-capture.mjs
# verify only, no install:  node skills/design-review/scripts/setup-capture.mjs --check

# capture a running route:
node capture.mjs "http://localhost:3000/orders" \
  --states default,loading,empty,error \
  --out evidence/orders
```

CLS uses Chromium's `layout-shift` PerformanceObserver and the Web Vitals session-window
algorithm. The default hard threshold is `0.1`; override it only when the product contract
explicitly requires another budget: `--max-cls 0.05`.

Run `setup-capture.mjs` from your project root so the deps land in a `node_modules` that
`capture.mjs` resolves. If capture ever reports Playwright missing, it prints this same command.

Output (`evidence/orders/`):
- `evidence.json` — structured facts + a `gates` block (axe, overflow, main landmark,
  state-aware live regions, CLS, state-render, touch targets, fonts)
- `<state>-<WxH>.png` — one screenshot per state per breakpoint

States are toggled via the URL hash (`#state=<name>`); the route must expose them.

## Tier 2b — before/after delta (`compare.mjs`)

For modifications to existing UI, one capture only proves the candidate renders — it says
nothing about what the change *did*. `compare.mjs` pairs two capture runs deterministically
by `state@breakpoint` and records the visual delta:

```bash
# capture both revisions with the SAME states and breakpoints:
node capture.mjs "<baseline-url>"  --states default,empty --out evidence/orders-baseline
node capture.mjs "<candidate-url>" --states default,empty --out evidence/orders-candidate
node compare.mjs evidence/orders-baseline evidence/orders-candidate
```

Output (`evidence/orders-candidate/comparison/`):
- `comparison.json` — per-pair changed-pixel metrics (`changedPixels`, `changedPct`,
  dimensions), `incomparable` entries for unmatched states/breakpoints, and a summary;
  the same summary is injected as a `comparison` section into the candidate's `evidence.json`
- `diff-<state>-<WxH>.png` — one diff image per pair (out-of-bounds canvas from a
  height change counts as changed by definition, not by color tolerance)

**The delta is evidence, not a verdict.** A large delta on a redesign is expected; a large
delta on a "polish pass" or a "1:1 port" is a finding to report. The report should say what
changed, what stayed identical, and whether the delta matches the stated intent. Only pass
`--threshold <pct>` when an explicit visual-change budget was agreed — that is the one case
where compare itself fails (exit 1), and incomparable pairs also fail it (you cannot attest
to a budget over pairs that never got compared).

**Two pixel-comparison modes.** The default metric is *visibly changed*: pixelmatch's
perceptual tolerance (0.1) ignores anti-aliasing noise **and imperceptible tint shifts** —
`#f7f6f3` → `#e8f0e8` reads as identical. That is the right semantic for "did the layout
change," and it is the documented meaning of `identical` in the output. For strict-fidelity
work (1:1 ports, polish passes, token adherence) where any numeric color drift must register,
pass `--pixel-threshold 0`. Strict mode also counts pixels that pixelmatch classifies as
anti-aliasing; perceptual mode ignores them. The threshold and anti-aliasing policy actually
used, plus `toolVersion`/`schemaVersion`, are recorded in `comparison.json` so a report can
always say which mode produced the numbers.

Smoke test (no browser, no network): `node testing/compare-smoke.mjs`.

### Smoke test (no dev server, no network)

```bash
cd ../../../../testing/fixtures
node ../../skills/design-review/scripts/capture.mjs \
  "file://$(pwd)/states-demo.html" \
  --states default,loading,empty,error --out ./evidence/states-demo
# expect: 2 serious axe violations (the deliberate missing-alt img), all 4 states rendered,
# main/live-region gates clear, and CLS within 0.1.
```

## The rule

Source heuristics advise. Rendered evidence gates. A run-report's verdict must rest on
Tier 2; Tier 1 hits are pre-flight notes. The grader judges the screenshots, not the source.
