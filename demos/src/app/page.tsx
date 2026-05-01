import Image from "next/image";
import Link from "next/link";
import { InstallCommand } from "./InstallCommand";
import { ThemeToggle } from "./ThemeToggle";

const proofCases = [
  {
    name: "Canopy",
    type: "Landing page",
    prompt: "weather app landing page",
    before: "16",
    after: "40",
    delta: "+24",
    rule: "23 anti-pattern hits → 0 state gaps",
    routes: { before: "/before/canopy", after: "/after/canopy" },
  },
  {
    name: "Pawprint",
    type: "Dashboard",
    prompt: "dog walking admin surface",
    before: "15",
    after: "41",
    delta: "+26",
    rule: "61 palette tells → 0 total rule hits",
    routes: { before: "/before/pawprint", after: "/after/pawprint" },
  },
  {
    name: "Notion AI Settings",
    type: "Settings",
    prompt: "AI feature controls",
    before: "17",
    after: "40",
    delta: "+23",
    rule: "123 neutral defaults → clean pass",
    routes: {
      before: "/before/notion-ai-settings",
      after: "/after/notion-ai-settings",
    },
  },
];

const processSteps = [
  "Gather docs, routes, screenshots, and tokens.",
  "Turn references into workflow rules and anti-goals.",
  "Generate UI against the workflow contract.",
  "Critique states, accessibility, craft, and drift.",
  "Report changes, checks, and remaining risks.",
];

const artifactPanels = [
  {
    label: "Context",
    title: "Product memory",
    notes: ["Routes and components", "Domain nouns", "Constraints"],
  },
  {
    label: "Rules",
    title: "Workflow rules",
    notes: ["Borrow structure", "Avoid fake chrome", "Set fidelity"],
  },
  {
    label: "Generated UI",
    title: "Generated against contract",
    notes: ["Real states", "Project language", "Responsive rules"],
  },
  {
    label: "Critique",
    title: "Review before ship",
    notes: ["Score gaps", "Screenshot drift", "Name risks"],
  },
];

