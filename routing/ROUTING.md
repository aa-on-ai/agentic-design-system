# routing

how to decide which skills to run and when.

## the decision

```
is this visual or user-facing?
├── no → skip (scripts, backend, config, data)
└── yes
    ├── is it new? (new page, new component, new flow)
    │   └── full chain
    ├── is it immersive? (landing page, portfolio, launch site, game UI)
    │   └── full chain + world-build
    └── is it a modification to existing UI?
        └── review only
```

## full chain

for new pages, new components, anything a stakeholder will see. run in order:

0. **pattern benchmarking** — BEFORE building, research how the best version of this already exists. read `skills/design-review/references/inspiration.md`. find 2-3 real examples. if you have browser access, study them. if not, suggest references to the builder ("search Mobbin for 'analytics dashboard' — share 2-3 that match your vision"). this step takes 2 minutes and saves 30 minutes of iteration.
1. **design-review** — quality gate. catches structural problems, anti-patterns, missing states. run first.
2. **ux-baseline-check** — state inventory. happy path, empty, loading, error, edge cases. nothing ships incomplete.
3. **whimsical-design** — personality pass. pushes past sterile toward delight. warm > cold, alive > static.
4. **web-animation-design** — motion pass. easing, timing, springs, transitions. everything that moves should feel intentional.
5. **ui-polish-pass** — final polish. spacing, alignment, hierarchy, visual cleanup. last step before presenting.

not every task needs all 5. use judgment:
- data-heavy admin tool? skip whimsical-design, light on animation.
- marketing page? whimsical-design and animation are critical.
- internal tool nobody screenshots? design-review + ux-baseline-check might be enough.

## full chain + world-build

for sites that need to feel like *places*, not pages. portfolio sites, product launches, game UIs, anything where atmosphere matters more than information density.

run world-build **before** the full chain — it sets creative direction that everything else builds on:

1. **world-build** — creative brief. what world is this? what does it feel like? sensory palette, reference board, atmospheric direction.
2. then run the full chain (design-review → ux-baseline-check → whimsical-design → web-animation-design → ui-polish-pass)

## review only

for modifications to existing UI where the structure already exists.

run:
1. **design-review** — pre-flight checklist only

examples: adjusting spacing, updating copy, minor layout tweaks, checking a screen before merge.

## agent-friendly pass

for any web project shipping to production where agents may consume or interact with the site. runs independently from the visual quality chain.

1. **agent-friendly-design** — semantic HTML, ARIA, structured data, llms.txt, API-first patterns, crawlability

routing within the skill:
- every project: semantic HTML + ARIA + machine-readable state (non-negotiable)
- public-facing: add structured data, llms.txt, crawlability
- products/SaaS: add predictable interactions, API-first, content optimization

this skill runs alongside the visual chain, not instead of it. a page can need both whimsical-design (for humans) and agent-friendly-design (for agents).

## skip

don't run the design chain for non-visual work:
- scripts, tests, data migrations
- backend logic, API routes
- config, infrastructure
- anything with no user-facing impact

## divergent exploration mode

when the task is creative or the direction is unclear, don't commit to one approach. instead:

1. ask the builder: "this could go a few directions — want me to explore 2-3 options or pick one?"
2. if exploring: build multiple versions with a navigation element (version selector, tabs, URL variants) so the builder can compare
3. different agents can work on different directions simultaneously
4. the builder picks a winner or hybridizes, then run the quality chain on the chosen direction

this is expensive — use it for layout decisions, visual direction, and interaction models. not for button colors.

## token budget awareness

the full chain loads multiple skill files + references. be smart about it:
- only load reference files you actually need (don't read all 5 design-review refs for a spacing fix)
- whimsical-design and world-build are short — low token cost, high impact
- web-animation-design has a PRACTICAL-TIPS.md supplement — load it when doing animation work, skip it otherwise
- if you're doing review-only, one skill file is all you need

## compounding

after every build or review, capture what worked and what didn't:
- new anti-patterns go in `skills/design-review/references/anti-patterns.md`
- project-specific decisions go in the project's `guidelines.md`
- animation patterns that landed well go in `skills/web-animation-design/PRACTICAL-TIPS.md`

the system gets smarter every time it's used. don't skip this step.
