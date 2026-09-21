# Routing — maintainer and escalation reference

This document is a maintainer and escalation reference. It is not a public entrypoint and does not
run before ordinary visual work. The default contract lives in the orchestrator's `SKILL.md`:

`understand → choose → work → prove → decide`

Installed agents receive this file beside the orchestrator so its automatic escalation branches can
load deeper guidance without requiring a repository clone.

## Default invariants

Every route, including specialist routes, preserves these invariants:

- use the ADS Foundation profile for generation or substantial review; tiny changes preserve the existing direction;
- utility remains the default for product and operations work; expressive requires an eligible
  surface or explicit brief;
- confirmed Foundation v2 `policy: "never"` violations block completion;
- load cited, editable project context from `DESIGN.md`, local product sources, and named references;
- continue already-authorized reversible local implementation without duplicate approval; retain separate authority for external/destructive actions;
- route intent as Explore, Build, or Review;
- prove the task-relevant rendered states and breakpoints;
- block on failed required accessibility, layout, semantic, interaction, or modal evidence;
- return one qualitative verdict, with one default repair pass and the adjacent-action consistency
  sweep before recapture.

Do not add a requirement here merely because one specialist needs it. Put branch-specific depth in
the owning skill or runbook and keep the trigger in the orchestrator.

## Automatic escalation map

| Trigger observed by the orchestrator | Load | Specialist purpose |
|---|---|---|
| A visual reference is a desired target | `<skills-root>/visual-reference-calibration/SKILL.md` | Lock borrowed layers, exclusions, and fidelity before work |
| The user asks for options, variants, concepts, or help choosing | `<skills-root>/design-variations/SKILL.md` | Diverge in a disposable artifact; promote only the chosen direction |
| Requested personality/delight on eligible marketing/editorial/launch work; explicit atmosphere/immersion | the matching whimsical or world-building skill | Support the brief, not universal novelty or compulsory creative work |
| Animation, transition, gesture, or interaction feel | `<skills-root>/web-animation-design/SKILL.md` plus the motion reference | Prove motion purpose, interruptibility, and reduced-motion behavior |
| Mobile/app/PWA work needs judgment beyond ordinary breakpoint proof | `workflows/mobile-review.md` | Separate design judgment from objective platform defects |
| Agent-consumable interface behavior is required | `<skills-root>/agent-friendly-design/SKILL.md` | Scope semantics/machine-readable behavior to the product need |
| High-judgment work warrants independent critique, and delegation is authorized and available | `workflows/adversarial-design-review.md` | Separate-context challenge, not another default loop |
| Required evidence still fails after the repair pass | the specialist owning the failed evidence class | Diagnose rather than loop blindly |
| Design judgment remains unresolved after the repair pass | report the preserved artifact and material decision; independent review only if authorized and within remaining budget | Diagnose without resetting the budget |

Specialist workflows may use the outcome, grader, structured-finding, provenance, and run-report
assets already shipped with the package when their own risk contract calls for them. Their existence
does not make them default requirements.

## Reference-led work

Treat a screenshot as a reference only when it is a desired target. A screenshot used to identify a
bug or region is review evidence. Before reference-led work, record:

- the source;
- the primary and secondary layers to borrow;
- what not to borrow;
- close mimic, same spirit, or loose cue;
- product constraints and success/failure cues.

Recover prior answers and source context first. If the borrowed layer or fidelity target would
materially change implementation and still remains unclear, resolve that choice before dependent work. After implementation, compare the rendered result with the reference contract.

## Divergent exploration

Use exploration for real structural or interaction choices, not minor styling values:

1. Define the decision and invariant content.
2. Build distinct directions in one disposable browser artifact.
3. Render each at matched desktop and mobile viewports.
4. Recommend one direction with tradeoffs.
5. Promote only the chosen direction, then return to the default Build path.

## Expressive and motion work

Expressive work keeps the expressive Foundation profile eligibility gate. Creative skills add a
brief-supported point of view; they do not license decorative novelty on utility surfaces.

Motion must serve state, hierarchy, causality, or feedback. Capture the relevant interaction,
confirm interruption and exit behavior, and include a reduced-motion fallback. Motion serving none
of those jobs is removed.

## Deep mobile review

Keep two report sections:

1. **Design judgment** — thumb reach, focus, navigation pattern, density, gesture discoverability,
   and explicit decision forks with tradeoffs and evidence.
2. **Platform verification** — viewport, safe area, target size, hover-only behavior, layout,
   performance, and PWA defects, severity-tiered with exact artifacts.

A preference must not read as a defect, and a severe platform defect must not be softened into taste.

## Substantial or high-risk public work

Basic accessible semantics remain product requirements. Add agent-friendly-design only for
required agent-consumable behavior; do not infer permission for new APIs or crawlability. Use
adversarial review when the cost of a missed defect warrants a separate context and delegation
is authorized and available. That review may use the bundled outcome, grader, structured-findings, and report
templates, but the default qualitative verdict remains the handoff boundary.

## Failed evidence or unresolved judgment

Within the remaining authorized task budget, diagnose against the owning evidence class:

- accessibility, layout, semantic, interaction, or modal failure routes to the owner of that evidence
  class;
- reference drift routes back to visual-reference-calibration;
- motion uncertainty routes to web-animation-design;
- mobile judgment routes to mobile-review;
- cross-cutting or high-risk uncertainty routes to adversarial-design-review.

Any specialist repair uses the existing budget. At its boundary preserve the artifact and report
the unresolved finding or decision; switching owners does not grant another pass. If a repair is
authorized, recapture the affected matrix without dropping required evidence to hide a failure.

## Review comparison

Meaningful modifications need matched baseline and candidate captures:

```bash
node <orchestrator-skill>/scripts/run-capture.mjs "<baseline-url>" --states ... --out evidence/<slug>-baseline
node <orchestrator-skill>/scripts/run-capture.mjs "<candidate-url>" --states ... --out evidence/<slug>-candidate
```

Compare the captured views and interaction receipts directly. This installed snapshot does not
ship `design-review/scripts/compare.mjs`; do not invent that command. The qualitative review judges
whether the delta matches the requested intent. Skip comparison for pure copy changes, a single specified value, or a first build with no
baseline.

## Maintainer checks

- Reconcile source and bundled routing during release preparation; do not edit an unrelated live
  copy while preparing an isolated candidate.
- Keep default behavior in the orchestrator. Source-repo contract/install/package tests require
  that checkout and its actual package scripts; verify availability before naming a command.
- Do not recreate `create-design-workflow.md` or advertise another public entrypoint.
- Keep specialist assets installed and path-portable.
- Before release, run the relevant source contract, install/package and behavior checks. Local
  instruction validation alone does not prove runtime loading, behavior, taste or release.
