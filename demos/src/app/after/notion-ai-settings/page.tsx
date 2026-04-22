"use client";

import React, { useMemo, useState } from "react";

type ViewState = "loaded" | "loading" | "empty" | "error";

const workspaceMembers = [
  {
    name: "Ava Chen",
    role: "Workspace owner",
    usage: "High",
    seats: "AI enabled",
    lastActive: "8 min ago",
  },
  {
    name: "Marcus Lee",
    role: "Engineering",
    usage: "Medium",
    seats: "AI enabled",
    lastActive: "42 min ago",
  },
  {
    name: "Priya Nair",
    role: "Design",
    usage: "High",
    seats: "AI enabled",
    lastActive: "1 hour ago",
  },
  {
    name: "Jordan Kim",
    role: "Operations",
    usage: "Low",
    seats: "No access",
    lastActive: "Yesterday",
  },
  {
    name: "Noah Patel",
    role: "Product",
    usage: "Medium",
    seats: "AI enabled",
    lastActive: "Today",
  },
];

const connectors = [
  {
    name: "Slack",
    description: "Summarize channels and answer questions using shared workspace context.",
    status: "Connected",
    detail: "Last synced 12 min ago",
  },
  {
    name: "Google Drive",
    description: "Reference docs, meeting notes, and uploaded files in AI answers.",
    status: "Connected",
    detail: "Indexed 248 files",
  },
  {
    name: "GitHub",
    description: "Answer questions about pull requests, issues, and release notes.",
    status: "Needs attention",
    detail: "Re-authentication required",
  },
];

