---
name: agentic-design-system
description: >
  Design system for AI agents that build UI. Automatically routes to the right
  quality checks based on the task. Triggers on ANY visual, frontend, UI, design,
  component, page, layout, or styling work. Includes: anti-pattern detection,
  state completeness checks, accessibility verification, typography/color/spacing
  guidance, and creative direction when needed. Install this one skill to get the
  full system — it orchestrates everything else.
---

# Agentic Design System

you have a design system installed. this skill orchestrates it. read this BEFORE starting any visual work.

## Workflows (runnable runbooks)

if you just want to *use* ADS, start at `workflows/create-design-workflow.md` — it routes a task
to the right profile or workflow by intent. each runbook is decision-shaped (when to use, read
first, run, evidence, output, blocked when, stop when). these ship with this skill at
`skills/agentic-design-system/workflows/` so installed agents have them, not just repo clones;
the canonical copies live at the repo root `workflows/` and the two are kept in sync by the
install smoke's drift guard.

> **Installed, not cloned? Read this.** Paths in ADS docs are written **repo-root-relative**
> (`workflows/...`, `routing/ROUTING.md`, `templates/...`, `skills/design-review/scripts/...`).
> If you installed ADS as skills rather than cloning the repo, resolve them from the directory
> containing this `SKILL.md`; that location is portable even when agents use different install
> roots. From this file:
> - `workflows/create-design-workflow.md` → `./workflows/create-design-workflow.md`
> - `skills/design-review/scripts/capture.mjs` → `../design-review/scripts/capture.mjs`
> - `skills/design-review/references/mobile.md` → `../design-review/references/mobile.md`
> - `templates/run-report-template.md` → `./templates/run-report-template.md`
> - `templates/project-identity-template.md` → `./templates/project-identity-template.md`
> - `templates/reference-intake-contract.md` → `./templates/reference-intake-contract.md`
>
> `routing/ROUTING.md` and the top-level `README`/`AGENTS` are repo-only; the runbooks above
> stand alone without them.

## How it works

the system installs a routing skill plus focused helper skills. you don't need to read them all — this file tells you which ones to read for your current task.

### core pack (read these for ALL visual work)
- `skills/design-review/SKILL.md` — quality gate, reference files, verification scripts
- `skills/ux-baseline-check/SKILL.md` — loading, empty, error states
- `skills/ui-polish-pass/SKILL.md` — final spacing/alignment/hierarchy pass

### creative pack (read ONLY when triggered)
- `skills/visual-reference-calibration/SKILL.md` — BEFORE coding when Aaron provides a screenshot, CodePen, website, or other artifact as a desired visual target, or says “make it feel like this.” A screenshot used only to point at a defect is review evidence, not a reference target. Write the Reference Intake Contract first so the agent knows what to borrow, what not to borrow, and the fidelity target.
- `skills/design-variations/SKILL.md` — BEFORE production implementation when the user asks for options, variations, concepts, mockups, or help choosing a direction. Build one disposable browser artifact, let the human choose or blend, then promote only the winner.
- `skills/whimsical-design/SKILL.md` — ONLY if user asks for personality, delight, or brand expression. ONLY for marketing, editorial, or launch pages. Skip for utility UI.
- `skills/world-build/SKILL.md` — ONLY if user explicitly asks for immersion or atmosphere. Skip unless told otherwise.
- `skills/web-animation-design/SKILL.md` — ONLY if task specifically involves animation, motion, or interaction feel.

### agent-friendly (read for production sites)
- `skills/agent-friendly-design/SKILL.md` — semantic HTML, ARIA, structured data. Read when building anything that ships to production.

### project knowledge intake (optional; run when context needs alignment)
default path: use a preset when there is no project context, then build. if the task depends on product taste and a preset is not enough, inspect local docs/components/screenshots/references, ask only the missing blocking questions, and write the result into `DESIGN.md` or the `templates/project-identity-template.md` shape so downstream skills can use it. installed copies live under this skill's `templates/` directory.

### reference intake gate (optional; run before reference-led visual work)
if the user provides a visual reference/screenshot/site/CodePen as a desired target, says “make it feel like…”, the work is marketing/editorial/launch art direction, or prior output failed because it was generic/sloppy/wrong vibe, load `skills/visual-reference-calibration/SKILL.md` before generating UI. screenshots used only to identify a bug or region of concern stay in the normal review path.

use `templates/reference-intake-contract.md`; installed copies live under this skill's `templates/` directory. hard rule for reference-led work: if you cannot state what to borrow, what not to borrow, and the fidelity target, you cannot build. if no visual reference matters, skip this gate. ask before building when the primary borrowed layer or fidelity target is unclear, when the reference implies unapproved structural change, or when Aaron already said the prior pass missed the point. after implementation, screenshot the result and report where it matched or drifted from the contract.

