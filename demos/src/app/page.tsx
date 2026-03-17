import Link from "next/link";

const tests = [
  {
    name: "Canopy",
    type: "Landing Page",
    prompt: "build a landing page for a new weather app called Canopy",
    desc: "No brand to reference. Tests whether core pack improves defaults without fighting product-appropriate aesthetics.",
    before: "/before/canopy",
    after: "/after/canopy",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        agentic design system — tests
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        real tests, not staged demos. same model (GPT-5.4), same prompt, different context.
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        before = no skills loaded. after = core pack only (design-review, ux-baseline-check, ui-polish-pass).
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
            <p className="mt-2 rounded bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-600">
              &ldquo;{test.prompt}&rdquo;
            </p>
            <p className="mt-2 text-sm text-neutral-500">{test.desc}</p>
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
