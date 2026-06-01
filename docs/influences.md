# influences

ADS is assembled from public ideas and local dogfooding. These are influences, not vendored source files.

## Intent Engineering

- Source: <https://github.com/kylezantos/intent-engineering>
- What ADS borrows: intent before output. The useful shape is user/situation, accomplish, notice, operational state, and an alignment check.
- What ADS does not copy: repo files or exact wording. The repository had no declared license when reviewed, so ADS re-expresses the idea locally.

## Anthropic Managed Agents outcomes

- Source: <https://platform.claude.com/docs/en/managed-agents/define-outcomes>
- What ADS borrows: define the outcome and rubric first, grade in a separate context, revise until satisfied or stop at an iteration limit.
- What ADS changes: ADS keeps this as portable markdown templates and skill instructions, not a hosted harness dependency.

## Agentic Rubrics as Contextual Verifiers for SWE Agents

- Source: <https://huggingface.co/papers/2601.04171>
- What ADS borrows: repository-grounded rubrics, separate verifier signals, and context gathering before judging an agent patch.
- What ADS changes: ADS applies the idea to UI/design artifacts and keeps execution-free rubric review as a reviewer signal, not a replacement for screenshots, builds, state checks, or accessibility checks.

## Karpathy autoresearch

- Source: <https://github.com/karpathy/autoresearch>
- What ADS borrows: a fixed environment, one bounded editable surface, a clear metric/review target, an experiment log, and a repeated agent loop that changes the artifact, checks it, keeps or discards it, and repeats.
- What ADS changes: ADS applies the loop structure to interface work instead of model training. The editable artifact is UI/design code, the metric is an outcome/baseline/rubric/grader contract, and the evidence is screenshots, checks, reports, and human review.

## DESIGN.md ecosystem

- Sources: <https://github.com/google-labs-code/design.md> and <https://github.com/VoltAgent/awesome-design-md>
- What ADS borrows: project identity should be readable by agents as structured design context.
- What ADS changes: ADS treats project identity as one input to a loop, not the whole system.

## make-interfaces-feel-better

- Source: <https://github.com/jakubkrehel/make-interfaces-feel-better>
- What ADS borrows: small interface details matter, and agents benefit from explicit micro-quality heuristics.
- What ADS changes: ADS places those heuristics inside a broader intent, baseline, rubric, evidence, and grader loop.

## thumb-first

- Source: <https://github.com/kylezantos/thumb-first> (MIT, © Kyle Zantos)
- What ADS borrows: the core structural idea that mobile review is two independent passes — subjective design judgment vs objective platform defects — with a strict separation rule ("a preference must never read as a must-fix"). Also the decision-forks framing (recurring mobile decisions with no universal right answer) and severity-tiered (P0–P3) defects with `file:line`.
- What ADS does not copy: the three-skill pack, its named-designer lens roster, and repo files. MIT would permit vendoring, but ADS re-expresses the structure as a routing profile plus `skills/design-review/references/mobile.md` and report sections, keeping it inside ADS's existing orchestrator rather than adding a parallel skill suite. Lenses are re-stated as plain review questions, not attributed voices.

## animations.dev vocabulary

- Source: <https://animations.dev/vocabulary> (Emil Kowalski, "Animations on the Web")
- What ADS borrows: a shared, promptable motion vocabulary — named patterns (crossfade, shared element transition, direction-aware transition, rubber-banding, stagger, …) so reviewers and agents use precise nouns instead of "make it smooth."
- What ADS does not copy: course content or wording. ADS curates a review-relevant subset in `references/motion.md`, ties each name to one of four jobs (state / hierarchy / causality / feedback) with default timing/easing, a reduced-motion fallback, and an evidence expectation, and links out for the full lexicon and implementation depth (`web-animation-design`).

## Agent2Agent / A2A

- Sources: <https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/> and <https://a2a-protocol.org/latest/specification/>
- What ADS borrows: task, artifact, status, and separate-agent vocabulary.
- What ADS changes: no A2A protocol implementation yet. Current ADS artifacts are A2A-shaped so a later integration has a clean path.
