# Structured diagnostic findings

## Purpose

Add a diagnostic layer beneath the existing ADS verdict rubric. This borrows the useful part of Contra Labs' landing-page study methodology: reviewers marked exact failure locations, assigned a fixed category, and rated severity. ADS operationalizes that pattern inside its rendered-evidence and revision loop.

Source: https://x.com/contralabs_ai/status/2078202668711895356

## Finding schema

```json
{
  "id": "finding-001",
  "category": "layout_spacing_hierarchy",
  "severity": "major",
  "rubricRow": "Design Quality",
  "state": "default",
  "breakpoint": "390x844",
  "artifact": "evidence/iter1/default-390x844.png",
  "target": "primary CTA row",
  "region": { "x": 0.08, "y": 0.71, "width": 0.84, "height": 0.12 },
  "observation": "The secondary action wraps below the primary action and reads as a separate section.",
  "evidence": "Rendered screenshot at the mobile breakpoint."
}
```

`region` is optional and normalized from 0 to 1. All other fields are required for substantial screenshot review.

## Adjacent-action consistency check

A repair is not complete when the named target alone looks fixed. Before the builder hands back a
revision and before the grader can return `satisfied`:

1. State the changed state's contract and permitted actions.
2. Inspect every visible nearby primary, secondary, toolbar, and inline action at every changed breakpoint.
3. Confirm each action's label, emphasis, enabledness, native semantics, and supporting copy agree
   with the state and its instructions.
4. For read-only, disabled, offline, permission-limited, or destructive states, remove, disable,
   relabel, or visibly explain conflicting actions; use native `disabled` semantics when the
   control remains visible.
5. Preserve active actions in unaffected states and verify them from fresh rendered evidence.

An enabled-looking contradiction is a `cues_affordances` major finding. It prevents `satisfied`,
and the next revision prompt must name the conflicting state, action, and expected repair.

## Implementation slice after Phase 7

1. Extend the grader schema in `workflows/new-page-component.mjs` with `findings[]`; keep `failingRows` temporarily as a derived compatibility field.
2. Add the structured-finding section to the canonical grader and run-report templates plus bundled copies.
3. Update adversarial review so every material critique maps to a category, severity, rubric row, state, breakpoint, and evidence artifact.
4. Aggregate counts by category and severity per iteration and preserve finding-to-revision traceability.
5. Add fixtures and smoke tests for schema completeness, blocker verdict behavior, missing evidence, and compatibility output.
6. Add the Contra study to `docs/influences.md`, including its five-brief, one-output-per-model-per-brief, and split-session limitations.
7. Do not add model-specific gates or routing rules from this study.

## Stop condition

The release gate passes, a planted blocker cannot return `satisfied`, unsupported findings fail validation, and the run report shows a complete finding → revision → evidence trail.
