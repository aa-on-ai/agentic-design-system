const baselineCards = [
  { title: "Audience", body: "Who's reading this UI and what they came to do." },
  { title: "Domain", body: "Domain nouns, core workflows, hard constraints." },
  { title: "States", body: "Loading · empty · error · focus · mobile." },
  { title: "References", body: "Screenshots or sites that matter — optional." },
];

export function FoundationSections() {
  return (
    <>
      <IntentSection />
      <BaselineSection />
      <RubricSection />
    </>
  );
}

function IntentSection() {
  return (
    <section id="loop" className="loop-section loop-section--intent">
      <div className="loop-inner">
        <p className="loop-eyebrow">01</p>
        <h2 className="loop-heading">intent.</h2>
        <p className="loop-desc">
          Name what the user is doing, what the UI must make obvious, and the operational state
          the screen has to create. The builder fills this before generating anything.
        </p>
        <pre
          className="loop-snippet loop-snippet--big"
          tabIndex={0}
          aria-label="Outcome template example"
        >
          <span className="loop-snippet-head">templates/outcome-template.md</span>
          <span className="loop-snippet-line">- accomplish:    what the user needs to do</span>
          <span className="loop-snippet-line">- notice:        what the UI must make obvious first</span>
          <span className="loop-snippet-line">- feel:          confident / calm / oriented / safe</span>
          <span className="loop-snippet-line"> </span>
          <span className="loop-snippet-line">alignment check: notice → feel → accomplish</span>
        </pre>
      </div>
    </section>
  );
}

function BaselineSection() {
  return (
    <section className="loop-section loop-section--baseline">
      <div className="loop-inner">
        <p className="loop-eyebrow">02</p>
        <h2 className="loop-heading">baseline.</h2>
        <p className="loop-desc">
          What the agent reads before writing anything. Project context, hard constraints, and
          the states that must be in scope. A visual reference is optional and only when it
          actually matters.
        </p>
        <div className="baseline-grid">
          {baselineCards.map((card) => (
            <article key={card.title} className="baseline-card">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
        <p className="loop-foot-line">
          <code>templates/project-identity-template.md</code> · <code>presets/</code> ·{" "}
          <code>reference-intake-contract.md</code>
        </p>
      </div>
    </section>
  );
}

function RubricSection() {
  return (
    <section className="loop-section loop-section--rubric">
      <div className="loop-inner">
        <p className="loop-eyebrow">03</p>
        <h2 className="loop-heading">rubric.</h2>
        <p className="loop-desc">
          Define what good means for <em>this specific task</em> before the agent builds. The
          task-specific criteria do most of the work. The default quality lens is the floor,
          not the whole judgment.
        </p>
        <div className="rubric-card">
          <div className="rubric-block rubric-block--task">
            <p className="rubric-block-label">task-specific criteria</p>
            <ul className="rubric-list">
              <li><span className="rubric-bullet" aria-hidden="true">·</span>What does &ldquo;done&rdquo; mean for this screen?</li>
              <li><span className="rubric-bullet" aria-hidden="true">·</span>What must the user be able to do, decide, or trust?</li>
              <li><span className="rubric-bullet" aria-hidden="true">·</span>What would make this fail even if all the boxes checked?</li>
            </ul>
            <p className="rubric-block-source">written in <code>outcome-template.md</code></p>
          </div>
          <div className="rubric-divider" aria-hidden="true" />
          <div className="rubric-block rubric-block--default">
            <p className="rubric-block-label">+ default quality lens (floor)</p>
            <ul className="rubric-weights">
              <li><span>Design Quality</span><span>35%</span></li>
              <li><span>Originality</span><span>30%</span></li>
              <li><span>Craft</span><span>20%</span></li>
              <li><span>Functionality</span><span>15%</span></li>
            </ul>
            <p className="rubric-block-source">in <code>grader-report-template.md</code></p>
          </div>
        </div>
      </div>
    </section>
  );
}
