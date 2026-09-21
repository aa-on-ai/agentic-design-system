---
name: "agentic-design-system"
description: "Route visual and frontend builds, exploration, and reviews through one scoped design loop. Preserve the intended product, use relevant specialists, and verify the delivered experience."
---

# Agentic Design System

ADS is the single entrypoint for visual and frontend work. Use one loop:

`understand → choose → work → prove → decide`

Tiny copy-only or mechanical edits stay tiny: preserve the chosen direction and check the affected
result, without a new brief, research, variants, grader report, or full capture matrix. Skip ADS for
non-visual work. Helpers contribute to this loop; they do not create another process or budget.

Resolve paths from this skill directory. `<skills-root>` is its parent. The installed release has
no `create-design-workflow.md`. Optional source-maintenance workflows require a source checkout.

## Understand

For substantial work, recover a short internal brief from the request and current product sources:

- **User job and success:** what someone must understand, decide, or do; the intended reading/action order.
- **Exact surface and baseline:** the existing route, component, document, or artifact being changed,
  plus what must stay. Open its current source and rendered baseline when relevant. Extending a
  backend is not permission to replace the chosen frontend.
- **Reference and direction:** what property to borrow, what to exclude, and the desired fidelity.
  A screenshot identifying a defect is evidence, not automatically a new art direction.
- **Output and coverage:** the requested format, meaningful states, target browsers/breakpoints,
  and how the result will reach the user in a usable form.

Use the task's existing brief or notes; the [outcome template](templates/outcome-template.md) is
optional when a fuller handoff helps. Reuse prior answers. Ask only when a material unresolved
choice cannot be recovered and would change the result. An authorized build/fix request permits
scoped reversible local implementation; do not ask for the same write permission again. External
writes, deployment, installation, spending, and destructive actions retain their own authority.

Read relevant `DESIGN.md`, guidelines, tokens, components and accepted/rejected decisions. Preserve
unknown `DESIGN.md` sections; frontmatter tokens govern conflicting prose unless the current user
or primary source corrects them. Resolve a material conflict, not a nearby substitute. Use a
[preset](presets/README.md) only when no established product language answers the need.

For generation or substantial review, read [Foundation v2](contracts/visual-foundation.v2.json):
`utility` is the default for product/operations work; `expressive` requires marketing, editorial,
launch, or explicit brand-expression scope. Do not turn a plain utility surface into creative work.
Confirmed `never` violations block a ready verdict; report-only candidates need actual confirmation.
The contract's numeric rubric is optional diagnostic context, not a taste or release certificate.

## Choose

Route by the user's intent: **Explore** a real unresolved direction, **Build** an authorized change,
or **Review** without implied repair. Use only the owners the task needs:

- [design-review](../design-review/SKILL.md) owns product/task fit, information architecture,
  reference fidelity and visual judgment.
- [ux-baseline-check](../ux-baseline-check/SKILL.md) owns applicable states and reusable component contracts.
- [ui-polish-pass](../ui-polish-pass/SKILL.md) owns craft, geometry, text/data/form mechanics and primitives.
- [Ember](../ember/SKILL.md) reads the evidence for substantial design handoffs by default.
  It is not a builder, independent reviewer, or taste judge.

Load conditional specialists only for their matching need:

- A desired visual target: `../visual-reference-calibration/SKILL.md`. Record borrowed layers,
  exclusions and fidelity, using [reference intake](templates/reference-intake-contract.md) if helpful.
- Options or unresolved direction: `../design-variations/SKILL.md`. Bring a concrete recommendation
  and a reviewable alternative or target when choice is needed; do not invent options after approval.
- Requested personality/delight on eligible marketing/editorial/launch work: `../whimsical-design/SKILL.md`.
- Explicit immersion/atmosphere: `../world-build/SKILL.md`.
- Motion or interaction feel: `../web-animation-design/SKILL.md` and the design-review motion reference.
- Agent-consumable public interfaces: `../agent-friendly-design/SKILL.md`, only for the required
  semantics or machine-readable behavior, not automatic crawlability/API expansion.
