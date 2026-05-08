"use client";

import React from "react";

export default function CanopyLandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(to_bottom,_#09090b,_#0f172a)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><circle cx=%222%22 cy=%222%22 r=%221%22 fill=%22rgba(255,255,255,0.06)%22 /></svg>')] opacity-30" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-300/20 backdrop-blur">
                <span className="text-xl">🌿</span>
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">Canopy</p>
                <p className="text-xs text-zinc-400">Weather, with clarity.</p>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#forecast" className="transition hover:text-white">
                Forecast
              </a>
              <a href="#reviews" className="transition hover:text-white">
                Reviews
              </a>
            </nav>

            <button className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10">
              Get the app
            </button>
          </header>

          <div className="grid flex-1 items-center gap-16 py-16 lg:grid-cols-2 lg:py-24">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Hyperlocal forecasts, beautifully delivered
              </div>

              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                Meet <span className="text-emerald-300">Canopy</span>, the weather app that helps you plan around the sky.
              </h1>

              <p className="mt-6 text-lg leading-8 text-zinc-300">
                See what’s coming next with precise hourly forecasts, air quality insights, rain alerts, and a calm,
                nature-inspired interface designed to make weather feel effortless.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button className="rounded-full bg-emerald-400 px-6 py-3 font-medium text-zinc-950 transition hover:bg-emerald-300">
                  Download now
                </button>
                <button className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white backdrop-blur transition hover:bg-white/10">
                  Watch preview
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span>
                  Minute-by-minute rain alerts
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span>
                  AQI and pollen tracking
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span>
                  Widgets and live updates
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-6 rounded-[3rem] bg-emerald-400/10 blur-3xl" />
              <div className="relative rounded-[2.5rem] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl">
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/90">
                  <div className="bg-[linear-gradient(180deg,_rgba(16,185,129,0.25),_rgba(59,130,246,0.08)_45%,_rgba(24,24,27,1)_100%)] p-6">
                    <div className="flex items-center justify-between text-sm text-zinc-200/80">
                      <span>San Francisco</span>
                      <span>Now</span>
                    </div>

                    <div className="mt-6 flex items-start justify-between">
                      <div>
                        <p className="text-6xl font-semibold tracking-tight">68°</p>
                        <p className="mt-2 text-zinc-300">Partly cloudy</p>
                      </div>
                      <div className="text-6xl">⛅</div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-zinc-400">Rain</p>
                        <p className="mt-1 font-medium text-white">12%</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-zinc-400">Wind</p>
                        <p className="mt-1 font-medium text-white">8 mph</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-zinc-400">AQI</p>
                        <p className="mt-1 font-medium text-white">24</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-zinc-300">Hourly forecast</h3>
                      <span className="text-xs text-emerald-300">Updated just now</span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { time: "1 PM", icon: "☀️", temp: "70°" },
                        { time: "2 PM", icon: "🌤️", temp: "71°" },
                        { time: "3 PM", icon: "⛅", temp: "69°" },
                        { time: "4 PM", icon: "🌥️", temp: "67°" },
                      ].map((item) => (
                        <div
                          key={item.time}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center"
                        >
                          <p className="text-xs text-zinc-400">{item.time}</p>
                          <p className="my-2 text-xl">{item.icon}</p>
                          <p className="text-sm font-medium text-white">{item.temp}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-emerald-300/15 bg-emerald-400/10 p-4">
                      <p className="text-sm font-medium text-emerald-200">Rain alert</p>
                      <p className="mt-1 text-sm text-zinc-300">
                        Light rain expected in 28 minutes. Take an umbrella if you’re heading out.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative grid gap-4 border-t border-white/10 py-8 text-sm text-zinc-400 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-semibold text-white">1M+</p>
              <p>Forecasts checked every day</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">4.9/5</p>
              <p>Average App Store rating</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">180+</p>
              <p>Countries and regions supported</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Features</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built to make weather feel useful, not noisy.
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Canopy gives you the details that matter most, in a design that stays clear at a glance.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Precise hourly forecasts",
              desc: "Track temperature, precipitation, wind, and cloud cover hour by hour.",
              icon: "🕒",
            },
            {
              title: "Smart rain notifications",
              desc: "Get notified before showers begin so you can leave prepared.",
              icon: "🌧️",
            },
            {
              title: "Air quality and pollen",
              desc: "See AQI and seasonal allergens before you head outside.",
              icon: "🍃",
            },
            {
              title: "Elegant widgets",
              desc: "Keep your forecast on the home screen with live, beautiful updates.",
              icon: "📱",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-300/20 hover:bg-white/[0.05]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl ring-1 ring-emerald-300/15">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="forecast" className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Forecast confidence</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Stay one step ahead of changing conditions.
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Whether it’s a morning run, a commute, or a weekend away, Canopy helps you make better decisions with
              timely, hyperlocal data.
            </p>

            <div className="mt-8 space-y-5">
              {[
                "Live radar overlays for incoming storms",
                "Sunrise, sunset, UV index, and visibility at a glance",
                "Location-based forecast summaries written in plain language",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-sm text-emerald-300">
                    ✓
                  </div>
                  <p className="text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">7-day outlook</p>
                <h3 className="mt-1 text-xl font-semibold text-white">This week in Portland</h3>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">Mild trend</span>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ["Mon", "🌤️", "72°", "56°"],
                ["Tue", "☀️", "75°", "57°"],
                ["Wed", "🌦️", "68°", "54°"],
                ["Thu", "🌧️", "64°", "51°"],
                ["Fri", "⛅", "66°", "50°"],
              ].map(([day, icon, high, low]) => (
                <div
                  key={day}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p className="font-medium text-white">{day}</p>
                  <p className="text-xl">{icon}</p>
                  <p className="text-zinc-200">{high}</p>
                  <p className="text-zinc-500">{low}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Loved by users</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              A calmer way to check the weather.
            </h2>
          </div>
          <button className="w-fit rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
            Read more reviews
          </button>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {[
            {
              quote:
                "Canopy is the first weather app I actually enjoy opening. It’s fast, accurate, and beautifully designed.",
              name: "Maya R.",
            },
            {
              quote:
                "The rain alerts are incredibly helpful. I bike to work and Canopy helps me avoid getting caught in showers.",
              name: "Jordan T.",
            },
            {
              quote:
                "I love the air quality and pollen info. Everything I need is there without feeling cluttered.",
              name: "Elena S.",
            },
          ].map((review) => (
            <div key={review.name} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-emerald-300">★★★★★</div>
              <p className="mt-4 leading-7 text-zinc-300">“{review.quote}”</p>
              <p className="mt-6 text-sm font-medium text-white">{review.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,_rgba(16,185,129,0.18),_rgba(59,130,246,0.12),_rgba(24,24,27,1))] px-8 py-12 sm:px-12">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200">Get started</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Download Canopy and bring a clearer forecast to your day.
              </h2>
              <p className="mt-4 text-lg text-zinc-300">
                Clean design, accurate data, and timely alerts—everything you need from a modern weather app.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button className="rounded-full bg-white px-6 py-3 font-medium text-zinc-950 transition hover:bg-zinc-200">
                App Store
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white backdrop-blur transition hover:bg-white/10">
                Google Play
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