function Toggle({
  enabled,
  onChange,
  ariaLabel,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={() => onChange(!enabled)}
      className={[
        "relative inline-flex h-7 w-12 items-center rounded-full transition duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2",
        enabled ? "bg-neutral-900" : "bg-neutral-300",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm outline outline-1 outline-black/[0.06]",
          "transition duration-200 ease-out",
          enabled ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  const styles =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : tone === "warning"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.06] sm:p-7">
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-pretty text-lg font-semibold tracking-[-0.01em] text-neutral-950">
            {title}
          </h2>
          <p className="mt-1 text-pretty text-sm leading-6 text-neutral-600">
            {description}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

export default function NotionAISettingsPage() {
  const [viewState, setViewState] = useState<ViewState>("loaded");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [webSearch, setWebSearch] = useState(true);
  const [workspaceTraining, setWorkspaceTraining] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(true);
  const [smartSearch, setSmartSearch] = useState(true);
  const [seatManagement, setSeatManagement] = useState(true);

  const enabledSeats = useMemo(
    () => workspaceMembers.filter((m) => m.seats === "AI enabled").length,
    []
  );

  const renderContent = () => {
    if (viewState === "loading") {
      return (
        <div className="space-y-6" aria-live="polite" aria-busy="true">
          <div className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.06]">
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-40 rounded bg-neutral-200" />
              <div className="h-4 w-80 max-w-full rounded bg-neutral-100" />
              <div className="grid gap-4 pt-2 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-2xl bg-neutral-50 p-5">
                    <div className="h-4 w-24 rounded bg-neutral-200" />
                    <div className="mt-4 h-8 w-20 rounded bg-neutral-200" />
                    <div className="mt-2 h-4 w-28 rounded bg-neutral-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.06]">
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-52 rounded bg-neutral-200" />
              <div className="space-y-3 pt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4"
                  >
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-neutral-200" />
                      <div className="h-4 w-64 max-w-[60vw] rounded bg-neutral-100" />
                    </div>
                    <div className="h-7 w-12 rounded-full bg-neutral-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (viewState === "error") {
      return (
        <div className="rounded-3xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.06]">
          <div className="max-w-xl">
            <Badge tone="warning">Settings unavailable</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-neutral-950">
              We couldn&apos;t load AI settings
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              The workspace settings service didn&apos;t respond. Your current
              configuration hasn&apos;t changed. Try again, or check your admin
              permissions if this keeps happening.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setViewState("loaded")}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition duration-150 ease-out hover:bg-neutral-800 active:scale-[0.98]"
              >
                Try again
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-700 transition duration-150 ease-out hover:bg-neutral-200 active:scale-[0.98]"
              >
                Contact support
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (viewState === "empty") {
      return (
        <div className="rounded-3xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.06]">
          <div className="max-w-xl">
            <Badge>No AI seats assigned</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-neutral-950">
              Set up Notion AI for your workspace
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              AI features are available, but nobody has access yet. Assign seats
              to workspace members to enable search, writing help, summaries,
              and meeting notes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setViewState("loaded")}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition duration-150 ease-out hover:bg-neutral-800 active:scale-[0.98]"
              >
                Assign AI seats
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-700 transition duration-150 ease-out hover:bg-neutral-200 active:scale-[0.98]"
              >
                Review pricing
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.06] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success">Included in Business plan</Badge>
                <Badge>{enabledSeats} of 12 seats assigned</Badge>
              </div>
              <h2 className="mt-4 text-balance text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
                Manage how AI works across your workspace
              </h2>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-neutral-600 sm:text-[15px]">
                Control who can use AI, which workspace content can be
                referenced, and how connected tools contribute context. Changes
                apply across search, writing, summaries, Q&amp;A, and meeting
                notes.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-neutral-50 p-5 outline outline-1 outline-black/[0.05]">
                <div className="text-sm text-neutral-500">Assigned seats</div>
                <div
                  className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {enabledSeats}
                </div>
                <div className="mt-1 text-sm text-neutral-600">
                  2 pending approval
                </div>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-5 outline outline-1 outline-black/[0.05]">
                <div className="text-sm text-neutral-500">Connected sources</div>
                <div
                  className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  3
                </div>
                <div className="mt-1 text-sm text-neutral-600">
                  1 needs attention
                </div>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-5 outline outline-1 outline-black/[0.05]">
                <div className="text-sm text-neutral-500">Last policy update</div>
                <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                  Today
                </div>
                <div className="mt-1 text-sm text-neutral-600">
                  10:24 AM by Ava Chen
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <SectionCard
              title="Workspace access"
              description="Choose which AI capabilities are available to members and whether shared workspace content can be used to answer questions."
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="pr-3">
                    <div className="text-sm font-medium text-neutral-950">
                      Enable AI across this workspace
                    </div>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      Turn on writing help, page summaries, Q&amp;A, autofill,
                      and workspace search for assigned members.
                    </p>
                  </div>
                  <Toggle
                    enabled={aiEnabled}
                    onChange={setAiEnabled}
                    ariaLabel="Enable AI across this workspace"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="pr-3">
                    <div className="text-sm font-medium text-neutral-950">
                      Use workspace content in AI answers
                    </div>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      Allow AI to reference pages people already have access to
                      when answering questions or generating summaries.
                    </p>
                  </div>
                  <Toggle
                    enabled={smartSearch}
                    onChange={setSmartSearch}
                    ariaLabel="Use workspace content in AI answers"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="pr-3">
                    <div className="text-sm font-medium text-neutral-950">
                      Allow web search
                    </div>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      Let AI include current information from the web when a
                      question can&apos;t be answered from your workspace alone.
                    </p>
                  </div>
                  <Toggle
                    enabled={webSearch}
                    onChange={setWebSearch}
                    ariaLabel="Allow web search"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="pr-3">
                    <div className="text-sm font-medium text-neutral-950">
                      Save meeting notes with AI summaries
                    </div>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      Create action items, decisions, and concise summaries for
                      synced meeting docs.
                    </p>
                  </div>
                  <Toggle
                    enabled={meetingNotes}
                    onChange={setMeetingNotes}
                    ariaLabel="Save meeting notes with AI summaries"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="pr-3">
                    <div className="text-sm font-medium text-neutral-950">
                      Improve features using workspace feedback
                    </div>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      Share thumbs up, thumbs down, and generated output quality
                      signals to help improve AI features over time.
                    </p>
                  </div>
                  <Toggle
                    enabled={workspaceTraining}
                    onChange={setWorkspaceTraining}
                    ariaLabel="Improve features using workspace feedback"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Seat management"
              description="Assign AI access to members who need it most. You can review usage before adding more seats."
              action={
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition duration-150 ease-out hover:bg-neutral-800 active:scale-[0.98]"
                >
                  Assign seats
                </button>
              }
            >
              <div className="space-y-3">
                {workspaceMembers.map((member) => {
                  const enabled = member.seats === "AI enabled";
                  return (
                    <div
                      key={member.name}
                      className="flex flex-col gap-4 rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-neutral-950">
                            {member.name}
                          </h3>
                          <span className="text-sm text-neutral-400">•</span>
                          <span className="text-sm text-neutral-600">
                            {member.role}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                          <span>Usage: {member.usage}</span>
                          <span>Last active: {member.lastActive}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge tone={enabled ? "success" : "neutral"}>
                          {member.seats}
                        </Badge>
                        <button
                          type="button"
                          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline outline-1 outline-black/[0.08] transition duration-150 ease-out hover:bg-neutral-100 active:scale-[0.98]"
                        >
                          {enabled ? "Manage access" : "Enable AI"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Connected tools"
              description="Bring approved external context into AI answers. Each connection follows the permissions already configured in that tool."
            >
              <div className="space-y-3">
                {connectors.map((connector) => (
                  <div
                    key={connector.name}
                    className="flex flex-col gap-4 rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium text-neutral-950">
                          {connector.name}
                        </h3>
                        <Badge
                          tone={
                            connector.status === "Connected"
                              ? "success"
                              : "warning"
                          }
                        >
                          {connector.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">
                        {connector.description}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {connector.detail}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline outline-1 outline-black/[0.08] transition duration-150 ease-out hover:bg-neutral-100 active:scale-[0.98]"
                    >
                      {connector.status === "Connected"
                        ? "Manage"
                        : "Reconnect"}
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <SectionCard
              title="Permissions and privacy"
              description="AI respects existing page permissions. Members only get answers from content they can already access."
            >
              <div className="space-y-4">
                <div className="rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="text-sm font-medium text-neutral-950">
                    Current policy
                  </div>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    External connectors are limited to admins, and web results
                    are enabled for all assigned AI seats.
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="text-sm font-medium text-neutral-950">
                    Data handling
                  </div>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Generated responses aren&apos;t shared with guests unless the
                    underlying page has already been shared with them.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-700 transition duration-150 ease-out hover:bg-neutral-200 active:scale-[0.98]"
                >
                  Review admin controls
                </button>
              </div>
            </SectionCard>

            <SectionCard
              title="Usage this month"
              description="A quick view of how your team is using AI before you add more seats."
            >
              <div className="space-y-4">
                <div className="rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-sm text-neutral-500">Active users</div>
                      <div
                        className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-neutral-950"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        27
                      </div>
                    </div>
                    <div className="text-sm text-emerald-700">↑ 18% vs last month</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="text-sm text-neutral-500">Most used features</div>
                  <div className="mt-3 space-y-3">
                    {[
                      ["Search and Q&A", 46],
                      ["Writing help", 31],
                      ["Page summaries", 23],
                    ].map(([label, value]) => (
                      <div key={label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-700">{label}</span>
                          <span
                            className="text-neutral-500"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {value}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-200">
                          <div
                            className="h-2 rounded-full bg-neutral-900"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Need attention"
              description="A few items to review before expanding access."
            >
              <div className="space-y-3">
                <div className="rounded-2xl bg-amber-50 p-4 outline outline-1 outline-amber-200">
                  <div className="text-sm font-medium text-amber-900">
                    GitHub connection needs to be re-authenticated
                  </div>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Pull request and issue answers may be incomplete until the
                    connection is restored.
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/[0.05]">
                  <div className="text-sm font-medium text-neutral-950">
                    2 members requested AI access
                  </div>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Review pending requests before your next billing date on
                    April 1.
                  </p>
                </div>
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f6f3] text-neutral-950 [-webkit-font-smoothing:antialiased]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-5 border-b border-black/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-500">Settings</p>
              <h1 className="mt-1 text-balance text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
                AI
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-neutral-600 sm:text-[15px]">
                Configure Notion AI for your workspace, manage seats, and decide
                how AI can use shared content and connected tools.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["loaded", "loading", "empty", "error"] as ViewState[]).map(
                (state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setViewState(state)}
                    aria-pressed={viewState === state}
                    className={[
                      "inline-flex min-h-12 items-center justify-center rounded-xl px-3.5 py-2 text-sm font-medium transition duration-150 ease-out active:scale-[0.98]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2",
                      viewState === state
                        ? "bg-neutral-950 text-white"
                        : "bg-white text-neutral-700 outline outline-1 outline-black/[0.08] hover:bg-neutral-100",
                    ].join(" ")}
                  >
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </button>
                )
              )}
            </div>
          </header>

          {renderContent()}
        </div>
      </div>
    </main>
  );
}
