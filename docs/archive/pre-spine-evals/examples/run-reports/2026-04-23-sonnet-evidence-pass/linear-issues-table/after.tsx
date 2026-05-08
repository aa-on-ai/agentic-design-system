"use client";

import React, { useMemo, useState } from "react";

type Status = "Backlog" | "Todo" | "In Progress" | "In Review" | "Done";
type Priority = "No priority" | "Low" | "Medium" | "High" | "Urgent";

type Issue = {
  id: string;
  title: string;
  team: string;
  project: string;
  assignee: string;
  status: Status;
  priority: Priority;
  estimate: number;
  updated: string;
};

const issuesSeed: Issue[] = [
  {
    id: "ENG-1842",
    title: "Improve issue hover preview latency in command menu",
    team: "Platform",
    project: "Tracker",
    assignee: "Maya Chen",
    status: "In Progress",
    priority: "High",
    estimate: 5,
    updated: "12 min ago",
  },
  {
    id: "ENG-1837",
    title: "Add bulk archive guardrails for completed cycles",
    team: "Core",
    project: "Cycles",
    assignee: "Evan Brooks",
    status: "In Review",
    priority: "Medium",
    estimate: 3,
    updated: "35 min ago",
  },
  {
    id: "ENG-1821",
    title: "Fix keyboard focus trap in issue detail sheet",
    team: "Accessibility",
    project: "Tracker",
    assignee: "Priya Nair",
    status: "Todo",
    priority: "Urgent",
    estimate: 2,
    updated: "1 hour ago",
  },
  {
    id: "ENG-1816",
    title: "Support long project names in compact list rows",
    team: "Product",
    project: "Workspace Navigation",
    assignee: "Jonas Kim",
    status: "Backlog",
    priority: "Low",
    estimate: 1,
    updated: "3 hours ago",
  },
  {
    id: "ENG-1809",
    title: "Unify status badges between board and list surfaces",
    team: "Design Systems",
    project: "UI Foundation",
    assignee: "Nadia Patel",
    status: "Done",
    priority: "Medium",
    estimate: 3,
    updated: "Yesterday",
  },
  {
    id: "ENG-1798",
    title: "Reduce table row repaint when selection changes rapidly",
    team: "Performance",
    project: "Tracker",
    assignee: "Owen Diaz",
    status: "In Progress",
    priority: "High",
    estimate: 8,
    updated: "2 hours ago",
  },
  {
    id: "ENG-1785",
    title: "Clarify empty state copy for first project import",
    team: "Growth",
    project: "Onboarding",
    assignee: "Ava Wilson",
    status: "Todo",
    priority: "No priority",
    estimate: 2,
    updated: "4 hours ago",
  },
  {
    id: "ENG-1769",
    title: "Persist list density preference per workspace",
    team: "Platform",
    project: "Preferences",
    assignee: "Leo Martin",
    status: "In Review",
    priority: "Low",
    estimate: 2,
    updated: "5 hours ago",
  },
];

const statusOptions: Status[] = ["Backlog", "Todo", "In Progress", "In Review", "Done"];
const priorityOptions: Priority[] = ["No priority", "Low", "Medium", "High", "Urgent"];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusDot({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Backlog: "bg-zinc-400",
    Todo: "bg-slate-500",
    "In Progress": "bg-blue-500",
    "In Review": "bg-amber-500",
    Done: "bg-emerald-500",
  };

  return <span className={cn("h-2.5 w-2.5 rounded-full", styles[status])} aria-hidden="true" />;
}

function PriorityCell({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    "No priority": "text-zinc-500",
    Low: "text-sky-700",
    Medium: "text-amber-700",
    High: "text-orange-700",
    Urgent: "text-rose-700",
  };

  const marks: Record<Priority, string> = {
    "No priority": "—",
    Low: "↓",
    Medium: "→",
    High: "↑",
    Urgent: "!!",
  };

  return (
    <div className={cn("inline-flex items-center gap-2 text-sm font-medium", styles[priority])}>
      <span className="inline-flex min-w-5 justify-center font-semibold">{marks[priority]}</span>
      <span>{priority}</span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-zinc-200">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="grid min-h-[68px] grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1.7fr)_120px_150px_130px_100px] sm:items-center sm:gap-4 sm:px-6"
        >
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
          </div>
          <div className="hidden h-4 w-24 animate-pulse rounded bg-zinc-200 sm:block" />
          <div className="hidden h-4 w-28 animate-pulse rounded bg-zinc-200 sm:block" />
          <div className="hidden h-4 w-20 animate-pulse rounded bg-zinc-200 sm:block" />
          <div className="hidden h-4 w-16 animate-pulse rounded bg-zinc-200 sm:block" />
        </div>
      ))}
    </div>
  );
}

