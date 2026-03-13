"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileWarning,
  FolderKanban,
  Gavel,
  Landmark,
  LoaderCircle,
  Radar,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
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

type ViewState = "happy" | "loading" | "empty" | "error";
type RiskTone = "clear" | "watch" | "high";

type Agency = {
  id: string;
  agency: string;
  office: string;
  status: string;
  stage: string;
  risk: RiskTone;
  compliance: number;
  deployments: number;
  monthlySpend: string;
  lastUpdated: string;
  models: string[];
  surfaces: string[];
  useCases: string[];
  flags: string[];
  approvals: string[];
  note: string;
  pressRisk: string;
};

const navItems = ["Overview", "Agencies", "Usage", "Investigations"];

const agencies: Agency[] = [
  {
    id: "gsa",
    agency: "General Services Administration",
    office: "Technology Transformation Services",
    status: "Stable",
    stage: "Production",
    risk: "clear",
    compliance: 94,
    deployments: 14,
    monthlySpend: "$184,260",
    lastUpdated: "8 min ago",
    models: ["GPT-5.4", "gpt-5-mini"],
    surfaces: ["Responses API", "Batch API", "File search"],
    useCases: ["procurement draft cleanup", "vendor Q&A triage", "policy memo synthesis"],
    flags: ["FOIA discoverable logs", "vendor lock-in questions"],
    approvals: ["RBAC enabled", "reviewer sign-off required", "project-level usage tracking"],
    note: "Operationally quiet, which is usually the strongest signal that the controls are doing their job.",
    pressRisk: "If procurement language starts sounding like ranking or preference scoring, this stops being a software story.",
  },
  {
    id: "dhs",
    agency: "Department of Homeland Security",
    office: "Incident review and language services",
    status: "Needs escalation",
    stage: "Controlled rollout",
    risk: "high",
    compliance: 68,
    deployments: 11,
    monthlySpend: "$312,408",
    lastUpdated: "14 min ago",
    models: ["GPT-5.4", "o1"],
    surfaces: ["Realtime API", "Responses API", "Moderation"],
    useCases: ["border incident summaries", "translation assist", "training simulations"],
    flags: ["civil liberties review pending", "Hill-demo sensitive", "scope language drift"],
    approvals: ["prompt retention limited", "dedicated project workspace"],
    note: "The product boundary says summarize and translate. The internal language occasionally reaches for prioritize.",
    pressRisk: "Any ambiguity around watchlists, deportation workflows, or surveillance framing becomes the headline immediately.",
  },
  {
    id: "va",
    agency: "Department of Veterans Affairs",
    office: "Benefits navigation",
    status: "Monitor closely",
    stage: "Expanded pilot",
    risk: "watch",
    compliance: 91,
    deployments: 9,
    monthlySpend: "$96,114",
    lastUpdated: "22 min ago",
    models: ["gpt-5-mini"],
    surfaces: ["Responses API", "Evals", "Files"],
    useCases: ["claim intake summaries", "appeal packet prep", "portal guidance drafts"],
    flags: ["empathy drift in appeals", "audit export needs work"],
    approvals: ["reviewer attribution visible", "eval suite green", "no outbound automation"],
    note: "Strong mission fit. Fragile wording. The human reviewer has to remain visibly in charge.",
    pressRisk: "This is defensible if attribution stays explicit. It gets ugly fast if denials look machine-authored.",
  },
  {
    id: "irs",
    agency: "Internal Revenue Service",
    office: "Taxpayer services",
    status: "Needs escalation",
    stage: "Production",
    risk: "high",
    compliance: 79,
    deployments: 13,
    monthlySpend: "$228,092",
    lastUpdated: "31 min ago",
    models: ["GPT-5.4", "gpt-5-mini"],
    surfaces: ["Batch API", "Evals", "Stored completions"],
    useCases: ["appeal letter drafting", "call center copilot", "document classification"],
    flags: ["appeal empathy regression", "comms review recommended"],
    approvals: ["scale tier budget alerts", "project-level usage tracking"],
    note: "The model is efficient. The tone is colder. That sounds minor until someone reads the letter out loud.",
    pressRisk: "If machine-generated enforcement copy feels harsher than legacy templates, someone will publish the comparison.",
  },
  {
    id: "cdc",
    agency: "Centers for Disease Control and Prevention",
    office: "Emergency communications",
    status: "Monitor closely",
    stage: "Production",
    risk: "watch",
    compliance: 87,
    deployments: 7,
    monthlySpend: "$121,844",
    lastUpdated: "39 min ago",
    models: ["GPT-5.4", "gpt-5-mini"],
    surfaces: ["Responses API", "Files", "Prompt optimizer"],
    useCases: ["outbreak brief synthesis", "grant triage", "public guidance drafting"],
    flags: ["authorship labeling needs work"],
    approvals: ["version history retained", "policy review before publish"],
    note: "Operationally strong. Provenance still feels more implied than explicit.",
    pressRisk: "In a public health event, people care less about elegance than about who wrote the first draft.",
  },
  {
    id: "ssa",
    agency: "Social Security Administration",
    office: "Disability intake",
    status: "Paused for review",
    stage: "Pilot",
    risk: "high",
    compliance: 61,
    deployments: 6,
    monthlySpend: "$74,932",
    lastUpdated: "52 min ago",
    models: ["gpt-5-mini"],
    surfaces: ["Responses API", "Evals"],
    useCases: ["case summarization", "timeline cleanup", "caseworker copilot"],
    flags: ["decision-support adjacency", "GAO inquiry risk", "pause before expansion"],
    approvals: ["human review in product copy only"],
    note: "Most likely to quietly expand scope and describe that expansion as assistance.",
    pressRisk: "The fairness story starts the moment summaries begin shaping decisions instead of just shortening reading time.",
  },
];

