# Loop demo — build, gate, revise until the evidence clears

A real run of [`workflows/new-page-component.mjs`](../../workflows/new-page-component.mjs) (the ADS
loop made executable: route → build → render-capture → deterministic gates → independent grader →
revise → report). Task: an "Orders" admin screen with default/loading/empty/error states, gated at
390 / 768 / 1280px.

> Generated `evidence/` is gitignored and regenerated on demand; this directory is a **preserved
> sample** kept under `docs/` so the worked example travels with the repo.

The gates read *rendered evidence* (`capture.mjs` output — axe on the live DOM, real overflow, real
touch-target sizes), not the source. The builder cannot self-clear; a separate grader judges the
screenshots and the loop revises until every hard gate passes.

## Gate trail (computed from each iteration's `evidence.json`, not claimed by the builder)

| Iteration | serious axe | horiz. overflow | states render | touch targets <44px | gate | grader |
|---|---|---|---|---|---|---|
| iter1 | **12** | 0 | 4/4 | **114** | FAIL | needs_revision → "enlarge touch targets" |
| iter2 | 12 | 0 | 4/4 | **12** | FAIL | needs_revision → "finish targets, fix axe" |
| iter3 | **0** | 0 | 4/4 | **0** | PASS | **satisfied** |

Three passes. iter1→iter2 cleared most touch-target failures (114 → 12); iter2→iter3 closed the
remaining targets and every axe violation (12 → 0). Only then — when the rendered evidence cleared
every gate at all three breakpoints — did the independent grader return `satisfied`.

The same loop returns `failed` when a screen still misses a hard gate after its revise budget, rather
than ship it — the verdict always rests on what rendered, never on the source.

## What each file is

- `iter{1,2,3}/evidence.json` — the authoritative rendered facts the gates ran on.
- `iter{1,2,3}/default-390x844.png`, `default-1280x800.png` — representative screenshots (mobile + desktop).
  The full run captured 4 states × 3 breakpoints per iteration; these are the lean subset.
- `RUN-REPORT.md` — the run report the workflow emitted.

## Why this matters

A source-only check passes when a comment says `// handles loading, empty, error`. This run shows the
opposite stance: a verdict that rests on what actually rendered, an independent grader that judges
screenshots in a separate context, and a loop that revises until the evidence is clean — or refuses
to ship.
