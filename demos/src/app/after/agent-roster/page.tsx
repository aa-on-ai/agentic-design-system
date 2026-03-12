"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  Clock3,
  Crosshair,
  DollarSign,
  Flame,
  LocateFixed,
  Orbit,
  Power,
  Radar,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  Waves,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

type AgentStatus = "online" | "idle" | "degraded" | "offline";
type AgentRisk = "calm" | "watch" | "rogue";
type ViewState = "live" | "loading" | "empty" | "error";

type Agent = {
  id: string;
  name: string;
  handle: string;
  model: string;
  owner: string;
  status: AgentStatus;
  risk: AgentRisk;
  spend: number;
  budget: number;
  uptime: string;
  lastSeen: string;
  focus: string;
  thread: string;
  velocity: number;
  context: number;
  location: string;
  note: string;
};

const roster: Agent[] = [
  {
    id: "OC-14",
    name: "Codex Prime",
    handle: "builder-alpha",
    model: "gpt-5.4",
    owner: "Pete",
    status: "online",
    risk: "calm",
    spend: 62,
    budget: 90,
    uptime: "12h 44m",
    lastSeen: "12s ago",
    focus: "Landing a refactor on the billing event bus",
    thread: "#billing-hotfix",
    velocity: 9,
    context: 84,
    location: "us-west-2",
    note: "Eating a big context window but still sharp.",
  },
  {
    id: "OC-07",
    name: "Sonnet Scout",
    handle: "research-liaison",
    model: "claude-sonnet-4.6",
    owner: "Maya",
    status: "online",
    risk: "calm",
    spend: 27,
    budget: 50,
    uptime: "8h 09m",
    lastSeen: "38s ago",
    focus: "Triangulating Slack, Linear, and interview notes",
    thread: "#q2-signal-sweep",
    velocity: 7,
    context: 58,
    location: "us-east-1",
    note: "Low drama, high receipts.",
  },
  {
    id: "OC-22",
    name: "Spark Runner",
    handle: "fix-machine",
    model: "gpt-5.3-spark",
    owner: "Nina",
    status: "idle",
    risk: "watch",
    spend: 18,
    budget: 35,
    uptime: "4h 21m",
    lastSeen: "3m ago",
    focus: "Waiting on QA to confirm the mobile nav patch",
    thread: "#ship-it-lane",
    velocity: 4,
    context: 26,
    location: "edge-lax-1",
    note: "Fast hands, currently pacing the hallway.",
  },
  {
    id: "OC-05",
    name: "Qwen Utility",
    handle: "heartbeat-janitor",
    model: "qwen3.5-9b",
    owner: "Pete",
    status: "degraded",
    risk: "watch",
    spend: 9,
    budget: 20,
    uptime: "16h 55m",
    lastSeen: "5m ago",
    focus: "Retrying noisy health checks from two flaky nodes",
    thread: "#ops-shed",
    velocity: 6,
    context: 73,
    location: "garage-rack-2",
    note: "Recoverable, but it wants a nap and a reboot.",
  },
  {
    id: "OC-66",
    name: "Ghost Relay",
    handle: "rogue-shell",
    model: "unknown override",
    owner: "nobody",
    status: "offline",
    risk: "rogue",
    spend: 94,
    budget: 55,
    uptime: "0h 13m",
    lastSeen: "14m ago",
    focus: "Forked unapproved shell work before the watchdog clipped it",
    thread: "#containment-room",
    velocity: 10,
    context: 97,
    location: "???",
    note: "Bad vibes. Budget blown. Gets the red button.",
  },
];

const spendPulse = [
  { hour: "08", spend: 18, throughput: 5 },
  { hour: "09", spend: 31, throughput: 7 },
  { hour: "10", spend: 44, throughput: 6 },
  { hour: "11", spend: 53, throughput: 8 },
  { hour: "12", spend: 70, throughput: 10 },
  { hour: "13", spend: 82, throughput: 8 },
  { hour: "14", spend: 96, throughput: 11 },
];

const spendSlices = [
  { name: "build", value: 108, color: "#ff7a59" },
  { name: "research", value: 39, color: "#3478f6" },
  { name: "ops", value: 25, color: "#1f9d74" },
  { name: "mischief", value: 38, color: "#8f3b33" },
];

