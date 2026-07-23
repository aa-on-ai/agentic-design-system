import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileCheck2, Github } from "lucide-react";
import { SiteFooter } from "../SiteFooter";
import { ThemeToggle } from "../ThemeToggle";
import styles from "./trace.module.css";

type TracePageProps = {
  searchParams: Promise<{ theme?: string | string[] }>;
};

type Decision = {
  id: string;
  title: string;
  decision: string;
  skill: string;
  skillHash: string;
  rule: string;
  source: string;
  constraint: string;
  evidence: Array<{ label: string; href: string }>;
};

const repo = "https://github.com/aa-on-ai/agentic-design-system";

const decisions: Decision[] = [
  {
    id: "01",
    title: "Complete state model",
    decision:
      "The Orders screen includes default, loading, empty, and error states instead of treating the happy path as the whole product.",
    skill: "ux-baseline-check",
    skillHash: "0cd0438dee",
    rule: "Every screen ships with ALL states covered. No exceptions. This is the minimum bar.",
    source: "loop-demo/README.md",
    constraint:
      "Task: an ‘Orders’ admin screen with default/loading/empty/error states, gated at 390 / 768 / 1280px.",
    evidence: [
      {
        label: "Open rendered gate receipt",
        href: `${repo}/blob/main/docs/loop-demo/iter3/evidence.json`,
      },
      {
        label: "View desktop artifact",
        href: `${repo}/blob/main/docs/loop-demo/iter3/default-1280x800.png`,
      },
    ],
  },
  {
    id: "02",
    title: "Mobile touch targets",
    decision:
      "Interactive controls were enlarged until every measured mobile target cleared the 44px gate.",
    skill: "design-review / mobile",
    skillHash: "e2b379b311",
    rule:
      "Touch targets are at least 44×44px on iOS or 48×48px on Android, with enough spacing to avoid mis-taps.",
    source: "presets/utilitarian-app.md",
    constraint: "Touch targets and responsive behavior handled cleanly.",
    evidence: [
      {
        label: "Open touch-target measurements",
        href: `${repo}/blob/main/docs/loop-demo/iter3/evidence.json`,
      },
      {
        label: "View mobile artifact",
        href: `${repo}/blob/main/docs/loop-demo/iter3/default-390x844.png`,
      },
    ],
  },
  {
    id: "03",
    title: "Restrained hierarchy",
    decision:
      "The final screen uses spacing and typography for hierarchy instead of decorative color noise.",
    skill: "design-review",
    skillHash: "546806cbfb",
    rule: "Typography check: is hierarchy clear without leaning on color?",
    source: "presets/utilitarian-app.md",
    constraint: "Hierarchy through spacing and type before color.",
    evidence: [
      {
        label: "View final desktop artifact",
        href: `${repo}/blob/main/docs/loop-demo/iter3/default-1280x800.png`,
      },
      {
        label: "Open final rendered gates",
        href: `${repo}/blob/main/docs/loop-demo/iter3/evidence.json`,
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Decision trace · Agentic Design System",
  description:
    "Follow an ADS interface decision from the governing skill and source constraint to the rendered evidence that cleared it.",
};

export default async function TracePage({ searchParams }: TracePageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const requestedTheme = Array.isArray(params.theme) ? params.theme[0] : params.theme;
  const storedTheme = cookieStore.get("ads-theme")?.value;
  const initialTheme = requestedTheme === "light" || requestedTheme === "dark"
    ? requestedTheme
    : storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : "light";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Decision trace: from interface choice to evidence",
    description: metadata.description,
    author: { "@type": "Person", name: "Aaron Thomas" },
    about: "Agentic Design System decision provenance",
  };

  return (
    <main className={`theme-page ${styles.page}`} id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className={styles.header}>
        <Link className={`wordmark focus-ring ${styles.wordmark}`} href="/" aria-label="Agentic Design System home">
          <span className="wordmark-mark" aria-hidden="true" />
          <span>Agentic Design System</span>
        </Link>
        <nav className={styles.headerNav} aria-label="Primary navigation">
          <Link className={`${styles.headerLink} focus-ring`} href="/#assembly-line">One UI run</Link>
          <a
            className="hero-pill hero-pill--icon focus-ring"
            href={repo}
            aria-label="Agentic Design System on GitHub"
          >
            <Github size={18} strokeWidth={2.1} aria-hidden="true" />
          </a>
          <ThemeToggle initialTheme={initialTheme} />
        </nav>
      </header>

      <article>
        <section className={styles.hero} aria-labelledby="trace-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Decision provenance / trace 001</p>
            <h1 id="trace-title">A paper trail for<br /><em>interface decisions.</em></h1>
            <p className={styles.lede}>
              Follow one ADS run from the choice that survived, through the exact rule and product
              constraint, to the rendered evidence a reviewer can inspect.
            </p>
          </div>

          <aside className={styles.runCard} aria-label="Trace summary">
            <div className={styles.runCardTop}>
              <span>Preserved run</span>
              <span className={styles.reviewedStatus}><i aria-hidden="true" /> Reviewed</span>
            </div>
            <strong>Orders / iter3</strong>
            <dl>
              <div><dt>Decisions</dt><dd>3</dd></div>
              <div><dt>Evidence gate</dt><dd>Passed</dd></div>
              <div><dt>Release</dt><dd>v1.2.0</dd></div>
            </dl>
            <a className={`${styles.rawLink} focus-ring`} href={`${repo}/blob/main/docs/loop-demo/decision-trace.json`}>
              Open raw trace <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </aside>
        </section>

        <section className={styles.explainer} aria-labelledby="chain-title">
          <div>
            <p className={styles.sectionLabel}>How to read the trace</p>
            <h2 id="chain-title">Four receipts. One claim.</h2>
          </div>
          <ol className={styles.chainLegend}>
            <li><span>01</span><strong>Decision</strong><small>What survived</small></li>
            <li><span>02</span><strong>Rule</strong><small>What governed it</small></li>
            <li><span>03</span><strong>Constraint</strong><small>What the product required</small></li>
            <li><span>04</span><strong>Evidence</strong><small>What cleared it</small></li>
          </ol>
        </section>

        <aside className={styles.caveat} aria-labelledby="caveat-title">
          <FileCheck2 size={22} aria-hidden="true" />
          <div>
            <strong id="caveat-title">Historical mapping, labeled honestly</strong>
            <p>
              This example maps a preserved June 2026 run using current v1.2.0 rule hashes. Its rows
              are <b>reviewed</b>, not prospective proof that the original builder loaded those files.
            </p>
          </div>
        </aside>

        <section className={styles.decisionsSection} aria-labelledby="decisions-title">
          <div className={styles.decisionsHeading}>
            <p className={styles.sectionLabel}>The trace</p>
            <h2 id="decisions-title">Three consequential decisions</h2>
            <p>Enough to audit the result. Not a transcript of every CSS property.</p>
          </div>

          <ol className={styles.decisionList}>
            {decisions.map((item) => (
              <li key={item.id} className={styles.decisionItem}>
                <article aria-labelledby={`decision-${item.id}`}>
                  <header className={styles.decisionHeader}>
                    <span className={styles.decisionIndex} aria-hidden="true">{item.id}</span>
                    <div>
                      <p>Decision</p>
                      <h3 id={`decision-${item.id}`}>{item.title}</h3>
                      <span>{item.decision}</span>
                    </div>
                  </header>

                  <div className={styles.receiptChain}>
                    <section className={styles.receipt} aria-labelledby={`rule-${item.id}`}>
                      <div className={styles.receiptLabel}>
                        <span>Rule</span>
                        <code>{item.skillHash}</code>
                      </div>
                      <h4 id={`rule-${item.id}`}>{item.skill}</h4>
                      <blockquote>“{item.rule}”</blockquote>
                    </section>

                    <section className={styles.receipt} aria-labelledby={`constraint-${item.id}`}>
                      <div className={styles.receiptLabel}>
                        <span>Source constraint</span>
                        <code>{item.source}</code>
                      </div>
                      <h4 id={`constraint-${item.id}`}>Product requirement</h4>
                      <blockquote>“{item.constraint}”</blockquote>
                    </section>

                    <section className={`${styles.receipt} ${styles.evidenceReceipt}`} aria-labelledby={`evidence-${item.id}`}>
                      <div className={styles.receiptLabel}>
                        <span>Evidence</span>
                        <span className={styles.reviewedStatus}><i aria-hidden="true" /> Reviewed</span>
                      </div>
                      <h4 id={`evidence-${item.id}`}>Rendered receipts</h4>
                      <ul>
                        {item.evidence.map((evidence) => (
                          <li key={evidence.href}>
                            <a className="focus-ring" href={evidence.href}>
                              <CheckCircle2 size={17} aria-hidden="true" />
                              {evidence.label}
                              <ArrowUpRight size={15} aria-hidden="true" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.close} aria-labelledby="close-title">
          <p className={styles.sectionLabel}>The standard</p>
          <h2 id="close-title">Why. Which rule.<br /><em>What proves it.</em></h2>
          <p>A reviewer should answer all three in under two minutes, without asking the agent to reconstruct its reasoning.</p>
          <div className={styles.closeActions}>
            <a className={`${styles.primaryAction} focus-ring`} href={`${repo}/blob/main/workflows/decision-provenance.md`}>
              Read the provenance workflow <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a className={`${styles.secondaryAction} focus-ring`} href={`${repo}/releases/tag/v1.2.0`}>
              View the v1.2.0 release
            </a>
          </div>
        </section>
      </article>

      <SiteFooter topHref="#top" assemblyHref="/#assembly-line" />
    </main>
  );
}
