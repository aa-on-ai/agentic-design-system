"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  ChevronDown,
  ChevronRight,
  Clock3,
  Cpu,
  Flame,
  Loader2,
  Radio,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Skull,
  Sparkles,
  SquareTerminal,
  Waypoints,
  X,
  Zap,
} from "lucide-react";

type AgentStatus = "running" | "warming" | "paused" | "draining" | "terminated";
type ViewState = "happy" | "loading" | "empty" | "error";
type AgentFilter = "all" | "pete" | "watch" | "terminated";

type Agent = {
  id: string;
  name: string;
  model: string;
  provider: string;
  status: AgentStatus;
  uptime: string;
  since: string;
  node: string;
  branch: string;
  owner: string;
  region: string;
  memory: string;
  tokens: string;
  notes: string;
  lastEvent: string;
  alert?: string;
};

const FLEET: Agent[] = [
  {
    id: "oc-311",
    name: "codex-prime",
    model: "GPT-5.4",
    provider: "OpenAI",
    status: "running",
    uptime: "18h 14m",
    since: "booted 07:12",
    node: "mac-mini-01",
    branch: "agentic-design-system",
    owner: "Pete",
    region: "Venice",
    memory: "6.4 GB",
    tokens: "1.8M",
    notes: "shipping demo repairs",
    lastEvent: "patched layout drift 12s ago",
  },
  {
    id: "oc-287",
    name: "sonnet-scout",
    model: "Claude Sonnet 4.6",
    provider: "Anthropic",
    status: "running",
    uptime: "9h 52m",
    since: "booted 15:03",
    node: "mac-mini-02",
    branch: "slack-digest",
    owner: "Maya",
    region: "Venice",
    memory: "3.1 GB",
    tokens: "842K",
    notes: "triaging research threads",
    lastEvent: "resolved 14 Slack mentions 29s ago",
  },
  {
    id: "oc-281",
    name: "gemini-mapper",
    model: "Gemini 3 Pro",
    provider: "Google",
    status: "warming",
    uptime: "6h 08m",
    since: "warming after relaunch",
    node: "gpu-node-01",
    branch: "ontology-pass",
    owner: "Joel",
    region: "Downtown",
    memory: "14.2 GB",
    tokens: "2.1M",
    notes: "re-indexing org graph",
    lastEvent: "replaying memory shards 41s ago",
    alert: "GPU reclaimed once in last hour",
  },
  {
    id: "oc-266",
    name: "spark-runner",
    model: "GPT-5.3 Codex Spark",
    provider: "OpenAI",
    status: "running",
    uptime: "3h 46m",
    since: "booted 10:22",
    node: "edge-lax-01",
    branch: "storybook-fixes",
    owner: "Nina",
    region: "LAX edge",
    memory: "1.2 GB",
    tokens: "412K",
    notes: "burning through UI chores",
    lastEvent: "closed 7 tiny regressions 8s ago",
  },
  {
    id: "oc-243",
    name: "runner-ops",
    model: "Gemini 3 Flash",
    provider: "Google",
    status: "draining",
    uptime: "1h 32m",
    since: "awaiting safe stop",
    node: "edge-den-02",
    branch: "docs-sync",
    owner: "Felipe",
    region: "Denver edge",
    memory: "980 MB",
    tokens: "188K",
    notes: "wrapping a doc ingest batch",
    lastEvent: "kill switch armed 1m ago",
    alert: "2 jobs still flushing to disk",
  },
  {
    id: "oc-228",
    name: "qwen-utility",
    model: "Qwen 3.5 9B",
    provider: "Local",
    status: "paused",
    uptime: "22h 05m",
    since: "paused 4m ago",
    node: "garage-rack-02",
    branch: "health-ping",
    owner: "Pete",
    region: "Garage rack",
    memory: "720 MB",
    tokens: "94K",
    notes: "standing by for cron duty",
    lastEvent: "manual pause by Pete 4m ago",
  },
  {
    id: "oc-217",
    name: "opus-review",
    model: "Claude Opus 4.6",
    provider: "Anthropic",
    status: "paused",
    uptime: "5h 19m",
    since: "paused 7m ago",
    node: "mac-mini-03",
    branch: "design-preflight",
    owner: "Aaron",
    region: "Venice",
    memory: "4.6 GB",
    tokens: "1.2M",
    notes: "waiting for next review pass",
    lastEvent: "held at review gate 7m ago",
  },
  {
    id: "oc-163",
    name: "ghost-relay",
    model: "override/unknown",
    provider: "Unknown",
    status: "terminated",
    uptime: "13m",
    since: "died 19m ago",
    node: "unknown",
    branch: "containment-room",
    owner: "Unassigned",
    region: "unknown",
    memory: "—",
    tokens: "—",
    notes: "relay lost heartbeat during approval gate",
    lastEvent: "telemetry dropped 19m ago",
    alert: "No restart policy attached",
  },
  {
    id: "oc-148",
    name: "nightly-audit",
    model: "Claude Sonnet 4.6",
    provider: "Anthropic",
    status: "terminated",
    uptime: "7h 48m",
    since: "stopped 1h ago",
    node: "mac-mini-01",
    branch: "rule-check",
    owner: "Pete",
    region: "Venice",
    memory: "1.6 GB",
    tokens: "537K",
    notes: "finished without issues",
    lastEvent: "clean exit 1h ago",
  },
  {
    id: "oc-119",
    name: "render-batch",
    model: "GPT-5.4",
    provider: "OpenAI",
    status: "terminated",
    uptime: "2h 54m",
    since: "stopped 2h ago",
    node: "gpu-node-01",
    branch: "video-pipeline",
    owner: "Aaron",
    region: "Downtown",
    memory: "12.8 GB",
    tokens: "964K",
    notes: "completed the audio render queue",
    lastEvent: "wrote 10 artifacts 2h ago",
  },
];

