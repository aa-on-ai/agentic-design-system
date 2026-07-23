import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Braces, Check, CircleAlert, Github, Terminal } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { FROZEN_RUN, MCP_CONTRACT } from "./mcpData";
import styles from "./mcp.module.css";

type McpPageProps = {
  searchParams: Promise<{ theme?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "MCP lab · Agentic Design System",
  description:
    "See the three-tool ADS MCP loop turn a local interface into rendered evidence, an evaluation packet, and verified decision provenance.",
};

function JsonBlock({ value, label }: { value: unknown; label: string }) {
  return (
    <figure className={styles.jsonBlock}>
      <figcaption>{label}</figcaption>
      <pre tabIndex={0}><code>{JSON.stringify(value, null, 2)}</code></pre>
    </figure>
  );
}

export default async function McpPage({ searchParams }: McpPageProps) {
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
    headline: "The Agentic Design System MCP loop",
    description: metadata.description,
    datePublished: "2026-07-22",
    dateModified: "2026-07-22",
    author: { "@type": "Person", name: "Aaron Thomas" },
    about: ["Model Context Protocol", "Agentic Design System", "UI evaluation"],
    codeRepository: MCP_CONTRACT.source,
  };

  return (
    <main className={styles.page} id="top" data-mcp-lab>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className={styles.header}>
        <Link className={`wordmark focus-ring ${styles.wordmark}`} href="/" aria-label="Agentic Design System home">
          <span className="wordmark-mark" aria-hidden="true" />
          <span>Agentic Design System</span>
        </Link>
        <nav className={styles.headerNav} aria-label="MCP lab navigation">
          <span className={styles.localStatus}><i aria-hidden="true" />Local stdio · v0.1</span>
          <a
            className={`hero-pill focus-ring ${styles.iconLink}`}
            href="https://github.com/aa-on-ai/agentic-design-system/tree/main/packages/ads-mcp"
            aria-label="View ads-mcp source on GitHub"
          >
            <Github size={18} aria-hidden="true" />
          </a>
          <ThemeToggle initialTheme={initialTheme} />
        </nav>
      </header>

      <article>
        <section className={styles.hero} aria-labelledby="mcp-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>MCP lab · one local evidence loop</p>
            <h1 id="mcp-title">The design loop,<br /><em>callable.</em></h1>
            <p className={styles.heroLede}>
              Three tools let a coding agent render the interface, check the evidence, and prove
              why consequential decisions exist. The machine handles receipts. A human still owns
              visual judgment.
            </p>
            <div className={styles.heroActions}>
              <a className={`${styles.action} ${styles.primaryAction} focus-ring`} href="#run">
                Follow a real run <ArrowDown size={16} aria-hidden="true" />
              </a>
              <a className={`${styles.action} ${styles.secondaryAction} focus-ring`} href="/mcp/contract.json">
                Read the JSON contract <Braces size={17} aria-hidden="true" />
              </a>
            </div>
          </div>

          <aside className={styles.sequenceTicket} aria-label="MCP tool sequence">
            <div className={styles.ticketTop}>
              <span>Server instructions</span>
              <span className={styles.connected}><i aria-hidden="true" />ready</span>
            </div>
            <ol>
              {MCP_CONTRACT.tools.map((tool) => (
                <li key={tool.name}>
                  <span>{tool.step}</span>
                  <div><code>{tool.name}</code><small>{tool.verb} the work</small></div>
                  <Check size={17} aria-hidden="true" />
                </li>
              ))}
            </ol>
            <p><Terminal size={15} aria-hidden="true" /> npx ads-mcp --root /your/project</p>
          </aside>
        </section>

        <section className={styles.boundaryStrip} aria-label="MCP boundaries">
          <div><span>Transport</span><strong>Local stdio</strong></div>
          <div><span>Tools</span><strong>Exactly 3</strong></div>
          <div><span>Evidence</span><strong>Real browser</strong></div>
          <div><span>Visual verdict</span><strong>Human-owned</strong></div>
        </section>

        <section className={styles.toolsSection} aria-labelledby="tools-title">
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>The public contract</p>
              <h2 id="tools-title">See. Check. Explain.</h2>
            </div>
            <p>
              Each tool does one job and returns typed output plus read-only <code>ads://</code>
              resources. There is no generic shell tool hiding behind the protocol.
            </p>
          </div>

          <ol className={styles.toolList} data-mcp-tools>
            {MCP_CONTRACT.tools.map((tool) => (
              <li key={tool.name} className={styles.toolRow} data-tool-name={tool.name}>
                <div className={styles.toolIdentity}>
                  <span>{tool.step}</span>
                  <p>{tool.verb}</p>
                </div>
                <div className={styles.toolCopy}>
                  <code>{tool.name}</code>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                </div>
                <details className={styles.schemaDisclosure}>
                  <summary>Inspect request + result <ArrowDown size={15} aria-hidden="true" /></summary>
                  <div className={styles.schemaGrid}>
                    <JsonBlock label="request" value={tool.input} />
                    <JsonBlock label="result" value={tool.output} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.runSection} id="run" aria-labelledby="run-title">
          <div className={`${styles.sectionIntro} ${styles.inverse}`}>
            <div>
              <p className={styles.eyebrow}>Frozen verification</p>
              <h2 id="run-title">One client. One run.<br /><em>Receipts all the way down.</em></h2>
            </div>
            <p>
              This packet is generated through the compiled stdio server and a real MCP client.
              It is a local verification artifact, not a simulated dashboard feed.
            </p>
          </div>

          <div className={styles.runShell}>
            <header>
              <div><i /><i /><i /></div>
              <span>{FROZEN_RUN.label}</span>
              <code>{FROZEN_RUN.runId}</code>
            </header>
            <ol>
              {FROZEN_RUN.sequence.map((stage, index) => (
                <li key={stage.tool}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <code>{stage.tool}</code>
                  <div><strong>{stage.result}</strong><small>{stage.detail}</small></div>
                  {stage.result === "needs_human"
                    ? <CircleAlert size={19} aria-label="Human review required" />
                    : <Check size={19} aria-label="Verified" />}
                </li>
              ))}
            </ol>
            <footer>
              <span>{FROZEN_RUN.client}</span>
              <span>{FROZEN_RUN.browser}</span>
              <span>{FROZEN_RUN.capturedAt}</span>
            </footer>
          </div>

          <aside className={styles.humanGate}>
            <CircleAlert size={22} aria-hidden="true" />
            <div>
              <strong><code>needs_human</code> is a feature.</strong>
              <p>
                Axe, overflow, state coverage, touch targets, and CLS can clear mechanically.
                Whether the interface is coherent, original, and right for the product still needs judgment.
              </p>
            </div>
          </aside>
        </section>

        <section className={styles.resourcesSection} aria-labelledby="resources-title">
          <div>
            <p className={styles.eyebrow}>Read-only evidence</p>
            <h2 id="resources-title">The run stays inspectable.</h2>
            <p>
              Large artifacts remain outside the chat transcript. Agents can fetch only the known
              files recorded for a run; the server never becomes a general filesystem browser.
            </p>
          </div>
          <ul>
            {MCP_CONTRACT.resources.map((resource) => (
              <li key={resource}><code>{resource}</code></li>
            ))}
          </ul>
        </section>

        <section className={styles.close} aria-labelledby="close-title">
          <p className={styles.eyebrow}>The honest boundary</p>
          <h2 id="close-title">Proof travels with the work.<br /><em>Judgment does not disappear.</em></h2>
          <div className={styles.closeActions}>
            <a className={`${styles.action} ${styles.primaryAction} focus-ring`} href="https://github.com/aa-on-ai/agentic-design-system/tree/main/packages/ads-mcp">
              Inspect the implementation <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <Link className={`${styles.action} ${styles.secondaryAction} focus-ring`} href="/trace/002">
              See a decision trace <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </article>

      <footer className={styles.footer}>
        <Link className={`wordmark focus-ring ${styles.wordmark}`} href="#top" aria-label="Back to top">
          <span className="wordmark-mark" aria-hidden="true" />
          <span>Agentic Design System</span>
        </Link>
        <span>ads-mcp · local stdio · v0.1</span>
      </footer>
    </main>
  );
}
