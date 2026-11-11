---
name: "design-variations"
description: "Explore meaningful alternatives when a UI direction or interaction choice is unresolved or options are requested. Skip settled directions and small fixes."
---

# Design Variations

Explore meaningful alternatives in a runnable playground, using the project's real components and tokens when available. Keep alternatives recoverable as the human compares, tunes, chooses or blends them. Promote the selected implementation through the normal Agentic Design System build and review chain.

## Trigger gate

Use this skill when the request asks for options, variations, concepts, mockups, alternative directions, or help deciding what a new page, component, feature, or interaction should become.

Skip it when:

- the direction is already chosen
- the task is a bug fix, copy edit, or mechanical polish
- the difference is only a single token or style value
- the user asked to implement one specified reference closely

If a desired visual reference matters, use [visual-reference-calibration](../visual-reference-calibration/SKILL.md) to recover what to borrow. Reuse prior answers; do not add a second intake interview.

Missing production data does not rule out exploration. Use realistic local fixtures when they can represent the decision honestly. If missing data or behavior would materially change the choice and cannot be represented, name that dependency rather than inventing a working flow.

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

4. Build a project-native playground.
   - Reuse the actual stack, components and design-system context. Prefer an existing development route, component explorer or native preview; otherwise use a small isolated playground. Do not create another application or canvas framework just to compare variants.
   - Keep distinct implementations reachable through a comparison gallery, named branches or equivalent saved revisions. Record each thesis, source revision, run/open instructions and matched evidence with the task so an earlier alternative can be revisited.
   - Use [the standalone HTML asset](assets/variations.html) when no product stack exists yet or a disposable concept study genuinely answers the question. State when promotion will require a real-stack implementation.
   - Provide an accessible way to select and compare complete directions. A shared visual canvas can supplement runnable versions, not replace them or become a required vendor dependency.
   - Make each direction coherent enough to judge in context.
   - Keep experiments isolated from shipping routes. Do not add production dependencies or a permanent feature-flag system solely for exploration.
   - When repeated fine adjustments would be easier by hand, expose a few task-relevant development-only controls, such as density, radius or motion timing. Keep the controls accessible and persist chosen values into the real components or tokens; do not leave them only in transient UI state.

5. Review on the target platform.
   - Render the alternatives at the relevant sizes and states, in the browser or native runtime as appropriate.
   - Capture each direction with the same state and viewport.
   - Exercise relevant interactions, not just stills. Check applicable overflow, keyboard navigation, labels, focus, contrast and platform behavior.
   - For native/mobile work whose touch feel or performance matters, include physical-device verification, using a representative older device when relevant. Simulator or browser evidence alone does not prove that behavior; record unavailable device checks as unverified.
   - Compare the user job, information order, visual direction and behavior using the existing ADS review. Do not substitute a composite self-score for a useful choice.
   - Judge conceptual distinctness from the theses and interaction model. Pixel difference alone is not evidence of meaningful divergence.

6. Present the decision.
   - Lead with one recommended direction and why.
   - Summarize the meaningful tradeoff of every direction.
   - If human direction is still needed, present the concrete choice once. Honor prior direction and any instruction to select and proceed autonomously.
   - Do not invent an extra approval gate for already-authorized implementation.

7. Promote only the winner.
   - Promote the selected real components and persisted values without an obligatory rewrite. Implement in the product stack only when the study used a different stack or real integration is still missing.
   - Run the normal ADS core chain and rendered evidence gates.
   - Exclude tuning controls and unselected alternatives from the shipping build. Preserve the alternatives in the playground or recoverable revisions, with the instructions and evidence needed to run them again. Check the selected production path separately from the playground.
   - Do not delete existing user artifacts. Keep the existing task budget; tuning and switching variants do not create an unlimited agent iteration loop.

## Verification contract

Before presenting variants, verify:

- every direction has a unique thesis name
- all directions use the same realistic content and application state
- at least one structural or interaction axis differs between each direction
- the comparison controls are accessible and expose the selected direction
- every direction renders at the required viewports
- screenshots or equivalent rendered evidence exist for each direction
- the recommendation cites user fit and tradeoffs, not visual novelty alone
- the recorded source and run instructions can reopen each alternative
- after promotion, chosen values persist and the shipping path excludes experimental controls and alternatives

## Output

Return:

- Decision needed
- Recommended direction
- Variant theses and tradeoffs
- Invariants shared across variants
- Rendered evidence
- Risks or unresolved questions
- Artifact path
- How to reopen each alternative, and what was promoted versus kept experimental
