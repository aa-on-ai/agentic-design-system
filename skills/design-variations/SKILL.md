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

Missing production data does not rule out exploration. Use realistic local fixtures when they can represent the decision honestly. If missing data or behavior would materially change the choice and cannot be represented, name that dependency and pause the affected choice; continue only work it cannot change.

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
   - Prefer a comparison gallery in one source revision; use named branches or saved revisions when alternatives cannot coexist. Record each thesis, artifact path, revision (or explicitly uncommitted state), run/open instructions and matched evidence. Do not call unsaved work recoverable.
   - Use [the standalone HTML asset](assets/variations.html) when no product stack exists yet or a disposable concept study genuinely answers the question. State when promotion will require a real-stack implementation.
   - Provide an accessible way to select and compare complete directions; for separate revisions, provide equivalent open/switch instructions and matched evidence. A shared visual canvas can supplement runnable versions, not replace them or become a required vendor dependency.
   - Make each direction coherent enough to judge in context.
   - Keep experimental routes and token overrides isolated from shipping surfaces. Do not add production dependencies or a permanent feature-flag system solely for exploration.
   - When repeated fine adjustments would be easier by hand, expose a few task-relevant development-only controls, such as density, radius or motion timing. Keep controls accessible and expose exact current values in a copyable readout or URL state. At selection, record the final values for each retained direction and apply the chosen values to component source or narrowly scoped tokens. Changing shared design-system tokens needs explicit scope; browser state alone is not source persistence.

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
   - Apply the normal ADS evidence gates. Reuse evidence for unchanged components; verify changed integration, data and shipping-path behavior rather than repeating every playground check.
   - Exclude tuning controls and unselected alternatives from the shipping build. Preserve the alternatives in the playground or recoverable revisions, with the instructions and evidence needed to run them again. Check the selected production path separately from the playground.
   - Do not delete existing user artifacts. Playground construction and promotion share the existing task pass and repair budget. Retention guarantees reopening the recorded revision, not ongoing maintenance against future dependencies; remove disposable scaffolding only when the chosen retention plan and user-artifact boundaries permit it.

## Verification contract

Before presenting variants, verify:

- every direction has a unique thesis name
- all directions use the same realistic content and application state
- at least one structural or interaction axis differs between each direction
- comparison controls are accessible and expose the selected direction, or separate revisions have clear switch/open instructions
- every direction renders at the required sizes and target runtime
- screenshots or equivalent rendered evidence exist for each direction
- the recommendation cites user fit and tradeoffs, not visual novelty alone
- the recorded source and run instructions can reopen each alternative

After promotion, verify:

- chosen values persist in source and the shipping path excludes experimental controls and alternatives
- the selection record includes final tuned values and runnable paths/revisions for retained alternatives
- changed integration and behavior pass the applicable ADS gates

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
