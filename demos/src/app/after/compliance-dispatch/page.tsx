"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Eye,
  FileSearch,
  Flame,
  Landmark,
  Lock,
  Radar,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Mode = "steady" | "compressed";

type AgencyMove = {
  agency: string;
  office: string;
  expansion: string;
  models: string[];
  whyNow: string;
  risk: "contained" | "watch" | "elevated" | "high";
};

type PressLine = {
  outlet: string;
  angle: string;
  heat: number;
  status: string;
  note: string;
};

type PolicyShift = {
  source: string;
  shift: string;
  implication: string;
};

type WatchItem = {
  title: string;
  note: string;
};

type DispatchState = {
  edition: string;
  kicker: string;
  dek: string;
  readTime: string;
  lead: string;
  quote: string;
  quoteSource: string;
  summaryLabel: string;
  summaryValue: string;
  summaryTone: string;
  coverline: string;
  footer: string;
  agencies: AgencyMove[];
  press: PressLine[];
  policy: PolicyShift[];
  watch: WatchItem[];
};

const riskDrift = [
  { week: "Feb 7", score: 56 },
  { week: "Feb 14", score: 58 },
  { week: "Feb 21", score: 61 },
  { week: "Feb 28", score: 63 },
  { week: "Mar 7", score: 68 },
  { week: "Mar 14", score: 74 },
];

const narrativeCompression = [
  { day: "Mon", press: 41, oversight: 46 },
  { day: "Tue", press: 47, oversight: 49 },
  { day: "Wed", press: 59, oversight: 54 },
  { day: "Thu", press: 67, oversight: 61 },
  { day: "Fri", press: 79, oversight: 73 },
];

