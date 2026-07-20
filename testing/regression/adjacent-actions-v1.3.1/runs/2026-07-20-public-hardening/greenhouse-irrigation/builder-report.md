# Glasshouse irrigation · iteration 1 builder report

> Candidate rerun note, 2026-07-20: the public-hardening behavior-path changes only correct install
> inventory documentation. The frozen artifact was recaptured from the current behavior digest;
> all 8 rendered gates passed and all 8 screenshots compare perceptually identical to baseline.

## Run identity

- **Role:** clean-room builder; no grading or self-scoring performed
- **Route / model tier:** Codex implementation / default tier
- **Source truth:** `BENCHMARK-CONTRACT.md`, `greenhouse-irrigation/outcome.md`, and the exact ADS v1.3.1 release skills at SHA `f7d9037012f4c730150b37fbcf86b510aedd6ecb`
- **Scope:** `greenhouse-irrigation/` only; `outcome.md` was read and not modified
- **Artifact:** `artifact/index.html`
- **Rendered evidence:** `iteration-1/evidence/`
- **Stop condition:** initial builder pass complete after repairing objective source-check findings; no grader-directed iteration performed

## Implementation result

The artifact is one self-contained HTML document with inline CSS and JavaScript, synthetic glasshouse data, no external assets, no network requests, and deterministic URL-hash states at `#state=default|loading|empty|error`. Its information spine leads from the next watering run to the action contract, the B2 propagation exception, and the ordered zone readings. The error state explains that telemetry loss activates safe mode, natively disables `Adjust schedule`, and keeps the adjacent `Call grower` link active.

## Commands and results

### Source checks

```bash
python3 <release>/skills/design-review/scripts/anti-pattern-check.py artifact/index.html
python3 <release>/skills/design-review/scripts/state-check.py artifact/index.html
python3 <release>/skills/design-review/scripts/accessibility-check.py artifact/index.html
```

Results:

- `state-check.py`: pass; loading, empty, and error source signals found.
- `accessibility-check.py`: pass; 0 warnings and 0 info findings after consolidating the per-state page title into one rendered `h1` helper.
- `anti-pattern-check.py`: one advisory warning, `No responsive breakpoints`. This checker only recognizes Tailwind prefixes (`sm:`, `md:`, and related tokens); the artifact uses authored CSS `@media (max-width: 760px)` and `@media (max-width: 450px)`. The authoritative 390px rendered captures passed overflow and touch-target gates, so this source-only warning is a known false positive rather than a responsive failure.

`setup-capture.mjs --check` also reported that optional comparison dependencies `pixelmatch` and `pngjs` are not installed. A before/after comparison is not applicable to this new clean-room build. The required capture dependencies were available: the exact release capture completed successfully and `evidence.json` records `axeAvailable: true`.

### Authoritative rendered capture

```bash
python3 -m http.server 41731 --bind 127.0.0.1
node <release>/skills/design-review/scripts/capture.mjs \
  "http://127.0.0.1:41731/index.html" \
  --states default,loading,empty,error \
  --breakpoints 390x844,1280x800 \
  --out iteration-1/evidence \
  --settle 400
```

Result: 8 snapshots captured. `iteration-1/evidence/evidence.json` reports:

- axe available: yes
- serious or critical axe violations: 0
- horizontal overflow: none
- main landmark failures: none
- required live-region failures: none
- touch targets under 44×44: none
- CLS available at all 8 state/breakpoint pairs: yes
- maximum CLS: `0.00000`, threshold `0.1`
- CLS failures: none
- state rendering: default, loading, empty, and error all confirmed

### Native action semantics

A Playwright inspection read the live controls in `default` and `error` at both target widths. The compact results were identical across 390px and 1280px:

```text
default: Adjust schedule = BUTTON, disabled false, no disabled attribute
default: Call grower = A, enabled true, href tel:+14155550187
error:   Adjust schedule = BUTTON, disabled true, disabled attribute present
error:   Call grower = A, enabled true, href tel:+14155550187
```

