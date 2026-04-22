"use client";

import React, { useMemo, useState } from "react";

type ViewState = "loaded" | "loading" | "empty" | "error";

type WalkStatus = "Scheduled" | "In progress" | "Completed" | "Needs coverage";
type WalkerStatus = "On route" | "Available" | "Break" | "Offline";

type Walk = {
  id: string;
  dog: string;
  breed: string;
  owner: string;
  neighborhood: string;
  time: string;
  duration: string;
  walker: string;
  status: WalkStatus;
  notes: string;
};

type Walker = {
  name: string;
  zone: string;
  nextStart: string;
  status: WalkerStatus;
  rating: string;
};

const walks: Walk[] = [
  {
    id: "PW-1842",
    dog: "Mochi",
    breed: "Shiba Inu",
    owner: "Elena Park",
    neighborhood: "Williamsburg",
    time: "9:30 AM",
    duration: "30 min",
    walker: "Nina Lopez",
    status: "In progress",
    notes: "Prefers quiet route. Avoid dog park."
  },
  {
    id: "PW-1845",
    dog: "Baxter",
    breed: "Golden Retriever",
    owner: "Chris Nolan",
    neighborhood: "Greenpoint",
    time: "10:15 AM",
    duration: "45 min",
    walker: "Jordan Kim",
    status: "Scheduled",
    notes: "Needs harness check before departure."
  },
  {
    id: "PW-1847",
    dog: "Pepper",
    breed: "Mini Schnauzer",
    owner: "Ava Singh",
    neighborhood: "Park Slope",
    time: "11:00 AM",
    duration: "30 min",
    walker: "Taylor Reed",
    status: "Needs coverage",
    notes: "Walker called out sick at 8:52 AM."
  },
  {
    id: "PW-1839",
    dog: "Otis",
    breed: "French Bulldog",
    owner: "Marcus Bell",
    neighborhood: "Cobble Hill",
    time: "8:00 AM",
    duration: "20 min",
    walker: "Priya Shah",
    status: "Completed",
    notes: "Completed early. Water refill noted."
  },
  {
    id: "PW-1849",
    dog: "Juniper",
    breed: "Australian Shepherd",
    owner: "Lily Chen",
    neighborhood: "DUMBO",
    time: "12:30 PM",
    duration: "60 min",
    walker: "Nina Lopez",
    status: "Scheduled",
    notes: "High energy. Include pier loop."
  }
];

const walkerRoster: Walker[] = [
  { name: "Nina Lopez", zone: "North Brooklyn", nextStart: "12:30 PM", status: "On route", rating: "4.9" },
  { name: "Jordan Kim", zone: "Greenpoint", nextStart: "10:15 AM", status: "Available", rating: "4.8" },
  { name: "Taylor Reed", zone: "South Brooklyn", nextStart: "—", status: "Break", rating: "4.7" },
  { name: "Priya Shah", zone: "Downtown", nextStart: "1:10 PM", status: "Available", rating: "5.0" },
  { name: "Alex Moreno", zone: "Williamsburg", nextStart: "—", status: "Offline", rating: "4.6" }
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusPill({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
}) {
  const styles = {
    neutral: "bg-neutral-100 text-neutral-700 ring-neutral-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200"
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

function WalkStatusBadge({ status }: { status: WalkStatus }) {
  const tone =
    status === "Completed"
      ? "green"
      : status === "In progress"
      ? "blue"
      : status === "Needs coverage"
      ? "red"
      : "amber";

  return <StatusPill tone={tone}>{status}</StatusPill>;
}

function WalkerStatusBadge({ status }: { status: WalkerStatus }) {
  const tone =
    status === "Available"
      ? "green"
      : status === "On route"
      ? "blue"
      : status === "Break"
      ? "amber"
      : "neutral";

  return <StatusPill tone={tone}>{status}</StatusPill>;
}

function MetricCard({
  label,
  value,
  detail,
  emphasis = false
}: {
  label: string;
  value: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] outline outline-1 outline-black/5",
        emphasis && "bg-neutral-950 text-white outline-white/10"
      )}
    >
      <p className={cn("text-sm font-medium", emphasis ? "text-white/70" : "text-neutral-600")}>{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p
          className={cn(
            "text-4xl font-semibold tracking-tight [font-variant-numeric:tabular-nums]",
            emphasis ? "text-white" : "text-neutral-950"
          )}
        >
          {value}
        </p>
        <p className={cn("max-w-[10rem] text-right text-sm leading-5", emphasis ? "text-white/70" : "text-neutral-500")}>
          {detail}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl bg-neutral-200/70"
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] outline outline-1 outline-black/5">
          <div className="mb-5 h-6 w-48 animate-pulse rounded bg-neutral-200/70" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-3xl bg-neutral-200/70" />
          <div className="h-48 animate-pulse rounded-3xl bg-neutral-200/70" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="rounded-3xl bg-white p-10 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] outline outline-1 outline-black/5">
      <div className="max-w-xl">
        <StatusPill tone="neutral">No walks scheduled</StatusPill>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950" style={{ textWrap: "balance" }}>
          Today’s board is clear.
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600" style={{ textWrap: "pretty" }}>
          Scheduled walks, handoff issues, and live route updates will appear here once bookings start coming in. You can
          add a recurring client or open same-day availability for your walkers.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition-transform duration-150 hover:bg-neutral-800 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2">
            Add a booking
          </button>
          <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-200 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2">
            Manage walker availability
          </button>
        </div>
      </div>
    </section>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="rounded-3xl bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] outline outline-1 outline-black/5">
      <div className="max-w-xl">
        <StatusPill tone="red">Dispatch data unavailable</StatusPill>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950" style={{ textWrap: "balance" }}>
          We couldn’t load today’s operations board.
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600" style={{ textWrap: "pretty" }}>
          The live schedule service didn’t respond. Existing bookings have not been changed. Retry now, or check again in
          a moment if the connection is unstable.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onRetry}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition-transform duration-150 hover:bg-neutral-800 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
          >
            Retry
          </button>
          <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-200 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2">
            View incident history
          </button>
        </div>
      </div>
    </section>
  );
}

