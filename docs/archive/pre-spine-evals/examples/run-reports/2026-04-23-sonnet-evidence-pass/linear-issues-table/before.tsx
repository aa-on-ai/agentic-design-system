"use client";

import React, { useMemo, useState } from "react";

type Status = "Backlog" | "Todo" | "In Progress" | "Done" | "Canceled";
type Priority = "No priority" | "Low" | "Medium" | "High" | "Urgent";

type Issue = {
  id: string;
  title: string;
  key: string;
  status: Status;
  priority: Priority;
  assignee: string;
  team: string;
  labels: string[];
  updatedAt: string;
};

const issuesSeed: Issue[] = [
  {
    id: "1",
    key: "ENG-142",
    title: "Improve project switcher keyboard navigation",
    status: "In Progress",
    priority: "High",
    assignee: "Ava",
    team: "Platform",
    labels: ["UX", "Accessibility"],
    updatedAt: "2h",
  },
  {
    id: "2",
    key: "ENG-143",
    title: "Fix sticky header overlap on issue detail panel",
    status: "Todo",
    priority: "Medium",
    assignee: "Noah",
    team: "Frontend",
    labels: ["Bug"],
    updatedAt: "4h",
  },
  {
    id: "3",
    key: "ENG-144",
    title: "Add optimistic updates for inline status changes",
    status: "Backlog",
    priority: "High",
    assignee: "Mia",
    team: "Frontend",
    labels: ["Performance", "UI"],
    updatedAt: "1d",
  },
  {
    id: "4",
    key: "ENG-145",
    title: "Refactor command menu search ranking",
    status: "Done",
    priority: "Low",
    assignee: "Leo",
    team: "Core",
    labels: ["Infra"],
    updatedAt: "2d",
  },
  {
    id: "5",
    key: "ENG-146",
    title: "Investigate API timeout spikes in production",
    status: "In Progress",
    priority: "Urgent",
    assignee: "Emma",
    team: "Backend",
    labels: ["Incident"],
    updatedAt: "35m",
  },
  {
    id: "6",
    key: "ENG-147",
    title: "Create reusable priority cell component",
    status: "Todo",
    priority: "Low",
    assignee: "Liam",
    team: "Design Systems",
    labels: ["Refactor"],
    updatedAt: "6h",
  },
  {
    id: "7",
    key: "ENG-148",
    title: "Add label filters to issue list",
    status: "Backlog",
    priority: "Medium",
    assignee: "Sophia",
    team: "Frontend",
    labels: ["Feature"],
    updatedAt: "3d",
  },
  {
    id: "8",
    key: "ENG-149",
    title: "Resolve flaky integration tests for comments",
    status: "Canceled",
    priority: "No priority",
    assignee: "James",
    team: "QA",
    labels: ["Tests"],
    updatedAt: "5d",
  },
];

const statuses: Status[] = ["Backlog", "Todo", "In Progress", "Done", "Canceled"];
const priorities: Priority[] = ["No priority", "Low", "Medium", "High", "Urgent"];

const statusStyles: Record<Status, string> = {
  Backlog: "bg-zinc-100 text-zinc-700 border-zinc-200",
  Todo: "bg-sky-50 text-sky-700 border-sky-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Canceled: "bg-rose-50 text-rose-700 border-rose-200",
};

