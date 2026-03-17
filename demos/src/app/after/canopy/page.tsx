"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CloudFog,
  CloudMoon,
  Droplets,
  MapPin,
  MoonStar,
  RefreshCcw,
  Sparkles,
  Sunrise,
  Wind,
} from "lucide-react";

type PreviewState = "loaded" | "empty" | "error";

type ForecastPoint = {
  hour: string;
  temp: number;
  active?: boolean;
};

type Feature = {
  title: string;
  body: string;
  detail: string;
  icon: typeof Sunrise;
};

const forecast: ForecastPoint[] = [
  { hour: "6a", temp: 61 },
  { hour: "9a", temp: 64 },
  { hour: "12p", temp: 68, active: true },
  { hour: "3p", temp: 71 },
  { hour: "6p", temp: 67 },
  { hour: "9p", temp: 62 },
];

const features: Feature[] = [
  {
    title: "hyperlocal timing",
    body: "Street-by-street forecasting that catches marine layer shifts, drizzle windows, and sunset cool-downs before they ruin the plan.",
    detail: "Built for real routines, not generic regional averages.",
    icon: MapPin,
  },
  {
    title: "quiet, useful alerts",
    body: "Canopy only interrupts when the weather meaningfully changes: wind pickup, first rain, heat jump, or the exact hour outside starts feeling good.",
    detail: "Less panic, more judgment.",
    icon: Sparkles,
  },
  {
    title: "forecasted for humans",
    body: "Temperature, humidity, wind, and cloud cover get translated into what matters: patio dinner, dog walk, bike ride, beach hour, or stay inside energy.",
    detail: "The app tells you how the day lands, not just what the sensors saw.",
    icon: CloudFog,
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.32em] text-cyan-100/55">{children}</p>
  );
}

