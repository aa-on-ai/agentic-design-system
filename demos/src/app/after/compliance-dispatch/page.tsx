"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  FileSearch,
  Flame,
  Globe2,
  Lock,
  Radar,
  Shield,
  Sparkles,
  Waypoints,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Mode = "baseline" | "elevated";

type AgencyItem = {
  agency: string;
  office: string;
  movement: string;
  summary: string;
  models: string[];
  status: string;
  weight: string;
};

type InvestigationItem = {
  outlet: string;
  headline: string;
  heat: number;
  note: string;
};

type PolicyItem = {
  source: string;
  shift: string;
  implication: string;
};

type WatchItem = {
  title: string;
  note: string;
};

type MemoState = {
  kicker: string;
  summary: string;
  readTime: string;
  pulseLabel: string;
  pulseValue: string;
  pulseTone: string;
  leadNote: string;
  pullQuote: string;
  quoteSource: string;
  chartNote: string;
  chartHighlight: string;
  watchLabel: string;
  watchTone: string;
  agencies: AgencyItem[];
  investigations: InvestigationItem[];
  policies: PolicyItem[];
  watchItems: WatchItem[];
};

const riskTrend = [
  { week: "Feb 7", score: 58 },
  { week: "Feb 14", score: 59 },
  { week: "Feb 21", score: 61 },
  { week: "Feb 28", score: 64 },
  { week: "Mar 7", score: 68 },
  { week: "Mar 14", score: 74 },
];

