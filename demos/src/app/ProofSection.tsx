export function ProofSection() {
  return (
    <section className="loop-section loop-section--proof">
      <div className="loop-inner">
        <p className="loop-eyebrow">the loop, executed</p>
        <h2 className="loop-heading">run it for real.</h2>
        <p className="loop-desc">
          The five steps aren&rsquo;t a diagram &mdash; they compile to a runnable workflow. An agent
          builds, a headless browser captures what actually renders, deterministic gates run on that
          evidence, and a <em>separate</em> grader judges the screenshots &mdash; not the source. The
          builder never signs off on its own work; it revises until the evidence clears.
        </p>
        <pre
          className="loop-snippet loop-snippet--big loop-snippet--terminal"
          tabIndex={0}
          aria-label="Orders screen rendered gate results across three iterations"
        >
          <span className="loop-snippet-head">orders screen · gated at 390 / 768 / 1280px · from evidence.json, not source</span>
          <span className="loop-snippet-line loop-snippet-line--cmd">iter1  build → capture → gate</span>
          <span className="loop-snippet-line loop-snippet-line--fail">  FAIL  12 axe · 114 touch targets &lt;44px        → needs_revision</span>
          <span className="loop-snippet-line loop-snippet-line--cmd">iter2  revise → re-capture → gate</span>
          <span className="loop-snippet-line loop-snippet-line--fail">  FAIL  touch 114 → 12 · axe still 12            → needs_revision</span>
          <span className="loop-snippet-line loop-snippet-line--cmd">iter3  revise → re-capture → gate</span>
          <span className="loop-snippet-line loop-snippet-line--pass">  axe 12 → 0 · touch 12 → 0 · overflow clean</span>
          <span className="loop-snippet-line loop-snippet-line--pass">  PASS  every gate clears at all 3 breakpoints   → satisfied</span>
          <span className="loop-snippet-line"> </span>
          <span className="loop-snippet-line loop-snippet-line--field">verdict: satisfied — three passes; ships only once the rendered evidence clears every gate</span>
        </pre>
        <p className="loop-desc">
          Because the gate reads rendered evidence, it can&rsquo;t be satisfied by a comment that
          says <code>{"// handles loading, empty, error"}</code>. It iterates against what actually
          renders and ships only when every gate clears &mdash; and if it can&rsquo;t close them, it
          returns <code>failed</code> rather than rubber-stamp. The difference between &ldquo;my agent
          got better&rdquo; and a receipt you can audit.
        </p>
        <p className="loop-foot-line">
          <code>workflows/new-page-component.mjs</code> · <code>docs/loop-demo/</code>
        </p>
      </div>
    </section>
  );
}
