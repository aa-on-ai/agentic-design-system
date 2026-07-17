# Decision provenance

Use this for substantial UI runs when a reviewer needs to know why consequential elements exist, which exact rule governed them, and what evidence cleared them. Skip it for copy-only changes, tiny mechanical fixes, and routine polish unless provenance is explicitly required.

## Performance contract

Provenance adds two deterministic local commands and no extra agent, model, browser, or network calls:

1. capture hashes once after routing and before the build;
2. verify and enrich the report once after the final evidence exists.

Do not trace every CSS property or repeat capture inside the revision loop. Record 3–7 consequential decisions that survived into the final artifact. Both commands default to a 250ms budget and fail when they exceed it.

## 1. Capture the pre-run manifest

Record files already loaded as `--observed`. Record selected files that were not actually loaded as `--declared`; they remain honest context but cannot support a verified causal claim.

```bash
node skills/agentic-design-system/scripts/decision-trace.mjs capture \
  --out evidence/<slug>/skill-manifest.json \
  --observed skills/agentic-design-system/SKILL.md \
  --observed skills/design-review/SKILL.md \
  --source DESIGN.md \
  --budget-ms 250
```

The manifest stores exact file hashes, observed/declared status, source hashes, and measured overhead. It does not call a model or browser.

## 2. Build and verify normally

Run the existing ADS workflow. Capture rendered states and revise until the normal evidence gates clear. Do not add provenance work to each iteration.

## 3. Write the final decision trace

Create `evidence/<slug>/decision-trace.json` after the artifact stabilizes:

```json
{
  "schemaVersion": 1,
  "runId": "<slug>",
  "manifestPath": "evidence/<slug>/skill-manifest.json",
  "manifestSha256": "<sha256 of the exact manifest bytes>",
  "decisions": [
    {
      "id": "stable-decision-id",
      "decision": "What the artifact does and why.",
      "artifact": { "path": "app/page.tsx", "location": "Orders filters" },
      "rule": {
        "fileId": "<skill file id from the manifest>",
        "excerpt": "Exact excerpt from that captured file.",
        "excerptSha256": "<sha256 of the exact excerpt>"
      },
      "sourceConstraint": {
        "sourceId": "<source file id from the manifest>",
        "excerpt": "Exact source-of-truth constraint.",
        "excerptSha256": "<sha256 of the exact excerpt>"
      },
      "evidence": [
        { "type": "rendered gate", "path": "evidence/<slug>/evidence.json" },
        { "type": "screenshot", "path": "evidence/<slug>/default-390x844.png" }
      ],
      "reviewStatus": "verified"
    }
  ]
}
```

Use `draft`, `reviewed`, `verified`, or `rejected`. A `verified` row must point to an observed skill file and at least one existing evidence artifact.

## 4. Verify once and enrich the run report

```bash
node skills/agentic-design-system/scripts/decision-trace.mjs verify \
  --manifest evidence/<slug>/skill-manifest.json \
  --trace evidence/<slug>/decision-trace.json \
  --validation evidence/<slug>/decision-trace-validation.json \
  --report RUN-REPORT.md \
  --budget-ms 250
```

Verification rejects changed files, invented excerpts, declared-only causal claims, missing artifacts, missing evidence, and budget overruns. The report block is marker-managed and idempotent.

## Stop condition

Stop when the trace verifies, the report contains the managed decision-provenance block, and measured deterministic overhead stays within budget. If runtime hooks cannot prove a file was loaded, label it `declared`; do not upgrade the claim after the fact.
