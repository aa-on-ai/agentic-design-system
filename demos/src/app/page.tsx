import Link from "next/link";
import type { CSSProperties } from "react";
import { InstallCommand } from "./InstallCommand";
import { ThemeToggle } from "./ThemeToggle";

const storySteps = [
  {
    label: "01",
    title: "Read the room",
    body: "Load project docs, visual references, forbidden patterns, screenshots, and responsive constraints before a component is touched.",
  },
  {
    label: "02",
    title: "Name the taste contract",
    body: "Turn fuzzy direction into specific borrow / do-not-borrow rules an agent can actually follow.",
  },
  {
    label: "03",
    title: "Make the proof visible",
    body: "Attach checks, screenshots, findings, and the install path in one report so review starts from evidence.",
  },
];

const chapters = [
  {
    kicker: "Chapter I",
    title: "Context Intake",
    body: "Repo routes, screenshots, tokens, product nouns, and anti-goals become the first-class brief.",
    meta: "3 inputs",
  },
  {
    kicker: "Chapter II",
    title: "Reference Gate",
    body: "Borrow the interaction language and taste, not the incidental brand, copy, or fake chrome.",
    meta: "taste contract",
  },
  {
    kicker: "Chapter III",
    title: "Design QA",
    body: "Anti-pattern, state, accessibility, and responsive checks run before anyone calls the work ready.",
    meta: "4 checks",
  },
  {
    kicker: "Chapter IV",
    title: "Run Report",
    body: "The human reviewer gets the changed files, screenshots, risks, score, and exact command.",
    meta: "evidence packet",
  },
];

const findings = [
  { label: "Anti-pattern scan", value: "pass", detail: "No AI gradient wash, nested cards, or debug badges." },
  { label: "State coverage", value: "pass", detail: "Loading, empty, and error states are named in the report." },
  { label: "Responsive proof", value: "review", detail: "Desktop, 390, and 360 captures stay attached to done." },
];

const cases = [
  { name: "Canopy", type: "Landing page", before: "16", after: "40", href: "/after/canopy" },
  { name: "Pawprint", type: "Dashboard", before: "15", after: "41", href: "/after/pawprint" },
  { name: "Notion AI Settings", type: "Settings", before: "17", after: "40", href: "/after/notion-ai-settings" },
];

