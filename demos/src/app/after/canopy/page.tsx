"use client";

import React, { useMemo, useState } from "react";

export default function CanopyLandingPage() {
  const [state, setState] = useState<"loaded" | "loading" | "empty" | "error">("loaded");

  const hourly = useMemo(
    () => [
      { time: "Now", temp: 68, icon: "☁️", rain: "12%" },
      { time: "11 AM", temp: 70, icon: "⛅", rain: "8%" },
      { time: "12 PM", temp: 72, icon: "🌤️", rain: "6%" },
      { time: "1 PM", temp: 74, icon: "☀️", rain: "4%" },
      { time: "2 PM", temp: 75, icon: "☀️", rain: "3%" },
      { time: "3 PM", temp: 74, icon: "🌤️", rain: "7%" },
    ],
    []
  );

  const cities = useMemo(
    () => [
      { name: "Portland", summary: "Soft rain ending by noon", temp: "61°", hi: "64°", lo: "56°" },
      { name: "Austin", summary: "Dry heat, breezy after 4 PM", temp: "87°", hi: "91°", lo: "74°" },
      { name: "Chicago", summary: "Lake wind advisory tonight", temp: "58°", hi: "62°", lo: "49°" },
      { name: "Miami", summary: "Storm cell moving offshore", temp: "82°", hi: "85°", lo: "78°" },
    ],
    []
  );

  const features = [
    {
      title: "Rain timing that respects your day",
      body: "See when drizzle starts, when it actually matters, and whether you need a jacket or just five patient minutes.",
    },
    {
      title: "Calm forecasts, not dashboard noise",
      body: "Canopy highlights the one thing to act on now, then layers in hourly detail only when you need it.",
    },
    {
      title: "Neighborhood-level detail",
      body: "Track conditions where you are, where you're headed, and where your plans keep getting rescheduled.",
    },
  ];

  const renderWeatherPanel = () => {
    if (state === "loading") {
      return (
        <div className="rounded-[28px] bg-white/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur md:p-5">
          <div className="rounded-2xl bg-stone-50 p-5 md:p-6">
            <div className="animate-pulse space-y-5">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded-full bg-stone-200" />
                <div className="h-12 w-40 rounded-full bg-stone-200" />
                <div className="h-4 w-64 rounded-full bg-stone-200" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-2xl bg-white" />
                <div className="h-20 rounded-2xl bg-white" />
                <div className="h-20 rounded-2xl bg-white" />
              </div>
              <div className="h-32 rounded-2xl bg-white" />
            </div>
          </div>
        </div>
      );
    }

    if (state === "empty") {
      return (
        <div className="rounded-[28px] bg-white/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur md:p-5">
          <div className="rounded-2xl bg-stone-50 p-6 md:p-7">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
                🌤️
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">No forecast yet</h3>
                <p className="max-w-sm text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                  Add a city to start tracking conditions, rain timing, and the temperature shifts that matter today.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-900 px-5 text-sm font-medium text-white transition-transform duration-150 hover:bg-emerald-800 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2">
                  Add your first city
                </button>
                <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-stone-700 ring-1 ring-black/8 transition-colors duration-150 hover:bg-stone-100 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2">
                  Use current location
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (state === "error") {
      return (
        <div className="rounded-[28px] bg-white/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur md:p-5">
          <div className="rounded-2xl bg-stone-50 p-6 md:p-7">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-xl ring-1 ring-rose-200">
                ⚠️
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">Couldn’t load the forecast</h3>
                <p className="max-w-sm text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                  We couldn’t reach the forecast service just now. Try again in a moment or switch to a saved city.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setState("loading")}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-900 px-5 text-sm font-medium text-white transition-transform duration-150 hover:bg-emerald-800 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                >
                  Try again
                </button>
                <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-stone-700 ring-1 ring-black/8 transition-colors duration-150 hover:bg-stone-100 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2">
                  View saved cities
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[28px] bg-white/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur md:p-5">
        <div className="rounded-2xl bg-gradient-to-b from-stone-50 to-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-black/5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-500">San Francisco</p>
              <div className="mt-2 flex items-end gap-3">
                <div className="text-5xl font-semibold tracking-[-0.05em] text-stone-950 [font-variant-numeric:tabular-nums]">
                  68°
                </div>
                <div className="pb-1 text-sm text-stone-500">Feels like 66°</div>
              </div>
              <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                Low clouds this morning. Brighter by early afternoon with a light ocean breeze.
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white text-3xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
              ⛅
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Rain", value: "12%" },
              { label: "Wind", value: "9 mph" },
              { label: "UV", value: "Moderate" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[20px] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-black/5"
              >
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{item.label}</div>
                <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-stone-900">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[20px] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-medium text-stone-700">Today at a glance</h3>
              <span className="text-xs text-stone-500">Next 6 hours</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {hourly.map((item) => (
                <div
                  key={item.time}
                  className="rounded-2xl bg-stone-50 px-3 py-4 text-center transition-colors duration-150 hover:bg-stone-100"
                >
                  <div className="text-xs font-medium text-stone-500">{item.time}</div>
                  <div className="mt-2 text-xl">{item.icon}</div>
                  <div className="mt-2 text-base font-semibold text-stone-900 [font-variant-numeric:tabular-nums]">
                    {item.temp}°
                  </div>
                  <div className="mt-1 text-xs text-stone-500">{item.rain} rain</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[20px] bg-emerald-950 px-4 py-4 text-emerald-50 shadow-[0_1px_2px_rgba(15,23,42,0.05)] md:px-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-base">☂️</div>
              <div>
                <p className="text-sm font-medium">Bring a light layer, not an umbrella.</p>
                <p className="mt-1 text-sm leading-6 text-emerald-100/80 [text-wrap:pretty]">
                  Any drizzle should clear before lunch, and the afternoon stays comfortably mild.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f7f3_0%,#eef3ee_42%,#f6f4ef_100%)] text-stone-900 antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,rgba(98,140,114,0.16),transparent_58%)]"
      />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-5 sm:py-6">
          <a href="#" className="flex min-h-12 items-center gap-3 rounded-full pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.1)]">
              C
            </div>
            <span className="text-base font-semibold tracking-[-0.02em] text-stone-900">Canopy</span>
          </a>

          <nav className="hidden items-center gap-2 md:flex">
            <a
              href="#features"
              className="inline-flex min-h-12 items-center rounded-full px-4 text-sm font-medium text-stone-600 transition-colors duration-150 hover:bg-white/70 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              Features
            </a>
            <a
              href="#cities"
              className="inline-flex min-h-12 items-center rounded-full px-4 text-sm font-medium text-stone-600 transition-colors duration-150 hover:bg-white/70 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              Cities
            </a>
            <a
              href="#download"
              className="inline-flex min-h-12 items-center rounded-full bg-emerald-900 px-5 text-sm font-medium text-white transition-transform duration-150 hover:bg-emerald-800 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              Get early access
            </a>
          </nav>

          <button
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full bg-white/80 text-stone-700 ring-1 ring-black/8 transition-colors duration-150 hover:bg-white md:hidden"
            aria-label="Open navigation"
          >
            ☰
          </button>
        </header>

        <section className="grid flex-1 items-center gap-10 py-8 md:gap-12 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex min-h-11 items-center rounded-full bg-white/80 px-4 text-sm font-medium text-stone-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-black/5 backdrop-blur">
              Built for the forecast you actually act on
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] text-stone-950 [text-wrap:balance] sm:text-6xl lg:text-7xl">
              Weather that feels calm, clear, and one step ahead.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 [text-wrap:pretty] sm:text-lg">
              Canopy turns noisy forecasts into a simple read on your day: when rain starts, when skies open up, and what
              matters before you head out the door.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                id="download"
                href="#signup"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-900 px-6 text-sm font-medium text-white transition-transform duration-150 hover:bg-emerald-800 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
              >
                Join the waitlist
              </a>
              <a
                href="#preview"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/85 px-6 text-sm font-medium text-stone-700 ring-1 ring-black/8 transition-colors duration-150 hover:bg-white active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
              >
                See the preview
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { value: "5 min", label: "rain start precision" },
                { value: "10 day", label: "forecast outlook" },
                { value: "24/7", label: "severe weather alerts" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[20px] bg-white/65 p-4 ring-1 ring-black/5 backdrop-blur">
                  <div className="text-2xl font-semibold tracking-[-0.03em] text-stone-950 [font-variant-numeric:tabular-nums]">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-stone-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="preview" className="lg:pl-4">
            {renderWeatherPanel()}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Preview states</span>
              {(["loaded", "loading", "empty", "error"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setState(item)}
                  aria-pressed={state === item}
                  className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 ${
                    state === item
                      ? "bg-emerald-900 text-white"
                      : "bg-white/80 text-stone-700 ring-1 ring-black/8 hover:bg-white"
                  }`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-10 sm:py-14 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Why Canopy</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-950 [text-wrap:balance] sm:text-4xl">
              Forecasts with hierarchy, so the right detail arrives at the right moment.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] bg-white/75 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_32px_rgba(15,23,42,0.05)] ring-1 ring-black/5 backdrop-blur md:p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="rounded-[20px] bg-stone-50 p-5 ring-1 ring-black/5">
                    <p className="text-sm font-medium text-stone-500">Morning brief</p>
                    <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">Your commute stays dry.</h3>
                        <p className="mt-2 max-w-lg text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                          Light showers arrive after 6:40 PM, so the umbrella can stay home until evening.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-stone-700 ring-1 ring-black/5">
                        Sunset 7:48 PM
                      </div>
                    </div>
                  </div>
                </div>

                {features.map((feature) => (
                  <div key={feature.title} className="rounded-[20px] bg-stone-50 p-5 ring-1 ring-black/5">
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-stone-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600 [text-wrap:pretty]">{feature.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[28px] bg-emerald-950 p-5 text-emerald-50 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_32px_rgba(15,23,42,0.08)] md:p-6">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-emerald-200/80">Built for real routines</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] [text-wrap:balance]">
                Know whether to open the windows, bike to dinner, or move the picnic indoors.
              </h3>
              <p className="mt-4 text-sm leading-6 text-emerald-100/80 [text-wrap:pretty]">
                Canopy doesn’t try to impress you with more panels. It tells you what changes the plan, then gives you clean,
                local detail for everything else.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Hyperlocal precipitation timing",
                  "Air quality and wind at a glance",
                  "Saved places for home, work, and weekends",
                  "Alert summaries written in plain language",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
                    <div className="mt-1 text-emerald-300">•</div>
                    <p className="text-sm leading-6 text-emerald-50/90">{item}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section id="cities" className="py-10 sm:py-14 lg:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">City snapshots</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-950 [text-wrap:balance] sm:text-4xl">
                A better read on today, wherever the forecast gets complicated.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-stone-600 [text-wrap:pretty]">
              Compare saved places without bouncing between screens or parsing dense radar jargon.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {cities.map((city) => (
              <article
                key={city.name}
                className="rounded-[28px] bg-white/75 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_32px_rgba(15,23,42,0.05)] ring-1 ring-black/5 backdrop-blur md:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-[-0.02em] text-stone-950">{city.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{city.summary}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-semibold tracking-[-0.04em] text-stone-950 [font-variant-numeric:tabular-nums]">
                      {city.temp}
                    </div>
                    <div className="mt-1 text-sm text-stone-500">
                      H {city.hi} · L {city.lo}
                    </div>
                  </div>
                </div>

                <div className="mt-6 h-24 rounded-[20px] bg-[linear-gradient(180deg,rgba(230,237,232,0.9),rgba(245,247,244,0.95))] p-4 ring-1 ring-black/5">
                  <div className="flex h-full items-end gap-2">
                    {[36, 52, 44, 68, 58, 72, 60, 48].map((height, i) => (
                      <div key={i} className="flex-1 rounded-full bg-emerald-900/75" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="signup" className="pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-24">
          <div className="rounded-[32px] bg-stone-950 px-5 py-8 text-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_50px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-400">Early access</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white [text-wrap:balance] sm:text-4xl">
                  Be first to try the forecast app that leaves the clutter outside.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-stone-300 [text-wrap:pretty] sm:text-base">
                  Join the waitlist for launch updates, early builds, and a calmer way to decide what today actually needs.
                </p>
              </div>

              <form className="rounded-[24px] bg-white p-4 text-stone-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="mt-2 h-12 w-full rounded-2xl border-0 bg-stone-50 px-4 text-sm text-stone-900 outline-none ring-1 ring-black/8 transition focus:ring-2 focus:ring-emerald-700"
                />
                <p className="mt-2 text-xs leading-5 text-stone-500">
                  We’ll only send launch news, early invites, and major weather feature updates.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-emerald-900 px-5 text-sm font-medium text-white transition-transform duration-150 hover:bg-emerald-800 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                  >
                    Join the waitlist
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-100 px-5 text-sm font-medium text-stone-700 transition-colors duration-150 hover:bg-stone-200 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
                  >
                    View product updates
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