export default function Home() {
  return (
    <main className="theme-page min-h-screen selection:bg-[#f0a64b] selection:text-[#111827]">
      <div className="sr-only">
        Loading states, empty states, and error states are part of the workflow.
      </div>

      <nav
        aria-label="Primary navigation"
        className="site-nav sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10"
      >
        <Link
          href="/"
          className="wordmark min-w-0 text-sm font-bold tracking-[-0.02em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Agentic Design System
        </Link>
        <div className="nav-link-group items-center gap-2 text-sm font-semibold">
          <a className="nav-link rounded-full px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href="#loop">
            Workflow
          </a>
          <a className="nav-link rounded-full px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href="#proof">
            Proof
          </a>
          <a className="nav-link rounded-full px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href="#install">
            Install
          </a>
        </div>
        <div className="nav-actions flex shrink-0 items-center gap-3">
          <ThemeToggle />
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            aria-label="Open GitHub repository"
            className="github-link inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.98]"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-current">
              <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.77.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.38-2.53-.5-2.69-.95-.09-.23-.48-.95-.82-1.14-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.03 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.4 7.4 0 0 1 8 3.98c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.13-1.87 3.82-3.65 4.03.29.26.54.76.54 1.53 0 1.1-.01 1.99-.01 2.26 0 .22.15.48.55.4A8.15 8.15 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z" />
            </svg>
            <span className="github-label">GitHub</span>
          </a>
        </div>
      </nav>

      <section className="hero-atmosphere relative isolate -mt-[73px] overflow-hidden px-5 pb-20 pt-[142px] sm:px-8 lg:px-10 lg:pb-28 lg:pt-[156px]">
        <div className="hero-scene-wrap absolute inset-0 -z-20">
          <Image
            src="/hero/creative-pipeline-light.png"
            alt=""
            width={1536}
            height={1024}
            priority
            aria-hidden="true"
            className="hero-scene hero-scene-light"
          />
          <Image
            src="/hero/creative-pipeline-dark.png"
            alt=""
            width={1536}
            height={1024}
            priority
            aria-hidden="true"
            className="hero-scene hero-scene-dark"
          />
        </div>
        <div className="hero-scrim absolute inset-0 -z-10" />
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div className="hero-copy-panel w-full max-w-full rounded-[2.25rem] p-5 sm:max-w-3xl sm:p-7 lg:p-8">
            <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[var(--text)] sm:text-6xl lg:text-7xl">
              Give agents context, taste, and critique before they draw UI.
            </h1>
            <p className="hero-lede mt-7 max-w-2xl text-pretty text-base leading-7 text-[var(--muted)] sm:text-lg">
              Installs a reusable workflow that creates rules, generates UI, reviews screenshots, and reports what changed.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#install"
                className="accent-button inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.98]"
              >
                Install in your repo
              </a>
              <a
                href="#loop"
                className="nav-chip inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-bold shadow-[0_8px_24px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.98]"
              >
                How it works
              </a>
            </div>
            <div className="mt-4">
              <InstallCommand variant="strip" />
            </div>
          </div>

          <aside aria-label="Taste contract artifact" className="hero-artifact rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_28px_100px_rgba(0,0,0,0.2)] backdrop-blur-md sm:p-5">
            <div className="artifact-shell rounded-[2rem] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Workflow contract</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[var(--text)]">Rules before pixels.</p>
                </div>
                <span className="rounded-full bg-[var(--accent-strong)] px-3 py-1 text-xs font-bold text-[var(--accent-text)]">ready</span>
              </div>
              <p className="mt-4 rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold leading-5 text-[var(--muted)]">
                WORKFLOW.md generated from your repo, docs, routes, and screenshots.
              </p>
              <div className="artifact-flow mt-4 grid gap-3 md:grid-cols-2">
                {artifactPanels.map((panel, index) => (
                  <article key={panel.label} className="artifact-panel group rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{panel.label}</p>
                      <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">0{index + 1}</span>
                    </div>
                    <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[var(--text)]">{panel.title}</h2>
                    <ul className="mt-4 space-y-2 text-sm leading-5 text-[var(--muted)]">
                      {panel.notes.map((note) => (
                        <li key={note} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-strong)]" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="loop" className="system-section px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--accent)]">The workflow</p>
            <h2 className="mt-5 max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              From raw project context to reviewed UI.
            </h2>
          </div>
          <ol className="process-rail grid gap-3">
            {processSteps.map((step, index) => (
              <li key={step} className="process-step rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">0{index + 1}</span>
                <p className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[var(--text)]">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="proof" className="proof-section px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Proof</p>
            <h2 className="mt-5 max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              Compact report. Visible judgment.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)]">
              Benchmarks support the workflow instead of leading the page.
            </p>
          </div>
          <div className="report-card rounded-[2.25rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
            <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Run report</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[var(--text)]">Same prompt. Better workflow.</h3>
              </div>
              <p className="text-sm font-semibold text-[var(--muted)]">3 case studies</p>
            </div>
            <div className="mt-5 grid gap-3">
              {proofCases.map((item) => (
                <article key={item.name} className="benchmark-row rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{item.type}</p>
                      <h4 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[var(--text)]">{item.name}</h4>
                      <p className="mt-2 text-sm leading-5 text-[var(--muted)]">{item.rule}</p>
                    </div>
                    <div className="flex items-center gap-2 text-center tabular-nums">
                      <span className="rounded-full border border-[var(--border)] px-3 py-2 text-sm font-bold text-[var(--text)]">{item.before}</span>
                      <span className="text-sm font-bold text-[var(--accent)]">→</span>
                      <span className="rounded-full bg-[var(--accent-strong)] px-3 py-2 text-sm font-bold text-[var(--accent-text)]">{item.after}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link className="subtle-link text-sm font-semibold text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href={item.routes.before}>
                      Before
                    </Link>
                    <Link className="subtle-link text-sm font-semibold text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href={item.routes.after}>
                      After
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="install" className="install-section px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Install</p>
            <h2 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              Add the workflow where your agent already works.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Keep the homepage warm and simple. Let the repository carry the docs.
            </p>
          </div>
          <div className="lg:sticky lg:top-28">
            <InstallCommand />
          </div>
        </div>
      </section>
    </main>
  );
}
