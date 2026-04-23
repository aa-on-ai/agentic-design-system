"use client";

import React, { useMemo, useState } from "react";

type Filter = "unresolved" | "resolved" | "all";
type ViewState = "loaded" | "loading" | "empty" | "error";

type Reply = {
  id: string;
  author: string;
  initials: string;
  role: string;
  time: string;
  body: string;
};

type CommentThread = {
  id: string;
  status: "unresolved" | "resolved";
  x: number;
  y: number;
  page: string;
  author: string;
  initials: string;
  role: string;
  time: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  } | null;
  title: string;
  body: string;
  tags: string[];
  replies: Reply[];
};

const threads: CommentThread[] = [
  {
    id: "C-184",
    status: "unresolved",
    x: 284,
    y: 116,
    page: "Marketing site / Hero",
    author: "Maya Chen",
    initials: "MC",
    role: "Product design",
    time: "8 min ago",
    assignee: { name: "Alex Park", initials: "AP", color: "bg-emerald-500" },
    title: "Headline wraps awkwardly at 1280px",
    body: "The second line feels too short once the browser gets wider than the artboard. Can we rebalance the measure so “ship faster” stays with the main phrase?",
    tags: ["Desktop", "Typography"],
    replies: [
      {
        id: "R-184-1",
        author: "Alex Park",
        initials: "AP",
        role: "Design systems",
        time: "5 min ago",
        body: "I can tighten the max width and nudge the supporting copy down 4px so the heading balances better.",
      },
      {
        id: "R-184-2",
        author: "Maya Chen",
        initials: "MC",
        role: "Product design",
        time: "3 min ago",
        body: "Perfect — also check the tablet breakpoint while you’re there.",
      },
    ],
  },
  {
    id: "C-179",
    status: "unresolved",
    x: 640,
    y: 388,
    page: "Editor / Right panel",
    author: "Jordan Rivera",
    initials: "JR",
    role: "Design lead",
    time: "22 min ago",
    assignee: { name: "Nina Shah", initials: "NS", color: "bg-violet-500" },
    title: "Selection state needs stronger contrast",
    body: "When a layer is selected, the blue outline is getting lost against the inspector background. We should make the active state clearer without adding more chrome.",
    tags: ["Accessibility", "Selection"],
    replies: [
      {
        id: "R-179-1",
        author: "Nina Shah",
        initials: "NS",
        role: "Frontend",
        time: "14 min ago",
        body: "Agreed. I’ll shift the neutral surface warmer and use a darker outline for the active row instead of a brighter fill.",
      },
    ],
  },
  {
    id: "C-171",
    status: "resolved",
    x: 112,
    y: 540,
    page: "Components / Buttons",
    author: "Theo Martin",
    initials: "TM",
    role: "Brand",
    time: "Yesterday",
    assignee: { name: "Priya Singh", initials: "PS", color: "bg-amber-500" },
    title: "Primary button radius now matches the new token",
    body: "This looks correct after the radius update. Marking as resolved unless anyone still sees the old 10px value in variants.",
    tags: ["Tokens", "Buttons"],
    replies: [
      {
        id: "R-171-1",
        author: "Priya Singh",
        initials: "PS",
        role: "Frontend",
        time: "Yesterday",
        body: "Synced the component library and detached local overrides. Should be consistent now.",
      },
    ],
  },
  {
    id: "C-163",
    status: "resolved",
    x: 812,
    y: 208,
    page: "Onboarding / Empty state",
    author: "Elena Torres",
    initials: "ET",
    role: "UX writing",
    time: "2 days ago",
    assignee: null,
    title: "Copy update shipped",
    body: "The empty state now tells people what this panel is for and what to do next. We can close this thread.",
    tags: ["Copy", "Empty state"],
    replies: [],
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Avatar({
  initials,
  color = "bg-stone-300",
  size = "md",
}: {
  initials: string;
  color?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full text-white shadow-sm outline outline-1 outline-black/5",
        size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs",
        color
      )}
      aria-hidden="true"
    >
      <span className="font-semibold tracking-[0.02em]">{initials}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: CommentThread["status"] }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        status === "unresolved"
          ? "bg-amber-100 text-amber-800"
          : "bg-emerald-100 text-emerald-800"
      )}
    >
      <span
        className={cx(
          "h-1.5 w-1.5 rounded-full",
          status === "unresolved" ? "bg-amber-500" : "bg-emerald-500"
        )}
      />
      {status === "unresolved" ? "Unresolved" : "Resolved"}
    </span>
  );
}