function LoadingView() {
  return (
    <main className="min-h-screen bg-[#07131c] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="h-14 w-full animate-pulse rounded-full border border-white/10 bg-white/5 sm:w-72" />
        <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-10 lg:p-12">
            <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="mt-6 space-y-4">
              <div className="h-16 w-full animate-pulse rounded-[1.5rem] bg-white/10" />
              <div className="h-16 w-10/12 animate-pulse rounded-[1.5rem] bg-white/10" />
              <div className="h-24 w-full animate-pulse rounded-[1.5rem] bg-white/10" />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="h-12 flex-1 animate-pulse rounded-full bg-cyan-300/15" />
              <div className="h-12 flex-1 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="h-80 animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />
            <div className="h-56 animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CanopyLandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [previewState, setPreviewState] = useState<PreviewState>("loaded");
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "error" | "submitting" | "success">("idle");
  const [formMessage, setFormMessage] = useState(
    "Get launch updates, early invites, and the first Canopy beta when it opens.",
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  const today = useMemo(
    () => ({
      location: "Venice Beach",
      temperature: "68°",
      condition: "sun breaking through a light marine layer",
      summary: "Mild by noon, breezier after 6 pm, with just enough chill tonight to want a layer.",
      humidity: "74%",
      wind: "9 mph",
      sunrise: "6:58 am",
    }),
    [],
  );

  function handleSignup() {
    const trimmed = email.trim();

    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setFormStatus("error");
      setFormMessage("That doesn’t look like an email address. Try again with a real inbox.");
      return;
    }

    setFormStatus("submitting");
    setFormMessage("Saving your spot...");

    window.setTimeout(() => {
      if (trimmed.endsWith("@example.com")) {
        setFormStatus("error");
        setFormMessage("We couldn’t save that address. Use your everyday inbox and we’ll send the invite there.");
        return;
      }

      setFormStatus("success");
      setFormMessage(`You’re in. We’ll send the Canopy preview to ${trimmed}.`);
      setEmail("");
    }, 900);
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07131c] text-white selection:bg-cyan-200/30 selection:text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(92,190,255,0.14),transparent_30%),radial-gradient(circle_at_80%_16%,rgba(124,255,214,0.12),transparent_22%),linear-gradient(180deg,#07131c_0%,#091923_42%,#050d14_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_42%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 py-6 sm:gap-16 sm:px-8 lg:gap-20 lg:px-10 lg:py-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-100 shadow-[0_12px_40px_rgba(60,166,255,0.16)]">
              <CloudMoon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em]">Canopy</p>
              <p className="text-sm text-white/55">weather that actually helps you decide</p>
            </div>
          </div>

          <a
            href="#join"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white transition duration-200 ease-out hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07131c]"
          >
            join the beta
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-[0_24px_100px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.12),transparent_24%)]" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="space-y-5">
                <Eyebrow>new weather app · preview opening soon</Eyebrow>
                <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-[5.25rem] lg:leading-[0.94]">
                  The forecast, refined into a better instinct.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
                  Canopy turns weather into timing, mood, and clear next moves. It tells you when the sky shifts, when outside will feel right, and when to bring the layer before you regret not bringing it.
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="rounded-[1.6rem] border border-white/10 bg-[#0d1d28]/80 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-cyan-100/75">Right now in {today.location}</p>
                      <div className="mt-3 flex items-end gap-3">
                        <span className="text-5xl font-semibold tracking-[-0.05em] text-white">
                          {today.temperature}
                        </span>
                        <p className="max-w-sm pb-1 text-sm leading-6 text-white/68">
                          {today.condition}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-cyan-200/15 bg-cyan-200/10 px-3 py-2 text-sm text-cyan-100/90">
                      feels calm outside
                    </span>
                  </div>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">{today.summary}</p>

                  <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/78">
                    <span className="rounded-full border border-white/8 bg-white/6 px-3 py-2">
                      humidity {today.humidity}
                    </span>
                    <span className="rounded-full border border-white/8 bg-white/6 px-3 py-2">
                      wind {today.wind}
                    </span>
                    <span className="rounded-full border border-white/8 bg-white/6 px-3 py-2">
                      sunrise {today.sunrise}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:w-52">
                  <a
                    href="#join"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-200 px-5 text-sm font-semibold text-[#08202c] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07131c]"
                  >
                    get early access
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#features"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-medium text-white transition duration-200 ease-out hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07131c]"
                  >
                    explore features
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-white/55">Live preview</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                    See the product mood, not just the headline.
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewState("loaded")}
                    className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1822] ${
                      previewState === "loaded"
                        ? "bg-cyan-200 text-[#08202c]"
                        : "border border-white/10 bg-white/8 text-white hover:bg-white/14"
                    }`}
                  >
                    live weather
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewState("empty")}
                    className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1822] ${
                      previewState === "empty"
                        ? "bg-cyan-200 text-[#08202c]"
                        : "border border-white/10 bg-white/8 text-white hover:bg-white/14"
                    }`}
                  >
                    quiet mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewState("error")}
                    className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1822] ${
                      previewState === "error"
                        ? "bg-cyan-200 text-[#08202c]"
                        : "border border-white/10 bg-white/8 text-white hover:bg-white/14"
                    }`}
                  >
                    offline
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-[#091720]/90 p-5 sm:p-6">
                {previewState === "loaded" ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/55">
                          afternoon read
                        </p>
                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/8 text-cyan-100">
                            <CloudMoon className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-4xl font-semibold tracking-[-0.05em] text-white">
                              68°
                            </p>
                            <p className="mt-1 text-sm text-white/62">
                              Bright by noon, breezier after sunset
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-[1.2rem] border border-cyan-200/15 bg-cyan-200/10 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/60">
                          rain chance
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-cyan-50">12%</p>
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/8 bg-white/6 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-white">Today’s temperature arc</p>
                        <p className="text-sm text-white/48">Updated 2 min ago</p>
                      </div>
                      <div className="mt-5 flex items-end justify-between gap-2">
                        {forecast.map((point) => (
                          <div key={point.hour} className="flex flex-1 flex-col items-center gap-3">
                            <div
                              className={`w-full rounded-full ${
                                point.active
                                  ? "bg-gradient-to-t from-cyan-200 via-sky-200 to-emerald-100"
                                  : "bg-white/12"
                              }`}
                              style={{
                                height: `${point.temp * 1.55}px`,
                                minHeight: 62,
                                maxHeight: 126,
                              }}
                            />
                            <div className="text-center">
                              <p className="text-sm font-medium text-white">{point.temp}°</p>
                              <p className="text-xs text-white/45">{point.hour}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/6 p-4">
                        <p className="text-sm text-white/50">Best outside window</p>
                        <p className="mt-2 text-xl font-semibold text-white">4:40 pm to 7:10 pm</p>
                        <p className="mt-2 text-sm leading-6 text-white/60">
                          Warm light, lighter wind, and no weather drama.
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/6 p-4">
                        <p className="text-sm text-white/50">Heads up</p>
                        <p className="mt-2 text-xl font-semibold text-white">Bring a layer tonight</p>
                        <p className="mt-2 text-sm leading-6 text-white/60">
                          Coastal wind picks up after 8 pm and the air turns sharper fast.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : previewState === "empty" ? (
                  <div className="flex min-h-[26rem] flex-col justify-between gap-6 rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-cyan-100">
                      <MoonStar className="h-7 w-7" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                        No alerts right now
                      </h3>
                      <p className="max-w-md text-sm leading-7 text-white/64">
                        This is Canopy at its best. The forecast is stable, the air stays mild through tonight, and there’s nothing urgent trying to hijack your attention.
                      </p>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/6 p-4">
                      <p className="text-sm font-medium text-white">What happens next</p>
                      <p className="mt-2 text-sm leading-6 text-white/58">
                        When weather shifts enough to matter, Canopy will surface a clear heads-up with timing and context.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[26rem] flex-col justify-between gap-6 rounded-[1.5rem] border border-rose-300/12 bg-rose-300/[0.03] p-5 sm:p-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200/15 bg-rose-200/10 text-rose-100">
                      <CloudFog className="h-7 w-7" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                        Couldn’t refresh the forecast
                      </h3>
                      <p className="max-w-md text-sm leading-7 text-white/64">
                        The weather feed didn’t respond. Check your connection and try again. Your last saved daily read will stay available until live data comes back.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewState("loaded")}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/8 px-5 text-sm font-medium text-white transition duration-200 ease-out hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#091720] sm:w-fit"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl sm:p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-100">
                  <Droplets className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-white/50">precipitation</p>
                <p className="mt-2 text-xl font-semibold text-white">Minute-scale rain timing</p>
              </article>
              <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl sm:p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-100">
                  <Wind className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-white/50">wind</p>
                <p className="mt-2 text-xl font-semibold text-white">Commute and patio comfort reads</p>
              </article>
              <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl sm:p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-100">
                  <Sunrise className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-white/50">daily timing</p>
                <p className="mt-2 text-xl font-semibold text-white">Golden hour and shade windows</p>
              </article>
            </section>
          </div>
        </section>

        <section id="features" className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-10">
          <div className="space-y-5">
            <Eyebrow>why Canopy</Eyebrow>
            <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Dark, calm, and built for weather that affects plans.
            </h2>
            <p className="max-w-xl text-base leading-7 text-white/64">
              Most weather apps flood the screen with widgets and warnings. Canopy edits for signal. The interface stays atmospheric and quiet until it has something worth saying.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const wide = index === 0;

              return (
                <article
                  key={feature.title}
                  className={`rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-200 ease-out hover:-translate-y-1 hover:bg-white/[0.075] ${
                    wide ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                          {feature.title}
                        </h3>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-white/64">
                          {feature.body}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-cyan-100/70">{feature.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-7 backdrop-blur-2xl sm:p-8">
            <Eyebrow>morning</Eyebrow>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
              Know when the gray burns off.
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/64">
              Canopy catches the exact moment the marine layer lifts so your walk, ride, or coffee run lands in the better part of the day.
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 backdrop-blur-2xl sm:p-8">
            <Eyebrow>afternoon</Eyebrow>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
              Catch the shift before it becomes annoying.
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/64">
              Wind pickup, heat spikes, cloud cover, and drizzle windows get surfaced early enough to actually change what you do.
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 backdrop-blur-2xl sm:p-8">
            <Eyebrow>night</Eyebrow>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
              End the day with a clearer tomorrow.
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/64">
              Evening reads help with layers, air quality, and that small planning instinct you usually piece together from five separate widgets.
            </p>
          </article>
        </section>

        <section
          id="join"
          className="rounded-[2.2rem] border border-white/10 bg-white/[0.06] p-7 shadow-[0_24px_100px_rgba(0,0,0,0.26)] backdrop-blur-2xl sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div className="space-y-5">
              <Eyebrow>early access</Eyebrow>
              <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Get the beta before the weather gets interesting.
              </h2>
              <p className="max-w-xl text-base leading-7 text-white/64">
                We’re opening Canopy with a small group first. Join the list to get launch updates, beta access, and a forecast app that finally feels edited.
              </p>
            </div>

            <div className="space-y-4" aria-label="Join the Canopy beta">
              <label htmlFor="email" className="block text-sm font-medium text-white/78">
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSignup();
                    }
                  }}
                  aria-describedby="signup-status"
                  className="min-h-12 flex-1 rounded-full border border-white/10 bg-[#0d1d28]/90 px-5 text-base text-white outline-none transition focus:border-cyan-200/40 focus:ring-2 focus:ring-cyan-200/20"
                />
                <button
                  type="button"
                  onClick={handleSignup}
                  disabled={formStatus === "submitting"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-200 px-5 text-sm font-semibold text-[#08202c] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07131c]"
                >
                  {formStatus === "submitting" ? "saving your spot" : "request invite"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p
                id="signup-status"
                role="status"
                className={`text-sm leading-6 ${
                  formStatus === "error"
                    ? "text-rose-200"
                    : formStatus === "success"
                      ? "text-emerald-200"
                      : "text-white/58"
                }`}
              >
                {formMessage}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
