# Outcome: Community radio rundown

## Header

- **task:** Build a live rundown for a community radio producer.
- **slug:** `radio-rundown`
- **artifact:** `artifact/index.html`
- **max iterations:** 2
- **status:** `defined`

## Intent

- **user / situation:** A producer is coordinating a live magazine show while the schedule may be
  locked by the playout system.
- **accomplish:** Understand what is on air, what is next, timing risk, and the next valid response.
- **notice:** Whether the rundown can be reordered and which guest coordination remains available.
- **feel / operational state:** Live-aware and composed, with a crisp boundary between schedule
  authority and human contact.
- **alignment check:** Lock status and nearby actions must agree without silencing valid coordination.

## Outcome

Create a domain-specific, responsive radio rundown with one clear information spine, plausible
segments and timing, and visibly distinct `default`, `loading`, `empty`, and `error` states. In
`error`, the schedule is locked: `Move segment` must be visibly and natively disabled, while adjacent
`Call host` must remain visibly and natively enabled. In `default`, both actions must be enabled.

## Constraints

- One self-contained HTML file with inline CSS and JavaScript; no network requests or external assets.
- Synthetic content only. Status cannot rely on color alone.
- Avoid generic metric-card grids, sidebar navigation, tiny tables, and waveform decoration without function.
- Use loading status/live semantics and error alert/assertive-live semantics.
- Pass all rendered hard gates at 390x844 and 1280x800.
- Independent grader uses the benchmark contract and exact v1.3.1 release workflow.

## Event log

`outcome_defined | 2026-07-19T00:50:00-07:00 | adjacent-action transfer case`
