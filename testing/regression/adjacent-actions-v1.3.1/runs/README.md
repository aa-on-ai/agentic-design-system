# Candidate runs

Candidate packets are append-only. CI rejects edits to the frozen baseline or a prior run.

After finalizing an ADS behavior change, scaffold a run:

```bash
npm run regression:prepare -- <yyyy-mm-dd-short-description>
```

Build each copied outcome using the changed ADS behavior. For every case, add:

- `artifact/index.html`
- `builder-report.md`
- `grader-report.md`
- `grade.json`
- `rendered/evidence.json`
- eight screenshots named by the evidence packet

Fill distinct `builderContext` and `graderContext` receipts in `run.json`, then verify:

```bash
npm run regression:frozen -- --candidate testing/regression/adjacent-actions-v1.3.1/runs/<run-id>
```

CI requires one newly added, passing run whenever a pull request changes ADS behavior paths.
