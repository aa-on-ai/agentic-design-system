const decisions = [
  {
    step: "Intent",
    title: "Land the product in five seconds.",
    body: "The first viewport now shows the actual UI, the iterations, and the verdict instead of asking the reader to decode a system diagram.",
  },
  {
    step: "Baseline",
    title: "Break the centered explainer.",
    body: "The previous page repeated one centered rhythm for every section. This version uses one asymmetric spine and lets the evidence carry visual weight.",
  },
  {
    step: "Rubric",
    title: "Real artifacts. One clear story. No unsupported claims.",
    body: "The page must stay legible on mobile, expose agent-readable structure, and distinguish current proof from future ambition.",
  },
  {
    step: "Evidence",
    title: "Review the rendered page, not the JSX.",
    body: "Light and dark screenshots, overflow, touch targets, accessibility, and build output become the receipt for this site too.",
  },
  {
    step: "Grader",
    title: "The human still makes the call.",
    body: "A clean local run makes this reviewable. It does not make the broader portability claim true, and it does not authorize a deploy.",
  },
];

export function SpecimenSection() {
  return (
    <section className="specimen-section" aria-labelledby="specimen-title">
      <div className="specimen-intro">
        <p className="section-kicker">Living specimen / ADS-001</p>
        <h2 id="specimen-title">This page is under review too.</h2>
        <p>
          The site should not merely describe the system. It should expose the design decisions
          the system asked for and the evidence needed to clear them.
        </p>
        <div className="specimen-status" role="status">
          <span aria-hidden="true" />
          Local verdict: reviewable
        </div>
      </div>

      <ol className="specimen-decisions">
        {decisions.map((decision, index) => (
          <li key={decision.step}>
            <span className="specimen-index">0{index + 1}</span>
            <div>
              <p>{decision.step}</p>
              <h3>{decision.title}</h3>
              <span>{decision.body}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
