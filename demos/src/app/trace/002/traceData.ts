import grade from "../../../../../testing/regression/adjacent-actions-v1.3.1/runs/2026-07-20-public-hardening/pawprint/grade.json";
import run from "../../../../../testing/regression/adjacent-actions-v1.3.1/runs/2026-07-20-public-hardening/run.json";
import suite from "../../../../../testing/regression/adjacent-actions-v1.3.1/suite.json";

const releaseSha = suite.baselineRelease.sha;
const rerunSha = "7644d39ac371320b8f8ca712ce08c1396ff06f53";
const repo = "https://github.com/aa-on-ai/agentic-design-system";
const frozenRoot = `${repo}/blob/${releaseSha}/testing/regression/adjacent-actions-v1.3.1/baseline/pawprint`;
const rerunRoot = `${repo}/blob/${rerunSha}/testing/regression/adjacent-actions-v1.3.1/runs/2026-07-20-public-hardening`;

export const TRACE = {
  schemaVersion: 1,
  traceId: "002",
  title: "Pawprint adjacent-action repair",
  status: grade.verdict,
  release: {
    tag: suite.baselineRelease.tag,
    sha: releaseSha,
  },
  rerun: {
    id: run.runId,
    packetCommit: rerunSha,
    behaviorCommit: run.behaviorCommit,
    behaviorDigest: run.behaviorDigest,
  },
  finding: {
    id: grade.priorFindingClosure.id,
    category: "cues_affordances",
    severity: "major",
    state: "error",
    problem: "The schedule was read-only while New walk still looked available.",
  },
  repair: {
    restrictedAction: "New walk",
    restrictedState: "Read-only schedule",
    semantics: "native disabled button",
    desktopLabel: "New walk unavailable",
  },
  preserved: {
    action: "Retry now",
    semantics: "enabled button",
    unaffectedPairs: 6,
  },
  evidence: {
    screenshots: 8,
    states: suite.states,
    breakpoints: suite.breakpoints.map(({ name }) => name),
    seriousOrCriticalAxeViolations: 0,
    horizontalOverflow: false,
    touchTargetsUnder44: 0,
    maxCumulativeLayoutShift: 0,
    originalRepairDelta: {
      desktopErrorPct: 0.77,
      mobileErrorPct: 0.011,
    },
    publicRerunPerceptualDeltaPct: 0,
    artifactSha256: "67ba4414157f9e69665ae392803a474204a657124a08bf96932797ac023751d3",
    evidenceSha256: "cf42b2d951ce0047d03ea68ca5470c565f3feb3b3f66b4118de5deb1e2d9b414",
  },
  grade: {
    verdict: grade.verdict,
    weightedScore: grade.weightedScore,
    scores: grade.scores,
    findings: grade.findings,
    closure: grade.priorFindingClosure.evidence,
  },
  receipts: {
    outcome: `${frozenRoot}/outcome.md`,
    artifact: `${frozenRoot}/artifact/index.html`,
    builderReport: `${frozenRoot}/builder-report.md`,
    graderReport: `${frozenRoot}/grader-report.md`,
    grade: `${frozenRoot}/grade.json`,
    evidence: `${frozenRoot}/rendered/evidence.json`,
    frozenContract: `${repo}/blob/${releaseSha}/testing/regression/adjacent-actions-v1.3.1/contract.md`,
    rerunPacket: `${rerunRoot}/run.json`,
    rerunEvidence: `${rerunRoot}/pawprint/rendered/evidence.json`,
    traceOne: "/trace",
  },
} as const;
