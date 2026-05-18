# ADS Rubric And Loop

This reference holds the longer material that should not live in the router skill.

## Design Rubric

Grade visual work before presenting it.

| Criteria | Weight | What it means | Failing looks like |
| --- | ---: | --- | --- |
| Design Quality | 35% | The piece feels like a coherent whole. Color, type, layout, spacing, and mood agree. | Disconnected components, no visual theme, collection-of-parts energy. |
| Originality | 30% | The work shows custom decisions instead of template defaults. | Purple gradients, default cards, unmodified shadcn, stock hero sections. |
| Craft | 20% | Typography, spacing, color harmony, contrast, and interaction details are competent. | Broken fundamentals, inconsistent spacing, missing hover/focus, bad contrast. |
| Functionality | 15% | Users can understand and complete the task. | Unclear calls to action, hidden navigation, confusing state transitions. |

Scoring guide:

- 8-10: ship it; would impress a human designer.
- 6-7: functional but needs another pass.
- 4-5: generic AI output; pivot the concept, do not only polish.
- 1-3: broken fundamentals; rebuild.

Design Quality and Originality carry the highest weight because models usually
do fine on basic craft and functionality. If either is below 6, revise before
presenting.

## Loop Events

Use these event names in run reports when an outcome was defined:

- outcome_defined
- builder_started
- artifact_created
- grader_started
- needs_revision
- revision_started
- satisfied
- escalate
- human_approved

## Grader States

The grader returns only:

- satisfied
- needs_revision
- escalate

When the revision limit is reached, return escalate. Do not keep patching.

## Iteration Rules

- Structured feedback beats one-pass polish.
- If scores improve, refine.
- If scores plateau, pivot the aesthetic or interaction model.
- The two-round reset rule applies to bug fixes and non-converging fixes.
- Taste-sensitive decisions should escalate to the human instead of pretending the rubric can decide them.

## Verification

Before reporting, include the smallest useful receipt:

- screenshot or visual inspection result
- files changed
- verification command output
- live/deploy URL when relevant
- known gaps or uncertainty
