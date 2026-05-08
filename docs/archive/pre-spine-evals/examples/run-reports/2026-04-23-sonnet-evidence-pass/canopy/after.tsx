"use client";

import React, { useMemo, useState } from "react";

type DemoState = "loaded" | "loading" | "empty" | "error";

const forecast = [
  { day: "Now", temp: "68°", detail: "Soft breeze", icon: "◐" },
  { day: "3 PM", temp: "71°", detail: "Sun breaks through", icon: "☀" },
  { day: "6 PM", temp: "69°", detail: "Light clouds", icon: "☁" },
  { day: "9 PM", temp: "63°", detail: "Cooler by dusk", icon: "☾" },
  { day: "Thu", temp: "74°", detail: "Dry and bright", icon: "☀" },
];

const cities = [
  { name: "Portland", temp: "62°", note: "Drizzle ending by 2:10 PM" },
  { name: "Austin", temp: "84°", note: "Heat advisory after 4 PM" },
  { name: "Seattle", temp: "59°", note: "Marine layer, clearer tonight" },
  { name: "Denver", temp: "72°", note: "Storm window around 6 PM" },
];

const alerts = [
  "Rain starts in 18 minutes near N Mississippi Ave.",
  "Pollen is high this afternoon. Good day to plan around it.",
  "Sunset clears the cloud cover for a bright evening walk.",
];