const dispatchStates: Record<Mode, DispatchState> = {
  steady: {
    edition: "vol. 07 · fri mar 14, 2026",
    kicker: "office of the ceo · circulation limited to leadership",
    dek:
      "The Compliance Dispatch is the internal Friday read on where public-sector AI use broadened, which investigations are heating up, and where language risk is quietly moving before the headlines do.",
    readTime: "7 min read",
    lead:
      "This week did not produce a single defining event. It produced a pattern: more agencies are moving from trial usage into operational workflow, while oversight language is getting specific enough that loose product framing will start to look sloppy on contact.",
    quote:
      "The main risk is not one revelation. It is that procurement, healthcare, and immigration-adjacent usage are now easy to place in the same sentence.",
    quoteSource: "internal synthesis · policy + comms",
    summaryLabel: "friday posture",
    summaryValue: "adoption is widening faster than the narrative is settling",
    summaryTone: "measured concern",
    coverline: "Not a dashboard. A leadership read.",
    footer:
      "Bottom line: keep the language tight, keep the distinctions clear, and assume next week's stories will reward specificity more than confidence.",
    agencies: [
      {
        agency: "General Services Administration",
        office: "Technology Transformation Services",
        expansion: "+12 procurement teams",
        models: ["GPT-5.4", "Codex", "o4-mini"],
        whyNow:
          "AI-assisted acquisition drafting expanded from experimentation into early workflow infrastructure. The political risk is low until someone explains it plainly, which reporters now can.",
        risk: "watch",
      },
      {
        agency: "Department of Veterans Affairs",
        office: "Veterans Health Administration",
        expansion: "+19 facilities",
        models: ["GPT-5.3 Instant", "Claude 4 Opus"],
        whyNow:
          "Ambient documentation and post-visit summarization widened again. Public language still calls this support tooling, but the operational shape is becoming more legible than the messaging is.",
        risk: "elevated",
      },
      {
        agency: "Department of Homeland Security",
        office: "USCIS operations + fraud units",
        expansion: "+3 field offices",
        models: ["GPT-5.4 Thinking", "Gemini 3 Pro"],
        whyNow:
          "Case triage and summarization moved beyond sandbox usage into live analyst flows. The issue is less accuracy this week than interpretive risk if this gets described as autonomous adjudication.",
        risk: "high",
      },
      {
        agency: "Social Security Administration",
        office: "Appeals intake + claims support",
        expansion: "new implementation memo",
        models: ["o3", "Claude 4 Sonnet"],
        whyNow:
          "Still pre-rollout, but the memo reads like a deployment bridge rather than an evaluation note. Worth treating as a near-term expansion candidate.",
        risk: "watch",
      },
    ],
    press: [
      {
        outlet: "The New York Times",
        angle: "Federal buyers are relying on AI drafting faster than procurement controls are updating",
        heat: 86,
        status: "document-backed",
        note:
          "Multiple sourcing paths suggest this has moved beyond exploratory reporting. If it lands first, it becomes the umbrella frame others borrow.",
      },
      {
        outlet: "ProPublica",
        angle: "Public-sector healthcare AI vendors are understating override rates and review burden",
        heat: 78,
        status: "active interviews",
        note:
          "High leverage because it turns a governance issue into a care-delivery story. Expect sharper attention on what counts as recommendation versus summarization.",
      },
      {
        outlet: "Wall Street Journal",
        angle: "Frontier model vendors are becoming de facto infrastructure vendors to government",
        heat: 65,
        status: "early framing",
        note:
          "Still less mature, but strategically important because it shifts the conversation from utility to concentration and accountability.",
      },
    ],
    policy: [
      {
        source: "OMB draft language",
        shift:
          "Human-review wording is getting more auditable in procurement and adjudication-adjacent workflows.",
        implication:
          "This helps on principle, but it raises the cost of describing supervised systems casually as automation.",
      },
      {
        source: "HHS advisory conversations",
        shift:
          "Clinical-adjacent summarization is being separated more explicitly from anything that looks like recommendation support.",
        implication:
          "Marketing shortcuts will create downstream cleanup if deployed language outruns the control surface.",
      },
      {
        source: "GAO oversight briefings",
        shift:
          "Auditability and record retention are becoming central rather than peripheral asks.",
        implication:
          "A system can perform well and still create a governance story if its review trail feels incomplete or improvised.",
      },
    ],
    watch: [
      {
        title: "Procurement becomes the public frame",
        note:
          "If one procurement story lands cleanly, healthcare and immigration-adjacent examples will get attached to it retroactively.",
      },
      {
        title: "Model naming enters coverage",
        note:
          "Specific names like GPT-5.4 or o4-mini make stories easier to headline than generic references to AI tooling.",
      },
      {
        title: "FedRAMP language hardens",
        note:
          "Watch any movement that turns security posture questions into deployment gate questions.",
      },
      {
        title: "CMS spillover",
        note:
          "If payer or reimbursement language starts appearing beside provider workflow coverage, the tone will harden quickly.",
      },
    ],
  },
  compressed: {
    edition: "vol. 07 · fri mar 14, 2026 · elevated",
    kicker: "office of the ceo · elevated watch · circulation limited to leadership",
    dek:
      "Same reporting surface, tighter posture. Use this mode when two manageable threads begin to rhyme and leadership needs the short version fast.",
    readTime: "7 min read",
    lead:
      "Exposure remains manageable, but the ingredients for a compressed news cycle are now present: agencies are operationalizing faster than the oversight language has settled, and reporters have enough concrete sourcing to collapse separate issues into one broader claim.",
    quote:
      "The dangerous version of next week is correlation. Procurement scrutiny, healthcare concern, and frontier-model naming all showing up in the same story.",
    quoteSource: "internal synthesis · elevated posture",
    summaryLabel: "leadership posture",
    summaryValue: "separate stories are starting to read like a single governance narrative",
    summaryTone: "prepare response lines",
    coverline: "Shorter runway. Same facts.",
    footer:
      "Bottom line: do not overreact in public. Do become painfully precise in private about assistance, human review, audit trails, and deployment scope.",
    agencies: [
      {
        agency: "General Services Administration",
        office: "Technology Transformation Services",
        expansion: "+12 procurement teams",
        models: ["GPT-5.4", "Codex", "o4-mini"],
        whyNow:
          "This becomes the narrative anchor because procurement language is easy to understand and easy to criticize. It does not need to be the largest deployment to become the defining one.",
        risk: "elevated",
      },
      {
        agency: "Department of Veterans Affairs",
        office: "Veterans Health Administration",
        expansion: "+19 facilities",
        models: ["GPT-5.3 Instant", "Claude 4 Opus"],
        whyNow:
          "Health-adjacent usage remains headline-sensitive even without evidence of immediate harm. Override rates and review burden are the pressure points to watch.",
        risk: "high",
      },
      {
        agency: "Department of Homeland Security",
        office: "USCIS operations + fraud units",
        expansion: "+3 field offices",
        models: ["GPT-5.4 Thinking", "Gemini 3 Pro"],
        whyNow:
          "Immigration-linked workflows compress nuance instantly. Any ambiguity about ranking, triage, or recommendation will read as more autonomous than it is.",
        risk: "high",
      },
      {
        agency: "Centers for Medicare & Medicaid Services",
        office: "program integrity + contact center ops",
        expansion: "new vendor discovery",
        models: ["o3", "Llama 4 405B"],
        whyNow:
          "Not a broad deployment yet, but interest here would make healthcare oversight feel systemic rather than isolated.",
        risk: "watch",
      },
    ],
    press: [
      {
        outlet: "The New York Times",
        angle: "Federal procurement is becoming the cleanest narrative through-line",
        heat: 91,
        status: "near publication",
        note:
          "Assume this can set vocabulary for the rest of the cycle. If it publishes, others will write into its frame rather than invent their own.",
      },
      {
        outlet: "ProPublica",
        angle: "Healthcare reporting is increasingly centered on review burden and override behavior",
        heat: 83,
        status: "high leverage",
        note:
          "This is the line most likely to make model governance legible to a broad audience without needing technical explanation.",
      },
      {
        outlet: "Financial Times",
        angle: "European regulators are probing whether US public-sector AI controls are materially auditable",
        heat: 69,
        status: "internationalizing",
        note:
          "Less likely to start the story, more likely to expand it once domestic coverage exists.",
      },
    ],
    policy: [
      {
        source: "OMB draft language",
        shift:
          "Review requirements are moving from aspirational wording toward testable obligations.",
        implication:
          "Any mismatch between product framing and operational reality becomes easier to spotlight in plain English.",
      },
      {
        source: "HHS advisory conversations",
        shift:
          "Clinical-adjacent tooling is being categorized more aggressively around recommendation risk.",
        implication:
          "Expect journalists to quote the strictest available interpretation, not the most charitable one.",
      },
      {
        source: "Senate staff working group",
        shift:
          "Incident reporting concepts for frontier deployments are gaining enough specificity to shape the discourse before law changes.",
        implication:
          "Even a draft category changes how reporters frame accountability and oversight.",
      },
    ],
    watch: [
      {
        title: "A single umbrella story",
        note:
          "If procurement lands first, expect all later examples to be narrated as proof of earlier overreach.",
      },
      {
        title: "Language drift from support to decision-making",
        note:
          "The fastest way for a manageable workflow to become a reputational issue is bad shorthand.",
      },
      {
        title: "Government buyers price-anchor against open-weight options",
        note:
          "Budget pressure remains secondary this week, but procurement teams notice substitute narratives quickly.",
      },
      {
        title: "Leadership comms readiness",
        note:
          "Have one clean sentence each on oversight, auditability, model scope, and human review. Speed will matter more than rhetoric.",
      },
    ],
  },
};