## Adjacent-action sweep

### Default · 390×844 and 1280×800

- **State contract:** telemetry is live; schedule mutation and grower contact are both permitted.
- **Adjust schedule:** visually primary, enabled, native `<button>`, no `disabled` attribute.
- **Call grower:** visually secondary but actionable, enabled native `<a href="tel:…">`.
- **Copy / helper consistency:** “The plan is editable” agrees with both actions. No helper text implies a restriction.

### Loading · 390×844 and 1280×800

- **State contract:** latest controller and probe readings are still being checked; no mutation controls are presented prematurely.
- **Visible nearby actions:** none, so there is no enabled mutation contradicting the pending state.
- **Copy / semantics:** context-specific loading copy appears in a rendered `role="status"`, polite live region with `aria-busy="true"`.

### Empty · 390×844 and 1280×800

- **State contract:** telemetry is live and no run is currently scheduled; planning and contact remain permitted.
- **Adjust schedule:** enabled native `<button>` and offered as the way to add a run.
- **Call grower:** enabled native telephone link and offered for a changed crop plan.
- **Copy / helper consistency:** “No exception is blocking changes” agrees with both actions.

### Error · 390×844 and 1280×800

- **State contract:** telemetry is offline and safe mode blocks schedule mutation; contacting the on-duty grower remains legitimate.
- **Adjust schedule:** visibly muted, native `<button disabled>`, non-interactive cursor, and bound to explicit helper text through `aria-describedby`.
- **Call grower:** retains a high-contrast outline, enabled native telephone link, and remains visually actionable.
- **Copy / helper consistency:** the assertive alert names telemetry loss and safe mode; the helper states why editing is disabled; adjacent copy explicitly says calling the grower still works.
- **Other visible actions:** none. The historical zone readings remain visible but are labeled as historical and are not interactive.

## Screenshot inspection

All eight screenshots were inspected at original resolution.

- `default-390x844.png`: zone B2, the 24% reading, the 28–32% target, and both actions are immediately legible; controls stack without clipping.
- `default-1280x800.png`: the next run, action band, warning, and ordered zone rows form one calm left-to-right reading spine without a metric grid or sidebar.
- `loading-390x844.png`: the live loading message and skeleton shape remain contained and readable on the narrow viewport.
- `loading-1280x800.png`: loading hierarchy is clear and stable, with no blank flash or decorative data substitute.
- `empty-390x844.png`: the queue-clear explanation and next actions read in sequence without dead-ending the user.
- `empty-1280x800.png`: the empty state uses the available width without stretching prose or introducing generic dashboard chrome.
- `error-390x844.png`: the safe-mode reason, disabled schedule control, enabled grower action, and B2 exception all remain visible in a clear vertical sequence.
- `error-1280x800.png`: the blocking alert and action contract are visually dominant while historical zone context remains available below.

No screenshot showed horizontal clipping, overlapping text, ambiguous status, broken state content, or a touch-target concern. A first-time user can identify B2 propagation as the zone needing attention, understand that telemetry loss triggered safe mode, and see that calling Maya Chen remains available.

## Files produced

- `artifact/index.html`
- `iteration-1/evidence/evidence.json`
- `iteration-1/evidence/default-390x844.png`
- `iteration-1/evidence/default-1280x800.png`
- `iteration-1/evidence/loading-390x844.png`
- `iteration-1/evidence/loading-1280x800.png`
- `iteration-1/evidence/empty-390x844.png`
- `iteration-1/evidence/empty-1280x800.png`
- `iteration-1/evidence/error-390x844.png`
- `iteration-1/evidence/error-1280x800.png`
- `iteration-1/builder-report.md`

## Deviations and unresolved items

- No outcome, contract, release skill, or path outside the greenhouse case was modified.
- No external exemplar or prior benchmark artifact was inspected.
- The anti-pattern source checker warning is retained and explained above; rendered responsive evidence is passing.
- No grading, rubric score, or satisfaction verdict is included. Independent scoring remains the grader’s responsibility.
