"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  PawPrint,
  RefreshCcw,
  ShieldAlert,
  Syringe,
} from "lucide-react";

type DashboardState = "loaded" | "empty" | "error";

type ActivityItem = {
  dog: string;
  owner: string;
  event: string;
  time: string;
  walker: string;
};

type Appointment = {
  dog: string;
  service: string;
  time: string;
  walker: string;
  status: "confirmed" | "check-in" | "attention";
};

const activities: ActivityItem[] = [
  {
    dog: "Maple",
    owner: "Rina Patel",
    event: "Morning walk completed · 2.4 mi",
    time: "8:42 AM",
    walker: "Noah Kim",
  },
  {
    dog: "Otis",
    owner: "Sam Alvarez",
    event: "Meal logged · chicken + rice",
    time: "9:10 AM",
    walker: "Elena Cruz",
  },
  {
    dog: "Piper",
    owner: "Jordan Lee",
    event: "Medication reminder cleared",
    time: "9:28 AM",
    walker: "Maya Singh",
  },
  {
    dog: "Bruno",
    owner: "Ari Thompson",
    event: "Drop-in visit started",
    time: "10:05 AM",
    walker: "Noah Kim",
  },
];

const appointments: Appointment[] = [
  {
    dog: "Maple",
    service: "Midday walk",
    time: "11:30 AM",
    walker: "Noah Kim",
    status: "confirmed",
  },
  {
    dog: "Piper",
    service: "Insulin check",
    time: "1:00 PM",
    walker: "Maya Singh",
    status: "check-in",
  },
  {
    dog: "Bruno",
    service: "Post-op calm walk",
    time: "3:15 PM",
    walker: "Elena Cruz",
    status: "attention",
  },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.22em] text-emerald-900/45">{children}</p>;
}

