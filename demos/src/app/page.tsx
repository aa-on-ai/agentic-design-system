import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { InstallCommand } from "./InstallCommand";
import { ThemeToggle } from "./ThemeToggle";

const parts = [
  {
    title: "Presets",
    body: "Opinionated starters for utilitarian apps, dense dashboards, and editorial landing pages.",
  },
  {
    title: "Reference intake",
    body: "A contract for what to borrow, what to avoid, and how closely to follow a visual target.",
  },
  {
    title: "Design review",
    body: "Checks for weak hierarchy, generic surfaces, missing context, and common AI-built UI tells.",
  },
  {
    title: "State coverage",
    body: "Loading, empty, error, and edge-state checks before the agent calls the interface finished.",
  },
  {
    title: "Polish pass",
    body: "A final sweep for spacing, alignment, typography, focus states, and responsive details.",
  },
  {
    title: "Run reports",
    body: "Markdown reports with checks run, scores, files changed, screenshots, and remaining risks.",
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
          <span className="wordmark-short" aria-hidden="true">Agentic DS</span>
        </Link>
        <div className="nav-links" aria-label="Page sections">
          <a href="#parts" className="nav-link focus-ring focus-visible:outline focus-visible:outline-2">
            Parts
          </a>
          <a href="https://github.com/aa-on-ai/agentic-design-system#readme" className="nav-link focus-ring focus-visible:outline focus-visible:outline-2">
            README
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
            <p className="eyebrow">Agent skills for interface work</p>
            <h1>Design support for your coding agent.</h1>
            <p className="hero-lede">
              A small installable kit for your coding agent, whether it is Claude Code, OpenClaw, Hermes, or
              something similar. It adds presets, reference intake, review checks, and run reports for interface work.
            </p>

            <div className="hero-actions">
              <InstallCommand variant="strip" />
            </div>
          </div>
        </div>
      </section>

      <section id="parts" className="content-section parts-section">
        <div className="section-intro">
          <p className="eyebrow">What you get</p>
          <h2>Composable files an agent can actually use.</h2>
          <p>
            The package is intentionally plain: markdown, scripts, reports, and examples. Pick the pieces your stack
            needs and skip the rest.
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

      <footer className="site-footer">
        <p>Built by <a href="https://github.com/aa-on-ai/agentic-design-system">aa-on-ai</a> for coding agents that need better interface defaults.</p>
      </footer>
    </main>
  );
}