export default function PawprintAdminDashboard() {
  const [viewState, setViewState] = useState<ViewState>("loaded");

  const summary = useMemo(() => {
    const total = walks.length;
    const inProgress = walks.filter((w) => w.status === "In progress").length;
    const coverage = walks.filter((w) => w.status === "Needs coverage").length;
    const completed = walks.filter((w) => w.status === "Completed").length;
    const availableWalkers = walkerRoster.filter((w) => w.status === "Available").length;

    return { total, inProgress, coverage, completed, availableWalkers };
  }, []);

  const content =
    viewState === "loading" ? (
      <LoadingState />
    ) : viewState === "empty" ? (
      <EmptyState />
    ) : viewState === "error" ? (
      <ErrorState onRetry={() => setViewState("loading")} />
    ) : (
      <div className="space-y-6 lg:space-y-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <MetricCard
            label="Walks scheduled today"
            value={String(summary.total)}
            detail="2 still ahead of schedule, 1 needs immediate reassignment."
            emphasis
          />
          <MetricCard
            label="Walkers available now"
            value={String(summary.availableWalkers)}
            detail="Ready to cover late bookings or route changes."
          />
          <MetricCard
            label="Completed this morning"
            value={String(summary.completed)}
            detail="First shift finish rate is tracking above weekday average."
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] outline outline-1 outline-black/5">
            <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Operations board</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">Today’s walks</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="blue">{summary.inProgress} in progress</StatusPill>
                <StatusPill tone="red">{summary.coverage} need coverage</StatusPill>
              </div>
            </div>

            <div className="mt-4 hidden md:block">
              <div className="grid grid-cols-[1.2fr_1fr_0.9fr_0.8fr_0.9fr] gap-4 px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                <span>Dog & client</span>
                <span>Route</span>
                <span>Time</span>
                <span>Walker</span>
                <span>Status</span>
              </div>
              <div className="mt-2 space-y-2">
                {walks.map((walk) => (
                  <button
                    key={walk.id}
                    className="grid w-full grid-cols-[1.2fr_1fr_0.9fr_0.8fr_0.9fr] gap-4 rounded-2xl px-3 py-4 text-left transition-colors duration-150 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
                          🐾
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-950">{walk.dog}</p>
                          <p className="truncate text-sm text-neutral-500">
                            {walk.breed} · {walk.owner}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 self-center">
                      <p className="truncate text-sm font-medium text-neutral-800">{walk.neighborhood}</p>
                      <p className="truncate text-sm text-neutral-500">{walk.notes}</p>
                    </div>
                    <div className="self-center">
                      <p className="text-sm font-medium text-neutral-900 [font-variant-numeric:tabular-nums]">{walk.time}</p>
                      <p className="text-sm text-neutral-500">{walk.duration}</p>
                    </div>
                    <div className="self-center">
                      <p className="truncate text-sm font-medium text-neutral-800">{walk.walker}</p>
                      <p className="text-sm text-neutral-500">{walk.id}</p>
                    </div>
                    <div className="self-center">
                      <WalkStatusBadge status={walk.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {walks.map((walk) => (
                <button
                  key={walk.id}
                  className="w-full rounded-2xl bg-neutral-50 p-4 text-left transition-colors duration-150 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-950">
                        {walk.dog} <span className="font-normal text-neutral-500">· {walk.breed}</span>
                      </p>
                      <p className="mt-1 text-sm text-neutral-600">{walk.owner}</p>
                    </div>
                    <WalkStatusBadge status={walk.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-neutral-500">Neighborhood</p>
                      <p className="mt-1 font-medium text-neutral-800">{walk.neighborhood}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Time</p>
                      <p className="mt-1 font-medium text-neutral-800 [font-variant-numeric:tabular-nums]">
                        {walk.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Walker</p>
                      <p className="mt-1 font-medium text-neutral-800">{walk.walker}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Duration</p>
                      <p className="mt-1 font-medium text-neutral-800">{walk.duration}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{walk.notes}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] outline outline-1 outline-black/5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Coverage risk</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">Dispatch alerts</h2>
                </div>
                <StatusPill tone="red">1 urgent</StatusPill>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-rose-50 p-4 outline outline-1 outline-rose-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-rose-900">Pepper needs a replacement walker</p>
                      <p className="mt-1 text-sm leading-6 text-rose-700">
                        South Brooklyn, 11:00 AM start. Existing walker called out before first route check-in.
                      </p>
                    </div>
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
                  </div>
                  <button className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-rose-700 px-3.5 py-2.5 text-sm font-medium text-white transition-transform duration-150 hover:bg-rose-800 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2">
                    Reassign walk
                  </button>
                </div>

                <div className="rounded-2xl bg-neutral-50 p-4 outline outline-1 outline-black/5">
                  <p className="text-sm font-semibold text-neutral-900">Weather advisory after 2 PM</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Light rain is expected across North Brooklyn. Auto-send rain prep notes to afternoon clients if the
                    forecast holds.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] outline outline-1 outline-black/5">
              <div>
                <p className="text-sm font-medium text-neutral-500">Field team</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">Walker availability</h2>
              </div>

              <div className="mt-5 space-y-3">
                {walkerRoster.map((walker) => (
                  <div
                    key={walker.name}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-neutral-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">{walker.name}</p>
                      <p className="truncate text-sm text-neutral-500">
                        {walker.zone} · Next {walker.nextStart}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="hidden text-sm text-neutral-500 sm:block">
                        ★ <span className="[font-variant-numeric:tabular-nums]">{walker.rating}</span>
                      </p>
                      <WalkerStatusBadge status={walker.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    );

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-neutral-900 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-[32px] bg-[#fcfbf8] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_20px_60px_rgba(16,24,40,0.08)] outline outline-1 outline-black/5 sm:p-6 lg:p-8">
          <header className="border-b border-neutral-200 pb-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-xl text-white shadow-sm">
                    🐕
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Pawprint admin</p>
                    <h1
                      className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl"
                      style={{ textWrap: "balance" }}
                    >
                      Daily dispatch dashboard
                    </h1>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base" style={{ textWrap: "pretty" }}>
                  Monitor today’s walks, spot coverage issues before they snowball, and keep owners updated without
                  bouncing between schedules, messages, and route notes.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition-transform duration-150 hover:bg-neutral-800 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2">
                  Create walk
                </button>
                <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-neutral-700 outline outline-1 outline-black/10 transition-colors duration-150 hover:bg-neutral-50 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2">
                  Export route sheet
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="green">Service level 98.2%</StatusPill>
                <StatusPill tone="neutral">Updated 4 min ago</StatusPill>
                <StatusPill tone="amber">Rain watch this afternoon</StatusPill>
              </div>

              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Dashboard preview states"
              >
                {(["loaded", "loading", "empty", "error"] as ViewState[]).map((state) => (
                  <button
                    key={state}
                    onClick={() => setViewState(state)}
                    aria-pressed={viewState === state}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2",
                      viewState === state
                        ? "bg-neutral-950 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    )}
                  >
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <section className="pt-6 lg:pt-8">{content}</section>
        </div>
      </div>
    </main>
  );
}
