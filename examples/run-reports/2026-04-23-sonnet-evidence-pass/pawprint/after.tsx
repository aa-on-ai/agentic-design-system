"use client";

import React, { useMemo, useState } from "react";

type ViewState = "loaded" | "loading" | "empty" | "error";

type WalkStatus = "Scheduled" | "In progress" | "Completed" | "Attention needed";
type WalkerStatus = "On route" | "Walking" | "Available" | "Offline";
type AlertTone = "critical" | "warning" | "info";

type Walk = {
  id: string;
  dog: string;
  breed: string;
  owner: string;
  neighborhood: string;
  time: string;
  walker: string;
  status: WalkStatus;
  notes: string;
};

type Walker = {
  name: string;
  zone: string;
  status: WalkerStatus;
  next: string;
  dogsToday: number;
};

type AlertItem = {
  title: string;
  detail: string;
  tone: AlertTone;
};

const walksSeed: Walk[] = [
  {
    id: "PW-1842",
    dog: "Mochi",
    breed: "Shiba Inu",
    owner: "Ava Patel",
    neighborhood: "Mission Bay",
    time: "9:15 AM",
    walker: "Jules Romero",
    status: "In progress",
    notes: "Prefers quiet route by the water. Avoid skateboard area.",
  },
  {
    id: "PW-1845",
    dog: "Frankie",
    breed: "Mini Goldendoodle",
    owner: "Noah Kim",
    neighborhood: "Hayes Valley",
    time: "9:30 AM",
    walker: "Sana Brooks",
    status: "Scheduled",
    notes: "Needs harness double-check before departure.",
  },
  {
    id: "PW-1838",
    dog: "Pepper",
    breed: "Boston Terrier",
    owner: "Elena Torres",
    neighborhood: "Duboce Triangle",
    time: "8:40 AM",
    walker: "Maya Chen",
    status: "Completed",
    notes: "Completed early. Water bowl refilled.",
  },
  {
    id: "PW-1841",
    dog: "Otis",
    breed: "Basset Hound",
    owner: "Liam Foster",
    neighborhood: "Pacific Heights",
    time: "9:00 AM",
    walker: "Drew Collins",
    status: "Attention needed",
    notes: "Building entry code failed twice. Owner contacted.",
  },
  {
    id: "PW-1847",
    dog: "Luna",
    breed: "Australian Shepherd",
    owner: "Mila Nguyen",
    neighborhood: "Noe Valley",
    time: "10:00 AM",
    walker: "Jules Romero",
    status: "Scheduled",
    notes: "High-energy route requested. Bring ball from lobby cubby.",
  },
];

const walkersSeed: Walker[] = [
  { name: "Jules Romero", zone: "East", status: "Walking", next: "Luna · 10:00 AM", dogsToday: 6 },
  { name: "Sana Brooks", zone: "Central", status: "On route", next: "Frankie · 9:30 AM", dogsToday: 5 },
  { name: "Maya Chen", zone: "West", status: "Available", next: "Standby dispatch", dogsToday: 4 },
  { name: "Drew Collins", zone: "North", status: "Offline", next: "Break until 10:15 AM", dogsToday: 3 },
];

const alertsSeed: AlertItem[] = [
  {
    title: "Late check-in on Otis",
    detail: "Walker arrived, but building access failed. Dispatch follow-up open for 12 minutes.",
    tone: "critical",
  },
  {
    title: "Rain pickup window expanding",
    detail: "Central zone routes are averaging 11 minutes slower than plan.",
    tone: "warning",
  },
  {
    title: "New client approved",
    detail: "Rosie the Cavapoo was cleared for afternoon onboarding.",
    tone: "info",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "red" | "blue" | "neutral";
}) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    neutral: "bg-stone-100 text-stone-700 ring-stone-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[tone]
      )}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(28,25,23,0.05),0_10px_30px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/80",
        className
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-[-0.01em] text-stone-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-stone-600">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "green" | "amber" | "blue" | "neutral";
}) {
  const accent = {
    green: "text-emerald-700",
    amber: "text-amber-700",
    blue: "text-sky-700",
    neutral: "text-stone-700",
  };

  return (
    <div className="rounded-2xl bg-stone-50/80 p-5 ring-1 ring-stone-200/80">
      <p className="text-sm font-medium text-stone-600">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-[-0.03em] text-stone-950 [font-variant-numeric:tabular-nums]">
          {value}
        </p>
        <p className={cn("pb-1 text-sm font-medium [font-variant-numeric:tabular-nums]", accent[tone])}>{delta}</p>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 md:grid-cols-[1.2fr_1fr_1fr_auto]">
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
        <div className="h-3 w-48 animate-pulse rounded bg-stone-100" />
      </div>
      <div className="h-4 w-28 animate-pulse rounded bg-stone-100" />
      <div className="h-4 w-32 animate-pulse rounded bg-stone-100" />
      <div className="h-8 w-24 animate-pulse rounded-full bg-stone-100" />
    </div>
  );
}

