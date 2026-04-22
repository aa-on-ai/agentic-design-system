'use client'

export default function CanopyLandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(34,197,94,0.14),_transparent_25%),linear-gradient(to_bottom,_#020617,_#0f172a)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/20 ring-1 ring-emerald-300/20 backdrop-blur">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-emerald-300"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3C7.582 3 4 6.358 4 10.5c0 2.578 1.39 4.852 3.5 6.203V20a1 1 0 0 0 1.6.8l2.4-1.8c.166.01.332.015.5.015 4.418 0 8-3.358 8-7.5S16.418 3 12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M8.5 12.5a2.5 2.5 0 1 1 5 0c0 1.5-1 2-1.8 2.6-.46.345-.7.68-.7 1.4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="11" cy="17.3" r="0.8" fill="currentColor" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">Canopy</span>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#preview" className="transition hover:text-white">
                Preview
              </a>
              <a href="#download" className="transition hover:text-white">
                Download
              </a>
            </nav>

            <a
              href="#download"
              className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              Get early access
            </a>
          </header>

          <div className="flex flex-1 items-center py-16 lg:py-24">
            <div className="grid w-full items-center gap-14 lg:grid-cols-2">
              <div className="max-w-2xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-sky-200 backdrop-blur">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  Smarter forecasts, calmer days
                </div>

                <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Meet the weather app that helps you plan around the sky.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                  Canopy turns hourly forecasts into clear, actionable guidance—
                  so you know when to leave, what to wear, and how your day will
                  feel before you step outside.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#download"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Download Canopy
                  </a>
                  <a
                    href="#preview"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    See live preview
                  </a>
                </div>

                <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-sky-300">•</span>
                    Hyperlocal alerts
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-sky-300">•</span>
                    Minute-by-minute rain
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-sky-300">•</span>
                    Air quality + UV
                  </div>
                </div>
              </div>

              <div id="preview" className="relative mx-auto w-full max-w-md">
                <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
                <div className="absolute -right-8 bottom-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

                <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-sky-950/40 backdrop-blur-xl">
                  <div className="rounded-[1.6rem] border border-white/10 bg-slate-900/90 p-5">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>San Francisco</span>
                      <span>Now</span>
                    </div>

                    <div className="mt-6 flex items-start justify-between">
                      <div>
                        <p className="text-6xl font-semibold tracking-tight">68°</p>
                        <p className="mt-2 text-slate-300">Partly cloudy</p>
                      </div>
                      <div className="rounded-2xl bg-sky-400/10 p-3 text-sky-300">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-12 w-12"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                          <path
                            d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07 6.7 17.3M17.3 6.7l1.77-1.77"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-white/5 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Feels like</span>
                        <span className="font-medium text-white">71°</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-300">Rain chance</span>
                        <span className="font-medium text-white">12%</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-300">Wind</span>
                        <span className="font-medium text-white">8 mph NW</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white">Today</h3>
                        <span className="text-xs text-slate-400">Hourly outlook</span>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { time: '1 PM', temp: '68°' },
                          { time: '3 PM', temp: '70°' },
                          { time: '5 PM', temp: '67°' },
                          { time: '7 PM', temp: '62°' },
                        ].map((item) => (
                          <div
                            key={item.time}
                            className="rounded-2xl border border-white/5 bg-white/5 p-3 text-center"
                          >
                            <p className="text-xs text-slate-400">{item.time}</p>
                            <div className="my-2 flex justify-center text-sky-300">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-6 w-6"
                                aria-hidden="true"
                              >
                                <path
                                  d="M7 18h9a4 4 0 0 0 .4-7.98A5.5 5.5 0 0 0 6.2 8.4 3.5 3.5 0 0 0 7 18Z"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-white">{item.temp}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-emerald-400/10 p-4 text-sm text-emerald-200 ring-1 ring-emerald-300/10">
                      Best time for a walk: <span className="font-semibold text-white">4:00–6:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id="features"
            className="grid gap-4 border-t border-white/10 py-12 md:grid-cols-3"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 inline-flex rounded-2xl bg-sky-400/10 p-3 text-sky-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Forecasts that respect your time</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Get concise updates for the next hour, afternoon, evening, and commute—
                without digging through cluttered charts.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path
                    d="M12 3c3.5 4.1 6 7.1 6 10a6 6 0 1 1-12 0c0-2.9 2.5-5.9 6-10Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Rain alerts that feel magical</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Know exactly when rain is starting, stopping, or passing by your block,
                so you can move before the clouds do.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 inline-flex rounded-2xl bg-fuchsia-400/10 p-3 text-fuchsia-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path
                    d="M4 14c2.5-3 5.167-4.5 8-4.5S17.5 11 20 14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 17.5c1.8-2 3.8-3 6-3s4.2 1 6 3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="19" r="1" fill="currentColor" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Health-aware conditions</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Track air quality, UV, pollen, and humidity in one clean view built for
                runners, families, and everyday routines.
              </p>
            </div>
          </div>

          <section
            id="download"
            className="pb-16 pt-4"
          >
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur lg:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
                    Launching soon
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Stay one step ahead of every forecast.
                  </h2>
                  <p className="mt-4 text-slate-300">
                    Join the waitlist for early access to Canopy and be first to try a
                    weather app designed to make daily decisions feel effortless.
                  </p>
                </div>

                <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="h-12 flex-1 rounded-full border border-white/10 bg-slate-900/80 px-5 text-white placeholder:text-slate-500 outline-none ring-0 transition focus:border-emerald-300/40"
                  />
                  <button
                    type="submit"
                    className="h-12 rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    Join waitlist
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
