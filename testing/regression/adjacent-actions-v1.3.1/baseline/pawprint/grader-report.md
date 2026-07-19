# Pawprint ADS v1.3.1 regression grader report

## Header

- **Outcome:** `ads-v1.3.1-pawprint-regression-2026-07-19/outcome.md`
- **Artifact:** candidate eight-screenshot set, rendered `evidence.json`, comparison receipt, and supplied Playwright interaction receipt
- **Grader:** independent evidence-only ADS v1.3.1 grader
- **Timestamp:** 2026-07-19T07:26:21Z
- **Verdict:** `satisfied`

## Verdict

The candidate satisfies the Pawprint outcome and closes the prior adjacent-action contradiction.
In the error state at both breakpoints, New walk is now visibly and natively disabled while Retry
remains available; the read-only status, connection-loss instructions, recovery controls, and
snapshot content agree. Unaffected states preserve enabled booking actions, all rendered hard
gates pass, and no minor or material rendered finding remains.

## Rubric scores

- **Design Quality, 35%:** 9.2/10, pass. The next action, schedule, coverage, and risk information
  maintain a calm, legible operational spine across breakpoints.
- **Originality, 30%:** 9.3/10, pass. The paw identity, warm dispatch palette, type pairing,
  plausible routes, walkers, dogs, handoffs, and risks remain strongly premise-specific.
- **Craft, 20%:** 9.1/10, pass. Responsive restructuring is controlled, state treatments are
  polished, dimensions remain stable, and all rendered technical gates pass.
- **Functionality, 15%:** 9.2/10, pass. Primary and recovery actions are clear, enabledness matches
  state instructions, and the supplied interaction receipt verifies the key booking and error-state
  controls.
- **Weighted score:** 9.21/10.
- **Intent alignment:** pass.
- **Required states covered:** pass.
- **Accessibility:** pass.
- **Evidence attached:** pass.

## Prior finding closure

### `pawprint-i2-001` — closed

At `error @ 1280x800`, the former filled green `+ New walk` action is now a muted disabled control
labeled `New walk unavailable`, immediately beside `Read-only schedule`. At `error @ 390x844`, the
header plus is visibly dimmed and the supplied Playwright receipt confirms native disabled
semantics. Retry remains enabled at both breakpoints. The comparison receipt shows changes confined
to the two error captures, with matching dimensions, while default, loading, and empty remain
unchanged.

## Structured findings

None. Released-schema value:

```json
[]
```

## Adjacent-action consistency sweep

- **Default, 390x844 and 1280x800:** pass. The enabled New walk control, refresh control, and Call
  Jamal action agree with live/synced schedule and due-action copy. The active desktop-visible New
  walk produces booking feedback.
- **Loading, 390x844 and 1280x800:** pass. Updating routes and locations does not declare the board
  read-only or forbid bookings; New walk remains enabled consistently.
- **Empty, 390x844 and 1280x800:** pass. Header New walk and inline Add the first walk agree with the
  board-clear and accepting-bookings instructions; the empty-state action remains enabled.
- **Error, 390x844 and 1280x800:** pass. New walk is visibly and natively disabled, Retry remains
  enabled, and recovery actions agree with the connection-loss instructions. The snapshot's next
  walk, coverage, and action fields render as information rather than enabled write controls.

No enabled-looking contradiction remains in any state or breakpoint.

## Hard stops reviewed

- Eight of eight candidate screenshots were inspected at original resolution.
- All four states render at both breakpoints.
- Axe was available with zero serious or critical violations.
- No horizontal overflow, landmark failure, live-region failure, sub-44px target, or CLS failure is
  reported.
- All eight comparison pairs have matching dimensions; six are identical, and only the intended
  error-state pairs changed.
- No blocker or major finding prevents `satisfied`.

## Failing rows

```json
[]
```

## Next revision prompt

Empty. No revision is required.

## Caveats

This was an evidence-only grade. Artifact source, build output, and source-oriented checks were not
inspected. Behaviors outside the supplied Playwright interaction receipt are not independently
asserted.

## Event

```text
grader_finished | 2026-07-19T07:26:21Z | verdict=satisfied | note=pawprint-i2-001 closed; adjacent-action sweep clear across all states and breakpoints
```
