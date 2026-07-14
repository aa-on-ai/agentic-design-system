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

### CI source preflight is advisory

`ci/design-eval.py` runs the three source heuristics together. Its command and GitHub workflow
are deliberately labeled **source preflight (advisory)**. Even a green strict run means only
that the configured grep-based checks found no warnings in the eligible source files; it does
not verify the rendered UI.

```bash
python3 ci/design-eval.py --strict
```

The wrapper reports `SOURCE PREFLIGHT NO_OP` when no eligible `.tsx` files exist. In strict
mode, a missing checker reports `UNVERIFIED` and fails instead of silently skipping it. Neither
state is an authoritative design verdict. Only the rendered tier below can support one.

## Tier 2 — rendered evidence (authoritative, non-gameable)

`capture.mjs` loads the **live route** in a headless browser and records what the user
actually sees: a screenshot per state per breakpoint, axe run against the live DOM,
real horizontal-overflow, whether each state's content actually rendered, and the
font/color computed from the page. None of this can be satisfied by a comment.

```bash
# one-time setup (installs playwright + @axe-core/playwright + chromium, then verifies):
node skills/design-review/scripts/setup-capture.mjs
# verify only, no install:  node skills/design-review/scripts/setup-capture.mjs --check

# capture a running route:
node capture.mjs "http://localhost:3000/orders" \
  --states default,loading,empty,error \
  --out evidence/orders
```

Run `setup-capture.mjs` from your project root so the deps land in a `node_modules` that
`capture.mjs` resolves. If capture ever reports Playwright missing, it prints this same command.

Output (`evidence/orders/`):
- `evidence.json` — structured facts + a `gates` block (serious axe, overflow, state-render, fonts)
- `<state>-<WxH>.png` — one screenshot per state per breakpoint

States are toggled via the URL hash (`#state=<name>`); the route must expose them.

### Smoke test (no dev server, no network)

```bash
cd ../../../../testing/fixtures
node ../../skills/design-review/scripts/capture.mjs \
  "file://$(pwd)/states-demo.html" \
  --states default,loading,empty,error --out ./evidence/states-demo
# expect: 2 serious axe violations (the deliberate missing-alt img), all 4 states rendered.
```

## The rule

Source heuristics advise. Rendered evidence gates. A run-report's verdict must rest on
Tier 2; Tier 1 hits are pre-flight notes. The grader judges the screenshots, not the source.
