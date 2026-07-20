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
# package smoke in one clean Codex project
testing/install-smoke.sh

# release distribution matrix in five clean projects
testing/install-matrix.sh
```

Success ends with both:

```text
install smoke passed: 10 skills, 3 skill assets, 5 bundled templates, and 7 workflow runbooks (all in sync)
install matrix passed: 5 agents x 10 skills, with assets, templates, workflow runbooks, and lockfiles verified
```

Then confirm the verification scripts a consumer would run actually execute:

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <any-sample.tsx>
python3 skills/design-review/scripts/state-check.py <any-sample.tsx>
python3 skills/design-review/scripts/accessibility-check.py <any-sample.tsx>
```

## Evidence required

- The single-project smoke's final pass line or exact missing/drift assertion.
- The matrix pass line or the exact failing agent, destination path, and assertion.
- Confirmation the three scripts run without a Python error on a sample file.

## Output

A short pass/fail note: which agents and package pieces installed, what is missing, and the exact
failing assertion. No prose padding.

## Blocked when

- `npx skills` is unavailable in the environment — fall back to the
  `docs/INSTALL.md#no-cli-install` path, verify the 10 skill directories manually, and record
  that the CLI matrix was untested.

## Stop when

Both install checks pass, or you have named a specific agent and missing skill, asset, template,
runbook, lockfile, or path assertion. **Do not report "install works" from reading the scripts** —
it only counts if they ran green.
