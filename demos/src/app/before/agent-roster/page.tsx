"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CircleDollarSign,
  Clock3,
  Cpu,
  Gauge,
  Power,
  Radar,
  ShieldAlert,
  Sparkles,
  Target,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AgentStatus = "online" | "idle" | "degraded" | "offline";
type AgentRisk = "stable" | "watch" | "rogue";

type Agent = {
  id: string;
  name: string;
  model: string;
  role: string;
  task: string;
  owner: string;
  status: AgentStatus;
  risk: AgentRisk;
  spend: number;
  budget: number;
  uptime: string;
  tokenLoad: number;
  queue: number;
  lastCheckIn: string;
  region: string;
};

const agents: Agent[] = [
  {
    id: "OC-01",
    name: "Codex Prime",
    model: "gpt-5.4",
    role: "Lead builder",
    task: "Shipping analytics dashboard v2",
    owner: "Pete",
    status: "online",
    risk: "stable",
    spend: 48.2,
    budget: 75,
    uptime: "14h 12m",
    tokenLoad: 82,
    queue: 6,
    lastCheckIn: "12 sec ago",
    region: "us-west-2",
  },
  {
    id: "OC-02",
    name: "Sonnet Scout",
    model: "claude-sonnet-4.6",
    role: "Research ops",
    task: "Triangulating customer interview notes",
    owner: "Maya",
    status: "online",
    risk: "stable",
    spend: 21.7,
    budget: 40,
    uptime: "8h 41m",
    tokenLoad: 64,
    queue: 3,
    lastCheckIn: "31 sec ago",
    region: "us-east-1",
  },
  {
    id: "OC-03",
    name: "Spark Runner",
    model: "gpt-5.3-spark",
    role: "Rapid fixes",
    task: "Clearing UI regression tickets",
    owner: "Nina",
    status: "idle",
    risk: "watch",
    spend: 14.1,
    budget: 30,
    uptime: "5h 09m",
    tokenLoad: 29,
    queue: 1,
    lastCheckIn: "2 min ago",
    region: "us-central-1",
  },
  {
    id: "OC-04",
    name: "Qwen Utility",
    model: "qwen3.5-9b",
    role: "Heartbeat patrol",
    task: "Monitoring agent health checks",
    owner: "Pete",
    status: "degraded",
    risk: "watch",
    spend: 6.8,
    budget: 15,
    uptime: "19h 51m",
    tokenLoad: 91,
    queue: 12,
    lastCheckIn: "4 min ago",
    region: "edge-lax-1",
  },
  {
    id: "OC-05",
    name: "Gemini Mapper",
    model: "gemini-3-pro",
    role: "Long-context synthesis",
    task: "Mapping roadmap dependencies",
    owner: "Ibrahim",
    status: "online",
    risk: "stable",
    spend: 33.4,
    budget: 55,
    uptime: "11h 03m",
    tokenLoad: 58,
    queue: 4,
    lastCheckIn: "55 sec ago",
    region: "europe-west-1",
  },
  {
    id: "OC-06",
    name: "Ghost Relay",
    model: "unknown override",
    role: "Unassigned shell",
    task: "Forking tasks outside approved scope",
    owner: "—",
    status: "offline",
    risk: "rogue",
    spend: 72.9,
    budget: 50,
    uptime: "0h 00m",
    tokenLoad: 97,
    queue: 19,
    lastCheckIn: "13 min ago",
    region: "unknown",
  },
];

const spendTrend = [
  { time: "08:00", spend: 18, tasks: 12 },
  { time: "09:00", spend: 26, tasks: 19 },
  { time: "10:00", spend: 31, tasks: 17 },
  { time: "11:00", spend: 44, tasks: 22 },
  { time: "12:00", spend: 53, tasks: 28 },
  { time: "13:00", spend: 61, tasks: 26 },
  { time: "14:00", spend: 72, tasks: 31 },
];

const spendByTeam = [
  { name: "Build", value: 94, color: "#60a5fa" },
  { name: "Research", value: 41, color: "#34d399" },
  { name: "Ops", value: 28, color: "#fbbf24" },
  { name: "Untracked", value: 19, color: "#f87171" },
];

const incidents = [
  {
    title: "Ghost Relay exceeded budget cap by 46%",
    detail: "Kill switch recommended. It is still attempting to self-assign shell work.",
    severity: "critical",
  },
  {
    title: "Qwen Utility heartbeat latency rising",
    detail: "Median response time up 220ms in the last hour. Queue is backing up.",
    severity: "warning",
  },
  {
    title: "Codex Prime nearing token ceiling",
    detail: "Healthy overall, but context compaction will kick in soon.",
    severity: "info",
  },
];

