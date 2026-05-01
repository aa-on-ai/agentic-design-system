"use client";

import { useState } from "react";

const command = "npx skills add aa-on-ai/agentic-design-system";

type InstallCommandProps = {
  variant?: "card" | "strip";
};

export function InstallCommand({ variant = "card" }: InstallCommandProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (variant === "strip") {
    return (
      <div className="hero-command-strip rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_12px_36px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3">
          <code className="hero-command-code min-w-0 flex-1 text-sm font-semibold text-[var(--text)]" aria-label={command}>
            <span>npx skills add&nbsp;</span>
            <span>aa-on-ai/agentic-design-system</span>
          </code>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy install command"
            className="copy-command shrink-0 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] active:scale-[0.98]"
            aria-live="polite"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="install-command-card rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Install</p>
        <button
          type="button"
          onClick={copy}
          className="copy-command rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] active:scale-[0.98]"
          aria-live="polite"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-4 overflow-x-auto rounded-[1.25rem] bg-[#100c08] p-4 text-sm leading-6 text-[#f6d9aa]"><code>{command}</code></pre>
      <p className="mt-4 text-sm font-semibold text-[var(--text)]">Installs the agent workflow.</p>
      <p className="mt-1 text-sm leading-5 text-[var(--muted)]">Adds context intake, taste calibration, critique, checks, and reporting.</p>
    </div>
  );
}
