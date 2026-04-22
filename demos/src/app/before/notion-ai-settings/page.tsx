"use client";

const sections = [
  "General",
  "Model",
  "Integrations",
  "Output",
  "Privacy",
  "Advanced",
  "Team",
  "Billing",
  "Logs",
  "Support",
  "Account",
  "Other",
];

const rows = Array.from({ length: 18 }).map((_, index) => ({
  id: index + 1,
  label: `Setting ${index + 1}`,
  value: "Lorem ipsum",
  detail: "TBD",
}));

export default function NotionAiSettingsBeforePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 p-3 lg:grid-cols-[220px_1fr]">
        <aside className="rounded border border-slate-700 bg-slate-800 p-2">
          <p className="mb-2 text-xs text-slate-400">Settings</p>
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section}
                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-left text-xs"
              >
                {section}
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-2">
          <header className="rounded border border-slate-700 bg-slate-800 p-3">
            <h1 className="text-base font-semibold">Notion AI Settings</h1>
            <p className="text-xs text-slate-400">Configure everything here</p>
            <div className="mt-2 flex gap-2">
              <button className="rounded bg-slate-700 px-3 py-1 text-xs">Save</button>
              <button className="rounded bg-slate-700 px-3 py-1 text-xs">Submit</button>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <article key={row.id} className="rounded border border-slate-700 bg-slate-800 p-2">
                <p className="text-[10px] uppercase text-slate-500">Option</p>
                <h2 className="mt-1 text-sm font-medium">{row.label}</h2>
                <p className="mt-1 text-xs text-slate-400">{row.value}</p>
                <p className="mt-1 text-xs text-slate-500">{row.detail}</p>
                <div className="mt-2 flex gap-1">
                  <button className="rounded bg-slate-700 px-2 py-1 text-[10px]">On</button>
                  <button className="rounded bg-slate-700 px-2 py-1 text-[10px]">Off</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