function ThreadCard({ thread }: { thread: CommentThread }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.03)] ring-1 ring-black/5 transition-colors duration-200 hover:ring-black/10">
      <div className="flex items-start gap-3">
        <Avatar initials={thread.author.split(" ").map((n) => n[0]).join("").slice(0, 2)} color="bg-stone-800" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-950 [text-wrap:balance]">
              {thread.title}
            </h3>
            <StatusBadge status={thread.status} />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
            <span className="font-medium text-stone-700">{thread.author}</span>
            <span>{thread.role}</span>
            <span aria-hidden="true">•</span>
            <span>{thread.time}</span>
            <span aria-hidden="true">•</span>
            <span className="truncate">{thread.page}</span>
          </div>

          <p className="mt-3 text-sm leading-6 text-stone-700 [text-wrap:pretty]">
            {thread.body}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600"
              >
                {tag}
              </span>
            ))}
            <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-500">
              #{thread.id}
            </span>
            <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-500 tabular-nums">
              {thread.x}, {thread.y}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-stone-50 p-3 ring-1 ring-inset ring-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Assignee</span>
            {thread.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar
                  initials={thread.assignee.initials}
                  color={thread.assignee.color}
                  size="sm"
                />
                <span className="text-sm font-medium text-stone-800">
                  {thread.assignee.name}
                </span>
              </div>
            ) : (
              <span className="text-sm text-stone-500">Unassigned</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-stone-200">
              {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
            </span>
            <button className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-stone-700 transition-[background-color,color,transform] duration-150 hover:bg-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-300">
              Jump to canvas
            </button>
            <button className="inline-flex h-9 items-center rounded-lg bg-stone-900 px-3 text-sm font-medium text-white transition-[background-color,transform] duration-150 hover:bg-stone-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-400">
              Reply
            </button>
          </div>
        </div>

        {thread.replies.length > 0 && (
          <div className="mt-4 space-y-3 border-l border-stone-200 pl-4">
            {thread.replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-3">
                <Avatar initials={reply.initials} color="bg-stone-400" size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium text-stone-800">
                      {reply.author}
                    </span>
                    <span className="text-xs text-stone-500">{reply.role}</span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-500">{reply.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                    {reply.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function ThreadSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.03)] ring-1 ring-black/5">
      <div className="animate-pulse">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-stone-200" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-2/3 rounded bg-stone-200" />
            <div className="h-3 w-1/2 rounded bg-stone-100" />
            <div className="space-y-2 pt-1">
              <div className="h-3 rounded bg-stone-100" />
              <div className="h-3 w-11/12 rounded bg-stone-100" />
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-stone-50 p-3">
          <div className="h-3 w-40 rounded bg-stone-200" />
          <div className="mt-4 space-y-2">
            <div className="h-3 rounded bg-stone-100" />
            <div className="h-3 w-10/12 rounded bg-stone-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommentsPanelPage() {
  const [filter, setFilter] = useState<Filter>("unresolved");
  const [viewState, setViewState] = useState<ViewState>("loaded");

  const filteredThreads = useMemo(() => {
    if (viewState !== "loaded") return [];

    if (filter === "all") return threads;
    return threads.filter((thread) => thread.status === filter);
  }, [filter, viewState]);

  const unresolvedCount = threads.filter((t) => t.status === "unresolved").length;
  const resolvedCount = threads.filter((t) => t.status === "resolved").length;

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-stone-950 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] bg-[#fcfbf8] shadow-[0_1px_2px_rgba(0,0,0,0.05),0_24px_80px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
          <div className="grid min-h-[760px] grid-cols-1 lg:grid-cols-[1.15fr_360px]">
            <section className="border-b border-stone-200/80 lg:border-b-0 lg:border-r">
              <div className="flex h-full flex-col">
                <div className="border-b border-stone-200/80 px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                        Review session
                      </p>
                      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 [text-wrap:balance] sm:text-[28px]">
                        Comments
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                        Review feedback across frames, keep open issues visible, and
                        resolve threads once the design is aligned.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setViewState("loading")}
                        className="inline-flex h-10 items-center rounded-xl bg-white px-3.5 text-sm font-medium text-stone-700 ring-1 ring-stone-200 transition-[background-color,color,transform] duration-150 hover:bg-stone-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-300"
                      >
                        Show loading
                      </button>
                      <button
                        onClick={() => setViewState("empty")}
                        className="inline-flex h-10 items-center rounded-xl bg-white px-3.5 text-sm font-medium text-stone-700 ring-1 ring-stone-200 transition-[background-color,color,transform] duration-150 hover:bg-stone-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-300"
                      >
                        Show empty
                      </button>
                      <button
                        onClick={() => setViewState("error")}
                        className="inline-flex h-10 items-center rounded-xl bg-white px-3.5 text-sm font-medium text-stone-700 ring-1 ring-stone-200 transition-[background-color,color,transform] duration-150 hover:bg-stone-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-300"
                      >
                        Show error
                      </button>
                      <button
                        onClick={() => setViewState("loaded")}
                        className="inline-flex h-10 items-center rounded-xl bg-stone-900 px-3.5 text-sm font-medium text-white transition-[background-color,transform] duration-150 hover:bg-stone-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-400"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div
                      className="inline-flex w-full max-w-full rounded-xl bg-stone-100 p-1 ring-1 ring-inset ring-stone-200 md:w-auto"
                      role="tablist"
                      aria-label="Comment filters"
                    >
                      {[
                        { key: "unresolved", label: "Unresolved", count: unresolvedCount },
                        { key: "resolved", label: "Resolved", count: resolvedCount },
                        { key: "all", label: "All comments", count: threads.length },
                      ].map((item) => {
                        const active = filter === item.key;
                        return (
                          <button
                            key={item.key}
                            role="tab"
                            aria-selected={active}
                            onClick={() => {
                              setFilter(item.key as Filter);
                              if (viewState !== "loaded") setViewState("loaded");
                            }}
                            className={cx(
                              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 focus:outline-none focus:ring-2 focus:ring-stone-300 md:min-w-[132px]",
                              active
                                ? "bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
                                : "text-stone-600 hover:text-stone-900"
                            )}
                          >
                            <span>{item.label}</span>
                            <span
                              className={cx(
                                "rounded-full px-2 py-0.5 text-[11px] tabular-nums",
                                active
                                  ? "bg-stone-100 text-stone-700"
                                  : "bg-stone-200/70 text-stone-600"
                              )}
                            >
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <span className="hidden sm:inline">Sorted by latest activity</span>
                      <button className="inline-flex h-11 items-center rounded-xl bg-white px-3.5 font-medium text-stone-700 ring-1 ring-stone-200 transition-[background-color,color,transform] duration-150 hover:bg-stone-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-300">
                        New comment
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
                  {viewState === "loading" && (
                    <div className="space-y-4" aria-live="polite" aria-busy="true">
                      <ThreadSkeleton />
                      <ThreadSkeleton />
                      <ThreadSkeleton />
                    </div>
                  )}

                  {viewState === "error" && (
                    <div className="flex min-h-[420px] items-center justify-center">
                      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.03)] ring-1 ring-black/5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 8v4m0 4h.01" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-stone-950">
                          We couldn&apos;t load comments
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                          The comment service didn&apos;t respond. Try again to reload the
                          latest threads for this file.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            onClick={() => setViewState("loaded")}
                            className="inline-flex h-11 items-center rounded-xl bg-stone-900 px-4 text-sm font-medium text-white transition-[background-color,transform] duration-150 hover:bg-stone-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-400"
                          >
                            Try again
                          </button>
                          <button
                            onClick={() => setViewState("empty")}
                            className="inline-flex h-11 items-center rounded-xl bg-white px-4 text-sm font-medium text-stone-700 ring-1 ring-stone-200 transition-[background-color,color,transform] duration-150 hover:bg-stone-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-300"
                          >
                            View empty state
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewState === "empty" && (
                    <div className="flex min-h-[420px] items-center justify-center">
                      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.03)] ring-1 ring-black/5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700 ring-1 ring-stone-200">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M8 12h8M8 8h5m-5 8h6" strokeLinecap="round" />
                            <path d="M6 4h12a2 2 0 0 1 2 2v8.5a2 2 0 0 1-.59 1.41l-2.5 2.5A2 2 0 0 1 15.5 19H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-stone-950">
                          No comments in this view
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                          {filter === "resolved"
                            ? "Resolved threads will appear here after reviewers close feedback on the canvas."
                            : filter === "unresolved"
                            ? "Open feedback will appear here once collaborators add comments to the file."
                            : "Comments from this file will appear here as your team starts reviewing."}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            onClick={() => setViewState("loaded")}
                            className="inline-flex h-11 items-center rounded-xl bg-stone-900 px-4 text-sm font-medium text-white transition-[background-color,transform] duration-150 hover:bg-stone-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-400"
                          >
                            Reload comments
                          </button>
                          <button
                            onClick={() => setFilter("all")}
                            className="inline-flex h-11 items-center rounded-xl bg-white px-4 text-sm font-medium text-stone-700 ring-1 ring-stone-200 transition-[background-color,color,transform] duration-150 hover:bg-stone-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-stone-300"
                          >
                            View all comments
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewState === "loaded" && (
                    <div className="space-y-4">
                      {filteredThreads.length > 0 ? (
                        filteredThreads.map((thread) => (
                          <ThreadCard key={thread.id} thread={thread} />
                        ))
                      ) : (
                        <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white p-6 ring-1 ring-black/5">
                          <div className="max-w-sm text-center">
                            <h2 className="text-lg font-semibold text-stone-950">
                              Nothing matches this filter
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                              Try a different comment view or reset the filter to see all
                              threads for this file.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="bg-[#faf8f4]">
              <div className="flex h-full flex-col">
                <div className="border-b border-stone-200/80 px-4 py-4 sm:px-6">
                  <h2 className="text-sm font-semibold text-stone-900">Review summary</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                    Keep the panel focused on what still needs a decision.
                  </p>
                </div>

                <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6">
                  <section className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.03)] ring-1 ring-black/5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-stone-500">Open threads</p>
                        <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-950 tabular-nums">
                          {unresolvedCount}
                        </p>
                      </div>
                      <div className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        Needs review
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                      Most active in hero layout and right-side inspector states.
                    </p>
                  </section>

                  <section className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.03)] ring-1 ring-black/5">
                    <h3 className="text-sm font-semibold text-stone-900">
                      Assigned teammates
                    </h3>
                    <div className="mt-4 space-y-3">
                      {[
                        { name: "Alex Park", initials: "AP", color: "bg-emerald-500", count: 1 },
                        { name: "Nina Shah", initials: "NS", color: "bg-violet-500", count: 1 },
                        { name: "Priya Singh", initials: "PS", color: "bg-amber-500", count: 1 },
                      ].map((person) => (
                        <div
                          key={person.name}
                          className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2.5 ring-1 ring-inset ring-stone-200"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar initials={person.initials} color={person.color} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-stone-800">
                                {person.name}
                              </p>
                              <p className="text-xs text-stone-500">Comment assignee</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-stone-600 tabular-nums">
                            {person.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.03)] ring-1 ring-black/5">
                    <h3 className="text-sm font-semibold text-stone-900">Recent activity</h3>
                    <div className="mt-4 space-y-4">
                      {[
                        {
                          label: "Alex replied on C-184",
                          detail: "Hero heading wrap reviewed 5 min ago",
                        },
                        {
                          label: "Nina picked up C-179",
                          detail: "Selection contrast update planned 14 min ago",
                        },
                        {
                          label: "C-171 marked resolved",
                          detail: "Button radius token synced yesterday",
                        },
                      ].map((item) => (
                        <div key={item.label} className="flex gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-stone-400" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-800">
                              {item.label}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-stone-500">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl bg-stone-900 p-4 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.16)]">
                    <h3 className="text-sm font-semibold">Review checklist</h3>
                    <ul className="mt-4 space-y-3 text-sm text-stone-300">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-white/70" />
                        Confirm mobile and tablet breakpoints before resolving layout notes.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-white/70" />
                        Keep active states visible without relying on color alone.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-white/70" />
                        Close threads only after the assignee verifies the final frame.
                      </li>
                    </ul>
                  </section>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
