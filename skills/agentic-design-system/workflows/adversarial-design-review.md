# Workflow: adversarial design review

Review finished UI from a context that **did not build it**, whose job is to find the strongest
reasons it is *not* done — the ADS separation-of-generation-and-evaluation thesis, made runnable.

Path terms below are install-root neutral. `<orchestrator-skill>` is the directory containing the
installed agentic-design-system skill and `<skills-root>` is its parent directory.

## When to use

Before merging or shipping notable UI; when a build "feels fine" and you want a skeptic; whenever
the builder would otherwise self-clear its own quality.

## Read first

- `<skills-root>/design-review/SKILL.md` (the quality gate + pre-flight checklist)
- `<orchestrator-skill>/SKILL.md` → the profile-locked 4-criteria rubric
- `<orchestrator-skill>/references/structured-findings.md` → diagnostic categories, severity, and evidence schema
- [`templates/grader-report-template.md`](../templates/grader-report-template.md) (the verdict shape)
- the task's outcome artifact ([`templates/outcome-template.md`](../templates/outcome-template.md)), if one exists

## Run

1. **Capture the artifact** so the critic judges pixels, not source:

   ```bash
   node <orchestrator-skill>/scripts/run-capture.mjs "<running-route-url>" \
     --states default,empty,loading,error --out evidence/<slug>
   ```

   Read both `evidence/<slug>/evidence.json` and
   `evidence/<slug>/modal-interaction-receipt.json`. If any declared dialog is `failed` or
   `not_verified`, or the receipt is missing, the review cannot return `satisfied`.

2. **Open a separate critic context** — a fresh subagent or session that did not write the code.
   Give it the outcome + the captured screenshots (`evidence/<slug>/*.png`) and the `evidence.json`
   gates, not the builder's commentary.
3. **Prompt it to refute, not to praise:** "Find the strongest reasons this fails the outcome and
   the rubric. Default to needs_revision when uncertain." Score each of the 4 rubric criteria. For
   every critique, emit a structured finding with category, severity, rubric row, state,
   breakpoint, exact artifact, concrete target, optional normalized region, observation, and
   evidence. A blocker cannot return `satisfied`.
4. **Account for coverage** with one row for every ADS diagnostic category. Mark each row `clear`,
   `finding`, or `not reviewed` and cite the screenshot, measurement, or missing evidence that
   supports the status. Do not invent a finding quota. A category the artifacts cannot support is
   `not reviewed`, not `clear`.
5. **Run the adjacent-action consistency check** before returning `satisfied`. In every state and
   breakpoint, compare status and instructional copy with every visible nearby primary, secondary,
   toolbar, and inline action. An enabled-looking action that contradicts a read-only, disabled,
   offline, permission-limited, or destructive state is a major `cues_affordances` finding and
   cannot return `satisfied`.
6. **Back judgment with objective checks** on changed files so taste and defects stay separable:

```bash
python3 <skills-root>/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 <skills-root>/design-review/scripts/state-check.py <file.tsx>
python3 <skills-root>/design-review/scripts/accessibility-check.py <file.tsx>
```

## Evidence required

- The `capture.mjs` screenshots + `evidence.json` the critic actually judged (axe, overflow,
  main/live-region semantics, CLS, state, and touch-target gates included).
- `modal-interaction-receipt.json`; when dialogs are declared it must deterministically verify
  initial focus, Tab/Shift+Tab containment, Escape dismissal, focus return, and inert background.
- The three checks' output.
- Each critic finding tied to a rubric row, state, breakpoint, exact screenshot, and concrete
  target or normalized screenshot region — no free-floating "feels off."
- Eight evidenced coverage rows, including explicit `not reviewed` rows where evidence is missing.
- A finding without evidence, with an unsupported category, or with an incomplete location is an
  invalid grader packet.

## Output

A filled `templates/grader-report-template.md` with a verdict:
`satisfied` / `needs_revision` / `max_iterations` / `failed`, the rubric scores, the structured
findings table, and a bounded, testable next-revision prompt containing every blocker and major
finding id if not satisfied, plus the complete coverage ledger.

## Blocked when

- No outcome is defined — you cannot judge against nothing. Write the outcome first (one pass of
  `templates/outcome-template.md`), then review.
- The artifact can't be rendered/screenshotted, so the critic would be judging source only — say so.
- A required modal interaction receipt is missing, `failed`, or `not_verified`.

## Stop when

Verdict is `satisfied`, or `max_iterations` is hit and the remaining gaps are recorded for a human.
**The builder does not get to overrule the separate critic by re-asserting the work is done** —
that defeats the purpose. If scores plateau across revisions, escalate to a human decision rather
than manufacturing a pass.
