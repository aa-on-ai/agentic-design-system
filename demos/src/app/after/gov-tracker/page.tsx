"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Flame,
  Gavel,
  Landmark,
  LifeBuoy,
  Radar,
  RefreshCcw,
  ShieldAlert,
  Siren,
  Sparkles,
  Telescope,
  Waypoints,
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

type ViewMode = "loaded" | "partial" | "empty" | "error" | "loading";

type Program = {
  agency: string;
  bureau: string;
  model: string;
  use: string;
  exposure: "quiet" | "warm" | "hot";
  pressure: number;
  operatorCount: number;
  phase: string;
  flag: string;
  note: string;
};

const programData: Program[] = [
  {
    agency: "Department of Defense",
    bureau: "Joint logistics command",
    model: "o1 + GPT-4.1",
    use: "supply chain simulations, procurement triage, multilingual brief synthesis",
    exposure: "hot",
    pressure: 92,
    operatorCount: 1840,
    phase: "scaled pilot",
    flag: "target-adjacent language",
    note: "One deck frames model output as 'priority shaping' rather than advisory support.",
  },
  {
    agency: "Internal Revenue Service",
    bureau: "Taxpayer services",
    model: "GPT-4.1",
    use: "appeal-letter drafting, auditor memo cleanup, call-center assistance",
    exposure: "warm",
    pressure: 76,
    operatorCount: 620,
    phase: "production",
    flag: "cold denial tone",
    note: "Drafts are getting more absolute and less humane than the legacy templates.",
  },
  {
    agency: "Social Security Administration",
    bureau: "Disability intake",
    model: "GPT-4o mini",
    use: "case summarization, claimant timeline cleanup, worker copilot",
    exposure: "hot",
    pressure: 89,
    operatorCount: 290,
    phase: "pilot",
    flag: "fairness drift",
    note: "Pilot owners want to expand from summarization into recommendation support.",
  },
  {
    agency: "Centers for Disease Control",
    bureau: "Emergency comms",
    model: "GPT-4o",
    use: "outbreak brief drafting, public guidance synthesis, grant triage",
    exposure: "warm",
    pressure: 71,
    operatorCount: 410,
    phase: "production",
    flag: "crisis provenance",
    note: "During a health event, reporters will ask who actually wrote the first draft.",
  },
  {
    agency: "Veterans Affairs",
    bureau: "Benefits navigation",
    model: "GPT-4o mini",
    use: "intake summaries, care routing assist, portal guidance drafts",
    exposure: "quiet",
    pressure: 43,
    operatorCount: 930,
    phase: "expanded trial",
    flag: "sensitive but governable",
    note: "Low drama if humans stay visible and denial language stays traceable.",
  },
  {
    agency: "Department of Homeland Security",
    bureau: "Incident analysis",
    model: "o1 + GPT-4o",
    use: "triage summaries, translation, training simulation, incident prep",
    exposure: "hot",
    pressure: 95,
    operatorCount: 770,
    phase: "controlled rollout",
    flag: "surveillance adjacency",
    note: "Anything that smells like watchlists or border decisions becomes a story instantly.",
  },
];

const deploymentCurve = [
  { month: "Jan", deployments: 8, agencies: 4 },
  { month: "Feb", deployments: 11, agencies: 5 },
  { month: "Mar", deployments: 17, agencies: 7 },
  { month: "Apr", deployments: 19, agencies: 8 },
  { month: "May", deployments: 25, agencies: 10 },
  { month: "Jun", deployments: 31, agencies: 12 },
  { month: "Jul", deployments: 36, agencies: 13 },
  { month: "Aug", deployments: 42, agencies: 15 },
  { month: "Sep", deployments: 49, agencies: 17 },
  { month: "Oct", deployments: 53, agencies: 18 },
  { month: "Nov", deployments: 58, agencies: 20 },
  { month: "Dec", deployments: 66, agencies: 22 },
];

const missionMix = [
  { name: "Operations", value: 24, fill: "#1d4ed8" },
  { name: "Citizen service", value: 19, fill: "#d97706" },
  { name: "Research", value: 17, fill: "#0f766e" },
  { name: "Compliance", value: 14, fill: "#7c3aed" },
  { name: "Security", value: 26, fill: "#b91c1c" },
];