const adoptionTrend = [
  { month: "Jan", deployments: 18, audited: 14 },
  { month: "Feb", deployments: 21, audited: 16 },
  { month: "Mar", deployments: 25, audited: 19 },
  { month: "Apr", deployments: 28, audited: 22 },
  { month: "May", deployments: 33, audited: 25 },
  { month: "Jun", deployments: 37, audited: 28 },
  { month: "Jul", deployments: 42, audited: 31 },
  { month: "Aug", deployments: 47, audited: 34 },
  { month: "Sep", deployments: 53, audited: 38 },
  { month: "Oct", deployments: 57, audited: 41 },
  { month: "Nov", deployments: 63, audited: 46 },
  { month: "Dec", deployments: 71, audited: 51 },
];

const deploymentMix = [
  { name: "Service delivery", value: 26, color: "#111827" },
  { name: "Operations", value: 24, color: "#4b5563" },
  { name: "Research", value: 17, color: "#6b7280" },
  { name: "Security", value: 19, color: "#9ca3af" },
  { name: "Compliance", value: 14, color: "#d1d5db" },
];

const investigationFeed = [
  {
    title: "DHS scope language drift",
    agency: "DHS",
    risk: "high" as RiskTone,
    note: "One operations memo replaced summarize with prioritize. That difference does not survive a congressional hearing.",
  },
  {
    title: "IRS tone regression",
    agency: "IRS",
    risk: "high" as RiskTone,
    note: "Appeal drafts are more absolute than the templates they were meant to accelerate.",
  },
  {
    title: "SSA expansion request",
    agency: "SSA",
    risk: "high" as RiskTone,
    note: "Pilot team requested recommendation support next quarter. The product description still says summarization only.",
  },
  {
    title: "CDC provenance gap",
    agency: "CDC",
    risk: "watch" as RiskTone,
    note: "Draft authorship is visible internally, but not yet legible enough for an external explanation.",
  },
];

