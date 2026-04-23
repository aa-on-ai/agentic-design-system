"use client";

import React, { useMemo, useState } from "react";

export default function NotionAISettingsPage() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [workspaceAccess, setWorkspaceAccess] = useState(true);
  const [contentTraining, setContentTraining] = useState(false);
  const [autocomplete, setAutocomplete] = useState(true);
  const [meetingNotes, setMeetingNotes] = useState(true);
  const [smartSearch, setSmartSearch] = useState(true);
  const [dataRetention, setDataRetention] = useState("30");
  const [tone, setTone] = useState("balanced");
  const [language, setLanguage] = useState("English");
  const [model, setModel] = useState("notion-optimized");
  const [usageLimit, setUsageLimit] = useState(1200);

  const usagePercent = useMemo(() => Math.min((usageLimit / 2000) * 100, 100), [usageLimit]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8 lg:px-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-sm font-semibold text-white">
                N
              </div>
              <div>
                <p className="text-sm font-semibold">Settings</p>
                <p className="text-xs text-neutral-500">Workspace administration</p>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                "General",
                "Members",
                "Security",
                "Integrations",
                "Notifications",
                "AI features",
                "Billing",
              ].map((item) => {
                const active = item === "AI features";
                return (
                  <button
                    key={item}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                      active
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    <span>{item}</span>
                    {active && <span className="text-xs text-neutral-300">Active</span>}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs font-medium text-neutral-900">AI plan status</p>
              <p className="mt-1 text-xs text-neutral-500">Enterprise AI is enabled for your workspace.</p>
              <button className="mt-3 w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-neutral-900 ring-1 ring-inset ring-neutral-200 transition hover:bg-neutral-100">
                Manage plan
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                Notion AI
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">AI features</h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                Control how AI works across your workspace, including access, model behavior, privacy,
                and feature-level permissions.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="text-xs font-medium text-neutral-500">Monthly AI requests</p>
                <p className="mt-1 text-2xl font-semibold">{usageLimit.toLocaleString()}</p>
                <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-neutral-500">Usage limit: 2,000 requests / month</p>
              </div>
              <button className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800">
                Save changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Workspace controls</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      Enable AI across the workspace and define who can access workspace knowledge.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <SettingRow
                    title="Enable Notion AI"
                    description="Turn on AI experiences across writing, search, summaries, and page assistance."
                    enabled={aiEnabled}
                    onToggle={() => setAiEnabled((v) => !v)}
                  />

                  <SettingRow
                    title="Workspace knowledge access"
                    description="Allow AI to reference pages and documents the user already has permission to view."
                    enabled={workspaceAccess}
                    onToggle={() => setWorkspaceAccess((v) => !v)}
                  />

                  <SettingRow
                    title="Content training opt-out"
                    description="Prevent workspace content from being used to improve AI systems where supported."
                    enabled={contentTraining}
                    onToggle={() => setContentTraining((v) => !v)}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Feature permissions</h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Choose which AI capabilities are available to members in this workspace.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FeatureCard
                    title="Autocomplete"
                    description="Inline writing suggestions and sentence completion."
                    enabled={autocomplete}
                    onToggle={() => setAutocomplete((v) => !v)}
                  />
                  <FeatureCard
                    title="Meeting notes"
                    description="Summaries, action items, and recap generation."
                    enabled={meetingNotes}
                    onToggle={() => setMeetingNotes((v) => !v)}
                  />
                  <FeatureCard
                    title="Smart search"
                    description="Natural-language answers from workspace content."
                    enabled={smartSearch}
                    onToggle={() => setSmartSearch((v) => !v)}
                  />
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
                    <p className="text-sm font-medium text-neutral-900">More features</p>
                    <p className="mt-1 text-sm text-neutral-600">
                      AI databases, autofill, and agents can be managed from advanced controls.
                    </p>
                    <button className="mt-4 rounded-lg bg-white px-3 py-2 text-sm font-medium text-neutral-900 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100">
                      Open advanced controls
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Behavior and defaults</h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Set the default style, language, and model preference for AI outputs.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">Response tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-neutral-400"
                    >
                      <option value="balanced">Balanced</option>
                      <option value="concise">Concise</option>
                      <option value="professional">Professional</option>
                      <option value="creative">Creative</option>
                    </select>
                  </Field>

                  <Field>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">Default language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </Field>

                  <Field>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">Model preference</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400"
                    >
                      <option value="notion-optimized">Notion-optimized</option>
                      <option value="high-reasoning">High reasoning</option>
                      <option value="fast-latency">Fast latency</option>
                    </select>
                  </Field>

                  <Field>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">Retention window</label>
                    <select
                      value={dataRetention}
                      onChange={(e) => setDataRetention(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400"
                    >
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                    </select>
                  </Field>
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Usage limit</h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Configure the monthly request budget for this workspace.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Monthly request cap</p>
                      <p className="mt-1 text-sm text-neutral-600">
                        Current cap: <span className="font-medium text-neutral-900">{usageLimit}</span> requests
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-neutral-900 ring-1 ring-inset ring-neutral-200">
                      {Math.round(usagePercent)}% of max
                    </div>
                  </div>

                  <input
                    type="range"
                    min={100}
                    max={2000}
                    step={50}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900"
                  />

                  <div className="mt-2 flex justify-between text-xs text-neutral-500">
                    <span>100</span>
                    <span>2,000</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Privacy overview</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Review the current privacy posture for AI processing in your workspace.
                </p>

                <div className="mt-5 space-y-4">
                  <StatusItem
                    label="AI enabled"
                    value={aiEnabled ? "On" : "Off"}
                    tone={aiEnabled ? "good" : "muted"}
                  />
                  <StatusItem
                    label="Workspace access"
                    value={workspaceAccess ? "Allowed" : "Restricted"}
                    tone={workspaceAccess ? "good" : "warn"}
                  />
                  <StatusItem
                    label="Training usage"
                    value={contentTraining ? "Allowed" : "Opted out"}
                    tone={contentTraining ? "warn" : "good"}
                  />
                  <StatusItem
                    label="Retention"
                    value={`${dataRetention} days`}
                    tone="muted"
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Recommended actions</h2>
                <div className="mt-5 space-y-3">
                  <ActionCard
                    title="Review member roles"
                    description="Confirm who can manage AI settings and usage policies."
                  />
                  <ActionCard
                    title="Publish AI policy"
                    description="Share guidelines for prompts, data sensitivity, and approvals."
                  />
                  <ActionCard
                    title="Audit workspace content"
                    description="Check that restricted pages are permissioned correctly before enabling broad AI access."
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-sm">
                <p className="text-sm font-medium text-neutral-300">Enterprise support</p>
                <h3 className="mt-2 text-xl font-semibold">Need help configuring AI safely?</h3>
                <p className="mt-2 text-sm text-neutral-300">
                  Talk with a solutions engineer about governance, compliance, and deployment best practices.
                </p>
                <button className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100">
                  Contact support
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function SettingRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
      <div className="pr-4">
        <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

function FeatureCard({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        <Toggle enabled={enabled} onToggle={onToggle} />
      </div>
      <div className="mt-4 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
        {enabled ? "Enabled" : "Disabled"}
      </div>
    </div>
  );
}

function StatusItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "muted";
}) {
  const toneClasses =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-neutral-100 text-neutral-700 ring-neutral-200";

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses}`}>
        {value}
      </span>
    </div>
  );
}

function ActionCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{description}</p>
    </div>
  );
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
        enabled ? "bg-neutral-900" : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
