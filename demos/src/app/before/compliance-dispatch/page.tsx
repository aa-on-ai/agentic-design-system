"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Building2,
  FileSearch,
  Globe,
  Radar,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

const agencyExpansions = [
  {
    agency: "Department of Veterans Affairs",
    useCase: "Expanded clinical documentation pilots with ambient AI tools across additional regional networks.",
    models: ["GPT-4.1", "Claude 3.7 Sonnet"],
    delta: "+14 facilities",
    risk: "medium",
  },
  {
    agency: "U.S. Department of Defense",
    useCase: "Broadened internal analyst workflows using secure retrieval and summarization for logistics planning.",
    models: ["Llama 3.3 70B", "Gemini 2.0 Flash"],
    delta: "+3 program offices",
    risk: "high",
  },
  {
    agency: "Internal Revenue Service",
    useCase: "Added taxpayer correspondence triage support in a limited back-office deployment.",
    models: ["GPT-4o", "Command R+"],
    delta: "+1 national pilot",
    risk: "medium",
  },
  {
    agency: "Centers for Medicare & Medicaid Services",
    useCase: "Scaled prior authorization review assistance with AI-generated evidence summaries.",
    models: ["Claude 3.5 Sonnet", "MedLM"],
    delta: "+2 contractor teams",
    risk: "high",
  },
];

const investigations = [
  {
    outlet: "The Washington Post",
    headline: "Procurement shortcuts in federal AI contracting are drawing fresh scrutiny",
    heat: 82,
    note: "Multiple FOIA-based follow-ups suggest a second wave piece could land next week.",
  },
  {
    outlet: "ProPublica",
    headline: "Hospital automation vendors under-report override rates in AI-assisted care flows",
    heat: 76,
    note: "Reporter requests have expanded from health systems to model vendors and safety reviewers.",
  },
  {
    outlet: "Financial Times",
    headline: "European regulators press U.S. model providers over public-sector fine-tuning controls",
    heat: 68,
    note: "Still forming, but sources indicate concern about downstream auditability claims.",
  },
];

const riskChanges = [
  {
    area: "Public sector deployment optics",
    from: 6.2,
    to: 7.1,
    driver: "Procurement visibility rising faster than safeguards messaging",
  },
  {
    area: "Healthcare compliance exposure",
    from: 7.4,
    to: 8.0,
    driver: "Increased use in utilization review and clinical note generation",
  },
  {
    area: "International policy spillover",
    from: 5.1,
    to: 6.3,
    driver: "EU and UK agency coordination becoming more explicit",
  },
  {
    area: "Foundation model competitive pressure",
    from: 8.3,
    to: 8.6,
    driver: "Gemini and open-weight options are entering previously sticky enterprise accounts",
  },
];

const policyShifts = [
  "OMB staff circulated updated language emphasizing human-review requirements for high-impact AI decisions in procurement drafts.",
  "The UK DSIT signaled tighter disclosure expectations for model providers serving public sector workflows.",
  "A bipartisan Senate staff working group is testing language that would require incident reporting for certain frontier model deployments.",
  "HHS advisors are pushing vendors to distinguish clearly between summarization support and clinical recommendation features.",
];

const watchItems = [
  "Whether DoD expands secure enclave pilots into intelligence-adjacent workflows before a clear external narrative is ready.",
  "If NYT or WSJ joins the procurement scrutiny cycle, which would materially raise board-level attention.",
  "Any signal that CMS deployments are being framed publicly as cost containment rather than clinician support.",
  "How quickly GPT-4.1-class systems are displaced by cheaper frontier-adjacent alternatives in regulated environments.",
];

function riskColor(risk: string) {
  if (risk === "high") return "bg-red-100 text-red-700 border-red-200";
  if (risk === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export default function ComplianceDispatchPage() {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-8 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                <ShieldAlert className="h-3.5 w-3.5" />
                internal friday briefing
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 lg:text-6xl">
                The Compliance Dispatch
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 lg:text-base">
                Weekly note for OpenAI leadership on public-sector AI adoption, media risk,
                policy movement, and competitive pressure. Compiled for rapid Friday scan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[420px]">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">week ending</p>
                <p className="mt-2 text-lg font-semibold">Mar 14</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">agency expansions</p>
                <p className="mt-2 text-lg font-semibold">4</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">avg risk drift</p>
                <p className="mt-2 text-lg font-semibold">+0.75</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">press heat</p>
                <p className="mt-2 text-lg font-semibold">rising</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Building2 className="h-5 w-5 text-zinc-500" />
                <div>
                  <h2 className="text-xl font-semibold">Agency expansion tracker</h2>
                  <p className="text-sm text-zinc-500">Who expanded AI usage this week and where exposure is concentrating.</p>
                </div>
              </div>

              <div className="space-y-4">
                {agencyExpansions.map((item) => (
                  <div key={item.agency} className="rounded-2xl border border-zinc-200 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-zinc-950">{item.agency}</h3>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${riskColor(item.risk)}`}>
                            {item.risk} risk
                          </span>
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{item.useCase}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.models.map((model) => (
                            <span key={model} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">deployment change</p>
                        <p className="mt-2 text-lg font-semibold">{item.delta}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <FileSearch className="h-5 w-5 text-zinc-500" />
                <div>
                  <h2 className="text-xl font-semibold">Press investigations heating up</h2>
                  <p className="text-sm text-zinc-500">Journalism signals worth watching before the narrative locks in.</p>
                </div>
              </div>

              <div className="space-y-4">
                {investigations.map((item) => (
                  <div key={item.headline} className="rounded-2xl border border-zinc-200 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">{item.outlet}</p>
                        <h3 className="mt-2 text-lg font-semibold text-zinc-950">{item.headline}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{item.note}</p>
                      </div>
                      <div className="min-w-20 rounded-2xl bg-red-50 px-4 py-3 text-center text-red-700">
                        <p className="text-xs uppercase tracking-wide">heat</p>
                        <p className="mt-1 text-2xl font-semibold">{item.heat}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-zinc-500" />
                <div>
                  <h2 className="text-xl font-semibold">Risk score changes</h2>
                  <p className="text-sm text-zinc-500">Internal directional view across major exposure surfaces.</p>
                </div>
              </div>

              <div className="space-y-3">
                {riskChanges.map((item) => (
                  <div key={item.area} className="rounded-2xl bg-zinc-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-zinc-900">{item.area}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{item.driver}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm">
                        {item.from}
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                        {item.to}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Globe className="h-5 w-5 text-zinc-500" />
                <div>
                  <h2 className="text-xl font-semibold">Policy shifts</h2>
                  <p className="text-sm text-zinc-500">Signals from regulators, staffers, and procurement language.</p>
                </div>
              </div>

              <div className="space-y-3">
                {policyShifts.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-zinc-200 p-4">
                    <Bot className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <p className="text-sm leading-6 text-zinc-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Radar className="h-5 w-5 text-zinc-500" />
                <div>
                  <h2 className="text-xl font-semibold">What to watch</h2>
                  <p className="text-sm text-zinc-500">Short-list items that could move executive attention fast.</p>
                </div>
              </div>

              <div className="space-y-3">
                {watchItems.map((item) => (
                  <div key={item} className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                    <div className="flex gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                      <p>{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
