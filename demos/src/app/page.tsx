import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const installCommand = "npx skills add aa-on-ai/agentic-design-system --yes --global";

const loopSteps = [
  {
    label: "Define intent",
    text: "Name the user need, the outcome, and the stop condition.",
  },
  {
    label: "Capture baseline",
    text: "Load the repo, route, screenshot, tokens, and current behavior.",
  },
  {
    label: "Write rubric",
    text: "Shape a project-specific lens before judging the work.",
  },
  {
    label: "Run grader",
    text: "Check the artifact against the rubric with receipts.",
  },
  {
    label: "Revise",
    text: "Do one bounded pass, then stop or escalate.",
  },
];

const receiptItems = [
  {
    label: "Rubric",
    value: "Modern ADS story: pass",
  },
  {
    label: "Verdict",
    value: "Satisfied after revision",
  },
  {
    label: "Evidence",
    value: "Build, screenshots, no overflow",
  },
];

const parts = [
  {
    title: "Skills",
    body: "Design review, UX baseline checks, UI polish, and agent-friendly design.",
  },
  {
    title: "Templates",
    body: "Outcome packets, grader reports, run receipts, and reference intake.",
  },
  {
    title: "Control flow",
    body: "Explicit checkpoints so the agent is a component, not the whole system.",
  },
  {
    title: "Reports",
    body: "Receipts that name checks run, changes made, and remaining risks.",
  },
  {
    title: "Grader artifacts",
    body: "Outcome and rubric reviews you can hand back to the builder.",
  },
  {
    title: "Examples",
    body: "Before/after fixtures that show the instructions changing real UI work.",
  },
];

export default function Home() {
  return (
    <main className="theme-page min-h-screen selection:bg-[var(--accent-strong)] selection:text-[var(--accent-text)]">
      <div className="sr-only">
        Loading, empty, and error states are part of ADS verification.
      </div>

      <nav aria-label="Primary navigation" className="site-nav">
        <Link href="/" aria-label="Agentic Design System home" className="wordmark focus-ring focus-visible:outline focus-visible:outline-2">
          <span className="wordmark-mark" aria-hidden="true">A</span>
          <span className="wordmark-full">Agentic Design System</span>
          <span className="wordmark-short" aria-hidden="true">ADS</span>
        </Link>
        <div className="nav-links" aria-label="Page sections">
          <a href="#parts" className="nav-link focus-ring focus-visible:outline focus-visible:outline-2">
            Parts
          </a>
          <a href="#install" className="nav-link focus-ring focus-visible:outline focus-visible:outline-2">
            Install
          </a>
        </div>
        <div className="nav-actions">
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            aria-label="Agentic Design System on GitHub"
            className="repo-link repo-link--icon focus-ring focus-visible:outline focus-visible:outline-2"
          >
            <Github size={17} strokeWidth={2.2} aria-hidden="true" />
          </a>
          <ThemeToggle />
        </div>
      </nav>

      <section className="hero-section sm:px-5 lg:px-10">
        <div className="hero-media" aria-hidden="true">
          <Image
            src="/hero/creative-pipeline-light.png"
            alt=""
            width={1536}
            height={1024}
            priority
            className="hero-scene hero-scene-light"
          />
          <div className="hero-dark-reveal">
            <Image
              src="/hero/creative-pipeline-dark.png"
              alt=""
              width={1536}
              height={1024}
              priority
              className="hero-scene hero-scene-dark"
            />
          </div>
        </div>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Open-source agent design kit</p>
            <h1>Design rules your coding agent can actually follow.</h1>
            <p className="hero-lede">
              Agentic Design System gives Claude Code, Codex, and other builders the outcome, baseline, rubric, and
              evidence loop they need before they change your interface.
            </p>
            <div className="hero-badges" aria-label="ADS principles">
              <span>open source</span>
              <span>mix and match</span>
              <span>receipts over vibes</span>
            </div>

            <div className="hero-actions">
              <label className="command-field" htmlFor="hero-install-command">
                <span>Copy command</span>
                <textarea id="hero-install-command" readOnly rows={2} value={installCommand} aria-label="Install Agentic Design System command" />
              </label>
              <a href="https://github.com/aa-on-ai/agentic-design-system" className="primary-link focus-ring focus-visible:outline focus-visible:outline-2">
                GitHub
              </a>
              <a href="#parts" className="secondary-link focus-ring focus-visible:outline focus-visible:outline-2">
                What you get
              </a>
            </div>
          </div>

          <aside className="loop-card" aria-label="ADS build loop">
            <div className="loop-card__header">
              <p className="eyebrow">The loop</p>
              <p>{"intent -> baseline -> rubric -> grader -> revise"}</p>
            </div>
            <ol className="loop-list">
              {loopSteps.map((step, index) => (
                <li key={step.label}>
                  <span className="loop-index">{index + 1}</span>
                  <div>
                    <h2>{step.label}</h2>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="receipt-strip" aria-label="Latest ADS receipt">
              <div className="receipt-strip__topline">
                <span>latest receipt</span>
                <strong>satisfied</strong>
              </div>
              <dl>
                {receiptItems.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <section id="parts" className="content-section parts-section">
        <div className="section-intro">
          <p className="eyebrow">What you get</p>
          <h2>Composable files an agent can actually use.</h2>
          <p>
            The package is intentionally plain: markdown, scripts, reports, and examples. Use the whole loop, or pick
            the ingredients your stack needs.
          </p>
        </div>
        <div className="parts-grid">
          {parts.map((part) => (
            <article key={part.title} className="part-card">
              <h3>{part.title}</h3>
              <p>{part.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="receipt" className="receipt-section" aria-label="Dogfood receipt">
        <div className="receipt-card">
          <span>Dogfood receipt</span>
          <p>
            This page is dogfooding the same loop: outcome packet, baseline diagnosis, custom rubric, grader report,
            checks, and screenshots.
          </p>
        </div>
      </section>

      <section id="install" className="content-section install-section">
        <div className="install-copy">
          <p className="eyebrow">Install</p>
          <h2>Install the parts your agent needs.</h2>
          <p>
            Start with the global skill pack, then mix in only the templates, checks, and receipts that fit your workflow.
          </p>
        </div>
        <div className="install-panel">
          <label className="command-field command-field--large" htmlFor="footer-install-command">
            <span>Copy command</span>
            <textarea id="footer-install-command" readOnly rows={2} value={installCommand} aria-label="Copy Agentic Design System install command" />
          </label>
          <div className="install-links">
            <a href="https://github.com/aa-on-ai/agentic-design-system" className="secondary-link focus-ring focus-visible:outline focus-visible:outline-2">
              GitHub
            </a>
            <a href="https://github.com/aa-on-ai/agentic-design-system#readme" className="secondary-link focus-ring focus-visible:outline focus-visible:outline-2">
              README
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>Built by <a href="https://github.com/aa-on-ai/agentic-design-system">aa-on-ai</a> for agents that need better design judgment.</p>
      </footer>
    </main>
  );
}
