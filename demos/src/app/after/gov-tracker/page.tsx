"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  FileText,
  Gavel,
  Landmark,
  Loader2,
  Radar,
  Scale,
  Search,
  ShieldCheck,
  ShieldX,
  Sparkles,
  TrendingUp,
  Waypoints,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ViewState = "happy" | "loading" | "empty" | "error";

type AgencyRow = {
  agency: string;
  office: string;
  useCase: string;
  model: string;
  stage: string;
  deployments: number;
  compliance: number;
  risk: "Low" | "Watch" | "High";
  nytFlag: string;
};

const navGroups = [
  {
    label: "Monitor",
    items: [
      { name: "Tracker", icon: Radar, active: true },
      { name: "Investigations", icon: Search },
      { name: "Compliance", icon: ShieldCheck },
      { name: "Briefing", icon: FileText },
    ],
  },
  {
    label: "Views",
    items: [
      { name: "Federal", icon: Landmark },
      { name: "Vendors", icon: Building2 },
      { name: "Deployments", icon: Waypoints },
    ],
  },
];

const agencies: AgencyRow[] = [
  {
    agency: "Department of Defense",
    office: "Joint logistics command",
    useCase: "Procurement analysis, maintenance forecasting, multilingual brief synthesis",
    model: "o1 + GPT-4.1",
    stage: "Scaled pilot",
    deployments: 18,
    compliance: 71,
    risk: "High",
    nytFlag: "Target-adjacent language in internal planning deck",
  },
  {
    agency: "Internal Revenue Service",
    office: "Taxpayer services",
    useCase: "Appeal letter drafting, auditor memo cleanup, call center assistance",
    model: "GPT-4.1",
    stage: "Production",
    deployments: 11,
    compliance: 84,
    risk: "Watch",
    nytFlag: "Colder denial language than legacy templates",
  },
  {
    agency: "Social Security Administration",
    office: "Disability intake",
    useCase: "Case summarization, claimant timeline cleanup, worker copilot",
    model: "GPT-4o mini",
    stage: "Pilot",
    deployments: 7,
    compliance: 62,
    risk: "High",
    nytFlag: "Summarization drifting toward recommendation support",
  },
  {
    agency: "Centers for Disease Control",
    office: "Emergency communications",
    useCase: "Outbreak briefs, grant triage, public guidance synthesis",
    model: "GPT-4o",
    stage: "Production",
    deployments: 9,
    compliance: 88,
    risk: "Watch",
    nytFlag: "Authorship trail gets fuzzy during crisis response",
  },
  {
    agency: "Veterans Affairs",
    office: "Benefits navigation",
    useCase: "Intake summaries, care routing assist, portal guidance drafts",
    model: "GPT-4o mini",
    stage: "Expanded trial",
    deployments: 6,
    compliance: 92,
    risk: "Low",
    nytFlag: "Sensitive, but governable with visible human review",
  },
  {
    agency: "Department of Homeland Security",
    office: "Incident analysis",
    useCase: "Translation, triage summaries, training simulation, incident prep",
    model: "o1 + GPT-4o",
    stage: "Controlled rollout",
    deployments: 13,
    compliance: 67,
    risk: "High",
    nytFlag: "Surveillance adjacency would turn into a story instantly",
  },
];

const adoptionTrend = [
  { month: "Jan", deployments: 8, audited: 6 },
  { month: "Feb", deployments: 11, audited: 8 },
  { month: "Mar", deployments: 15, audited: 11 },
  { month: "Apr", deployments: 18, audited: 13 },
  { month: "May", deployments: 24, audited: 17 },
  { month: "Jun", deployments: 29, audited: 20 },
  { month: "Jul", deployments: 34, audited: 23 },
  { month: "Aug", deployments: 39, audited: 26 },
  { month: "Sep", deployments: 45, audited: 31 },
  { month: "Oct", deployments: 51, audited: 35 },
  { month: "Nov", deployments: 59, audited: 40 },
  { month: "Dec", deployments: 66, audited: 44 },
];

const categoryMix = [
  { name: "Operations", value: 24, color: "#0E7490" },
  { name: "Citizen service", value: 21, color: "#4C8FA3" },
  { name: "Research", value: 18, color: "#8FB1B8" },
  { name: "Security", value: 20, color: "#C7A97D" },
  { name: "Compliance", value: 17, color: "#D7C7AE" },
];

