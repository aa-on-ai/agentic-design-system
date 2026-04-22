"use client";

const stats = [
  { label: "Total Walks", value: "124" },
  { label: "Active Dogs", value: "39" },
  { label: "Upcoming", value: "17" },
  { label: "Issues", value: "3" },
];

const cards = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Card ${i + 1}`,
  subtitle: "Lorem ipsum dolor sit amet",
  status: i % 2 === 0 ? "Active" : "Pending",
}));

export default function PawprintBeforePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl p-3">
        <header className="mb-3 rounded border border-slate-700 bg-slate-800 p-3">
          <h1 className="text-lg font-semibold">Pawprint Dashboard</h1>
          <p className="text-xs text-slate-400">Manage your service</p>
          <div className="mt-2 flex gap-2">
            <button className="rounded bg-slate-700 px-3 py-1 text-xs">Submit</button>
            <button className="rounded bg-slate-700 px-3 py-1 text-xs">Click here</button>
          </div>
        </header>

        <section className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded border border-slate-700 bg-slate-800 p-2">
              <p className="text-[10px] text-slate-400">{stat.label}</p>
              <p className="text-sm font-bold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {cards.map((card) => (
            <article key={card.id} className="rounded border border-slate-700 bg-slate-800 p-2">
              <p className="text-[10px] uppercase text-slate-500">{card.status}</p>
              <h2 className="mt-1 text-sm font-medium">{card.title}</h2>
              <p className="mt-1 text-xs text-slate-400">{card.subtitle}</p>
              <div className="mt-2 space-y-1 text-[10px] text-slate-500">
                <p>Owner: Placeholder Name</p>
                <p>Time: TBD</p>
                <p>Notes: Add details here</p>
              </div>
              <button className="mt-2 w-full rounded bg-slate-700 px-2 py-1 text-xs">Submit</button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
