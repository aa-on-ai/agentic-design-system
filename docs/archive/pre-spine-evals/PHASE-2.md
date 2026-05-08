# phase 2 — control plane

## thesis

phase 1 proved the engine works.

we have routing, evaluation passes, anti-pattern detection, state completeness checks, polish passes, and agent-friendly production guidance. the core problem now is not missing capability. the problem is legibility.

people cannot easily see:
- what the system is
- what configuration they should start with
- why certain skills fired
- what quality checks ran
- what outputs they can share, fork, or reuse

phase 2 is about making the invisible visible.

## framing

- **agentic design system** = engine
- **control plane** = how humans configure, inspect, share, and understand the engine

this is the product layer that turns a powerful internal system into a legible public tool.

## what to borrow from designteam

borrow the packaging, not the theater.

worth borrowing:
- clear public mental model
- presets people can install without reading 8 docs first
- visual builder / selector surface
- share / fork / export flows
- role + context framing when it clarifies behavior
- productized explanation of what the system will do

avoid borrowing:
- 16-agent swarm theater as the main story
- personality sliders as core architecture
- ceremonial handoff chains
- fake complexity that makes the system feel more magical than useful

## product goal

someone should be able to land on the project and understand, in under 60 seconds:
1. what this system does
2. which setup fits their task
3. what checks will run
4. why the output got better
5. how to share or reuse that setup

## core user stories

### 1. preset install
"i'm building an app/dashboard/marketing page and want the right review stack without learning the internals."

needs:
- choose a preset
- see what skills/rules it activates
- install/export that preset

### 2. run explainability
"the system changed my output. i want to know why."

needs:
- list which skills fired
- show which references were consulted
- show which checks failed and what got fixed
- show why a creative skill was or was not activated

### 3. project identity bootstrap
"my project has no design DNA written down. help me define it before the agent starts building generic slop."

needs:
- lightweight DESIGN.md or project-identity scaffold
- atmosphere, color roles, spacing philosophy, typography character, component tone
- responsive stance for ambiguous layout forks

### 4. share / fork / export
"this configuration worked. i want to reuse it across projects or share it publicly."

needs:
- portable config format
- one-click or one-command export
- readable summary for humans

## v1 control plane surfaces

### surface 1 — preset picker
first thing users see.

example presets:
- utilitarian app
- dense dashboard
- marketing page
- editorial/storytelling
- playful launch
- design system hardening
- production accessibility pass

each preset should answer:
- what it is for
- what it activates
- what it intentionally does **not** activate
- what success looks like

### surface 2 — why-this-fired panel
explain the system after or during a run.

show:
- triggered skills
- skipped skills and why
- references loaded
- checks run
- warnings found
- fixes made
- remaining human judgment calls

this is the heart of "make the invisible visible."

### surface 3 — project identity builder
simple form or template that outputs `DESIGN.md`.

minimum fields:
- atmosphere
- color roles + hex codes
- spacing philosophy
- typography character
- component tone
- responsive stance
- anti-goals / things to avoid

this can start as a markdown template before it becomes a UI.

### surface 4 — export / share
export a preset or project config as:
- markdown summary
- JSON config
- installable snippet / instruction block

longer-term:
- public preset gallery
- forkable configs
- link-based sharing

## v1 feature cut

build the smallest useful control plane first.

### ship in v1
- preset taxonomy and naming
- readable preset docs
- project identity template (`DESIGN.md` scaffold)
- explainability spec for why skills/rules fired
- export format for presets/configs
- README reframed around engine + control plane

### do not ship in v1
- live multi-agent builder theater
- personality sliders
- agent avatars / org chart gimmicks
- real-time orchestration visualization
- collaborative sharing platform

## information architecture

phase 1 repo structure is engine-first. phase 2 needs a clearer product layer.

likely additions:
- `PHASE-2.md` — product spec and roadmap
- `templates/project-identity-template.md` — starting point for DESIGN.md
- `presets/` — human-readable preset definitions
- `exports/` or `schemas/` — portable config formats
- docs or site pages explaining the control plane model

## preset model

a preset should be readable in plain english.

example structure:
- **name**
- **best for**
- **activates**
- **skips**
- **quality bar**
- **human judgment still required**
- **recommended inputs**

this matters because the public story is not "here are 7 skills."
it is "here is the setup you want for your kind of work."

## explainability model

for each run, we should be able to answer:
- why did `design-review` fire?
- why did `whimsical-design` not fire?
- which responsive references got loaded?
- what anti-patterns were detected?
- what state gaps were fixed?
- what remains a product decision rather than an automatic fix?

if we cannot answer those questions cleanly, the system still feels magical in the bad way.

## success criteria

phase 2 is working when:
- first-time users understand the system quickly
- setup time drops
- users can choose a preset without reading the whole repo
- outputs feel more inspectable and trustworthy
- shared configs become part of the product story
- the repo reads like a product, not just a toolkit

## immediate next steps

1. add the project identity template
2. define the first preset taxonomy
3. reframe README around engine vs control plane
4. sketch the explainability surface
5. decide whether the first control plane is:
   - docs-first
   - static web UI
   - CLI export flow

## recommendation

start docs-first.

don't build a fancy app before the product model is crisp. define the presets, identity template, and explainability language first. once those are sharp, the UI becomes obvious.
