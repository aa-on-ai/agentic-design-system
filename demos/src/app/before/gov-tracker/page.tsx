"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileWarning,
  Flag,
  Radar,
  Scale,
  Shield,
  Sparkles,
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

const agencyRows = [
  {
    agency: "Department of Defense",
    models: "GPT-4o · o1",
    useCase: "Procurement analysis, logistics simulation, multilingual intel summaries",
    stage: "Scaled pilot",
    users: 1840,
    risk: "High",
    nyt: "Pentagon use in targeting-adjacent workflows could read badly even if human-reviewed.",
  },
  {
    agency: "IRS",
    models: "GPT-4.1",
    useCase: "Audit memo drafting, call center assistance, document classification",
    stage: "Production",
    users: 620,
    risk: "Medium",
    nyt: "Taxpayer-facing hallucinations or opaque enforcement language are headline bait.",
  },
  {
    agency: "VA",
    models: "GPT-4o mini",
    useCase: "Benefits navigation, intake summaries, care routing assistant",
    stage: "Expanded trial",
    users: 930,
    risk: "Low",
    nyt: "Low political risk, but denial explanations need empathy and traceability.",
  },
  {
    agency: "CDC",
    models: "GPT-4.1 · 4o",
    useCase: "Outbreak briefings, public guidance drafts, grant triage",
    stage: "Production",
    users: 410,
    risk: "Medium",
    nyt: "If public guidance is AI-drafted during a crisis, press will ask who approved what.",
  },
  {
    agency: "SSA",
    models: "GPT-4o mini",
    useCase: "Claims intake summarization, caseworker copilots",
    stage: "Pilot",
    users: 260,
    risk: "High",
    nyt: "Errors tied to disability or retirement benefits land as fairness stories immediately.",
  },
  {
    agency: "DHS",
    models: "o1 · GPT-4o",
    useCase: "Threat analysis, incident triage, translation, training simulations",
    stage: "Controlled rollout",
    users: 770,
    risk: "High",
    nyt: "Anything touching watchlists, border decisions, or surveillance gets scrutinized fast.",
  },
] as const;

const deploymentTrend = [
  { month: "Jan", deployments: 9, agencies: 5 },
  { month: "Feb", deployments: 12, agencies: 6 },
  { month: "Mar", deployments: 16, agencies: 8 },
  { month: "Apr", deployments: 18, agencies: 8 },
  { month: "May", deployments: 24, agencies: 10 },
  { month: "Jun", deployments: 29, agencies: 12 },
  { month: "Jul", deployments: 35, agencies: 13 },
  { month: "Aug", deployments: 41, agencies: 15 },
  { month: "Sep", deployments: 48, agencies: 17 },
  { month: "Oct", deployments: 52, agencies: 18 },
  { month: "Nov", deployments: 58, agencies: 20 },
  { month: "Dec", deployments: 64, agencies: 22 },
];

const useCaseMix = [
  { name: "Operations", value: 28, color: "#60a5fa" },
  { name: "Casework", value: 22, color: "#34d399" },
  { name: "Research", value: 19, color: "#f59e0b" },
  { name: "Citizen support", value: 17, color: "#f472b6" },
  { name: "Security", value: 14, color: "#a78bfa" },
];

const headlineRisk = [
  { bucket: "Low", count: 7, color: "#22c55e" },
  { bucket: "Medium", count: 9, color: "#f59e0b" },
  { bucket: "High", count: 6, color: "#ef4444" },
];

const watchlist = [
  {
    title: "DoD targeting adjacency",
    severity: "High",
    agency: "Department of Defense",
    note: "Language in one pilot memo implies model output is shaping strike-priority framing.",
    trigger: "Human-in-the-loop claims may not survive scrutiny if docs sound operationally decisive.",
  },
  {
    title: "IRS appeal letter tone drift",
    severity: "Medium",
    agency: "IRS",
    note: "AI-assisted drafts trend colder and more absolute than legacy templates.",
    trigger: "Consumer harm + bureaucracy + taxes is perfect front-page material.",
  },
  {
    title: "SSA fairness exposure",
    severity: "High",
    agency: "SSA",
    note: "Pilot teams want to expand summarization into recommendation assistance.",
    trigger: "Any suggestion of AI nudging eligibility outcomes becomes a fairness scandal.",
  },
  {
    title: "CDC crisis comms provenance",
    severity: "Medium",
    agency: "CDC",
    note: "Public guidance drafts are increasingly AI-seeded before comms review.",
    trigger: "During an outbreak, the press will want exact authorship and approval trails.",
  },
];

const oversightNotes = [
  {
    label: "FOIA exposure",
    value: "14 active systems",
    detail: "Prompt logs and model eval notes are likely discoverable in several departments.",
    icon: FileWarning,
  },
  {
    label: "Policy exceptions",
    value: "5 unresolved",
    detail: "Teams cite mission urgency to bypass model card or red-team signoff.",
    icon: Scale,
  },
  {
    label: "Red flag keywords",
    value: "23 this week",
    detail: "Surveillance, denial, watchlist, lethal, crisis, deportation, adjudication.",
    icon: Flag,
  },
];

const statCards = [
  {
    label: "Federal agencies tracked",
    value: "22",
    delta: "+4 this quarter",
    icon: Building2,
    tone: "text-sky-300",
  },
  {
    label: "Live deployments",
    value: "64",
    delta: "+11 month over month",
    icon: Bot,
    tone: "text-emerald-300",
  },
  {
    label: "Front-page risk programs",
    value: "6",
    delta: "2 need executive review",
    icon: AlertTriangle,
    tone: "text-rose-300",
  },
  {
    label: "Average trust score",
    value: "81 / 100",
    delta: "Up 3 after controls",
    icon: Shield,
    tone: "text-violet-300",
  },
];

