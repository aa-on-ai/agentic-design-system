# Outcome: Kitchen service pass

## Header

- **task:** Build a live service pass for a small tasting-menu kitchen.
- **slug:** `kitchen-pass`
- **artifact:** `artifact/index.html`
- **max iterations:** 2
- **status:** `defined`

## Intent

- **user / situation:** An expediter is sequencing tables and courses while the order feed may go
  offline.
- **accomplish:** See which table is pacing next, active holds, station readiness, and the next valid
  service action.
- **notice:** Whether a course can be fired and which human coordination remains available.
- **feel / operational state:** Fast but composed, with no ambiguity about system authority.
- **alignment check:** Feed status and nearby actions must prevent a false mutation while preserving
  coordination.

## Outcome

Create a domain-specific, responsive kitchen pass with one clear information spine, plausible tables
and course timing, and visibly distinct `default`, `loading`, `empty`, and `error` states. In `error`,
the order feed is offline: `Fire next course` must be visibly and natively disabled, while adjacent
`Call station` must remain visibly and natively enabled. In `default`, both actions must be enabled.

## Constraints

- One self-contained HTML file with inline CSS and JavaScript; no network requests or external assets.
- Synthetic content only. Status cannot rely on color alone.
- Avoid generic metric-card grids, sidebar navigation, tiny tables, and neon restaurant-dashboard tropes.
- Use loading status/live semantics and error alert/assertive-live semantics.
- Pass all rendered hard gates at 390x844 and 1280x800.
- Independent grader uses the benchmark contract and exact v1.3.1 release workflow.

## Event log

`outcome_defined | 2026-07-19T00:50:00-07:00 | adjacent-action transfer case`
