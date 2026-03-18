import Link from "next/link";

const tests = [
  {
    name: "Canopy",
    type: "Landing Page",
    prompt: "build a landing page for a new weather app called Canopy",
    desc: "Same model (GPT-5.4), same prompt. Before = no skills. After = core pack only.",
    before: "/before/canopy",
    after: "/after/canopy",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        agentic design system
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        real A/B tests, not staged demos. same model, same prompt, one without
        skills, one with the{" "}
        <a
          href="https://github.com/aa-on-ai/agentic-design-system"
          className="underline hover:text-neutral-900 transition-colors"
        >
          agentic design system
        </a>{" "}
        loaded.
      </p>

      <div className="mt-12 space-y-8">
        {tests.map((test) => (
          <div key={test.name} className="border-t border-neutral-200 pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-medium text-neutral-900">
                {test.name}
              </h2>
              <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                {test.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500 italic">
              &ldquo;{test.prompt}&rdquo;
            </p>
            <p className="mt-1 text-xs text-neutral-400">{test.desc}</p>
            <div className="mt-3 flex gap-4">
              <Link
                href={test.before}
                className="text-sm font-medium text-neutral-400 underline underline-offset-2 hover:text-neutral-900 transition-colors"
              >
                before →
              </Link>
              <Link
                href={test.after}
                className="text-sm font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600 transition-colors"
              >
                after →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-neutral-200 pt-6 text-xs text-neutral-400">
        more tests coming ·{" "}
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
