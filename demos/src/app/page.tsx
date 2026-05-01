import Image from "next/image";
import Link from "next/link";
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

const intakeItems = [
  ["Sources", "Docs, specs, routes, screenshots"],
  ["System", "Components, tokens, constraints"],
  ["Language", "Audience, nouns, product terms"],
  ["Taste", "References, anti-references, decisions"],
];

const loopSteps = [
  {
    eyebrow: "01 / Ingest",
    title: "Read the project before touching pixels",
    body: "If the brief is thin, the agent gathers docs, screenshots, components, references, and prior decisions first.",
  },
  {
    eyebrow: "02 / Interview",
    title: "Ask only the missing questions",
    body: "The intake collapses ambiguity into a short project identity brief instead of spraying open-ended prompts at the asker.",
  },
  {
    eyebrow: "03 / Generate",
    title: "Build against explicit taste",
    body: "The agent now has tokens, nouns, density, anti-goals, and responsive rules in context before it writes UI.",
  },
  {
    eyebrow: "04 / Critique",
    title: "Run the design review loop",
    body: "Anti-pattern, state, accessibility, rubric, and polish passes catch the gaps models usually miss mid-generation.",
  },
  {
    eyebrow: "05 / Verify",
    title: "Ship a report, not vibes",
    body: "Every run emits the checks, score, files, remaining risks, and the reason the result changed.",
  },
];

const installSteps = [
  "Paste templates/agents-snippet.md into your agent instructions",
  "Start with a preset if you have no project context",
  "Add Project Intake or Reference Intake only when the task needs it",
];

const setupCards = [
  {
    name: "Claude Code",
    file: "CLAUDE.md or AGENTS.md",
    body: "Paste the snippet, add a preset, then prompt normally. Optional: ask Claude to run intake when the project needs alignment.",
  },
  {
    name: "Hermes",
    file: "Agent instructions + readable skills path",
    body: "Point Hermes at the skills, paste the snippet, and keep the default loop short. Add Reference Intake only for visual references.",
  },
  {
    name: "OpenClaw",
    file: "Workspace AGENTS.md",
    body: "Paste the snippet into AGENTS.md. For UI sub-agents, include only the gates that apply in the handoff.",
  },
];

const skipRules = [
  ["No context?", "Use a preset."],
  ["Needs alignment?", "Run Project Intake."],
  ["Visual reference?", "Run Reference Intake."],
  ["Does not apply?", "Skip it."],
];