function riskTone(risk: AgencyMove["risk"]) {
  if (risk === "high") return "bg-[#6e2f27] text-[#f7ede8]";
  if (risk === "elevated") return "bg-[#9b6a2a] text-[#fff7ea]";
  if (risk === "watch") return "bg-[#dfe7ea] text-[#31434d]";
  return "bg-[#dbe8df] text-[#2b4b3c]";
}

function heatTone(heat: number) {
  if (heat >= 88) return "text-[#7b3026]";
  if (heat >= 76) return "text-[#946124]";
  return "text-[#52616c]";
}

function DispatchToggle({ mode, setMode }: { mode: Mode; setMode: (value: Mode) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[280px] rounded-[26px] border border-black/10 bg-[rgba(250,247,241,0.9)] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.14)] backdrop-blur-md sm:bottom-6 sm:right-6">
      <div className="px-2 pb-2 pt-1">
        <p className="text-[10px] uppercase tracking-[0.26em] text-black/40">briefing state</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("steady")}
          className={`min-h-11 rounded-[18px] px-3 py-2 text-left transition ${
            mode === "steady"
              ? "bg-[#181816] text-white"
              : "bg-black/[0.04] text-black/65 hover:bg-black/[0.07]"
          }`}
        >
          <span className="block text-[11px] uppercase tracking-[0.18em]">standard</span>
          <span className="mt-1 block text-sm">steady read</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("compressed")}
          className={`min-h-11 rounded-[18px] px-3 py-2 text-left transition ${
            mode === "compressed"
              ? "bg-[#6e2f27] text-white"
              : "bg-black/[0.04] text-black/65 hover:bg-black/[0.07]"
          }`}
        >
          <span className="block text-[11px] uppercase tracking-[0.18em]">elevated</span>
          <span className="mt-1 block text-sm">compressed cycle</span>
        </button>
      </div>
    </div>
  );
}

