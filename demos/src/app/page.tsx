import Link from "next/link";
import { InstallCommand } from "./InstallCommand";
import { ThemeToggle } from "./ThemeToggle";

const chapters = [
  {
    eyebrow: "Chapter 1",
    title: "How to start",
    image: "/hero/control-room-light.png",
    href: "#start",
  },
  {
    eyebrow: "Chapter 2",
    title: "How to build",
    image: "/hero/creative-pipeline-light.png",
    href: "#build",
  },
  {
    eyebrow: "Chapter 3",
    title: "How to review",
    image: "/hero/before-after-machine-dark.png",
    href: "#review",
  },
  {
    eyebrow: "Chapter 4",
    title: "How to ship",
    image: "/hero/knowledge-constellation.png",
    href: "#ship",
  },
];

const operatingSystem = [
  {
    id: "start",
    title: "A real brief before pixels",
    body: "Project docs, routes, screenshots, product nouns, anti-goals, and reference contracts become the starting state instead of a paragraph in a prompt.",
    link: "Read: Project intake",
    panelTitle: "PROJECT INTAKE",
    items: ["Routes", "Tokens", "Screenshots", "Anti-goals"],
  },
  {
    id: "build",
    title: "Taste is named before execution",
    body: "The agent has to state what it is borrowing, what it is avoiding, and what would count as a miss before it builds the interface.",
    link: "Read: Reference intake",
    panelTitle: "REFERENCE CONTRACT",
    items: ["Borrow behavior", "Keep product voice", "No fake chrome", "Review against source"],
  },
  {
    id: "review",
    title: "Checks run where agents usually hand-wave",
    body: "Anti-pattern, state, accessibility, responsive, and screenshot checks sit in the workflow instead of arriving as taste feedback after the fact.",
    link: "Read: Design QA",
    panelTitle: "QUALITY GATES",
    items: ["Anti-pattern", "State coverage", "Accessibility", "Responsive proof"],
  },
  {
    id: "ship",
    title: "The output includes the receipts",
    body: "Every run ends with files changed, screenshots, risks, verification commands, and the install path so review starts with evidence.",
    link: "Read: Run report",
    panelTitle: "RUN REPORT",
    items: ["Files changed", "Screenshots", "Known risks", "Command"],
  },
];

const reportStats = [
  ["Canopy", "16", "40"],
  ["Pawprint", "15", "41"],
  ["Notion AI Settings", "17", "40"],
];

const wordGrid = [
  "CONTEXTGATE",
  "REFERENCEIN",
  "ANTIPATTERN",
  "STATECHECKS",
  "SCREENSHOTS",
  "RUNREPORTS",
  "ACCESSIBLE",
  "RESPONSIVE",
  "TASTELOGIC",
  "PROOFREADY",
];

