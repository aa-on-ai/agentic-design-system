"use client";

import React, { useMemo, useState } from "react";

type ViewState = "loaded" | "loading" | "empty" | "error";

const cls = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

function Toggle({
  enabled,
  onChange,
  label,
  description,
  disabled,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={cls(
        "group flex w-full items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[transform,box-shadow,border-color,background-color] duration-150 ease-out active:scale-[0.985] hover:border-stone-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/15",
        disabled && "cursor-not-allowed opacity-55 hover:border-stone-200 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium tracking-[-0.01em] text-stone-900">
            {label}
          </span>
          {disabled && (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
              Admin managed
            </span>
          )}
        </div>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-stone-600 [text-wrap:pretty]">
          {description}
        </p>
      </div>

      <span
        aria-hidden="true"
        className={cls(
          "relative mt-0.5 inline-flex h-7 w-12 shrink-0 rounded-full border transition-[background-color,border-color] duration-150 ease-out",
          enabled
            ? "border-stone-900 bg-stone-900"
            : "border-stone-300 bg-stone-200",
          disabled && enabled && "border-stone-500 bg-stone-500"
        )}
      >
        <span
          className={cls(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm outline outline-1 outline-black/5 transition-[transform] duration-150 ease-out",
            enabled ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}

function SectionRow({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.03)] outline outline-1 outline-black/[0.05] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-stone-900">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-stone-600 [text-wrap:pretty]">
            {description}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function SkeletonBlock() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] text-stone-900 antialiased">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.05] sm:p-8">
            <div className="h-4 w-28 rounded bg-stone-200" />
            <div className="mt-4 h-10 w-64 rounded bg-stone-200" />
            <div className="mt-3 h-4 w-full max-w-2xl rounded bg-stone-200" />
            <div className="mt-2 h-4 w-4/5 max-w-xl rounded bg-stone-100" />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-stone-100 p-4">
                  <div className="h-3 w-16 rounded bg-stone-200" />
                  <div className="mt-3 h-8 w-24 rounded bg-stone-200" />
                  <div className="mt-2 h-3 w-24 rounded bg-stone-100" />
                </div>
              ))}
            </div>
          </div>

          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-[24px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.05]"
            >
              <div className="h-4 w-40 rounded bg-stone-200" />
              <div className="mt-2 h-4 w-2/3 rounded bg-stone-100" />
              <div className="mt-5 space-y-3">
                {[0, 1].map((r) => (
                  <div
                    key={r}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-stone-100 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-48 rounded bg-stone-200" />
                      <div className="mt-2 h-4 w-full max-w-xl rounded bg-stone-100" />
                    </div>
                    <div className="h-7 w-12 rounded-full bg-stone-200" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NotionAISettingsPage() {
  const [view, setView] = useState<ViewState>("loaded");

  const [settings, setSettings] = useState({
    workspaceAI: true,
    pageAutocomplete: true,
    meetingNotes: true,
    wikiAnswers: true,
    webSearch: false,
    dataTraining: false,
    enterpriseControls: true,
    inlineTranslate: false,
  });

  const usage = useMemo(
    () => ({
      membersWithAI: 28,
      monthlyResponses: 18472,
      savedHours: 126,
    }),
    []
  );

  const cards = [
    {
      label: "Members with AI",
      value: usage.membersWithAI.toLocaleString(),
      note: "of 34 seats",
    },
    {
      label: "AI responses this month",
      value: usage.monthlyResponses.toLocaleString(),
      note: "updated 12 min ago",
    },
    {
      label: "Estimated time saved",
      value: `${usage.savedHours}h`,
      note: "based on weekly usage",
    },
  ];

  const auditRows = [
    {
      name: "Workspace-wide AI enabled",
      detail: "Changed by Maya Chen",
      time: "Today, 9:14 AM",
    },
    {
      name: "Web search disabled for guests",
      detail: "Changed by IT admin policy",
      time: "Yesterday, 4:28 PM",
    },
    {
      name: "Data retention window updated to 30 days",
      detail: "Changed by Alex Romero",
      time: "Apr 21, 2026",
    },
  ];

  if (view === "loading") {
    return <SkeletonBlock />;
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-stone-900 antialiased">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/65 sm:mb-8">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-medium tracking-[0.01em] text-white">
              Demo state
            </span>
            <p className="text-[12px] text-stone-600">
              Preview loading, empty, and error handling.
            </p>
          </div>
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Preview states"
          >
            {(["loaded", "loading", "empty", "error"] as ViewState[]).map((state) => (
              <button
                key={state}
                type="button"
                role="tab"
                aria-selected={view === state}
                onClick={() => setView(state)}
                className={cls(
                  "min-h-12 rounded-full px-3.5 text-[12px] font-medium capitalize transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/15",
                  view === state
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-700 outline outline-1 outline-black/[0.06] hover:bg-stone-50"
                )}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        <header className="rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.05] sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[12px] font-medium text-stone-700">
                <span className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                Workspace settings
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-4xl [text-wrap:balance]">
                Notion AI
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-6 text-stone-600 [text-wrap:pretty]">
                Control how AI works across your workspace, what content it can
                use, and which features are available to members. Changes apply
                to new responses right away unless noted below.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-stone-200/80 bg-[#fcfcfa] p-4"
                >
                  <p className="text-[12px] text-stone-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-stone-950 [font-variant-numeric:tabular-nums]">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[12px] text-stone-500">{card.note}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {view === "empty" && (
          <div className="mt-6 rounded-[24px] bg-white p-6 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline outline-1 outline-black/[0.05] sm:mt-8 sm:p-7">
            <div className="max-w-xl">
              <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-stone-950">
                AI hasn’t been turned on for this workspace yet
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-stone-600 [text-wrap:pretty]">
                When you enable Notion AI, members can draft, summarize, search
                across workspace knowledge, and use AI blocks where permissions
                allow.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="min-h-12 rounded-full bg-stone-900 px-4 text-[13px] font-medium text-white transition-[transform,background-color] duration-150 ease-out hover:bg-stone-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/15"
                >
                  Enable Notion AI
                </button>
                <button
                  type="button"
                  className="min-h-12 rounded-full bg-stone-100 px-4 text-[13px] font-medium text-stone-800 transition-[transform,background-color] duration-150 ease-out hover:bg-stone-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/15"
                >
                  Review pricing
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "error" && (
          <div
            className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:mt-8 sm:p-6"
            role="alert"
            aria-live="polite"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-rose-950">
                  We couldn’t load AI settings
                </h2>
                <p className="mt-1 max-w-2xl text-[13px] leading-5 text-rose-900/80 [text-wrap:pretty]">
                  Your workspace details loaded, but the AI configuration service
                  didn’t respond. Try again, or check whether your admin
                  permissions changed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setView("loaded")}
                className="min-h-12 rounded-full bg-white px-4 text-[13px] font-medium text-rose-950 outline outline-1 outline-rose-200 transition-[transform,background-color] duration-150 ease-out hover:bg-rose-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {view === "loaded" && (
          <main className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
            <div className="space-y-6">
              <SectionRow
                title="Workspace access"
                description="Choose which AI capabilities are available across pages, docs, and team knowledge."
              >
                <div className="space-y-3">
                  <Toggle
                    enabled={settings.workspaceAI}
                    onChange={(value) =>
                      setSettings((s) => ({ ...s, workspaceAI: value }))
                    }
                    label="Enable Notion AI for this workspace"
                    description="Lets members draft, summarize, rewrite, and ask questions inside pages they can already access."
                  />
                  <Toggle
                    enabled={settings.pageAutocomplete}
                    onChange={(value) =>
                      setSettings((s) => ({ ...s, pageAutocomplete: value }))
                    }
                    label="Autocomplete while writing"
                    description="Shows inline writing suggestions when members type in pages and docs."
                    disabled={!settings.workspaceAI}
                  />
                  <Toggle
                    enabled={settings.inlineTranslate}
                    onChange={(value) =>
                      setSettings((s) => ({ ...s, inlineTranslate: value }))
                    }
                    label="Translation and tone adjustments"
                    description="Allows AI to translate selected text and apply tone changes like concise, polished, or friendly."
                    disabled={!settings.workspaceAI}
                  />
                </div>
              </SectionRow>

              <SectionRow
                title="Knowledge and search"
                description="Decide how AI can answer questions using workspace content and external sources."
              >
                <div className="space-y-3">
                  <Toggle
                    enabled={settings.wikiAnswers}
                    onChange={(value) =>
                      setSettings((s) => ({ ...s, wikiAnswers: value }))
                    }
                    label="Answer from workspace knowledge"
                    description="AI can summarize wikis, project docs, and meeting notes from content members already have permission to see."
                    disabled={!settings.workspaceAI}
                  />
                  <Toggle
                    enabled={settings.meetingNotes}
                    onChange={(value) =>
                      setSettings((s) => ({ ...s, meetingNotes: value }))
                    }
                    label="Generate meeting notes and action items"
                    description="Creates summaries, decisions, and next steps from synced meeting transcripts and notes."
                    disabled={!settings.workspaceAI}
                  />
                  <Toggle
                    enabled={settings.webSearch}
                    onChange={(value) =>
                      setSettings((s) => ({ ...s, webSearch: value }))
                    }
                    label="Allow web search in AI responses"
                    description="Adds recent web results when workspace content isn’t enough. Responses will show when outside sources were used."
                    disabled={!settings.workspaceAI}
                  />
                </div>
              </SectionRow>

              <SectionRow
                title="Privacy and retention"
                description="Review how workspace content is handled when members use AI features."
                action={
                  <button
                    type="button"
                    className="min-h-12 rounded-full bg-stone-100 px-4 text-[13px] font-medium text-stone-800 transition-[transform,background-color] duration-150 ease-out hover:bg-stone-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/15"
                  >
                    View policy
                  </button>
                }
              >
                <div className="space-y-3">
                  <Toggle
                    enabled={settings.dataTraining}
                    onChange={(value) =>
                      setSettings((s) => ({ ...s, dataTraining: value }))
                    }
                    label="Allow content to improve AI features"
                    description="If enabled, eligible workspace interactions may be reviewed to improve product quality. Disabled by default for Enterprise plans."
                    disabled
                  />
                  <Toggle
                    enabled={settings.enterpriseControls}
                    onChange={(value) =>
                      setSettings((s) => ({ ...s, enterpriseControls: value }))
                    }
                    label="Use enterprise retention controls"
                    description="Applies your workspace retention window to saved AI transcripts, generated notes, and admin audit logs."
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-stone-200 bg-[#fcfcfa] p-4">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-[12px] text-stone-500">
                        Retention window
                      </dt>
                      <dd className="mt-1 text-[14px] font-medium text-stone-900">
                        30 days
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-stone-500">
                        External search
                      </dt>
                      <dd className="mt-1 text-[14px] font-medium text-stone-900">
                        Logged in audit history
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-stone-500">
                        Model provider region
                      </dt>
                      <dd className="mt-1 text-[14px] font-medium text-stone-900">
                        US and EU supported
                      </dd>
                    </div>
                  </dl>
                </div>
              </SectionRow>
            </div>

            <aside className="space-y-6">
              <SectionRow
                title="Plan and controls"
                description="Current workspace permissions and feature availability."
              >
                <div className="rounded-2xl border border-stone-200 bg-[#fcfcfa] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] text-stone-500">Current plan</p>
                      <p className="mt-1 text-[15px] font-medium text-stone-950">
                        Enterprise · Notion AI enabled
                      </p>
                    </div>
                    <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-medium text-white">
                      Active
                    </span>
                  </div>
                  <ul className="mt-4 space-y-3 text-[13px] leading-5 text-stone-600">
                    <li>• SAML and SCIM controls are applied to AI seat access.</li>
                    <li>• Guest users can ask AI only in pages they can open.</li>
                    <li>• Audit history is available to workspace owners and admins.</li>
                  </ul>
                </div>
              </SectionRow>

              <SectionRow
                title="Recent admin activity"
                description="The latest workspace-level changes related to Notion AI."
                action={
                  <button
                    type="button"
                    className="min-h-12 rounded-full bg-stone-100 px-4 text-[13px] font-medium text-stone-800 transition-[transform,background-color] duration-150 ease-out hover:bg-stone-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/15"
                  >
                    Open audit log
                  </button>
                }
              >
                <ul className="space-y-3">
                  {auditRows.map((row) => (
                    <li
                      key={row.name}
                      className="rounded-2xl border border-stone-200 bg-[#fcfcfa] p-4"
                    >
                      <p className="text-[14px] font-medium text-stone-900">
                        {row.name}
                      </p>
                      <div className="mt-1 flex flex-col gap-1 text-[12px] text-stone-500 sm:flex-row sm:items-center sm:justify-between">
                        <span>{row.detail}</span>
                        <span className="[font-variant-numeric:tabular-nums]">
                          {row.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionRow>

              <SectionRow
                title="Need a second set of eyes?"
                description="Before you change workspace-wide AI behavior, notify your admins or review the permission model."
              >
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <button
                    type="button"
                    className="min-h-12 rounded-full bg-stone-900 px-4 text-[13px] font-medium text-white transition-[transform,background-color] duration-150 ease-out hover:bg-stone-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/15"
                  >
                    Notify admins
                  </button>
                  <button
                    type="button"
                    className="min-h-12 rounded-full bg-stone-100 px-4 text-[13px] font-medium text-stone-800 transition-[transform,background-color] duration-150 ease-out hover:bg-stone-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/15"
                  >
                    Review permissions
                  </button>
                </div>
              </SectionRow>
            </aside>
          </main>
        )}
      </div>
    </div>
  );
}