export default function ComplianceDispatchPage() {
  const [mode, setMode] = useState<Mode>("steady");
  const dispatch = dispatchStates[mode];

  const averageHeat = Math.round(
    dispatch.press.reduce((sum, item) => sum + item.heat, 0) / dispatch.press.length,
  );

  const highlightedPoint = useMemo(() => riskDrift[riskDrift.length - 2], []);

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-[#141413] selection:bg-[#161513] selection:text-[#f8f4ee]">
      <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <header className="border-b border-black/10 pb-10 sm:pb-12 lg:pb-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] lg:gap-12">
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-black/42">
                <span>{dispatch.kicker}</span>
                <span className="hidden h-1 w-1 rounded-full bg-black/20 sm:block" />
                <span>{dispatch.edition}</span>
                <span className="hidden h-1 w-1 rounded-full bg-black/20 sm:block" />
                <span>{dispatch.readTime}</span>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_160px] lg:items-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-black/44">The Compliance Dispatch</p>
                  <h1 className="mt-3 max-w-5xl font-serif text-[2.8rem] leading-[0.94] tracking-[-0.05em] text-[#121212] sm:text-[4.4rem] lg:text-[6.15rem]">
                    sam altman&apos;s weekly internal read on where government AI got bigger, riskier, and easier to explain.
                  </h1>
                </div>
                <div className="hidden self-end text-right lg:block">
                  <p className="text-[11px] uppercase tracking-[0.26em] text-black/34">cover line</p>
                  <p className="mt-2 text-sm leading-6 text-black/58">{dispatch.coverline}</p>
                </div>
              </div>

              <div className="grid gap-6 border-t border-black/10 pt-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">
                <div className="max-w-[74ch] space-y-4">
                  <p className="text-base leading-8 text-black/74 sm:text-[1.03rem]">{dispatch.dek}</p>
                  <p className="text-[0.98rem] leading-8 text-black/62">{dispatch.lead}</p>
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-black/10 pt-4 text-sm sm:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/38">agency expansions</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{dispatch.agencies.length}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/38">press heat</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{averageHeat}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/38">risk drift</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">+18 / 6 wks</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/38">signal</p>
                    <p className="mt-2 text-sm leading-6 text-black/60">multiple stories, one frame</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="border-t border-black/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="space-y-5">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-black/38">
                  <span>{dispatch.summaryLabel}</span>
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <p className="font-serif text-[1.8rem] leading-[1.06] tracking-[-0.035em] text-[#181817] sm:text-[2.1rem]">
                  {dispatch.summaryValue}
                </p>
                <div className="flex items-center gap-3 border-t border-black/10 pt-4 text-sm text-black/56">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{dispatch.summaryTone}</span>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <main className="space-y-12 pt-8 sm:space-y-16 sm:pt-10 lg:space-y-24 lg:pt-14">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.28fr)] lg:gap-12">
            <div className="space-y-7">
              <div className="max-w-[70ch] space-y-3">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/40">
                  <Landmark className="h-3.5 w-3.5" />
                  this week&apos;s expansion map
                </div>
                <h2 className="font-serif text-[2rem] leading-none tracking-[-0.04em] sm:text-[2.8rem]">
                  Which agencies expanded AI usage, and which ones now read like next week&apos;s examples
                </h2>
                <p className="text-[0.98rem] leading-7 text-black/58">
                  Real risk isn&apos;t evenly distributed. The programs that matter are the ones an outsider can explain in one sentence without losing the plot.
                </p>
              </div>

              <div className="space-y-0 border-t border-black/10">
                {dispatch.agencies.map((item, index) => (
                  <article
                    key={item.agency}
                    className="grid gap-4 border-b border-black/10 py-6 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-6 lg:py-7"
                  >
                    <div className="flex items-start justify-between gap-3 sm:block">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-black/34">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${riskTone(item.risk)}`}>
                        {item.risk}
                      </span>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-8">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-black/36">{item.office}</p>
                          <h3 className="mt-2 text-[1.24rem] font-semibold tracking-[-0.025em] sm:text-[1.42rem]">
                            {item.agency}
                          </h3>
                        </div>
                        <p className="max-w-[62ch] text-[0.98rem] leading-7 text-black/68">{item.whyNow}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.models.map((model) => (
                            <span
                              key={model}
                              className="rounded-full border border-black/10 bg-white/55 px-3 py-1 text-[11px] tracking-[0.08em] text-black/58"
                            >
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-4 text-sm sm:max-w-[280px] lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <div>
                          <p className="uppercase tracking-[0.18em] text-black/36">expansion</p>
                          <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#171716]">{item.expansion}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.18em] text-black/36">watch for</p>
                          <p className="mt-2 leading-6 text-black/58">
                            {item.risk === "high"
                              ? "headline translation"
                              : item.risk === "elevated"
                                ? "workflow legibility"
                                : item.risk === "watch"
                                  ? "quiet scope creep"
                                  : "bounded experimentation"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="space-y-6 lg:pt-10">
              <div className="rounded-[28px] bg-[#171715] p-6 text-[#f6f1e8] sm:p-7">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/55">
                  <Sparkles className="h-3.5 w-3.5" />
                  editorial read
                </div>
                <blockquote className="mt-5 font-serif text-[1.55rem] leading-[1.14] tracking-[-0.035em] text-white sm:text-[1.88rem]">
                  “{dispatch.quote}”
                </blockquote>
                <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/40">{dispatch.quoteSource}</p>
              </div>

              <div className="rounded-[28px] border border-black/10 bg-white/50 p-5 sm:p-6">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/38">
                  <Eye className="h-3.5 w-3.5" />
                  context pass
                </div>
                <p className="mt-4 text-sm leading-7 text-black/66">
                  This should feel like OpenAI&apos;s actual product surface translated into an internal memo: restrained, neutral, sparse, high-trust. The humor stays in the subtext and the data. The interface stays dead serious.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    "OMB",
                    "GAO",
                    "GSA",
                    "HHS",
                    "USCIS",
                    "FedRAMP",
                    "GPT-5.4",
                    "o3",
                    "o4-mini",
                    "Sora 2",
                  ].map((term) => (
                    <span
                      key={term}
                      className="rounded-full bg-black/[0.05] px-3 py-1 text-[11px] tracking-[0.08em] text-black/56"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          <section className="-mx-4 bg-[#ece4d6] px-4 py-8 sm:-mx-6 sm:px-6 sm:py-10 lg:-mx-8 lg:px-8 lg:py-12">
            <div className="mx-auto max-w-[1440px]">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end lg:gap-12">
                <div>
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/38">
                    <Radar className="h-3.5 w-3.5" />
                    risk score changes
                  </div>
                  <h2 className="mt-3 max-w-[11ch] font-serif text-[2.1rem] leading-[0.96] tracking-[-0.045em] sm:text-[3rem] lg:text-[3.6rem]">
                    Six weeks of drift, and none of it looks accidental anymore.
                  </h2>
                </div>
                <p className="max-w-[54ch] text-[0.98rem] leading-7 text-black/62">
                  The sharpest movement starts when procurement scrutiny and clinical-adjacent deployment show up in the same internal conversations. That is where ordinary activity becomes a narrative.
                </p>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-8">
                <div className="rounded-[32px] border border-black/10 bg-[rgba(255,255,255,0.62)] p-5 sm:p-7">
                  <div className="flex flex-col gap-3 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-black/38">composite leadership score</p>
                      <p className="mt-2 text-[2.6rem] font-semibold tracking-[-0.06em] text-[#151513]">74</p>
                    </div>
                    <p className="max-w-[28ch] text-sm leading-6 text-black/54">
                      Annotated against the first week procurement risk and care-workflow risk began reinforcing each other.
                    </p>
                  </div>

                  <div className="mt-6 h-[270px] w-full sm:h-[330px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={riskDrift} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dispatchRiskFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#23211e" stopOpacity={0.22} />
                            <stop offset="100%" stopColor="#23211e" stopOpacity={0.04} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
                        <XAxis
                          dataKey="week"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "rgba(0,0,0,0.45)", fontSize: 12 }}
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
                          stroke="#1d1c1a"
                          strokeWidth={2}
                          fill="url(#dispatchRiskFill)"
                          activeDot={{ r: 5, fill: "#151513", stroke: "#f6f1e8", strokeWidth: 2 }}
                        />
                        <ReferenceDot
                          x={highlightedPoint.week}
                          y={highlightedPoint.score}
                          r={5}
                          fill="#7b3026"
                          stroke="#f6f1e8"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="rounded-[32px] bg-[#1b1a18] p-5 text-[#f6f1e8] sm:p-6">
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/48">
                      <FileSearch className="h-3.5 w-3.5" />
                      narrative compression index
                    </div>
                    <div className="mt-4 h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={narrativeCompression} margin={{ top: 10, right: 2, left: -18, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                          />
                          <YAxis hide domain={[30, 85]} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 18,
                              border: "1px solid rgba(255,255,255,0.08)",
                              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                              background: "rgba(24,23,21,0.96)",
                              color: "#f6f1e8",
                            }}
                          />
                          <Line type="monotone" dataKey="press" stroke="#e6c38b" strokeWidth={2.2} dot={false} />
                          <Line type="monotone" dataKey="oversight" stroke="#b9c7d4" strokeWidth={2.2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center gap-5 text-xs text-white/58">
                      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e6c38b]" /> press</span>
                      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#b9c7d4]" /> oversight</span>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-black/10 bg-white/55 p-5 sm:p-6">
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/38">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      annotation
                    </div>
                    <p className="mt-4 font-serif text-[1.35rem] leading-[1.14] tracking-[-0.03em] text-[#171614]">
                      The new problem is not that the facts changed. It&apos;s that the facts now snap together faster.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-[minmax(0,0.64fr)_minmax(320px,0.36fr)] lg:gap-14">
            <div className="space-y-6">
              <div className="max-w-[62ch] space-y-3">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/40">
                  <Building2 className="h-3.5 w-3.5" />
                  press investigations
                </div>
                <h2 className="font-serif text-[2rem] leading-none tracking-[-0.04em] sm:text-[2.7rem]">
                  Which reporting lines are closest to defining next week&apos;s frame
                </h2>
              </div>

              <div className="space-y-4">
                {dispatch.press.map((item) => (
                  <article
                    key={item.angle}
                    className="rounded-[28px] border border-black/10 bg-[rgba(255,255,255,0.52)] p-5 sm:p-6"
                  >
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_88px] sm:gap-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/36">
                          <span>{item.outlet}</span>
                          <span className="h-1 w-1 rounded-full bg-black/20" />
                          <span>{item.status}</span>
                        </div>
                        <h3 className="mt-3 text-[1.2rem] font-semibold leading-7 tracking-[-0.02em] text-[#171715] sm:text-[1.34rem]">
                          {item.angle}
                        </h3>
                        <p className="mt-4 text-sm leading-7 text-black/62">{item.note}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/34">heat</p>
                        <p className={`mt-2 text-[2.15rem] font-semibold tracking-[-0.06em] ${heatTone(item.heat)}`}>
                          {item.heat}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="space-y-6 lg:pt-16">
              <div className="rounded-[30px] border border-black/10 bg-[#f1ebe0] p-6 sm:p-7">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-black/40">
                  <Scale className="h-3.5 w-3.5" />
                  policy shifts
                </div>
                <div className="mt-5 space-y-5">
                  {dispatch.policy.map((item) => (
                    <div key={item.source} className="border-b border-black/10 pb-5 last:border-b-0 last:pb-0">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-black/34">{item.source}</p>
                      <p className="mt-3 text-[1rem] leading-7 text-black/74">{item.shift}</p>
                      <p className="mt-2 text-sm leading-7 text-black/56">{item.implication}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-black/10 bg-white/46 p-6">
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">internal note</p>
                <p className="mt-4 text-sm leading-7 text-black/64">
                  OpenAI tone here should stay measured and executive. If the page feels clever on first glance, it&apos;s wrong. If it feels sharp on second read, it&apos;s working.
                </p>
              </div>
            </aside>
          </section>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.72fr)] lg:gap-12">
            <div className="rounded-[34px] bg-[#191816] p-6 text-[#f6f1e8] sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(280px,0.18fr)] lg:items-start">
                <div>
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/50">
                    <Flame className="h-3.5 w-3.5" />
                    what to watch next week
                  </div>
                  <h2 className="mt-4 max-w-[13ch] font-serif text-[2rem] leading-[0.98] tracking-[-0.04em] text-white sm:text-[2.75rem] lg:text-[3.2rem]">
                    The next move is probably narrative compression, not a new class of event.
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/58 lg:justify-end">
                  <ArrowUpRight className="h-4 w-4" />
                  monday prep begins 6:30 am pt
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {dispatch.watch.map((item) => (
                  <article key={item.title} className="rounded-[24px] bg-white/6 p-5">
                    <p className="text-sm font-medium text-white/94">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-white/64">{item.note}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="self-end border-t border-black/10 pt-6 lg:pb-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">bottom line</p>
              <p className="mt-4 font-serif text-[1.8rem] leading-[1.1] tracking-[-0.035em] text-[#171614] sm:text-[2.35rem]">
                {dispatch.footer}
              </p>
            </div>
          </section>
        </main>
      </div>

      <DispatchToggle mode={mode} setMode={setMode} />
    </div>
  );
}
