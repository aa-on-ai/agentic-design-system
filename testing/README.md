# testing — ADS self-eval

ADS asks every build for receipts. This harness is where ADS produces receipts for
**itself**: does the system actually make agent UI better, on a held-out prompt set,
judged by a model that didn't build it?

## eval-loop.ts — ADS on vs off (A/B)

For each prompt in `prompts.json`, the same generator builds twice:
- **before** — no skills, plain prompt
- **after** — the full core-pack bundle (routing + design-review + references + ux + polish)

Then an **independent judge model** (default different from the generator) scores both on
5 dimensions, and the programmatic checks add penalties. Output lands in `results/<slug>/`.

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

`eval-loop.ts` still judges **TSX source**, not pixels (its `detectResponsiveClasses` greps
`sm:`/`md:` classes; `judge-prompt.md` grades source). Treat its scores as directional. The
render-based path below is the authoritative one.

## render-eval.mjs — judge from screenshots, not source

`render-eval.mjs` mounts a generated variant as a real route, captures it with
`capture.mjs` (axe on the live DOM, screenshots per state/breakpoint, real overflow), and
feeds the **screenshots** to the judge. Same 5-dimension rubric as the source judge — only
the input modality changes (`judge-render-prompt.md`).

Pipeline per variant: **mount (esbuild → html) → capture.mjs → judge from screenshots.**
Every stage failure becomes an explicit skip receipt — no silent drops.

### Setup (once)

```bash
npm install                      # playwright, @axe-core/playwright, esbuild (root manifest)
npm run playwright:install       # chromium
```

Variants' own imports (`react`, `lucide-react`, `recharts`, …) resolve from
`demos/node_modules`, so the demos app must have run `npm install` too.

### Commands

```bash
# deterministic fixture path — no API key, no network:
node testing/render-eval.mjs --fixture
npm run render-eval:smoke         # runs the fixture path + asserts the receipts

# a real variant (judge sends screenshots to the model when a key is set):
node testing/render-eval.mjs --variant path/to/page.tsx --slug orders --name after \
  --states default,empty,loading,error --prompt "build an orders page"
```

Judge: if `ANTHROPIC_API_KEY` is set, screenshots are sent to the model (`--judge` /
`EVAL_JUDGE_MODEL`, default `claude-opus-4-8`). If **not** set, a deterministic stub records
exactly which screenshots + gates *would* be sent — so the fixture path runs offline and the
screenshot-wiring stays provable.

### Output (under `evidence/render/<slug>/`, gitignored)

- `<variant>/receipt.json` — gates + judge result (or stub) + mounted html + evidence path
- `<variant>/capture/` — screenshots + `evidence.json` from `capture.mjs`
- `skips.json` — every skipped variant with its stage and concrete reason
- `render-report.md` — one-table summary

### Limitations (read this)

- **Per-state capture needs the component to honor `#state=`.** The fixture does (it reads
  `location.hash`); arbitrary generated pages render their default, so capture still gets
  breakpoints + axe + overflow but not distinct empty/loading/error frames unless the page
  exposes them. This is a property of the generated page, not the harness.
- **Tailwind:** fixtures use inline styles (offline). Real Tailwind variants need
  `--tailwind cdn`, which injects the Tailwind Play CDN and therefore needs network at capture.
- **Tolerant build:** a variant that imports a missing icon/font/chart lib fails the esbuild
  stage and is recorded in `skips.json` with the unresolved specifier — never dropped silently.
- The judge sends up to 4 screenshots per variant (default state across breakpoints first) to
  bound tokens.

## Still source-only (next step)

`render-eval.mjs` grades a single rendered variant. The **A/B on-vs-off** comparison still
lives in `eval-loop.ts` and judges source. Wiring `eval-loop`'s generated `before`/`after`
through `render-eval` (render both, compare rendered scores) is the remaining step.
