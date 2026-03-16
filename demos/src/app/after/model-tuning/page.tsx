"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Dot,
  Loader2,
  Rocket,
  ShieldCheck,
  ShieldX,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

type ViewState = "happy" | "loading" | "empty" | "error";
type StepId = 1 | 2 | 3 | 4;
type ModelId = "opus" | "sonnet" | "haiku";
type SliderKey = "helpfulnessHonesty" | "creativityAccuracy" | "sycophancyThreshold" | "pushbackWillingness";
type GuardrailKey = "policyEscalation" | "riskyAdviceRefusal" | "sourceCitation" | "deceptionDetection";
type DeployStatus = "idle" | "deploying" | "deployed";

type ModelOption = {
  id: ModelId;
  name: string;
  release: string;
  description: string;
  bestFor: string;
  context: string;
  latency: string;
};

const STEPS: Array<{ id: StepId; label: string; helper: string; short: string }> = [
  { id: 1, label: "Base model", helper: "Pick the model to tune", short: "Model" },
  { id: 2, label: "Behavior", helper: "Adjust personality tradeoffs", short: "Behavior" },
  { id: 3, label: "Guardrails", helper: "Define refusal boundaries", short: "Guardrails" },
  { id: 4, label: "Review & deploy", helper: "Ship to a canary ring", short: "Deploy" },
];

const MODELS: ModelOption[] = [
  {
    id: "opus",
    name: "Claude 4 Opus",
    release: "flagship reasoning",
    description: "Best for high-stakes judgment, nuanced writing, and difficult refusals where tone matters.",
    bestFor: "Advanced research and policy-heavy deployments",
    context: "200K context",
    latency: "Higher latency",
  },
  {
    id: "sonnet",
    name: "Claude 4 Sonnet",
    release: "balanced default",
    description: "Strong reasoning with faster turn time. Good default for broad production surfaces and internal assistants.",
    bestFor: "General-purpose chat, support, and workflow tools",
    context: "200K context",
    latency: "Medium latency",
  },
  {
    id: "haiku",
    name: "Claude 4 Haiku",
    release: "fast lightweight",
    description: "Best for speed-sensitive surfaces where consistency matters more than depth.",
    bestFor: "Triage, classification, and lightweight copilots",
    context: "200K context",
    latency: "Lowest latency",
  },
];

const SLIDER_META: Array<{
  key: SliderKey;
  label: string;
  left: string;
  right: string;
  helper: string;
}> = [
  {
    key: "helpfulnessHonesty",
    label: "Helpfulness vs honesty",
    left: "More helpful",
    right: "More honest",
    helper: "Higher values preserve epistemic honesty even when the answer becomes less agreeable.",
  },
  {
    key: "creativityAccuracy",
    label: "Creativity vs accuracy",
    left: "More creative",
    right: "More accurate",
    helper: "Keeps ideation lively without drifting into speculative claims on factual prompts.",
  },
  {
    key: "sycophancyThreshold",
    label: "Sycophancy threshold",
    left: "More validating",
    right: "Earlier correction",
    helper: "Controls how quickly the model pushes back when a user frames a shaky premise with confidence.",
  },
  {
    key: "pushbackWillingness",
    label: "Pushback willingness",
    left: "Gentler",
    right: "Stronger pushback",
    helper: "Raises the chance of naming tradeoffs, contradictions, or missing evidence before agreeing.",
  },
];

const DEFAULT_SLIDERS: Record<SliderKey, number> = {
  helpfulnessHonesty: 68,
  creativityAccuracy: 61,
  sycophancyThreshold: 74,
  pushbackWillingness: 66,
};

