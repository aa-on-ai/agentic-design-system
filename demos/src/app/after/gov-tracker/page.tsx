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
  FolderOpen,
  Gavel,
  Landmark,
  Radar,
  Search,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Waves,
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
  category: string;
  stage: string;
  models: string[];
  tools: string[];
  useCases: string[];
  deployments: number;
  monthlySpend: string;
  compliance: number;
  risk: RiskTone;
  pressAngle: string;
  memo: string;
  updated: string;
  openFindings: number;
  approvals: string[];
  flags: string[];
};

const topNav = ["Overview", "Agencies", "Evals", "Alerts"];

const agencies: Agency[] = [
  {
    id: "gsa",
    agency: "General Services Administration",
    office: "Technology Transformation Services",
    category: "civilian",
    stage: "Production",
    models: ["GPT-5.4", "gpt-5-mini"],
    tools: ["Responses API", "Batch API", "File search"],
    useCases: ["Procurement draft cleanup", "Vendor Q&A triage", "Policy memo synthesis"],
    deployments: 14,
    monthlySpend: "$184,260",
    compliance: 94,
    risk: "clear",
    pressAngle: "Low press heat unless vendor favoritism or procurement opacity becomes visible.",
    memo: "Looks like a boring internal efficiency story, which is exactly why it feels durable.",
    updated: "8 min ago",
    openFindings: 1,
    approvals: ["RBAC enabled", "Prompt logging on", "Human sign-off required"],
    flags: ["FOIA discoverable", "Vendor lock-in questions"],
  },
  {
    id: "dhs",
    agency: "Department of Homeland Security",
    office: "Incident review and language services",
    category: "security",
    stage: "Controlled rollout",
    models: ["GPT-5.4", "o1"],
    tools: ["Realtime API", "Responses API", "Moderation"],
    useCases: ["Border incident summaries", "Translation assist", "Training simulations"],
    deployments: 11,
    monthlySpend: "$312,408",
    compliance: 68,
    risk: "high",
    pressAngle: "Any adjacency to watchlists, deportation decisions, or surveillance language turns into a story instantly.",
    memo: "The product boundary says summarize and translate. The internal language keeps drifting toward prioritize and recommend.",
    updated: "14 min ago",
    openFindings: 5,
    approvals: ["Prompt retention limited", "Dedicated project workspace"],
    flags: ["Civil liberties review pending", "Hill-demo sensitive", "Escalate to policy"],
  },
  {
    id: "va",
    agency: "Department of Veterans Affairs",
    office: "Benefits navigation",
    category: "service",
    stage: "Expanded pilot",
    models: ["gpt-5-mini"],
    tools: ["Responses API", "Evals", "Files"],
    useCases: ["Claim intake summaries", "Appeal packet prep", "Portal guidance drafts"],
    deployments: 9,
    monthlySpend: "$96,114",
    compliance: 91,
    risk: "watch",
    pressAngle: "Good mission fit, but denial language and traceability need to stay painfully clear.",
    memo: "Helpful product. Fragile wording. This one lives or dies on whether the human reviewer is visibly the decider.",
    updated: "22 min ago",
    openFindings: 2,
    approvals: ["Reviewer attribution visible", "Eval suite green", "No outbound automation"],
    flags: ["Empathy drift in appeals", "Needs better audit export"],
  },
  {
    id: "irs",
    agency: "Internal Revenue Service",
    office: "Taxpayer services",
    category: "civilian",
    stage: "Production",
    models: ["GPT-5.4", "gpt-5-mini"],
    tools: ["Batch API", "Evals", "Stored completions"],
    useCases: ["Appeal letter drafting", "Call center copilot", "Document classification"],
    deployments: 13,
    monthlySpend: "$228,092",
    compliance: 79,
    risk: "high",
    pressAngle: "If model-written enforcement language feels harsher than legacy letters, someone will notice.",
    memo: "The model is efficient. The tone is colder. That gap is small in a spreadsheet and massive in a headline.",
    updated: "31 min ago",
    openFindings: 4,
    approvals: ["Scale tier budget alerts", "Project-level usage tracking"],
    flags: ["Appeal empathy regression", "Comms review recommended"],
  },
  {
    id: "cdc",
    agency: "Centers for Disease Control and Prevention",
    office: "Emergency communications",
    category: "health",
    stage: "Production",
    models: ["GPT-5.4", "gpt-5-mini"],
    tools: ["Responses API", "Files", "Prompt optimizer"],
    useCases: ["Outbreak brief synthesis", "Grant triage", "Public guidance drafting"],
    deployments: 7,
    monthlySpend: "$121,844",
    compliance: 87,
    risk: "watch",
    pressAngle: "In a crisis, provenance matters more than elegance. People will ask who wrote the first draft.",
    memo: "Operationally strong. Comms provenance still feels more implied than explicit.",
    updated: "39 min ago",
    openFindings: 2,
    approvals: ["Version history retained", "Policy review required before publish"],
    flags: ["Authorship needs cleaner labeling"],
  },
  {
    id: "ssa",
    agency: "Social Security Administration",
    office: "Disability intake",
    category: "service",
    stage: "Pilot",
    models: ["gpt-5-mini"],
    tools: ["Responses API", "Evals"],
    useCases: ["Case summarization", "Timeline cleanup", "Caseworker copilot"],
    deployments: 6,
    monthlySpend: "$74,932",
    compliance: 61,
    risk: "high",
    pressAngle: "The minute summarization turns into recommendation support, this becomes a fairness story.",
    memo: "This is the one most likely to quietly expand scope and then claim it was only assistive.",
    updated: "52 min ago",
    openFindings: 6,
    approvals: ["Human review in product copy only"],
    flags: ["Decision-support adjacency", "GAO inquiry risk", "Pause before expansion"],
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

const useCaseMix = [
  { name: "Service delivery", value: 26, color: "#101828" },
  { name: "Operations", value: 24, color: "#3f3f46" },
  { name: "Research", value: 17, color: "#71717a" },
  { name: "Security", value: 19, color: "#a1a1aa" },
  { name: "Compliance", value: 14, color: "#d4d4d8" },
];

const investigationFeed = [
  {
    title: "DHS scope language drift",
    agency: "DHS",
    risk: "high" as RiskTone,
    note: "Internal note swapped summarize for prioritize in one ops brief. That is the whole story if it leaks.",
  },
  {
    title: "IRS tone regression",
    agency: "IRS",
    risk: "high" as RiskTone,
    note: "Appeal drafts are more absolute than the legacy templates they were meant to speed up.",
  },
  {
    title: "SSA expansion request",
    agency: "SSA",
    risk: "high" as RiskTone,
    note: "Pilot team asked to move from summarization into recommendation support next quarter.",
  },
  {
    title: "CDC provenance gap",
    agency: "CDC",
    risk: "watch" as RiskTone,
    note: "Draft authorship is still visible internally, but not crisp enough for an external explanation.",
  },
];

const oversightCards = [
  {
    label: "Projects with FOIA-sensitive logs",
    value: "12",
    detail: "Prompt traces, eval notes, and exception memos would be discoverable in a records request.",
    icon: FolderOpen,
  },
  {
    label: "Open policy exceptions",
    value: "5",
    detail: "Teams citing mission urgency to bypass red-team or model-card review this month.",
    icon: Gavel,
  },
  {
    label: "Programs needing executive prep",
    value: "3",
    detail: "Not because they are broken. Because their public explanation is currently weaker than their deployment reality.",
    icon: FileWarning,
  },
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Surface({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-3xl border border-black/8 bg-white/92", className)}>{children}</section>;
}

function Stat({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Building2 }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-[#fbfbf9] p-4 transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#101828]">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6 bg-white text-black/70">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-black/58">{detail}</p>
    </div>
  );
}

function RiskBadge({ risk }: { risk: RiskTone }) {
  const styles = {
    clear: "bg-[#eef6ef] text-[#166534] border-[#d6e9d8]",
    watch: "bg-[#f7f1e6] text-[#9a6700] border-[#eadbb5]",
    high: "bg-[#fbeaea] text-[#b42318] border-[#f2c4c0]",
  }[risk];

  const label = risk === "clear" ? "Clear" : risk === "watch" ? "Watch" : "High";

  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", styles)}>{label}</span>;
}

function RailButton({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition duration-150 ease-out",
        active ? "bg-[#101828] text-white shadow-[0_10px_28px_rgba(16,24,40,0.18)]" : "text-black/68 hover:bg-black/[0.03]",
      )}
    >
      {children}
    </button>
  );
}

function LoadingView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      {[0, 1, 2].map((column) => (
        <Surface key={column} className="overflow-hidden p-4 sm:p-5">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-28 rounded-full bg-black/6" />
            <div className="h-8 w-2/3 rounded-2xl bg-black/8" />
            <div className="h-24 rounded-3xl bg-black/5" />
            <div className="h-24 rounded-3xl bg-black/5" />
            <div className="h-24 rounded-3xl bg-black/5" />
          </div>
        </Surface>
      ))}
    </div>
  );
}

