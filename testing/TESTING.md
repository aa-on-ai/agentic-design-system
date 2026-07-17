# testing

current verification for the public package.

## release gate

run the complete release gate from a clean checkout:

```bash
npm ci
npm run playwright:install
npm run release:check
```

the gate checks release metadata, the single-project install smoke, the five-agent install matrix,
and the comparison/render/eval-loop authority smokes. the install scripts default to
`skills@1.5.19`; override `SKILLS_CLI_PACKAGE` only when deliberately certifying a newer CLI.

## install smoke

run this before publishing package changes:

```bash
testing/install-smoke.sh
```

the smoke test installs from the local repo into a temporary project and verifies:

- all 10 skills are present
- the `design-variations` browser scaffold is installed under its `assets/` directory
- all 5 runtime templates are bundled: outcome, project identity, reference intake, grader report, and run report
- bundled templates and all 7 workflow runbooks match their canonical top-level copies
- the deterministic decision-trace script is present and byte-identical in the installed orchestrator

the installer does not generate or replace `AGENTS.md`. project instructions remain an explicit setup step.

success ends with:

```text
install smoke passed: 10 skills, 2 skill assets, 5 bundled templates, and 7 workflow runbooks (all in sync)
```

to exercise the public github shorthand instead of the current checkout:

```bash
testing/install-smoke.sh aa-on-ai/agentic-design-system
```

this verifies the public GitHub source through an explicit Codex copy install in a clean temporary
project.

## install matrix

run this before a release or after changing install paths, skills, templates, or bundled runbooks:

```bash
testing/install-matrix.sh
```

the matrix creates separate clean projects and explicitly installs to:

- Claude Code: `.claude/skills/`
- Codex: `.agents/skills/`
- Cursor: `.agents/skills/`
- OpenClaw: `skills/`
- Hermes (`hermes-agent`): `.hermes/skills/`

every target must contain all 10 skills, the variation asset, 5 bundled templates, 6 bundled
workflow runbooks, and `skills-lock.json`. success ends with:

```text
install matrix passed: 5 agents x 10 skills, with assets, templates, workflow runbooks, and lockfiles verified
```

exercise the public source with:

```bash
testing/install-matrix.sh aa-on-ai/agentic-design-system
```

## UI work checks

for UI work, use the outcome/grader loop from the README and then run the deterministic checks on changed files:

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>
```

attach screenshots or preview links when the host workflow supports them.

## rendered eval authority

verify the A/B evidence boundary without API spend:

```bash
npm run render-eval:smoke
npm run eval-loop:render-smoke
npm run decision-trace:smoke
npx tsx testing/eval-loop.ts --dry-run --slug canopy
```

the authority smoke proves that a fixture can pass every source check and receive a 50/50
independent judge score while still failing because the browser measures mobile overflow.
Bundle/capture skips, serious axe violations, overflow, undersized touch targets, missing
distinct states, and unresolved judging cannot silently pass.

## homepage regression

with the demo app running, verify the public homepage's typography rhythm and both Ember interactions:

```bash
npm run homepage:smoke -- http://127.0.0.1:3000
```

the regression fails if body or station-heading line-height ratios drift, if footer Ember is not an accessible 48px target, or if tapping it does not produce a reaction state.

## homepage runtime packet

With the production build running, record the three-run mobile and desktop Web Vitals packet plus the active-theme image request chain:

```bash
npm run homepage:runtime -- http://127.0.0.1:3000 evidence/homepage-runtime.json
```

The mobile profile uses a 390x844 viewport, DPR 2, 4x CPU slowdown, 150ms latency, 1.6Mbps down, and 750Kbps up. The report records LCP, CLS, interaction latency, the LCP element, hero response format and bytes, and the first-load theme requests.

## homepage hardening matrix

Run the Chromium and WebKit matrix at 390, 768, and 1280px:

```bash
npm run homepage:hardening -- http://127.0.0.1:3000
```

This gate verifies one active hero request on first load, stable full-page scrolling, reduced-motion fallbacks, theme persistence without a wrong first frame, keyboard focus in Chromium, copy feedback without layout shift, and the locked recovery invariants.

## archived eval fixtures

historical source-judged results and case studies live under `docs/archive/pre-spine-evals/`.
the current `testing/eval-loop.ts` renders both variants and treats source heuristics as advisory.