### outcome + grader loop (optional; run for substantial UI work)
for non-trivial UI, define the user-facing intent and outcome before building, then grade the artifact in a separate context when possible.

use `templates/outcome-template.md` and `templates/grader-report-template.md` from the full repo. installed copies of all five runtime templates — outcome, project identity, reference intake, grader report, and run report — are bundled under this skill's `templates/` directory.

minimum loop:

1. define **intent**: user/situation, accomplish, notice, feel/operational state, alignment check
2. define **done**: artifact, required evidence, deterministic checks, max iterations
3. build
4. attach evidence: changed files, checks, screenshots or preview, unresolved risks
5. grade against the outcome using a separate agent/context when available
6. stop at `satisfied`, `max_iterations`, or explicit human decision

do not turn this into ceremony for tiny fixes. use it when unclear intent, visual quality, reference fidelity, or regression risk would otherwise cause churn.

### decision provenance (optional; substantial work only)

when a reviewer needs inspectable causality, read `workflows/decision-provenance.md`. capture the
loaded skill/source hashes once after routing and before building, then verify 3-7 consequential
decisions once at report time. do not trace every CSS property or repeat provenance capture inside
the revision loop.

skip this for copy-only changes, tiny mechanical fixes, and routine polish unless the user or risk
profile explicitly requires traceability. the provenance path has a 250ms budget per deterministic
operation and adds zero agent, model, browser, or network calls.

## Project handoff context (DESIGN.md)

if a `DESIGN.md` file exists at the repo root — or at a path the orchestrator passes in — load it as handoff context **before** building. it is the normative source of truth for design tokens (colors, typography, spacing, rounded, components) and a prose overlay for atmosphere, component tone, and anti-goals. if it does not exist and the task needs project taste, run project knowledge intake before generation.

- YAML frontmatter tokens win on conflicts with prose
- prose gives the **why** so the agent can judge edge cases
- unknown sections are preserved without error per the spec, so this repo's one extension (`Example Prompting Language`) is safe to use

the project-identity template is DESIGN.md-shaped. source checkouts use `templates/project-identity-template.md`; installed agents use the copy under this skill's `templates/` directory.

format reference: https://github.com/google-labs-code/design.md (alpha — this repo consumes the format, does not author tooling for it)

prior art / ecosystem: https://github.com/VoltAgent/awesome-design-md — curated real-world DESIGN.md examples.

## Routing decision

```
is this visual or frontend work?
├── no → skip everything, do the task
└── yes
    ├── new page/component → run project knowledge intake if context is thin, read core pack skills, then build
    ├── modification to existing UI → read design-review only
    └── non-visual (scripts, backend, config) → skip
    
    does it need creative direction?
    ├── user provided a desired visual reference/screenshot/CodePen/site/"feel like this" → also read visual-reference-calibration BEFORE coding
    ├── user asked for options/variations/concepts or the direction is undecided → run design-variations BEFORE production implementation
    ├── user asked for personality/delight → also read whimsical-design
    ├── user asked for immersion/atmosphere → also read world-build  
    ├── task involves animation specifically → also read web-animation-design
    └── none of the above → core pack is enough
```

## The key rule

if the default aesthetic is appropriate for the product, don't fight it. make it excellent, not different. a weather app CAN be dark and glassy. an admin panel SHOULD be clean and utilitarian. core pack makes defaults excellent. creative pack makes them different. only add creative when different is what the product actually needs.

## Design rubric (grade yourself before presenting)

score your output on these 4 criteria before announcing. inspired by Anthropic's multi-agent harness research — separating generation from evaluation produces dramatically better work.

| Criteria | Weight | What it means | Failing looks like |
|----------|--------|--------------|-------------------|
| **Design Quality** | 35% | Does it feel like a coherent whole? Colors, typography, layout, spacing combine into a distinct mood and identity. | Components feel disconnected. No visual theme. "Collection of parts" energy. |
| **Originality** | 30% | Evidence of custom decisions? Or is this template layouts, library defaults, and AI-generated patterns? A human designer should recognize deliberate creative choices. | Purple gradients over white cards. Unmodified shadcn. Zinc-800 everywhere. Stock hero sections. |
| **Craft** | 20% | Technical execution: typography hierarchy, spacing consistency, color harmony, contrast ratios. Competence check. | Broken fundamentals. Inconsistent spacing. Missing hover states. Bad contrast. |
| **Functionality** | 15% | Can users understand what it does, find primary actions, complete tasks without guessing? | Unclear CTAs. Hidden navigation. Confusing state transitions. |

