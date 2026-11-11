# ADS audit improvements: implementation and evidence

## Assignment
Evolve the existing ADS design loop in priority order: retained real-component playgrounds,
truthful judge receipts, capability-aware MCP routing, useful judge context, and a small
current-model comparison. Keep small fixes lightweight, human direction authoritative, the
three-tool MCP, and paid reviews opt-in. No platform rebuild or model-uplift assumption.

## Implemented
1. Variations retain runnable alternatives, support development-only direct tuning, persist chosen
   values, and promote real components without shipping experimental controls. Installed links
   are checked, including the previously missing helper.
2. Judge receipts separate configured identity, adapter attempts and reported usage. Unknown calls
   remain unknown; explicit reported zero remains zero; semantic rejection preserves valid usage.
3. Skills prefer available, suitable MCP tools with readable evidence and otherwise use the existing
   CLI wrapper. No duplicate capture, erased failures, automatic paid judge or forced tool setup.
4. Judges receive role-labelled baseline/reference images and optional unchanged recorded source
   text. Source text is root-confined, hash-checked, bounded UTF-8 and untrusted. Findings target
   candidates only. Context receipts record disclosure to the adapter, not provider delivery.

## Verification
- Verified Fable 5.2 source reviews for each implementation slice; consequential findings repaired.
  Final minor context repairs were parent-verified, not sent for a third paid review.
- Combined MCP suite: 33 passing tests, including real Chromium capture, command usage receipts,
  context roles and invalid/changed/unrecorded/escaped sources.
- Playground candidate: five fresh builds, independent Fable grades, 40 captures, 20 adjacent-action
  checks. See `testing/regression/adjacent-actions-v1.3.1/runs/2026-11-11-playground-guidance`.
- Routing replay: current CLI wrapper, five unchanged artifacts, 40 fresh captures with exact PNG
  byte equality to graded originals, 20 fresh action checks. Independent grades are explicitly
  reused only after equality checks. This is not fresh generation or independent routing judgment.
  See `testing/regression/adjacent-actions-v1.3.1/runs/2026-11-11-capture-routing-replay`.
- Installed-skill checks and orchestrator contract pass. Passing gates are not human taste acceptance.

## Small same-model context comparison
Two independent Fable 5.2 calls reviewed the same phone-order candidate, full task/rubric and
comparison metrics. Control had candidate only. Enriched input added the actual baseline image
and a source copy of the same brief. Removing those additions yielded the exact control request.

Control correctly withheld visual claims about its unseen baseline. Enriched review accurately
identified the baseline's separated alert/lane versus the candidate's combined priority card,
confirmed unchanged order data, and noted the small height tradeoff. Parent inspected both images.
Both reviews flagged ambiguous time semantics and unshown multiple-exception states. No measured
comprehension, speed, human preference or quality uplift is established. This synthetic retained-
component study does not replace adoption on an active project.

## Limits and remaining adoption checkpoint
- Fresh-agent MCP preference is not behaviorally verified; this session lacked exposed ADS MCP tools.
- The frozen candidate mean was 6.92 versus historical 8.412. Different judges/conditions mean no
  controlled uplift claim. Minor findings are retained, not erased to make scores look better.
- One synthetic context comparison is not a whole-process benchmark or current-versus-old-model eval.
- Command adapters must accept additive context/role fields. Downstream prompt handling and provider
  safety are not attested. Unchanged candidate-only requests retain their previous shape.
- No installed skills, merge, publication or deployment are part of this local implementation.

Next adoption checkpoint: one authorized active-project component, retained alternatives, actual
human tuning and selection, and an observed capable agent choosing the available MCP route.
