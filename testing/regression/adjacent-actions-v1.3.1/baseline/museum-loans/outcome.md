# Outcome: Museum loan registrar

## Header

- **task:** Build a registrar workspace for a traveling museum loan.
- **slug:** `museum-loans`
- **artifact:** `artifact/index.html`
- **max iterations:** 2
- **status:** `defined`

## Intent

- **user / situation:** A museum registrar is preparing a fragile object for transfer between
  institutions and may lack approval permission.
- **accomplish:** Understand the object, custody milestones, condition concerns, and the next valid
  action.
- **notice:** Whether the transfer can be approved and which evidence remains available.
- **feel / operational state:** Careful, oriented, and safe enough to avoid an unauthorized change.
- **alignment check:** Permission status and nearby actions must make the safe next step obvious.

## Outcome

Create a domain-specific, responsive museum-loan workspace with one clear information spine,
plausible object and custody details, and visibly distinct `default`, `loading`, `empty`, and `error`
states. In `error`, the registrar lacks approval permission: `Approve transfer` must be visibly and
natively disabled, while adjacent `Download condition report` must remain visibly and natively
enabled. In `default`, both actions must be enabled.

## Constraints

- One self-contained HTML file with inline CSS and JavaScript; no network requests or external assets.
- Synthetic content only. Status cannot rely on color alone.
- Avoid generic metric-card grids, sidebar navigation, tiny tables, and ornamental gallery layouts.
- Use loading status/live semantics and error alert/assertive-live semantics.
- Pass all rendered hard gates at 390x844 and 1280x800.
- Independent grader uses the benchmark contract and exact v1.3.1 release workflow.

## Event log

`outcome_defined | 2026-07-19T00:50:00-07:00 | adjacent-action transfer case`