- Deep mobile judgment: [mobile review](workflows/mobile-review.md).
- High-judgment work that benefits from an authorized independent critic:
  [adversarial review](workflows/adversarial-design-review.md). Verify the runtime is available;
  a same-agent reread is not independent review.

The [routing reference](routing/ROUTING.md) holds specialist detail, not a second entrypoint.
Use the appropriate native artifact skill for a document, deck or image; the shared brief does not
force those outputs through a web implementation or a web state inventory.

## Work

Build in the intended product and output format. Preserve its useful controls, content, tokens and
interaction model. Apply structure, state coverage and craft as one coherent pass, not three
serial ceremonies. Reuse existing primitives; define a component contract before proliferating
one and verify real consumers when reuse is part of the requested outcome.

Review in this order, fixing an earlier failure before polishing a later one:

1. Right product, surface and user task.
2. Understandable information/action structure, including evidence inspection and return context.
3. Brief/reference fidelity and an intentional visual direction.
4. Craft and component consistency.
5. Behavior, applicable states, target surfaces and usable delivery.

Preserve what already works. A technical implementation summary is not the product's answer to
the user. For Review, report findings without edits unless repair is already authorized.

## Prove

Use evidence that establishes the claim. Source checks are advisory. Inspect meaningful visual
changes in the actual browser against matched baseline/reference captures; exercise interactions
in the target desktop and mobile/WebKit surface when applicable. A screenshot cannot prove motion,
keyboard handling, or returning to the prior context. Missing required access means unverified.

[design-review](../design-review/SKILL.md) owns capture instructions and the distinction between
established gates and report-only measurements. Select task-relevant source checks and states,
not a universal matrix. Required accessibility, state, layout or interaction failures block a ready
verdict even if source scanners pass. Keep diagnostics separate from unmodified primary captures.

For changed permission, readonly, disabled, offline or destructive states, verify every nearby
action agrees in label, emphasis, native enabledness, semantics and helper text. Preserve valid
actions in unaffected states. This adjacent-action sweep is owned by UX baseline and is also
checked in a substantial independent review. Use [structured findings](references/structured-findings.md)
when a review needs exact locations, severity and finding-to-repair traceability.

Optional [decision provenance](workflows/decision-provenance.md) records consequential source-to-
decision links for substantial work. It does not add model calls or make a tiny edit a traced run.

## Decide

For substantial design handoffs, use [Ember](../ember/SKILL.md) to read the evidence already
collected in this loop and present a concise **Ember’s review**: what was checked, what failed
or remains unverified, and what still needs the user's judgment. Follow its
[short handoff](../ember/references/first-use.md#short-result-complete-report); this is the review
part of the result, not a second review or execution loop. Use the heading only after an actual
evidence review. If no review occurred, say so plainly without the Ember label. Tiny copy or
mechanical edits do not get this wrapper unless explicitly requested.

Return the result, evidence, and actual remaining decision. Use one scoped verdict: `ready`,
`needs repair`, or `blocked`; identify whether the artifact is a local candidate, installed,
delivered or released. Ready refers only to the evidenced task/version, not taste approval or
release permission. Deliver a usable attachment or already-authorized accessible review surface;
a machine-local path, screenshot folder or localhost is internal evidence, not remote delivery.

Use one task budget across ADS, Ember and specialists: one implementation/review pass plus at most
one repair unless the user supplies another budget. Recapture affected evidence after repair.
Switching skills, reviewers, aesthetics or runners does not reset the budget. At its boundary,
preserve the candidate and unresolved findings; diagnose the failed assumption and report the
specific blocker or decision. Do not automatically rebuild, pivot, or open another review loop.

Classify feedback before retaining it: explicit preferences belong with the existing preference
owner, project decisions in project context, repeated measurable defects in a primitive/test,
and one-off corrections with the task. Update an owning instruction only when warranted and
within authority. Accepted examples must carry actual human acceptance; a revised screenshot is
not automatically a positive example. Do not append a universal lesson after every build.
