# Workflow: install / usability smoke test

Verify ADS actually installs into a clean project and the bundled pieces are present — before
publishing skill changes or telling someone "just install it."

## When to use

After changing skills, templates, or the install path; before a release; or when a user reports
that ADS "didn't show up" in their agent.

## Read first

- `README.md` → **Install** and **Verify the package**
- `testing/TESTING.md`

## Run

```bash
# installs from the local repo into a temp project, checks all 10 skills + variation scaffold + 5 bundled templates
testing/install-smoke.sh
```

Success ends with: `install smoke passed: 10 skills, 1 skill asset, 5 bundled templates, and 6 workflow runbooks (all in sync)`.

Then confirm the verification scripts a consumer would run actually execute:

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <any-sample.tsx>
python3 skills/design-review/scripts/state-check.py <any-sample.tsx>
python3 skills/design-review/scripts/accessibility-check.py <any-sample.tsx>
```

## Evidence required

- The smoke test's final line (pass) or the exact `missing installed skill: …`, `missing
  installed skill asset: …`, `installed skill asset drift: …`, `missing bundled template: …`,
  or drift line (fail).
- Confirmation the three scripts run without a Python error on a sample file.

## Output

A short pass/fail note: which skills/templates installed, what (if anything) is missing, and the
exact failing assertion. No prose padding.

## Blocked when

- `npx skills` is unavailable in the environment — fall back to the **No-CLI install** in
  `README.md` (copy `skills/` into the agent's skills dir) and verify the 10 skill dirs exist
  manually; record that the CLI path was untested.

## Stop when

The smoke passes, or you have named a specific missing skill/template/assertion. **Do not report
"install works" from reading the script** — it only counts if the script ran green.
