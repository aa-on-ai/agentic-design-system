# phase 2 — control plane + evidence

the v1 release proved the loop works. v1.1 makes the work legible.

## thesis

agents already have generators. what they're missing is a control plane: a rubric the agent can grade itself against, an audit trail a human can read, and a project-identity layer the loop can compound into. this release ships that layer — and backs it with case-study evidence, not just a scoreboard.

## what ships

| piece | state | purpose |
|---|---|---|
| `EXPLAINABILITY.md` | new | the "why a run scored what it scored" narrative |
| `templates/project-identity-template.md` | new | opinionated, fillable identity file — replaces blank-comment template |
| `templates/run-report-template.md` | new | artifact agents emit after every run |
| `presets/{editorial,saas,utility}.md` | new | 3 starting points so identity isn't a cold start |
| `examples/case-studies/` | new | canopy / pawprint / notion-ai-settings with rule hits, rubric, commentary |
| `testing/eval-loop.ts` | updated | writes `report.md` next to `scores.json`; generator/judge models configurable via CLI |
| `testing/prompts.json` | expanded | 3 → 6 prompts across landing / dashboard / settings / data table / onboarding / pricing |
| `README.md` | rewritten | leads with governance, not generation |
| `templates/brand-guidelines-template.md` | deprecated bridge | kept with redirect to project-identity; no hard delete |

## what is intentionally deferred

- no new skills (creative pack stays at 3)
- no hosted playground / web UI
- no v0-style generator lane
- no clawbotomy / behavioral tests (still roadmap in `testing/TESTING.md`)
- no A2UI / NLWeb integration work (specs too early)
- no automatic screenshot capture in CI — the `demos/` next app is still the manual render path; only canopy has before/after routes committed, pawprint and notion-ai-settings remain scored-only pending render

## release check

a v1.1 cut is ready when:

1. every case study cites exact rule hits from `testing/results/summary.json`
2. `testing/eval-loop.ts --dry-run` passes
3. `testing/eval-loop.ts` writes `report.md` alongside `scores.json`
4. `ci/design-eval.py` still exits 0 against the committed demos
5. README links resolve (no 404 on relative paths)
6. `brand-guidelines-template.md` has a deprecation banner and the new template exists
