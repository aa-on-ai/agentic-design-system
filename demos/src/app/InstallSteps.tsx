"use client";

import { Fragment, useState } from "react";
import { Check, Copy } from "lucide-react";
import styles from "./DesignPractice.module.css";

export const INSTALL_GUIDE_URL = "https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md#quick-start";

const AGENTS = [
  { id: "claude-code", label: "Claude Code" },
  { id: "codex", label: "Codex" },
  { id: "cursor", label: "Cursor" },
] as const;

type AgentId = (typeof AGENTS)[number]["id"];

const commandFor = (agent: AgentId) => `npx skills add aa-on-ai/agentic-design-system --agent ${agent} --copy --yes`;

/** One install command per agent, so the homepage CTA lands on something a newcomer can run. */
export function InstallSteps() {
  const [agent, setAgent] = useState<AgentId>("claude-code");
  const [status, setStatus] = useState("");
  const command = commandFor(agent);
  const agentLabel = AGENTS.find((item) => item.id === agent)?.label ?? "agent";

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setStatus("Copied. Run it from your project folder.");
    } catch {
      setStatus("Copy was blocked. Select the command and copy it yourself.");
    }
  };

  return (
    <div className={styles["install"]}>
      <fieldset className={styles["agent-picker"]}>
        <legend>Your coding agent</legend>
        <div className={styles["agent-options"]}>
          {AGENTS.map((item) => (
            <label key={item.id} className={styles["agent-option"]}>
              <input
                type="radio"
                name="ads-agent"
                value={item.id}
                checked={agent === item.id}
                onChange={() => {
                  setAgent(item.id);
                  setStatus("");
                }}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles["command"]}>
        <code id="install-command">
          {command.split(" ").map((token, index) => (
            <Fragment key={index}>
              {index > 0 ? " " : null}
              <span className={styles["command-token"]}>
                {token.includes("/") ? (
                  <>
                    {token.split("/")[0]}/<wbr />
                    {token.split("/").slice(1).join("/")}
                  </>
                ) : (
                  token
                )}
              </span>
            </Fragment>
          ))}
        </code>
        <button className={styles["copy"]} type="button" onClick={copyCommand} aria-describedby="install-command">
          {status.startsWith("Copied") ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          Copy install command
        </button>
      </div>
      <p className={styles["copy-state"]} role="status" aria-live="polite">{status}</p>

      <ol className={styles["install-steps"]}>
        <li>Run it from your project folder. It needs Node 22.20 or newer.</li>
        <li>Start a new {agentLabel} session so it picks up the skills.</li>
        <li>Ask for one real change, like the example request. The first run may ask to set up a browser for screenshots.</li>
      </ol>

      <a className={styles["mcp-link"]} href={INSTALL_GUIDE_URL}>
        Full install guide, checks and browser setup
      </a>
    </div>
  );
}