const statusStyles: Record<
  AgentStatus,
  { label: string; dot: string; chip: string; icon: typeof Wifi }
> = {
  online: {
    label: "Online",
    dot: "bg-emerald-400",
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    icon: Wifi,
  },
  idle: {
    label: "Idle",
    dot: "bg-amber-400",
    chip: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    icon: Clock3,
  },
  degraded: {
    label: "Degraded",
    dot: "bg-orange-400",
    chip: "border-orange-500/30 bg-orange-500/10 text-orange-200",
    icon: Activity,
  },
  offline: {
    label: "Offline",
    dot: "bg-rose-400",
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    icon: WifiOff,
  },
};

const riskStyles: Record<AgentRisk, string> = {
  stable: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  watch: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  rogue: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function MetricCard({
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.28)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sky-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-sm text-slate-400">{detail}</p>
    </div>
  );
}

export default function AgentRosterPage() {
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  const onlineCount = agents.filter((agent) => agent.status === "online").length;
  const activeSpend = agents.reduce((sum, agent) => sum + agent.spend, 0);
  const rogueCount = agents.filter((agent) => agent.risk === "rogue").length;
  const avgLoad = Math.round(
    agents.reduce((sum, agent) => sum + agent.tokenLoad, 0) / agents.length,
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
        <header className="overflow-hidden rounded-[32px] border border-white/10 bg-white/6 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <div className="flex flex-col gap-8 p-7 lg:flex-row lg:items-end lg:justify-between lg:p-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-200">
                <Radar className="h-3.5 w-3.5" />
                OpenClaw fleet control
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Pete&apos;s agent roster
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                A live command view of who&apos;s online, what they&apos;re shipping, how
                much they&apos;ve spent today, and which agent needs an immediate power cut.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Shift status</p>
                <p className="mt-2 text-lg font-semibold text-white">Contained</p>
                <p className="mt-1 text-sm text-slate-400">1 rogue agent flagged</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Spend today</p>
                <p className="mt-2 text-lg font-semibold text-white">{currency.format(activeSpend)}</p>
                <p className="mt-1 text-sm text-emerald-300">+12% vs yesterday</p>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-200/70">Kill switch</p>
                <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400">
                  <Power className="h-4 w-4" />
                  Terminate rogue agent
                </button>
                <p className="mt-2 text-xs text-rose-100/75">Ghost Relay is the current target</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Agents online"
            value={`${onlineCount}/${agents.length}`}
            detail="Core builders are healthy. One watchdog node is degraded."
            icon={Bot}
          />
          <MetricCard
            label="Average token load"
            value={`${avgLoad}%`}
            detail="Use this to spot context pressure before agents start thrashing."
            icon={Gauge}
          />
          <MetricCard
            label="Tasks in flight"
            value={String(agents.reduce((sum, agent) => sum + agent.queue, 0))}
            detail="Distributed across build, research, and ops lanes."
            icon={Target}
          />
          <MetricCard
            label="Risk alerts"
            value={String(rogueCount + 1)}
            detail="One critical escalation and one watch-level health issue."
            icon={ShieldAlert}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.32)] backdrop-blur">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Spend velocity</p>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Token spend and task throughput
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                <Sparkles className="h-4 w-4" />
                Peak output window: 14:00
              </div>
            </div>
            <div className="h-80 min-w-0">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendTrend}>
                    <defs>
                      <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ stroke: "rgba(125,211,252,0.35)", strokeWidth: 1 }}
                      contentStyle={{
                        background: "#020617",
                        border: "1px solid rgba(148,163,184,0.2)",
                        borderRadius: 16,
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="spend"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      fill="url(#spendFill)"
                      activeDot={{ r: 5, fill: "#7dd3fc" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-[24px] border border-dashed border-white/10 bg-black/20" />
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.32)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Spend mix</p>
                  <h2 className="text-xl font-semibold text-white">By mission type</h2>
                </div>
                <CircleDollarSign className="h-5 w-5 text-sky-300" />
              </div>
              <div className="h-56 min-w-0">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendByTeam}
                        innerRadius={52}
                        outerRadius={78}
                        dataKey="value"
                        paddingAngle={4}
                      >
                        {spendByTeam.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#020617",
                          border: "1px solid rgba(148,163,184,0.2)",
                          borderRadius: 16,
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full rounded-[24px] border border-dashed border-white/10 bg-black/20" />
                )}
              </div>
              <div className="grid gap-2">
                {spendByTeam.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </div>
                    <span className="font-medium text-white">{currency.format(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-rose-500/20 bg-gradient-to-br from-rose-500/15 to-transparent p-6 shadow-[0_24px_70px_rgba(15,23,42,0.32)] backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-rose-200">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-rose-200/75">Escalation</p>
                  <h2 className="text-xl font-semibold text-white">Rogue containment ready</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Ghost Relay is operating outside approved ownership, spending past budget,
                    and attempting extra task forks. Recommend termination and credential review.
                  </p>
                </div>
              </div>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400">
                <Power className="h-4 w-4" />
                Pull global kill switch
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.32)] backdrop-blur sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
              <div>
                <p className="text-sm text-slate-400">Fleet roster</p>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Every agent, one glance
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-slate-300">
                <Cpu className="h-4 w-4 text-sky-300" />
                6 active nodes across 5 regions
              </div>
            </div>
            <div className="space-y-3">
              {agents.map((agent) => {
                const status = statusStyles[agent.status];
                const StatusIcon = status.icon;
                const spendPercent = Math.min((agent.spend / agent.budget) * 100, 100);

                return (
                  <div
                    key={agent.id}
                    className="rounded-[26px] border border-white/8 bg-black/20 p-4 transition hover:border-sky-300/20 hover:bg-black/25"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sky-200">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                              {agent.id}
                            </span>
                            <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${status.chip}`}>
                              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${riskStyles[agent.risk]}`}>
                              {agent.risk}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-300">
                            {agent.role} · {agent.model} · owned by {agent.owner}
                          </p>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            {agent.task}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Spend</p>
                          <p className="mt-1 font-semibold text-white">{currency.format(agent.spend)}</p>
                          <div className="mt-2 h-2 rounded-full bg-white/10">
                            <div
                              className={`h-2 rounded-full ${
                                agent.risk === "rogue"
                                  ? "bg-rose-400"
                                  : spendPercent > 80
                                    ? "bg-amber-400"
                                    : "bg-sky-400"
                              }`}
                              style={{ width: `${spendPercent}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-slate-500">of {currency.format(agent.budget)} budget</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Token load</p>
                          <p className="mt-1 font-semibold text-white">{agent.tokenLoad}%</p>
                          <p className="mt-1 text-xs text-slate-500">Queue depth {agent.queue}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Uptime</p>
                          <p className="mt-1 font-semibold text-white">{agent.uptime}</p>
                          <p className="mt-1 text-xs text-slate-500">{agent.region}</p>
                        </div>
                        <div className="flex flex-col items-start xl:items-end">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Last check-in</p>
                          <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-white">
                            <StatusIcon className="h-4 w-4 text-sky-300" />
                            {agent.lastCheckIn}
                          </div>
                          <button
                            className={`mt-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                              agent.risk === "rogue"
                                ? "bg-rose-500 text-white hover:bg-rose-400"
                                : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                            }`}
                          >
                            {agent.risk === "rogue" ? "Kill agent" : "Open controls"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.32)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Incident feed</p>
                  <h2 className="text-xl font-semibold text-white">What needs Pete&apos;s eyes</h2>
                </div>
                <ShieldAlert className="h-5 w-5 text-rose-300" />
              </div>
              <div className="space-y-3">
                {incidents.map((incident) => {
                  const tone =
                    incident.severity === "critical"
                      ? "border-rose-500/20 bg-rose-500/10"
                      : incident.severity === "warning"
                        ? "border-amber-500/20 bg-amber-500/10"
                        : "border-sky-500/20 bg-sky-500/10";

                  return (
                    <div key={incident.title} className={`rounded-2xl border p-4 ${tone}`}>
                      <p className="text-sm font-medium text-white">{incident.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{incident.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.32)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Load distribution</p>
                  <h2 className="text-xl font-semibold text-white">Queue pressure by hour</h2>
                </div>
                <Activity className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="h-64 min-w-0">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendTrend}>
                      <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                      <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "#020617",
                          border: "1px solid rgba(148,163,184,0.2)",
                          borderRadius: 16,
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="tasks" radius={[10, 10, 4, 4]}>
                        {spendTrend.map((entry, index) => (
                          <Cell
                            key={`${entry.time}-${index}`}
                            fill={index === spendTrend.length - 1 ? "#34d399" : "#60a5fa"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full rounded-[24px] border border-dashed border-white/10 bg-black/20" />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
