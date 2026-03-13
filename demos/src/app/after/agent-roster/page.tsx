"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  SlidersHorizontal,
  SquareTerminal,
  TriangleAlert,
  X,
} from "lucide-react";

type AgentStatus = "running" | "paused" | "terminated";
type ViewState = "happy" | "loading" | "empty" | "error";

type Agent = {
  id: string;
  name: string;
  model: string;
  status: AgentStatus;
  uptime: string;
  branch: string;
  node: string;
  owner: string;
  lastSeen: string;
};

const AGENTS: Agent[] = [
  {
    id: "oc-201",
    name: "codex-prime",
    model: "gpt-5.4",
    status: "running",
    uptime: "18h 14m",
    branch: "billing-refactor",
    node: "mac-mini-01",
    owner: "pete",
    lastSeen: "12s ago",
  },
  {
    id: "oc-178",
    name: "sonnet-scout",
    model: "claude-sonnet-4.6",
    status: "running",
    uptime: "9h 52m",
    branch: "slack-digest",
    node: "mac-mini-02",
    owner: "maya",
    lastSeen: "29s ago",
  },
  {
    id: "oc-167",
    name: "gemini-mapper",
    model: "gemini-3-pro",
    status: "running",
    uptime: "6h 08m",
    branch: "roadmap-ontology",
    node: "gpu-node-01",
    owner: "joel",
    lastSeen: "41s ago",
  },
  {
    id: "oc-154",
    name: "spark-runner",
    model: "gpt-5.3-codex-spark",
    status: "running",
    uptime: "3h 46m",
    branch: "storybook-fixes",
    node: "edge-lax-01",
    owner: "nina",
    lastSeen: "8s ago",
  },
  {
    id: "oc-149",
    name: "runner-ops",
    model: "gemini-3-flash",
    status: "running",
    uptime: "1h 32m",
    branch: "docs-sync",
    node: "edge-den-02",
    owner: "felipe",
    lastSeen: "1m ago",
  },
  {
    id: "oc-132",
    name: "qwen-utility",
    model: "qwen3.5-9b",
    status: "paused",
    uptime: "22h 05m",
    branch: "health-ping",
    node: "garage-rack-2",
    owner: "pete",
    lastSeen: "4m ago",
  },
  {
    id: "oc-118",
    name: "claude-review",
    model: "claude-opus-4.6",
    status: "paused",
    uptime: "5h 19m",
    branch: "design-preflight",
    node: "mac-mini-03",
    owner: "aaron",
    lastSeen: "7m ago",
  },
  {
    id: "oc-111",
    name: "scout-research",
    model: "gemini-3-pro-preview",
    status: "paused",
    uptime: "11h 24m",
    branch: "market-map",
    node: "gpu-node-02",
    owner: "cristian",
    lastSeen: "12m ago",
  },
  {
    id: "oc-097",
    name: "memory-indexer",
    model: "gpt-5.4",
    status: "paused",
    uptime: "2h 11m",
    branch: "channel-memory",
    node: "mac-mini-02",
    owner: "riteeka",
    lastSeen: "15m ago",
  },
  {
    id: "oc-081",
    name: "ghost-relay",
    model: "override/unknown",
    status: "terminated",
    uptime: "13m",
    branch: "containment-room",
    node: "unknown",
    owner: "unassigned",
    lastSeen: "19m ago",
  },
  {
    id: "oc-074",
    name: "nightly-audit",
    model: "claude-sonnet-4.6",
    status: "terminated",
    uptime: "7h 48m",
    branch: "rule-check",
    node: "mac-mini-01",
    owner: "pete",
    lastSeen: "1h ago",
  },
  {
    id: "oc-063",
    name: "render-batch",
    model: "gpt-5.4",
    status: "terminated",
    uptime: "2h 54m",
    branch: "video-pipeline",
    node: "gpu-node-01",
    owner: "aaron",
    lastSeen: "2h ago",
  },
  {
    id: "oc-052",
    name: "mail-triage",
    model: "claude-sonnet-4.6",
    status: "terminated",
    uptime: "46m",
    branch: "inbox-zero",
    node: "edge-lax-03",
    owner: "maya",
    lastSeen: "3h ago",
  },
];

