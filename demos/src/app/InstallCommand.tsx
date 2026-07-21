"use client";

import { useEffect, useRef, useState } from "react";

const command = "npx skills add aa-on-ai/agentic-design-system --agent codex --copy --yes";

type InstallCommandProps = {
  variant?: "card" | "strip";
};

export function InstallCommand({ variant = "card" }: InstallCommandProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const copy = async () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(command);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    resetTimer.current = window.setTimeout(() => {
      setCopyStatus("idle");
      resetTimer.current = null;
    }, 1600);
  };

  const copyLabel =
    copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Try again" : "Copy";
  const copyAnnouncement =
    copyStatus === "copied"
      ? "Install command copied to clipboard."
      : copyStatus === "error"
        ? "Could not copy the install command. Try again."
        : "";

  if (variant === "strip") {
    return (
      <>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy install command"
          className="hero-command-strip"
        >
          <code className="hero-command-code" aria-label={command}>
            <span className="hero-command-prompt" aria-hidden="true">$</span>
            <span className="hero-command-text">{command}</span>
          </code>
          <span className="hero-command-copy">{copyLabel}</span>
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {copyAnnouncement}
        </span>
      </>
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
        >
          {copyLabel}
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {copyAnnouncement}
      </span>
      <pre className="mt-4 overflow-x-auto rounded-[1.25rem] bg-[#100c08] p-4 text-sm leading-6 text-[#f6d9aa]"><code>{command}</code></pre>
      <p className="mt-4 text-sm font-semibold text-[var(--text)]">Installs the agent workflow.</p>
      <p className="mt-1 text-sm leading-5 text-[var(--muted)]">Adds context intake, taste calibration, critique, checks, and reporting.</p>
    </div>
  );
}
