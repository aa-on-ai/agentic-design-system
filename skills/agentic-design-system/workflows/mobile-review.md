# Workflow: mobile review

Review a mobile / responsive / app / PWA screen as **two independent passes** so opinions
never get mistaken for defects.

## When to use

The task is mobile/responsive review, or names: mobile, responsive, app, PWA, iOS, Android,
safe area, notch, thumb zone/reach, touch targets, gesture, or "check this on a phone."

## Read first

- `routing/ROUTING.md` → **Mobile + motion review** (the routing rule)
- `skills/design-review/references/mobile.md` (depth: lenses, decision forks, severity tiers) — if present in your install
- `skills/design-review/references/responsive.md` (cross-width layout checklist)

If `mobile.md` is not in your install, the two-pass shape below is enough to run.

## Run

Two passes — keep their outputs in **separate report sections**:

**Pass A — design judgment (opinions).** Read the screen through these lenses (questions, not
rules): thumb reach, one clear primary action, navigation pattern fit, density tuned for the
screen, gesture discoverability. Surface the recurring **decision forks** (nav structure, sheet
vs modal, gesture vs visible control, action placement, list vs grid, long-form structure,
density, destructive-action placement, onboarding) — name the fork, state the tradeoff, point to
the signal. Do not pick silently.

**Pass B — platform verification (objective defects).** On changed files, run the cheap checks:

```bash
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
```

Then capture the rendered route at mobile breakpoints — this is the **authoritative** platform
evidence (axe on the live DOM, measured overflow), not an eyeball pass:

```bash
node skills/design-review/scripts/capture.mjs "<running-route-url>" \
  --states default,empty,loading,error --breakpoints 390x844,768x1024 --out evidence/<slug>
```

Read `evidence/<slug>/evidence.json` → `gates` and map them to platform defects:

- `seriousAxeViolations > 0` → P0/P1 (by impact), cite the axe rule id
- `horizontalOverflowAt` non-empty → P0 (overflow at that breakpoint)
- a required state with `stateRendered: false` → P1 (the state never renders)

Then eyeball the screenshots for what the gates don't measure: safe-area insets, touch-target
size, hover-only traps, PWA manifest/offline. `capture.mjs` ships with the design-review skill,
so installed agents have it. If Playwright isn't installed, fall back to a manual 375px
screenshot and **say capture was unavailable** — don't silently skip the rendered pass.

## Evidence required

- `evidence/<slug>/evidence.json` + the captured screenshots from `capture.mjs` (or a manual
  375px screenshot with an explicit note that capture was unavailable).
- Output of the three source checks on changed files.
- Pass A findings tied to decision forks; Pass B findings tied to a `file:line`, axe rule id, or
  the breakpoint from the capture gates.

## Output

Fill the **mobile review** section of `templates/run-report-template.md`:

- **design forks & opinions** — ranked by user impact (high/med/low), no `file:line`.
- **platform defects** — severity-tiered P0–P3, each with `file:line` and a fix.

(If your run-report version lacks those sections, produce the two tables inline under a
`## mobile review` heading.)

## Blocked when

- You cannot render the screen on a mobile viewport at all (no preview, no device) — say so;
  do not guess platform defects from source alone.
- The screen's states (empty/loading/error) can't be reached to review them.

## Stop when

Both passes are done and the report keeps opinions and defects visually distinct. **Do not
promote an opinion to a P-level defect to look more confident**, and do not soften a real P0 into
a suggestion. If a fork is genuinely a judgment call, leave it as a ranked opinion for the human.
