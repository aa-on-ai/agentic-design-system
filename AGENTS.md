# Agentic Design System agent instructions

## Start here

For visual or frontend work, read [`skills/agentic-design-system/SKILL.md`](skills/agentic-design-system/SKILL.md).
It is the only execution entrypoint. Follow its scoped loop:

`understand → choose → work → prove → decide`

For a substantial design build or review handoff, the orchestrator uses
[`skills/ember/SKILL.md`](skills/ember/SKILL.md) by default to read the evidence already collected
and present Ember's review. Ember does not create a second execution loop, independent reviewer,
or new permission to edit.

Do not start with `routing/ROUTING.md`. The orchestrator links it only for maintainer work or a
matching specialist route.

## Repository boundary

- Read `contracts/visual-foundation.v2.json` through the orchestrator and select the applicable
  profile before substantial generation or review.
- Load project context from `DESIGN.md`, project files, and named references. Preserve the existing
  product and chosen direction unless the task authorizes a change.
- Review-only requests stay read-only. An authorized local build or fix does not need duplicate
  permission, but external writes, deployment, installation, spending, and destructive actions
  retain their own authority.
- Workbench implementation is separate from the default installed skill workflow.

## Verification

Source checks are advisory. Rendered evidence supports the verdict:

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <your-file.tsx>
python3 skills/design-review/scripts/state-check.py <your-file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <your-file.tsx>
node skills/design-review/scripts/capture.mjs "<running-route-url>" \
  --states default,loading,empty,error --out evidence/<slug>
```

Choose task-relevant states and breakpoints. Block a ready verdict on confirmed Foundation v2
never rules or failed required accessibility, layout, semantic, interaction, or modal evidence.

## Specialist suite

The orchestrator loads specialist guidance only when the task needs it: reference-led work,
unresolved alternatives, personality, immersion, motion, agent-consumable interfaces, deep mobile
review, or an authorized independent critique. Keep those paths behind their triggers.