export default function GovTrackerPage() {
  const [view, setView] = useState<ViewState>("happy");
  const [activeAgency, setActiveAgency] = useState(agencies[1]?.id ?? agencies[0].id);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visibleAgencies = useMemo(() => (view === "empty" ? [] : agencies), [view]);
  const currentAgency = visibleAgencies.find((agency) => agency.id === activeAgency) ?? visibleAgencies[0] ?? null;

  const totals = useMemo(() => {
    const highRisk = visibleAgencies.filter((agency) => agency.risk === "high").length;
    const watched = visibleAgencies.filter((agency) => agency.risk !== "clear").length;
    const deployments = visibleAgencies.reduce((sum, agency) => sum + agency.deployments, 0);
    const avgCompliance = visibleAgencies.length
      ? Math.round(visibleAgencies.reduce((sum, agency) => sum + agency.compliance, 0) / visibleAgencies.length)
      : 0;

    return { highRisk, watched, deployments, avgCompliance };
  }, [visibleAgencies]);

  return (
    <main className="min-h-screen bg-[#f6f6f2] text-[#101828]">
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-enter {
          animation: fadeInUp 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .paper-noise {
          background-image:
            radial-gradient(circle at 20% 20%, rgba(16,24,40,0.03) 0, transparent 22%),
            radial-gradient(circle at 80% 0%, rgba(16,24,40,0.025) 0, transparent 18%),
            linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.92));
        }

        @media (prefers-reduced-motion: reduce) {
          .page-enter {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="page-enter rounded-[32px] border border-black/8 bg-[#fcfcfa] shadow-[0_24px_80px_rgba(16,24,40,0.08)]">
          <header className="border-b border-black/8 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#101828] text-white">
                  <Radar className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-black/72">Government AI Tracker</p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/8 bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium text-black/50">
                      internal · sam altman brief
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-black/52">
                    This should feel like OpenAI’s own platform surface, with deadpan internal-risk energy.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <nav className="hidden rounded-full border border-black/8 bg-white p-1 md:flex">
                  {topNav.map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      className={cn(
                        "rounded-full px-3.5 py-2 text-sm transition duration-150 ease-out",
                        index === 1 ? "bg-[#101828] text-white" : "text-black/56 hover:bg-black/[0.03] hover:text-black/75",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </nav>

                <div className="flex items-center gap-2 self-start rounded-full border border-black/8 bg-white p-1 shadow-sm">
                  {(["happy", "loading", "empty", "error"] as ViewState[]).map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => setView(state)}
                      className={cn(
                        "min-h-11 rounded-full px-3 py-2 text-xs font-medium capitalize transition duration-150 ease-out sm:min-h-10 sm:text-sm",
                        view === state
                          ? "bg-[#101828] text-white"
                          : "text-black/56 hover:bg-black/[0.03] hover:text-black/78",
                      )}
                    >
                      {state === "happy" ? "happy path" : state}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="paper-noise rounded-b-[32px] px-4 py-4 sm:px-6 lg:px-8 lg:py-7">
            <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <Surface className="paper-noise overflow-hidden p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-4xl">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/42">
                      agencies · models · compliance · press risk
                    </p>
                    <h1 className="mt-3 max-w-4xl text-[clamp(2rem,5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-[#101828]">
                      Which federal agencies are deploying OpenAI models,
                      <span className="block text-black/50">and which programs turn into hearings if the language slips.</span>
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-black/58 sm:text-base">
                      Real OpenAI nouns, real federal agencies, real control surfaces. The humor stays in the data model,
                      not in the chrome. This reads like a platform dashboard that accidentally wandered into Washington.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-black/8 bg-white/96 p-4 sm:p-5 lg:max-w-[300px]">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Executive posture</p>
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-3xl font-semibold tracking-[-0.05em] text-[#101828]">{totals.highRisk}</p>
                        <p className="mt-1 text-sm leading-6 text-black/56">programs need comms prep before they need legal cleanup</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#101828] text-white">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Surface>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <Stat label="Tracked agencies" value={`${visibleAgencies.length || 0}`} detail="Across service, security, civilian, and health programs" icon={Landmark} />
                <Stat label="Live deployments" value={`${totals.deployments}`} detail="Responses, Batch, Evals, Files, Realtime, Moderation" icon={Bot} />
                <Stat label="Avg compliance" value={`${totals.avgCompliance}%`} detail="RBAC, eval coverage, prompt logging, approval visibility" icon={ShieldCheck} />
              </div>
            </div>

            {view === "loading" ? (
              <LoadingView />
            ) : view === "error" ? (
              <Surface className="p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#101828] text-white">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="max-w-3xl">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">feed interruption</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#101828]">
                      Procurement notes failed to sync, so the dashboard is refusing to fake certainty.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-black/58">
                      Last-good data is still available, but the live investigation feed is stale. Internal tools should say this plainly.
                      If a page becomes more confident as inputs disappear, it is lying.
                    </p>
                    <button
                      type="button"
                      onClick={() => setView("happy")}
                      className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#101828] px-4 py-2 text-sm font-medium text-white transition duration-150 ease-out hover:translate-y-[-1px] hover:bg-black"
                    >
                      restore last good snapshot
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Surface>
            ) : view === "empty" ? (
              <Surface className="p-6 sm:p-8 lg:p-10">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">empty state</p>
                  <h2 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#101828]">No agencies are in the tracker yet.</h2>
                  <p className="mt-4 text-base leading-7 text-black/58">
                    Seed the first project with a real office, a real model, and a real control story. Then the page can start behaving like a product instead of a template.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setView("happy")}
                      className="inline-flex min-h-11 items-center rounded-full bg-[#101828] px-4 py-2 text-sm font-medium text-white transition duration-150 ease-out hover:translate-y-[-1px] hover:bg-black"
                    >
                      load tracked agencies
                    </button>
                    <div className="inline-flex min-h-11 items-center rounded-full border border-black/8 bg-white px-4 py-2 text-sm text-black/56">
                      Good empty states explain the system, not just the absence of rows.
                    </div>
                  </div>
                </div>
              </Surface>
            ) : (
              <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
                <Surface className="overflow-hidden p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between px-2 py-1">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Agency register</p>
                      <p className="mt-1 text-sm text-black/56">Sorted by reputational heat</p>
                    </div>
                    <Search className="h-4 w-4 text-black/36" />
                  </div>

                  <div className="space-y-2">
                    {visibleAgencies.map((agency) => (
                      <RailButton key={agency.id} active={agency.id === currentAgency?.id} onClick={() => setActiveAgency(agency.id)}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn("truncate font-medium", agency.id === currentAgency?.id ? "text-white" : "text-[#101828]")}>{agency.agency}</p>
                            <RiskBadge risk={agency.risk} />
                          </div>
                          <p className={cn("mt-1 truncate text-xs", agency.id === currentAgency?.id ? "text-white/72" : "text-black/46")}>{agency.office}</p>
                        </div>
                        <ChevronRight className={cn("h-4 w-4 shrink-0", agency.id === currentAgency?.id ? "text-white/70" : "text-black/28")} />
                      </RailButton>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-black/8 bg-[#fbfbf9] p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Live signals</p>
                    <div className="mt-3 space-y-3 text-sm text-black/60">
                      <div className="flex items-start justify-between gap-3">
                        <span>Programs under watch</span>
                        <span className="font-medium text-[#101828]">{totals.watched}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span>Open eval gaps</span>
                        <span className="font-medium text-[#101828]">7</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span>Pending policy reviews</span>
                        <span className="font-medium text-[#101828]">4</span>
                      </div>
                    </div>
                  </div>
                </Surface>

                <div className="space-y-4">
                  <Surface className="overflow-hidden p-5 sm:p-6">
                    {currentAgency ? (
                      <>
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex rounded-full border border-black/8 bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-black/45">
                                {currentAgency.category}
                              </span>
                              <span className="inline-flex rounded-full border border-black/8 bg-white px-2.5 py-1 text-[11px] font-medium text-black/52">
                                {currentAgency.stage}
                              </span>
                              <RiskBadge risk={currentAgency.risk} />
                            </div>
                            <h2 className="mt-3 text-[clamp(1.9rem,3vw,3.2rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#101828]">
                              {currentAgency.agency}
                            </h2>
                            <p className="mt-2 text-base text-black/56">{currentAgency.office}</p>
                            <p className="mt-5 max-w-3xl text-base leading-7 text-black/60">{currentAgency.memo}</p>
                          </div>

                          <div className="rounded-3xl border border-black/8 bg-[#fbfbf9] p-4 sm:min-w-[240px]">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Current posture</p>
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#101828] text-white">
                                {currentAgency.risk === "high" ? <ShieldX className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-[#101828]">
                                  {currentAgency.risk === "high" ? "Needs escalation" : currentAgency.risk === "watch" ? "Monitor closely" : "Stable"}
                                </p>
                                <p className="text-sm text-black/54">Updated {currentAgency.updated}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-black/8 bg-[#fbfbf9] p-4">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Deployments</p>
                            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#101828]">{currentAgency.deployments}</p>
                            <p className="mt-2 text-sm text-black/56">Across projects, pilots, and internal workspaces</p>
                          </div>
                          <div className="rounded-2xl border border-black/8 bg-[#fbfbf9] p-4">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Monthly spend</p>
                            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#101828]">{currentAgency.monthlySpend}</p>
                            <p className="mt-2 text-sm text-black/56">Visible at project level in the billing dashboard</p>
                          </div>
                          <div className="rounded-2xl border border-black/8 bg-[#fbfbf9] p-4">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Compliance</p>
                            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#101828]">{currentAgency.compliance}%</p>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/8">
                              <div className="h-full rounded-full bg-[#101828] transition-[width] duration-300 ease-out" style={{ width: `${currentAgency.compliance}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                          <div className="rounded-3xl border border-black/8 bg-white p-4 sm:p-5">
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Adoption vs controls</p>
                                <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#101828]">
                                  Usage keeps climbing faster than audited coverage.
                                </h3>
                              </div>
                              <span className="inline-flex rounded-full border border-black/8 bg-black/[0.03] px-3 py-1.5 text-sm text-black/56">
                                gap still manageable
                              </span>
                            </div>

                            <div className="h-[280px] w-full">
                              {chartReady ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={adoptionTrend} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="deploymentsFillAfter" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#101828" stopOpacity={0.16} />
                                        <stop offset="100%" stopColor="#101828" stopOpacity={0.02} />
                                      </linearGradient>
                                      <linearGradient id="auditedFillAfter" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6b7280" stopOpacity={0.16} />
                                        <stop offset="100%" stopColor="#6b7280" stopOpacity={0.02} />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#ecece7" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
                                    <Tooltip
                                      cursor={{ stroke: "#d4d4cc", strokeDasharray: "4 4" }}
                                      contentStyle={{
                                        borderRadius: 16,
                                        border: "1px solid rgba(16,24,40,0.08)",
                                        backgroundColor: "#ffffff",
                                        boxShadow: "0 20px 40px rgba(16,24,40,0.08)",
                                      }}
                                    />
                                    <Area type="monotone" dataKey="audited" stroke="#6b7280" strokeWidth={2} fill="url(#auditedFillAfter)" />
                                    <Area type="monotone" dataKey="deployments" stroke="#101828" strokeWidth={2.5} fill="url(#deploymentsFillAfter)" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-full animate-pulse rounded-3xl bg-black/5" />
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-3xl border border-black/8 bg-[#fbfbf9] p-4">
                              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Models</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {currentAgency.models.map((model) => (
                                  <span key={model} className="inline-flex rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-[#101828]">
                                    {model}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-3xl border border-black/8 bg-[#fbfbf9] p-4">
                              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">OpenAI surfaces</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {currentAgency.tools.map((tool) => (
                                  <span key={tool} className="inline-flex rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-black/60">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                          <div className="rounded-3xl border border-black/8 bg-white p-4 sm:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Use cases</p>
                                <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#101828]">What this office is actually doing with the models</h3>
                              </div>
                              <Waves className="h-4 w-4 text-black/36" />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                              {currentAgency.useCases.map((item) => (
                                <div key={item} className="rounded-2xl border border-black/8 bg-[#fbfbf9] p-4 text-sm leading-6 text-black/62 transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-white">
                                  {item}
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 rounded-2xl border border-black/8 bg-[#101828] px-4 py-3 text-sm leading-6 text-white/90">
                              <span className="font-medium text-white">Press angle:</span> {currentAgency.pressAngle}
                            </div>
                          </div>

                          <div className="rounded-3xl border border-black/8 bg-white p-4 sm:p-5">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Deployment mix</p>
                            <div className="mt-4 grid gap-4 sm:grid-cols-[132px_1fr] lg:grid-cols-1 xl:grid-cols-[132px_1fr]">
                              <div className="mx-auto h-[132px] w-[132px]">
                                {chartReady ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie data={useCaseMix} dataKey="value" innerRadius={30} outerRadius={48} paddingAngle={3}>
                                        {useCaseMix.map((slice) => (
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
                                {useCaseMix.map((slice) => (
                                  <div key={slice.name} className="flex items-center justify-between rounded-2xl border border-black/8 bg-[#fbfbf9] px-3 py-2.5 text-sm">
                                    <div className="flex items-center gap-2.5 text-black/60">
                                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                                      {slice.name}
                                    </div>
                                    <span className="font-medium text-[#101828]">{slice.value}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </Surface>

                  <Surface className="overflow-hidden p-0">
                    <div className="border-b border-black/8 px-5 py-4 sm:px-6">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">All tracked agencies</p>
                      <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#101828]">Compact register</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead className="bg-black/[0.02] text-[11px] uppercase tracking-[0.18em] text-black/42">
                          <tr>
                            <th className="px-4 py-3 font-medium sm:px-6">Agency</th>
                            <th className="px-4 py-3 font-medium">Models</th>
                            <th className="px-4 py-3 font-medium">Stage</th>
                            <th className="px-4 py-3 font-medium">Compliance</th>
                            <th className="px-4 py-3 font-medium">Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleAgencies.map((agency) => (
                            <tr
                              key={agency.id}
                              className="cursor-pointer border-t border-black/6 text-sm transition duration-150 ease-out hover:bg-black/[0.02]"
                              onClick={() => setActiveAgency(agency.id)}
                            >
                              <td className="px-4 py-4 sm:px-6">
                                <div className="font-medium text-[#101828]">{agency.agency}</div>
                                <div className="mt-1 text-xs text-black/48">{agency.office}</div>
                              </td>
                              <td className="px-4 py-4 text-black/58">{agency.models.join(" · ")}</td>
                              <td className="px-4 py-4 text-black/58">{agency.stage}</td>
                              <td className="px-4 py-4 font-medium text-[#101828]">{agency.compliance}%</td>
                              <td className="px-4 py-4">
                                <RiskBadge risk={agency.risk} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Surface>
                </div>

                <div className="space-y-4">
                  <Surface className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Investigation feed</p>
                        <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#101828]">What breaks containment</h3>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-black/30" />
                    </div>
                    <div className="mt-4 space-y-3">
                      {investigationFeed.map((item) => (
                        <div key={item.title} className="rounded-2xl border border-black/8 bg-[#fbfbf9] p-4 transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-white">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[#101828]">{item.title}</p>
                            <RiskBadge risk={item.risk} />
                          </div>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-black/38">{item.agency}</p>
                          <p className="mt-3 text-sm leading-6 text-black/60">{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </Surface>

                  <Surface className="p-4 sm:p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Oversight posture</p>
                    <div className="mt-4 space-y-3">
                      {oversightCards.map((card) => {
                        const Icon = card.icon;
                        return (
                          <div key={card.label} className="rounded-2xl border border-black/8 bg-[#fbfbf9] p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-white text-black/66">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-medium text-[#101828]">{card.label}</p>
                                  <span className="text-sm text-black/42">{card.value}</span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-black/58">{card.detail}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Surface>

                  {currentAgency ? (
                    <Surface className="p-4 sm:p-5">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/42">Controls and flags</p>
                      <div className="mt-4 h-[220px] rounded-3xl border border-black/8 bg-[#fbfbf9] p-3">
                        {chartReady ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { label: "Approvals", value: currentAgency.approvals.length },
                                { label: "Flags", value: currentAgency.flags.length },
                                { label: "Findings", value: currentAgency.openFindings },
                              ]}
                              margin={{ top: 10, right: 0, left: -24, bottom: 0 }}
                            >
                              <CartesianGrid vertical={false} stroke="#ecece7" />
                              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
                              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#667085", fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  borderRadius: 16,
                                  border: "1px solid rgba(16,24,40,0.08)",
                                  backgroundColor: "#ffffff",
                                  boxShadow: "0 20px 40px rgba(16,24,40,0.08)",
                                }}
                              />
                              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                                {[
                                  { fill: "#101828" },
                                  { fill: "#7a7a86" },
                                  { fill: currentAgency.risk === "high" ? "#b42318" : currentAgency.risk === "watch" ? "#9a6700" : "#166534" },
                                ].map((entry, index) => (
                                  <Cell key={index} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full animate-pulse rounded-3xl bg-black/5" />
                        )}
                      </div>

                      <div className="mt-4 grid gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-black/40">Approvals</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {currentAgency.approvals.map((item) => (
                              <span key={item} className="inline-flex rounded-full border border-[#d6e9d8] bg-[#eef6ef] px-3 py-1.5 text-sm text-[#166534]">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-black/40">Flags</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {currentAgency.flags.map((item) => (
                              <span key={item} className="inline-flex rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-black/60">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Surface>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