export default function IssueListPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [stateMode, setStateMode] = useState<"loaded" | "loading" | "empty" | "error">("loaded");
  const [starred, setStarred] = useState<Record<string, boolean>>({});

  const filteredIssues = useMemo(() => {
    if (stateMode === "empty") return [];

    return issuesSeed.filter((issue) => {
      const matchesQuery =
        issue.title.toLowerCase().includes(query.toLowerCase()) ||
        issue.id.toLowerCase().includes(query.toLowerCase()) ||
        issue.project.toLowerCase().includes(query.toLowerCase()) ||
        issue.assignee.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || issue.priority === priorityFilter;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [query, statusFilter, priorityFilter, stateMode]);

  const counts = useMemo(() => {
    const openCount = issuesSeed.filter((i) => i.status !== "Done").length;
    const urgentCount = issuesSeed.filter((i) => i.priority === "Urgent").length;
    const reviewCount = issuesSeed.filter((i) => i.status === "In Review").length;
    return { openCount, urgentCount, reviewCount };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-zinc-950 antialiased">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.06)] outline outline-1 outline-black/5">
          <header className="sticky top-0 z-20 border-b border-zinc-200/90 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Project tracker
                  </p>
                  <div className="space-y-1">
                    <h1 className="text-balance text-2xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl">
                      Active issues
                    </h1>
                    <p className="max-w-2xl text-pretty text-sm text-zinc-600 sm:text-[15px]">
                      Triage, prioritize, and move work forward without leaving the list.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-2xl bg-zinc-50 px-3 py-3 outline outline-1 outline-zinc-200">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                      Open
                    </div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">{counts.openCount}</div>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 px-3 py-3 outline outline-1 outline-zinc-200">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                      Urgent
                    </div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">{counts.urgentCount}</div>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 px-3 py-3 outline outline-1 outline-zinc-200">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                      Review
                    </div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">{counts.reviewCount}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 flex-col gap-3 md:flex-row">
                  <label className="relative block w-full md:max-w-sm">
                    <span className="sr-only">Search issues</span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                      aria-hidden="true"
                    >
                      <path
                        d="M8.5 14.5a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm8 3-4.35-4.35"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by title, issue, project, or assignee"
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-4 text-sm text-zinc-950 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
                    />
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="block">
                      <span className="sr-only">Filter by status</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as Status | "All")}
                        className="h-12 min-w-[168px] rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-800 outline-none transition-[border-color,box-shadow] duration-200 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
                      >
                        <option value="All">All statuses</option>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="sr-only">Filter by priority</span>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as Priority | "All")}
                        className="h-12 min-w-[168px] rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-800 outline-none transition-[border-color,box-shadow] duration-200 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
                      >
                        <option value="All">All priorities</option>
                        {priorityOptions.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  className="flex flex-wrap items-center gap-2 rounded-2xl bg-zinc-50 p-1 outline outline-1 outline-zinc-200"
                  aria-label="Preview list states"
                >
                  {(["loaded", "loading", "empty", "error"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setStateMode(mode)}
                      className={cn(
                        "h-10 rounded-xl px-3 text-sm font-medium capitalize transition-[background-color,color,transform] duration-150 active:scale-[0.97]",
                        stateMode === mode
                          ? "bg-white text-zinc-950 shadow-sm outline outline-1 outline-zinc-200"
                          : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <section aria-label="Issue list" className="min-h-[480px]">
            <div className="hidden grid-cols-[minmax(0,1.7fr)_120px_150px_130px_100px_96px] border-b border-zinc-200 bg-zinc-50/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500 sm:grid">
              <div>Issue</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Assignee</div>
              <div>Updated</div>
              <div className="text-right">Actions</div>
            </div>

            {stateMode === "loading" ? (
              <SkeletonRows />
            ) : stateMode === "error" ? (
              <div className="flex min-h-[420px] items-center justify-center px-6 py-10">
                <div className="max-w-md rounded-[24px] bg-zinc-50 p-8 text-left outline outline-1 outline-zinc-200">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 outline outline-1 outline-rose-100">
                    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                      <path
                        d="M10 6v4m0 4h.01M3.8 15.5h12.4a1 1 0 0 0 .88-1.47L10.88 3.3a1 1 0 0 0-1.76 0L2.92 14.03a1 1 0 0 0 .88 1.47Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-balance text-xl font-semibold tracking-[-0.02em] text-zinc-950">
                    We couldn’t load issues
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    The tracker didn’t respond in time. Try again to refresh the latest updates.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStateMode("loaded")}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-sm font-medium text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
                    >
                      Try again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setStatusFilter("All");
                        setPriorityFilter("All");
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 transition-[background-color,transform] duration-150 hover:bg-zinc-50 active:scale-[0.97]"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="flex min-h-[420px] items-center justify-center px-6 py-10">
                <div className="max-w-md rounded-[24px] bg-zinc-50 p-8 text-left outline outline-1 outline-zinc-200">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-700 outline outline-1 outline-zinc-200">
                    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                      <path
                        d="M3 5.5h14M6.5 10h7M8 14.5h4"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-balance text-xl font-semibold tracking-[-0.02em] text-zinc-950">
                    No issues match these filters
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Try a broader search, remove a filter, or create a new issue to get work moving.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setStatusFilter("All");
                        setPriorityFilter("All");
                        setStateMode("loaded");
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-sm font-medium text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
                    >
                      Reset filters
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 transition-[background-color,transform] duration-150 hover:bg-zinc-50 active:scale-[0.97]"
                    >
                      Create issue
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {filteredIssues.map((issue) => (
                  <article
                    key={issue.id}
                    className="group grid grid-cols-1 gap-3 px-4 py-4 transition-[background-color] duration-150 hover:bg-zinc-50/80 sm:grid-cols-[minmax(0,1.7fr)_120px_150px_130px_100px_96px] sm:items-center sm:gap-4 sm:px-6"
                  >
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          aria-label={starred[issue.id] ? `Unstar ${issue.id}` : `Star ${issue.id}`}
                          onClick={() =>
                            setStarred((prev) => ({
                              ...prev,
                              [issue.id]: !prev[issue.id],
                            }))
                          }
                          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-[background-color,color,transform] duration-150 hover:bg-white hover:text-amber-500 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-zinc-200"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill={starred[issue.id] ? "currentColor" : "none"}
                            className={cn("h-4 w-4", starred[issue.id] && "text-amber-500")}
                            aria-hidden="true"
                          >
                            <path
                              d="m10 2.9 2.18 4.42 4.88.71-3.53 3.44.83 4.85L10 14.02 5.64 16.32l.83-4.85L2.94 8.03l4.88-.71L10 2.9Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                              {issue.id}
                            </span>
                            <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:inline-block" />
                            <span className="text-sm text-zinc-500">{issue.project}</span>
                          </div>
                          <h2 className="mt-1 text-pretty text-sm font-medium leading-6 text-zinc-950 sm:text-[15px]">
                            {issue.title}
                          </h2>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500 sm:hidden">
                            <div className="inline-flex items-center gap-2">
                              <StatusDot status={issue.status} />
                              <span>{issue.status}</span>
                            </div>
                            <span>•</span>
                            <PriorityCell priority={issue.priority} />
                            <span>•</span>
                            <span>{issue.assignee}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600">
                              {issue.team}
                            </span>
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 tabular-nums">
                              {issue.estimate} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <div className="inline-flex items-center gap-2 text-sm text-zinc-700">
                        <StatusDot status={issue.status} />
                        <span>{issue.status}</span>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <PriorityCell priority={issue.priority} />
                    </div>

                    <div className="hidden truncate text-sm text-zinc-700 sm:block">{issue.assignee}</div>

                    <div className="hidden text-sm text-zinc-500 sm:block">{issue.updated}</div>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl text-zinc-500 transition-[background-color,color,transform,opacity] duration-150 hover:bg-white hover:text-zinc-900 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-zinc-200 sm:h-9 sm:min-w-[36px] sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                        aria-label={`Assign ${issue.id}`}
                        title="Assign issue"
                      >
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                          <path
                            d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 7a5 5 0 0 1 10 0"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl text-zinc-500 transition-[background-color,color,transform,opacity] duration-150 hover:bg-white hover:text-zinc-900 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-zinc-200 sm:h-9 sm:min-w-[36px] sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                        aria-label={`Open comments for ${issue.id}`}
                        title="Open comments"
                      >
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                          <path
                            d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6A1.5 1.5 0 0 1 14.5 13H8l-4 3v-3.5A1.5 1.5 0 0 1 2.5 11v-5.5Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl text-zinc-500 transition-[background-color,color,transform,opacity] duration-150 hover:bg-white hover:text-zinc-900 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-zinc-200 sm:h-9 sm:min-w-[36px] sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                        aria-label={`More actions for ${issue.id}`}
                        title="More actions"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                          <circle cx="4" cy="10" r="1.4" />
                          <circle cx="10" cy="10" r="1.4" />
                          <circle cx="16" cy="10" r="1.4" />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="border-t border-zinc-200 bg-zinc-50/60 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing <span className="font-medium tabular-nums text-zinc-800">{filteredIssues.length}</span>{" "}
                issues
              </p>
              <p className="text-pretty">
                Last synced 3 minutes ago · Keyboard shortcuts available in issue detail
              </p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
