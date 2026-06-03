# Workflow: cold-agent ADS usage test

The honest usability eval: can a brand-new agent, given only the repo, actually *use* ADS — find
the entrypoint, route to the right profile, and produce evidence — without being told how?

## When to use

After changing routing, the entrypoint, or discovery docs; before claiming "agents can just pick
this up"; periodically, to catch drift between what ADS says and what a cold agent does.

## Read first

For running the test: this file only. **Do not pre-read the rest of the repo** — the point is to
observe what a cold agent finds on its own.

## Run

1. **Open a fresh context** (a subagent or new session) with no priming beyond the repo and a
   realistic task, e.g. *"review this mobile settings screen"* or *"build a pricing page."*
2. **Observe its path, don't help it:**
   - Did it find the entrypoint ([`create-design-workflow.md`](./create-design-workflow.md)) or
     `AGENTS.md` / `ROUTING.md` on its own?
   - Did it route to the correct profile/workflow?
   - Did it run the right checks and produce a report with evidence?
   - Where did it stall, guess, or invent a step?
3. **Record the trace** verbatim — especially the first wrong turn.

## Evidence required

- The exact task given and the cold agent's step-by-step trace.
- The first point of failure: what it couldn't find or chose wrong, quoted.

## Output

A usability report grouped by failure type, each gap → a concrete doc fix:

- **discovery gaps** — couldn't find the entrypoint (→ fix README/AGENTS pointers).
- **routing gaps** — found it but picked the wrong profile (→ tighten ROUTING triggers/table).
- **evidence gaps** — did the work but produced no receipts (→ make the workflow's evidence step louder).

## Blocked when

You can't open an independent context to act as the cold agent — note that the test was not run
rather than imagining the result.

## Stop when

The trace and the prioritized fixes are recorded. **Do not conclude "a cold agent can use ADS"
from your own already-warm knowledge** — it only counts if an actually-cold context did it. If it
succeeded, say where it nearly went wrong anyway.