const oversightNotes = [
  {
    label: "FOIA-sensitive projects",
    value: "12",
    detail: "Prompt traces, eval notes, and exception memos would all age poorly in a records request.",
    icon: FolderKanban,
  },
  {
    label: "Open policy exceptions",
    value: "5",
    detail: "Mission urgency is currently being used as a substitute for patient review.",
    icon: Gavel,
  },
  {
    label: "Executive prep required",
    value: "3",
    detail: "Not because the deployments are broken. Because the explanation is weaker than the deployment reality.",
    icon: FileWarning,
  },
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-[24px] border border-black/8 bg-white", className)}>{children}</section>;
}

function RiskBadge({ risk }: { risk: RiskTone }) {
  const label = risk === "clear" ? "Clear" : risk === "watch" ? "Watch" : "High";
  const styles = {
    clear: "border-[#d6ead8] bg-[#eff8f1] text-[#166534]",
    watch: "border-[#ead9b6] bg-[#f8f3e8] text-[#9a6700]",
    high: "border-[#f2c6c2] bg-[#fdf0ef] text-[#b42318]",
  }[risk];

  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", styles)}>{label}</span>;
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Building2;
}) {
  return (
    <div className="rounded-[20px] border border-black/8 bg-[#fafaf8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/42">{label}</p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-[#111827]">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-white text-black/60">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-black/56">{detail}</p>
    </div>
  );
}

function AgencyNavItem({ agency, active, onClick }: { agency: Agency; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-[18px] border px-3 py-3 text-left transition duration-150 ease-out",
        active
          ? "border-[#d9dde5] bg-[#f4f6f8]"
          : "border-transparent bg-transparent hover:border-black/8 hover:bg-[#fafaf8]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-[#111827]">{agency.agency}</p>
            <RiskBadge risk={agency.risk} />
          </div>
          <p className="mt-1 truncate text-xs text-black/48">{agency.office}</p>
        </div>
        <ChevronRight className={cn("mt-0.5 h-4 w-4 shrink-0 text-black/24 transition", active ? "translate-x-0.5" : "group-hover:translate-x-0.5")} />
      </div>
    </button>
  );
}

function StateOverlay({ view, setView }: { view: ViewState; setView: (view: ViewState) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[280px] rounded-2xl border border-white/12 bg-[#111827]/92 p-2 text-white shadow-[0_24px_60px_rgba(17,24,39,0.34)] backdrop-blur md:bottom-6 md:right-6">
      <div className="flex items-center justify-between px-2 pb-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">Demo state</p>
          <p className="mt-1 text-xs text-white/60">Debug overlay</p>
        </div>
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["happy", "loading", "empty", "error"] as ViewState[]).map((state) => (
          <button
            key={state}
            type="button"
            onClick={() => setView(state)}
            className={cn(
              "min-h-11 rounded-xl border px-3 text-sm font-medium capitalize transition",
              view === state
                ? "border-white/20 bg-white text-[#111827]"
                : "border-white/10 bg-white/5 text-white/72 hover:bg-white/10",
            )}
          >
            {state}
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="space-y-4">
      <Surface className="p-5 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-28 rounded-full bg-black/6" />
          <div className="h-10 w-2/3 rounded-2xl bg-black/8" />
          <div className="grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 rounded-[20px] bg-black/6" />
            ))}
          </div>
          <div className="h-[320px] rounded-[24px] bg-black/6" />
        </div>
      </Surface>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Surface className="h-[280px] animate-pulse bg-black/3">&nbsp;</Surface>
        <Surface className="h-[280px] animate-pulse bg-black/3">&nbsp;</Surface>
      </div>
    </div>
  );
}