function WeatherPanel({ state }: { state: DemoState }) {
  if (state === "loading") {
    return (
      <div className="rounded-[28px] bg-white/90 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.08)] ring-1 ring-black/5 backdrop-blur">
        <div className="rounded-2xl bg-stone-50 p-5">
          <div className="animate-pulse space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded-full bg-stone-200" />
                <div className="h-14 w-28 rounded-2xl bg-stone-200" />
                <div className="h-4 w-40 rounded-full bg-stone-200" />
              </div>
              <div className="h-16 w-16 rounded-2xl bg-stone-200" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/5">
                  <div className="h-3 w-10 rounded-full bg-stone-200" />
                  <div className="mt-3 h-8 w-12 rounded-full bg-stone-200" />
                  <div className="mt-3 h-3 w-full rounded-full bg-stone-200" />
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/5">
              <div className="h-4 w-32 rounded-full bg-stone-200" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-stone-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="rounded-[28px] bg-white/90 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.08)] ring-1 ring-black/5 backdrop-blur">
        <div className="rounded-2xl bg-stone-50 p-8 text-left">
          <div className="mx-auto max-w-sm space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/5">
              ☁
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-stone-900 [text-wrap:balance]">
                No locations yet
              </h3>
              <p className="text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                Canopy becomes useful the moment you add a place you actually care
                about. Start with home, work, or the trailhead you keep checking
                every Friday.
              </p>
            </div>
            <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-medium text-white transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 active:scale-[0.97]">
              Add your first location
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-[28px] bg-white/90 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.08)] ring-1 ring-black/5 backdrop-blur">
        <div className="rounded-2xl bg-stone-50 p-8 text-left">
          <div className="mx-auto max-w-sm space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-700 ring-1 ring-rose-200">
              !
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-stone-900 [text-wrap:balance]">
                Couldn&apos;t refresh the forecast
              </h3>
              <p className="text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                The weather feed didn&apos;t respond. Try again in a moment, or keep
                browsing the latest saved conditions.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-medium text-white transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 active:scale-[0.97]">
                Try again
              </button>
              <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-stone-700 ring-1 ring-black/10 transition-[transform,background-color] duration-150 ease-out hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 active:scale-[0.97]">
                Use saved forecast
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] bg-white/90 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.08)] ring-1 ring-black/5 backdrop-blur">
      <div className="rounded-2xl bg-stone-50 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
          <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-stone-500">Portland, OR</p>
                <div className="mt-2 flex items-end gap-3">
                  <div className="text-6xl font-semibold tracking-[-0.05em] text-stone-950 [font-variant-numeric:tabular-nums]">
                    68°
                  </div>
                  <div className="pb-2 text-sm text-stone-600">
                    Feels like 70°
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                  Rain ends before the commute home. Clearer skies by sunset.
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#fef3c7,white)] text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-amber-100">
                ⛅
              </div>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2">
              {forecast.map((item) => (
                <div
                  key={item.day}
                  className="rounded-2xl bg-stone-50 p-3 ring-1 ring-black/5 transition-[transform,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-stone-100"
                >
                  <div className="text-xs font-medium text-stone-500">
                    {item.day}
                  </div>
                  <div className="mt-3 text-lg text-stone-700">{item.icon}</div>
                  <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-900 [font-variant-numeric:tabular-nums]">
                    {item.temp}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-stone-500">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
                Conditions
              </h3>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                Updated 2 min ago
              </span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              {[
                ["Humidity", "54%"],
                ["Wind", "7 mph"],
                ["UV Index", "3"],
                ["Air quality", "Good"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-stone-50 p-4 ring-1 ring-black/5">
                  <dt className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                    {label}
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-900 [font-variant-numeric:tabular-nums]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.35fr]">
          <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
              Smart nudges
            </h3>
            <div className="mt-4 space-y-3">
              {alerts.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-700 ring-1 ring-black/5 [text-wrap:pretty]"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
                Places that matter
              </h3>
              <button className="inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium text-stone-700 transition-[transform,background-color] duration-150 ease-out hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 active:scale-[0.97]">
                View all
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {cities.map((city) => (
                <div
                  key={city.name}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-stone-50 p-4 ring-1 ring-black/5 transition-[transform,background-color] duration-150 ease-out hover:bg-stone-100"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-stone-900">
                      {city.name}
                    </div>
                    <div className="truncate text-sm text-stone-600">
                      {city.note}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-semibold tracking-[-0.03em] text-stone-900 [font-variant-numeric:tabular-nums]">
                      {city.temp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function CanopyLandingPage() {
  const [demoState, setDemoState] = useState<DemoState>("loaded");

  const stateLabel = useMemo(
    () =>
      ({
        loaded: "Loaded",
        loading: "Loading",
        empty: "Empty",
        error: "Error",
      })[demoState],
    [demoState]
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(245,245,244,1)_45%,rgba(241,245,249,1))] text-stone-900 antialiased">
      <div className="fixed right-4 top-4 z-50">
        <div className="rounded-2xl bg-white/95 p-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.12)] ring-1 ring-black/10 backdrop-blur">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Demo state switcher">
            {(["loaded", "loading", "empty", "error"] as DemoState[]).map((state) => {
              const active = demoState === state;
              return (
                <button
                  key={state}
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show ${state} state`}
                  onClick={() => setDemoState(state)}
                  className={[
                    "inline-flex min-h-12 items-center justify-center rounded-xl px-3.5 text-xs font-medium capitalize transition-[transform,background-color,color,box-shadow] duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 active:scale-[0.97]",
                    active
                      ? "bg-stone-900 text-white shadow-[0_1px_2px_rgba(16,24,40,0.14)]"
                      : "bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                  ].join(" ")}
                >
                  {state}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-stone-700 ring-1 ring-black/5 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Built for daily decisions, not weather trivia
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] text-stone-950 sm:text-6xl lg:text-7xl [text-wrap:balance]">
              Weather that helps you decide what to do next.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600 [text-wrap:pretty]">
              Canopy turns forecasts into timing, context, and calm. Know when rain
              actually starts, when the heat breaks, and whether tonight is good for a
              walk, run, ride, or dinner outside.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-900 px-6 text-sm font-medium text-white transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 active:scale-[0.97]">
                Get early access
              </button>
              <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/90 px-6 text-sm font-medium text-stone-700 ring-1 ring-black/10 transition-[transform,background-color] duration-150 ease-out hover:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 active:scale-[0.97]">
                Watch product preview
              </button>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-1 gap-4 border-t border-black/5 pt-6 sm:grid-cols-3">
              {[
                ["Minute-by-minute timing", "Know whether to leave now or in 20 minutes"],
                ["Places that matter", "Track home, work, school, and weekend plans"],
                ["Signal over noise", "Alerts that are useful enough to keep on"],
              ].map(([title, text]) => (
                <div key={title} className="space-y-2">
                  <dt className="text-sm font-semibold text-stone-900">{title}</dt>
                  <dd className="text-sm leading-6 text-stone-600 [text-wrap:pretty]">
                    {text}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-x-10 -top-8 h-32 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.22),rgba(255,255,255,0))] blur-3xl"
            />
            <WeatherPanel state={demoState} />
            <p className="mt-4 px-2 text-sm text-stone-500">
              Demo preview: <span className="font-medium text-stone-700">{stateLabel}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div className="rounded-[28px] bg-white/80 p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] ring-1 ring-black/5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
              Why Canopy
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-stone-950 [text-wrap:balance]">
              Forecasts are easy. Decisions are the hard part.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-stone-600 [text-wrap:pretty]">
              Most weather apps stop at conditions. Canopy goes one step further and
              interprets the shift that matters: the exact hour the storm clears, the
              block where drizzle starts, the part of the day worth protecting.
            </p>
          </div>

          {[
            {
              title: "Designed for rhythm",
              body: "Morning commute, school pickup, afternoon run, weekend plans. Canopy is organized around the moments people actually check the weather.",
            },
            {
              title: "Quiet by default",
              body: "No crowded dashboards, no anxious red badges everywhere. Important changes stand out because everything else stays calm.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] bg-stone-900 p-8 text-stone-50 shadow-[0_1px_2px_rgba(16,24,40,0.08),0_12px_32px_rgba(16,24,40,0.16)]"
            >
              <h3 className="text-xl font-semibold tracking-[-0.03em] [text-wrap:balance]">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-stone-300 [text-wrap:pretty]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] bg-white/80 p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] ring-1 ring-black/5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
              Built for real life
            </p>
            <ul className="mt-6 space-y-5">
              {[
                "See the next meaningful change, not an endless wall of hourly tiles.",
                "Follow the few places you repeatedly check instead of re-searching them.",
                "Get useful nudges like “leave 15 minutes later” or “sun returns by dinner.”",
                "Read conditions quickly with clear hierarchy and clean contrast.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
                  />
                  <span className="text-base leading-7 text-stone-700 [text-wrap:pretty]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,251,235,0.9))] p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] ring-1 ring-black/5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
              For launch
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-stone-950 [text-wrap:balance]">
              Join the first wave of testers.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-stone-600 [text-wrap:pretty]">
              We&apos;re starting with a small group who check the forecast often enough to
              notice when an app gets the details right. Early access includes iPhone,
              Android, and web.
            </p>

            <form className="mt-8 space-y-4" aria-label="Early access sign up">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-800">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-2xl border-0 bg-white px-4 text-sm text-stone-900 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/10 outline-none transition-[box-shadow,background-color] duration-150 ease-out placeholder:text-stone-400 focus:ring-2 focus:ring-stone-400"
                />
              </div>
              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-medium text-stone-800">
                  Primary city
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="Portland, OR"
                  className="h-12 w-full rounded-2xl border-0 bg-white px-4 text-sm text-stone-900 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/10 outline-none transition-[box-shadow,background-color] duration-150 ease-out placeholder:text-stone-400 focus:ring-2 focus:ring-stone-400"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-900 px-6 text-sm font-medium text-white transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 active:scale-[0.97]"
                >
                  Request invite
                </button>
                <p className="text-sm leading-6 text-stone-500 [text-wrap:pretty]">
                  No spam. Just launch updates and early access details.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-t border-black/5 pt-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Canopy — weather with better timing.</p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#"
              className="transition-colors duration-150 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2"
            >
              Privacy
            </a>
            <a
              href="#"
              className="transition-colors duration-150 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2"
            >
              Updates
            </a>
            <a
              href="#"
              className="transition-colors duration-150 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
