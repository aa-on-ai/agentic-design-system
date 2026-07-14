const verdictCards = [
  { tag: "satisfied", tone: "ok", body: "Ships. The evidence cleared the rubric." },
  {
    tag: "needs_revision",
    tone: "warn",
    body: "Builder iterates against the grader's note. Regrades.",
  },
  { tag: "max_iterations", tone: "stop", body: "Stops out. Escalate to a human reviewer." },
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
          aria-label="Design verification command and run report example"
        >
          <span className="loop-snippet-head">checks against the file the agent wrote</span>
          <span className="loop-snippet-line loop-snippet-line--cmd">$ python3 anti-pattern-check.py App.tsx</span>
          <span className="loop-snippet-line loop-snippet-line--pass">  PASS  state-check</span>
          <span className="loop-snippet-line loop-snippet-line--pass">  PASS  accessibility-check</span>
          <span className="loop-snippet-line"> </span>
          <span className="loop-snippet-line loop-snippet-line--field">- files:        list of paths changed</span>
          <span className="loop-snippet-line loop-snippet-line--field">- screenshots:  desktop + mobile attached</span>
          <span className="loop-snippet-line loop-snippet-line--field">- score:        judge total / 50</span>
        </pre>
        <p className="loop-foot-line">
          <code>templates/run-report-template.md</code> · <code>skills/design-review/scripts/</code>
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
          A separate pass scores the evidence against the rubric. Three verdicts. The builder
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
