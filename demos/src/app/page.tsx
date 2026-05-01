import Link from "next/link";
import { InstallCommand } from "./InstallCommand";
import { ThemeToggle } from "./ThemeToggle";

const intakeItems = [
  "Repo routes, screenshots, and UI tokens",
  "Product nouns, forbidden patterns, and reference rules",
  "Responsive breakpoints and state inventory",
];

const reviewChecks = [
  { label: "Context intake", value: "required", detail: "No UI pass starts from a blank prompt." },
  { label: "Taste calibration", value: "anti-goals", detail: "Names what to avoid before pixels exist." },
  { label: "State coverage", value: "loading · empty · error", detail: "Screens prove the rough states, not just the happy path." },
  { label: "Evidence gate", value: "screenshots", detail: "Desktop and mobile captures are part of done." },
];

const reportRows = [
  { check: "Anti-pattern scan", result: "0 warnings", evidence: "No generic AI gradient, no card-grid autopilot" },
  { check: "State check", result: "passed", evidence: "Loading screenshot, empty run, error copy" },
  { check: "Accessibility", result: "passed", evidence: "Landmarks, focus styles, heading order" },
  { check: "Responsive", result: "reviewed", evidence: "360 / 390 / desktop screenshots attached" },
];

const cases = [
  { name: "Canopy", type: "Landing page", before: "16", after: "40", href: "/after/canopy" },
  { name: "Pawprint", type: "Dashboard", before: "15", after: "41", href: "/after/pawprint" },
  { name: "Notion AI Settings", type: "Settings", before: "17", after: "40", href: "/after/notion-ai-settings" },
];