const memoStates: Record<Mode, MemoState> = {
  baseline: {
    kicker: "Friday internal brief · Office of the CEO · circulation limited to leadership",
    summary:
      "This week looked less like a single incident and more like a broadening pattern: procurement language is tightening, agency experimentation is spreading into operational workflows, and several reporters now appear to be working adjacent angles on the same public-sector story.",
    readTime: "6 min read",
    pulseLabel: "This week in one line",
    pulseValue: "adoption broadens faster than narrative control",
    pulseTone: "Measured concern",
    leadNote:
      "The near-term risk is not one dramatic headline. It is a stack of individually manageable events that begin to read as a trend once placed beside each other.",
    pullQuote:
      "The story is shifting from ‘agencies are experimenting with AI’ to ‘agencies are operationalizing AI before the oversight language has settled.’",
    quoteSource: "internal synthesis · policy + comms",
    chartNote:
      "Executive risk drift has moved steadily for six weeks, with the sharpest change after procurement scrutiny and health-adjacent deployments started appearing in the same conversations.",
    chartHighlight: "Press + procurement coupling begins here",
    watchLabel: "watch posture",
    watchTone: "monitor closely",
    agencies: [
      {
        agency: "General Services Administration",
        office: "Technology Transformation Services",
        movement: "+11 program teams",
        summary:
          "Expanded AI-assisted acquisition drafting and vendor intake triage across civilian procurement teams. The move is framed as throughput support, but the operational consequence is that model outputs are entering earlier in the purchasing flow.",
        models: ["GPT-5.4", "Codex", "Claude 4 Sonnet"],
        status: "watch",
        weight: "broad footprint",
      },
      {
        agency: "Department of Veterans Affairs",
        office: "Veterans Health Administration",
        movement: "+17 facilities",
        summary:
          "Ambient documentation pilots widened again, this time with stronger workflow hooks into post-visit summarization and staff handoff. Language remains conservative in public, but the internal deployment shape is becoming operational rather than exploratory.",
        models: ["GPT-5.3 Instant", "Claude 4 Opus"],
        status: "elevated",
        weight: "clinical adjacency",
      },
      {
        agency: "Department of Homeland Security",
        office: "USCIS operations + fraud units",
        movement: "+3 field offices",
        summary:
          "Case summarization and anomaly triage moved beyond sandbox usage into live analyst workflows. The optics issue is not the models themselves, it is the growing ambiguity around where recommendation ends and prioritization begins.",
        models: ["GPT-5.4", "Gemini 3 Pro"],
        status: "elevated",
        weight: "sensitive workflows",
      },
      {
        agency: "Department of Education",
        office: "Federal Student Aid",
        movement: "+1 national pilot",
        summary:
          "Borrower support and document-resolution assistance entered a limited production pilot with strong human review requirements. Low immediate risk, but worth tracking because similar support flows tend to expand quietly once service levels improve.",
        models: ["GPT-5.3 Instant", "Llama 4 405B"],
        status: "contained",
        weight: "service layer",
      },
    ],
    investigations: [
      {
        outlet: "The New York Times",
        headline: "Federal buyers are relying on AI drafting systems faster than the oversight rulebook is changing",
        heat: 82,
        note:
          "Still pre-publication, but two source paths suggest the reporting has moved from exploratory interviews into document-backed detail.",
      },
      {
        outlet: "ProPublica",
        headline: "Healthcare AI vendors are understating override rates in public-sector care workflows",
        heat: 76,
        note:
          "The inquiry appears to be broadening from vendor claims into audit and accountability language used in contract paperwork.",
      },
      {
        outlet: "Financial Times",
        headline: "European regulators are asking whether U.S. public-sector AI controls are materially auditable",
        heat: 63,
        note:
          "Less likely to land first, but useful because it can internationalize a story that would otherwise stay domestic and procedural.",
      },
    ],
    policies: [
      {
        source: "OMB drafting language",
        shift:
          "Human-review requirements are becoming more explicit for high-impact procurement and adjudication workflows.",
        implication:
          "Good for principle, awkward for messaging if our deployments are described casually as automation rather than supervised assistance.",
      },
      {
        source: "HHS advisory conversations",
        shift:
          "Pressure is growing to separate summarization features from anything that could be construed as clinical recommendation.",
        implication:
          "Language discipline matters. Marketing shortcuts now create downstream compliance cleanup.",
      },
      {
        source: "Hill staff working group",
        shift:
          "Incident-reporting language for certain frontier model deployments is becoming more concrete.",
        implication:
          "Not an immediate blocker, but it increases the cost of being imprecise about deployment scope.",
      },
    ],
    watchItems: [
      {
        title: "DoD procurement follow-on",
        note:
          "Watch for language that reframes experimentation as operational dependency. That is when board-level attention changes shape.",
      },
      {
        title: "CMS adjacent narrative spillover",
        note:
          "If healthcare coverage starts linking cost containment and model assistance in the same paragraph, the tone will harden quickly.",
      },
      {
        title: "Connector governance",
        note:
          "Enterprise admins increasingly want a simple story for what synced connectors can and cannot expose in regulated environments.",
      },
      {
        title: "Open-weight substitution",
        note:
          "A few agencies are openly testing cheaper alternatives for narrow tasks. Competitive pressure is low now, but procurement teams notice price anchors fast.",
      },
    ],
  },
  elevated: {
    kicker: "Friday internal brief · elevated watch · circulation limited to leadership",
    summary:
      "Our exposure is still manageable, but the ingredients for a compressed narrative cycle are now present: reporters have concrete threads, agencies are moving from pilots into workflow infrastructure, and policy language is becoming precise enough to expose sloppy product framing.",
    readTime: "6 min read",
    pulseLabel: "This week in one line",
    pulseValue: "multiple manageable stories are starting to rhyme",
    pulseTone: "Escalating",
    leadNote:
      "If two of the current lines converge, we stop dealing with isolated headlines and start dealing with a generalized claim that frontier AI entered government operations faster than the control surface matured.",
    pullQuote:
      "The dangerous version of next week is not a revelation. It is correlation — procurement scrutiny, healthcare concern, and model branding all appearing in the same news cycle.",
    quoteSource: "internal synthesis · escalated posture",
    chartNote:
      "The last two points are doing most of the work. This is no longer noise. It is a direction, and direction is what leadership teams feel.",
    chartHighlight: "Probability of narrative coupling rises sharply",
    watchLabel: "leadership posture",
    watchTone: "prepare response lines",
    agencies: [
      {
        agency: "General Services Administration",
        office: "Technology Transformation Services",
        movement: "+11 program teams",
        summary:
          "Same operational expansion, but now worth treating as a narrative center of gravity because procurement process language is the easiest thread for external audiences to understand and criticize.",
        models: ["GPT-5.4", "Codex", "Claude 4 Sonnet"],
        status: "elevated",
        weight: "narrative anchor",
      },
      {
        agency: "Department of Veterans Affairs",
        office: "Veterans Health Administration",
        movement: "+17 facilities",
        summary:
          "Health-adjacent usage continues to broaden. The material issue is not patient harm evidence this week; it is that override, review, and clinician-support language will receive harder scrutiny if reporters move from policy to bedside workflow examples.",
        models: ["GPT-5.3 Instant", "Claude 4 Opus"],
        status: "high",
        weight: "headline sensitive",
      },
      {
        agency: "Department of Homeland Security",
        office: "USCIS operations + fraud units",
        movement: "+3 field offices",
        summary:
          "Analyst workflow adoption is still narrow, but immigration-adjacent usage draws immediate interpretive risk. If described poorly, it will sound more autonomous than it is.",
        models: ["GPT-5.4", "Gemini 3 Pro"],
        status: "high",
        weight: "politically legible",
      },
      {
        agency: "Social Security Administration",
        office: "Appeals intake + claims support",
        movement: "new evaluation memo",
        summary:
          "No broad deployment yet, but the internal evaluation memo being circulated is unusually implementation-shaped. Worth treating as an early warning rather than a speculative line item.",
        models: ["GPT-5.3 Instant", "Claude 4 Sonnet"],
        status: "watch",
        weight: "next wave",
      },
    ],
    investigations: [
      {
        outlet: "The New York Times",
        headline: "Federal buyers are relying on AI drafting systems faster than the oversight rulebook is changing",
        heat: 89,
        note:
          "This now looks like the most likely piece to set the frame others borrow from.",
      },
      {
        outlet: "ProPublica",
        headline: "Healthcare AI vendors are understating override rates in public-sector care workflows",
        heat: 81,
        note:
          "High leverage because it can make a technical governance issue legible through patient-care language.",
      },
      {
        outlet: "Wall Street Journal",
        headline: "Corporate AI leaders are becoming de facto infrastructure vendors to government",
        heat: 68,
        note:
          "Still early, but if this line firms up it shifts the conversation from product utility to market power and accountability.",
      },
    ],
    policies: [
      {
        source: "OMB drafting language",
        shift:
          "Human-review wording is getting less aspirational and more auditable.",
        implication:
          "Any mismatch between product framing and operational reality becomes easier to spotlight.",
      },
      {
        source: "HHS advisory conversations",
        shift:
          "Clinical-adjacent AI categorization is tightening around recommendation risk.",
        implication:
          "We should assume journalists will quote the strictest interpretation, not the most charitable one.",
      },
      {
        source: "Senate staff conversations",
        shift:
          "A frontier incident-reporting concept is gaining enough specificity to matter in comms prep.",
        implication:
          "Even before law changes, the existence of a category changes how stories are framed.",
      },
    ],
    watchItems: [
      {
        title: "A single procurement story becoming the umbrella frame",
        note:
          "If one clean procurement narrative lands, other sector-specific stories will get attached to it retroactively.",
      },
      {
        title: "Healthcare language drift",
        note:
          "Monitor any phrasing that slides from documentation help toward recommendation or review automation.",
      },
      {
        title: "Leadership comms readiness",
        note:
          "Prepare one sentence each on oversight, human review, and deployment scope. Speed matters more than elegance if the cycle compresses.",
      },
      {
        title: "Model naming in public-sector contexts",
        note:
          "Current naming is legible and strong in enterprise, but more specific names create easier hooks for press narratives when attached to government use.",
      },
    ],
  },
};