const FILTERS: { id: AgentFilter; label: string }[] = [
  { id: "all", label: "All agents" },
  { id: "pete", label: "Pete’s fleet" },
  { id: "watch", label: "Watch list" },
  { id: "terminated", label: "Recently killed" },
];

const STATUS_META: Record<
  AgentStatus,
  {
    label: string;
    tone: string;
    dot: string;
    pill: string;
    border: string;
    surface: string;
    action: string;
    icon: typeof Radio;
  }
> = {
  running: {
    label: "Running",
    tone: "text-emerald-800",
    dot: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-800 border-emerald-200",
    border: "border-emerald-200/80",
    surface: "bg-emerald-50/70",
    action: "Kill",
    icon: Radio,
  },
  warming: {
    label: "Warming",
    tone: "text-sky-800",
    dot: "bg-sky-500",
    pill: "bg-sky-100 text-sky-800 border-sky-200",
    border: "border-sky-200/80",
    surface: "bg-sky-50/70",
    action: "Abort",
    icon: Flame,
  },
  paused: {
    label: "Paused",
    tone: "text-amber-800",
    dot: "bg-amber-500",
    pill: "bg-amber-100 text-amber-800 border-amber-200",
    border: "border-amber-200/80",
    surface: "bg-amber-50/70",
    action: "Resume",
    icon: Clock3,
  },
  draining: {
    label: "Draining",
    tone: "text-violet-800",
    dot: "bg-violet-500",
    pill: "bg-violet-100 text-violet-800 border-violet-200",
    border: "border-violet-200/80",
    surface: "bg-violet-50/70",
    action: "Force kill",
    icon: Activity,
  },
  terminated: {
    label: "Terminated",
    tone: "text-rose-800",
    dot: "bg-rose-500",
    pill: "bg-rose-100 text-rose-800 border-rose-200",
    border: "border-rose-200/80",
    surface: "bg-rose-50/70",
    action: "Clear",
    icon: Skull,
  },
};