const STATUS_META: Record<
  AgentStatus,
  {
    label: string;
    dot: string;
    dotRing: string;
    headerCount: number;
    text: string;
  }
> = {
  running: {
    label: "Running",
    dot: "bg-emerald-500",
    dotRing: "ring-emerald-100",
    headerCount: 31,
    text: "text-emerald-700",
  },
  paused: {
    label: "Paused",
    dot: "bg-amber-500",
    dotRing: "ring-amber-100",
    headerCount: 8,
    text: "text-amber-700",
  },
  terminated: {
    label: "Terminated",
    dot: "bg-rose-500",
    dotRing: "ring-rose-100",
    headerCount: 8,
    text: "text-rose-700",
  },
};

const FILTER_TABS = ["All agents", "Assigned to Pete", "Needs review", "Recently terminated"];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function StatusDot({ status }: { status: AgentStatus }) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex h-2.5 w-2.5 shrink-0 rounded-full ring-4",
        meta.dot,
        meta.dotRing,
      )}
      aria-hidden="true"
    />
  );
}

function LoadingRows() {
  return (
    <div className="border border-[#e8ebf2] bg-white">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="flex h-14 items-center gap-3 border-b border-[#eef1f6] px-4 last:border-b-0"
        >
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#d7dde8]" />
          <div className="min-w-0 flex-1">
            <div className="h-3.5 w-36 animate-pulse rounded bg-[#edf1f7]" />
          </div>
          <div className="hidden h-5 w-24 animate-pulse rounded-full bg-[#f1f4f8] md:block" />
          <div className="h-3.5 w-16 animate-pulse rounded bg-[#edf1f7]" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-[#d8dee8] bg-[#fcfcfd] px-8 py-16 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#e6eaf1] bg-white text-[#6b7280]">
          <SquareTerminal className="h-4 w-4" />
        </div>
        <h2 className="text-[14px] font-semibold text-[#111827]">No agents match this view</h2>
        <p className="text-[13px] leading-6 text-[#6b7280]">
          The roster is empty right now. Clear a filter or start a new agent to repopulate the queue.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border border-[#f2d8d8] bg-[#fffdfd] px-8 py-16 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#f3d6d6] bg-white text-[#b42318]">
          <TriangleAlert className="h-4 w-4" />
        </div>
        <h2 className="text-[14px] font-semibold text-[#111827]">Couldn’t load live roster data</h2>
        <p className="text-[13px] leading-6 text-[#6b7280]">
          The relay responded with an error. Existing agents are likely still running, but this view
          is stale until telemetry reconnects.
        </p>
        <div>
          <button
            onClick={onRetry}
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#dbe4f0] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:border-[#c8d4e3] hover:bg-[#f9fbfd]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentRow({ agent, index }: { agent: Agent; index: number }) {
  const statusMeta = STATUS_META[agent.status];

  return (
    <div
      className="group flex h-14 items-center gap-3 border-b border-[#eef1f6] px-4 text-[14px] text-[#111827] transition-all duration-150 ease-out hover:translate-x-[2px] hover:bg-[#f7f9fc] last:border-b-0 motion-reduce:transition-none motion-reduce:hover:translate-x-0"
      style={{
        animation: "roster-enter 360ms cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: `${index * 30}ms`,
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <StatusDot status={agent.status} />

        <div className="min-w-0 flex-1 md:flex md:items-center md:gap-3">
          <div className="min-w-0 md:w-[28%] md:min-w-[180px]">
            <div className="truncate font-semibold text-[#111827]">{agent.name}</div>
            <div className="truncate text-[11px] text-[#9aa3b2] md:hidden">
              {agent.branch} · {agent.owner}
            </div>
          </div>

          <div className="hidden min-w-0 md:block md:w-[20%]">
            <span className="inline-flex h-6 items-center rounded-full border border-[#e5e9f0] bg-[#f8fafc] px-2.5 text-[11px] font-medium text-[#6b7280]">
              {agent.model}
            </span>
          </div>

          <div className="hidden min-w-0 text-[13px] text-[#6b7280] lg:block lg:w-[24%]">
            <span className="truncate">{agent.branch}</span>
          </div>

          <div className="hidden min-w-0 text-[13px] text-[#6b7280] xl:block xl:w-[16%]">
            <span className="truncate">{agent.node}</span>
          </div>
        </div>
      </div>

      <div className="hidden text-right text-[13px] text-[#6b7280] sm:block sm:w-[84px]">
        {agent.lastSeen}
      </div>

      <div className="w-[72px] text-right text-[13px] text-[#6b7280]">{agent.uptime}</div>

      <div className="flex w-[92px] items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none">
        <button
          className="inline-flex min-h-12 items-center rounded-md px-2 text-[13px] font-medium text-[#6b7280] transition hover:bg-white hover:text-[#111827]"
          aria-label={`More actions for ${agent.name}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <button
          className={cn(
            "inline-flex min-h-12 items-center rounded-md px-2 text-[13px] font-medium transition",
            agent.status === "terminated"
              ? "text-[#9aa3b2] hover:bg-white hover:text-[#6b7280]"
              : "text-[#6b7280] hover:bg-[#fff1f2] hover:text-[#b42318]",
          )}
        >
          Kill
        </button>
      </div>

      <span className={cn("sr-only", statusMeta.text)}>{statusMeta.label}</span>
    </div>
  );
}

function GroupSection({
  status,
  agents,
  collapsed,
  onToggle,
  startIndex,
}: {
  status: AgentStatus;
  agents: Agent[];
  collapsed: boolean;
  onToggle: () => void;
  startIndex: number;
}) {
  const meta = STATUS_META[status];
  const Chevron = collapsed ? ChevronRight : ChevronDown;

  return (
    <section className="border-t border-[#eef1f6] first:border-t-0">
      <button
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between px-4 text-left transition hover:bg-[#fafbfd]"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2">
          <Chevron className="h-3.5 w-3.5 text-[#9aa3b2]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
            {meta.label} ({meta.headerCount})
          </span>
        </div>
        <span className="text-[11px] text-[#9aa3b2]">{agents.length} visible</span>
      </button>

      {!collapsed && (
        <div>
          {agents.map((agent, index) => (
            <AgentRow key={agent.id} agent={agent} index={startIndex + index} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function AgentRosterPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All agents");
  const [collapsed, setCollapsed] = useState<Record<AgentStatus, boolean>>({
    running: false,
    paused: false,
    terminated: false,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setView("happy");
    }, 750);

    return () => window.clearTimeout(timer);
  }, []);

  const visibleAgents = useMemo(() => {
    if (view === "empty") return [];

    const base = AGENTS.filter((agent) => {
      const matchesQuery =
        query.length === 0 ||
        [agent.name, agent.model, agent.branch, agent.node, agent.owner]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesTab =
        activeTab === "All agents"
          ? true
          : activeTab === "Assigned to Pete"
            ? agent.owner === "pete"
            : activeTab === "Needs review"
              ? agent.status === "paused"
              : agent.status === "terminated";

      return matchesQuery && matchesTab;
    });

    return base;
  }, [activeTab, query, view]);

  const grouped = useMemo(() => {
    return {
      running: visibleAgents.filter((agent) => agent.status === "running"),
      paused: visibleAgents.filter((agent) => agent.status === "paused"),
      terminated: visibleAgents.filter((agent) => agent.status === "terminated"),
    };
  }, [visibleAgents]);

  const groupOrder: AgentStatus[] = ["running", "paused", "terminated"];
  let rowIndex = 0;

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#111827]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-24 pt-6 sm:px-6 lg:px-8">
        <header className="border-b border-[#eceff4] pb-4">
          <div className="flex min-h-10 items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#9aa3b2]">
                <span>OpenClaw</span>
                <ChevronRight className="h-3 w-3" />
                <span>Fleet</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#6b7280]">Agent roster</span>
              </div>
              <div className="mt-1 flex items-center gap-4">
                <h1 className="text-[18px] font-semibold text-[#111827]">Pete’s agent roster</h1>
                <nav className="hidden items-center gap-4 md:flex">
                  <button className="border-b border-[#111827] pb-2 text-[13px] font-medium text-[#111827]">
                    Agents
                  </button>
                  <button className="pb-2 text-[13px] text-[#6b7280]">Runs</button>
                  <button className="pb-2 text-[13px] text-[#6b7280]">Policies</button>
                </nav>
              </div>
            </div>

            <button className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#dde3ec] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:border-[#cfd7e3] hover:bg-[#fafbfd]">
              <RefreshCw className="h-3.5 w-3.5" />
              Sync
            </button>
          </div>
        </header>

        <section className="border-b border-[#eceff4] py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "inline-flex min-h-12 shrink-0 items-center rounded-md px-2.5 text-[13px] transition",
                    activeTab === tab
                      ? "bg-[#eef3fb] text-[#111827]"
                      : "text-[#6b7280] hover:bg-[#f4f6fa] hover:text-[#374151]",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1 lg:w-[320px] lg:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa3b2]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search agents, models, branches"
                  className="h-9 w-full rounded-md border border-[#dde3ec] bg-white pl-9 pr-9 text-[13px] text-[#111827] outline-none placeholder:text-[#9aa3b2] focus:border-[#c9d5e4]"
                />
                {query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-0 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded text-[#9aa3b2] transition hover:bg-[#f4f6fa] hover:text-[#6b7280]"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <button className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#dde3ec] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:border-[#cfd7e3] hover:bg-[#fafbfd]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
              </button>
            </div>
          </div>

          <p className="mt-3 text-[13px] text-[#6b7280]">47 agents • 31 running • 8 paused • 8 terminated</p>
        </section>

        <section className="flex-1 py-4">
          <div className="overflow-hidden border border-[#e8ebf2] bg-white shadow-[0_1px_0_rgba(17,24,39,0.02)]">
            <div className="hidden h-9 items-center border-b border-[#eef1f6] bg-[#fcfcfd] px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-[#9aa3b2] md:flex">
              <div className="w-[28%] min-w-[180px]">Agent</div>
              <div className="w-[20%]">Model</div>
              <div className="w-[24%] lg:block">Branch</div>
              <div className="hidden xl:block xl:w-[16%]">Node</div>
              <div className="ml-auto mr-[72px] hidden w-[84px] text-right sm:block">Seen</div>
              <div className="w-[72px] text-right">Uptime</div>
              <div className="w-[92px] text-right">Actions</div>
            </div>

            {view === "loading" ? (
              <LoadingRows />
            ) : view === "error" ? (
              <ErrorState onRetry={() => setView("loading")} />
            ) : visibleAgents.length === 0 ? (
              <EmptyState />
            ) : (
              groupOrder.map((status) => {
                const agents = grouped[status];
                const currentStart = rowIndex;
                rowIndex += collapsed[status] ? 0 : agents.length;

                return (
                  <GroupSection
                    key={status}
                    status={status}
                    agents={agents}
                    collapsed={collapsed[status]}
                    onToggle={() =>
                      setCollapsed((current) => ({
                        ...current,
                        [status]: !current[status],
                      }))
                    }
                    startIndex={currentStart}
                  />
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="fixed bottom-4 right-4 z-10 rounded-lg border border-[#dde3ec] bg-white/92 p-1.5 shadow-[0_8px_24px_rgba(17,24,39,0.08)] backdrop-blur-sm">
        <div className="flex items-center gap-1">
          {(["happy", "loading", "empty", "error"] as ViewState[]).map((state) => (
            <button
              key={state}
              onClick={() => setView(state)}
              className={cn(
                "inline-flex min-h-12 items-center rounded-md px-2.5 text-[11px] font-medium capitalize transition",
                view === state
                  ? "bg-[#eef3fb] text-[#111827]"
                  : "text-[#6b7280] hover:bg-[#f4f6fa] hover:text-[#374151]",
              )}
            >
              {state === "loading" ? <Loader2 className="mr-1 h-3 w-3" /> : null}
              {state}
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes roster-enter {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}
