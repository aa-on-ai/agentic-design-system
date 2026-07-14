const systemLayers = [
  {
    number: "01",
    title: "Frame the work",
    body: "Project identity, user intent, domain language, references, constraints, and the states that must survive.",
    source: "outcome-template.md · project-identity-template.md",
  },
  {
    number: "02",
    title: "Route the disciplines",
    body: "Layout, type, color, spacing, responsive behavior, accessibility, interaction, motion, writing, and agent experience.",
    source: "skills/ · references/ · presets/",
  },
  {
    number: "03",
    title: "Capture what rendered",
    body: "Screenshots, axe, overflow, font and color facts, touch targets, and state presence from the live DOM.",
    source: "capture.mjs · evidence.json",
  },
  {
    number: "04",
    title: "Separate build from judgment",
    body: "A grader reviews the evidence, returns a bounded verdict, and sends the builder back through the loop when needed.",
    source: "grader-report-template.md · run-report-template.md",
  },
];

export function SystemSection() {
  return (
    <section id="system" className="system-section" aria-labelledby="system-title">
      <div className="system-heading">
        <p className="section-kicker">The portable system</p>
        <h2 id="system-title">Design disciplines, one evidence loop.</h2>
        <p>
          ADS is not a universal taste score. It gives agents enough design language to work
          across the stack, then makes the result inspectable by someone with judgment.
        </p>
      </div>

      <div className="system-index">
        {systemLayers.map((layer) => (
          <article key={layer.number}>
            <span>{layer.number}</span>
            <h3>{layer.title}</h3>
            <p>{layer.body}</p>
            <code>{layer.source}</code>
          </article>
        ))}
      </div>
    </section>
  );
}