**Design Quality and Originality are weighted highest.** models already score well on Craft and Functionality by default. the gap is always in making something that feels intentional and distinctive vs. generic.

### scoring guide
- **8-10:** ship it. would impress a human designer.
- **6-7:** functional but needs another pass. common for first iteration.
- **4-5:** generic AI slop. needs a creative pivot, not polish.
- **1-3:** broken fundamentals. rebuild.

**if you score yourself below 6 on Design Quality or Originality, don't present. iterate.**

## Iteration philosophy

more iterations with structured feedback produce breakthroughs. Anthropic's harness research found that on iteration 10 of a museum site, the model reimagined the entire approach as a 3D spatial experience — something that would never emerge from a single pass.

**rules for iteration:**
- don't stop at "good enough" on creative work. push for at least 3 passes on new pages/components.
- after each pass, score yourself on the rubric. if Design Quality or Originality aren't improving, **pivot the aesthetic entirely** instead of refining the current direction.
- refinement and pivoting are both valid. if scores trend up, refine. if scores plateau, pivot.
- the "2 rounds of fixes = rebuild" rule applies to BUG FIXES, not creative iteration. creative exploration benefits from more rounds, not fewer.

## Verification (run before presenting)

after ingest/interview (if needed), building, and scoring yourself on the rubric, run these source pre-flight scripts:

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>
```

investigate their warnings before presenting work. these are advisory source heuristics: they catch obvious defaults and missing source signals, but can both miss rendered defects and pass comments that merely contain the right words. when screenshot verification is in scope, gate the verdict on `skills/design-review/scripts/capture.mjs`, rendered screenshots, overflow, main/live-region semantics, CLS, computed fonts, touch targets, and axe results.

## What the reference files cover

when you read `skills/design-review/SKILL.md`, it points to reference files in `skills/design-review/references/`. you don't need to read all of them — only load what's relevant:

- `anti-patterns.md` — what NOT to do (always worth reading)
- `layout.md` — composition and grid-breaking (read for new pages)
- `typography.md` — type hierarchy, pairing, text-wrap (read when type feels off)
- `color.md` — palette strategy, tinted neutrals (read when color feels generic)
- `spacing.md` — rhythm and judgment (read when spacing feels cramped or uniform)
- `alignment.md` — concentric radius, optical alignment, shadows, image overlays (read for polish)
- `responsive.md` — mobile failures and what to check (read for responsive work)
- `mobile.md` — mobile review profile: design-judgment vs platform-defect passes, decision forks, severity tiers (read for mobile/app/PWA review)
- `motion.md` — interruptibility, enter/exit asymmetry, and the named motion vocabulary (read when adding or reviewing motion)
- `ux-writing.md` — copy quality, button labels, empty states (read when writing UI text)
- `mock-data.md` — realistic content, where humor goes (read when generating sample data)
- `inspiration.md` — context pass, reference priority (read when building for a named company)
- `structured-findings.md` — diagnostic categories, severity, evidence, and recurrence rules (read for substantial independent review)

## Structured diagnostic findings

the four weighted rubric criteria remain the verdict layer. for substantial UI review, the
independent grader must also return structured findings that explain why a score failed and exactly
where the failure appears. read `references/structured-findings.md` for the complete schema.

each finding records:

- `category`: `layout_spacing_hierarchy`, `polish_consistency`, `typography`, `originality`, `color_contrast`, `interaction_motion`, `cues_affordances`, or `brand_fit_tone`
- `severity`: `minor`, `major`, or `blocker`
- `rubricRow`: Design Quality, Originality, Craft, Functionality, or a task-specific criterion
- `state` and `breakpoint`
- `artifact`: the screenshot or preview actually judged
- `target`: a concrete element description, plus an optional normalized bounding box
- `observation`: one specific, falsifiable failure statement
- `evidence`: the screenshot path, comparison, interaction receipt, or rendered measurement supporting it

do not replace the four rubric scores with the diagnostic categories. do not turn a subjective
label into a deterministic hard gate. a blocker finding forces `needs_revision` or `failed`, and
every blocker or major finding must feed a bounded next-revision instruction.

aggregate findings by category and severity across iterations. repeated findings become candidates
for a rule, constraint, fixture, or deterministic gate only after a human or verified recurrence
establishes the pattern. preserve the finding → revision → evidence trace in the run report.

## Compounding

after each build, if you learned something new — a pattern that worked, an anti-pattern you hit, a design decision worth preserving — add it to the relevant reference file. the system gets smarter every time it's used.
