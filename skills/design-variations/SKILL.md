---
name: "design-variations"
description: "Explore meaningful alternatives when a UI direction or interaction choice is unresolved or options are requested. Skip settled directions and small fixes."
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

If a desired visual reference matters, use [visual-reference-calibration](../visual-reference-calibration/SKILL.md) to recover what to borrow. Reuse prior answers; do not add a second intake interview.

## Workflow

1. Frame the decision.
   - State the user, task, constraints, existing surface, and decision the variants must help resolve.
   - Inspect the project baseline, components, tokens, and real domain language.
   - Identify the invariant content and state every variant will share.

2. Choose the variant count.
   - Use the fewest alternatives that resolve the actual choice, often two.
   - Explore more only when there are genuinely distinct theses, not to satisfy a quota.
   - Honor an explicit user-specified count.

3. Name distinct theses.
   - Name each direction by its idea, never "Version 1" or "Option B."
   - Vary meaningful axes such as structure, hierarchy, density, interaction model, metaphor, or information flow.
   - Keep content, data, state, viewport, and core user goal identical.
   - A recolor, font swap, or spacing adjustment is not a distinct direction.

4. Build one disposable browser artifact.
   - Use `assets/variations.html` for a standalone comparison when appropriate.
   - For an implemented app comparison, use [browser-variant-workflow](../browser-variant-workflow/SKILL.md) as the technique beneath this decision, not another variant/review loop.
   - Keep it self-contained unless the task requires project assets.
   - Show one complete direction at a time through an accessible switcher.
   - Make each direction coherent enough to judge in context.
   - Do not add production dependencies, feature flags, or long-lived variant architecture.

5. Review in the browser.
   - Render the artifact at the relevant desktop and mobile widths.
   - Capture each direction with the same state and viewport.
   - Check overflow, keyboard navigation, labels, focus, and basic contrast.
   - Compare the user job, information order, visual direction and behavior using the existing ADS review. Do not substitute a composite self-score for a useful choice.
   - Judge conceptual distinctness from the theses and interaction model. Pixel difference alone is not evidence of meaningful divergence.

6. Present the decision.
   - Lead with one recommended direction and why.
   - Summarize the meaningful tradeoff of every direction.
   - If human direction is still needed, present the concrete choice once. Honor prior direction and any instruction to select and proceed autonomously.
   - Do not invent an extra approval gate for already-authorized implementation.

7. Promote only the winner.
   - Rebuild the selected direction in the real stack.
   - Run the normal ADS core chain and rendered evidence gates.
   - Remove your temporary implementation scaffolding after promotion. Preserve useful comparison evidence with the task; do not delete existing user artifacts.

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
- Artifact path
