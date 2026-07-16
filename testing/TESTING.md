# testing

current verification for the public package.

## install smoke

run this before publishing package changes:

```bash
testing/install-smoke.sh
```

the smoke test installs from the local repo into a temporary project and verifies:

- all 9 skills are present
- all 5 runtime templates are bundled: outcome, project identity, reference intake, grader report, and run report
- bundled templates and all 6 workflow runbooks match their canonical top-level copies

the installer does not generate or replace `AGENTS.md`. project instructions remain an explicit setup step.

success ends with:

```text
install smoke passed: 9 skills, 5 bundled templates, and 6 workflow runbooks (all in sync)
```

to exercise the public github shorthand instead of the current checkout:

```bash
testing/install-smoke.sh aa-on-ai/agentic-design-system
```

this verifies the actual `npx skills add aa-on-ai/agentic-design-system --yes` path in a clean temporary project.

## UI work checks

for UI work, use the outcome/grader loop from the README and then run the deterministic checks on changed files:

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>
```

attach screenshots or preview links when the host workflow supports them.

## homepage regression

with the demo app running, verify the public homepage's typography rhythm and both Ember interactions:

```bash
npm run homepage:smoke -- http://127.0.0.1:3000
```

the regression fails if body or station-heading line-height ratios drift, if footer Ember is not an accessible 48px target, or if tapping it does not produce a reaction state.

## archived eval fixtures

the old before/after benchmark loop, judge prompt, sample prompts, generated results, and case studies live under `docs/archive/pre-spine-evals/`.

those artifacts are useful provenance for the earlier review/check/report loop. they are not the current public ADS story.