const pressureBuckets = [
  { label: "Quiet", count: 5, fill: "#4d7c0f" },
  { label: "Watch", count: 9, fill: "#d97706" },
  { label: "Front page", count: 8, fill: "#b91c1c" },
];

const radarFeed = [
  {
    title: "DoD memo language drift",
    why: "phrases like 'priority shaping' are one subpoena away from a bad week",
    severity: "front page",
    stamp: "09:18",
  },
  {
    title: "SSA expansion request",
    why: "summarization is drifting toward recommendation assistance",
    severity: "front page",
    stamp: "08:42",
  },
  {
    title: "IRS appeal empathy regression",
    why: "taxpayers will experience the colder tone before leadership sees the dashboard",
    severity: "watch",
    stamp: "07:55",
  },
  {
    title: "CDC provenance gap",
    why: "the first draft author is getting harder to explain crisply",
    severity: "watch",
    stamp: "07:10",
  },
];

const oversightDeck = [
  {
    label: "FOIA-sensitive systems",
    value: "14",
    note: "Prompt logs, eval notes, and exception memos are likely discoverable.",
    icon: FileText,
  },
  {
    label: "Policy exceptions",
    value: "5",
    note: "Mission urgency is being used to skip model-card and red-team signoff.",
    icon: Gavel,
  },
  {
    label: "Human-accountability gaps",
    value: "3",
    note: "Three programs still describe a reviewer, not a decider, in vague language.",
    icon: ShieldAlert,
  },
];

const states: ViewMode[] = ["loaded", "partial", "empty", "error", "loading"];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function exposureTone(exposure: Program["exposure"]) {
  switch (exposure) {
    case "hot":
      return "bg-[#9f1239] text-rose-50 ring-1 ring-inset ring-rose-200/40";
    case "warm":
      return "bg-[#b45309] text-amber-50 ring-1 ring-inset ring-amber-100/40";
    default:
      return "bg-[#3f6212] text-lime-50 ring-1 ring-inset ring-lime-100/35";
  }
}

function severityTone(level: string) {
  return level === "front page"
    ? "bg-[#7f1d1d] text-rose-50"
    : "bg-[#78350f] text-amber-50";
}

function MiniSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-full bg-stone-300/70", className)} />;
}

