# testing — ADS self-eval

ADS asks every build for receipts. This harness is where ADS produces receipts for
**itself**: does the system actually make agent UI better, on a held-out prompt set,
judged by a model that didn't build it?

## eval-loop.ts — ADS on vs off (A/B)

For each prompt in `prompts.json`, the same generator builds twice:
- **before** — no skills, plain prompt
- **after** — the full core-pack bundle (routing + design-review + references + ux + polish)

Both variants are mounted and captured at mobile and desktop across default, loading, empty,
and error states. Rendered browser gates run first; then an **independent judge model**
(default different from the generator) scores screenshots on 5 dimensions. Output lands in
`results/<slug>/`, with browser receipts under `evidence/render/eval-<slug>/`.

```bash
# dry run (no API calls, validates inputs + bundle):
npx tsx testing/eval-loop.ts --dry-run

# real run (needs OPENAI_API_KEY and/or ANTHROPIC_API_KEY):
npx tsx testing/eval-loop.ts --slug canopy
npx tsx testing/eval-loop.ts            # full set
```

Defaults: generator `claude-sonnet-4-6`, judge `claude-opus-4-8` (override with
`--generator` / `--judge` or `EVAL_GENERATOR_MODEL` / `EVAL_JUDGE_MODEL`). Generator and
judge are intentionally different — the judge must not be the builder.

The verdict is render-authoritative:

- a bundle/capture failure blocks the comparison and writes an explicit skip receipt
- serious/critical axe violations, horizontal overflow, sub-44px touch targets, or a missing
  distinct requested state block the candidate
- an unresolved screenshot judge returns `needs-human`; it never silently passes
- source anti-pattern, state, accessibility, and responsive checks remain advisory diagnostics

## render-eval.mjs — judge from screenshots, not source

`render-eval.mjs` mounts a generated variant as a real route, captures it with
`capture.mjs` (axe on the live DOM, screenshots per state/breakpoint, real overflow), and
feeds the **screenshots** to the judge using `judge-render-prompt.md`.

Pipeline per variant: **mount (esbuild → html) → capture.mjs → judge from screenshots.**
Every stage failure becomes an explicit skip receipt. Any skipped variant makes the CLI exit
non-zero; the packet remains available for diagnosis.

### Setup (once)

```bash
npm install                      # playwright, @axe-core/playwright, esbuild (root manifest)
npm run playwright:install       # chromium
```

Variants' own imports (`react`, `lucide-react`, `recharts`, …) resolve from
`demos/node_modules`, so the demos app must have run `npm install` too.

### Commands

```bash
# deterministic fixture path — intentionally exits 1 because one variant is unrenderable:
node testing/render-eval.mjs --fixture
npm run render-eval:smoke         # runs the fixture path + asserts the receipts

# proves clean source checks and a 50/50 judge cannot bypass browser overflow:
npm run eval-loop:render-smoke

# a real variant (judge sends screenshots to the model when a key is set):
node testing/render-eval.mjs --variant path/to/page.tsx --slug orders --name after \
  --states default,empty,loading,error --prompt "build an orders page"
```

Judge: screenshots are sent to Anthropic or OpenAI according to `--judge` /
`EVAL_JUDGE_MODEL` (default `claude-opus-4-8`). If no matching API key is available, the
receipt is `needs-human` and records the screenshots + gates for manual review.

### Output (under `evidence/render/<slug>/`, gitignored)

- `<variant>/receipt.json` — gates + judge result (or stub) + mounted html + evidence path
- `<variant>/capture/` — screenshots + `evidence.json` from `capture.mjs`
- `skips.json` — every skipped variant with its stage and concrete reason
- `render-report.md` — one-table summary

### Limitations (read this)

- **Per-state capture needs the component to honor `#state=`.** The A/B generator contract
  requires it. A non-default state only passes when its rendered signature differs from default
  at the same breakpoint.
- **Tailwind:** fixtures use inline styles (offline). Real Tailwind variants need
  `--tailwind cdn`, which injects the Tailwind Play CDN and therefore needs network at capture.
- **Tolerant diagnostics, strict verdict:** a missing icon/font/chart import is recorded in
  `skips.json` with the unresolved specifier, and the authoritative comparison is blocked.
- The judge sends up to 4 screenshots per variant (default state across breakpoints first) to
  bound tokens.

## Authority smoke

`eval-loop:render-smoke` uses a fixture that passes every source heuristic and receives a
deliberately winning screenshot-judge score, but renders a fixed 1,200px panel on mobile. The
browser overflow gate blocks it. A second broken-import fixture proves incomplete renders also
block and leave a concrete receipt.