function statusTone(status: string) {
  if (status === "high") return "bg-[rgba(145,37,26,0.08)] text-[#8a3528]";
  if (status === "elevated") return "bg-[rgba(174,107,36,0.10)] text-[#8d5b1f]";
  if (status === "watch") return "bg-[rgba(26,58,86,0.08)] text-[#35506b]";
  return "bg-[rgba(33,89,62,0.08)] text-[#35634d]";
}

function investigationTone(heat: number) {
  if (heat >= 85) return "text-[#7f2f24]";
  if (heat >= 75) return "text-[#8a5a20]";
  return "text-[#4f6475]";
}

export default function ComplianceDispatchPage() {
  const [mode, setMode] = useState<Mode>("baseline");
  const memo = memoStates[mode];

  const highlightedRiskPoint = useMemo(() => {
    const point = riskTrend[riskTrend.length - 2];
    return point;
  }, []);

  const averageHeat = Math.round(
    memo.investigations.reduce((sum, item) => sum + item.heat, 0) / memo.investigations.length,
  );

  return (
    <div className="min-h-screen bg-[#f5f2ea] text-[#171717] selection:bg-black selection:text-white">
      <div className="mx-auto max-w-[1380px] px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-8">
        <header className="border-b border-black/10 pb-8 sm:pb-10 lg:pb-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:gap-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-black/45">
                <span>{memo.kicker}</span>
                <span className="hidden h-1 w-1 rounded-full bg-black/25 sm:block" />
                <span>{memo.readTime}</span>
              </div>

              <div className="max-w-4xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/45">
                  The Compliance Dispatch
                </p>
                <h1 className="mt-3 max-w-5xl font-serif text-[2.65rem] leading-[0.95] tracking-[-0.04em] text-[#111111] sm:text-[4.5rem] lg:text-[5.8rem]">
                  A weekly internal read on public-sector AI adoption, scrutiny, and policy drift.
                </h1>
              </div>

              <div className="grid gap-6 border-t border-black/10 pt-6 sm:grid-cols-[minmax(0,1fr)_220px] lg:max-w-5xl lg:gap-10">
                <div className="max-w-[72ch] space-y-4">
                  <p className="text-[1.02rem] leading-8 text-black/72 sm:text-[1.06rem]">
                    {memo.summary}
                  </p>
                  <p className="max-w-[62ch] text-sm leading-7 text-black/52 sm:text-[0.96rem]">
                    {memo.leadNote}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-black/10 pt-4 text-sm sm:grid-cols-1 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/40">agency expansions</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{memo.agencies.length}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/40">mean press heat</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{averageHeat}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/40">risk drift</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">+16 pts / 6 wks</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/40">{memo.watchLabel}</p>
                    <p className="mt-2 text-base font-medium lowercase text-black/75">{memo.watchTone}</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="border-t border-black/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="space-y-5">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-black/40">
                  <span>{memo.pulseLabel}</span>
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <p className="text-balance font-serif text-[1.7rem] leading-[1.08] tracking-[-0.03em] text-[#131313] sm:text-[2rem]">
                  {memo.pulseValue}
                </p>
                <div className="flex items-center gap-3 border-t border-black/10 pt-4 text-sm text-black/55">
                  <Shield className="h-4 w-4" />
                  <span>{memo.pulseTone}</span>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <main className="space-y-14 pt-10 sm:space-y-16 sm:pt-12 lg:space-y-20 lg:pt-14">
          <section className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.28fr)] lg:gap-12">
            <div className="space-y-8">
              <div className="max-w-[70ch] space-y-3">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/40">
                  <Building2 className="h-3.5 w-3.5" />
                  agency movement
                </div>
                <h2 className="font-serif text-[2rem] leading-none tracking-[-0.035em] text-[#151515] sm:text-[2.5rem]">
                  Where AI usage actually widened this week
                </h2>
                <p className="text-[0.98rem] leading-7 text-black/60">
                  Not every expansion matters equally. The deciding variable is whether the deployment sits near a workflow that outsiders can describe in one sentence.
                </p>
              </div>

              <div className="space-y-8 border-t border-black/10 pt-2">
                {memo.agencies.map((item, index) => (
                  <article
                    key={item.agency}
                    className="grid gap-4 border-b border-black/10 py-6 last:border-b-0 sm:grid-cols-[90px_minmax(0,1fr)] sm:gap-6"
                  >
                    <div className="flex items-start justify-between gap-3 sm:block">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-black/35">0{index + 1}</span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${statusTone(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-8">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">{item.office}</p>
                          <h3 className="mt-2 text-[1.28rem] font-semibold tracking-[-0.025em] text-[#151515] sm:text-[1.42rem]">
                            {item.agency}
                          </h3>
                        </div>
                        <p className="max-w-[62ch] text-[0.98rem] leading-7 text-black/68">{item.summary}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.models.map((model) => (
                            <span
                              key={model}
                              className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-[11px] tracking-[0.08em] text-black/58"
                            >
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-4 text-sm sm:max-w-[280px] lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <div>
                          <p className="uppercase tracking-[0.18em] text-black/35">movement</p>
                          <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#171717]">{item.movement}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.18em] text-black/35">why it matters</p>
                          <p className="mt-2 leading-6 text-black/58">{item.weight}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="space-y-6 border-t border-black/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/40">
                  <Sparkles className="h-3.5 w-3.5" />
                  editorial note
                </div>
                <blockquote className="font-serif text-[1.55rem] leading-[1.18] tracking-[-0.03em] text-[#191919] sm:text-[1.8rem]">
                  “{memo.pullQuote}”
                </blockquote>
                <p className="text-[11px] uppercase tracking-[0.2em] text-black/35">{memo.quoteSource}</p>
              </div>

              <div className="rounded-[28px] border border-black/10 bg-[rgba(255,255,255,0.58)] p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/40">
                  <Waypoints className="h-3.5 w-3.5" />
                  pattern to notice
                </div>
                <p className="mt-4 text-sm leading-7 text-black/64">
                  The agencies drawing the most attention are not necessarily the biggest deployments. They are the ones easiest to explain in plain English: procurement, care workflows, and immigration-adjacent operations.
                </p>
              </div>
            </aside>
          </section>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:gap-10">
            <div className="rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0.38))] p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-[52ch]">
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/40">
                    <Radar className="h-3.5 w-3.5" />
                    risk trajectory
                  </div>
                  <h2 className="mt-3 font-serif text-[1.85rem] leading-none tracking-[-0.035em] text-[#151515] sm:text-[2.3rem]">
                    Internal risk score keeps climbing in a straight line
                  </h2>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-[2.3rem] font-semibold tracking-[-0.05em] text-[#171717]">74</span>
                  <span className="text-sm text-black/45">current composite</span>
                </div>
              </div>

              <div className="mt-6 h-[280px] w-full sm:h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrend} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#242424" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#242424" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "rgba(0,0,0,0.46)", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[52, 78]}
                      tickCount={5}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "rgba(0,0,0,0.42)", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ stroke: "rgba(0,0,0,0.12)", strokeDasharray: "4 4" }}
                      contentStyle={{
                        borderRadius: 18,
                        border: "1px solid rgba(0,0,0,0.08)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                        background: "rgba(255,255,255,0.96)",
                        color: "#111",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#1e1e1e"
                      strokeWidth={2}
                      fill="url(#riskFill)"
                      activeDot={{ r: 5, fill: "#111", stroke: "#f5f2ea", strokeWidth: 2 }}
                    />
                    <ReferenceDot
                      x={highlightedRiskPoint.week}
                      y={highlightedRiskPoint.score}
                      r={5}
                      fill="#8a3528"
                      stroke="#f5f2ea"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-4 border-t border-black/10 pt-5 sm:grid-cols-[minmax(0,1fr)_240px] sm:gap-6">
                <p className="max-w-[60ch] text-sm leading-7 text-black/62">{memo.chartNote}</p>
                <div className="rounded-[24px] border border-black/10 bg-[rgba(245,239,229,0.72)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/38">annotation</p>
                  <p className="mt-2 text-sm leading-6 text-black/68">{memo.chartHighlight}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 border-t border-black/10 pt-6 lg:pt-2">
              <div className="max-w-[40ch] space-y-3">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/40">
                  <FileSearch className="h-3.5 w-3.5" />
                  press investigations
                </div>
                <h2 className="font-serif text-[1.85rem] leading-none tracking-[-0.035em] text-[#151515] sm:text-[2.25rem]">
                  Which stories look closest to setting next week’s frame
                </h2>
              </div>

              <div className="space-y-4">
                {memo.investigations.map((item) => (
                  <article
                    key={item.headline}
                    className="rounded-[28px] border border-black/10 bg-[rgba(255,255,255,0.52)] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-black/38">{item.outlet}</p>
                        <h3 className="text-[1.14rem] font-semibold leading-7 tracking-[-0.02em] text-[#161616]">
                          {item.headline}
                        </h3>
                      </div>
                      <div className="min-w-[72px] text-right">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">heat</p>
                        <p className={`mt-1 text-[1.9rem] font-semibold tracking-[-0.05em] ${investigationTone(item.heat)}`}>
                          {item.heat}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-black/62">{item.note}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:gap-14">
            <div className="space-y-6">
              <div className="max-w-[42ch] space-y-3">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/40">
                  <Globe2 className="h-3.5 w-3.5" />
                  policy shifts
                </div>
                <h2 className="font-serif text-[1.85rem] leading-none tracking-[-0.035em] text-[#151515] sm:text-[2.25rem]">
                  Small wording changes with outsized downstream effect
                </h2>
              </div>

              <div className="space-y-5 border-t border-black/10 pt-4">
                {memo.policies.map((item) => (
                  <article key={item.source} className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
                    <p className="pt-1 text-[11px] uppercase tracking-[0.2em] text-black/35">{item.source}</p>
                    <div className="space-y-2">
                      <p className="text-[1rem] leading-7 text-black/74">{item.shift}</p>
                      <p className="text-sm leading-7 text-black/52">{item.implication}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="space-y-5 rounded-[32px] border border-black/10 bg-[#1f1f1d] p-6 text-[#f6f1e7] sm:p-7">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/55">
                <AlertTriangle className="h-3.5 w-3.5" />
                what to watch next week
              </div>
              <p className="font-serif text-[1.65rem] leading-[1.1] tracking-[-0.03em] text-white sm:text-[1.9rem]">
                The next risk move is likely narrative compression, not a new class of event.
              </p>
              <div className="space-y-3 border-t border-white/10 pt-4">
                {memo.watchItems.map((item) => (
                  <div key={item.title} className="rounded-[22px] bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <Flame className="mt-0.5 h-4 w-4 shrink-0 text-[#d7b07a]" />
                      <div>
                        <p className="text-sm font-medium text-white/92">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/62">{item.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className="border-t border-black/10 pt-8 sm:pt-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div className="max-w-[64ch]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/40">Bottom line</p>
                <p className="mt-3 font-serif text-[1.8rem] leading-[1.12] tracking-[-0.03em] text-[#151515] sm:text-[2.35rem]">
                  We do not need crisis language. We do need tighter language, faster synthesis, and a more explicit line between assistance, oversight, and operational responsibility.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-black/52">
                <ArrowRight className="h-4 w-4" />
                next brief updates Friday 7:30 AM PT
              </div>
            </div>
          </section>
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[250px] rounded-[24px] border border-black/10 bg-[rgba(255,255,255,0.92)] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-md sm:bottom-6 sm:right-6">
        <div className="px-2 pb-2 pt-1">
          <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">demo state</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("baseline")}
            className={`min-h-11 rounded-[18px] px-3 py-2 text-left transition ${
              mode === "baseline"
                ? "bg-[#1d1d1b] text-white"
                : "bg-black/[0.04] text-black/65 hover:bg-black/[0.07]"
            }`}
          >
            <span className="block text-[11px] uppercase tracking-[0.18em]">standard</span>
            <span className="mt-1 block text-sm">baseline read</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("elevated")}
            className={`min-h-11 rounded-[18px] px-3 py-2 text-left transition ${
              mode === "elevated"
                ? "bg-[#7f2f24] text-white"
                : "bg-black/[0.04] text-black/65 hover:bg-black/[0.07]"
            }`}
          >
            <span className="block text-[11px] uppercase tracking-[0.18em]">elevated</span>
            <span className="mt-1 block text-sm">tighter posture</span>
          </button>
        </div>
      </div>
    </div>
  );
}
