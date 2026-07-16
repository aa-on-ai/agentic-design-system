---
name: "design-variations"
description: "Explore 3-5 distinct UI directions in one browser artifact before implementation; use when direction is undecided."
---

# Design Variations

Use the browser as a disposable decision surface. Diverge before production implementation, let the human choose or blend a direction, then send only the winner through the normal Agentic Design System build and review chain.

## Trigger gate

Use this skill when the request asks for options, variations, concepts, mockups, alternative directions, or help deciding what a new page, component, feature, or interaction should become.

Skip it when:

- the direction is already chosen
- the task is a bug fix, copy edit, or mechanical polish
- the task needs real data wiring before its shape can be judged
- the difference is only a single token or style value
- the user asked to implement one specified reference closely

If a visual reference matters, complete the reference-intake contract before creating variants.

## Workflow

1. Frame the decision.
   - State the user, task, constraints, existing surface, and decision the variants must help resolve.
   - Inspect the project baseline, components, tokens, and real domain language.
   - Identify the invariant content and state every variant will share.

2. Choose the variant count.
   - Default to four.
   - Use three for a narrow decision.
   - Use five only when the space is genuinely broad.
   - Honor an explicit user-specified count.

3. Name distinct theses.
   - Name each direction by its idea, never "Version 1" or "Option B."
   - Vary meaningful axes such as structure, hierarchy, density, interaction model, metaphor, or information flow.
   - Keep content, data, state, viewport, and core user goal identical.
   - A recolor, font swap, or spacing adjustment is not a distinct direction.

4. Build one disposable browser artifact.
   - Start from `assets/variations.html`.
   - Keep it self-contained unless the task requires project assets.
   - Show one complete direction at a time through an accessible switcher.
   - Make each direction coherent enough to judge in context.
   - Do not add production dependencies, feature flags, or long-lived variant architecture.

5. Review in the browser.
   - Render the artifact at the relevant desktop and mobile widths.
   - Capture each direction with the same state and viewport.
   - Check overflow, keyboard navigation, labels, focus, and basic contrast.
   - Score each direction with the Agentic Design System rubric.
   - Judge conceptual distinctness from the theses and interaction model. Pixel difference alone is not evidence of meaningful divergence.

6. Present the decision.
   - Lead with one recommended direction and why.
   - Summarize the meaningful tradeoff of every direction.
   - Ask the human to choose one, blend named elements, or reject the set.
   - Do not implement production code before a direction is chosen unless explicitly requested.

7. Promote only the winner.
   - Rebuild the selected direction in the real stack.
   - Run the normal ADS core chain and rendered evidence gates.
   - Remove the disposable artifact and unused variants unless the user wants a review artifact preserved.

## Verification contract

Before presenting variants, verify:

- every direction has a unique thesis name
- all directions use the same realistic content and application state
- at least one structural or interaction axis differs between each direction
- the switcher is keyboard accessible and exposes the selected state
- every direction renders at the required viewports
- screenshots or equivalent rendered evidence exist for each direction
- the recommendation cites user fit and tradeoffs, not visual novelty alone

## Output

Return:

- Decision needed
- Recommended direction
- Variant theses and tradeoffs
- Invariants shared across variants
- Rendered evidence
- Risks or unresolved questions
- Exact reply options
- Artifact path