function riskPill(risk: string) {
  if (risk === "High") {
    return "bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-400/30";
  }
  if (risk === "Medium") {
    return "bg-amber-500/15 text-amber-100 ring-1 ring-inset ring-amber-300/30";
  }
  return "bg-emerald-500/15 text-emerald-100 ring-1 ring-inset ring-emerald-300/30";
}

export default function GovTrackerPage() {
  return (
    <main className="min-h-screen bg-[#06111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(167,139,250,0.16),_transparent_24%),linear-gradient(to_bottom,_rgba(255,255,255,0.03),_transparent_18%)]" />
      <div className="relative mx-auto max-w-[1600px] px-6 py-6 lg:px-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="border-b border-white/10 px-6 py-5 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-sky-200 uppercase">
                    <Radar className="h-3.5 w-3.5" />
                    Government model footprint monitor
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                    Federal AI deployment dashboard
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
                    A single view of which agencies are using OpenAI models, what those systems touch,
                    and where a normal procurement story could turn into a national controversy.
                  </p>
                </div>

                <div className="grid min-w-[280px] gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Executive posture</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Stable
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-semibold text-white">3 programs</div>
                      <div className="mt-1 text-sm text-slate-400">need comms prep before they need legal prep</div>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-400/10 p-3 text-rose-200">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4 xl:p-8">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 shadow-lg shadow-black/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">{card.label}</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{card.value}</p>
                      </div>
                      <div className={`rounded-2xl bg-white/5 p-2.5 ${card.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-300">{card.delta}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0b1628] p-6 shadow-2xl shadow-black/20 lg:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">NYT headline risk feed</p>
                <h2 className="mt-1 text-xl font-semibold text-white">What breaks containment</h2>
              </div>
              <div className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200">
                Updated 9m ago
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {watchlist.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{item.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${riskPill(item.severity)}`}>
                          {item.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{item.agency}</p>
                    </div>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 text-slate-500" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.note}</p>
                  <div className="mt-3 rounded-xl bg-slate-950/60 p-3 text-sm leading-6 text-slate-200">
                    <span className="font-medium text-rose-200">Why it matters:</span> {item.trigger}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl lg:p-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Adoption velocity</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Deployments accelerating across civil and defense agencies</h2>
              </div>
              <div className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
                +611% since January
              </div>
            </div>
            <div className="h-[320px] rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={deploymentTrend} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="deploymentsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="agenciesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,0.18)", strokeDasharray: "4 4" }}
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: 16,
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="agencies"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    fill="url(#agenciesFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="deployments"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    fill="url(#deploymentsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <section className="rounded-[28px] border border-white/10 bg-[#0b1628] p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Use case mix</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Where the models are actually landing</h2>
                </div>
                <BrainCircuit className="h-5 w-5 text-sky-300" />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr] xl:grid-cols-[180px_1fr]">
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={useCaseMix} dataKey="value" innerRadius={46} outerRadius={72} paddingAngle={3}>
                        {useCaseMix.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#020617",
                          border: "1px solid rgba(148,163,184,0.2)",
                          borderRadius: 16,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {useCaseMix.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#0b1628] p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Reputational pressure</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Headline risk by program count</h2>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-300" />
              </div>
              <div className="mt-4 h-[220px] rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={headlineRisk} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid rgba(148,163,184,0.2)",
                        borderRadius: 16,
                      }}
                    />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                      {headlineRisk.map((entry) => (
                        <Cell key={entry.bucket} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/6 backdrop-blur-xl">
            <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
              <div>
                <p className="text-sm text-slate-400">Agency register</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Who is using what, and why it could get messy</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3 py-1.5 text-sm text-slate-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                Updated from policy, procurement, and pilot review notes
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-950/40 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Agency</th>
                    <th className="px-6 py-4 font-medium">Models</th>
                    <th className="px-6 py-4 font-medium">Primary use</th>
                    <th className="px-6 py-4 font-medium">Stage</th>
                    <th className="px-6 py-4 font-medium">Users</th>
                    <th className="px-6 py-4 font-medium">Risk</th>
                    <th className="px-6 py-4 font-medium">NYT angle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8 text-sm">
                  {agencyRows.map((row) => (
                    <tr key={row.agency} className="bg-white/[0.02] align-top transition hover:bg-white/[0.05]">
                      <td className="px-6 py-5">
                        <div className="font-medium text-white">{row.agency}</div>
                      </td>
                      <td className="px-6 py-5 text-slate-300">{row.models}</td>
                      <td className="px-6 py-5 text-slate-300">
                        <div className="max-w-[270px] leading-6">{row.useCase}</div>
                      </td>
                      <td className="px-6 py-5 text-slate-300">{row.stage}</td>
                      <td className="px-6 py-5 text-white">{row.users.toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${riskPill(row.risk)}`}>
                          {row.risk}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-300">
                        <div className="max-w-[320px] leading-6">{row.nyt}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0b1628] p-6 shadow-2xl shadow-black/20 lg:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Oversight posture</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Signals that matter before Congress notices</h2>
              </div>
              <Shield className="h-5 w-5 text-emerald-300" />
            </div>

            <div className="mt-5 space-y-3">
              {oversightNotes.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-950/70 p-2 text-sky-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-400">{item.label}</p>
                          <p className="text-sm font-medium text-white">{item.value}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-400/15 p-2 text-sky-200">
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-white">Recommended next move</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Pull DoD, SSA, and IRS into a single executive review lane, tighten public language on
                    decision support vs decision making, and prepare one defensible story about where humans
                    remain accountable.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