const priorityStyles: Record<Priority, string> = {
  "No priority": "bg-zinc-100 text-zinc-600 border-zinc-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-blue-50 text-blue-700 border-blue-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Urgent: "bg-red-50 text-red-700 border-red-200",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Page() {
  const [issues, setIssues] = useState<Issue[]>(issuesSeed);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [teamFilter, setTeamFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const teams = useMemo(
    () => ["All", ...Array.from(new Set(issuesSeed.map((i) => i.team)))],
    []
  );

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesQuery =
        query.trim() === "" ||
        issue.title.toLowerCase().includes(query.toLowerCase()) ||
        issue.key.toLowerCase().includes(query.toLowerCase()) ||
        issue.assignee.toLowerCase().includes(query.toLowerCase()) ||
        issue.labels.some((l) => l.toLowerCase().includes(query.toLowerCase()));

      const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || issue.priority === priorityFilter;
      const matchesTeam = teamFilter === "All" || issue.team === teamFilter;

      return matchesQuery && matchesStatus && matchesPriority && matchesTeam;
    });
  }, [issues, query, statusFilter, priorityFilter, teamFilter]);

  const allVisibleSelected =
    filteredIssues.length > 0 &&
    filteredIssues.every((issue) => selectedIds.includes(issue.id));

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredIssues.some((issue) => issue.id === id))
      );
    } else {
      setSelectedIds((prev) => {
        const merged = new Set(prev);
        filteredIssues.forEach((issue) => merged.add(issue.id));
        return Array.from(merged);
      });
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const cycleStatus = (id: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== id) return issue;
        const nextIndex = (statuses.indexOf(issue.status) + 1) % statuses.length;
        return { ...issue, status: statuses[nextIndex], updatedAt: "now" };
      })
    );
  };

  const cyclePriority = (id: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== id) return issue;
        const nextIndex =
          (priorities.indexOf(issue.priority) + 1) % priorities.length;
        return { ...issue, priority: priorities[nextIndex], updatedAt: "now" };
      })
    );
  };

  const markDone = (id: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, status: "Done", updatedAt: "now" } : issue
      )
    );
  };

  const duplicateIssue = (id: string) => {
    setIssues((prev) => {
      const source = prev.find((i) => i.id === id);
      if (!source) return prev;
      const copy: Issue = {
        ...source,
        id: `${Date.now()}-${Math.random()}`,
        key: `ENG-${150 + prev.length}`,
        title: `${source.title} (Copy)`,
        updatedAt: "now",
      };
      return [copy, ...prev];
    });
  };

  const deleteIssue = (id: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Issues</h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Linear-style tracker with filters, sticky header, editable cells,
                  and inline row actions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
                  Import
                </button>
                <button className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-zinc-200">
                  New issue
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="xl:col-span-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4 text-zinc-500"
                  >
                    <path
                      d="M13.5 13.5L17 17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="8.5"
                      cy="8.5"
                      r="5.75"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search issues, labels, assignee..."
                    className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | "All")}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 outline-none"
              >
                <option value="All">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as Priority | "All")
                }
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 outline-none"
              >
                <option value="All">All priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>

              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 outline-none"
              >
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team === "All" ? "All teams" : team}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                {filteredIssues.length} visible
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                {selectedIds.length} selected
              </span>
              {(query || statusFilter !== "All" || priorityFilter !== "All" || teamFilter !== "All") && (
                <button
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("All");
                    setPriorityFilter("All");
                    setTeamFilter("All");
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300 transition hover:bg-white/[0.08]"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-20 bg-[#111318]/95 backdrop-blur supports-[backdrop-filter]:bg-[#111318]/80">
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="border-b border-white/10 px-4 py-3 font-medium">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      className="h-4 w-4 rounded border-white/20 bg-transparent"
                    />
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 font-medium">
                    Issue
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 font-medium">
                    Status
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 font-medium">
                    Priority
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 font-medium">
                    Assignee
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 font-medium">
                    Team
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 font-medium">
                    Labels
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 font-medium">
                    Updated
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredIssues.map((issue) => {
                  const isSelected = selectedIds.includes(issue.id);

                  return (
                    <tr
                      key={issue.id}
                      onMouseEnter={() => setHoveredRow(issue.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={cx(
                        "group transition",
                        isSelected ? "bg-white/[0.045]" : "hover:bg-white/[0.025]"
                      )}
                    >
                      <td className="border-b border-white/5 px-4 py-3 align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(issue.id)}
                          className="h-4 w-4 rounded border-white/20 bg-transparent"
                        />
                      </td>

                      <td className="border-b border-white/5 px-4 py-3">
                        <div className="flex min-w-[280px] items-start gap-3">
                          <div className="mt-0.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-zinc-400">
                            {issue.key}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-100">
                              {issue.title}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">
                              #{issue.id} · Updated {issue.updatedAt} ago
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="border-b border-white/5 px-4 py-3">
                        <button
                          onClick={() => cycleStatus(issue.id)}
                          className={cx(
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition hover:brightness-95",
                            statusStyles[issue.status]
                          )}
                        >
                          {issue.status}
                        </button>
                      </td>

                      <td className="border-b border-white/5 px-4 py-3">
                        <button
                          onClick={() => cyclePriority(issue.id)}
                          className={cx(
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition hover:brightness-95",
                            priorityStyles[issue.priority]
                          )}
                        >
                          {issue.priority}
                        </button>
                      </td>

                      <td className="border-b border-white/5 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-semibold text-white ring-1 ring-white/10">
                            {issue.assignee.slice(0, 1)}
                          </div>
                          <span className="text-sm text-zinc-300">{issue.assignee}</span>
                        </div>
                      </td>

                      <td className="border-b border-white/5 px-4 py-3 text-sm text-zinc-300">
                        {issue.team}
                      </td>

                      <td className="border-b border-white/5 px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {issue.labels.map((label) => (
                            <span
                              key={label}
                              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-zinc-400"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="border-b border-white/5 px-4 py-3 text-sm text-zinc-400">
                        {issue.updatedAt} ago
                      </td>

                      <td className="border-b border-white/5 px-4 py-3 text-right">
                        <div
                          className={cx(
                            "flex items-center justify-end gap-1 transition",
                            hoveredRow === issue.id || isSelected
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          )}
                        >
                          <button
                            onClick={() => markDone(issue.id)}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
                          >
                            Done
                          </button>
                          <button
                            onClick={() => duplicateIssue(issue.id)}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => deleteIssue(issue.id)}
                            className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredIssues.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-16 text-center text-sm text-zinc-500"
                    >
                      No issues match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-xs text-zinc-500">
            <div>Tip: click status or priority pills to change them inline.</div>
            <div>Sticky header enabled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