export default function GovTrackerPage() {
  const [view, setView] = useState<ViewState>("happy");
  const [activeAgencyId, setActiveAgencyId] = useState(agencies[1]?.id ?? agencies[0].id);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartsReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visibleAgencies = useMemo(() => (view === "empty" ? [] : agencies), [view]);
  const activeAgency = visibleAgencies.find((agency) => agency.id === activeAgencyId) ?? visibleAgencies[0] ?? null;

  const totals = useMemo(() => {
    const tracked = visibleAgencies.length;
    const deployments = visibleAgencies.reduce((sum, agency) => sum + agency.deployments, 0);
    const avgCompliance = tracked
      ? Math.round(visibleAgencies.reduce((sum, agency) => sum + agency.compliance, 0) / tracked)
      : 0;
    const highRisk = visibleAgencies.filter((agency) => agency.risk === "high").length;

    return { tracked, deployments, avgCompliance, highRisk };
  }, [visibleAgencies]);

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#111827]">
      <style jsx global>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gov-tracker-enter {
          animation: pageEnter 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .gov-tracker-noise {
          background-image:
            radial-gradient(circle at 20% 20%, rgba(17, 24, 39, 0.02) 0, transparent 24%),
            radial-gradient(circle at 85% 0%, rgba(17, 24, 39, 0.02) 0, transparent 18%),
            linear-gradient(to bottom, rgba(255,255,255,0.72), rgba(255,255,255,0.92));
        }

        @media (prefers-reduced-motion: reduce) {
          .gov-tracker-enter {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="gov-tracker-enter overflow-hidden rounded-[32px] border border-black/8 bg-[#fcfcfa] shadow-[0_24px_80px_rgba(15,23,42,0.07)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-black/8 bg-[#fbfbf8] lg:border-b-0 lg:border-r lg:border-black/8">
            <div className="flex h-full flex-col p-4 sm:p-5">
              <div className="flex items-start gap-3 border-b border-black/8 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111827] text-white">
                  <Radar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">Government AI Tracker</p>
                  <p className="mt-1 text-xs leading-5 text-black/48">Federal deployments using OpenAI models and API surfaces.</p>
                </div>
              </div>

              <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                {navItems.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      "rounded-full px-3 py-2 text-sm whitespace-nowrap transition lg:justify-start lg:rounded-xl lg:px-3 lg:text-left",
                      index === 1 ? "bg-[#111827] text-white" : "text-black/56 hover:bg-black/[0.03] hover:text-[#111827]",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <MetricCard
                  label="Tracked agencies"
                  value={String(totals.tracked)}
                  detail="Civilian, security, health, and service programs in active review."
                  icon={Landmark}
                />
                <MetricCard
                  label="Live deployments"
                  value={String(totals.deployments)}
                  detail="Responses API, Batch API, Evals, Files, Realtime, and Moderation."
                  icon={Bot}
                />
                <MetricCard
                  label="Avg compliance"
                  value={`${totals.avgCompliance}%`}
                  detail="RBAC, eval coverage, prompt logging, and reviewer visibility."
                  icon={ShieldCheck}
                />
              </div>

              <div className="mt-6 min-h-0 flex-1">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Agency register</p>
                    <p className="mt-1 text-sm text-black/52">Sorted by reputational heat</p>
                  </div>
                  <span className="text-sm font-medium text-[#111827]">{totals.highRisk}</span>
                </div>
                <div className="space-y-1.5">
                  {visibleAgencies.map((agency) => (
                    <AgencyNavItem
                      key={agency.id}
                      agency={agency}
                      active={agency.id === activeAgency?.id}
                      onClick={() => setActiveAgencyId(agency.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="gov-tracker-noise min-w-0 p-4 sm:p-6 lg:p-8">
            {view === "loading" ? (
              <LoadingView />
            ) : view === "error" ? (
              <Surface className="p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] text-white">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="max-w-3xl">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Feed interruption</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                      Procurement sync failed, so the dashboard stopped pretending it knew the current state.
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-black/58">
                      Last-good data is still recoverable, but the live investigation feed is stale. Internal tools should say this plainly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setView("happy")}
                      className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#111827] px-4 text-sm font-medium text-white transition hover:-translate-y-0.5"
                    >
                      restore last good snapshot
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Surface>
            ) : view === "empty" ? (
              <Surface className="p-6 sm:p-8 lg:p-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">No active records</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">No agencies are in the tracker yet.</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-black/58">
                  Add a program with a real office, a real model, and a real control story. The page should look empty on purpose, not unfinished.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setView("happy")}
                    className="inline-flex min-h-11 items-center rounded-full bg-[#111827] px-4 text-sm font-medium text-white transition hover:-translate-y-0.5"
                  >
                    load tracked agencies
                  </button>
                  <div className="inline-flex min-h-11 items-center rounded-full border border-black/8 bg-white px-4 text-sm text-black/56">
                    Good empty states explain the system, not just the missing rows.
                  </div>
                </div>
              </Surface>
            ) : activeAgency ? (
              <div className="space-y-4">
                <Surface className="p-5 sm:p-6 lg:p-7">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-4xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-[#111827]">OpenAI internal</p>
                        <span className="inline-flex rounded-full border border-black/8 bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium text-black/50">
                          Sam Altman tracker
                        </span>
                      </div>
                      <h1 className="mt-3 text-[clamp(1.9rem,3vw,3rem)] font-semibold tracking-[-0.05em] text-[#111827]">
                        Federal deployment status and public-risk posture.
                      </h1>
                      <p className="mt-3 max-w-3xl text-base leading-7 text-black/58">
                        Which agencies are deploying OpenAI models, what they are using them for, and where press or compliance risk is accumulating.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
                      <div className="rounded-[20px] border border-black/8 bg-[#fafaf8] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">High-risk programs</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">{totals.highRisk}</p>
                        <p className="mt-2 text-sm text-black/56">Programs likely to become a hearing before they become a case study.</p>
                      </div>
                      <div className="rounded-[20px] border border-black/8 bg-[#fafaf8] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Open policy exceptions</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">5</p>
                        <p className="mt-2 text-sm text-black/56">Mission urgency is still winning arguments it should not win.</p>
                      </div>
                      <div className="rounded-[20px] border border-black/8 bg-[#fafaf8] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Executive prep</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">3</p>
                        <p className="mt-2 text-sm text-black/56">Programs that need better explanation, not necessarily less usage.</p>
                      </div>
                    </div>
                  </div>
                </Surface>

                <Surface className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <RiskBadge risk={activeAgency.risk} />
                        <span className="inline-flex rounded-full border border-black/8 bg-white px-2.5 py-1 text-[11px] font-medium text-black/52">
                          {activeAgency.stage}
                        </span>
                        <span className="inline-flex rounded-full border border-black/8 bg-white px-2.5 py-1 text-[11px] font-medium text-black/52">
                          {activeAgency.status}
                        </span>
                      </div>
                      <h2 className="mt-3 text-[clamp(1.7rem,2.6vw,2.6rem)] font-semibold tracking-[-0.05em] text-[#111827]">
                        {activeAgency.agency}
                      </h2>
                      <p className="mt-1 text-base text-black/56">{activeAgency.office}</p>
                      <p className="mt-5 max-w-3xl text-base leading-7 text-black/60">{activeAgency.note}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 xl:w-[380px] xl:grid-cols-1">
                      <div className="rounded-[20px] border border-black/8 bg-[#fafaf8] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Deployments</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">{activeAgency.deployments}</p>
                        <p className="mt-2 text-sm text-black/56">Across active projects and internal workspaces.</p>
                      </div>
                      <div className="rounded-[20px] border border-black/8 bg-[#fafaf8] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Monthly spend</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">{activeAgency.monthlySpend}</p>
                        <p className="mt-2 text-sm text-black/56">Tracked from usage and billing surfaces.</p>
                      </div>
                      <div className="rounded-[20px] border border-black/8 bg-[#fafaf8] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Compliance</p>
                        <div className="mt-3 flex items-center gap-3">
                          <p className="text-3xl font-semibold tracking-[-0.05em] text-[#111827]">{activeAgency.compliance}%</p>
                          {activeAgency.risk === "high" ? (
                            <ShieldX className="h-5 w-5 text-[#b42318]" />
                          ) : activeAgency.risk === "watch" ? (
                            <ShieldAlert className="h-5 w-5 text-[#9a6700]" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-[#166534]" />
                          )}
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/7">
                          <div className="h-full rounded-full bg-[#111827] transition-[width] duration-300" style={{ width: `${activeAgency.compliance}%` }} />
                        </div>
                        <p className="mt-2 text-sm text-black/56">Updated {activeAgency.lastUpdated}</p>
                      </div>
                    </div>
                  </div>
                </Surface>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <Surface className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Adoption vs controls</p>
                        <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">
                          Usage is still rising faster than audited coverage.
                        </h3>
                      </div>
                      <span className="inline-flex rounded-full border border-black/8 bg-black/[0.03] px-3 py-1.5 text-sm text-black/56">
                        gap remains manageable
                      </span>
                    </div>
                    <div className="mt-5 h-[280px] w-full">
                      {chartsReady ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={adoptionTrend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                            <defs>
                              <linearGradient id="deploymentsFillGov" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#111827" stopOpacity={0.14} />
                                <stop offset="100%" stopColor="#111827" stopOpacity={0.02} />
                              </linearGradient>
                              <linearGradient id="auditedFillGov" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6b7280" stopOpacity={0.12} />
                                <stop offset="100%" stopColor="#6b7280" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#ecece6" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
                            <Tooltip
                              cursor={{ stroke: "#d7d9dd", strokeDasharray: "4 4" }}
                              contentStyle={{
                                borderRadius: 16,
                                border: "1px solid rgba(17,24,39,0.08)",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 20px 40px rgba(17,24,39,0.08)",
                              }}
                            />
                            <Area type="monotone" dataKey="audited" stroke="#6b7280" strokeWidth={2} fill="url(#auditedFillGov)" />
                            <Area type="monotone" dataKey="deployments" stroke="#111827" strokeWidth={2.4} fill="url(#deploymentsFillGov)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full animate-pulse rounded-[20px] bg-black/5" />
                      )}
                    </div>
                  </Surface>

                  <Surface className="p-5 sm:p-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Deployment mix</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr] xl:grid-cols-1">
                      <div className="mx-auto h-[136px] w-[136px]">
                        {chartsReady ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={deploymentMix} dataKey="value" innerRadius={34} outerRadius={50} paddingAngle={3}>
                                {deploymentMix.map((slice) => (
                                  <Cell key={slice.name} fill={slice.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full animate-pulse rounded-full bg-black/5" />
                        )}
                      </div>
                      <div className="space-y-2">
                        {deploymentMix.map((slice) => (
                          <div key={slice.name} className="flex items-center justify-between rounded-[18px] border border-black/8 bg-[#fafaf8] px-3 py-2.5 text-sm">
                            <div className="flex items-center gap-2.5 text-black/60">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                              {slice.name}
                            </div>
                            <span className="font-medium text-[#111827]">{slice.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Surface>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <Surface className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Current deployment</p>
                        <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">
                          Models, surfaces, and current use cases
                        </h3>
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 text-black/28" />
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <div className="space-y-4 rounded-[20px] border border-black/8 bg-[#fafaf8] p-4">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Models</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activeAgency.models.map((model) => (
                              <span key={model} className="inline-flex rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-[#111827]">
                                {model}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">OpenAI surfaces</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activeAgency.surfaces.map((surface) => (
                              <span key={surface} className="inline-flex rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-black/62">
                                {surface}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-black/8 bg-[#fafaf8] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Use cases</p>
                        <div className="mt-3 space-y-2.5">
                          {activeAgency.useCases.map((item) => (
                            <div key={item} className="rounded-[16px] border border-black/8 bg-white px-3 py-3 text-sm text-black/62">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[20px] border border-black/8 bg-[#111827] px-4 py-4 text-sm leading-6 text-white/88">
                      <span className="font-medium text-white">Press risk:</span> {activeAgency.pressRisk}
                    </div>
                  </Surface>

                  <Surface className="p-5 sm:p-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Controls and flags</p>
                    <div className="mt-4 h-[220px] rounded-[20px] border border-black/8 bg-[#fafaf8] p-3">
                      {chartsReady ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { label: "Approvals", value: activeAgency.approvals.length },
                              { label: "Flags", value: activeAgency.flags.length },
                              { label: "Risk", value: activeAgency.risk === "high" ? 5 : activeAgency.risk === "watch" ? 3 : 1 },
                            ]}
                            margin={{ top: 8, right: 0, left: -26, bottom: 0 }}
                          >
                            <CartesianGrid vertical={false} stroke="#ecece6" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: 16,
                                border: "1px solid rgba(17,24,39,0.08)",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 20px 40px rgba(17,24,39,0.08)",
                              }}
                            />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                              {[
                                { fill: "#111827" },
                                { fill: "#6b7280" },
                                { fill: activeAgency.risk === "high" ? "#b42318" : activeAgency.risk === "watch" ? "#9a6700" : "#166534" },
                              ].map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full animate-pulse rounded-[20px] bg-black/5" />
                      )}
                    </div>

                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Approvals</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activeAgency.approvals.map((item) => (
                            <span key={item} className="inline-flex rounded-full border border-[#d6ead8] bg-[#eff8f1] px-3 py-1.5 text-sm text-[#166534]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Flags</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activeAgency.flags.map((item) => (
                            <span key={item} className="inline-flex rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-black/60">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Surface>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <Surface className="overflow-hidden">
                    <div className="border-b border-black/8 px-5 py-4 sm:px-6">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Agency list</p>
                      <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">Tracked programs</h3>
                    </div>
                    <div className="divide-y divide-black/6">
                      {visibleAgencies.map((agency) => (
                        <button
                          key={agency.id}
                          type="button"
                          onClick={() => setActiveAgencyId(agency.id)}
                          className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-black/[0.02] sm:px-6 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-[#111827]">{agency.agency}</p>
                              <RiskBadge risk={agency.risk} />
                            </div>
                            <p className="mt-1 text-sm text-black/52">{agency.office}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm text-black/56 sm:flex sm:items-center sm:gap-6">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-black/38">Stage</p>
                              <p className="mt-1 text-[#111827]">{agency.stage}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-black/38">Compliance</p>
                              <p className="mt-1 text-[#111827]">{agency.compliance}%</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Surface>

                  <div className="space-y-4">
                    <Surface className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Investigation feed</p>
                          <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">What breaks containment</h3>
                        </div>
                        <ArrowUpRight className="mt-1 h-4 w-4 text-black/28" />
                      </div>
                      <div className="mt-4 space-y-3">
                        {investigationFeed.map((item) => (
                          <div key={item.title} className="rounded-[18px] border border-black/8 bg-[#fafaf8] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-[#111827]">{item.title}</p>
                              <RiskBadge risk={item.risk} />
                            </div>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-black/38">{item.agency}</p>
                            <p className="mt-3 text-sm leading-6 text-black/60">{item.note}</p>
                          </div>
                        ))}
                      </div>
                    </Surface>

                    <Surface className="p-5 sm:p-6">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">Oversight posture</p>
                      <div className="mt-4 space-y-3">
                        {oversightNotes.map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className="rounded-[18px] border border-black/8 bg-[#fafaf8] p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-white text-black/60">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium text-[#111827]">{item.label}</p>
                                    <span className="text-sm text-black/42">{item.value}</span>
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-black/58">{item.detail}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Surface>
                  </div>
                </div>
              </div>
            ) : (
              <Surface className="p-6">
                <div className="flex items-center gap-3 text-black/56">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading agency state
                </div>
              </Surface>
            )}
          </section>
        </div>
      </div>

      <StateOverlay view={view} setView={setView} />
    </main>
  );
}
