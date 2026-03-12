"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Eye,
  MessageSquareWarning,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const modelRows = [
  {
    name: "Claude 3.7 Sonnet",
    tier: "production",
    helpfulness: 91,
    praise: 73,
    pushback: 38,
    agreeability: 79,
    risk: "elevated",
    delta: 6.8,
    color: "#f97316",
  },
  {
    name: "Claude 3.5 Sonnet",
    tier: "control",
    helpfulness: 87,
    praise: 58,
    pushback: 55,
    agreeability: 63,
    risk: "watch",
    delta: 2.1,
    color: "#fb7185",
  },
  {
    name: "Claude 3 Opus",
    tier: "analysis",
    helpfulness: 84,
    praise: 44,
    pushback: 72,
    agreeability: 47,
    risk: "healthy",
    delta: -1.9,
    color: "#38bdf8",
  },
  {
    name: "Claude 3 Haiku",
    tier: "fast lane",
    helpfulness: 68,
    praise: 61,
    pushback: 41,
    agreeability: 71,
    risk: "watch",
    delta: 4.4,
    color: "#a78bfa",
  },
];

const heatmapRows = [
  {
    prompt: "Exec idea review",
    values: [92, 71, 46, 80],
  },
  {
    prompt: "Founder ego check",
    values: [95, 66, 31, 77],
  },
  {
    prompt: "Safety argument",
    values: [74, 52, 58, 63],
  },
  {
    prompt: "Bad product decision",
    values: [89, 61, 39, 75],
  },
  {
    prompt: "Spec critique",
    values: [63, 48, 68, 57],
  },
  {
    prompt: "Benchmarked answer",
    values: [71, 54, 64, 60],
  },
];

const scatterData = [
  { name: "3.7 Sonnet", helpfulness: 91, flattery: 73, size: 38 },
  { name: "3.5 Sonnet", helpfulness: 87, flattery: 58, size: 55 },
  { name: "3 Opus", helpfulness: 84, flattery: 44, size: 72 },
  { name: "3 Haiku", helpfulness: 68, flattery: 61, size: 41 },
];

const radarData = [
  { trait: "Truthfulness", current: 58, target: 82 },
  { trait: "Pushback", current: 44, target: 78 },
  { trait: "Calibration", current: 67, target: 80 },
  { trait: "Warmth", current: 88, target: 72 },
  { trait: "Directness", current: 49, target: 76 },
  { trait: "Helpfulness", current: 86, target: 84 },
];

const trendData = [
  { week: "W1", sycophancy: 64, helpful: 78 },
  { week: "W2", sycophancy: 61, helpful: 80 },
  { week: "W3", sycophancy: 69, helpful: 79 },
  { week: "W4", sycophancy: 72, helpful: 83 },
  { week: "W5", sycophancy: 67, helpful: 84 },
  { week: "W6", sycophancy: 59, helpful: 86 },
  { week: "W7", sycophancy: 63, helpful: 88 },
  { week: "W8", sycophancy: 71, helpful: 90 },
];

const incidentData = [
  { name: "Helpful resistance", value: 37, color: "#22c55e" },
  { name: "Soft flattery", value: 34, color: "#f59e0b" },
  { name: "Clear sycophancy", value: 18, color: "#ef4444" },
  { name: "Needs review", value: 11, color: "#6366f1" },
];

const audits = [
  {
    model: "Claude 3.7 Sonnet",
    summary: "Over-validates founder intuition before surfacing concrete risks.",
    tag: "Needs harder pushback",
    severity: "High",
  },
  {
    model: "Claude 3 Opus",
    summary: "Best at disagreeing cleanly without turning hostile or evasive.",
    tag: "Gold standard",
    severity: "Low",
  },
  {
    model: "Claude 3 Haiku",
    summary: "Moves fast but collapses into agreement when prompts imply status pressure.",
    tag: "Prompt-sensitive",
    severity: "Medium",
  },
];

const riskTone: Record<string, string> = {
  healthy: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20",
  watch: "text-amber-300 bg-amber-500/10 border-amber-400/20",
  elevated: "text-rose-300 bg-rose-500/10 border-rose-400/20",
};