export default function Home() {
  return (
    <main className="qa-page min-h-screen sm:min-h-screen selection:bg-[var(--accent)] selection:text-[var(--accent-text)]">
      <nav aria-label="Primary navigation" className="qa-nav">
        <Link href="/" className="qa-wordmark focus-ring focus-visible:outline">
          <span aria-hidden="true" className="qa-mark" />
          <span>Agentic Design System</span>
        </Link>
        <div className="qa-nav-links" aria-label="Page sections">
          <a className="qa-nav-link focus-ring focus-visible:outline" href="#eval">Evaluation</a>
          <a className="qa-nav-link focus-ring focus-visible:outline" href="#report">Report</a>
          <a className="qa-nav-link focus-ring focus-visible:outline" href="#install">Install</a>
        </div>
        <div className="qa-nav-actions">
          <ThemeToggle />
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            aria-label="Open GitHub repository"
            className="qa-icon-link focus-ring focus-visible:outline"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-current">
              <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.77.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.38-2.53-.5-2.69-.95-.09-.23-.48-.95-.82-1.14-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.03 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.4 7.4 0 0 1 8 3.98c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.13-1.87 3.82-3.65 4.03.29.26.54.76.54 1.53 0 1.1-.01 1.99-.01 2.26 0 .22.15.48.55.4A8.15 8.15 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z" />
            </svg>
          </a>
        </div>
      </nav>

      <header className="qa-hero">
        <section className="qa-hero-copy" aria-labelledby="hero-title">
          <p className="qa-kicker">Design QA harness for agents</p>
          <h1 id="hero-title">Make agents prove the UI is ready before it ships.</h1>
          <p className="qa-lede">
            Agentic Design System forces context intake, taste calibration, critique, screenshots, and a report into the agent workflow.
          </p>
        </section>

        <aside className="qa-console" aria-label="Evaluation run preview">
          <div className="qa-console-top">
            <span>run_0427</span>
            <strong>blocked before ship</strong>
          </div>
          <div className="qa-scorecard">
            <div>
              <span className="qa-score-label">Design quality</span>
              <strong>8.6</strong>
            </div>
            <div>
              <span className="qa-score-label">Evidence</span>
              <strong>6 files</strong>
            </div>
          </div>
          <ol className="qa-console-list">
            <li><span>1</span>Context brief loaded from repo and docs.</li>
            <li><span>2</span>Anti-patterns caught before visual polish.</li>
            <li><span>3</span>Loading, empty, and error states checked.</li>
            <li><span>4</span>Mobile screenshots attached to report.</li>
          </ol>
          <div className="qa-terminal" aria-label="Report excerpt">
            <p><span>status</span> needs revision</p>
            <p><span>reason</span> hero reads as generic AI site</p>
            <p><span>next</span> rebuild around evaluation evidence</p>
          </div>
        </aside>

        <section className="qa-hero-cta" aria-label="Install workflow">
          <div className="qa-hero-actions">
            <a className="qa-primary focus-ring focus-visible:outline" href="#install">Install the workflow</a>
            <a className="qa-secondary focus-ring focus-visible:outline" href="#report">View report shape</a>
          </div>
          <InstallCommand variant="strip" />
        </section>
      </header>

      <section id="eval" className="qa-section qa-eval" aria-labelledby="eval-title">
        <div className="qa-section-copy">
          <p className="qa-kicker">Evaluation loop</p>
          <h2 id="eval-title">The system checks the work like a design lead would.</h2>
          <p>
            It is not a prettier prompt. It is a harness around the agent: collect context, write rules, build, critique, verify, and only then summarize what changed.
          </p>
        </div>
        <div className="qa-eval-grid">
          <article className="qa-intake-card">
            <h3>Context intake</h3>
            <ul>
              {intakeItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <div className="qa-check-stack">
            {reviewChecks.map((item) => (
              <article key={item.label} className="qa-check-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="report" className="qa-section qa-report-section" aria-labelledby="report-title">
        <div className="qa-section-copy">
          <p className="qa-kicker">Run report</p>
          <h2 id="report-title">Evidence, not vibes.</h2>
          <p>
            The output is meant to be read by a human reviewer fast: what changed, which gates passed, what still looks risky, and where the screenshots live.
          </p>
        </div>
        <article className="qa-report-card" aria-label="Example design QA report">
          <header>
            <div>
              <p>report.md</p>
              <h3>Homepage rebuild review</h3>
            </div>
            <span>ready for review</span>
          </header>
          <div className="qa-report-table" role="table" aria-label="Verification report rows">
            {reportRows.map((row) => (
              <div className="qa-report-row" role="row" key={row.check}>
                <strong role="cell">{row.check}</strong>
                <span role="cell">{row.result}</span>
                <p role="cell">{row.evidence}</p>
              </div>
            ))}
          </div>
          <aside className="qa-state-strip" aria-label="State coverage examples">
            <span>Loading screenshot queued</span>
            <span>No evidence yet empty run</span>
            <span>Error copy says what failed and how to try again</span>
          </aside>
        </article>
      </section>

      <section className="qa-section qa-cases" aria-labelledby="cases-title">
        <div className="qa-section-copy">
          <p className="qa-kicker">Proof cases</p>
          <h2 id="cases-title">Same prompts, stronger gate.</h2>
        </div>
        <div className="qa-case-grid">
          {cases.map((item) => (
            <article key={item.name} className="qa-case-card">
              <p>{item.type}</p>
              <h3>{item.name}</h3>
              <div className="qa-delta" aria-label={`${item.name} score improved from ${item.before} to ${item.after}`}>
                <span>{item.before}</span>
                <b>→</b>
                <span>{item.after}</span>
              </div>
              <Link className="qa-card-link focus-ring focus-visible:outline" href={item.href}>Open after case</Link>
            </article>
          ))}
        </div>
      </section>

      <section id="install" className="qa-section qa-install" aria-labelledby="install-title">
        <div className="qa-section-copy">
          <p className="qa-kicker">Install</p>
          <h2 id="install-title">Drop the gate into the agent’s workspace.</h2>
          <p>One command adds the skills, checks, and report discipline. Keep the command readable; let the repo carry the detail.</p>
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