export default function Home() {
  return (
    <main className="ads-page">
      <aside className="sr-only sm:sr-only" aria-label="Verification states">
        Loading state uses the final report shell while checks run. Empty state asks for a project path and reference. Error state explains the failed check and retry command. Responsive breakpoints are verified at mobile and desktop sizes.
      </aside>
      <section className="ads-hero" aria-labelledby="hero-title">
        <img
          className="ads-hero-image"
          src="/hero/creative-pipeline-light.png"
          alt="Illustrated workshop where design references become evaluated interface artifacts"
        />
        <header className="ads-nav">
          <Link href="/" className="ads-logo focus-visible:outline" aria-label="Agentic Design System home">
            Agentic Design System
          </Link>
          <nav className="ads-nav-center" aria-label="Primary navigation">
            <a className="focus-visible:outline" href="#how">How to</a>
            <a className="focus-visible:outline" href="#start">Start</a>
            <a className="focus-visible:outline" href="#build">Build</a>
            <a className="focus-visible:outline" href="#review">Review</a>
            <a className="focus-visible:outline" href="#ship">Ship</a>
          </nav>
          <div className="ads-nav-actions">
            <a className="focus-visible:outline" href="https://github.com/aa-on-ai/agentic-design-system">GitHub</a>
            <ThemeToggle />
            <a className="ads-run-button focus-visible:outline" href="#install">Install</a>
          </div>
        </header>
        <div className="ads-hero-copy">
          <h1 id="hero-title">Agentic Design System makes agents prove the interface is ready</h1>
        </div>
      </section>

      <section id="how" className="ads-intro" aria-labelledby="intro-title">
        <p className="ads-kicker">A design QA control plane</p>
        <h2 id="intro-title">Designed to help agents stop hallucinating taste.</h2>
        <p>
          It turns project context, visual references, critique, checks, and run reports into the operating system around an AI UI build.
        </p>
        <div className="ads-intro-surface" aria-label="Agentic Design System workflow map">
          <div className="ads-node ads-node-center">Agentic Design System</div>
          <div className="ads-node ads-node-a">Project intake</div>
          <div className="ads-node ads-node-b">Reference contract</div>
          <div className="ads-node ads-node-c">Design QA</div>
          <div className="ads-node ads-node-d">Run report</div>
          <div className="ads-report-mini">
            <span>Before</span>
            <span>Review</span>
            <span>After</span>
          </div>
        </div>
      </section>

      <section className="ads-chapters" aria-labelledby="chapters-title">
        <h2 id="chapters-title">Learn how to get design work out of agent autopilot</h2>
        <p>Read the short version, then install the workflow.</p>
        <div className="ads-chapter-grid">
          {chapters.map((chapter) => (
            <a className="ads-chapter-card" href={chapter.href} key={chapter.title}>
              <span>{chapter.eyebrow}</span>
              <strong>{chapter.title}</strong>
              <img src={chapter.image} alt="" aria-hidden="true" />
              <em>Read this chapter</em>
            </a>
          ))}
        </div>
      </section>

      <section className="ads-system" aria-labelledby="system-title">
        <div className="ads-system-heading">
          <h2 id="system-title">Build a real interface with the help of specialized checks</h2>
          <p>From the first brief to the final proof packet, the workflow keeps the agent honest.</p>
        </div>

        {operatingSystem.map((step) => (
          <article className="ads-system-row" id={step.id} key={step.id}>
            <div className="ads-system-copy">
              <span aria-hidden="true" />
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <a href="#install">{step.link}</a>
            </div>
            <div className="ads-system-panel">
              <div className="ads-panel-shell">
                <header>
                  <span>{step.panelTitle}</span>
                  <b>ready</b>
                </header>
                <div className="ads-panel-grid">
                  {step.items.map((item) => (
                    <div className="ads-panel-item" key={item}>
                      <span />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section id="report" className="ads-blueprint" aria-labelledby="report-title">
        <div className="ads-blueprint-copy">
          <p className="ads-kicker">All the proof in one place</p>
          <h2 id="report-title">The final artifact is a run report, not a vibe check.</h2>
        </div>
        <div className="ads-report-card" aria-label="Example run report">
          <header>
            <span>RUN-REPORT.MD</span>
            <strong>homepage evaluation</strong>
          </header>
          <div className="ads-report-stats">
            {reportStats.map(([name, before, after]) => (
              <div key={name}>
                <span>{name}</span>
                <strong>{before} to {after}</strong>
              </div>
            ))}
          </div>
          <InstallCommand variant="strip" />
        </div>
      </section>

      <section className="ads-word-search" aria-labelledby="word-title">
        <p className="ads-kicker">Build across agents</p>
        <h2 id="word-title">The system hides the boring checks in plain sight.</h2>
        <div className="ads-word-grid" aria-label="Design QA concepts">
          {wordGrid.join("").split("").map((letter, index) => (
            <span key={`${letter}-${index}`}>{letter}</span>
          ))}
        </div>
      </section>

      <section id="install" className="ads-final" aria-labelledby="install-title">
        <div>
          <h2 id="install-title">Run design work with receipts.</h2>
          <p>Install the workflow, point it at the project, and make the agent bring back evidence before it says done.</p>
        </div>
        <InstallCommand />
      </section>
    </main>
  );
}