const NODE_SNAPSHOT = [
  { name: "mac-mini-01", load: "71%", temp: "54°", state: "steady" },
  { name: "gpu-node-01", load: "93%", temp: "78°", state: "hot" },
  { name: "edge-lax-01", load: "44%", temp: "39°", state: "idle" },
];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function StatusPill({ status }: { status: AgentStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        meta.pill,
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function StatTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Bot;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">{label}</p>
          <p className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-stone-950">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-5 text-stone-600">{detail}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[28px] border border-stone-200 bg-white/92 p-4 sm:p-5">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-full bg-stone-200" />
                <div className="h-5 w-40 animate-pulse rounded-full bg-stone-200" />
                <div className="h-3 w-full max-w-[22rem] animate-pulse rounded-full bg-stone-200" />
              </div>
              <div className="h-8 w-20 animate-pulse rounded-full bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/80 px-6 py-16 text-center sm:px-8">
      <div className="mx-auto max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-600">
          <SquareTerminal className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-stone-950">
          No agents match this view
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-stone-600">
          Pete’s roster is quiet right now. Clear a filter, widen the search, or launch a fresh worker to repopulate the fleet.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[28px] border border-rose-200 bg-rose-50/60 px-6 py-16 text-center sm:px-8">
      <div className="mx-auto max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-700">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-stone-950">
          Live telemetry dropped
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-stone-600">
          The roster couldn’t reach Pete’s relay. Agents are prbly still running, but this snapshot is stale until the heartbeat comes back.
        </p>
        <button
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-[13px] font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry sync
        </button>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const meta = STATUS_META[agent.status];

  return (
    <article
      className={cn(
        "rounded-2xl border p-4 shadow-[0_1px_0_rgba(28,25,23,0.04)] transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(28,25,23,0.06)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        meta.border,
        meta.surface,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{agent.id}</p>
          </div>
          <h3 className="mt-2 truncate text-[18px] font-semibold tracking-[-0.03em] text-stone-950">
            {agent.name}
          </h3>
          <p className="mt-1 text-[13px] text-stone-600">
            {agent.provider} · {agent.model}
          </p>
        </div>
        <StatusPill status={agent.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-[13px] text-stone-700">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Branch</p>
          <p className="mt-1 truncate font-medium text-stone-900">{agent.branch}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Node</p>
          <p className="mt-1 truncate font-medium text-stone-900">{agent.node}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Uptime</p>
          <p className="mt-1 font-medium text-stone-900">{agent.uptime}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Memory</p>
          <p className="mt-1 font-medium text-stone-900">{agent.memory}</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-[13px] leading-5 text-stone-700">
        {agent.notes}
      </p>

      {agent.alert ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800">
          {agent.alert}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-3">
        <p className="min-w-0 truncate text-[12px] text-stone-500">{agent.lastEvent}</p>
        <button className="inline-flex min-h-11 shrink-0 items-center rounded-xl border border-rose-200 bg-white px-3 text-[12px] font-semibold text-rose-700 transition hover:bg-rose-50">
          {meta.action}
        </button>
      </div>
    </article>
  );
}

function GroupSection({
  title,
  tone,
  icon: Icon,
  agents,
  collapsed,
  onToggle,
}: {
  title: string;
  tone: string;
  icon: typeof Sparkles;
  agents: Agent[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white/92 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
      <button
        onClick={onToggle}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5"
        aria-expanded={!collapsed}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-2xl border bg-white", tone)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">{title}</p>
            <p className="text-[14px] text-stone-700">{agents.length} visible in this lane</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[12px] text-stone-500 sm:inline">tap to collapse</span>
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-stone-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-stone-500" />
          )}
        </div>
      </button>

      {!collapsed ? (
        <div className="border-t border-stone-200/80">
          <div className="hidden lg:block">
            <div className="grid grid-cols-[1.5fr_1.05fr_1.1fr_120px_120px_118px] gap-3 border-b border-stone-200/80 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              <span>Agent</span>
              <span>Model</span>
              <span>Work</span>
              <span>Memory</span>
              <span>Uptime</span>
              <span className="text-right">Kill switch</span>
            </div>
            <div>
              {agents.map((agent) => {
                const meta = STATUS_META[agent.status];

                return (
                  <article
                    key={agent.id}
                    className="grid grid-cols-[1.5fr_1.05fr_1.1fr_120px_120px_118px] gap-3 border-b border-stone-200/70 px-5 py-4 text-sm last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} aria-hidden="true" />
                        <p className="truncate font-semibold tracking-[-0.02em] text-stone-950">{agent.name}</p>
                        <StatusPill status={agent.status} />
                      </div>
                      <p className="mt-1 truncate text-[12px] text-stone-500">
                        {agent.id} · {agent.owner} · {agent.region}
                      </p>
                      <p className="mt-2 truncate text-[13px] text-stone-700">{agent.lastEvent}</p>
                      {agent.alert ? (
                        <p className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-800">
                          {agent.alert}
                        </p>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900">{agent.model}</p>
                      <p className="mt-1 text-[12px] text-stone-500">{agent.provider}</p>
                      <p className="mt-3 text-[12px] text-stone-600">{agent.tokens} tokens</p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900">{agent.branch}</p>
                      <p className="mt-1 truncate text-[12px] text-stone-500">{agent.notes}</p>
                      <p className="mt-3 truncate text-[12px] text-stone-600">{agent.node} · {agent.since}</p>
                    </div>

                    <div>
                      <p className="font-medium text-stone-900">{agent.memory}</p>
                      <p className="mt-1 text-[12px] text-stone-500">resident</p>
                    </div>

                    <div>
                      <p className="font-medium text-stone-900">{agent.uptime}</p>
                      <p className="mt-1 text-[12px] text-stone-500">alive window</p>
                    </div>

                    <div className="flex items-center justify-end">
                      <button className="inline-flex min-h-11 items-center rounded-xl border border-rose-200 bg-white px-3 text-[12px] font-semibold text-rose-700 transition hover:bg-rose-50">
                        {meta.action}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 p-3 lg:hidden sm:p-4">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function AgentRosterPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AgentFilter>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    hot: false,
    watch: false,
    ended: false,
  });

  useEffect(() => {
    if (view !== "loading") return;

    const timer = window.setTimeout(() => {
      setView("happy");
    }, 800);

    return () => window.clearTimeout(timer);
  }, [view]);

  const filteredAgents = useMemo(() => {
    if (view === "empty") return [];

    return FLEET.filter((agent) => {
      const searchTarget = [
        agent.name,
        agent.model,
        agent.provider,
        agent.branch,
        agent.node,
        agent.owner,
        agent.notes,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || searchTarget.includes(query.toLowerCase());
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "pete"
            ? agent.owner.toLowerCase() === "pete"
            : filter === "watch"
              ? ["warming", "draining", "paused"].includes(agent.status)
              : agent.status === "terminated";

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, view]);

  const lanes = useMemo(
    () => ({
      hot: filteredAgents.filter((agent) => ["running", "warming"].includes(agent.status)),
      watch: filteredAgents.filter((agent) => ["paused", "draining"].includes(agent.status)),
      ended: filteredAgents.filter((agent) => agent.status === "terminated"),
    }),
    [filteredAgents],
  );

  const stats = useMemo(() => {
    const running = FLEET.filter((agent) => agent.status === "running").length;
    const watch = FLEET.filter((agent) => ["warming", "paused", "draining"].includes(agent.status)).length;
    const terminated = FLEET.filter((agent) => agent.status === "terminated").length;

    return { running, watch, terminated };
  }, []);

  const totalVisible = filteredAgents.length;
  const alerts = filteredAgents.filter((agent) => agent.alert).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(254,240,138,0.18),_transparent_28%),linear-gradient(180deg,#fcfbf8_0%,#f6f2ea_100%)] text-stone-900">
      <div className="mx-auto max-w-[1400px] px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <header className="rounded-[32px] border border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,248,244,0.92))] p-4 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1">OpenClaw</span>
                <ChevronRight className="h-3 w-3" />
                <span>Fleet console</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-stone-700">Pete’s agent roster</span>
              </div>

              <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h1 className="text-[32px] font-semibold tracking-[-0.06em] text-stone-950 sm:text-[40px]">
                    Pete’s OpenClaw agent roster
                  </h1>
                  <p className="mt-3 max-w-2xl text-[15px] leading-7 text-stone-600 sm:text-[16px]">
                    A live fleet view for the agents running around Pete’s personal OpenClaw setup. Fast enough for kill-switch duty, dense enough to spot weirdness before it snowballs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-medium text-emerald-800">
                    <Zap className="h-3.5 w-3.5" />
                    31 agents live
                  </div>
                  <button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-[13px] font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Sync roster
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[420px] lg:grid-cols-1 xl:w-[460px] xl:grid-cols-3">
              <StatTile
                label="Live now"
                value={`${stats.running}`}
                detail="healthy workers taking jobs right now"
                icon={Bot}
              />
              <StatTile
                label="Watch list"
                value={`${stats.watch}`}
                detail="warming, paused, or draining agents"
                icon={ShieldAlert}
              />
              <StatTile
                label="Terminated"
                value={`${stats.terminated}`}
                detail="recently ended or manually killed runs"
                icon={Skull}
              />
            </div>
          </div>
        </header>

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-stone-200 bg-white/92 p-4 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
                  {FILTERS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFilter(item.id)}
                      className={cn(
                        "inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-[13px] font-medium transition",
                        filter === item.id
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-white",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative min-w-0 sm:w-[300px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search agent, model, branch, node"
                      className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-10 text-[14px] text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
                    />
                    {query ? (
                      <button
                        onClick={() => setQuery("")}
                        className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[12px] text-stone-600">
                    <Waypoints className="h-3.5 w-3.5" />
                    {totalVisible} visible
                    {alerts > 0 ? <span>· {alerts} alerts</span> : null}
                  </div>
                </div>
              </div>
            </div>

            {view === "loading" ? (
              <LoadingState />
            ) : view === "error" ? (
              <ErrorState onRetry={() => setView("loading")} />
            ) : filteredAgents.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                <GroupSection
                  title="Hot lane"
                  tone="border-emerald-200 text-emerald-700"
                  icon={Radio}
                  agents={lanes.hot}
                  collapsed={collapsed.hot}
                  onToggle={() => setCollapsed((current) => ({ ...current, hot: !current.hot }))}
                />
                <GroupSection
                  title="Watch lane"
                  tone="border-amber-200 text-amber-700"
                  icon={ShieldAlert}
                  agents={lanes.watch}
                  collapsed={collapsed.watch}
                  onToggle={() => setCollapsed((current) => ({ ...current, watch: !current.watch }))}
                />
                <GroupSection
                  title="Ended lane"
                  tone="border-rose-200 text-rose-700"
                  icon={Skull}
                  agents={lanes.ended}
                  collapsed={collapsed.ended}
                  onToggle={() => setCollapsed((current) => ({ ...current, ended: !current.ended }))}
                />
              </div>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-[28px] border border-stone-200 bg-white/92 p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                <Cpu className="h-3.5 w-3.5" />
                Node snapshot
              </div>
              <div className="mt-4 space-y-3">
                {NODE_SNAPSHOT.map((node) => (
                  <div key={node.name} className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-stone-900">{node.name}</p>
                      <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[11px] text-stone-600">
                        {node.state}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-stone-600">
                      <div>
                        <p className="uppercase tracking-[0.1em] text-stone-400">Load</p>
                        <p className="mt-1 font-medium text-stone-900">{node.load}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-[0.1em] text-stone-400">Temp</p>
                        <p className="mt-1 font-medium text-stone-900">{node.temp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-stone-200 bg-white/92 p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                <Server className="h-3.5 w-3.5" />
                Fleet notes
              </div>
              <div className="mt-4 space-y-3 text-[14px] leading-6 text-stone-700">
                <p className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3">
                  <span className="font-medium text-stone-950">Relay jitter on gpu-node-01.</span> Pete kept the view biased toward uptime, node heat, and safe-stop state so he can intervene fast.
                </p>
                <p className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3">
                  <span className="font-medium text-stone-950">Memory budget warning.</span> sonnet-scout approaching 128k context ceiling — consider pruning or cycling.
                </p>
                <p className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3">
                  <span className="font-medium text-stone-950">Rate-limit headroom.</span> Anthropic tier at 78% capacity. OpenAI comfortable at 41%.
                </p>
              </div>
            </section>
          </aside>
        </section>
      </div>

      <div className="fixed bottom-4 right-4 z-20 rounded-2xl border border-stone-300 bg-white/92 p-1.5 shadow-[0_12px_28px_rgba(28,25,23,0.12)] backdrop-blur-sm">
        <div className="flex items-center gap-1">
          {(["happy", "loading", "empty", "error"] as ViewState[]).map((state) => (
            <button
              key={state}
              onClick={() => setView(state)}
              className={cn(
                "inline-flex min-h-10 items-center rounded-xl px-3 text-[12px] font-medium capitalize transition",
                view === state
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
              )}
            >
              {state === "loading" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              {state}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