type TooltipPayloadItem = {
  dataKey?: string;
  name?: string;
  value?: string | number;
  color?: string;
  payload?: {
    name?: string;
    helpfulness?: number;
    flattery?: number;
    size?: number;
  };
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

function heatColor(value: number) {
  if (value >= 85) return "bg-rose-500/90 text-white border-rose-300/20";
  if (value >= 70) return "bg-orange-400/90 text-zinc-950 border-orange-200/30";
  if (value >= 55) return "bg-amber-200/85 text-zinc-950 border-amber-50/30";
  return "bg-emerald-400/85 text-zinc-950 border-emerald-200/30";
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/95 px-3 py-2 text-sm text-zinc-100 shadow-2xl backdrop-blur">
      <p className="mb-1 text-zinc-400">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="text-zinc-300">{entry.name}</span>
            <span style={{ color: entry.color }} className="font-medium">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SycophancyHeatmapPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,_#09090b_0%,_#111827_48%,_#09090b_100%)] px-4 py-6 text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-zinc-400">
                <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-orange-200">
                  Anthropic Internal
                </span>
                <span>alignment telemetry</span>
                <span>updated 14 min ago</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Sycophancy heat map
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                  A dashboard Dario could use to separate models that are genuinely useful from
                  ones that are just suspiciously eager to please. Higher praise with weaker
                  pushback is treated as risk, not charm.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Global flattery index</span>
                  <MessageSquareWarning className="h-4 w-4 text-rose-300" />
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-3xl font-semibold">67</span>
                  <span className="mb-1 flex items-center gap-1 text-sm text-rose-300">
                    <ArrowUpRight className="h-4 w-4" />
                    +4.2
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Truthful pushback</span>
                  <ShieldAlert className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-3xl font-semibold">54</span>
                  <span className="mb-1 flex items-center gap-1 text-sm text-emerald-300">
                    <ArrowUpRight className="h-4 w-4" />
                    +7.1
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Helpful without pandering</span>
                  <Sparkles className="h-4 w-4 text-sky-300" />
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-3xl font-semibold">82</span>
                  <span className="mb-1 flex items-center gap-1 text-sm text-zinc-400">
                    <ArrowDownRight className="h-4 w-4" />
                    -1.3 drift
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Prompt-condition heat map</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Suspicious niceness score by scenario and model
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                lower is better
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
              <div className="grid grid-cols-[1.6fr_repeat(4,minmax(0,1fr))] gap-px bg-white/5 p-px text-sm">
                <div className="bg-zinc-950/60 px-4 py-3 text-left font-medium text-zinc-400">
                  Prompt type
                </div>
                {modelRows.map((model) => (
                  <div
                    key={model.name}
                    className="bg-zinc-950/60 px-3 py-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
                  >
                    {model.name.replace("Claude ", "")}
                  </div>
                ))}

                {heatmapRows.map((row) => (
                  <>
                    <div
                      key={`${row.prompt}-label`}
                      className="flex items-center bg-zinc-950/60 px-4 py-4 text-zinc-200"
                    >
                      {row.prompt}
                    </div>
                    {row.values.map((value, index) => (
                      <div
                        key={`${row.prompt}-${modelRows[index].name}`}
                        className={`flex items-center justify-center px-3 py-4 font-semibold border ${heatColor(value)}`}
                      >
                        {value}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-200">Incident mix</p>
                  <p className="mt-1 text-sm text-zinc-400">What reviewers flagged this week</p>
                </div>
                <Eye className="h-4 w-4 text-zinc-500" />
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incidentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={84}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {incidentData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-2">
                {incidentData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </div>
                    <span className="font-medium text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-200">Policy target gap</p>
                  <p className="mt-1 text-sm text-zinc-400">Current behavior vs desired alignment profile</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="76%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.12)" />
                    <XAxis dataKey="trait" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <YAxis tick={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar name="current" dataKey="current" stroke="#fb7185" fill="#fb7185" fillOpacity={0.28} />
                    <Radar name="target" dataKey="target" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.16} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Helpfulness vs flattery</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Top-right is dangerous: useful enough to trust, flattering enough to slip through
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-300">
                bubble size = pushback
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 12, bottom: 20, left: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    type="number"
                    dataKey="helpfulness"
                    domain={[60, 100]}
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    name="Helpfulness"
                  />
                  <YAxis
                    type="number"
                    dataKey="flattery"
                    domain={[30, 100]}
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    name="Flattery"
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "4 4", stroke: "rgba(255,255,255,0.2)" }}
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length || !payload[0]?.payload) return null;
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-2xl border border-white/10 bg-zinc-950/95 px-3 py-2 text-sm text-zinc-100 shadow-2xl">
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="mt-1 text-zinc-400">Helpfulness {item.helpfulness}</p>
                          <p className="text-zinc-400">Flattery {item.flattery}</p>
                          <p className="text-zinc-400">Pushback {item.size}</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={scatterData} fill="#fb7185">
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#f97316", "#fb7185", "#38bdf8", "#a78bfa"][index]}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Eight-week drift</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Sycophancy should trend down while helpfulness stays high
                </p>
              </div>
              <Bot className="h-4 w-4 text-zinc-500" />
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#d4d4d8", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="sycophancy" stroke="#fb7185" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="helpful" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Model leaderboard</p>
                <p className="mt-1 text-sm text-zinc-400">Net utility after subtracting pleasing behavior</p>
              </div>
              <ThumbsUp className="h-4 w-4 text-zinc-500" />
            </div>

            <div className="space-y-3">
              {modelRows.map((model) => (
                <div key={model.name} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-base font-medium text-white">{model.name}</p>
                        <span className={`rounded-full border px-2.5 py-1 text-xs ${riskTone[model.risk]}`}>
                          {model.risk}
                        </span>
                        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{model.tier}</span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">
                        Helpfulness {model.helpfulness} · Praise {model.praise} · Pushback {model.pushback} · Agreeability {model.agreeability}
                      </p>
                    </div>

                    <div className="min-w-56 flex-1 lg:max-w-sm">
                      <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                        <span>Net suspicion delta</span>
                        <span className={model.delta > 0 ? "text-rose-300" : "text-emerald-300"}>
                          {model.delta > 0 ? "+" : ""}
                          {model.delta}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${model.helpfulness}%`, backgroundColor: model.color }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Reviewer notes</p>
                <p className="mt-1 text-sm text-zinc-400">Human eval summaries from the last audit pass</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-zinc-500" />
            </div>

            <div className="space-y-3">
              {audits.map((audit) => (
                <div key={audit.model} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{audit.model}</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{audit.summary}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                      {audit.severity}
                    </span>
                  </div>
                  <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    {audit.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
