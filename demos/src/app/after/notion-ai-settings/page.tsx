"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Database,
  KeyRound,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type SettingsState = "loaded" | "empty" | "error";

type SettingItem = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

const controls: SettingItem[] = [
  {
    id: "inline-write",
    label: "Inline writing suggestions",
    description: "Offer rewrite and expand options directly inside documents.",
    enabled: true,
  },
  {
    id: "meeting-recap",
    label: "Meeting recap generation",
    description: "Summarize notes into decisions and next steps after meetings.",
    enabled: true,
  },
  {
    id: "autofill-properties",
    label: "Database property autofill",
    description: "Suggest values for status, owner, priority, and due date fields.",
    enabled: false,
  },
];

const integrations = [
  { name: "Slack", status: "Connected", detail: "Uses workspace bot token" },
  { name: "Google Drive", status: "Connected", detail: "Indexing selected folders" },
  { name: "GitHub", status: "Pending", detail: "Requires org admin approval" },
];

function SettingsLoading() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#191919]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-5 py-5 sm:px-8 lg:px-10 lg:py-7">
        <div className="h-16 w-full animate-pulse rounded-2xl bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)] sm:w-80" />
        <div className="grid flex-1 gap-4 lg:grid-cols-[260px_1fr]">
          <div className="h-full animate-pulse rounded-2xl bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]" />
          <div className="space-y-4">
            <div className="h-60 animate-pulse rounded-2xl bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]" />
            <div className="h-56 animate-pulse rounded-2xl bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]" />
          </div>
        </div>
      </div>
    </main>
  );
}

function StateToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f0f0f]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        active
          ? "bg-[#171717] text-white"
          : "border border-[#e8e8e6] bg-white text-[#2a2a2a] hover:bg-[#f3f3f1]"
      }`}
    >
      {children}
    </button>
  );
}

export default function NotionAiSettingsAfterPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [settingsState, setSettingsState] = useState<SettingsState>("loaded");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const modelSummary = useMemo(
    () => ({
      activeModel: "Notion AI standard model",
      outputTone: "Neutral and concise",
      retention: "30-day prompt retention",
    }),
    [],
  );

  if (isLoading) {
    return <SettingsLoading />;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#191919] selection:bg-[#dfdfda] selection:text-[#111]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:px-8 lg:px-10 lg:py-7">
        <header className="rounded-2xl border border-[#e9e9e7] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-[#666]">workspace settings</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#171717]">
                AI controls and preferences
              </h1>
              <p className="mt-2 text-sm text-[#575757]">
                Manage generation behavior, privacy defaults, and integration access across your workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StateToggleButton active={settingsState === "loaded"} onClick={() => setSettingsState("loaded")}>
                configured
              </StateToggleButton>
              <StateToggleButton active={settingsState === "empty"} onClick={() => setSettingsState("empty")}>
                no policies
              </StateToggleButton>
              <StateToggleButton active={settingsState === "error"} onClick={() => setSettingsState("error")}>
                failed sync
              </StateToggleButton>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-[#e9e9e7] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
            <nav aria-label="Settings sections" className="space-y-1">
              {[
                "AI controls",
                "Preferences",
                "Integrations",
                "Privacy",
                "Audit log",
                "Billing",
              ].map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={`inline-flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm transition ${
                    index === 0
                      ? "bg-[#f1f1ef] font-medium text-[#181818]"
                      : "text-[#5a5a5a] hover:bg-[#f5f5f3]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>

          {settingsState === "loaded" ? (
            <div className="space-y-4">
              <article className="rounded-2xl border border-[#e9e9e7] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.14em] text-[#666]">AI controls</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#171717]">
                      Generation defaults
                    </h2>
                  </div>
                  <span className="inline-flex min-h-10 items-center rounded-full border border-[#e5e5e2] bg-[#f5f5f3] px-3 text-xs font-medium text-[#4d4d4d]">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Workspace wide
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {controls.map((control) => (
                    <div
                      key={control.id}
                      className="rounded-xl border border-[#ebebe9] bg-[#fafaf9] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1f1f1f]">{control.label}</p>
                          <p className="mt-1 text-sm text-[#595959]">{control.description}</p>
                        </div>
                        <span
                          className={`inline-flex min-h-10 items-center rounded-full px-3 text-xs font-medium ${
                            control.enabled
                              ? "bg-[#e8f6eb] text-[#2f6f3b]"
                              : "bg-[#efefec] text-[#5c5c5c]"
                          }`}
                        >
                          {control.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-[#e9e9e7] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] sm:p-6">
                  <h3 className="text-lg font-semibold text-[#171717]">Model behavior</h3>
                  <div className="mt-4 space-y-3 text-sm text-[#535353]">
                    <p className="flex items-start gap-2">
                      <Bot className="mt-0.5 h-4 w-4 text-[#6c6c6c]" /> Active model: {modelSummary.activeModel}
                    </p>
                    <p className="flex items-start gap-2">
                      <WandSparkles className="mt-0.5 h-4 w-4 text-[#6c6c6c]" /> Output tone: {modelSummary.outputTone}
                    </p>
                    <p className="flex items-start gap-2">
                      <KeyRound className="mt-0.5 h-4 w-4 text-[#6c6c6c]" /> Retention: {modelSummary.retention}
                    </p>
                  </div>
                </article>

                <article className="rounded-2xl border border-[#e9e9e7] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] sm:p-6">
                  <h3 className="text-lg font-semibold text-[#171717]">Integrations</h3>
                  <div className="mt-4 space-y-3">
                    {integrations.map((integration) => (
                      <div
                        key={integration.name}
                        className="rounded-xl border border-[#ececea] bg-[#fafaf9] p-3"
                      >
                        <p className="text-sm font-semibold text-[#1f1f1f]">{integration.name}</p>
                        <p className="mt-1 text-sm text-[#5a5a5a]">{integration.detail}</p>
                        <p className="mt-2 text-xs font-medium text-[#6a6a6a]">{integration.status}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          ) : settingsState === "empty" ? (
            <article className="rounded-2xl border border-[#e9e9e7] bg-white p-8 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
              <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f2f2ef] text-[#3f3f3f]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#171717]">
                  No custom AI policies yet
                </h2>
                <p className="mt-3 text-base leading-7 text-[#5a5a5a]">
                  This workspace is currently using default behavior with no overrides for prompts, safety, or integrations.
                </p>
                <span className="mt-6 inline-flex min-h-12 items-center rounded-full border border-[#e8e8e5] bg-[#fafaf8] px-4 text-sm font-medium text-[#3f3f3f]">
                  <Database className="mr-2 h-4 w-4" /> Add your first policy from AI controls
                </span>
              </div>
            </article>
          ) : (
            <article className="rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
              <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-rose-800">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-rose-900">
                  Settings sync failed
                </h2>
                <p className="mt-3 text-base leading-7 text-rose-900/80">
                  We couldn&apos;t load workspace AI settings from the server. Your current policies are unchanged.
                </p>
                <button
                  type="button"
                  onClick={() => setSettingsState("loaded")}
                  className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-rose-900 px-5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
                >
                  <RefreshCcw className="h-4 w-4" />
                  retry sync
                </button>
              </div>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
