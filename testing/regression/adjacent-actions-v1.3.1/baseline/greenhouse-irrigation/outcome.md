# Outcome: Glasshouse irrigation operations

## Header

- **task:** Build an operational irrigation view for a commercial glasshouse.
- **slug:** `greenhouse-irrigation`
- **artifact:** `artifact/index.html`
- **max iterations:** 2
- **status:** `defined`

## Intent

- **user / situation:** An irrigation lead is coordinating zones while greenhouse telemetry may
  become unavailable.
- **accomplish:** Understand the next watering run, zone moisture, active exceptions, and who to
  contact when safe mode prevents schedule changes.
- **notice:** Which zone needs attention and whether the system can accept schedule mutations.
- **feel / operational state:** Calm enough to separate unavailable controls from actions that still
  help resolve the situation.
- **alignment check:** The operational state and nearby actions must agree at a glance.

## Outcome

Create a domain-specific, responsive glasshouse operations surface with one clear information spine,
plausible zone data, and visibly distinct `default`, `loading`, `empty`, and `error` states. In
`error`, telemetry is offline and schedule mutation is blocked: `Adjust schedule` must be visibly and
natively disabled, while adjacent `Call grower` must remain visibly and natively enabled. In
`default`, both actions must be enabled.

## Constraints

- One self-contained HTML file with inline CSS and JavaScript; no network requests or external assets.
- Synthetic content only. Status cannot rely on color alone.
- Avoid generic metric-card grids, sidebar navigation, tiny tables, and decorative map facsimiles.
- Use loading status/live semantics and error alert/assertive-live semantics.
- Pass all rendered hard gates at 390x844 and 1280x800.
- Independent grader uses the benchmark contract and exact v1.3.1 release workflow.

## Event log

`outcome_defined | 2026-07-19T00:50:00-07:00 | adjacent-action transfer case`
