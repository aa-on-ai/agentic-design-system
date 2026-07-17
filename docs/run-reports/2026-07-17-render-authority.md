# Render-authoritative eval loop

## Outcome

Phase 3 makes browser evidence the authority for ADS A/B evaluation.

The loop now generates before/after TSX, mounts both variants, captures default/loading/empty/error
at mobile and desktop, evaluates rendered gates, and sends screenshots to a model that did not
build the page. Source heuristics remain in the report as advisory diagnostics.

## Authority contract

The candidate cannot pass when any of these are unresolved:

- bundle, mount, capture, or evidence failure
- axe unavailable or serious/critical axe violations
- horizontal overflow
- interactive targets below 44x44 CSS pixels
- requested states that repeat default instead of rendering distinctly
- no screenshot packet
- independent judge unavailable or invalid (`needs-human`)

Every variant clears its prior evidence directory before rerun, preventing stale success receipts.
Any skipped variant produces `skips.json` and makes the standalone render CLI exit non-zero.

## Deterministic proof

Command:

```bash
npm run eval-loop:render-smoke
```

The fixture candidate:

- passes all three source checkers and includes a responsive breakpoint class
- receives a deliberately winning 50/50 independent judge score
- distinctly renders all four requested states
- renders a fixed 1,200px panel that overflows at 390px

The rendered authority blocks it. The same smoke also proves:

- repeated default content does not count as loading/empty/error coverage
- an unresolved screenshot judge escalates to human review
- an unresolvable import becomes an explicit render failure

Result: 15/15 checks passed.

## Regression packet

- `npm run render-eval:smoke`: 12/12
- `npm run eval-loop:render-smoke`: 15/15
- `npm run compare:smoke`: 37/37
- `npx tsx testing/eval-loop.ts --dry-run`: 8 prompts loaded; authority contract active
- same generator/judge model: rejected before generation
- `testing/install-smoke.sh`: passed
- demo production build: passed
- homepage regression: passed
- homepage Chromium/WebKit hardening matrix: passed
- JS syntax checks and `git diff --check`: passed

No paid generation or screenshot judging was run. The deterministic fixture judge is explicitly
identified in its receipt; production runs require provider credentials or stop at `needs-human`.

## Known limit

Generated Tailwind variants use the Play CDN in the evaluation mount. That makes real A/B runs
network-dependent. Mount/capture failure is fail-closed and leaves a receipt; it cannot pass as a
successful comparison.
