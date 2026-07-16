# Skill Expansion Audit — Agentic Design System

**Date:** 2026-07-15
**Branch audited:** `preview/assembly-line-homepage` (commit `6011abf`), worktree `.worktrees/concept-assembly-line`
**Scope:** the 9-skill pack + routing, templates, workflows, scripts, presets, testing, CI, integrations; local skills under `~/.claude/skills/`; public skill ecosystem.
**Method note:** the brief referenced `/Users/moltbot/clawd/skills/`; that path lives on another machine. The local analog `~/.claude/skills/` was inspected instead — it contains the full ADS pack plus the same non-pack skills (`prototype`, `improve-animations`, `review-animations`, `designer-mind`, `exploration-pr`, `apple-design`, `skill-distillery`, `hard-task-protocol`, `handoff`, `illo`).

Throughout: **Observed** = verified in source. **Judgment** = my assessment.

---

## 1. Current coverage map

### 1.1 Control plane (observed)

| Layer | Where | What it does |
|---|---|---|
| Entry docs | `AGENTS.md:1-63` (symlinked as `CLAUDE.md`), `README.md:11-23` | Intent → baseline → rubric → build-with-evidence → grade-and-revise loop; two-tier verification doctrine (`AGENTS.md:44-58`) |
| Routing | `routing/ROUTING.md:9-45` | Three lanes: core pack (always), production pass (agent-friendly-design, when shipping), creative pack (opt-in). Profiles: Project Knowledge Intake (`:49-62`), Outcome + Grader loop (`:64-85`), Reference Intake Gate (`:87-113`), Context pass (`:115-128`), Core chain (`:130-138`), Review-only (`:150-155`), Mobile + motion (`:157-182`), Divergent exploration mode (`:200-209`), Compounding (`:220-223`) |
| Workflow router | `workflows/create-design-workflow.md:13-21` | Route-by-intent table; shared 7-question runbook shape (`:28-37`); thesis: evidence over assertion, builder ≠ judge (`:38-43`) |
| Executable spine | `workflows/new-page-component.mjs` | Route → Build → Capture → Grade → Report loop. Requires `devUrl` or `artifactPath` — "gates on RENDERED output, never source" (`:59-61`). Independent grader agent judges screenshots against DQ35/Orig30/Craft20/Func15 (`:94-112`) |

### 1.2 Skills (observed)

| Skill | Lines | Enforcement behind it |
|---|---|---|
| `agentic-design-system` (orchestrator) | 178 | Routing decision (`SKILL.md:94-110`), self-grading rubric (`:116-135`), iteration philosophy (`:137-145`), DESIGN.md handoff contract (`:80-92`) |
| `design-review` | 127 | 12 reference files (`SKILL.md:50-58` lists 6; orchestrator `SKILL.md:159-174` lists 12), 3 source heuristics + capture.mjs (`SKILL.md:90-115`) |
| `ux-baseline-check` | 75 | 6-section state inventory; data states partially enforced (`state-check.py`, capture `stateRendered`); interaction states (`:29-33`) and form states (`:36-41`) prose-only |
| `ui-polish-pass` | 91 | 7 sequential passes incl. micro-details (`:63-70`); prose-only |
| `agent-friendly-design` | 183 | 10-item checklist (`:24-147`); **zero scripts, zero references** — least-instrumented named skill |
| `visual-reference-calibration` | 119 | Reference contract hard rule (`:48`), calibration questions (`:54-63`), stop rule after two rejected passes (`:106-113`) |
| `whimsical-design` | 205 | Trigger/non-trigger discipline (`:15-27`); prose + recipes |
| `world-build` | 311 | 6-phase construction manual; prose + recipes |
| `web-animation-design` | 545 | Emil Kowalski distillation; explicit self-gate vs design-review's `references/motion.md` (`:10-15`) |

### 1.3 Deterministic verification (observed)

Two tiers, honestly labeled (`skills/design-review/scripts/README.md:58-61`: "source heuristics advise, rendered evidence gates"):

