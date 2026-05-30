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

## Honest limitation (read this)

**Today the judge scores TSX source, not pixels.** `judge-prompt.md` says "judge from the
TSX source and the likely UI it would produce," and `detectResponsiveClasses` greps for
`sm:`/`md:` classes. The original `eval-spec.md` promised "viewport screenshots" — that was
never implemented. So this eval shares the same source-only weakness the per-build gates had
before `capture.mjs`.

## Render-integration path (the real fix)

`skills/design-review/scripts/capture.mjs` is the rendered-evidence primitive (proven against
`fixtures/states-demo.html`). To make this eval render-based:

1. Mount each generated `before.tsx` / `after.tsx` as a route in `demos/` (the Next app),
   or static-render it, so each variant has a reachable URL.
2. Run `capture.mjs <url> --states default,empty,loading,error` per variant.
3. Replace the source penalties (`detectResponsiveClasses`, the regex state/a11y greps) with
   `evidence.json` gates (serious axe, real overflow, did the state render).
4. Feed the **screenshots** to the judge instead of the TSX, mirroring
   `workflows/new-page-component.mjs` (which already grades on screenshots).

Until step 4 lands, treat eval scores as directional, not authoritative — same two-tier rule
as `skills/design-review/scripts/README.md`. Known build risk for step 1: generated pages
often import icon/font libs, so the mount harness needs a tolerant build + a recorded skip
list rather than silent drops.
