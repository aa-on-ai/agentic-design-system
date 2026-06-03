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

Then verify on a real mobile viewport (375px): horizontal overflow, safe-area insets honored,
touch targets ≥ 44×44 / 48×48, hover-only actions have a tap path, PWA manifest/offline if
claimed, layout shift / jank. (Render-based capture is a deeper receipt available in some ADS
versions; do not block on it here — a manual 375px screenshot is acceptable.)

## Evidence required

- A screenshot at 375px (and 768px if the layout changes there).
- Output of the three checks on changed files.
- Pass A findings tied to decision forks; Pass B findings tied to a `file:line`.

## Output

Fill the **mobile review** section of [`templates/run-report-template.md`](../templates/run-report-template.md):

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
