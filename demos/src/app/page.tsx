import Link from "next/link";

const demos = [
  {
    name: "Moltbook Admin",
    type: "Dashboard",
    desc: "Meta's internal moderation panel for an AI agent social network.",
    before: "/before/moltbook-admin",
    after: "/after/moltbook-admin",
  },
  {
    name: "Model Tuning Console",
    type: "Form / Wizard",
    desc: "Anthropic's internal tool for configuring model personality before deployment.",
    before: "/before/model-tuning",
    after: "/after/model-tuning",
  },
  {
    name: "The Compliance Dispatch",
    type: "Editorial",
    desc: "Sam Altman's weekly internal briefing on government AI deployments.",
    before: "/before/compliance-dispatch",
    after: "/after/compliance-dispatch",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        agentic design system
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        before = agent output without any design system.
        <br />
        after = same prompt with the{" "}
        <a
          href="https://github.com/aa-on-ai/agentic-design-system"
          className="underline hover:text-neutral-900 transition-colors"
        >
          agentic design system
        </a>{" "}
        loaded.
      </p>

      <div className="mt-12 space-y-8">
        {demos.map((demo) => (
          <div
            key={demo.name}
            className="border-t border-neutral-200 pt-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-medium text-neutral-900">
                {demo.name}
              </h2>
              <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                {demo.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">{demo.desc}</p>
            <div className="mt-3 flex gap-4">
              <Link
                href={demo.before}
                className="text-sm font-medium text-neutral-400 underline underline-offset-2 hover:text-neutral-900 transition-colors"
              >
                before →
              </Link>
              <Link
                href={demo.after}
                className="text-sm font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600 transition-colors"
              >
                after →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-neutral-200 pt-6 text-xs text-neutral-400">
        3 UI types · 3 company aesthetics · 1 design system ·{" "}
        <a
          href="https://github.com/aa-on-ai/agentic-design-system"
          className="underline hover:text-neutral-600"
        >
          view source
        </a>
      </div>
    </main>
  );
}
