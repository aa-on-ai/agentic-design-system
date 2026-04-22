"use client";

import React, { useMemo, useState } from "react";

export default function NotionAISettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [workspaceAccess, setWorkspaceAccess] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [smartSearch, setSmartSearch] = useState(true);
  const [meetingNotes, setMeetingNotes] = useState(false);
  const [autoFillProperties, setAutoFillProperties] = useState(true);
  const [contentSuggestions, setContentSuggestions] = useState(true);
  const [trainingOptIn, setTrainingOptIn] = useState(false);
  const [defaultTone, setDefaultTone] = useState("Professional");
  const [defaultModel, setDefaultModel] = useState("Notion AI Standard");
  const [language, setLanguage] = useState("English");
  const [retention, setRetention] = useState("30 days");
  const [prompt, setPrompt] = useState(
    "Write clearly, keep summaries concise, and prefer action-oriented language."
  );

  const usage = useMemo(
    () => ({
      monthlyRequests: 842,
      limit: 2000,
      seats: 18,
      aiSeats: 14,
    }),
    []
  );

  const percent = Math.round((usage.monthlyRequests / usage.limit) * 100);

  const Toggle = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="pr-4">
        <div className="text-sm font-medium text-zinc-900">{label}</div>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
      </div>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-zinc-900" : "bg-zinc-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white">
                AI
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">Notion AI</div>
                <div className="text-xs text-zinc-500">Workspace settings</div>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                "Overview",
                "Features",
                "Defaults",
                "Privacy & security",
                "Usage",
                "Members",
              ].map((item, i) => (
                <a
                  key={item}
                  href={`#section-${i}`}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    i === 0
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Current plan
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-900">
                Business + AI add-on
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                AI is enabled for {usage.aiSeats} of {usage.seats} workspace seats.
              </p>
              <button className="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                Manage billing
              </button>
            </div>
          </aside>

          <main className="space-y-8">
            <section
              id="section-0"
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
                    Workspace AI settings
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
                    Configure Notion AI for your team
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    Manage AI access, feature defaults, privacy preferences, and
                    workspace-wide behaviors. These settings apply across docs,
                    databases, search, and assistant experiences.
                  </p>
                </div>

                <div className="grid min-w-[280px] grid-cols-2 gap-4">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="text-xs text-zinc-500">Monthly requests</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-900">
                      {usage.monthlyRequests}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      of {usage.limit} included
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="text-xs text-zinc-500">AI-enabled seats</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-900">
                      {usage.aiSeats}/{usage.seats}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Active workspace coverage
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-zinc-900">
                      AI request usage
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      You’ve used {percent}% of your included AI requests this month.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
                    Resets in 12 days
                  </span>
                </div>
                <div className="mt-4 h-2.5 w-full rounded-full bg-zinc-200">
                  <div
                    className="h-2.5 rounded-full bg-zinc-900"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </section>

            <section
              id="section-1"
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-zinc-900">Features</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Enable or disable AI capabilities available across your workspace.
                </p>
              </div>

              <div className="grid gap-4">
                <Toggle
                  checked={enabled}
                  onChange={setEnabled}
                  label="Enable Notion AI"
                  description="Turns on AI writing, summarization, brainstorming, and assistant capabilities for this workspace."
                />
                <Toggle
                  checked={workspaceAccess}
                  onChange={setWorkspaceAccess}
                  label="Allow workspace knowledge access"
                  description="Let AI reference pages and databases members already have permission to access for answers and summaries."
                />
                <Toggle
                  checked={smartSearch}
                  onChange={setSmartSearch}
                  label="Smart search answers"
                  description="Use AI to generate direct answers from workspace content when members search."
                />
                <Toggle
                  checked={saveHistory}
                  onChange={setSaveHistory}
                  label="Save AI chat history"
                  description="Store prompts and responses so members can revisit previous conversations."
                />
                <Toggle
                  checked={contentSuggestions}
                  onChange={setContentSuggestions}
                  label="Inline content suggestions"
                  description="Show rewrite, expand, summarize, and tone-adjustment suggestions while editing."
                />
                <Toggle
                  checked={autoFillProperties}
                  onChange={setAutoFillProperties}
                  label="Auto-fill database properties"
                  description="Generate tags, summaries, owners, or other suggested values for database entries."
                />
                <Toggle
                  checked={meetingNotes}
                  onChange={setMeetingNotes}
                  label="AI meeting notes"
                  description="Create summaries, decisions, and action items from meeting pages and notes."
                />
              </div>
            </section>

            <section
              id="section-2"
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-zinc-900">Defaults</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Set workspace-wide preferences for AI output and assistant behavior.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Default tone
                  </label>
                  <select
                    value={defaultTone}
                    onChange={(e) => setDefaultTone(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-900"
                  >
                    <option>Professional</option>
                    <option>Concise</option>
                    <option>Friendly</option>
                    <option>Executive</option>
                    <option>Technical</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Default model
                  </label>
                  <select
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
                  >
                    <option>Notion AI Standard</option>
                    <option>Notion AI Fast</option>
                    <option>Notion AI Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Output language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Japanese</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Prompt retention
                  </label>
                  <select
                    value={retention}
                    onChange={(e) => setRetention(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
                  >
                    <option>7 days</option>
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                    <option>Never auto-delete</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Workspace instruction
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
                    placeholder="Add default instructions for how AI should respond in your workspace..."
                  />
                  <p className="mt-2 text-xs text-zinc-500">
                    Applied as a default system-style instruction for AI-generated
                    outputs in your workspace.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="section-3"
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Privacy & security
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Control how AI data is stored, reviewed, and used.
                </p>
              </div>

              <div className="grid gap-4">
                <Toggle
                  checked={trainingOptIn}
                  onChange={setTrainingOptIn}
                  label="Share data to improve AI"
                  description="Allow anonymized workspace AI interactions to be used for product quality and model improvements."
                />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-sm font-medium text-zinc-900">
                    Data residency
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">United States</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-sm font-medium text-zinc-900">
                    Last policy review
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">March 5, 2026</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-sm font-medium text-zinc-900">
                    Audit logs
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    Enabled for Enterprise export
                  </p>
                </div>
              </div>
            </section>

            <section
              id="section-4"
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Usage</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Monitor request volume and workspace adoption.
                  </p>
                </div>
                <button className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                  Download report
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Summaries generated", value: "319" },
                  { label: "Drafts created", value: "184" },
                  { label: "Search answers", value: "227" },
                  { label: "Database autofills", value: "112" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="text-xs text-zinc-500">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-900">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="section-5"
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Members</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Manage which seats currently have AI access.
                  </p>
                </div>
                <button className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                  Assign seats
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-zinc-600">
                        Member
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-600">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-600">
                        AI access
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-600">
                        Last active
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {[
                      ["Ava Chen", "Workspace owner", "Enabled", "2h ago"],
                      ["Noah Kim", "Admin", "Enabled", "Today"],
                      ["Maya Patel", "Member", "Enabled", "Yesterday"],
                      ["Liam Johnson", "Member", "Disabled", "3 days ago"],
                    ].map(([name, role, access, active]) => (
                      <tr key={name}>
                        <td className="px-4 py-3 text-zinc-900">{name}</td>
                        <td className="px-4 py-3 text-zinc-500">{role}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              access === "Enabled"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200"
                            }`}
                          >
                            {access}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{active}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="sticky bottom-4 flex justify-end">
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
                <button className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                  Cancel
                </button>
                <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                  Save changes
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