export default function PawprintAdminDashboard() {
  const [viewState, setViewState] = useState<ViewState>("loaded");

  const walks = useMemo(() => {
    if (viewState === "empty") return [];
    return walksSeed;
  }, [viewState]);

  const statusTone = (status: WalkStatus) => {
    switch (status) {
      case "Completed":
        return "green";
      case "In progress":
        return "blue";
      case "Attention needed":
        return "red";
      case "Scheduled":
      default:
        return "amber";
    }
  };

  const walkerTone = (status: WalkerStatus) => {
    switch (status) {
      case "Walking":
        return "green";
      case "On route":
        return "blue";
      case "Offline":
        return "neutral";
      case "Available":
      default:
        return "amber";
    }
  };

  const alertTone = (tone: AlertTone) => {
    switch (tone) {
      case "critical":
        return "red";
      case "warning":
        return "amber";
      case "info":
      default:
        return "blue";
    }
  };

  const completed = walksSeed.filter((w) => w.status === "Completed").length;
  const active = walksSeed.filter((w) => w.status === "In progress").length;
  const attention = walksSeed.filter((w) => w.status === "Attention needed").length;
  const scheduled = walksSeed.filter((w) => w.status === "Scheduled").length;

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-stone-900 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-[28px] bg-stone-900 p-4 text-stone-50 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-lg font-bold text-stone-900">
                P
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-300">Pawprint</p>
                <p className="truncate text-base font-semibold tracking-[-0.01em] text-white">Operations admin</p>
              </div>
            </div>

            <nav className="mt-6 space-y-1" aria-label="Primary">
              {[
                ["Dashboard", true],
                ["Walks", false],
                ["Walkers", false],
                ["Clients", false],
                ["Billing", false],
              ].map(([label, active]) => (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    "flex min-h-12 w-full items-center rounded-2xl px-4 text-left text-sm font-medium transition-colors duration-200",
                    active
                      ? "bg-white/10 text-white"
                      : "text-stone-300 hover:bg-white/5 hover:text-white focus-visible:bg-white/5"
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-sm font-medium text-white">Dispatch coverage</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] [font-variant-numeric:tabular-nums]">
                92%
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                11 walkers clocked in across 4 zones. Central zone is trending slower due to weather.
              </p>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="px-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-400">Today</p>
              <div className="mt-3 space-y-3 px-2 text-sm text-stone-300">
                <div className="flex items-center justify-between gap-3">
                  <span>Total walks</span>
                  <span className="font-medium text-white [font-variant-numeric:tabular-nums]">48</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Check-ins on time</span>
                  <span className="font-medium text-white [font-variant-numeric:tabular-nums]">44</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Open issues</span>
                  <span className="font-medium text-amber-300 [font-variant-numeric:tabular-nums]">3</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <header className="rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(28,25,23,0.05),0_10px_30px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/80">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill tone="green">Live operations</StatusPill>
                    <p className="text-sm text-stone-500">Tuesday, Apr 23 · Morning shift</p>
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl [text-wrap:balance]">
                    Keep every dog on schedule, every walker supported, and every owner updated.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 [text-wrap:pretty] sm:text-base">
                    Monitor active walks, triage route issues, and dispatch the next pickup without leaving the board.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div
                    className="inline-flex rounded-2xl bg-stone-100 p-1 ring-1 ring-stone-200"
                    aria-label="Preview dashboard states"
                  >
                    {(["loaded", "loading", "empty", "error"] as ViewState[]).map((state) => (
                      <button
                        key={state}
                        type="button"
                        onClick={() => setViewState(state)}
                        className={cn(
                          "min-h-11 rounded-xl px-4 text-sm font-medium capitalize transition duration-150 active:scale-[0.97]",
                          viewState === state
                            ? "bg-white text-stone-900 shadow-sm"
                            : "text-stone-600 hover:text-stone-900"
                        )}
                        aria-pressed={viewState === state}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="min-h-11 rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 active:scale-[0.97]"
                  >
                    Create manual booking
                  </button>
                </div>
              </div>
            </header>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <MetricCard label="Walks in progress" value={`${active}`} delta="+1 vs 8:30" tone="blue" />
              <MetricCard label="Scheduled next" value={`${scheduled}`} delta="Next at 9:30" tone="amber" />
              <MetricCard label="Completed this shift" value={`${completed}`} delta="On pace +6%" tone="green" />
              <MetricCard label="Needs attention" value={`${attention}`} delta="1 urgent case" tone="amber" />
            </section>

            <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
              <SectionCard
                title="Today’s walk board"
                subtitle="Dispatch can resolve issues, reassign walkers, and confirm route notes from one place."
                action={
                  <button
                    type="button"
                    className="min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-700 transition-colors duration-200 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 active:scale-[0.97]"
                  >
                    View all routes
                  </button>
                }
              >
                {viewState === "loading" ? (
                  <div className="space-y-3" aria-live="polite" aria-busy="true">
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                    <p className="pt-2 text-sm text-stone-500">Loading this morning’s routes…</p>
                  </div>
                ) : viewState === "error" ? (
                  <div className="rounded-2xl bg-rose-50 p-6 ring-1 ring-rose-200">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-rose-900">We couldn’t load the walk board</h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-rose-800">
                          Dispatch data didn’t sync from the field app. Try again to refresh assignments and live check-ins.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewState("loaded")}
                        className="min-h-11 rounded-2xl bg-rose-900 px-4 text-sm font-medium text-white transition hover:bg-rose-800 active:scale-[0.97]"
                      >
                        Retry loading
                      </button>
                    </div>
                  </div>
                ) : viewState === "empty" ? (
                  <div className="rounded-2xl bg-stone-50 p-8 text-center ring-1 ring-stone-200/80">
                    <h3 className="text-base font-semibold text-stone-900">No walks scheduled yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
                      Morning routes will appear here once bookings are assigned. You can create a manual booking or import
                      today’s recurring clients.
                    </p>
                    <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <button
                        type="button"
                        className="min-h-11 rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-800 active:scale-[0.97]"
                      >
                        Create booking
                      </button>
                      <button
                        type="button"
                        className="min-h-11 rounded-2xl border border-stone-200 bg-white px-5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 active:scale-[0.97]"
                      >
                        Import recurring walks
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {walks.map((walk) => (
                      <article
                        key={walk.id}
                        className="rounded-2xl border border-stone-200/80 bg-white p-4 transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_20px_rgba(28,25,23,0.06)]"
                      >
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.25fr)_180px_220px_auto] lg:items-center">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold tracking-[-0.01em] text-stone-900">
                                {walk.dog}
                              </h3>
                              <span className="text-sm text-stone-500">· {walk.breed}</span>
                              <StatusPill tone={statusTone(walk.status)}>{walk.status}</StatusPill>
                            </div>
                            <p className="mt-1 text-sm text-stone-600 [text-wrap:pretty]">
                              {walk.owner} · {walk.neighborhood} · {walk.id}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">{walk.notes}</p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Pickup</p>
                            <p className="mt-1 text-sm font-medium text-stone-900 [font-variant-numeric:tabular-nums]">
                              {walk.time}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Assigned walker</p>
                            <p className="mt-1 text-sm font-medium text-stone-900">{walk.walker}</p>
                          </div>

                          <div className="flex items-center gap-2 lg:justify-end">
                            <button
                              type="button"
                              className="min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-700 transition-colors duration-200 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 active:scale-[0.97]"
                            >
                              Reassign
                            </button>
                            <button
                              type="button"
                              className="min-h-11 rounded-2xl bg-amber-300 px-4 text-sm font-medium text-stone-900 transition-colors duration-200 hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.97]"
                            >
                              Open details
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>

              <div className="space-y-6">
                <SectionCard title="Active alerts" subtitle="Items that need dispatch review within this shift.">
                  <div className="space-y-3">
                    {alertsSeed.map((alert) => (
                      <div
                        key={alert.title}
                        className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-stone-900">{alert.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-stone-600">{alert.detail}</p>
                          </div>
                          <StatusPill tone={alertTone(alert.tone)}>
                            {alert.tone === "critical" ? "Urgent" : alert.tone === "warning" ? "Watch" : "Info"}
                          </StatusPill>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Walker availability" subtitle="Current status by zone and next assignment.">
                  <div className="space-y-3">
                    {walkersSeed.map((walker) => (
                      <div
                        key={walker.name}
                        className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/80"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-stone-900">{walker.name}</h3>
                              <StatusPill tone={walkerTone(walker.status)}>{walker.status}</StatusPill>
                            </div>
                            <p className="mt-1 text-sm text-stone-600">
                              {walker.zone} zone · Next: {walker.next}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Today</p>
                            <p className="mt-1 text-sm font-semibold text-stone-900 [font-variant-numeric:tabular-nums]">
                              {walker.dogsToday} dogs
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
