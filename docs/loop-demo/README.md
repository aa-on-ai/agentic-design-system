# Loop demo — the gate is un-foolable

A real run of [`workflows/new-page-component.mjs`](../../workflows/new-page-component.mjs) (the ADS
loop made executable: route → build → render-capture → deterministic gates → independent grader →
revise → report). Task: an "Orders" admin screen with default/loading/empty/error states, gated at
390 / 768 / 1280px.

> Generated `evidence/` is gitignored and regenerated on demand; this directory is a **preserved
> sample** kept under `docs/` so the worked example travels with the repo.

This run is kept **because it did not end green.** It is the honest demonstration of the thesis:
the gates read *rendered evidence* (`capture.mjs` output — axe on the live DOM, real overflow, real
touch-target sizes), not the source. The builder cannot self-clear, and the grader will **refuse to
ship** work that doesn't pass — fixing what it can, escalating what it can't.

## Gate trail (computed from each iteration's `evidence.json`, not claimed by the builder)

| Iteration | serious axe | horiz. overflow | states render | touch targets <44px | gate | grader |
|---|---|---|---|---|---|---|
| iter1 | **12** | 0 | 4/4 | **102** | FAIL | needs_revision → "enlarge touch targets" |
| iter2 | **0** | 0 | 4/4 | **68** | FAIL | **failed** — refused to ship |

The revise pass cleared every axe violation (12 → 0) and shrank the touch-target failures (102 → 68),
but did **not** finish the job — so the independent grader returned `failed` rather than passing a
screen that still fails a hard gate at mobile. That "no" is the product working, not a bug.

## What each file is

- `iter1/evidence.json`, `iter2/evidence.json` — the authoritative rendered facts the gates ran on.
- `iter{1,2}/default-390x844.png`, `default-1280x800.png` — representative screenshots (mobile + desktop).
  The full run captured 4 states × 3 breakpoints per iteration; these are the lean subset.
- `RUN-REPORT.md` — the run report the workflow emitted.

## Why this matters

A source-only check passes when a comment says `// handles loading, empty, error`. This run shows
the opposite stance: a verdict that rests on what actually rendered, and a grader in a separate
context that can return `satisfied`, `needs_revision`, or `failed` — and chose `failed` here, on
evidence, without anyone fooling it.