export default function Home() {
  return (
    <main className="qa-page min-h-screen sm:min-h-screen selection:bg-[var(--accent)] selection:text-[var(--accent-text)]">
      <section className="qa-hero" aria-labelledby="hero-title">
        <img
          className="qa-hero-image"
          src="/hero/creative-pipeline-whimsical.png"
          alt="An illustrated design evaluation workshop turning rough UI screens into polished report artifacts"
        />
        <div className="qa-hero-shade" />

        <nav aria-label="Primary navigation" className="qa-nav">
          <Link href="/" className="qa-wordmark focus-ring focus-visible:outline">
            <span aria-hidden="true" className="qa-mark" />
            <span>Agentic Design System</span>
          </Link>
          <div className="qa-nav-links" aria-label="Page sections">
            <a className="qa-nav-link focus-ring focus-visible:outline" href="#story">Story</a>
            <a className="qa-nav-link focus-ring focus-visible:outline" href="#chapters">Chapters</a>
            <a className="qa-nav-link focus-ring focus-visible:outline" href="#report">Report</a>
          </div>
          <div className="qa-nav-actions">
            <ThemeToggle />
            <a className="qa-source-link focus-ring focus-visible:outline" href="https://github.com/aa-on-ai/agentic-design-system">
              Source
            </a>
          </div>
        </nav>

        <div className="qa-hero-content">
          <p className="qa-kicker">Design QA harness for agents</p>
          <h1 id="hero-title">Make agents prove the interface is ready.</h1>
          <p className="qa-lede">
            Agentic Design System turns project context, visual taste, screenshots, states, and verification into a report an agent has to ship with the UI.
          </p>
          <div className="qa-hero-actions" aria-label="Primary actions">
            <a className="qa-primary focus-ring focus-visible:outline" href="#install">Install the workflow</a>
            <a className="qa-secondary focus-ring focus-visible:outline" href="#report">See the proof desk</a>
          </div>
          <InstallCommand variant="strip" />
        </div>
      </section>

      <section id="story" className="qa-story" aria-labelledby="story-title">
        <div className="qa-story-copy">
          <p className="qa-kicker">From thesis to proof</p>
          <h2 id="story-title">The homepage should not ask you to trust the agent.</h2>
          <p>
            It should show the operating system around the agent: the contract, the checks, the screenshots, and the evidence packet that makes review fast.
          </p>
        </div>
        <div className="qa-story-steps">
          {storySteps.map((step) => (
            <article className="qa-story-step" key={step.title}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="chapters" className="qa-chapters" aria-labelledby="chapters-title">
        <div className="qa-section-heading">
          <p className="qa-kicker">Workflow chapters</p>
          <h2 id="chapters-title">Folder drawers for the parts agents usually skip.</h2>
        </div>
        <div className="qa-folder-stack">
          {chapters.map((chapter, index) => (
            <article className="qa-folder" key={chapter.title} style={{ "--folder-index": index } as CSSProperties}>
              <div className="qa-folder-tab">{chapter.kicker}</div>
              <div className="qa-folder-body">
                <div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.body}</p>
                </div>
                <span>{chapter.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="report" className="qa-evidence" aria-labelledby="report-title">
        <div className="qa-section-heading">
          <p className="qa-kicker">Evidence desk</p>
          <h2 id="report-title">Screenshot, findings, scores, and command in one place.</h2>
        </div>

        <article className="qa-desk" aria-label="Example design QA evidence report">
          <div className="qa-desk-preview">
            <img
              src="/hero/before-after-machine-dark.png"
              alt="A dark proof machine transforming rough screens into evaluated interface reports"
            />
            <div className="qa-desk-score" aria-label="Design quality score">
              <span>Design quality</span>
              <strong>8.6</strong>
            </div>
          </div>

          <div className="qa-desk-panel">
            <header>
              <p>run-report.md</p>
              <h3>Homepage evaluation packet</h3>
            </header>
            <div className="qa-findings">
              {findings.map((finding) => (
                <div className="qa-finding" key={finding.label}>
                  <strong>{finding.label}</strong>
                  <span>{finding.value}</span>
                  <p>{finding.detail}</p>
                </div>
              ))}
            </div>
            <div className="qa-state-strip" aria-label="State coverage examples">
              <span>Loading state</span>
              <span>Empty state</span>
              <span>Error state</span>
            </div>
            <InstallCommand />
          </div>
        </article>
      </section>

      <section className="qa-cases" aria-labelledby="cases-title">
        <div className="qa-section-heading">
          <p className="qa-kicker">Proof cases</p>
          <h2 id="cases-title">The gate changes the output.</h2>
        </div>
        <div className="qa-case-strip">
          {cases.map((item) => (
            <article key={item.name} className="qa-case-card">
              <p>{item.type}</p>
              <h3>{item.name}</h3>
              <div className="qa-case-delta" aria-label={`${item.name} score improved from ${item.before} to ${item.after}`}>
                <span>{item.before}</span>
                <b>→</b>
                <strong>{item.after}</strong>
              </div>
              <Link className="qa-card-link focus-ring focus-visible:outline" href={item.href}>Open after case</Link>
            </article>
          ))}
        </div>
      </section>

      <section id="install" className="qa-install" aria-labelledby="install-title">
        <div className="qa-section-heading">
          <p className="qa-kicker">Install</p>
          <h2 id="install-title">Drop the gate into the agent workspace.</h2>
          <p>Use the preset first. Add Project Intake when the product needs local context. Add Reference Intake when a visual comp matters.</p>
        </div>
        <InstallCommand />
      </section>

      <footer className="qa-footer">
        <p>Built by <a className="focus-ring focus-visible:outline" href="https://aaroncodes.xyz">Aaron Thomas</a>.</p>
        <div>
          <a className="focus-ring focus-visible:outline" href="https://github.com/aa-on-ai/agentic-design-system">GitHub</a>
          <a className="focus-ring focus-visible:outline" href="https://aaroncodes.xyz">Portfolio</a>
          <span>© 2026</span>
        </div>
      </footer>
    </main>
  );
}
