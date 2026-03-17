"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CloudDrizzle,
  CloudMoon,
  Compass,
  Leaf,
  MapPinned,
  Sparkles,
  SunMedium,
  Wind,
} from "lucide-react";

type Ritual = {
  label: string;
  time: string;
  note: string;
};

type Feature = {
  name: string;
  copy: string;
  detail: string;
  icon: typeof SunMedium;
};

const rituals: Ritual[] = [
  {
    label: "golden hour",
    time: "6:41 pm",
    note: "Canopy notices marine layer breaks, warm sidewalks, and the 48-minute window when Venice actually looks painted.",
  },
  {
    label: "bike window",
    time: "7:10 am",
    note: "A calm, low-glare route read that weighs wind, shade, and whether the air feels crisp or sticky.",
  },
  {
    label: "plant check",
    time: "8:00 pm",
    note: "Humidity nudges for indoor jungles, with a gentle heads-up before dry air sneaks in overnight.",
  },
];

const features: Feature[] = [
  {
    name: "microclimate memory",
    copy: "Neighborhood-level forecasts that learn your routines instead of dumping hourly noise on you.",
    detail: "Built for people who care whether it will feel bright, breezy, muggy, or oddly perfect.",
    icon: MapPinned,
  },
  {
    name: "felt-sense forecast",
    copy: "A daily read that translates pressure, cloud cover, and wind into how the day will actually land in your body.",
    detail: "Think less meteorology textbook, more trusted local whisper.",
    icon: Compass,
  },
  {
    name: "calm alerts",
    copy: "Only the weather changes worth your attention make it through: first drizzle, heat swing, wind pickup, marine layer burn-off.",
    detail: "No panic-red storms for a mildly overcast afternoon.",
    icon: Wind,
  },
  {
    name: "weather for rituals",
    copy: "Commute, walk, patio dinner, dog loop, surf check, plant care. Canopy organizes around what you do, not generic widgets.",
    detail: "The app feels more like a companion than a utility belt.",
    icon: Leaf,
  },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.28em] text-[#7b6c60]">{children}</p>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f4ede3] text-[#241815]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="h-12 w-40 animate-pulse rounded-full bg-[#dbcab7]/70" />
        <div className="grid flex-1 gap-6 lg:grid-cols-[1.25fr_0.8fr]">
          <div className="space-y-5 rounded-[2rem] border border-[#d8c7b4] bg-[#f8f2ea]/80 p-8 shadow-[0_24px_80px_rgba(74,52,36,0.08)] sm:p-10 lg:p-12">
            <div className="h-4 w-28 animate-pulse rounded-full bg-[#dbcab7]/80" />
            <div className="space-y-3">
              <div className="h-16 w-full animate-pulse rounded-[1.5rem] bg-[#d9c8b6]/80" />
              <div className="h-16 w-11/12 animate-pulse rounded-[1.5rem] bg-[#dfcfbe]/80" />
            </div>
            <div className="h-24 w-full animate-pulse rounded-[1.5rem] bg-[#e5d9cb]/80" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="h-14 flex-1 animate-pulse rounded-full bg-[#2f5a4a]/20" />
              <div className="h-14 w-40 animate-pulse rounded-full bg-[#5f3f3f]/20" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="h-64 animate-pulse rounded-[2rem] border border-[#d8c7b4] bg-[#f7f0e6]/80" />
            <div className="h-64 animate-pulse rounded-[2rem] border border-[#d8c7b4] bg-[#efe4d7]/80" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CanopyLandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "submitting" | "success">("idle");
  const [message, setMessage] = useState("Get early access to the calmest forecast on your phone.");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  const todaySummary = useMemo(
    () => ({
      location: "Venice Beach",
      temp: "68°",
      condition: "sun after a thin marine layer",
      feeling: "cool in the shade, warm once you start moving",
      pollen: "low",
      wind: "9 mph onshore",
    }),
    [],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = email.trim();

    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setStatus("error");
      setMessage("That doesn’t look like an email address. Try again with a valid one.");
      return;
    }

    setStatus("submitting");
    setMessage("Saving your spot...");

    window.setTimeout(() => {
      if (trimmed.endsWith("@example.com")) {
        setStatus("error");
        setMessage("We couldn’t save that address. Use your real inbox and we’ll send the invite there.");
        return;
      }

      setStatus("success");
      setMessage(`You’re in. We’ll send the Canopy preview to ${trimmed}.`);
      setEmail("");
    }, 900);
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4ede3] text-[#241815] selection:bg-[#2f5a4a] selection:text-[#f8f3ec]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(95,63,63,0.16), transparent 32%), radial-gradient(circle at 85% 14%, rgba(47,90,74,0.18), transparent 28%), radial-gradient(circle at 50% 100%, rgba(196,147,94,0.14), transparent 26%)",
        }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 py-6 sm:gap-20 sm:px-8 sm:py-8 lg:gap-24 lg:px-10 lg:py-10">
        <header className="flex items-center justify-between rounded-full border border-[#d7c7b6] bg-[#f8f2ea]/85 px-4 py-3 shadow-[0_8px_30px_rgba(64,45,33,0.05)] backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f5a4a] text-[#f6f0e8] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <CloudMoon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em]">Canopy</p>
              <p className="text-xs text-[#6e6158]">weather with a point of view</p>
            </div>
          </div>

          <a
            href="#join"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cdbba7] bg-[#fffaf4] px-5 text-sm font-medium text-[#241815] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#bca791] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f5a4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4ede3]"
          >
            join the preview
          </a>
        </header>

        <section className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#d7c7b6] bg-[#f8f2ea]/92 p-7 shadow-[0_28px_90px_rgba(69,46,35,0.08)] sm:p-10 lg:p-12">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(255,255,255,0.34), transparent 48%), radial-gradient(circle at 20% 20%, rgba(47,90,74,0.08), transparent 24%), radial-gradient(circle at 90% 20%, rgba(95,63,63,0.1), transparent 26%)",
              }}
            />

            <div className="relative flex h-full flex-col gap-8">
              <div className="space-y-5">
                <SectionEyebrow>new weather app · previewing now</SectionEyebrow>
                <div className="space-y-4">
                  <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-[#241815] sm:text-6xl lg:text-[5.4rem] lg:leading-[0.94]">
                    Finally, a forecast that feels like <span className="text-[#2f5a4a]">taste</span>.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-[#5c5048] sm:text-lg sm:leading-8">
                    Canopy is a premium weather app for people who plan by feeling as much as temperature. It turns raw forecasts into mood, timing, and small rituals worth protecting.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="rounded-[1.6rem] border border-[#ddcfbf] bg-[#fffaf4]/90 p-5">
                  <p className="text-sm font-medium text-[#6a5d55]">Today in {todaySummary.location}</p>
                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <span className="text-5xl font-semibold tracking-[-0.05em] text-[#241815]">{todaySummary.temp}</span>
                    <p className="max-w-sm pb-1 text-sm leading-6 text-[#5f534a]">{todaySummary.condition}, {todaySummary.feeling}.</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#4d443f]">
                    <span className="rounded-full bg-[#ece2d6] px-3 py-2">pollen {todaySummary.pollen}</span>
                    <span className="rounded-full bg-[#e7efe9] px-3 py-2">{todaySummary.wind}</span>
                    <span className="rounded-full bg-[#efe5df] px-3 py-2">UV soft until 10:30 am</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:w-48">
                  <a
                    href="#join"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f5a4a] px-5 text-sm font-medium text-[#f6f0e8] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#24473b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f5a4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f2ea]"
                  >
                    request invite
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <p className="text-sm leading-6 text-[#6e6158]">First release includes live feel maps, routine alerts, and an experimental sky journal.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <article className="flex min-h-[16rem] flex-col justify-between rounded-[2rem] border border-[#d7c7b6] bg-[#23352f] p-6 text-[#f2ecdf] shadow-[0_24px_80px_rgba(33,48,40,0.24)] sm:p-7">
              <div className="flex items-center justify-between text-sm text-[#c6d6cd]">
                <span>morning read</span>
                <SunMedium className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <p className="text-4xl font-semibold tracking-[-0.05em]">Clear by 9:12</p>
                <p className="max-w-sm text-sm leading-6 text-[#d6e1db]">
                  Marine layer lifts just after coffee. Best window for a bright walk is 9:15 to 10:40.
                </p>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[2rem] border border-[#d7c7b6] bg-[#f1e5d6] p-6 text-[#2c1c17] shadow-[0_24px_80px_rgba(79,53,40,0.1)] sm:p-7">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-24 opacity-70"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, transparent, rgba(95,63,63,0.12)), radial-gradient(circle at 50% 100%, rgba(47,90,74,0.12), transparent 50%)",
                }}
              />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="flex items-center justify-between text-sm text-[#6f5c54]">
                  <span>night mode</span>
                  <CloudDrizzle className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <p className="text-2xl font-semibold tracking-[-0.04em]">It might drizzle for eleven minutes.</p>
                  <p className="text-sm leading-6 text-[#5e4d45]">
                    Canopy says bring the light jacket, not the emergency shell. Specificity is the product.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div className="space-y-5">
            <SectionEyebrow>why it feels different</SectionEyebrow>
            <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Forecasts built around decisions, not dashboards.
            </h2>
            <p className="max-w-xl text-base leading-7 text-[#5f534a]">
              Most weather apps drown you in chrome, maps, and anxious color. Canopy stays quiet until it has something useful to say, then says it with confidence.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isWide = index === 0 || index === 3;

              return (
                <article
                  key={feature.name}
                  className={`rounded-[1.75rem] border border-[#d7c7b6] bg-[#f8f2ea]/90 p-6 shadow-[0_18px_60px_rgba(69,46,35,0.06)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(69,46,35,0.08)] ${
                    isWide ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8ddd0] text-[#2f5a4a]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#241815]">{feature.name}</h3>
                        <p className="max-w-xl text-sm leading-6 text-[#5c5048]">{feature.copy}</p>
                      </div>
                    </div>
                    <Sparkles className="mt-1 hidden h-5 w-5 text-[#9f7f63] md:block" />
                  </div>
                  <p className="mt-5 max-w-xl text-sm leading-6 text-[#77675c]">{feature.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-[#d7c7b6] bg-[#5f3f3f] p-7 text-[#f7efe6] shadow-[0_24px_80px_rgba(95,63,63,0.18)] sm:p-8">
            <SectionEyebrow>personality section</SectionEyebrow>
            <div className="mt-4 space-y-4">
              <h2 className="max-w-sm text-3xl font-semibold tracking-[-0.05em] sm:text-[2.4rem]">
                Weather for people with rituals.
              </h2>
              <p className="max-w-md text-sm leading-7 text-[#f0dfd6]">
                Canopy doesn’t just say what the sky is doing. It notices the parts of the day you quietly care about and protects them.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {rituals.map((ritual) => (
              <article
                key={ritual.label}
                className="rounded-[1.75rem] border border-[#d7c7b6] bg-[#faf5ee]/95 p-6 shadow-[0_18px_60px_rgba(69,46,35,0.05)]"
              >
                <p className="text-sm uppercase tracking-[0.22em] text-[#87766a]">{ritual.label}</p>
                <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#241815]">{ritual.time}</p>
                <p className="mt-4 text-sm leading-6 text-[#5f534a]">{ritual.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#d7c7b6] bg-[#f8f2ea]/90 p-7 shadow-[0_20px_60px_rgba(69,46,35,0.06)] sm:p-8">
            <SectionEyebrow>inside the app</SectionEyebrow>
            <div className="mt-5 space-y-5">
              <h2 className="max-w-lg text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Premium weather intelligence, minus the weather-channel chaos.
              </h2>
              <p className="max-w-xl text-base leading-7 text-[#5f534a]">
                A tactile interface, warm night palette, and briefings that sound like a discerning friend. It’s the sort of utility you open because it feels good to open.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7c7b6] bg-[#23352f] p-7 text-[#f1ecdf] shadow-[0_24px_80px_rgba(33,48,40,0.2)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[#b6c6be]">sample briefing</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Thursday, soft start</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#d0ddd7]">
                feels like 64°
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white/5 p-5">
                <p className="text-sm text-[#b6c6be]">best outside window</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">10:20–1:40</p>
                <p className="mt-3 text-sm leading-6 text-[#d3ddd8]">Bright, dry, and still. A patio lunch or long walk will feel earned.</p>
              </div>
              <div className="rounded-[1.5rem] bg-white/5 p-5">
                <p className="text-sm text-[#b6c6be]">watch for</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">4:18 pm</p>
                <p className="mt-3 text-sm leading-6 text-[#d3ddd8]">Wind turns up right before sunset. Light layers beat heavy ones.</p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-[#b6c6be]">quiet mode</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#f1ecdf]">No storm alerts yet</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#d3ddd8]">
                This is the empty-sky state. When there’s nothing urgent to know, Canopy leaves the day alone and lets the forecast breathe.
              </p>
            </div>
          </div>
        </section>

        <section
          id="join"
          className="rounded-[2.2rem] border border-[#d7c7b6] bg-[#f8f2ea]/92 p-7 shadow-[0_26px_80px_rgba(69,46,35,0.07)] sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div className="space-y-5">
              <SectionEyebrow>call to action</SectionEyebrow>
              <div className="space-y-4">
                <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                  Join the preview before the first forecast drops.
                </h2>
                <p className="max-w-xl text-base leading-7 text-[#5f534a]">
                  We’re opening Canopy with a small group of people who want weather to feel more intimate, less industrial. If that sounds like your thing, get on the list.
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <label className="block text-sm font-medium text-[#4e433d]" htmlFor="email">
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-describedby="signup-status"
                  className="min-h-12 flex-1 rounded-full border border-[#ccb9a5] bg-[#fffaf4] px-5 text-base text-[#241815] outline-none transition focus:border-[#2f5a4a] focus:ring-2 focus:ring-[#2f5a4a]/20"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f5a4a] px-5 text-sm font-medium text-[#f6f0e8] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#24473b] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f5a4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f2ea]"
                >
                  {status === "submitting" ? "saving your spot" : "get early access"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p
                id="signup-status"
                className={`text-sm leading-6 ${
                  status === "error"
                    ? "text-[#8b3c3c]"
                    : status === "success"
                      ? "text-[#2f5a4a]"
                      : "text-[#6f6158]"
                }`}
                role="status"
              >
                {message}
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
