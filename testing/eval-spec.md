# Eval Loop Spec

## Overview

Automated A/B testing for the agentic design system. The same generator builds the same prompt
twice: once without ADS and once with the core pack. Both variants must render in a browser before
an independent model judges screenshots.

## Authority

Rendered browser evidence decides whether a comparison is valid. Source heuristics are advisory.

A candidate is blocked by any of these:

- bundle, mount, capture, or evidence failure
- serious or critical axe violations
- horizontal overflow at a required breakpoint
- interactive targets below 44x44 CSS pixels
- a requested state that does not render distinctly from default
- an unresolved independent screenshot judge (`needs-human`)

Source anti-pattern, state, accessibility, and responsive checks remain in the receipt because
they are useful repair hints. They never turn a rendered failure into a pass and never change the
authoritative score.

## Architecture

```text
eval-loop.ts
├── generate before (plain prompt + test-state contract)
├── generate after (core pack + same test-state contract)
├── render-eval.mjs
│   ├── mount each TSX variant with esbuild
│   ├── capture default/loading/empty/error at 390 and 1280
│   ├── compute axe, overflow, touch-target, state, and font gates
│   └── send screenshots to a model that did not build the page
├── render-authority.mjs
│   ├── block incomplete rendered comparisons
│   ├── block candidate gate failures
│   └── require human review when screenshot judging is unresolved
├── run source checks as advisory diagnostics
└── write per-prompt and batch receipts
```

## Independent Judge Dimensions

The screenshot judge returns whole-number scores from 1 to 10 for:

1. hierarchy
2. spacing
3. copy
4. product fit
5. screenshot worthiness

The generator and judge model IDs must differ. A configured fallback judge is recorded in each
receipt when used.

## Output

Per prompt:

- `testing/results/<slug>/before.tsx`
- `testing/results/<slug>/after.tsx`
- `testing/results/<slug>/render-authority.json`
- `testing/results/<slug>/scores.json`
- `testing/results/<slug>/report.md`

Rendered evidence:

- `evidence/render/eval-<slug>/<variant>/receipt.json`
- `evidence/render/eval-<slug>/<variant>/capture/evidence.json`
- screenshots for every requested state and breakpoint
- `evidence/render/eval-<slug>/skips.json`
- `evidence/render/eval-<slug>/render-report.md`

## Score and Verdict

- authoritative score = screenshot judge total, maximum 50
- source-derived penalties are reported as advisory only
- both variants pass rendered gates: compare screenshot judge totals
- baseline gate failure + candidate pass: candidate wins
- candidate gate failure: blocked
- any incomplete render: blocked
- unresolved judge: needs human

## Deterministic Contract Test

```bash
npm run eval-loop:render-smoke
```

The smoke fixture passes all source checks and receives a deliberately winning 50/50 judge score,
but renders a fixed-width panel that overflows mobile. The rendered authority must block it. A
broken-import fixture separately proves a skipped render cannot pass.