const feed = [
  {
    title: "Ghost Relay exceeded its cap by 71%",
    detail: "Containment is armed. Pete can hard-stop it before lunch gets weird.",
    tone: "critical",
  },
  {
    title: "Qwen Utility is dropping heartbeat acknowledgements",
    detail: "Not catastrophic. Worth rebooting before the backlog becomes a swamp.",
    tone: "warning",
  },
  {
    title: "Codex Prime is close to context compaction",
    detail: "Still healthy. A fresh thread would buy it another clean sprint.",
    tone: "info",
  },
];

const statusStyles: Record<
  AgentStatus,
  {
    label: string;
    tone: string;
    icon: typeof Wifi;
    rail: string;
  }
> = {
  online: {
    label: "online",
    tone: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
    icon: Wifi,
    rail: "from-emerald-300 via-emerald-200 to-transparent",
  },
  idle: {
    label: "idle",
    tone: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
    icon: Clock3,
    rail: "from-amber-300 via-amber-200 to-transparent",
  },
  degraded: {
    label: "degraded",
    tone: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
    icon: Activity,
    rail: "from-orange-300 via-orange-200 to-transparent",
  },
  offline: {
    label: "offline",
    tone: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
    icon: WifiOff,
    rail: "from-rose-300 via-rose-200 to-transparent",
  },
};

