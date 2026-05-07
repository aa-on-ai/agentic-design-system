import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const installCommand = "npx skills add aa-on-ai/agentic-design-system --yes --global";

const loopSteps = [
  {
    label: "Define intent",
    text: "Turn the user need into an outcome, constraints, and a clear stop condition.",
  },
  {
    label: "Capture baseline",
    text: "Load the repo, screenshots, routes, tokens, and current product behavior.",
  },
  {
    label: "Write rubric",
    text: "Shape a custom review lens from the outcome, baseline, and local design context.",
  },
  {
    label: "Run grader",
    text: "Review the artifact against the rubric, with evidence instead of vibes.",
  },
  {
    label: "Revise",
    text: "Feed the grader result back into one bounded pass, then stop or escalate.",
  },
];

const parts = [
  {
    title: "Skills",
    body: "Routing for design review, UX baseline checks, UI polish, and agent-friendly design.",
  },
  {
    title: "Templates",
    body: "Project identity, outcome, grader report, run report, and reference-intake shapes.",
  },
  {
    title: "Routing",
    body: "A lightweight way to pick the right design instruction before the agent starts building.",
  },
  {
    title: "Reports",
    body: "Receipts that name checks run, changes made, and risks still worth human review.",
  },
  {
    title: "Grader artifacts",
    body: "Patterns for outcome and rubric review. Useful today, still being packaged into a tighter loop.",
  },
  {
    title: "Examples",
    body: "Before/after demos and fixtures that show how the instructions affect real UI prompts.",
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
            href="https://github.com/aa-on-ai/agentic-design-system#readme"
            className="repo-link focus-ring focus-visible:outline focus-visible:outline-2"
          >
            Docs
          </a>
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            className="repo-link focus-ring focus-visible:outline focus-visible:outline-2"
          >
            GitHub
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
          <Image
            src="/hero/creative-pipeline-dark.png"
            alt=""
            width={1536}
            height={1024}
            priority
            className="hero-scene hero-scene-dark"
          />
        </div>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Installable design instructions</p>
            <h1>Design context for agents that build UI.</h1>
            <p className="hero-lede">
              ADS is the skills, templates, and review artifacts an agent installs before it draws a screen, so UI work
              becomes an outcome-driven loop with a baseline, a custom rubric, and a grader.
            </p>

            <div className="hero-actions">
              <label className="command-field" htmlFor="hero-install-command">
                <span>Install command</span>
                <textarea id="hero-install-command" readOnly rows={2} value={installCommand} aria-label="Install Agentic Design System command" />
              </label>
              <a href="#install" className="primary-link focus-ring focus-visible:outline focus-visible:outline-2">
                Install
              </a>
              <a href="https://github.com/aa-on-ai/agentic-design-system#readme" className="secondary-link focus-ring focus-visible:outline focus-visible:outline-2">
                Docs
              </a>
            </div>
          </div>

          <aside className="loop-card" aria-label="ADS build loop">
            <div className="loop-card__header">
              <p className="eyebrow">The loop</p>
              <p>intent / baseline / rubric / grader / revise</p>
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
          </aside>
        </div>
      </section>

      <section id="parts" className="content-section parts-section">
        <div className="section-intro">
          <p className="eyebrow">What you get</p>
          <h2>Composable files an agent can actually use.</h2>
          <p>
            The package is intentionally plain: markdown instructions, templates, routing guidance, scripts, reports, and
            examples. Use the parts together, or steal the pieces that fit your stack.
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
            This page is dogfooding the ADS loop: outcome packet, baseline diagnosis, custom rubric, grader report,
            checks, and screenshots.
          </p>
        </div>
      </section>

      <section id="install" className="content-section install-section">
        <div className="install-copy">
          <p className="eyebrow">Install</p>
          <h2>Add ADS where your agent already works.</h2>
          <p>
            The explicit command skips the interactive selector and installs the six current skills globally.
            Custom rubric generation is still a dogfood pattern, not a fully packaged promise.
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
    </main>
  );
}
