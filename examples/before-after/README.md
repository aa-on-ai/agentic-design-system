# before / after

rendered before/after pages live in the `demos/` next.js app, not in this folder.

- `/before/<slug>` — generator run with no skills loaded
- `/after/<slug>` — same generator, same prompt, core pack loaded

to render locally:

```bash
cd demos
npm install
npm run dev
```

committed in v1.1:

- `/before/canopy` · `/after/canopy`

pawprint and notion-ai-settings exist as scored runs in `testing/results/` but the rendered routes have not been committed — see [`../case-studies/`](../case-studies/) for the numbers and [`../../PHASE-2.md`](../../PHASE-2.md) for the scope cut.

narrative case studies — rule hits, rubric scores, what the loop caught — are in [`../case-studies/`](../case-studies/).