- **Tier 1 (gameable source greps):** `anti-pattern-check.py` (fonts, purple gradients, zinc, 4-stat-cards, missing-state greps, `transition: all`, generic labels; `CHECKS` at L27-122), `state-check.py` (loading/empty/error patterns, exits 1 on any missing, L125; the gaming exploit is documented at `scripts/README.md:13-16`), `accessibility-check.py` (landmarks, div-soup ratio, alt/labels, heading levels, tabindex, focus-visible; L28-125).
- **Tier 2 (authoritative rendered gates):** `capture.mjs` — per state × breakpoint with `reducedMotion: 'reduce'` (L203): full-page screenshots, axe wcag2a+2aa serious/critical count (L217-231), horizontal overflow (L240-242), `stateRendered` via `#state=` hash + rendered text length, rendered fonts, touch-target scan < 44px with `data-ads-target-ok` escape hatch (L118-152). Gates block in `new-page-component.mjs` and `workflows/mobile-review.md:47-56` (gate→P-tier mapping).
- **Proof it works:** `docs/loop-demo/` — 3-iteration Orders run, 12 axe + 114 sub-44px targets → 0/0, grader `satisfied` only on iter3 (`README.md:127`).
- **CI:** `ci/design-eval.py` + `.yml` run **only the three Tier-1 source heuristics** (never capture.mjs), and exit 0 regardless of findings unless `--strict` (L118-119).

### 1.4 Verification coverage matrix (observed)

| Dimension | Deterministic | Prose/judge only | Absent |
|---|---|---|---|
| a11y (axe, landmarks, labels) | ✅ both tiers | — | — |
| Responsive overflow | ✅ rendered | — | — |
| Touch targets | ✅ rendered | — | — |
| Data states render | ✅ rendered (needs `#state=` support) | — | — |
| Anti-slop defaults (Inter/purple/zinc/stat-cards) | ⚠️ source-grep + rendered-font check | anti-patterns.md | — |
| UX writing | ⚠️ generic-label greps | `references/ux-writing.md` (217 lines, the longest reference) | — |
| Interaction states (hover/focus/active/disabled) rendered | — | `ux-baseline-check:29-33`, `ui-polish-pass:54-60` | no rendered capture of any interaction state |
| Forms (validation, autofill, paste, submit behavior) | — | `ux-baseline-check:36-41` | no ruleset, no check |
| Performance / CLS | — | mentioned in `references/mobile.md` | **no metric captured anywhere** |
| Visual regression / baseline diff | — | — | **screenshots captured, never diffed** |
| Token/design-system extraction & adherence | — | `templates/project-identity-template.md` YAML is hand-authored | no extraction, no adherence check |
| Machine-readable UI (agent-friendly) | ⚠️ capture records `landmarks`/`statusRegion`/`alertRegion` but **does not gate on them** | SKILL.md only | no llms.txt/JSON-LD/predictability check |
| Data viz | — | one section in `references/inspiration.md` | — |
| Localization | — | — | entirely absent |
| Component API quality | — | — | entirely absent |
| Figma intake | — | reference-intake covers screenshots | no design-file intake (covered by first-party `figma:*` plugin skills in this environment) |

### 1.5 Defects found while auditing (observed)

1. **Phantom preset references.** All three presets (`presets/*.json` `activates`/`referencesConsulted`) point at `ai-css-failure-patterns.md`, `responsive-design-forks.md`, and `sticky-scroll-patterns.md` — none exist anywhere in the repo.
2. **CI enforces only the gameable tier** and passes unconditionally without `--strict` (`ci/design-eval.py:118-119`).
3. **`web-animation-design` course artifact:** `SKILL.md:19-24` instructs the agent to respond *only* with "I'm ready to help you with animations based on Emil Kowalski's animations.dev course" when invoked without a question — wrong behavior inside an ADS chain.
4. **Duplicated noise-overlay CSS** in `whimsical-design/SKILL.md:89-109` and `world-build/SKILL.md:69-78` — same recipe maintained twice, will drift.
5. **Aaron-machine coupling in a public pack:** `design-review/SKILL.md:37` tells installed agents to read `memory/channels/{channel-name}.md`; "Aaron" appears throughout core skills. Fails the cold-agent/cross-environment lens for a public MIT package.
6. **CLS is promised, never measured** (prose in `references/mobile.md`; nothing in `capture.mjs`).

---

## 2. The five most important uncovered or weakly covered jobs