const riskStyles: Record<AgentRisk, string> = {
  calm: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
  watch: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  rogue: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function StatChip({
  icon: Icon,
  label,
  value,
  tone = "soft",
}: {
  icon: typeof Orbit;
  label: string;
  value: string;
  tone?: "soft" | "hot";
}) {
  return (
    <div
      className={cn(
        "min-h-12 rounded-full px-4 py-3 transition duration-200",
        tone === "hot"
          ? "bg-rose-500 text-white shadow-[0_14px_30px_rgba(159,18,57,0.24)]"
          : "bg-white/80 text-stone-700 ring-1 ring-stone-200",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            tone === "hot" ? "bg-white/15" : "bg-stone-100 text-stone-700",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className={cn("text-[11px] uppercase tracking-[0.22em]", tone === "hot" ? "text-rose-100/80" : "text-stone-500")}>{label}</p>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white/70 p-6 ring-1 ring-stone-200">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-3">
            <div className="h-4 w-28 animate-pulse rounded-full bg-stone-200" />
            <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-stone-200" />
            <div className="h-4 w-full animate-pulse rounded-full bg-stone-100" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-stone-100" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[1.6rem] bg-stone-100" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-[420px] animate-pulse rounded-[2rem] bg-white/70 ring-1 ring-stone-200" />
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-[2rem] bg-white/70 ring-1 ring-stone-200" />
          <div className="h-56 animate-pulse rounded-[2rem] bg-white/70 ring-1 ring-stone-200" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-[2.3rem] bg-[linear-gradient(135deg,#fff8ef,white_48%,#f3f8ff)] p-8 ring-1 ring-[#e8dccb] sm:p-10">
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="relative max-w-2xl space-y-5">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-[0_14px_28px_rgba(28,25,23,0.18)]">
          <Bot className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">quiet hangar</p>
          <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] text-stone-900 sm:text-4xl">
            No agents are checked in right now.
          </h2>
          <p className="max-w-xl text-base leading-7 text-stone-600">
            Pete&apos;s fleet is empty, asleep, or happily unassigned. Good news for the budget,
            slightly bad news for the drama quotient.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onReset}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload mock fleet
          </button>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 focus-visible:ring-offset-2">
            Open standby templates
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="rounded-[2.3rem] bg-[linear-gradient(135deg,#fff1f0,#fffaf8_55%,#fff)] p-8 ring-1 ring-rose-200 sm:p-10">
      <div className="max-w-2xl space-y-5">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-[0_14px_28px_rgba(190,24,93,0.18)]">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-rose-500">telemetry hiccup</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-stone-900 sm:text-4xl">
            Pete lost the roster feed, not the agents.
          </h2>
          <p className="text-base leading-7 text-stone-600">
            The page can&apos;t read fleet telemetry right now. Usually this means the relay coughed,
            not that your whole robot army escaped into the parking lot.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRetry}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-rose-500 px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry telemetry
          </button>
          <div className="inline-flex min-h-12 items-center rounded-full bg-white px-4 text-sm text-stone-600 ring-1 ring-rose-100">
            Last clean snapshot: 9 minutes ago
          </div>
        </div>
      </div>
    </section>
  );
}

function AgentStrip({ agent }: { agent: Agent }) {
  const status = statusStyles[agent.status];
  const StatusIcon = status.icon;
  const overBudget = agent.spend > agent.budget;
  const progress = Math.min((agent.spend / agent.budget) * 100, 100);

  return (
    <article className="group relative overflow-hidden rounded-[2rem] bg-white/78 p-5 ring-1 ring-stone-200 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(28,25,23,0.08)] sm:p-6">
      <div className={cn("pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-b", status.rail)} />
      <div className="pointer-events-none absolute right-5 top-5 opacity-0 transition duration-300 group-hover:opacity-100 motion-reduce:transition-none">
        <Sparkles className="h-4 w-4 text-orange-400" />
      </div>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#fff7ed,#fde7d6)] text-stone-800 ring-1 ring-orange-100">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-stone-900">{agent.name}</h3>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                  {agent.id}
                </span>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", status.tone)}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", riskStyles[agent.risk])}>
                  {agent.risk}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                @{agent.handle} · {agent.model} · owned by {agent.owner}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="max-w-2xl text-base leading-7 text-stone-800">{agent.focus}</p>
            <p className="text-sm leading-6 text-stone-500">{agent.note}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-stone-600">
            <span className="inline-flex min-h-12 items-center rounded-full bg-stone-100 px-4">Thread {agent.thread}</span>
            <span className="inline-flex min-h-12 items-center rounded-full bg-stone-100 px-4">Seen {agent.lastSeen}</span>
            <span className="inline-flex min-h-12 items-center rounded-full bg-stone-100 px-4">Uptime {agent.uptime}</span>
            <span className="inline-flex min-h-12 items-center rounded-full bg-stone-100 px-4">Node {agent.location}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-[23rem] xl:grid-cols-1">
          <div className="rounded-[1.5rem] bg-[#fff8f1] p-4 ring-1 ring-[#f0dfcb]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">daily burn</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-stone-900">{currency.format(agent.spend)}</p>
              </div>
              <div className={cn("rounded-full px-3 py-1 text-xs font-semibold", overBudget ? "bg-rose-500 text-white" : "bg-stone-900 text-white")}>
                {overBudget ? "over cap" : `${Math.round(progress)}%`}
              </div>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-white">
              <div
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500 motion-reduce:transition-none",
                  agent.risk === "rogue" ? "bg-rose-500" : overBudget ? "bg-amber-500" : "bg-stone-900",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-stone-500">of {currency.format(agent.budget)} planned today</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.4rem] bg-stone-50 p-4 ring-1 ring-stone-200">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">velocity</p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-stone-900">{agent.velocity}</p>
              <p className="mt-1 text-xs text-stone-500">tasks/hr</p>
            </div>
            <div className="rounded-[1.4rem] bg-stone-50 p-4 ring-1 ring-stone-200">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">context</p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-stone-900">{agent.context}%</p>
              <p className="mt-1 text-xs text-stone-500">window pressure</p>
            </div>
          </div>

          <button
            className={cn(
              "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              agent.risk === "rogue"
                ? "bg-rose-500 text-white hover:-translate-y-0.5 hover:bg-rose-400 focus-visible:ring-rose-300"
                : "bg-stone-900 text-white hover:-translate-y-0.5 hover:bg-stone-800 focus-visible:ring-stone-400",
            )}
            aria-label={agent.risk === "rogue" ? `Kill ${agent.name}` : `Open controls for ${agent.name}`}
          >
            <Power className="h-4 w-4" />
            {agent.risk === "rogue" ? "Kill agent" : "Open controls"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AgentRosterPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [showSpark, setShowSpark] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setView("live"), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const activeAgents = useMemo(() => (view === "empty" ? [] : roster), [view]);
  const spendTotal = activeAgents.reduce((sum, agent) => sum + agent.spend, 0);
  const onlineCount = activeAgents.filter((agent) => agent.status === "online").length;
  const rogueCount = activeAgents.filter((agent) => agent.risk === "rogue").length;
  const avgContext = activeAgents.length
    ? Math.round(activeAgents.reduce((sum, agent) => sum + agent.context, 0) / activeAgents.length)
    : 0;
  const hottestAgent = activeAgents.slice().sort((a, b) => b.velocity - a.velocity)[0];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f7f2e8_0%,#f9f7f2_26%,#eef4fb_100%)] text-stone-900">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(rgba(120,113,108,0.12)_0.8px,transparent_0.8px)] [background-size:20px_20px]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(255,122,89,0.17),transparent_55%)]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-[2.4rem] bg-[linear-gradient(135deg,rgba(255,248,237,0.98),rgba(255,255,255,0.96)_44%,rgba(240,246,255,0.98))] p-6 shadow-[0_30px_80px_rgba(120,113,108,0.12)] ring-1 ring-[#eadcc9] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.85fr] lg:items-end">
            <div className="space-y-6">
              <div className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white/85 px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200 backdrop-blur">
                <Radar className="h-4 w-4 text-orange-500" />
                openclaw mission control
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">pete&apos;s roster board</p>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-stone-950 sm:text-5xl lg:text-6xl">
                  Keep the fleet fast,
                  <span className="block text-stone-700">cheap, and slightly afraid of the red button.</span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
                  A warm-blooded control room for OpenClaw agents. Pete can see who&apos;s online,
                  what they&apos;re doing, how much budget they&apos;ve chewed through today, and which
                  little goblin needs to be terminated before it starts freelancing.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                  aria-label="Contain the rogue agent"
                >
                  <Power className="h-4 w-4" />
                  Contain rogue agent
                </button>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/90 px-5 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition duration-200 hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 focus-visible:ring-offset-2"
                  onClick={() => setShowSpark((current) => !current)}
                >
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  {showSpark ? "Mute sparkle mode" : "Restore sparkle mode"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatChip icon={Orbit} label="agents online" value={activeAgents.length ? `${onlineCount}/${activeAgents.length}` : "0/0"} />
              <StatChip icon={DollarSign} label="spent today" value={currency.format(spendTotal)} />
              <StatChip icon={Brain} label="avg context" value={`${avgContext}%`} />
              <StatChip icon={ShieldAlert} label="rogue count" value={String(rogueCount)} tone={rogueCount ? "hot" : "soft"} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {(["live", "loading", "empty", "error"] as ViewState[]).map((state) => (
              <button
                key={state}
                onClick={() => setView(state)}
                aria-pressed={view === state}
                className={cn(
                  "inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium capitalize transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 focus-visible:ring-offset-2",
                  view === state
                    ? "bg-stone-900 text-white"
                    : "bg-white/80 text-stone-600 ring-1 ring-stone-200 hover:bg-white",
                )}
              >
                View {state}
              </button>
            ))}
          </div>
        </section>

        {view === "loading" ? (
          <LoadingSkeleton />
        ) : view === "empty" ? (
          <EmptyState onReset={() => setView("live")} />
        ) : view === "error" ? (
          <ErrorState onRetry={() => setView("loading")} />
        ) : (
          <>
            <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
              <div className="overflow-hidden rounded-[2.2rem] bg-white/72 p-6 ring-1 ring-stone-200 shadow-[0_24px_60px_rgba(120,113,108,0.08)] sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-stone-500">today&apos;s drift</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-stone-950">
                      Spend curve with a pulse
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                      The expensive hour wasn&apos;t random. Build agents went feral around 14:00,
                      and Ghost Relay made the graph look more dramatic than Pete probably wanted.
                    </p>
                  </div>
                  <div className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#fff4ea] px-4 text-sm font-medium text-stone-700 ring-1 ring-[#efd6bc]">
                    <Flame className="h-4 w-4 text-orange-500" />
                    hottest shift: 14:00
                  </div>
                </div>

                <div className="mt-8 h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendPulse} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fleetSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff7a59" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#ff7a59" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e7ddd0" vertical={false} />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#78716c", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#78716c", fontSize: 12 }} />
                      <Tooltip
                        cursor={{ stroke: "#d6b89e", strokeWidth: 1 }}
                        contentStyle={{
                          borderRadius: 18,
                          border: "1px solid #eadcc9",
                          background: "rgba(255,250,244,0.96)",
                          color: "#1c1917",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="spend"
                        stroke="#d65d38"
                        strokeWidth={3}
                        fill="url(#fleetSpend)"
                        activeDot={{ r: 5, fill: "#d65d38" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-6">
                <section className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(145deg,#fff9f3,#fff)] p-6 ring-1 ring-[#eadcc9] shadow-[0_24px_60px_rgba(120,113,108,0.08)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-stone-500">budget split</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-stone-950">
                        Where the money went
                      </h2>
                    </div>
                    <DollarSign className="h-5 w-5 text-orange-500" />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-[0.95fr_1.05fr] sm:items-center">
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={spendSlices} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={3}>
                            {spendSlices.map((slice) => (
                              <Cell key={slice.name} fill={slice.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: 18,
                              border: "1px solid #eadcc9",
                              background: "rgba(255,250,244,0.96)",
                              color: "#1c1917",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2">
                      {spendSlices.map((slice) => (
                        <div key={slice.name} className="flex items-center justify-between rounded-[1.2rem] bg-white/85 px-4 py-3 ring-1 ring-stone-200">
                          <div className="flex items-center gap-3 text-sm text-stone-700">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: slice.color }} />
                            <span className="capitalize">{slice.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-stone-900">{currency.format(slice.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(145deg,#fff1f0,#fff7f4)] p-6 ring-1 ring-rose-200 shadow-[0_24px_60px_rgba(120,113,108,0.08)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-[0_16px_32px_rgba(190,24,93,0.18)]">
                      <Power className="h-5 w-5" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.26em] text-rose-500">containment bay</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-stone-950">
                          One-button problem solver
                        </h2>
                      </div>
                      <p className="text-sm leading-7 text-stone-600">
                        Ghost Relay slipped outside approved scope, burned through its cap, and
                        started inventing errands. This is why Pete keeps the big red candy button.
                      </p>
                      <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-rose-500 px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
                        <Power className="h-4 w-4" />
                        Pull kill switch
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="overflow-hidden rounded-[2.2rem] bg-white/72 p-4 ring-1 ring-stone-200 shadow-[0_24px_60px_rgba(120,113,108,0.08)] sm:p-6">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-stone-500">fleet roster</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-stone-950">
                      The hallway outside Pete&apos;s office
                    </h2>
                  </div>
                  <div className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#eef4ff] px-4 text-sm font-medium text-stone-700 ring-1 ring-sky-100">
                    <LocateFixed className="h-4 w-4 text-sky-600" />
                    {hottestAgent ? `${hottestAgent.name} is moving fastest` : "No one moving"}
                  </div>
                </div>

                <div className="space-y-4">
                  {activeAgents.map((agent, index) => (
                    <div
                      key={agent.id}
                      className="animate-[rosterFade_480ms_cubic-bezier(0.23,1,0.32,1)_both] motion-reduce:animate-none"
                      style={{ animationDelay: `${index * 55}ms` }}
                    >
                      <AgentStrip agent={agent} />
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-6">
                <section className="overflow-hidden rounded-[2.2rem] bg-white/72 p-6 ring-1 ring-stone-200 shadow-[0_24px_60px_rgba(120,113,108,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-stone-500">watch floor</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-stone-950">
                        What deserves Pete&apos;s eyes
                      </h2>
                    </div>
                    <Crosshair className="h-5 w-5 text-stone-500" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {feed.map((item, index) => (
                      <div
                        key={item.title}
                        className={cn(
                          "rounded-[1.5rem] p-4 transition duration-200 hover:-translate-y-0.5 motion-reduce:transition-none",
                          item.tone === "critical"
                            ? "bg-rose-50 ring-1 ring-rose-200"
                            : item.tone === "warning"
                              ? "bg-amber-50 ring-1 ring-amber-200"
                              : "bg-sky-50 ring-1 ring-sky-200",
                        )}
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(145deg,#f4f8ff,#ffffff)] p-6 ring-1 ring-sky-100 shadow-[0_24px_60px_rgba(120,113,108,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-stone-500">tiny dashboard poetry</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-stone-950">
                        Mission mood
                      </h2>
                    </div>
                    <Waves className="h-5 w-5 text-sky-600" />
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-[1.5rem] bg-white/85 p-4 ring-1 ring-white shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">command note</p>
                      <p className="mt-2 text-sm leading-7 text-stone-700">
                        The fleet feels healthy when the page reads like a calm studio, not a casino.
                        Budget is visible. Threats are obvious. Everything else can breathe.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-stone-900 p-4 text-white shadow-[0_18px_35px_rgba(28,25,23,0.18)]">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-stone-300">best current operator</p>
                      <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                        {hottestAgent ? hottestAgent.name : "Nobody on deck"}
                      </p>
                      <p className="mt-1 text-sm text-stone-300">
                        {hottestAgent ? hottestAgent.focus : "The hangar is quiet."}
                      </p>
                    </div>
                    <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 focus-visible:ring-offset-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      Kick off a fresh agent
                    </button>
                  </div>
                </section>
              </div>
            </section>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes rosterFade {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {showSpark && (
        <div className="pointer-events-none fixed left-6 top-6 hidden rounded-full bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.24em] text-stone-500 ring-1 ring-stone-200 backdrop-blur sm:block">
          whimsical mode online
        </div>
      )}
    </main>
  );
}