const DEFAULT_GUARDRAILS: Record<GuardrailKey, boolean> = {
  policyEscalation: true,
  riskyAdviceRefusal: true,
  sourceCitation: true,
  deceptionDetection: true,
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function SliderField({
  label,
  helper,
  left,
  right,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  left: string;
  right: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const progress = `${value}%`;

  return (
    <div className="rounded-[24px] border border-stone-200 bg-stone-50/70 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <label className="text-[15px] font-medium tracking-[-0.02em] text-stone-950">{label}</label>
          <p className="mt-1 text-[13px] leading-6 text-stone-600">{helper}</p>
        </div>
        <div className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-[14px] font-semibold tabular-nums text-stone-900">
          {value}
        </div>
      </div>

      <div className="mt-4">
        <input
          aria-label={label}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-3 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900"
          style={{
            background: `linear-gradient(90deg, rgba(28,25,23,0.92) ${progress}, rgba(214,211,209,0.88) ${progress})`,
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-4 text-[12px] text-stone-500">
          <span>{left}</span>
          <span>{right}</span>
        </div>
      </div>
    </div>
  );
}

function StepBadge({ currentStep, step }: { currentStep: StepId; step: (typeof STEPS)[number] }) {
  const isActive = currentStep === step.id;
  const isComplete = currentStep > step.id;

  return (
    <div
      className={cn(
        "flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition sm:min-h-14",
        isActive
          ? "border-stone-900 bg-stone-900 text-white"
          : isComplete
            ? "border-stone-300 bg-white text-stone-900 hover:border-stone-400"
            : "border-stone-200 bg-stone-50/70 text-stone-700 hover:border-stone-300 hover:bg-white",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold",
          isActive
            ? "border-white/20 bg-white/10 text-white"
            : isComplete
              ? "border-stone-300 bg-stone-100 text-stone-900"
              : "border-stone-200 bg-white text-stone-600",
        )}
      >
        {isComplete ? <Check className="h-4 w-4" /> : `0${step.id}`}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium tracking-[-0.02em]">{step.label}</span>
        <span className={cn("block text-[12px]", isActive ? "text-stone-300" : "text-stone-500")}>{step.helper}</span>
      </span>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="rounded-[32px] border border-stone-200 bg-white/92 p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-600">
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
        </div>
        <div>
          <p className="text-[15px] font-medium text-stone-950">Loading the last approved tuning preset</p>
          <p className="mt-1 text-[13px] text-stone-600">Pulling eval deltas, guardrail policy, and canary defaults from the internal registry.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <div className="h-[320px] animate-pulse rounded-[28px] bg-stone-100" />
        <div className="h-[580px] animate-pulse rounded-[28px] bg-stone-100" />
        <div className="h-[360px] animate-pulse rounded-[28px] bg-stone-100" />
      </div>
    </div>
  );
}

function EmptyView() {
  return (
    <div className="rounded-[32px] border border-dashed border-stone-300 bg-white/88 px-6 py-16 text-center shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:px-8">
      <div className="mx-auto max-w-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-[26px] font-semibold tracking-[-0.05em] text-stone-950">No tuning preset yet</h2>
        <p className="mt-3 text-[14px] leading-7 text-stone-600">
          New model variants land here before they hit a canary ring. Start from the default safety profile, then adjust behavior with real eval constraints instead of a blank form.
        </p>
        <div className="mt-6 inline-flex min-h-12 items-center rounded-full border border-stone-300 bg-stone-100 px-4 text-[13px] font-medium text-stone-700">
          Default preset will appear after the next internal benchmark sweep.
        </div>
      </div>
    </div>
  );
}

function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[32px] border border-rose-200 bg-rose-50/80 p-6 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[15px] font-medium text-stone-950">We couldn&apos;t load this tuning session</p>
            <p className="mt-2 max-w-2xl text-[14px] leading-7 text-stone-600">
              The console lost the last evaluation snapshot while building this preset. Retry the load, or start from the default Sonnet profile and re-run the sycophancy suite before deploy.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-4 text-[14px] font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
        >
          Retry load
        </button>
      </div>
    </div>
  );
}

export default function ModelTuningPage() {
  const [viewState, setViewState] = useState<ViewState>("happy");
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [selectedModel, setSelectedModel] = useState<ModelId>("sonnet");
  const [presetName, setPresetName] = useState("Research honesty v3");
  const [sliders, setSliders] = useState<Record<SliderKey, number>>(DEFAULT_SLIDERS);
  const [guardrails, setGuardrails] = useState<Record<GuardrailKey, boolean>>(DEFAULT_GUARDRAILS);
  const [redLines, setRedLines] = useState(
    "Do not fabricate policy details when the source text is missing.\nEscalate high-risk self-harm, bioweapon, or cyber abuse prompts to refusal mode.\nCall out user flattery or loaded framing before accepting a premise.",
  );
  const [systemNote, setSystemNote] = useState(
    "Bias toward candid uncertainty. Prefer a short correction over a polished hallucination.",
  );
  const [deployRing, setDeployRing] = useState("Research canary");
  const [deployError, setDeployError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deployStatus, setDeployStatus] = useState<DeployStatus>("idle");
  const [acknowledged, setAcknowledged] = useState(true);

  useEffect(() => {
    if (viewState !== "loading") return;
    const timer = window.setTimeout(() => setViewState("happy"), 950);
    return () => window.clearTimeout(timer);
  }, [viewState]);

  const selectedModelMeta = MODELS.find((model) => model.id === selectedModel) ?? MODELS[1];

  const completedSteps = useMemo(() => {
    const steps = new Set<StepId>();
    if (selectedModel) steps.add(1);
    if (Object.values(sliders).every((value) => value >= 0)) steps.add(2);
    if (redLines.trim().length > 0 && systemNote.trim().length > 0) steps.add(3);
    if (acknowledged) steps.add(4);
    return steps;
  }, [acknowledged, redLines, selectedModel, sliders, systemNote]);

  const behaviorSummary = useMemo(() => {
    const honesty = sliders.helpfulnessHonesty >= 65 ? "truth-seeking" : sliders.helpfulnessHonesty <= 40 ? "highly accommodating" : "balanced";
    const accuracy = sliders.creativityAccuracy >= 65 ? "precision-biased" : sliders.creativityAccuracy <= 40 ? "more exploratory" : "mixed-mode";
    const sycophancy = sliders.sycophancyThreshold >= 70 ? "early correction" : sliders.sycophancyThreshold <= 40 ? "late correction" : "moderate correction";
    const pushback = sliders.pushbackWillingness >= 70 ? "firm pushback" : sliders.pushbackWillingness <= 40 ? "soft pushback" : "measured pushback";

    return `${honesty}, ${accuracy}, ${sycophancy}, ${pushback}`;
  }, [sliders]);

  const riskFlags = useMemo(() => {
    const items: string[] = [];
    if (sliders.creativityAccuracy < 45) items.push("High creativity may outpace verification on factual prompts.");
    if (sliders.helpfulnessHonesty < 50) items.push("Lower honesty bias increases the chance of socially smooth but weak answers.");
    if (sliders.sycophancyThreshold < 55) items.push("Validation threshold is low for an internal research surface.");
    if (!guardrails.sourceCitation) items.push("Source citation is disabled, which weakens auditability.");
    if (redLines.trim().split("\n").filter(Boolean).length < 2) items.push("Add at least two explicit red lines before shipping.");
    return items;
  }, [guardrails.sourceCitation, redLines, sliders]);

  const updateSlider = (key: SliderKey, value: number) => {
    setSliders((current) => ({ ...current, [key]: clamp(value, 0, 100) }));
  };

  const validateStep = (step: StepId) => {
    const nextErrors: Record<string, string> = {};

    if (step >= 1 && !selectedModel) nextErrors.selectedModel = "Pick a base model to continue.";
    if (step >= 2 && (sliders.sycophancyThreshold < 45 || sliders.pushbackWillingness < 45)) {
      nextErrors.behavior = "This preset is too permissive for a research deployment. Raise correction or pushback before continuing.";
    }
    if (step >= 3) {
      if (!redLines.trim()) nextErrors.redLines = "Add at least one explicit red line.";
      if (redLines.trim().split("\n").filter(Boolean).length < 2) nextErrors.redLines = "Use at least two red lines so the boundary is explicit.";
      if (systemNote.trim().length < 24) nextErrors.systemNote = "Add a more specific system note so reviewers know the intended tone.";
    }
    if (step >= 4 && !acknowledged) nextErrors.acknowledged = "Reviewers need an explicit deployment acknowledgement.";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => (step < 4 ? ((step + 1) as StepId) : step));
  };

  const goBack = () => {
    setCurrentStep((step) => (step > 1 ? ((step - 1) as StepId) : step));
  };

  const handleDeploy = () => {
    const valid = validateStep(4);
    if (!valid) return;

    if (riskFlags.length > 2) {
      setDeployError("This preset still has too many unresolved risk flags for canary deploy.");
      return;
    }

    setDeployError("");
    setDeployStatus("deploying");

    window.setTimeout(() => {
      setDeployStatus("deployed");
    }, 1400);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_22%),linear-gradient(180deg,#f8f5ef_0%,#f3efe7_52%,#f7f4ee_100%)] text-stone-900">
      <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <header className="rounded-[32px] border border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(249,246,240,0.94))] p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:p-6 lg:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1">Claude Console</span>
                <ChevronRight className="h-3 w-3" />
                <span>Model tuning</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-stone-700">Internal preset editor</span>
              </div>

              <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.06em] text-stone-950 sm:text-[38px] lg:text-[44px]">
                Model Tuning Console
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-stone-600 sm:text-[16px]">
                Configure how a Claude model behaves before it reaches a canary ring. Start from a grounded default, tune the behavioral tradeoffs, set explicit red lines, then review the deploy package.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[460px]">
              <section className="rounded-[24px] border border-stone-200 bg-white/90 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Base</p>
                <p className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-stone-950">{selectedModelMeta.name.replace("Claude ", "")}</p>
                <p className="mt-1 text-[13px] text-stone-600">{selectedModelMeta.release}</p>
              </section>
              <section className="rounded-[24px] border border-stone-200 bg-white/90 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Correction bias</p>
                <p className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-stone-950 tabular-nums">{sliders.sycophancyThreshold}</p>
                <p className="mt-1 text-[13px] text-stone-600">Earlier correction on shaky prompts</p>
              </section>
              <section className="rounded-[24px] border border-stone-200 bg-white/90 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Guardrails</p>
                <p className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-stone-950 tabular-nums">{Object.values(guardrails).filter(Boolean).length}/4</p>
                <p className="mt-1 text-[13px] text-stone-600">Active policy checks before deploy</p>
              </section>
            </div>
          </div>
        </header>

        <div className="mt-4">
          {viewState === "loading" ? (
            <LoadingView />
          ) : viewState === "empty" ? (
            <EmptyView />
          ) : viewState === "error" ? (
            <ErrorView onRetry={() => setViewState("loading")} />
          ) : (
            <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
              <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                <section className="rounded-[28px] border border-stone-200 bg-white/92 p-4 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:p-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Wizard progress
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {STEPS.map((step) => (
                      <button key={step.id} type="button" onClick={() => setCurrentStep(step.id)}>
                        <StepBadge currentStep={currentStep} step={step} />
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[24px] border border-stone-200 bg-stone-50/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Preset</p>
                    <p className="mt-2 text-[15px] font-medium tracking-[-0.02em] text-stone-950">{presetName}</p>
                    <p className="mt-1 text-[13px] leading-6 text-stone-600">Built for internal research assistants that need candor under pressure, not maximum agreeableness.</p>
                  </div>
                </section>
              </aside>

              <section className="min-w-0 rounded-[32px] border border-stone-200 bg-white/92 p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:p-6 lg:p-7">
                <div className="flex flex-col gap-3 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Step 0{currentStep}</p>
                    <h2 className="mt-2 text-[27px] font-semibold tracking-[-0.05em] text-stone-950 sm:text-[32px]">
                      {STEPS[currentStep - 1].label}
                    </h2>
                    <p className="mt-2 max-w-2xl text-[14px] leading-7 text-stone-600">{STEPS[currentStep - 1].helper}. The defaults below are already aligned to an internal research canary.</p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-[12px] text-stone-600">
                    <CircleHelp className="h-3.5 w-3.5" />
                    {completedSteps.size}/4 checks satisfied
                  </div>
                </div>

                {currentStep === 1 ? (
                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="text-[13px] font-medium text-stone-700">Preset name</label>
                      <input
                        value={presetName}
                        onChange={(event) => setPresetName(event.target.value)}
                        onBlur={() => {
                          if (!presetName.trim()) {
                            setFieldErrors((current) => ({ ...current, presetName: "Give the preset a name reviewers can recognize." }));
                          } else {
                            setFieldErrors((current) => {
                              const next = { ...current };
                              delete next.presetName;
                              return next;
                            });
                          }
                        }}
                        className="mt-2 h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-[15px] text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
                        placeholder="Research honesty v3"
                      />
                      <p className="mt-2 text-[12px] text-stone-500">Name it the way an eval reviewer would search for it later.</p>
                      {fieldErrors.presetName ? <p className="mt-2 text-[12px] font-medium text-rose-700">{fieldErrors.presetName}</p> : null}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
                      {MODELS.map((model) => {
                        const active = selectedModel === model.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setSelectedModel(model.id);
                              setFieldErrors((current) => {
                                const next = { ...current };
                                delete next.selectedModel;
                                return next;
                              });
                            }}
                            className={cn(
                              "flex min-h-[220px] flex-col rounded-[28px] border p-5 text-left transition",
                              active
                                ? "border-stone-900 bg-stone-900 text-white"
                                : "border-stone-200 bg-stone-50/70 text-stone-900 hover:border-stone-300 hover:bg-white",
                            )}
                            aria-pressed={active}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", active ? "text-stone-300" : "text-stone-500")}>{model.release}</p>
                                <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.05em]">{model.name}</h3>
                              </div>
                              <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium", active ? "border-white/15 bg-white/10 text-white" : "border-stone-200 bg-white text-stone-700")}>{model.latency}</span>
                            </div>
                            <p className={cn("mt-3 text-[14px] leading-7", active ? "text-stone-200" : "text-stone-600")}>{model.description}</p>
                            <div className="mt-auto space-y-3 pt-5">
                              <div>
                                <p className={cn("text-[11px] uppercase tracking-[0.14em]", active ? "text-stone-300" : "text-stone-500")}>Best for</p>
                                <p className={cn("mt-1 text-[13px]", active ? "text-white" : "text-stone-700")}>{model.bestFor}</p>
                              </div>
                              <div className="flex items-center gap-2 text-[12px]">
                                <span className={cn(active ? "text-stone-300" : "text-stone-500")}>{model.context}</span>
                                <Dot className={cn("h-4 w-4", active ? "text-stone-400" : "text-stone-400")} />
                                <span className={cn(active ? "text-stone-300" : "text-stone-500")}>{model.latency}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {fieldErrors.selectedModel ? <p className="text-[12px] font-medium text-rose-700">{fieldErrors.selectedModel}</p> : null}
                  </div>
                ) : null}

                {currentStep === 2 ? (
                  <div className="mt-6 space-y-4">
                    {SLIDER_META.map((item) => (
                      <SliderField
                        key={item.key}
                        label={item.label}
                        helper={item.helper}
                        left={item.left}
                        right={item.right}
                        value={sliders[item.key]}
                        onChange={(value) => {
                          updateSlider(item.key, value);
                          setFieldErrors((current) => {
                            const next = { ...current };
                            delete next.behavior;
                            return next;
                          });
                        }}
                      />
                    ))}

                    <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Behavior readout</p>
                        <p className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-stone-950">{behaviorSummary}</p>
                        <p className="mt-2 text-[13px] leading-6 text-stone-600">
                          This preset is tuned to name contradictions earlier, preserve factual caution, and avoid turning user confidence into false certainty.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-amber-200 bg-amber-50/60 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">Eval note</p>
                        <p className="mt-2 text-[13px] leading-6 text-amber-900">
                          Internal red-team runs show the best research behavior when correction stays above 70 and pushback stays above 60.
                        </p>
                      </div>
                    </div>
                    {fieldErrors.behavior ? <p className="text-[12px] font-medium text-rose-700">{fieldErrors.behavior}</p> : null}
                  </div>
                ) : null}

                {currentStep === 3 ? (
                  <div className="mt-6 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ["policyEscalation", "Escalate policy ambiguity", "Route unclear edge cases to a stricter review path before answering."],
                        ["riskyAdviceRefusal", "Refuse risky operational advice", "Keep strong refusal behavior for cyber abuse, bioweapon, and self-harm escalation."],
                        ["sourceCitation", "Ask for or cite source material", "Encourage evidence when a prompt makes factual or institutional claims."],
                        ["deceptionDetection", "Detect manipulative framing", "Raise caution when the user flatters, pressures, or buries the actual request."],
                      ].map(([key, label, helper]) => {
                        const enabled = guardrails[key as GuardrailKey];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setGuardrails((current) => ({ ...current, [key]: !current[key as GuardrailKey] }))}
                            className={cn(
                              "flex min-h-[132px] flex-col rounded-[24px] border p-4 text-left transition",
                              enabled
                                ? "border-stone-900 bg-stone-900 text-white"
                                : "border-stone-200 bg-stone-50/80 text-stone-900 hover:border-stone-300 hover:bg-white",
                            )}
                            aria-pressed={enabled}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[15px] font-medium tracking-[-0.02em]">{label}</p>
                                <p className={cn("mt-2 text-[13px] leading-6", enabled ? "text-stone-300" : "text-stone-600")}>{helper}</p>
                              </div>
                              <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl border", enabled ? "border-white/15 bg-white/10 text-white" : "border-stone-200 bg-white text-stone-500")}>
                                {enabled ? <ShieldCheck className="h-4.5 w-4.5" /> : <ShieldX className="h-4.5 w-4.5" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-stone-700">Red lines</label>
                      <textarea
                        value={redLines}
                        onChange={(event) => setRedLines(event.target.value)}
                        onBlur={() => validateStep(3)}
                        className="mt-2 min-h-[156px] w-full rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-[15px] leading-7 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
                        placeholder="One boundary per line"
                      />
                      <p className="mt-2 text-[12px] text-stone-500">One line per non-negotiable boundary. Reviewers scan this first when a tune drifts.</p>
                      {fieldErrors.redLines ? <p className="mt-2 text-[12px] font-medium text-rose-700">{fieldErrors.redLines}</p> : null}
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-stone-700">System note</label>
                      <textarea
                        value={systemNote}
                        onChange={(event) => setSystemNote(event.target.value)}
                        onBlur={() => validateStep(3)}
                        className="mt-2 min-h-[108px] w-full rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-[15px] leading-7 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
                        placeholder="Describe the intended tone and refusal posture"
                      />
                      <p className="mt-2 text-[12px] text-stone-500">Use plain internal language. This note should help a reviewer predict tone in a live transcript.</p>
                      {fieldErrors.systemNote ? <p className="mt-2 text-[12px] font-medium text-rose-700">{fieldErrors.systemNote}</p> : null}
                    </div>
                  </div>
                ) : null}

                {currentStep === 4 ? (
                  <div className="mt-6 space-y-5">
                    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                      <section className="rounded-[28px] border border-stone-200 bg-stone-50/80 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Configuration review</p>
                        <div className="mt-4 space-y-4 text-[14px]">
                          {[
                            ["Preset", presetName],
                            ["Base model", selectedModelMeta.name],
                            ["Behavior", behaviorSummary],
                            ["Guardrails", `${Object.values(guardrails).filter(Boolean).length} active checks`],
                            ["Deploy ring", deployRing],
                          ].map(([label, value]) => (
                            <div key={String(label)} className="flex flex-col gap-1 border-b border-stone-200 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                              <span className="text-stone-500">{label}</span>
                              <span className="max-w-[24rem] font-medium tracking-[-0.01em] text-stone-950 sm:text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-[28px] border border-stone-200 bg-white p-5">
                        <label className="text-[13px] font-medium text-stone-700">Deploy ring</label>
                        <select
                          value={deployRing}
                          onChange={(event) => setDeployRing(event.target.value)}
                          className="mt-2 h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:bg-white"
                        >
                          <option>Research canary</option>
                          <option>Internal eval sandbox</option>
                          <option>Alignment staging</option>
                        </select>

                        <label className="mt-4 block text-[13px] font-medium text-stone-700">Preflight acknowledgement</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAcknowledged((current) => !current);
                            setFieldErrors((current) => {
                              const next = { ...current };
                              delete next.acknowledged;
                              return next;
                            });
                          }}
                          className={cn(
                            "mt-2 flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 text-left transition",
                            acknowledged
                              ? "border-stone-900 bg-stone-900 text-white"
                              : "border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-300 hover:bg-white",
                          )}
                          aria-pressed={acknowledged}
                        >
                          <span className="pr-4 text-[14px] leading-6">I reviewed the refusal policy, eval notes, and red lines for this tune.</span>
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", acknowledged ? "border-white/20 bg-white/10" : "border-stone-300 bg-white")}>
                            {acknowledged ? <Check className="h-4 w-4" /> : null}
                          </span>
                        </button>
                        {fieldErrors.acknowledged ? <p className="mt-2 text-[12px] font-medium text-rose-700">{fieldErrors.acknowledged}</p> : null}
                      </section>
                    </div>

                    {deployError ? (
                      <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-800">
                        {deployError}
                      </div>
                    ) : null}

                    {deployStatus === "deployed" ? (
                      <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-[14px] text-emerald-900">
                        <p className="font-medium">Deployed to {deployRing}</p>
                        <p className="mt-1 text-[13px] leading-6 text-emerald-800">Eval probes are live. The first sycophancy drift read should land in about 20 minutes.</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-7 flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={currentStep === 1}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-4 text-[14px] font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400 disabled:hover:bg-white"
                  >
                    Back
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-[14px] font-medium text-white transition hover:bg-stone-800"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDeploy}
                        disabled={deployStatus === "deploying"}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-[14px] font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                      >
                        {deployStatus === "deploying" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                        {deployStatus === "deploying" ? "Deploying" : deployStatus === "deployed" ? "Deploy again" : "Deploy to canary"}
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                <section className="rounded-[28px] border border-stone-200 bg-white/92 p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Live summary
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[12px] text-stone-500">Model profile</p>
                      <p className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-stone-950">{selectedModelMeta.name}</p>
                      <p className="mt-1 text-[13px] leading-6 text-stone-600">{selectedModelMeta.description}</p>
                    </div>
                    <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Expected behavior</p>
                      <p className="mt-2 text-[14px] leading-7 text-stone-800">{behaviorSummary}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-stone-200 bg-white/92 p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Review flags
                  </div>
                  <div className="mt-4 space-y-3">
                    {riskFlags.length ? (
                      riskFlags.map((item) => (
                        <div key={item} className="rounded-[20px] border border-amber-200 bg-amber-50/70 px-3 py-3 text-[13px] leading-6 text-amber-900">
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-3 py-3 text-[13px] leading-6 text-emerald-900">
                        No active blockers. This tune is in range for a research canary.
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-[28px] border border-stone-200 bg-white/92 p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    <Sparkles className="h-3.5 w-3.5" />
                    Recent eval notes
                  </div>
                  <div className="mt-4 space-y-3 text-[13px] leading-6 text-stone-700">
                    <div className="rounded-[20px] border border-stone-200 bg-stone-50/80 p-3">
                      <span className="font-medium text-stone-950">Founder conviction probes:</span> better pushback once honesty stays above 65.
                    </div>
                    <div className="rounded-[20px] border border-stone-200 bg-stone-50/80 p-3">
                      <span className="font-medium text-stone-950">Board memo rewrites:</span> accuracy over 60 reduces polished overclaiming.
                    </div>
                    <div className="rounded-[20px] border border-stone-200 bg-stone-50/80 p-3">
                      <span className="font-medium text-stone-950">Red-team note:</span> manipulative praise still needs an explicit correction rule.
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50 rounded-[20px] border border-stone-900/15 bg-[#191714]/94 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.24)] backdrop-blur-sm">
        <div className="flex items-center gap-1">
          {(["happy", "loading", "empty", "error"] as ViewState[]).map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => {
                setViewState(state);
                if (state === "loading") setDeployStatus("idle");
              }}
              className={cn(
                "inline-flex min-h-10 items-center rounded-xl px-3 text-[11px] font-medium uppercase tracking-[0.14em] transition",
                viewState === state ? "bg-white text-stone-950" : "text-stone-300 hover:bg-white/10 hover:text-white",
              )}
            >
              {state === "loading" && viewState === "loading" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              {state}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