Ranked by (frequency of the job in real use) × (cost of the current gap). Judgment, grounded in the matrix above.

1. **"I changed existing UI — prove nothing regressed."** The Review-only lane (`routing/ROUTING.md:150-155`) runs a *checklist only*; capture.mjs produces deterministic per-state/breakpoint PNGs but nothing ever compares them to a baseline. This is the most common real task shape (polish passes, ports, copy tweaks) and the one with the weakest evidence. The protocol already exists locally: `~/.claude/skills/exploration-pr/SKILL.md:26-37` (merge-base worktree BEFORE shots, same route/viewport/state discipline at `:96`).
2. **"Show me options before committing."** `ROUTING.md:200-209` describes Divergent exploration mode but ships no mechanism, template, or artifact contract. The proven implementation exists locally: `~/.claude/skills/prototype/SKILL.md:12-16, 50-55` (5 genuinely-distinct variations in one self-contained HTML, distinct on structure/tone/density/metaphor axes, tabbed switcher, disposable artifact).
3. **"Do the rendered interaction states actually exist?"** Hover/focus/active/disabled are demanded in prose three times (`ux-baseline-check:29-33`, `ui-polish-pass:54-60`, `agent-friendly-design:52-62`) and never captured. capture.mjs never screenshots a focused or hovered control; the focus-visible check is a source grep. Forms rules (paste, Enter-to-submit, inline errors, autofill) have no ruleset at all — the best public one is MIT (vercel-labs/web-interface-guidelines).
4. **"Does the build adhere to the project's design system?"** `DESIGN.md` tokens are normative (`agentic-design-system/SKILL.md:80-92`) but hand-authored and unverified; the only rendered token fact captured is body font-family. No extraction from an existing product, no adherence gate (did the build actually use the token colors/spacing?).
5. **"Is the page stable and agent-usable when it ships?"** CLS is named in prose but unmeasured; `agent-friendly-design` is a named production-pass skill with zero instrumentation, even though capture.mjs *already records* the landmark/status-region facts it would gate on.

---

## 3. Ranked candidate shortlist

Scoring: 1–5 per dimension, **5 is always favorable** (for the two cost rows, 5 = cheap). Max 35.

| # | Candidate | Impact | Freq | Unique | Enforce | Evidence | Impl cost | Routing cost | Total |
|---|---|---|---|---|---|---|---|---|---|
| C1 | **Rendered before/after delta** for the review lane (`--compare` mode in capture.mjs + review-lane workflow step) | 5 | 5 | 4 | 5 | 5 | 4 | 5 | **33** |
| C2 | **Port `prototype` into the pack** as the divergent-exploration mechanism | 4 | 4 | 5 | 3 | 5 | 5 | 4 | **30** |
| C3 | **Interaction-state & forms evidence** (capture focus/hover/disabled renders + vendor MIT forms ruleset as a reference) | 4 | 4 | 3 | 4 | 4 | 3 | 5 | **27** |
| C4 | **Design-source intake / token extraction** (computed-style extraction → DESIGN.md; later, adherence gate) | 4 | 3 | 4 | 4 | 4 | 3 | 4 | **26** |
| C5 | **Motion review verdict gate** (Block/Approve posture + Before/After/Why table for the motion pass) | 3 | 3 | 3 | 3 | 5 | 5 | 5 | **27** |

(C3 and C5 tie on totals; C3 ranks higher on impact × frequency.)

---

## 4. Classification of each candidate

