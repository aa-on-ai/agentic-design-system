import { Github } from "lucide-react";
import { InstallCommand } from "./InstallCommand";
import { ReleaseFaq } from "./ReleaseFaq";

const hostAcceptance = [
  {
    tone: "verified",
    status: "Verified",
    hosts: "Codex · OpenClaw · Claude Code",
    detail: "Primary render → evaluate → trace loop and fresh-session resource recovery passed on macOS.",
  },
  {
    tone: "limited",
    status: "Limited",
    hosts: "Hermes",
    detail: "The primary loop passed. Fresh-session resource discovery is not verified on Hermes 0.19.0.",
  },
  {
    tone: "untested",
    status: "Untested",
    hosts: "Cursor",
    detail: "No public compatibility claim yet. Cursor IDE Agent mode remains outside the accepted matrix.",
  },
];

const boundaries = [
  <>Provision Chromium explicitly with <code>npx --yes ads-mcp@0.3.0 setup</code>.</>,
  <>Allow every non-local render origin in the server configuration.</>,
  <>Without a configured visual judge, evaluation honestly stops at <code>needs_human</code>.</>,
];

export function ReleaseClose() {
  return (
    <section className="release-bay" aria-labelledby="release-title">
      <div className="release-door" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="release-shell">
        <div className="release-intro-grid">
          <div className="release-copy">
            <p>Repo-local / MIT licensed</p>
            <h2 id="release-title">Put the review loop<br />in the repo.</h2>
            <span>
              The skill pack installs into five release-tested agent targets. The optional local MCP
              adds rendered evidence, evaluation, and provenance where the host supports it.
            </span>
          </div>

          <div className="release-actions">
            <div className="release-primary-action">
              <span>Install the complete skill pack</span>
              <InstallCommand variant="strip" />
              <small>Codex shown. Tested activation paths are documented for all five installer targets.</small>
            </div>
            <div className="release-action-links">
              <a className="release-github focus-ring" href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md">
                <Github size={18} aria-hidden="true" /> Choose your agent
              </a>
              <a className="release-github focus-ring" href="/mcp">
                Inspect the local MCP <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="release-checkout">
          <section className="release-ledger" aria-labelledby="host-ledger-title">
            <header>
              <div>
                <p>Local MCP · v0.3.0</p>
                <h3 id="host-ledger-title">Host acceptance, without the hand-waving.</h3>
              </div>
              <span>3 verified / 1 limited / 1 untested</span>
            </header>
            <dl>
              {hostAcceptance.map((item) => (
                <div key={item.status}>
                  <dt>
                    <span className={`release-status release-status--${item.tone}`}>{item.status}</span>
                    <strong>{item.hosts}</strong>
                  </dt>
                  <dd>{item.detail}</dd>
                </div>
              ))}
            </dl>
            <p className="release-ledger-note">
              Acceptance run <time dateTime="2026-07-27">July 27, 2026</time> · macOS · public npm package
            </p>
          </section>

          <aside className="release-boundaries" aria-labelledby="release-boundaries-title">
            <p>Operating limits</p>
            <h3 id="release-boundaries-title">Keep the edges visible.</h3>
            <ol>
              {boundaries.map((boundary, index) => (
                <li key={index}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{boundary}</p>
                </li>
              ))}
            </ol>
            <a className="focus-ring" href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/ads-mcp-api-contract.md">
              Read the MCP contract <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </div>

        <ReleaseFaq />
      </div>
    </section>
  );
}
