import { OrderScreenPreview } from "./OrderScreenPreview";

export type ArtifactStage = "intent" | "baseline" | "rubric" | "evidence" | "release";

const artifactMeta = {
  intent: { id: "input", label: "Input brief", file: "outcome.md", number: "01" },
  baseline: { id: "failed-check", label: "Failed check", file: "capture.mjs", number: "02" },
  rubric: { id: "corrected-screen", label: "Corrected screen", file: "candidate / orders", number: "03" },
  evidence: { id: "evidence-report", label: "Evidence report", file: "run-report.md", number: "04" },
  release: { id: "grader-verdict", label: "Grader verdict", file: "grader-report.md", number: "05" },
} as const;

function InputArtifact() {
  return (
    <div className="ads-outcome-sheet">
      <p className="ads-artifact-summary">Make delayed orders impossible to miss before dispatch closes.</p>
      <dl>
        <div><dt>User</dt><dd>Operations lead</dd></div>
        <div><dt>Must show</dt><dd>Loading · empty · error · 390px</dd></div>
        <div><dt>Stop when</dt><dd>Evidence + separate grader verdict</dd></div>
      </dl>
      <span className="ads-file-note">The agent now has a job it can fail.</span>
    </div>
  );
}

function FailedCheckArtifact() {
  return (
    <div className="ads-check-layout">
      <div>
        <p className="ads-artifact-summary">The first browser capture exposes objective failures.</p>
        <OrderScreenPreview state="failed" />
      </div>
      <ul className="ads-check-list" aria-label="Failed checks">
        <li><b>FAIL 01</b><span>Horizontal overflow +36px</span></li>
        <li><b>FAIL 02</b><span>Error state missing</span></li>
        <li className="ads-check-list-muted"><b>PASS</b><span>Heading order</span></li>
      </ul>
    </div>
  );
}

function CorrectedArtifact() {
  return (
    <div className="ads-corrected-layout">
      <p className="ads-artifact-summary">The coding agent repairs the actual screen against the brief.</p>
      <OrderScreenPreview state="fixed" />
      <div className="ads-repair-strip">
        <span><b>+ Priority</b> urgent orders lead</span>
        <span><b>+ States</b> loading / empty / error</span>
        <span><b>+ Mobile</b> overflow removed</span>
      </div>
    </div>
  );
}

function EvidenceArtifact() {
  return (
    <div className="ads-evidence-sheet">
      <p className="ads-artifact-summary">Rendered proof replaces “looks good.”</p>
      <div className="ads-viewport-strip" aria-label="Captured viewports">
        <span><i aria-hidden="true" /><b>390</b><small>mobile</small></span>
        <span><i aria-hidden="true" /><b>768</b><small>tablet</small></span>
        <span><i aria-hidden="true" /><b>1280</b><small>desktop</small></span>
      </div>
      <div className="ads-evidence-checks">
        <span><b>0</b> serious axe</span>
        <span><b>0</b> overflow</span>
        <span><b>0</b> small targets</span>
      </div>
      <p className="ads-evidence-path">evidence/homepage/default-390x844.png</p>
    </div>
  );
}

function VerdictArtifact() {
  return (
    <div className="ads-verdict-sheet">
      <p className="ads-artifact-summary">A separate critic can accept the evidence or send the screen back.</p>
      <div className="ads-verdict-main">
        <span>VERDICT</span>
        <strong>SATISFIED</strong>
        <small>Evidence matches the outcome.</small>
      </div>
      <div className="ads-score-row">
        <span>Quality <b>8.7</b></span>
        <span>Craft <b>9.1</b></span>
        <span>Function <b>9.0</b></span>
      </div>
      <p className="ads-verdict-note">Other outcome: NEEDS REVISION · human if unresolved</p>
    </div>
  );
}

export function AdsRunArtifact({ stage }: { stage: ArtifactStage }) {
  const meta = artifactMeta[stage];

  return (
    <article className={`ads-artifact ads-artifact--${stage}`} data-artifact={meta.id}>
      <header className="ads-artifact-header">
        <span className="ads-artifact-label">{meta.label}</span>
        <code>{meta.file}</code>
      </header>
      <div className="ads-artifact-body">
        {stage === "intent" && <InputArtifact />}
        {stage === "baseline" && <FailedCheckArtifact />}
        {stage === "rubric" && <CorrectedArtifact />}
        {stage === "evidence" && <EvidenceArtifact />}
        {stage === "release" && <VerdictArtifact />}
      </div>
      <footer className="ads-artifact-footer">
        <span>ADS run / orders-4821</span>
        <span>{meta.number} of 05</span>
      </footer>
    </article>
  );
}
