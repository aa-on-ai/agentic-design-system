import Image from "next/image";
import { Github } from "lucide-react";
import { InstallCommand } from "./InstallCommand";
import { ThemeToggle } from "./ThemeToggle";

const baselineCards = [
  { title: "Audience", body: "Who's reading this UI and what they came to do." },
  { title: "Domain", body: "Domain nouns, core workflows, hard constraints." },
  { title: "States", body: "Loading · empty · error · focus · mobile." },
  { title: "References", body: "Screenshots or sites that matter — optional." },
];

const verdictCards = [
  {
    tag: "satisfied",
    tone: "ok",
    body: "Ships. The evidence cleared the rubric.",
  },
  {
    tag: "needs_revision",
    tone: "warn",
    body: "Builder iterates against the grader's note. Regrades.",
  },
  {
    tag: "max_iterations",
    tone: "stop",
    body: "Stops out. Escalate to a human reviewer.",
  },
];

export default function Home() {
  return (
    <main className="theme-page min-h-screen selection:bg-[var(--accent-strong)] selection:text-[var(--accent-text)]">
      <div className="sr-only">
        Loading, empty, and error states are part of the agentic design system verification scripts.
      </div>

      <section className="hero-section">
        <div className="hero-card">
          <div className="hero-media" aria-hidden="true">
            <Image
              src="/hero/creative-pipeline-light.png"
              alt=""
              width={1536}
              height={1024}
              priority
              className="hero-image hero-image-light"
            />
            <Image
              src="/hero/creative-pipeline-dark.png"
              alt=""
              width={1536}
              height={1024}
              priority
              className="hero-image hero-image-dark"
            />
          </div>
          <div className="hero-scrim" aria-hidden="true" />

          <div className="hero-toolbar">
            <a
              href="https://github.com/aa-on-ai/agentic-design-system"
              aria-label="Agentic Design System on GitHub"
              className="hero-pill hero-pill--icon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Github size={17} strokeWidth={2.2} aria-hidden="true" />
            </a>
            <ThemeToggle />
          </div>

          <div className="hero-card-inner">
            <span className="hero-wordmark" aria-label="Agentic Design System">
              Agentic Design System
            </span>
            <h1>An open-source design kit your coding agent can borrow.</h1>
            <p className="hero-lede">
              Design judgment is still yours. ADS is templates, skills, and checks your coding
              agent reads while it works on UI. Use the whole kit, or copy one useful piece.
            </p>

            <div className="hero-install" role="group" aria-label="Install command">
              <p className="hero-install-label">give this to your agent</p>
              <InstallCommand variant="strip" />
            </div>
          </div>
        </div>
      </section>

      <section id="loop" className="loop-section loop-section--intent">
        <div className="loop-inner">
          <p className="loop-eyebrow">01</p>
          <h2 className="loop-heading">intent.</h2>
          <p className="loop-desc">
            Name what the user is doing, what the UI must make obvious, and the operational state
            the screen has to create. The builder fills this before generating anything.
          </p>
          <pre className="loop-snippet loop-snippet--big">
            <span className="loop-snippet-head">templates/outcome-template.md</span>
            <span className="loop-snippet-line">- accomplish:    what the user needs to do</span>
            <span className="loop-snippet-line">- notice:        what the UI must make obvious first</span>
            <span className="loop-snippet-line">- feel:          confident / calm / oriented / safe</span>
            <span className="loop-snippet-line"> </span>
            <span className="loop-snippet-line">alignment check: notice → feel → accomplish</span>
          </pre>
        </div>
      </section>

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

      <section className="loop-section loop-section--evidence">
        <div className="loop-inner">
          <p className="loop-eyebrow">04</p>
          <h2 className="loop-heading">evidence.</h2>
          <p className="loop-desc">
            Receipts, not promises. Files changed, checks run, screenshots, run report fields.
            The agent attaches the artifacts before saying &ldquo;done.&rdquo;
          </p>
          <pre className="loop-snippet loop-snippet--big loop-snippet--terminal">
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

      <section className="loop-section loop-section--grader">
        <div className="loop-inner">
          <p className="loop-eyebrow">05</p>
          <h2 className="loop-heading">grader / revision.</h2>
          <p className="loop-desc">
            A separate pass scores the evidence against the rubric. Three verdicts. The builder
            does not ship on its own &mdash; the grader (or you) decides.
          </p>
          <div className="verdict-grid">
            {verdictCards.map((v) => (
              <article key={v.tag} className={`verdict-card verdict-card--${v.tone}`}>
                <span className="verdict-tag">{v.tag}</span>
                <p>{v.body}</p>
              </article>
            ))}
          </div>
          <p className="loop-foot-line">
            <code>templates/grader-report-template.md</code>
          </p>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <p className="eyebrow">Get started</p>
          <h2>See how it fits your setup.</h2>
          <p>
            The kit is plain markdown, scripts, and templates. Use the whole thing, or copy one
            useful piece into your repo. Open source, MIT.
          </p>
          <div className="cta-actions">
            <InstallCommand variant="strip" />
            <a
              href="https://github.com/aa-on-ai/agentic-design-system"
              className="cta-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Review on GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span className="site-footer-mark">Agentic Design System · 2026</span>
        <span className="site-footer-trust">
          <a href="https://github.com/aa-on-ai/agentic-design-system/blob/main/LICENSE">MIT</a>
          {" · "}
          <a href="https://github.com/aa-on-ai/agentic-design-system">GitHub</a>
        </span>
        <span className="site-footer-author">
          Built by{" "}
          <a
            href="https://github.com/aa-on-ai"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Aaron Thomas
          </a>
        </span>
      </footer>
    </main>
  );
}
