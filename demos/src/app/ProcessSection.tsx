const process = [
  {
    step: "01",
    label: "Intent",
    title: "Keep Orders usable on a phone without hiding customer context.",
    evidence: "Outcome locked before generation",
  },
  {
    step: "02",
    label: "Baseline",
    title: "Capture the real screen in four states at three breakpoints.",
    evidence: "12 rendered snapshots per pass",
  },
  {
    step: "03",
    label: "Critique",
    title: "The first plausible-looking build still failed the interaction floor.",
    evidence: "12 axe · 114 touch-target misses",
  },
  {
    step: "04",
    label: "Revision",
    title: "Repair what the browser found, then capture the whole surface again.",
    evidence: "114 → 12 → 0 touch misses",
  },
  {
    step: "05",
    label: "Verdict",
    title: "Ship only after the rendered evidence clears every hard gate.",
    evidence: "satisfied · 0 axe · 0 overflow",
  },
];

export function ProcessSection() {
  return (
    <section id="run" className="process-section" aria-labelledby="process-title">
      <div className="process-intro">
        <p className="section-kicker">One run / three passes</p>
        <h2 id="process-title">A visible decision trail, not a better final message.</h2>
        <p>
          Source checks can suggest what might be wrong. ADS gates on what actually rendered,
          then hands the evidence to a separate grader or a human.
        </p>
        <a href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/loop-demo/RUN-REPORT.md">
          Read the complete run report <span aria-hidden="true">↗</span>
        </a>
      </div>

      <ol className="process-rail">
        {process.map((item) => (
          <li key={item.step}>
            <span className="process-step">{item.step}</span>
            <div className="process-copy">
              <p>{item.label}</p>
              <h3>{item.title}</h3>
            </div>
            <span className="process-evidence">{item.evidence}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