| Candidate | Classification | Why |
|---|---|---|
| C1 before/after delta | **Script + workflow extension** — not a new skill | No new trigger or judgment domain; it completes the existing evidence loop for the existing Review-only lane. capture.mjs already produces the comparable artifacts; `exploration-pr` already proves the worktree-BEFORE protocol. |
| C2 prototype port | **New skill** (the only one that passes the gate) | Crisp trigger ("show me options", "mock this up", before committing to a new feature) and non-trigger (design already chosen, trivial tweak, real data wiring — `prototype/SKILL.md:80-84`); distinct workflow (diverge, don't converge — the opposite posture from every current pack skill); verifiable output (one self-contained HTML with 5 named variations); behavior agents demonstrably don't do unaided (one-shot fixation is designer-mind's documented top trap, `designer-mind/SKILL.md:85`). |
| C3 interaction/forms evidence | **Script/eval + reference material** | The judgment content is one MIT checklist away (vercel-labs); the missing part is deterministic capture of rendered states. Belongs inside design-review's scripts + a new `references/forms.md`, not a skill. |
| C4 token extraction | **Extension** (of Project Knowledge Intake) **+ script** | The workflow slot already exists (`ROUTING.md:49-62`); what's missing is the extraction tool (models: hue's computed-style protocol, MIT; Google stitch `extract-design-md`, Apache-2.0). A standalone skill would duplicate the intake trigger. |
| C5 motion verdict gate | **Existing-skill extension** (`references/motion.md` + run-report motion section) | The motion vocabulary pass (`ROUTING.md:176-181`) already demands per-animation evidence; it lacks only the Block/Approve verdict shape and the Before/After/Why findings table (both MIT, emilkowalski/skills `review-animations`). A separate skill would collide with `web-animation-design`'s trigger list. |

---

## 5. Strongest recommendation

**C1 — rendered before/after delta evidence for modifications — and, more broadly: spend this cycle instrumenting the existing loop rather than widening the pack.** One new skill (C2, a port of an already-proven local skill) is the only addition that survives the gate.

Why C1 beats the alternatives (judgment):

- **It covers the highest-frequency real task.** Most actual ADS invocations are modifications — polish passes, ports, copy/spacing changes — and that lane currently has the *least* evidence (checklist only, `ROUTING.md:150-155`), while new-build work has the most (the full mjs loop). The evidence gradient is inverted relative to usage.
- **It is the cheapest remaining non-gameable gate.** The four existing hard gates (axe, overflow, states-rendered, touch targets) all live in capture.mjs; a `--compare` mode reuses the same screenshots, viewports, and states. `exploration-pr` has already debugged the hard parts (merge-base worktree, deps symlink, port isolation, same-route/viewport/state integrity — `SKILL.md:26-37, 88-100`).
- **It converts two memory-level failure modes into gates:** "polish means polish, not restructure" and "port 1:1 before redesigning" both become checkable as a bounded visual delta instead of a promise.
- **External convergence:** plugin87's `design-qa` (variants × states × themes visual-regression pyramid) and hixuanxuan's `visual-diff` (structured diff → downstream-agent handoff, MIT) independently land on the same design; no public skill does it well yet, so ADS doing it is differentiating.
- Against C2: prototype's value is real but it's a divergence aid, not a verification gate — it raises the ceiling; C1 raises the floor, and ADS's thesis (README `:99-103`) is floor-first. Against C3/C4/C5: all worth doing, all smaller, none unlock a lane the way C1 does.

---

## 6. Proposed new skill (one; only one survives the gate)

### `design-variations` (port of local `prototype`)

- **One sentence:** Explore a UI feature as 5 genuinely-distinct variations in one self-contained HTML file, let the human pick a winner or blend, then build only the winner in the real stack.
- **Trigger:** "show me options / variations", "mock this up", "what could this look like", or any new feature/page/component where direction is undecided — the mechanism `ROUTING.md:200-209` already promises.
- **Non-trigger:** design already chosen; mechanical or bug-fix work; anything needing real data wiring; single-value tweaks. (Source: `prototype/SKILL.md:80-84`.)
- **Problem:** agents one-shot the first plausible design (first-idea fixation, `designer-mind/SKILL.md:85`); ROUTING's divergent mode is prose with no artifact contract, so it never actually fires.
- **Inputs:** one-line frame of the feature; the project's real entities/labels (variations must preview taste with realistic content, never lorem); optional DESIGN.md/preset baseline.
- **Outputs:** one self-contained `variations.html` (tabbed pill switcher, each variation full-width in-situ, named by its idea not "Version N") + a one-line recommendation; artifact is explicitly disposable.
- **Workflow:** frame → build 5 variations distinct on a real axis (structure / tone / density / metaphor) → human picks/blends → build winner in the real stack under the normal core chain.
- **Verification contract:** artifact renders via capture.mjs in artifact mode (`file://` path — already supported by `new-page-component.mjs:63-65`); distinctness self-check (a recolor is not a variation); realistic-content check (no "Item 1"); the winner build then goes through the standard gates.
- **Routing placement:** replaces the prose of ROUTING's Divergent exploration mode; runs BEFORE the core chain; core chain runs only on the chosen direction (as `ROUTING.md:207` already states).
- **Overlap:** none with core pack (opposite posture: diverge vs converge); complements whimsical/world-build (they shape one direction; this generates candidates); designer-mind (local) supplies the "when", this supplies the "how".
- **Tests/evals:** install smoke gains a 10th skill assertion; a fixture prompt ("orders filter bar, direction unclear") should yield 5 variations that differ on a named axis — checkable by the existing LLM-judge harness (`testing/eval-loop.ts`) with a distinctness rubric row.
- **Effort:** small — the skill and its `assets/variations.html` scaffold exist locally and were dogfooded; porting = de-Aaron-ing the copy, adding the routing row, updating the smoke count.

*(A second candidate skill — design-source intake / token extraction — was considered and deliberately classified as an extension of Project Knowledge Intake instead; see §4/C4. Speccing it as a skill would duplicate an existing trigger.)*

### Disposition (2026-07-16)

`design-variations` was approved and added as the pack's tenth skill. The shipped version keeps
the audit's divergent-before-convergent posture while scaling the default artifact to four
directions, with three for narrow decisions and five only for genuinely broad spaces. It includes
the reusable `assets/variations.html` switcher and is now routed from the orchestrator, entrypoint,
Codex integration, and divergent-exploration docs.

---

## 7. Fix before adding anything new

1. **Phantom preset references** — delete or create `ai-css-failure-patterns.md`, `responsive-design-forks.md`, `sticky-scroll-patterns.md` (all three presets cite them; §1.5.1).
2. **Gate what capture already measures** — `landmarks`, `statusRegion`, `alertRegion` are recorded in evidence.json but never gated; wiring them into the gates block instruments `agent-friendly-design` for near-zero cost and gives the production pass its first teeth.
3. **Add a CLS/layout-shift metric to capture.mjs** — the prose already promises it (`references/mobile.md`, `scripts/README.md`); a `PerformanceObserver('layout-shift')` sample during settle closes the promise.
4. **Fix `web-animation-design`'s "Initial Response" block** (`SKILL.md:19-24`) — a chat-course artifact that misbehaves inside the ADS chain.
5. **De-duplicate the noise-overlay recipe** shared by whimsical-design and world-build into a single reference both cite (§1.5.4). Consider whether world-build's atmosphere layers should generally become a shared reference — the two skills' checklists overlap heavily.
6. **De-Aaron the public pack** — `design-review/SKILL.md:37`'s `memory/channels/` path and the "present to Aaron" voice belong in a personal overlay, not the MIT package; the cold-agent-usage-test workflow exists precisely to catch this.
7. **Make CI honest** — either wire capture.mjs into `ci/design-eval.yml` (against a built artifact) or label the CI gate as advisory Tier-1 only; today `--strict` gates on the tier the docs call gameable.
8. If C5 is taken: adopt the Block/Approve verdict + Before/After/Why table into `references/motion.md` from emilkowalski/skills (MIT) rather than adding a skill. Note for local hygiene (outside the pack): `improve-animations/AUDIT.md` and `review-animations/STANDARDS.md` are near-duplicate Kowalski catalogs that will drift — designate one canonical if either is ever vendored.

---

## 8. Do-not-add list

| Attractive idea | Why not |
|---|---|
| **UX-writing skill** | `references/ux-writing.md` is already the longest reference (217 lines) with checklists; the gap is enforcement, not content. At most: seed extra rules from anthropics `frontend-design` (Apache-2.0). |
| **Accessibility skill** | Already the best-covered dimension (axe both tiers + heuristics). Real-render alpha-composited contrast (plugin87 has it, but **no license**) would be a *script* upgrade, not a skill. |
| **Figma-intake skill** | First-party `figma:*` plugin skills already cover it in this environment; `reference-intake-contract.md` covers screenshot-led work; routing cost outweighs pack-side value. Revisit only if ADS targets environments without the Figma plugin. |
| **Localization skill** | No credible public model exists (all ≤10-star one-offs); low frequency in current work. Genuine whitespace, wrong pack to fill it. |
| **Component-API review skill** | Public whitespace, weak verification story, low frequency. |
| **Onboarding/product-tour skill** | Low frequency; no evidence base. |
| **Data-viz skill in the pack** | The environment already has a private `dataviz` skill with a runnable palette validator that exceeds every public option found; duplicating it into the public pack creates a second source of truth. Decide separately whether to upstream it — that's a licensing/ownership question, not a gap. |
| **Numeric-deduction scoring overhaul** (styleseed `ss-score` style) | The grader rubric is already numeric and weighted (`outcome-template.md`); itemized deductions are at most a grader-template tweak. |
| **`apple-design` into the pack** | Already correctly scoped as an opt-in local skill that self-demotes to web-animation-design for non-gesture work. |
| **Superdesign-style parallel-variation engine** | Source repo is an unmaintained tombstone (README says so); C2 covers the idea with a maintained local implementation. |

---

## 9. Smallest sensible next implementation step

**Step 0 (15 minutes, defect):** fix the three phantom preset references (§1.5.1).

**Step 1 (the first real increment of C1):** add a `--compare <baseline-evidence-dir>` mode to `skills/design-review/scripts/capture.mjs` that, after a normal capture, pairs PNGs by `state-breakpoint` filename, emits a per-pair pixel-diff percentage into `evidence.json` as a `visualDelta` gate input, and writes side-by-side composites into the evidence dir. Then add one paragraph to `routing/ROUTING.md`'s Review-only lane: "for modifications, capture BEFORE from the merge-base (worktree protocol per exploration-pr) and AFTER from the branch; the report states what changed and what stayed identical." No new skill, no new dependency beyond what capture already uses (Playwright ships screenshot comparison primitives; `pixelmatch` is a one-file fallback).

---

## External sources cited

| Source | License | Used for |
|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) (`frontend-design`, `webapp-testing`) | Apache-2.0 (per-skill LICENSE.txt) | named-default calibration; embedded UX-writing rules; server-lifecycle script pattern |
| [obra/superpowers](https://github.com/obra/superpowers) (`verification-before-completion`, `writing-skills`) | MIT | claims-vs-evidence table; skill-QA-as-TDD |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) (`review-animations`, `find-animation-opportunities`) | MIT | motion Block/Approve gate; rejection-first opportunity finder |
| [plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills) (`design-tokens`, `design-qa`, `a11y-audit`, `ux-writing`, `figma-integration`) | **none — cannot vendor** | DTCG 3-tier token model; visual-regression QA pyramid; real-render contrast |
| [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | MIT | fabricated-metrics/fake-chrome gates; pre-emit numeric self-critique; design-DNA `study` verb |
| [dominikmartn/hue](https://github.com/dominikmartn/hue) | MIT | computed-style extraction protocol + confidence-degradation flagging (C4 model) |
| [bitjaru/styleseed](https://github.com/bitjaru/styleseed) (`ss-verify`, `ss-score`) | MIT | independent convergence on render-gated receipts; itemized-deduction scoring |
| [Trystan-SA/claude-design-system-prompt](https://github.com/Trystan-SA/claude-design-system-prompt) (`interaction-states-pass`) | MIT | six-states-per-element pass with fallback values (C3 model) |
| [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) (`extract-design-md`, `taste-design`) | Apache-2.0 | source-code design extraction; calibrated taste dials |
| [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | MIT | the forms/keyboard/targets MUST-NEVER ruleset (C3 reference seed) |
| [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills) | MIT | pre-code a11y scorecards, design-code parity (noted, not adopted) |
| [hixuanxuan/browser-automation](https://github.com/hixuanxuan/browser-automation) (`visual-diff`) | MIT | structured visual-diff → downstream-agent handoff (C1 precedent) |
| [alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design) | MIT | fact-verification-before-brand-claims rule |
| superdesigndev/superdesign | Other; **unmaintained** | historical citation only |

Local skills cited: `~/.claude/skills/{prototype,exploration-pr,improve-animations,review-animations,designer-mind,skill-distillery,apple-design,hard-task-protocol,handoff,illo}` — see §2 and §4 for specific line references.
