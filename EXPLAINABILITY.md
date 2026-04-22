# explainability model

## purpose

the system should not just improve output. it should explain, in plain english, what happened.

explainability is how phase 2 earns trust.

if a user cannot tell:
- why a skill fired
- why another skill did not fire
- what checks ran
- what problems were found
- what changed
- what still needs human judgment

then the system still feels magical in the bad way.

## design goal

after any meaningful run, the user should be able to scan one compact report and understand:
1. what kind of work the system thought this was
2. what preset or mode it matched
3. which skills activated
4. which references were consulted
5. which issues were detected
6. what was fixed automatically
7. what decisions remain open

## report structure

### 1. run classification

answer:
- what kind of task was this?
- what preset best matched it?
- what confidence level did we have?

example:
- task type: dense dashboard
- matched preset: `dense-dashboard`
- confidence: high
- reason: comparison-heavy data, sticky regions, responsive table decisions required

### 2. skills fired

for each activated skill, report:
- skill name
- why it fired
- what role it played

example:
- `design-review` — always-on quality gate for visual work
- `ux-baseline-check` — screen contains interactive flows and needs state coverage
- `ui-polish-pass` — final finish pass after structural fixes
- `agent-friendly-design` — production-facing UI needs semantic/accessibility review
- `responsive-design-forks` — layout had ambiguous mobile translation decisions

### 3. skills skipped

this is just as important as skills fired.

for each skipped skill, report:
- skill name
- why it did **not** fire

example:
- `whimsical-design` skipped — no request for personality, delight, or brand expression
- `world-build` skipped — no immersive or atmospheric brief
- `web-animation-design` skipped — motion was not a primary requirement

this turns routing into something legible instead of mysterious.

### 4. references consulted

report the specific references that shaped the output.

example:
- `spacing.md` — hierarchy via whitespace, not borders
- `anti-patterns.md` — avoided card nesting and generic admin tropes
- `ai-css-failure-patterns.md` — caught missing `min-w-0` and sticky/overflow conflict
- `responsive-design-forks.md` — surfaced table-on-mobile tradeoff

if a reference was especially important, say what decision it influenced.

### 5. issues detected

group findings into clear buckets:
- visual / design issues
- UX/state issues
- responsive issues
- accessibility / semantic issues

example:
- visual: equal-weight cards flattened hierarchy
- UX: empty state missing for filtered table
- responsive: sidebar had no explicit mobile translation
- accessibility: heading hierarchy skipped from h2 to h4

### 6. fixes applied

show what the system actually changed.

example:
- reweighted layout from equal cards to 60/40 composition
- added loading, empty, and error states
- switched mobile table behavior to priority columns + detail expansion
- added `min-w-0` to shrinking flex children
- replaced decorative blue accents with type/spacing hierarchy

this section is important because "issues detected" without "fixes applied" feels like lint, not help.

### 7. human judgment required

this is where the system should be honest.

report:
- unresolved product decisions
- areas where multiple valid choices exist
- things that should be confirmed by a human before shipping

example:
- should mobile preserve cross-row comparison or simplify into card reading?
- does this screen need more brand expression, or is utilitarian restraint correct?
- should the sticky filter bar remain persistent on tablet widths?

this is the boundary between automation and design judgment.

## report tone

the report should be:
- compact
- direct
- concrete
- non-defensive
- useful to both humans and agents

avoid:
- self-congratulation
- chain-of-thought narration
- vague summaries like "improved UX"
- listing every tiny internal step

## report length rules

for routine work:
- 5-8 bullets total

for bigger builds:
- short sections, still scannable

for public product surfaces:
- translate internals into human language
- say what improved and why, not just which skill names fired

## minimal report template

- task type:
- matched preset:
- skills fired:
- skills skipped:
- key references consulted:
- issues detected:
- fixes applied:
- human judgment required:

## human-readable version

for end users, translate the same report into product language:

- **why this setup:** you were building a dense dashboard, so the system prioritized hierarchy, responsive translation, and table behavior
- **what ran:** design review, UX state checks, polish, and responsive decision checks
- **what improved:** clearer hierarchy, missing states added, mobile behavior made explicit
- **what still needs you:** choose whether mobile should preserve comparison or simplify for readability

## implementation notes

phase 2 does not need live runtime instrumentation on day one.

start with a documented output shape that agents can emit consistently.

v1 can be generated from:
- task classification
- routing rules
- known activated skills
- known loaded references
- verification script output
- explicit unresolved decisions captured during the build

later, this can become:
- CLI output
- app UI panel
- shareable run reports
- quality history over time

## recommendation

ship explainability in three layers:

1. **docs layer** — define the output shape
2. **template layer** — give agents a reusable report format
3. **product layer** — eventually render it in a UI

start with docs + template now.