export default function Home() {
  return (
    <main className="theme-page min-h-screen selection:bg-[#f0a64b] selection:text-[#111827]">
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
          <a className="nav-link rounded-full px-3 py-2 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href="#intake">
            Intake
          </a>
          <a className="nav-link rounded-full px-3 py-2 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href="#proof">
            Proof
          </a>
          <a className="nav-link rounded-full px-3 py-2 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href="#install">
            Install
          </a>
        </div>
        <div className="nav-actions flex shrink-0 items-center gap-3">
          <ThemeToggle />
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            className="github-link inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.98]"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-current">
              <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.77.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.38-2.53-.5-2.69-.95-.09-.23-.48-.95-.82-1.14-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.09-1.78-.21-3.64-.91-3.64-4.03 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.4 7.4 0 0 1 8 3.98c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.13-1.87 3.82-3.65 4.03.29.26.54.76.54 1.53 0 1.1-.01 1.99-.01 2.26 0 .22.15.48.55.4A8.15 8.15 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z" />
            </svg>
            <span className="github-label">GitHub</span>
          </a>
        </div>
      </nav>

      <section className="hero-atmosphere relative isolate min-h-[860px] overflow-hidden px-5 pb-24 pt-12 sm:px-8 lg:min-h-[920px] lg:px-10 lg:pb-32">
        <div className="hero-scene-wrap absolute inset-0 -z-20">
          <Image
            src="/hero/control-room-light.png"
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
        <div className="mx-auto w-full max-w-7xl">
          <div className="hero-copy-panel w-full max-w-full rounded-[2rem] p-5 sm:max-w-3xl sm:p-7 lg:p-8">
            <p className="eyebrow-pill mb-5 inline-flex rounded-full px-4 py-2 text-sm font-semibold">
              Agentic Design System
            </p>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--text)] sm:text-6xl lg:text-7xl">
              Give your agents taste, context, and a review loop.
            </h1>
            <p className="hero-lede mt-7 max-w-2xl text-pretty text-base leading-7 text-[var(--muted)] sm:text-lg">
              Start with a preset. Add project context when alignment matters.
              Add reference intake when taste matters. Skip the rest.
            </p>

            <aside
              aria-label="Benchmark score summary"
              className="artifact-glow mt-8 w-full max-w-2xl rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0a64b]/16 pb-3">
                <p className="text-sm font-bold text-[var(--text)]">Design benchmark score / 50</p>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">3 case studies</p>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 text-center tabular-nums sm:grid-cols-3">
                {proofCases.map((item) => (
                  <a
                    key={item.name}
                    href={item.routes.after}
                    className="score-card rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                  >
                    <span className="score-card-label block text-xs font-bold uppercase tracking-[0.08em]">{item.name}</span>
                    <span className="mt-2 block text-2xl font-bold text-[var(--text)]">{item.before}→{item.after}</span>
                    <span className="score-card-delta mt-1 block text-xs font-semibold">{item.delta}</span>
                    <span className="score-card-action mt-2 block text-xs font-bold">Open after →</span>
                  </a>
                ))}
              </div>
            </aside>

            <div className="pipeline-cue mt-4 flex max-w-2xl flex-wrap items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] backdrop-blur">
              <span>Docs</span>
              <span>Specs</span>
              <span>Routes</span>
              <span>Tokens</span>
              <span>Screenshots</span>
              <span className="text-[var(--accent)]">→</span>
              <span className="text-[var(--text)]">Taste extracted</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#install"
                className="accent-button inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.98]"
              >
                Install the skill pack
              </a>
              <a
                href="#proof"
                className="nav-chip inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-bold shadow-[0_8px_24px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.98]"
              >
                Inspect before and after
              </a>
            </div>
          </div>
          <div className="floating-ticket hero-environment-label absolute bottom-10 right-5 max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:right-8 lg:bottom-16 lg:right-10">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Prompt → review → report</p>
            <p className="mt-2 text-sm font-semibold">The control plane is the world now.</p>
            <p className="mt-1 text-sm leading-5 text-[var(--muted)]">Artifacts agents can inspect.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#1c1712]/10 bg-[#fffaf0] px-5 py-16 text-[#1c1712] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#a6532a]">
              The failure mode
            </p>
            <h2 className="mt-4 max-w-xl text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-4xl">
              Agents need taste memory.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Generic output", "Card grids, cold neutrals, default fonts, and a screenshot that could belong to any product."],
              ["Missing states", "Loading, empty, and error flows vanish because the prompt asked for the happy path."],
              ["Thin context", "Without project nouns, constraints, and anti-goals, critique arrives after the wrong thing exists."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-[1.5rem] border border-[#1c1712]/10 bg-[#f8edd8] p-6">
                <h3 className="text-lg font-semibold tracking-[-0.015em]">{title}</h3>
                <p className="mt-3 text-sm leading-5 text-[#4f4036]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="intake" className="bg-[#17130f] px-5 py-24 text-[#fff4df] sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
              Project Knowledge Intake
            </p>
            <h2 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              Extract design taste into files agents can actually use.
            </h2>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-[#d8c5ad] sm:text-lg">
              When a preset is not enough, intake turns messy project context
              into a compact DESIGN.md brief.
            </p>
            <ul className="intake-grid mt-9 grid gap-3 sm:grid-cols-2" aria-label="Knowledge gathered during intake">
              {intakeItems.map(([title, body]) => (
                <li key={title} className="intake-card rounded-2xl border border-[#fff4df]/12 bg-[#fff4df]/6 p-4">
                  <span className="block text-sm font-semibold text-[#fff4df]">{title}</span>
                  <span className="mt-1 block text-sm leading-5 text-[#d8c5ad]">{body}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside
            aria-label="Example DESIGN.md intake artifact"
            className="rounded-[2rem] border border-[#fff4df]/12 bg-[#231b15] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)]"
          >
            <div className="flex items-center justify-between border-b border-[#fff4df]/10 pb-4">
              <div>
                <p className="text-sm font-bold text-[#fff4df]">DESIGN.md</p>
                <p className="mt-1 text-xs text-[#bfa88e]">Optional when a preset is not enough</p>
              </div>
              <span className="rounded-full bg-[#f0a64b] px-3 py-1 text-xs font-bold text-[#17130f]">Skippable</span>
            </div>
            <div className="mt-5 space-y-4 font-mono text-[13px] leading-5 text-[#ead7bd]">
              <div className="rounded-2xl bg-[#17130f] p-4">
                <p className="text-[var(--accent)]">Sources inspected</p>
                <p>Docs/specs, app routes, component tokens, screenshots</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#17130f] p-4">
                  <p className="text-[var(--accent)]">Domain nouns</p>
                  <p>Rounds, funders, proposals, reviews, evidence rails</p>
                </div>
                <div className="rounded-2xl bg-[#17130f] p-4">
                  <p className="text-[var(--accent)]">Routes</p>
                  <p>/funder/materials, /funder/budget, /settings/ai</p>
                </div>
              </div>
              <div className="rounded-2xl bg-[#17130f] p-4">
                <p className="text-[var(--accent)]">Constraints</p>
                <p>WCAG AA, mobile first, no new card grid, preserve existing tokens</p>
              </div>
              <div className="rounded-2xl bg-[#17130f] p-4">
                <p className="text-[var(--accent)]">Anti-goals</p>
                <p>No purple AI gradients, no generic model names, no fake states</p>
              </div>
              <div className="rounded-2xl bg-[#17130f] p-4">
                <p className="text-[var(--accent)]">Questions asked</p>
                <p>2 — only naming and priority were not in the repo</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="reference-gate bg-[#120f19] px-5 py-24 text-[#fff4df] sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#f0a64b]">
              Reference Intake Gate
            </p>
            <h2 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              Turn visual references into searchable taste cards.
            </h2>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-[#d8c5ad] sm:text-lg">
              A screenshot or site becomes a small contract: what to borrow,
              what to ignore, and how close the result should feel.
            </p>
          </div>
          <aside className="rounded-[2rem] border border-[#fff4df]/12 bg-[#1f1928] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
            <div className="rounded-[1.5rem] border border-[#f0a64b]/25 bg-[#120f19] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#f0a64b]">Contract before code</p>
              <dl className="mt-6 grid gap-5 text-sm leading-5">
                {[
                  ["Borrow", "Structure, scale, motion, mood, typography, art style, surface, or interaction model."],
                  ["Do not borrow", "Incidental demo chrome, fake controls, content metaphors, or structure the product did not approve."],
                  ["Fidelity", "Close mimic, same spirit, or loose cue — chosen before implementation changes."],
                  ["Done gate", "Screenshot the result, compare against the contract, and report any drift."],
                ].map(([term, detail]) => (
                  <div key={term} className="grid gap-2 border-b border-[#fff4df]/10 pb-5 last:border-0 last:pb-0 sm:grid-cols-[9rem_1fr]">
                    <dt className="font-semibold text-[#fff4df]">{term}</dt>
                    <dd className="text-[#d8c5ad]">{detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#fffaf0] px-5 py-24 text-[#1c1712] sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#a6532a]">
              The loop
            </p>
            <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              ingest → interview → generate → critique → verify.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-5">
            {loopSteps.map((step) => (
              <article key={step.eyebrow} className="rounded-[1.75rem] border border-[#1c1712]/10 bg-[#f5ead6] p-5 shadow-[0_1px_0_rgba(28,23,18,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#a6532a]">{step.eyebrow}</p>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em]">{step.title}</h3>
                <p className="mt-3 text-sm leading-5 text-[#4f4036]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="overflow-hidden bg-[#201914] px-5 py-24 text-[#fff4df] sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
              Proof, not promises
            </p>
            <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              Same model. Same prompt. Different system.
            </h2>
            <p className="mt-6 text-pretty text-base leading-7 text-[#d8c5ad] sm:text-lg">
              The benchmark is intentionally boring: one prompt, one model,
              before and after the skill pack. Scores are existing case-study
              figures, not landing-page confetti.
            </p>
            <figure className="mt-10 overflow-hidden rounded-[1.75rem] border border-[#fff4df]/12 bg-[#2c2119] p-3">
              <Image
                src="/hero/before-after-machine-dark.png"
                alt="A dark before-and-after evaluation machine comparing raw AI UI output against reviewed and verified interface output."
                width={1280}
                height={960}
                className="aspect-[4/3] w-full rounded-[1.25rem] object-cover outline outline-1 outline-white/10"
              />
            </figure>
          </div>
          <div className="space-y-5">
            {proofCases.map((item) => (
              <article key={item.name} className="rounded-[2rem] border border-[#fff4df]/12 bg-[#fff4df]/7 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.18)]">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--accent)]">{item.type}</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">{item.name}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-5 text-[#d8c5ad]">{item.prompt} · {item.rule}</p>
                  </div>
                  <div className="grid min-w-48 grid-cols-3 overflow-hidden rounded-2xl border border-[#fff4df]/12 text-center tabular-nums">
                    <div className="bg-[#140f0c] p-3">
                      <p className="text-xs text-[#bca88f]">Before</p>
                      <p className="text-2xl font-semibold">{item.before}</p>
                    </div>
                    <div className="bg-[#f0a64b] p-3 text-[#1c1712]">
                      <p className="text-xs font-bold">Delta</p>
                      <p className="text-2xl font-bold">{item.delta}</p>
                    </div>
                    <div className="bg-[#140f0c] p-3">
                      <p className="text-xs text-[#bca88f]">After</p>
                      <p className="text-2xl font-semibold">{item.after}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link className="rounded-full border border-[#fff4df]/14 px-4 py-2 text-sm font-semibold text-[#f6e0bd] hover:bg-[#fff4df]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0a64b]" href={item.routes.before}>
                    Open before route
                  </Link>
                  <Link className="rounded-full bg-[#fff4df] px-4 py-2 text-sm font-semibold text-[#1c1712] hover:bg-[#f0d5aa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0a64b] active:scale-[0.98]" href={item.routes.after}>
                    Open after route
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4efe5] px-5 py-24 text-[#1c1712] sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#a6532a]">
              What gets judged
            </p>
            <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">
              The rubric rewards judgment before decoration.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Design Quality", "35%", "Does it feel like one coherent product instead of a pile of generated parts?"],
              ["Originality", "30%", "Did the agent make custom decisions, or just remix default SaaS furniture?"],
              ["Craft", "20%", "Typography, spacing, contrast, focus states, and responsive basics."],
              ["Functionality", "15%", "Can someone understand the surface and complete the obvious actions?"],
            ].map(([name, weight, body]) => (
              <article key={name} className="rounded-[1.75rem] border border-[#1c1712]/10 bg-[#fffaf0] p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-[-0.025em]">{name}</h3>
                  <span className="text-2xl font-semibold tabular-nums text-[#a6532a]">{weight}</span>
                </div>
                <p className="mt-3 text-sm leading-5 text-[#4f4036]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="install" className="bg-[#fffaf0] px-5 py-24 text-[#1c1712] sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#a6532a]">
              Install and run
            </p>
            <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              One skill pack, then normal prompts.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#4f4036] sm:text-lg">
              Install the pack, paste one snippet, choose a preset, and prompt
              normally. Add the intake gates only when they apply.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {skipRules.map(([label, value]) => (
                <div key={label} className="rounded-[1.25rem] border border-[#1c1712]/10 bg-[#fff4df] p-4 shadow-[0_1px_0_rgba(28,23,18,0.06)]">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#a6532a]">{label}</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.025em]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-3">
              {setupCards.map((item) => (
                <article key={item.name} className="rounded-[1.5rem] border border-[#1c1712]/10 bg-[#f4efe5] p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-xl font-semibold tracking-[-0.025em]">{item.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#a6532a]">{item.file}</p>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-[#4f4036]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="install-panel rounded-[2rem] border border-[#1c1712]/10 bg-[#1c1712] p-5 text-[#fff4df] shadow-[0_28px_80px_rgba(28,23,18,0.22)] lg:sticky lg:top-28">
            <div className="rounded-[1.35rem] bg-[#0f0b08] p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#f0a64b]">01 install</p>
                <span className="rounded-full border border-[#fff4df]/12 px-2 py-1 text-[11px] font-bold text-[#bfa88e]">command</span>
              </div>
              <pre className="overflow-x-auto text-sm leading-6 text-[#f4d8ab]"><code>{"npx skills add aa-on-ai/agentic-design-system"}</code></pre>
            </div>
            <ol className="mt-6 space-y-3" aria-label="Installation steps" start={2}>
              {installSteps.map((step, index) => (
                <li key={step} className="grid grid-cols-[2.25rem_1fr] gap-3 text-sm leading-5 text-[#e8d2b5]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0a64b] text-xs font-bold text-[#1c1712] tabular-nums">{index + 2}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#c45f2f] p-8 text-[#fffaf0] shadow-[0_28px_90px_rgba(142,64,30,0.24)] sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#ffe0bd]">
                Final state
              </p>
              <h2 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                Stop asking agents for prettier screens. Give them a better loop.
              </h2>
            </div>
            <div className="space-y-3">
              <a
                href="https://github.com/aa-on-ai/agentic-design-system"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#fffaf0] px-6 py-3 text-sm font-bold text-[#1c1712] hover:bg-[#ffe0bd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1c1712] active:scale-[0.98] sm:w-auto"
              >
                Open the repository
              </a>
              <p className="text-sm leading-5 text-[#ffe0bd]">
                Includes routing, templates, verification scripts, examples,
                and the project knowledge intake layer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