function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f5f7f2] text-[#142117]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="h-16 w-full animate-pulse rounded-[1.6rem] bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:w-80" />
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="h-52 animate-pulse rounded-[1.8rem] bg-white/80 shadow-[0_14px_34px_rgba(15,23,42,0.08)]" />
            <div className="h-80 animate-pulse rounded-[1.8rem] bg-white/80 shadow-[0_14px_34px_rgba(15,23,42,0.08)]" />
          </div>
          <div className="space-y-5">
            <div className="h-72 animate-pulse rounded-[1.8rem] bg-white/80 shadow-[0_14px_34px_rgba(15,23,42,0.08)]" />
            <div className="h-60 animate-pulse rounded-[1.8rem] bg-white/80 shadow-[0_14px_34px_rgba(15,23,42,0.08)]" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PawprintAfterPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardState, setDashboardState] = useState<DashboardState>("loaded");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const metrics = useMemo(
    () => [
      { label: "walks completed today", value: "34", detail: "+6 vs yesterday" },
      { label: "appointments this afternoon", value: "12", detail: "3 require check-in" },
      { label: "active care alerts", value: "2", detail: "medication + mobility" },
    ],
    [],
  );

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] text-[#142117] selection:bg-emerald-200 selection:text-[#142117]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_100%_0%,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,#f7f9f4_0%,#eef2ea_100%)]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-5 py-5 sm:px-8 lg:gap-7 lg:px-10 lg:py-8">
        <header className="rounded-[1.8rem] border border-emerald-950/10 bg-white/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-900/10 bg-emerald-100 text-emerald-900">
                <PawPrint className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.02em] text-[#102114]">Pawprint Care Ops</p>
                <p className="text-sm text-[#304435]">Recent activity, appointments, and health reminders in one place</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDashboardState("loaded")}
                className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f7f2] ${
                  dashboardState === "loaded"
                    ? "bg-emerald-700 text-white"
                    : "border border-emerald-900/15 bg-white text-[#16331d] hover:bg-emerald-50"
                }`}
              >
                live board
              </button>
              <button
                type="button"
                onClick={() => setDashboardState("empty")}
                className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f7f2] ${
                  dashboardState === "empty"
                    ? "bg-emerald-700 text-white"
                    : "border border-emerald-900/15 bg-white text-[#16331d] hover:bg-emerald-50"
                }`}
              >
                no items
              </button>
              <button
                type="button"
                onClick={() => setDashboardState("error")}
                className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f7f2] ${
                  dashboardState === "error"
                    ? "bg-emerald-700 text-white"
                    : "border border-emerald-900/15 bg-white text-[#16331d] hover:bg-emerald-50"
                }`}
              >
                issue mode
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-[1.5rem] border border-emerald-950/10 bg-white/85 p-5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            >
              <p className="text-sm text-[#3d5442]">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#102114]">{metric.value}</p>
              <p className="mt-2 text-sm text-emerald-800">{metric.detail}</p>
            </article>
          ))}
        </section>

        {dashboardState === "loaded" ? (
          <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <article className="rounded-[1.8rem] border border-emerald-950/10 bg-white/85 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.07)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SectionEyebrow>recent activity</SectionEyebrow>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#102114]">
                    Service updates from the last 2 hours
                  </h2>
                </div>
                <span className="rounded-full border border-emerald-900/15 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                  auto-refresh on
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {activities.map((item) => (
                  <div
                    key={`${item.dog}-${item.time}`}
                    className="rounded-2xl border border-emerald-950/10 bg-[#f9fbf8] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-base font-semibold text-[#122316]">{item.dog}</p>
                      <p className="text-sm text-[#48604d]">{item.time}</p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[#223528]">{item.event}</p>
                    <p className="mt-2 text-sm text-[#48604d]">
                      Owner {item.owner} · Walker {item.walker}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <div className="space-y-5">
              <article className="rounded-[1.8rem] border border-emerald-950/10 bg-white/85 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.07)] backdrop-blur-xl">
                <SectionEyebrow>appointments</SectionEyebrow>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#102114]">
                  Upcoming today
                </h2>

                <div className="mt-5 space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={`${appointment.dog}-${appointment.time}`}
                      className="rounded-2xl border border-emerald-950/10 bg-[#f9fbf8] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[#122316]">{appointment.dog}</p>
                          <p className="mt-1 text-sm text-[#304c38]">
                            {appointment.service} · {appointment.time}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            appointment.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : appointment.status === "check-in"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#48604d]">Assigned walker {appointment.walker}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[1.8rem] border border-emerald-950/10 bg-white/85 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.07)] backdrop-blur-xl">
                <SectionEyebrow>health reminders</SectionEyebrow>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#102114]">
                  Attention queue
                </h2>

                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-900/20 bg-amber-50 p-4">
                    <Syringe className="mt-0.5 h-5 w-5 text-amber-800" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Piper needs insulin check-in by 1:30 PM</p>
                      <p className="mt-1 text-sm text-amber-800/90">Walker has acknowledged and will confirm dose in-app.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-900/20 bg-rose-50 p-4">
                    <HeartPulse className="mt-0.5 h-5 w-5 text-rose-800" />
                    <div>
                      <p className="text-sm font-semibold text-rose-900">Bruno is on reduced pace after surgery</p>
                      <p className="mt-1 text-sm text-rose-800/90">Flag appears on all scheduled visits until cleared by owner.</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>
        ) : dashboardState === "empty" ? (
          <section className="rounded-[1.8rem] border border-emerald-950/10 bg-white/85 p-8 shadow-[0_16px_36px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-900/15 bg-emerald-50 text-emerald-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#102114]">
                You&apos;re fully caught up
              </h2>
              <p className="mt-3 text-base leading-7 text-[#36503d]">
                No pending appointments, care alerts, or unreviewed activity right now. The next visit window opens at 11:30 AM.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className="inline-flex min-h-12 items-center rounded-full border border-emerald-900/15 bg-white px-4 text-sm font-medium text-[#1d3624]">
                  <CalendarClock className="mr-2 h-4 w-4" /> Next appointment at 11:30 AM
                </span>
                <span className="inline-flex min-h-12 items-center rounded-full border border-emerald-900/15 bg-white px-4 text-sm font-medium text-[#1d3624]">
                  <ClipboardList className="mr-2 h-4 w-4" /> Daily report auto-sends at 6 PM
                </span>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[1.8rem] border border-rose-900/20 bg-rose-50 p-8 shadow-[0_16px_36px_rgba(15,23,42,0.07)]">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-rose-900/20 bg-white text-rose-800">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-rose-900">
                Couldn&apos;t load live care data
              </h2>
              <p className="mt-3 text-base leading-7 text-rose-900/80">
                Walk logs and reminder updates are temporarily unavailable. Your latest synced schedule is still safe.
              </p>
              <button
                type="button"
                onClick={() => setDashboardState("loaded")}
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-rose-900 px-5 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
              >
                <RefreshCcw className="h-4 w-4" />
                retry sync
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
