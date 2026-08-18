# presets

presets are the first docs-first version of the control plane.

the point is not to expose every internal skill. the point is to help a human pick the right setup for the kind of UI they are building.

presets are also the first bridge into explainability. they should not just select behavior — they should shape how that behavior gets reported back to the user.

each preset answers:
- what it is for
- what it activates
- what it intentionally skips
- what quality bar it enforces
- what inputs help it perform well
- what still requires human judgment
- what the run report should emphasize when this preset is active

## current starter presets

- [utilitarian-app](./utilitarian-app.md) / [json](./utilitarian-app.json)
- [dense-dashboard](./dense-dashboard.md) / [json](./dense-dashboard.json)
- [marketing-editorial](./marketing-editorial.md) / [json](./marketing-editorial.json)

## portable format

portable preset files validate against [`schemas/preset.schema.json`](../schemas/preset.schema.json).

the markdown files are for humans.
the json files are for export, fork, install, and future UI/CLI layers.

## selection guide

pick **utilitarian-app** when:
- you're building product UI
- clarity matters more than brand theater
- the interface should feel calm, direct, and competent

pick **dense-dashboard** when:
- the product is data-heavy
- comparison and scanning matter
- responsive collapse decisions are hard and need deliberate structure

pick **marketing-editorial** when:
- the page needs mood, narrative, or point of view
- you want stronger visual identity
- the work benefits from creative direction, not just cleanup

## the rule

presets should make the system easier to choose, not more magical.

they are opinionated starting points, not fake personalities.
