# Structured diagnostic findings

## Purpose

Use structured observations beneath the ADS outcome-based qualitative verdict; numeric scores are optional diagnostics. This borrows the useful part of Contra Labs' landing-page study methodology: reviewers marked exact failure locations, assigned a fixed category, and rated severity. ADS operationalizes that pattern inside its rendered-evidence and revision loop.

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

`region` is optional and normalized from 0 to 1. All other fields are required when using this structured format for substantial review. `rubricRow` can identify a task-specific criterion such as product fit, IA or reference fidelity; it does not require numeric scoring.

## Coverage ledger

Every substantial review also accounts for all eight diagnostic categories. Return one row per
category with `status` set to `clear`, `finding`, or `not_reviewed`, plus non-empty evidence.

- `clear` means the category was reviewed and no finding remains.
- `finding` means one or more structured findings use that category.
- `not_reviewed` means the supplied screenshot, motion recording, source, or runtime evidence could
  not support a judgment. State what evidence was missing.

Do not require a minimum finding count. Coverage accounting exposes blind spots without rewarding
reviewers for manufacturing criticism.

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

## Verdict and retention

Findings explain the outcome-based verdict, not a weighted-score threshold. Product/task fit and
IA can block success before visual craft is judged. An observation without supporting evidence
remains unverified; a confirmed blocker cannot return `satisfied`. Preserve what works, any
unreviewed coverage and the finding → revision → evidence trace within the shared ADS budget.

Repeated findings become candidates for the existing preference, project, primitive/test or skill
owner only after an explicit preference or verified recurrence warrants the update. This reference
does not authorize self-modifying skills, new model gates or a release from source checks alone.
