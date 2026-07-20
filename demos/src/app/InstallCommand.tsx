"use client";

import { useState } from "react";

const command = "npx skills add aa-on-ai/agentic-design-system --agent codex --copy --yes";

type InstallCommandProps = {
  variant?: "card" | "strip";
};

export function InstallCommand({ variant = "card" }: InstallCommandProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1600);
  };

  const copyLabel = copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Try again" : "Copy";

  if (variant === "strip") {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label="Copy Codex install command"
        className="hero-command-strip"
      >
        <code className="hero-command-code" aria-label={command}>
          <span className="hero-command-prompt" aria-hidden="true">$</span>
          <span className="hero-command-text">
            <span>npx skills add</span>{" "}
            <span>aa-on-ai/agentic-design-system</span>{" "}
            <span>--agent codex --copy --yes</span>
          </span>
        </code>
        <span className="hero-command-copy" aria-live="polite">
          {copyLabel}
        </span>
      </button>
    );
  }

  return (
    <div className="install-command-card rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold tracking-[0.04em] text-[var(--accent)]">Install</p>
        <button
          type="button"
          onClick={copy}
          className="copy-command rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] active:scale-[0.98]"
          aria-live="polite"
        >
          {copyLabel}
        </button>
      </div>
      <pre className="mt-4 overflow-x-auto rounded-[1.25rem] bg-[#100c08] p-4 text-sm leading-6 text-[#f6d9aa]"><code>{command}</code></pre>
      <p className="mt-4 text-sm font-semibold text-[var(--text)]">Installs the agent workflow.</p>
      <p className="mt-1 text-sm leading-5 text-[var(--muted)]">Adds context intake, taste calibration, critique, checks, and reporting.</p>
    </div>
  );
}
