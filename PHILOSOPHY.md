# philosophy

## the problem

agents build UI like students who studied the textbook but never shipped anything. technically correct, visually safe, aggressively mediocre. they regurgitate the median of their training data: rounded corners, blue buttons, cards in a grid, "welcome to your dashboard."

the deeper problem isn't that it's boring. it's that nobody asked who the screen is for. a screen can look finished, pass a linter, and still not help the person using it. that's zombie UI, and it's what most AI design slop actually is.

more rules don't fix this on their own. neither does more freedom. what fixes it is a practice.

## the practice

ADS gives your agent one loop:

```text
understand → choose → work → prove → decide
```

**understand.** start with who it's for and what they need to get done, then the exact screen being changed and what must stay. a brief that skips the user is the first sign of slop.

**choose.** decide whether this is exploring a real open question, building an agreed change, or reviewing what exists. load only the guidance the task needs.

**work.** build in your product, with your components and tokens. extending what's there is not permission to replace it.

**prove.** check the real rendered result, not the source and not one pretty screenshot: states, breakpoints, accessibility, interaction. "looks good" is not evidence.

**decide.** say plainly what's `ready`, what `needs repair`, what's `blocked`, and what still needs a human's judgment.

## floor, guided, open

good creative work comes from constraint plus permission. ADS works in three layers:

**floor.** accessibility, your product's tokens, components and type ramp, and the states real users hit. this isn't up for debate. you meet it or the work isn't ready.

**guided.** layout, hierarchy, component use. ADS has opinions here, including fallback taste for projects without their own. your project's established decisions win; where they disagree with ADS, ADS says so instead of overriding you.

**open.** visual direction and new interaction ideas, when the brief actually earns them. most product work is utility work and should stay calm. expressive work is for marketing, editorial, launch, or when you ask for it.

## explore when it's actually open

the old model: designer has vision, hands spec to engineers, engineers build it exactly.

the new model: a human sets intent and constraints, the agent does the work, and the human steers. when a direction is genuinely unresolved, the agent brings a recommendation and the fewest real alternatives that settle it, often just one more, not a pile of variations (unless you ask for a specific number). when it isn't, it just builds. not every button needs options. "this could go a couple of ways, want to see both or should I pick?" is a cheap question that saves expensive rework.

## agents are the primary reader

ADS is written for how agents read, not how humans browse. frontmatter for routing, progressive disclosure so agents don't burn context on irrelevant references, clear triggers for when to load what.

humans set the direction. agents follow the practice. like installing an OS vs running apps on it.

## learning on purpose

static design systems decay. so do systems that rewrite themselves after every build.

ADS keeps lessons deliberate. a repeated, measurable defect gets fixed where it lives, in a shared component or a test. a preference goes to whoever owns it, usually your project's `DESIGN.md`, with the evidence behind it and a person agreeing it's worth keeping. nothing becomes a universal rule just because it happened once.

## the human is in the loop

ADS assumes someone is steering: setting intent, defining what must stay, and making the taste call. Ember, the evidence-reading companion, helps you read what was checked and what still needs your judgment. it doesn't make that judgment for you.

the goal isn't to remove the human. it's to make the collaboration good enough that you want to stay in it, because you keep seeing things you wouldn't have caught alone.

## in short

- start with who it's for.
- build in your product, not a template.
- prove it in the browser, not in the source.
- your project's decisions beat ADS's defaults. conflicts get reported, not forced.
- explore only when the direction is really open.
- keep lessons on purpose, with evidence.
- the human makes the taste call.