const riskFeed = [
  {
    title: "DoD memo language drift",
    note: "phrases like ‘priority shaping’ sound operational, not advisory",
    tone: "High",
  },
  {
    title: "SSA expansion request",
    note: "teams want to move from summarization into recommendation assistance",
    tone: "High",
  },
  {
    title: "IRS appeal empathy regression",
    note: "drafts are getting more absolute and less humane than prior baselines",
    tone: "Watch",
  },
  {
    title: "CDC provenance gap",
    note: "first-draft authorship is getting harder to explain crisply",
    tone: "Watch",
  },
];

const oversightCards = [
  {
    label: "FOIA-sensitive systems",
    value: "14",
    detail: "Prompt logs, eval notes, and exception memos are likely discoverable.",
    icon: FileText,
  },
  {
    label: "Policy exceptions",
    value: "5",
    detail: "Mission urgency is being used to skip model-card or red-team signoff.",
    icon: Gavel,
  },
  {
    label: "Accountability gaps",
    value: "3",
    detail: "Three programs still describe a reviewer, not a decider, in vague language.",
    icon: ShieldX,
  },
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Stagger({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={cn("fade-up", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Badge({ risk }: { risk: AgencyRow["risk"] | "High" | "Watch" }) {
  const tone =
    risk === "High"
      ? "bg-[#F5E7E4] text-[#8B3A2E]"
      : risk === "Watch"
        ? "bg-[#F4EEDF] text-[#8A6A2F]"
        : "bg-[#E8F1EE] text-[#2E6B59]";

  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium", tone)}>{risk}</span>;
}

function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={cn("bg-white/72 backdrop-blur-sm", className)}>{children}</section>;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={cn("animate-pulse bg-[#E9E6E0]", className)} />;
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Surface className="rounded-md border border-[#E7E1D8] p-8">
          <SkeletonBlock className="h-4 w-36 rounded-full" />
          <SkeletonBlock className="mt-6 h-16 w-[72%] rounded-md" />
          <SkeletonBlock className="mt-4 h-5 w-[52%] rounded-md" />
        </Surface>
        <div className="grid gap-6">
          <Surface className="rounded-md border border-[#E7E1D8] p-8">
            <SkeletonBlock className="h-4 w-24 rounded-full" />
            <SkeletonBlock className="mt-4 h-12 w-28 rounded-md" />
          </Surface>
          <Surface className="rounded-md border border-[#E7E1D8] p-8">
            <SkeletonBlock className="h-4 w-24 rounded-full" />
            <SkeletonBlock className="mt-4 h-12 w-20 rounded-md" />
          </Surface>
        </div>
      </div>
      <Surface className="rounded-md border border-[#E7E1D8] p-8">
        <div className="flex items-center gap-3 text-[#6B6A66]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading deployment records...
        </div>
        <SkeletonBlock className="mt-8 h-[320px] w-full rounded-md" />
      </Surface>
    </div>
  );
}

export default function GovTrackerPage() {
  const [view, setView] = useState<ViewState>("happy");
  const [activeAgency, setActiveAgency] = useState(agencies[0].agency);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visibleAgencies = useMemo(() => {
    if (view === "empty") return [];
    return agencies;
  }, [view]);

  const currentAgency = visibleAgencies.find((agency) => agency.agency === activeAgency) ?? visibleAgencies[0];

  const headlineRiskCount = visibleAgencies.filter((agency) => agency.risk === "High").length;
  const totalDeployments = visibleAgencies.reduce((sum, agency) => sum + agency.deployments, 0);
  const avgCompliance =
    visibleAgencies.length > 0
      ? Math.round(visibleAgencies.reduce((sum, agency) => sum + agency.compliance, 0) / visibleAgencies.length)
      : 0;

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1F1F1B]">
      <style jsx global>{`
        @keyframes pageFadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-up {
          opacity: 0;
          animation: pageFadeUp 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-up {
            opacity: 1;
            animation: none;
          }
        }
      `}</style>

      <div className="grid min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-r border-[#ECE6DD] bg-[#F4F2ED] px-5 py-6">
          <Stagger delay={0}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E6F2F4] text-[#0E7490]">
                <Radar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#24231F]">Gov AI Tracker</p>
                <p className="text-xs text-[#7A776F]">sam altman brief</p>
              </div>
            </div>
          </Stagger>

          <Stagger delay={50} className="mt-8">
            <div className="rounded-md border border-[#E7E1D8] bg-white/70 px-3 py-2 text-sm text-[#6B6A66]">
              federal agencies using ai
            </div>
          </Stagger>

          <nav className="mt-8 space-y-8">
            {navGroups.map((group, groupIndex) => (
              <Stagger key={group.label} delay={100 + groupIndex * 50}>
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A968D]">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between px-3 py-2.5 text-sm transition duration-150 ease-out",
                            item.active
                              ? "rounded-md bg-white text-[#1F1F1B] shadow-sm"
                              : "text-[#706C63] hover:bg-white/70 hover:text-[#1F1F1B]",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </span>
                          {item.active ? <ChevronRight className="h-4 w-4 text-[#9A968D]" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Stagger>
            ))}
          </nav>

          <Stagger delay={250} className="mt-10">
            <div className="border-t border-[#E7E1D8] pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A968D]">today</p>
              <div className="mt-3 space-y-3 text-sm text-[#67645C]">
                <div>
                  <p className="font-medium text-[#24231F]">Headline-grade risk</p>
                  <p>{headlineRiskCount || 0} agencies need comms prep</p>
                </div>
                <div>
                  <p className="font-medium text-[#24231F]">Average compliance</p>
                  <p>{avgCompliance}% across tracked programs</p>
                </div>
              </div>
            </div>
          </Stagger>
        </aside>

        <div className="relative px-6 py-6 sm:px-8 lg:px-10 xl:px-12 xl:py-10">
          <div className="mx-auto max-w-[1360px] space-y-6">
            <Stagger delay={0}>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8E8A81]">
                    adoption · risk · compliance
                  </p>
                  <h1 className="mt-2 max-w-4xl text-[clamp(2.2rem,4.6vw,4.8rem)] leading-[0.94] font-semibold tracking-[-0.05em] text-[#1F1F1B]">
                    Which federal agencies are using AI,
                    <span className="block text-[#0E7490]">and which deployments could become the story.</span>
                  </h1>
                </div>
                <div className="hidden xl:block text-right">
                  <p className="text-sm text-[#7A776F]">Updated from public reporting, procurement notes, and policy memos</p>
                </div>
              </div>
            </Stagger>

            <Stagger delay={50}>
              <p className="max-w-3xl text-base leading-7 text-[#66635B]">
                A warmer, editorial dashboard for reading federal AI adoption through two lenses at once:
                operational spread and reputational exposure. The useful question isn’t only where models are live.
                It’s where governance language is lagging behind deployment reality.
              </p>
            </Stagger>

            <Stagger delay={100}>
              {view === "loading" ? (
                <LoadingState />
              ) : view === "error" ? (
                <Surface className="rounded-md border border-[#E8D4CF] p-10">
                  <div className="flex max-w-3xl items-start gap-4">
                    <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-md bg-[#F5E7E4] text-[#8B3A2E]">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B3A2E]">feed interruption</p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#2A211F]">
                        The intake feed failed. The right move is to say so plainly.
                      </h2>
                      <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B5A56]">
                        Procurement notes didn’t sync, and the tracker is intentionally refusing to hallucinate a calm dashboard.
                        Hold the last reviewed posture, surface the gap, and refresh from the last good snapshot.
                      </p>
                      <button
                        type="button"
                        onClick={() => setView("happy")}
                        className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#1F1F1B] px-4 py-2.5 text-sm font-medium text-white transition duration-150 ease-out hover:bg-[#2A2925]"
                      >
                        restore last good snapshot
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Surface>
              ) : view === "empty" ? (
                <Surface className="rounded-md border border-[#E7E1D8] p-12">
                  <div className="max-w-2xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8A81]">empty state</p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#24231F]">
                      No agencies are being tracked yet.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[#66635B]">
                      That should feel intentional, not broken. Seed the tracker with the first deployment memo,
                      then score it by citizen harm potential, operational reach, and headline attractiveness.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setView("happy")}
                        className="rounded-md bg-[#0E7490] px-4 py-2.5 text-sm font-medium text-white transition duration-150 ease-out hover:bg-[#0C647C]"
                      >
                        load sample agencies
                      </button>
                      <div className="rounded-md border border-[#E7E1D8] bg-[#F7F5F1] px-4 py-2.5 text-sm text-[#706C63]">
                        good empty states teach the product model, not just the lack of data
                      </div>
                    </div>
                  </div>
                </Surface>
              ) : (
                <>
                  <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                    <Surface className="rounded-md border border-[#E7E1D8] p-8 md:p-10">
                      <div className="flex items-start justify-between gap-6">
                        <div className="max-w-xl">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8A81]">federal footprint</p>
                          <h2 className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-[#1F1F1B] sm:text-6xl">
                            {totalDeployments}
                          </h2>
                          <p className="mt-3 text-lg font-medium text-[#2E2D28]">live AI deployments across 22 agencies</p>
                          <p className="mt-5 max-w-lg text-base leading-7 text-[#67645C]">
                            Deployment count is compounding faster than audit maturity.
                            The imbalance is manageable now, which is exactly why it’s worth watching now.
                          </p>
                        </div>
                        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-md bg-[#E6F2F4] text-[#0E7490]">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </div>
                    </Surface>

                    <div className="grid gap-6">
                      <Surface className="rounded-md border border-[#E7E1D8] p-8">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8A81]">headline-grade risk</p>
                            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#1F1F1B]">{headlineRiskCount}</p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F4EEDF] text-[#8A6A2F]">
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-[#66635B]">
                          Programs worth executive review before they need legal cleanup.
                        </p>
                      </Surface>

                      <Surface className="rounded-md border border-[#E7E1D8] p-8">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8A81]">average compliance</p>
                            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#1F1F1B]">{avgCompliance}%</p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E8F1EE] text-[#2E6B59]">
                            <Scale className="h-5 w-5" />
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-[#66635B]">
                          Better than the narrative around government AI would suggest, still uneven by office.
                        </p>
                      </Surface>
                    </div>
                  </div>

                  <Surface className="rounded-md border border-[#E7E1D8] p-6 md:p-8">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8A81]">adoption curve</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#24231F]">
                          Deployments are rising faster than audit coverage.
                        </h2>
                      </div>
                      <div className="rounded-full bg-[#EEF5F6] px-3 py-1.5 text-sm text-[#0E7490]">
                        +725% since January
                      </div>
                    </div>

                    <div className="h-[320px] w-full">
                      {chartReady ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={adoptionTrend} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                            <defs>
                              <linearGradient id="deploymentsFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0E7490" stopOpacity={0.24} />
                                <stop offset="100%" stopColor="#0E7490" stopOpacity={0.02} />
                              </linearGradient>
                              <linearGradient id="auditedFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#B9C7CA" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#B9C7CA" stopOpacity={0.06} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#E8E2D9" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#7A776F", fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#7A776F", fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#FFFDF9",
                                border: "1px solid #E7E1D8",
                                borderRadius: 8,
                                boxShadow: "0 10px 30px rgba(31,31,27,0.08)",
                              }}
                              cursor={{ stroke: "#D9D2C8", strokeDasharray: "4 4" }}
                            />
                            <Area type="monotone" dataKey="audited" stroke="#9EB0B4" strokeWidth={2} fill="url(#auditedFill)" />
                            <Area type="monotone" dataKey="deployments" stroke="#0E7490" strokeWidth={2.5} fill="url(#deploymentsFill)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <SkeletonBlock className="h-full w-full rounded-md" />
                      )}
                    </div>
                  </Surface>

                  <div className="grid gap-6 xl:grid-cols-[1.65fr_0.9fr]">
                    <Surface className="overflow-hidden rounded-md border border-[#E7E1D8]">
                      <div className="flex items-center justify-between px-6 py-5 md:px-8">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8A81]">agency table</p>
                          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#24231F]">
                            Who is using what, and how exposed it feels.
                          </h2>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="border-y border-[#EEE8DF] bg-[#F7F5F1] text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#918D84]">
                              <th className="px-6 py-4 md:px-8">Agency</th>
                              <th className="px-4 py-4">Use case</th>
                              <th className="px-4 py-4">Model</th>
                              <th className="px-4 py-4">Compliance</th>
                              <th className="px-4 py-4">Risk</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleAgencies.map((agency) => (
                              <tr
                                key={agency.agency}
                                onMouseEnter={() => setActiveAgency(agency.agency)}
                                className="border-b border-[#F1ECE4] text-sm transition duration-150 ease-out hover:bg-[#FBFAF7]"
                              >
                                <td className="px-6 py-5 md:px-8">
                                  <button
                                    type="button"
                                    onClick={() => setActiveAgency(agency.agency)}
                                    className="text-left"
                                  >
                                    <div className="font-medium text-[#23221E]">{agency.agency}</div>
                                    <div className="mt-1 text-[#7A776F]">{agency.office}</div>
                                  </button>
                                </td>
                                <td className="px-4 py-5 text-[#66635B]">
                                  <div className="max-w-[340px] leading-6">{agency.useCase}</div>
                                </td>
                                <td className="px-4 py-5 text-[#4D4A43]">{agency.model}</td>
                                <td className="px-4 py-5">
                                  <span className="font-medium text-[#23221E]">{agency.compliance}%</span>
                                </td>
                                <td className="px-4 py-5">
                                  <Badge risk={agency.risk} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Surface>

                    <div className="space-y-6">
                      <Surface className="rounded-md border border-[#E7E1D8] p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8A81]">risk summary</p>
                            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#24231F]">
                              {currentAgency?.agency ?? "No agency selected"}
                            </h3>
                          </div>
                          <Badge risk={currentAgency?.risk ?? "Low"} />
                        </div>

                        {currentAgency ? (
                          <>
                            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#EEE8DF] pt-5 text-sm">
                              <div>
                                <p className="text-[#918D84]">Stage</p>
                                <p className="mt-1 font-medium text-[#23221E]">{currentAgency.stage}</p>
                              </div>
                              <div>
                                <p className="text-[#918D84]">Deployments</p>
                                <p className="mt-1 font-medium text-[#23221E]">{currentAgency.deployments}</p>
                              </div>
                            </div>

                            <div className="mt-5 rounded-md bg-[#F7F5F1] p-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#918D84]">NYT investigation angle</p>
                              <p className="mt-3 text-sm leading-6 text-[#5E5A52]">{currentAgency.nytFlag}</p>
                            </div>

                            <div className="mt-5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[#7A776F]">Compliance score</span>
                                <span className="font-medium text-[#23221E]">{currentAgency.compliance}%</span>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E6E2DA]">
                                <div
                                  className="h-full rounded-full bg-[#0E7490] transition-[width] duration-300 ease-out"
                                  style={{ width: `${currentAgency.compliance}%` }}
                                />
                              </div>
                            </div>
                          </>
                        ) : null}
                      </Surface>

                      <Surface className="rounded-md border border-[#E7E1D8] p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8A81]">risk feed</p>
                            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#24231F]">What breaks containment</h3>
                          </div>
                          <Sparkles className="h-4 w-4 text-[#0E7490]" />
                        </div>
                        <div className="mt-5 space-y-4">
                          {riskFeed.map((item) => (
                            <div key={item.title} className="border-t border-[#F0EAE1] pt-4 first:border-t-0 first:pt-0">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium text-[#23221E]">{item.title}</p>
                                <Badge risk={item.tone as "High" | "Watch"} />
                              </div>
                              <p className="mt-2 text-sm leading-6 text-[#66635B]">{item.note}</p>
                            </div>
                          ))}
                        </div>
                      </Surface>

                      <Surface className="rounded-md border border-[#E7E1D8] p-6">
                        <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
                          <div className="h-[140px]">
                            {chartReady ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={categoryMix} dataKey="value" innerRadius={34} outerRadius={54} paddingAngle={3}>
                                    {categoryMix.map((slice) => (
                                      <Cell key={slice.name} fill={slice.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <SkeletonBlock className="h-full w-full rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8A81]">deployment mix</p>
                            <div className="mt-4 space-y-2.5">
                              {categoryMix.map((slice) => (
                                <div key={slice.name} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-3 text-[#5D5A53]">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                                    {slice.name}
                                  </div>
                                  <span className="font-medium text-[#23221E]">{slice.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Surface>

                      <div className="grid gap-4">
                        {oversightCards.map((card) => {
                          const Icon = card.icon;
                          return (
                            <Surface key={card.label} className="rounded-md border border-[#E7E1D8] p-5">
                              <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#EEF5F6] text-[#0E7490]">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="flex items-baseline gap-3">
                                    <p className="text-sm font-medium text-[#23221E]">{card.label}</p>
                                    <span className="text-sm text-[#8E8A81]">{card.value}</span>
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-[#66635B]">{card.detail}</p>
                                </div>
                              </div>
                            </Surface>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Stagger>
          </div>

          <Stagger delay={150} className="fixed bottom-5 right-5 z-20">
            <div className="rounded-md border border-[#E7E1D8] bg-white/88 p-1 shadow-[0_8px_30px_rgba(31,31,27,0.08)] backdrop-blur-sm">
              <div className="flex items-center gap-1">
                {(["happy", "loading", "empty", "error"] as ViewState[]).map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setView(state)}
                    className={cn(
                      "rounded-[6px] px-3 py-2 text-xs font-medium capitalize transition duration-150 ease-out",
                      view === state
                        ? "bg-[#1F1F1B] text-white"
                        : "text-[#66635B] hover:bg-[#F4F2ED] hover:text-[#1F1F1B]",
                    )}
                  >
                    {state === "happy" ? "happy path" : state}
                  </button>
                ))}
              </div>
            </div>
          </Stagger>
        </div>
      </div>
    </main>
  );
}
