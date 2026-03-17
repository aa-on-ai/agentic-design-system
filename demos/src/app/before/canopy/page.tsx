"use client";

const highlights = [
  {
    title: "Hyperlocal forecasts",
    description:
      "Street-level rain, wind, and temperature predictions that update throughout the day so plans stay intact.",
  },
  {
    title: "Calm daily planning",
    description:
      "A single timeline shows when to leave, when to layer up, and when the sky is about to turn on you.",
  },
  {
    title: "Storm signals that matter",
    description:
      "Useful alerts for real weather shifts, not a constant stream of panic for every passing cloud.",
  },
  {
    title: "Designed for real life",
    description:
      "Commute, dog walk, run club, beach day, dinner outside. Canopy translates weather into decisions.",
  },
];

const metrics = [
  { label: "forecast accuracy", value: "Minute-by-minute" },
  { label: "coverage", value: "10 day outlook" },
  { label: "alerts", value: "Only when it matters" },
];

const cards = [
  {
    eyebrow: "Morning",
    title: "Know the day before it starts",
    body:
      "See sunrise light, air quality, humidity, and the exact window for your first walk, ride, or coffee run.",
  },
  {
    eyebrow: "Afternoon",
    title: "Catch the shift before the clouds do",
    body:
      "Canopy spots temperature drops, incoming wind, and short rain bursts early enough to actually change plans.",
  },
  {
    eyebrow: "Evening",
    title: "Wind down with the full picture",
    body:
      "From golden hour conditions to overnight lows, the app keeps tomorrow feeling close instead of uncertain.",
  },
];

export default function CanopyLandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(110,231,183,0.24),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.18),transparent_22%),linear-gradient(180deg,#041018_0%,#08131d_45%,#020617_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_45%)] blur-3xl" />

        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 pt-6 sm:px-8 lg:px-12">
          <header className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg shadow-[0_0_40px_rgba(74,222,128,0.18)] backdrop-blur-xl">
                ☁️
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">Canopy</p>
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/70">
                  weather that feels human
                </p>
              </div>
            </div>
            <a
              href="#cta"
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/15"
            >
              Join waitlist
            </a>
          </header>

          <div className="grid flex-1 items-center gap-16 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:py-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                launching soon for iPhone and Android
              </div>

              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[1.02]">
                The weather app that helps you feel ahead of the sky.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                Canopy turns raw forecasts into calm, useful guidance. Better timing,
                better alerts, and a clearer sense of what today actually feels like.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#cta"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-emerald-100"
                >
                  Get early access
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10"
                >
                  Explore features
                </a>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                  >
                    <p className="text-sm text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-base font-semibold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -left-16 top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute -right-10 bottom-10 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl">
                <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/80 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Venice Beach</span>
                    <span>72° · feels like 75°</span>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-6">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/70">
                        Right now
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="text-6xl">⛅</span>
                        <div>
                          <p className="text-5xl font-semibold tracking-tight">72°</p>
                          <p className="mt-1 text-slate-300">Bright, mild, ocean breeze</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">
                        rain chance
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-emerald-100">8%</p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">Today&apos;s arc</p>
                      <p className="text-sm text-slate-400">Updated 2 min ago</p>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-2">
                      {[
                        { hour: "9a", temp: 68, active: false },
                        { hour: "12p", temp: 72, active: true },
                        { hour: "3p", temp: 74, active: false },
                        { hour: "6p", temp: 70, active: false },
                        { hour: "9p", temp: 63, active: false },
                      ].map((item) => (
                        <div key={item.hour} className="flex flex-1 flex-col items-center gap-3">
                          <div
                            className={`w-full rounded-full ${
                              item.active
                                ? "bg-gradient-to-t from-emerald-300 to-sky-300"
                                : "bg-white/10"
                            }`}
                            style={{ height: `${item.temp * 1.4}px`, maxHeight: 120, minHeight: 64 }}
                          />
                          <div className="text-center">
                            <p className="text-sm font-medium text-white">{item.temp}°</p>
                            <p className="text-xs text-slate-400">{item.hour}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Best outdoor window</p>
                      <p className="mt-2 text-lg font-semibold text-white">4:30p to 7:00p</p>
                      <p className="mt-1 text-sm text-slate-300">
                        Clear skies, softer sun, light wind
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Heads up</p>
                      <p className="mt-2 text-lg font-semibold text-white">Wind picks up at 8p</p>
                      <p className="mt-1 text-sm text-slate-300">
                        Bring a layer if you&apos;re out past sunset
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">
              Why Canopy
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Forecasting, reframed around actual decisions
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Most weather apps dump data on you. Canopy edits for clarity, timing,
              and confidence so the forecast becomes usable at a glance.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item, index) => (
              <article
                key={item.title}
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-200/25 to-sky-300/20 text-lg">
                  {index === 0 ? "🌦️" : index === 1 ? "🗓️" : index === 2 ? "⚡" : "🚶"}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid gap-5 lg:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.title}
                className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-8 backdrop-blur-xl"
              >
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/70">
                  {card.eyebrow}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  {card.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-300">{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="cta" className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8 sm:px-8 lg:px-12 lg:pb-28 lg:pt-16">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(14,165,233,0.16),rgba(15,23,42,0.92))] px-6 py-10 shadow-2xl shadow-slate-950/40 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.18),transparent_28%)]" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.32em] text-emerald-100/80">
                  Early access
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Step into weather with better instincts.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-100/80">
                  Be first to try Canopy and help shape a calmer, smarter forecast
                  experience for everyday life.
                </p>
              </div>

              <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-slate-950/50 p-4 backdrop-blur-xl">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="h-12 flex-1 rounded-full border border-white/10 bg-white/10 px-5 text-sm text-white outline-none placeholder:text-slate-400 focus:border-emerald-300/40"
                  />
                  <button className="h-12 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100">
                    Request invite
                  </button>
                </div>
                <p className="mt-3 px-2 text-xs text-slate-300">
                  No spam. Just launch updates, early invites, and a forecast worth opening.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
