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

## Karpathy-style coding-agent discipline

- Source: <https://github.com/forrestchang/andrej-karpathy-skills>
- What ADS borrows: clear task contracts, small scope, verification receipts, and completion evidence.
- What ADS changes: ADS applies that discipline specifically to UI quality, reference fidelity, states, accessibility, and design review.

## DESIGN.md ecosystem

- Sources: <https://github.com/google-labs-code/design.md> and <https://github.com/VoltAgent/awesome-design-md>
- What ADS borrows: project identity should be readable by agents as structured design context.
- What ADS changes: ADS treats project identity as one input to a loop, not the whole system.

## Agent2Agent / A2A

- Sources: <https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/> and <https://a2a-protocol.org/latest/specification/>
- What ADS borrows: task, artifact, status, and separate-agent vocabulary.
- What ADS changes: no A2A protocol implementation yet. Current ADS artifacts are A2A-shaped so a later integration has a clean path.
