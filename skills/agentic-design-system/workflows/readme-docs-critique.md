# Workflow: README / docs critique

Judge whether the repo's docs actually let a newcomer (human or agent) onboard — separating
objective doc defects from "could be clearer" opinions.

## When to use

After changing README/AGENTS/integration docs; before a release; or when onboarding friction is
reported.

## Read first

- `README.md`, `AGENTS.md`
- `integrations/` (the per-tool setup docs)
- `routing/ROUTING.md`

## Run

This is a read-and-judgment workflow — no build scripts. Do two concrete things:

1. **Trace one onboarding path end to end**, doing exactly what the doc says (copy the install
   command, follow the snippet) and note the first place it breaks or assumes knowledge.
2. **Verify internal links and commands resolve:**

```bash
git diff --check                                  # no stray whitespace/conflict markers
# spot-check that referenced paths exist, e.g.:
test -e templates/outcome-template.md && echo ok
```

## Evidence required

- A short trace of the onboarding path with the exact `doc:line` where it stalled.
- For each claim of breakage: the broken link / wrong command / missing file, quoted.

## Output

A critique with two clearly separated lists (mirror the opinions-vs-defects rule):

- **Defects** — objectively wrong: dead link, wrong command, missing file, contradictory step.
  Each with `doc:line` and the fix.
- **Opinions** — "this could be clearer / reordered." Ranked by how much it blocks onboarding.

## Blocked when

Not typically blocked. If a doc references an external service you can't reach, mark that claim
"unverified" rather than asserting it works or fails.

## Stop when

Defects are concrete (each with `doc:line`) and opinions are prioritized. **Do not pad with
generic "improve clarity" / "add more examples"** — if you can't point to where and why, it's not
a finding.