function LoadingView() {
  return (
    <main className="min-h-screen bg-[#efe8db] text-stone-900">
      <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[32px] border border-stone-300 bg-[#f8f2e8] p-6 shadow-[0_24px_80px_-40px_rgba(120,53,15,0.25)] lg:p-8">
            <MiniSkeleton className="h-7 w-44" />
            <div className="mt-5 grid gap-3">
              <MiniSkeleton className="h-14 w-full rounded-[22px]" />
              <MiniSkeleton className="h-14 w-[85%] rounded-[22px]" />
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-[24px] border border-stone-200 bg-white/70 p-4">
                  <MiniSkeleton className="h-4 w-24" />
                  <MiniSkeleton className="mt-4 h-10 w-20 rounded-2xl" />
                  <MiniSkeleton className="mt-5 h-3 w-32" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-stone-300 bg-[#fcf8f1] p-6">
            <MiniSkeleton className="h-6 w-40" />
            <div className="mt-5 space-y-3">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="rounded-[22px] border border-stone-200 bg-white/80 p-4">
                  <MiniSkeleton className="h-4 w-32" />
                  <MiniSkeleton className="mt-3 h-3 w-full" />
                  <MiniSkeleton className="mt-2 h-3 w-[80%]" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ChartShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full min-h-[190px] w-full min-w-0 items-center justify-center", className)}>
      {children}
    </div>
  );
}

export default function GovTrackerPage() {
  const [mode, setMode] = useState<ViewMode>("loaded");
  const [activeAgency, setActiveAgency] = useState(programData[0].agency);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartsReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visiblePrograms = useMemo(() => {
    if (mode === "empty") return [];
    if (mode === "partial") return programData.slice(0, 4);
    return programData;
  }, [mode]);

  const activeProgram =
    visiblePrograms.find((item) => item.agency === activeAgency) ?? visiblePrograms[0] ?? null;

  if (mode === "loading") {
    return <LoadingView />;
  }

  const topSignals = [
    {
      label: "agencies tracked",
      value: visiblePrograms.length ? "22" : "0",
      sublabel: visiblePrograms.length ? "+4 this quarter" : "waiting on intake",
      icon: Landmark,
      accent: "text-[#8b5e34]",
    },
    {
      label: "live deployments",
      value: visiblePrograms.length ? (mode === "partial" ? "41" : "66") : "0",
      sublabel: visiblePrograms.length ? "adoption still compounding" : "nothing in production yet",
      icon: Bot,
      accent: "text-[#9a3412]",
    },
    {
      label: "headline-grade risks",
      value: visiblePrograms.length ? (mode === "partial" ? "4" : "8") : "0",
      sublabel: visiblePrograms.length ? "worth comms prep now" : "no active concerns logged",
      icon: Siren,
      accent: "text-[#9f1239]",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#efe8db] text-stone-900 selection:bg-amber-300/70">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.16),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(185,28,28,0.1),_transparent_24%),linear-gradient(to_bottom,_rgba(255,255,255,0.55),_rgba(239,232,219,0.8)_22%,_rgba(239,232,219,1))]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-stone-300/50 lg:block" />

      <div className="relative mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <section className="rounded-[34px] border border-stone-300 bg-[#f8f2e8]/95 shadow-[0_28px_90px_-50px_rgba(120,53,15,0.35)] backdrop-blur supports-[backdrop-filter]:bg-[#f8f2e8]/92">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border-b border-stone-300/90 p-6 lg:border-r lg:border-b-0 lg:p-8 xl:p-10">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-3 py-1.5">
                  <Radar className="h-3.5 w-3.5 text-[#8b5e34]" />
                  washington monitor
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1.5 text-amber-900">
                  <Sparkles className="h-3.5 w-3.5" />
                  sam altman brief
                </span>
              </div>

              <div className="mt-6 max-w-3xl">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
                  if it lands on the front page, it starts here
                </p>
                <h1 className="mt-3 max-w-4xl text-[clamp(2.4rem,5vw,5rem)] leading-[0.96] font-semibold tracking-[-0.05em] text-stone-950">
                  Government use of OpenAI,
                  <span className="block text-[#8b5e34]">with the reputational weather layered on top.</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-stone-700 lg:text-lg">
                  A warmer, sharper read on which agencies are deploying models, what they are using them for,
                  and which programs could turn into a New York Times headline before anyone in legal opens the deck.
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {topSignals.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className="group min-h-32 rounded-[24px] border border-stone-300 bg-white/80 p-4 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-stone-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e34] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f2e8] motion-reduce:transition-none"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{item.label}</p>
                          <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-stone-950">{item.value}</p>
                        </div>
                        <div
                          className={cn(
                            "rounded-[18px] bg-stone-100 p-3 transition duration-200 ease-out group-hover:scale-[1.04] group-hover:bg-stone-200 motion-reduce:transition-none",
                            item.accent,
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-5 text-sm leading-6 text-stone-600">{item.sublabel}</p>
                      <div className="mt-3 flex items-center gap-2 text-sm font-medium text-stone-700">
                        signal {index + 1}
                        <ChevronRight className="h-4 w-4 transition duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="flex flex-col justify-between p-6 lg:p-8 xl:p-10">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-stone-500">scenario states</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-stone-950">QA switchboard</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    live mock data
                  </div>
                </div>
                <p className="mt-3 max-w-md text-sm leading-6 text-stone-600">
                  This page handles loaded, partial, empty, error, and loading views without collapsing into a blank dashboard.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {states.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setMode(state)}
                    className={cn(
                      "min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-medium capitalize transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e34] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f2e8] motion-reduce:transition-none",
                      mode === state
                        ? "border-stone-950 bg-stone-950 text-stone-50"
                        : "border-stone-300 bg-white/70 text-stone-700 hover:-translate-y-0.5 hover:border-stone-400 hover:bg-white",
                    )}
                  >
                    {state}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-[26px] border border-stone-300 bg-[#fcf8f1] p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-[18px] bg-[#8b5e34] p-3 text-amber-50">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-950">Executive posture</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      Three programs need narrative cleanup before they need legal cleanup. The danger is not just model use. It is unclear language around accountability.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {mode === "error" ? (
          <section className="mt-4 rounded-[32px] border border-rose-300 bg-[#fff5f5] p-6 shadow-[0_22px_80px_-50px_rgba(159,18,57,0.5)] lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-[20px] bg-rose-100 p-3 text-rose-700">
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-rose-700">data interruption</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-rose-950">The intake feed fell over, not the whole operation.</h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-rose-900/80">
                    Procurement notes did not sync. Keep the last reviewed risk posture, flag the gap openly, and let the human refresh rather than pretending the screen is current.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode("loaded")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-rose-900 px-5 py-3 text-sm font-medium text-rose-50 transition duration-200 ease-out hover:bg-rose-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-800 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff5f5]"
              >
                <RefreshCcw className="h-4 w-4" />
                retry with last good snapshot
              </button>
            </div>
          </section>
        ) : null}

        {mode === "empty" ? (
          <section className="mt-4 rounded-[32px] border border-stone-300 bg-[#fcf8f1] p-8 text-center shadow-[0_22px_80px_-50px_rgba(120,53,15,0.28)] lg:p-12">
            <div className="mx-auto max-w-2xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-stone-300 bg-white text-[#8b5e34]">
                <Telescope className="h-9 w-9" />
              </div>
              <p className="mt-6 text-sm uppercase tracking-[0.24em] text-stone-500">quiet morning</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-stone-950">No agencies are actively tracked yet.</h2>
              <p className="mt-4 text-base leading-7 text-stone-600">
                That should feel calm, not broken. Start by importing the first procurement packet, then rank it by operational reach, citizen harm potential, and headline attractiveness.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setMode("loaded")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition duration-200 ease-out hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcf8f1]"
                >
                  seed sample programs
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-sm text-stone-600">
                  good empty states teach the model of the product, not just the absence of data
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {mode !== "empty" && mode !== "error" ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="overflow-hidden rounded-[32px] border border-stone-300 bg-[#f8f2e8] shadow-[0_22px_80px_-54px_rgba(68,64,60,0.45)]">
              <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="border-b border-stone-300 p-6 lg:border-r lg:border-b-0 lg:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-stone-500">front-page radar</p>
                      <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-stone-950">What breaks containment</h2>
                    </div>
                    <div className="rounded-full border border-stone-300 bg-white/80 px-3 py-1.5 text-sm text-stone-600">
                      updated 9m ago
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {radarFeed.slice(0, mode === "partial" ? 2 : radarFeed.length).map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        className="group flex min-h-28 w-full items-start justify-between gap-4 rounded-[22px] border border-stone-300 bg-white/75 p-4 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-stone-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e34] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f2e8] motion-reduce:transition-none"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]", severityTone(item.severity))}>
                              {item.severity}
                            </span>
                            <span className="font-mono text-xs text-stone-500">{item.stamp}</span>
                          </div>
                          <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-stone-950">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-stone-600">{item.why}</p>
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-stone-400 transition duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-stone-700 motion-reduce:transition-none" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 lg:p-8">
                  <div className="max-w-xl">
                    <p className="text-sm uppercase tracking-[0.18em] text-stone-500">reputational climate</p>
                    <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-stone-950">Adoption is rising faster than explanation quality.</h2>
                    <p className="mt-3 text-sm leading-6 text-stone-600">
                      The interesting part is not raw volume. It is how quickly sensitive use cases are showing up before language, governance, and accountability patterns have settled.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-[24px] border border-stone-300 bg-white/85 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-700">Deployment curve</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">agencies + live systems</p>
                        </div>
                        <Waypoints className="h-4 w-4 text-[#8b5e34]" />
                      </div>
                      <div className="h-[250px]">
                        <ChartShell>
                          {chartsReady ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={deploymentCurve} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="deploymentsFillWarm" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5e34" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#8b5e34" stopOpacity={0.03} />
                                  </linearGradient>
                                  <linearGradient id="agencyFillWarm" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#b91c1c" stopOpacity={0.22} />
                                    <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.01} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#d6d3d1" strokeDasharray="3 3" />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} />
                                <Tooltip
                                  cursor={{ stroke: "#a8a29e", strokeDasharray: "4 4" }}
                                  contentStyle={{
                                    backgroundColor: "#fffaf1",
                                    border: "1px solid #d6d3d1",
                                    borderRadius: 18,
                                    boxShadow: "0 18px 40px rgba(120,53,15,0.12)",
                                  }}
                                />
                                <Area type="monotone" dataKey="agencies" stroke="#b91c1c" strokeWidth={2} fill="url(#agencyFillWarm)" />
                                <Area type="monotone" dataKey="deployments" stroke="#8b5e34" strokeWidth={3} fill="url(#deploymentsFillWarm)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <MiniSkeleton className="h-full w-full rounded-[18px]" />
                          )}
                        </ChartShell>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="rounded-[24px] border border-stone-300 bg-[#fcf8f1] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">NYT risk score</p>
                        <p className="mt-3 text-6xl font-semibold tracking-[-0.08em] text-[#9f1239]">78</p>
                        <p className="mt-3 text-sm leading-6 text-stone-600">
                          High enough that comms should see the same dashboard product and policy do.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-stone-300 bg-[#fcf8f1] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">best next move</p>
                        <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-stone-950">
                          tighten the language around human decision-makers before expanding scope.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-stone-300 bg-[#fcf8f1] p-6 shadow-[0_22px_80px_-54px_rgba(68,64,60,0.4)] lg:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-stone-500">agency tape</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-stone-950">Who is using what, and how spicy it is</h2>
                </div>
                <div className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-600">
                  touch targets stay large on mobile
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
                <div className="grid gap-3">
                  {visiblePrograms.map((program) => (
                    <button
                      key={program.agency}
                      type="button"
                      onClick={() => setActiveAgency(program.agency)}
                      className={cn(
                        "group min-h-24 rounded-[24px] border p-4 text-left transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e34] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcf8f1] motion-reduce:transition-none",
                        activeProgram?.agency === program.agency
                          ? "border-stone-900 bg-stone-900 text-stone-50"
                          : "border-stone-300 bg-white hover:-translate-y-0.5 hover:border-stone-400",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold tracking-[-0.02em]">{program.agency}</p>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]",
                                activeProgram?.agency === program.agency ? "bg-white/15 text-stone-50" : exposureTone(program.exposure),
                              )}
                            >
                              {program.exposure}
                            </span>
                          </div>
                          <p className={cn("mt-2 text-sm leading-6", activeProgram?.agency === program.agency ? "text-stone-300" : "text-stone-600")}>
                            {program.bureau}
                          </p>
                        </div>
                        <div className={cn("font-mono text-sm", activeProgram?.agency === program.agency ? "text-stone-200" : "text-stone-500")}>
                          {program.pressure}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-[28px] border border-stone-300 bg-white p-5 lg:p-6">
                  {activeProgram ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">active file</p>
                          <h3 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-stone-950">{activeProgram.agency}</h3>
                        </div>
                        <span className={cn("rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em]", exposureTone(activeProgram.exposure))}>
                          {activeProgram.flag}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-[20px] bg-stone-100 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">model stack</p>
                          <p className="mt-3 text-lg font-semibold text-stone-950">{activeProgram.model}</p>
                        </div>
                        <div className="rounded-[20px] bg-stone-100 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">operators</p>
                          <p className="mt-3 text-lg font-semibold text-stone-950">{activeProgram.operatorCount.toLocaleString()}</p>
                        </div>
                        <div className="rounded-[20px] bg-stone-100 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">phase</p>
                          <p className="mt-3 text-lg font-semibold capitalize text-stone-950">{activeProgram.phase}</p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">use case</p>
                          <p className="mt-3 text-base leading-7 text-stone-700">{activeProgram.use}</p>

                          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-stone-500">why a reporter cares</p>
                          <p className="mt-3 rounded-[22px] border border-amber-200 bg-amber-50 p-4 text-base leading-7 text-amber-950">
                            {activeProgram.note}
                          </p>
                        </div>

                        <div className="rounded-[24px] border border-stone-300 bg-[#fcf8f1] p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">pressure gauge</p>
                              <p className="mt-2 text-5xl font-semibold tracking-[-0.07em] text-stone-950">{activeProgram.pressure}</p>
                            </div>
                            <BriefcaseBusiness className="h-5 w-5 text-[#8b5e34]" />
                          </div>
                          <div className="mt-5 h-3 overflow-hidden rounded-full bg-stone-200">
                            <div
                              className={cn(
                                "h-full rounded-full transition-[width] duration-500 ease-in-out motion-reduce:transition-none",
                                activeProgram.exposure === "hot"
                                  ? "bg-[#9f1239]"
                                  : activeProgram.exposure === "warm"
                                    ? "bg-[#b45309]"
                                    : "bg-[#4d7c0f]",
                              )}
                              style={{ width: `${activeProgram.pressure}%` }}
                            />
                          </div>
                          <p className="mt-4 text-sm leading-6 text-stone-600">
                            Higher means broader public sensitivity, shakier language, and less forgiveness if something weird ships.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {mode !== "empty" && mode !== "error" ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr_0.9fr]">
            <section className="rounded-[32px] border border-stone-300 bg-[#fcf8f1] p-6 shadow-[0_20px_70px_-54px_rgba(68,64,60,0.4)] lg:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-stone-500">mission mix</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-stone-950">Where the models are landing</h2>
                </div>
                <Building2 className="h-5 w-5 text-[#8b5e34]" />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-[190px_1fr]">
                <div className="h-[190px]">
                  <ChartShell>
                    {chartsReady ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={missionMix} dataKey="value" innerRadius={42} outerRadius={76} paddingAngle={3}>
                            {missionMix.map((item) => (
                              <Cell key={item.name} fill={item.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fffaf1",
                              border: "1px solid #d6d3d1",
                              borderRadius: 18,
                              boxShadow: "0 18px 40px rgba(120,53,15,0.12)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <MiniSkeleton className="h-full w-full rounded-full" />
                    )}
                  </ChartShell>
                </div>
                <div className="space-y-3">
                  {missionMix.map((item) => (
                    <div key={item.name} className="flex min-h-12 items-center justify-between rounded-[18px] border border-stone-300 bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-sm text-stone-700">{item.name}</span>
                      </div>
                      <span className="font-mono text-sm text-stone-950">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-stone-300 bg-[#f8f2e8] p-6 shadow-[0_20px_70px_-54px_rgba(68,64,60,0.4)] lg:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-stone-500">program count by heat</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-stone-950">How many programs feel politically combustible</h2>
                </div>
                <AlertTriangle className="h-5 w-5 text-[#9f1239]" />
              </div>
              <div className="mt-6 h-[240px] rounded-[24px] border border-stone-300 bg-white p-4">
                <ChartShell>
                  {chartsReady ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pressureBuckets} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#d6d3d1" strokeDasharray="3 3" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#57534e", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fffaf1",
                            border: "1px solid #d6d3d1",
                            borderRadius: 18,
                            boxShadow: "0 18px 40px rgba(120,53,15,0.12)",
                          }}
                        />
                        <Bar dataKey="count" radius={[14, 14, 0, 0]}>
                          {pressureBuckets.map((item) => (
                            <Cell key={item.label} fill={item.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <MiniSkeleton className="h-full w-full rounded-[18px]" />
                  )}
                </ChartShell>
              </div>
            </section>

            <section className="rounded-[32px] border border-stone-300 bg-[#fcf8f1] p-6 shadow-[0_20px_70px_-54px_rgba(68,64,60,0.4)] lg:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-stone-500">oversight deck</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-stone-950">Signals to watch before the hearing</h2>
                </div>
                <FileText className="h-5 w-5 text-[#8b5e34]" />
              </div>

              <div className="mt-6 space-y-3">
                {oversightDeck.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[22px] border border-stone-300 bg-white p-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-[18px] bg-stone-100 p-3 text-[#8b5e34]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-stone-600">{item.label}</p>
                            <p className="font-mono text-sm text-stone-950">{item.value}</p>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-stone-700">{item.note}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
