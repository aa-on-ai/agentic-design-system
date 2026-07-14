const verdictCards = [
  { tag: "satisfied", tone: "ok", body: "Ships. The evidence cleared the rubric." },
  {
    tag: "needs_revision",
    tone: "warn",
    body: "A fixable miss with budget left. Builder revises and regrades.",
  },
  {
    tag: "max_iterations",
    tone: "stop",
    body: "The revision budget is exhausted. Return the evidence for human judgment.",
  },
  {
    tag: "failed",
    tone: "fail",
    body: "The direction or run failed. Stop and do not ship it.",
  },
];

export function DecisionSections() {
  return (
    <>
      <EvidenceSection />
      <GraderSection />
    </>
  );
}

function EvidenceSection() {
  return (
    <section className="loop-section loop-section--evidence">
      <div className="loop-inner">
        <p className="loop-eyebrow">04</p>
        <h2 className="loop-heading">evidence.</h2>
        <p className="loop-desc">
          Receipts, not promises. Files changed, checks run, screenshots, run report fields.
          The agent attaches the artifacts before saying &ldquo;done.&rdquo;
        </p>
        <pre
          className="loop-snippet loop-snippet--big loop-snippet--terminal"
          tabIndex={0}
          aria-label="Advisory source preflight and rendered evidence report example"
        >
          <span className="loop-snippet-head">source preflight · advisory / gameable</span>
          <span className="loop-snippet-line loop-snippet-line--cmd">$ python3 ci/design-eval.py --files App.tsx</span>
          <span className="loop-snippet-line loop-snippet-line--field">  CHECK  anti-pattern · state · accessibility</span>
          <span className="loop-snippet-line loop-snippet-line--field">  LIMIT  source grep can pass on comments</span>
          <span className="loop-snippet-line loop-snippet-line--field">  GATE   none — rendered capture decides</span>
          <span className="loop-snippet-line"> </span>
          <span className="loop-snippet-line loop-snippet-line--field">- files:        list of paths changed</span>
          <span className="loop-snippet-line loop-snippet-line--field">- screenshots:  desktop + mobile attached</span>
          <span className="loop-snippet-line loop-snippet-line--field">- score:        judge total / 50</span>
        </pre>
        <p className="loop-foot-line">
          source checks catch cheap misses · <code>capture.mjs</code> + grader produce the verdict
        </p>
      </div>
    </section>
  );
}

function GraderSection() {
  return (
    <section className="loop-section loop-section--grader">
      <div className="loop-inner">
        <p className="loop-eyebrow">05</p>
        <h2 className="loop-heading">grader / revision.</h2>
        <p className="loop-desc">
          A separate pass scores the evidence against the rubric. Four verdicts. The builder
          does not ship on its own &mdash; the grader (or you) decides.
        </p>
        <div className="verdict-grid">
          {verdictCards.map((verdict) => (
            <article key={verdict.tag} className={`verdict-card verdict-card--${verdict.tone}`}>
              <span className="verdict-tag">{verdict.tag}</span>
              <p>{verdict.body}</p>
            </article>
          ))}
        </div>
        <p className="loop-foot-line">
          <code>templates/grader-report-template.md</code>
        </p>
      </div>
    </section>
  );
}
