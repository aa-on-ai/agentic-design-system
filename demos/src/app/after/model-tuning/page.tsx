"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Eye,
  Loader2,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type ViewState = "happy" | "loading" | "empty" | "error";
type StepId = 1 | 2 | 3 | 4;
type ModelId = "opus" | "sonnet" | "haiku";
type DeployStatus = "idle" | "deploying" | "deployed";
type SliderKey =
  | "helpfulnessHonesty"
  | "creativityAccuracy"
  | "sycophancyThreshold"
  | "pushbackWillingness";
type GuardrailKey =
  | "policyEscalation"
  | "sensitiveAdviceRefusal"
  | "sourceGrounding"
  | "flatteryDetection"
  | "memoryBoundaries"
  | "speculationControl";

type ModelOption = {
  id: ModelId;
  name: string;
  apiId: string;
  release: string;
  description: string;
  bestFor: string;
  context: string;
  latency: string;
  output: string;
  defaults: Record<SliderKey, number>;
  note: string;
};

type StepMeta = {
  id: StepId;
  label: string;
  helper: string;
  short: string;
};

type GuardrailMeta = {
  key: GuardrailKey;
  label: string;
  helper: string;
  critical?: boolean;
  advanced?: boolean;
};

const STEPS: StepMeta[] = [
  { id: 1, label: "Base model", helper: "Start from a grounded default", short: "Model" },
  { id: 2, label: "Behavior", helper: "Tune social and epistemic tradeoffs", short: "Behavior" },
  { id: 3, label: "Guardrails", helper: "Set refusal posture and red lines", short: "Guardrails" },
  { id: 4, label: "Review & deploy", helper: "Validate the package before canary", short: "Deploy" },
];

const MODELS: ModelOption[] = [
  {
    id: "opus",
    name: "Claude Opus 4.6",
    apiId: "claude-opus-4-6",
    release: "highest capability",
    description:
      "Best for model behavior research, difficult judgment calls, and high-stakes deployment reviews where nuance matters.",
    bestFor: "Alignment evaluation, model policy reviews, and complex research assistants",
    context: "1M context",
    latency: "Moderate",
    output: "128K output",
    note: "Opus 4.6 is the strongest option when the failure mode is subtle social drift rather than obvious refusal failure.",
    defaults: {
      helpfulnessHonesty: 78,
      creativityAccuracy: 73,
      sycophancyThreshold: 82,
      pushbackWillingness: 76,
    },
  },
  {
    id: "sonnet",
    name: "Claude Sonnet 4.6",
    apiId: "claude-sonnet-4-6",
    release: "balanced default",
    description:
      "The best speed-to-intelligence tradeoff for broad product surfaces. Strong enough for nuanced pushback without feeling heavy.",
    bestFor: "General assistant behavior tuning, production defaults, and internal research copilots",
    context: "1M context",
    latency: "Fast",
    output: "64K output",
    note: "Sonnet 4.6 is the default internal starting point because it stays sharp under pressure without paying the full Opus latency tax.",
    defaults: {
      helpfulnessHonesty: 72,
      creativityAccuracy: 66,
      sycophancyThreshold: 76,
      pushbackWillingness: 69,
    },
  },
  {
    id: "haiku",
    name: "Claude Haiku 4.5",
    apiId: "claude-haiku-4-5",
    release: "fastest path",
    description:
      "Fastest current model with near-frontier intelligence. Best when responsiveness matters and the safety posture needs to stay simple and explicit.",
    bestFor: "Triage, routing, lightweight assistants, and speed-sensitive internal workflows",
    context: "200K context",
    latency: "Fastest",
    output: "64K output",
    note: "Haiku 4.5 benefits from firmer defaults. If you relax correction too much, it starts optimizing for smoothness over resistance.",
    defaults: {
      helpfulnessHonesty: 70,
      creativityAccuracy: 71,
      sycophancyThreshold: 79,
      pushbackWillingness: 72,
    },
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
    helper: "Higher values preserve candor when the user wants reassurance more than truth.",
  },
  {
    key: "creativityAccuracy",
    label: "Creativity vs accuracy",
    left: "More creative",
    right: "More accurate",
    helper: "Higher values reduce speculative flourish on factual or policy-sensitive prompts.",
  },
  {
    key: "sycophancyThreshold",
    label: "Sycophancy threshold",
    left: "Later correction",
    right: "Earlier correction",
    helper: "Controls how quickly the model challenges a flattering or shaky premise instead of going along with it.",
  },
  {
    key: "pushbackWillingness",
    label: "Pushback willingness",
    left: "Softer pushback",
    right: "Stronger pushback",
    helper: "Higher values increase the chance that Claude names contradictions, missing evidence, or weak assumptions directly.",
  },
];

const GUARDRAILS: GuardrailMeta[] = [
  {
    key: "policyEscalation",
    label: "Escalate policy ambiguity",
    helper: "Route uncertain edge cases to a stricter review path instead of improvising.",
    critical: true,
  },
  {
    key: "sensitiveAdviceRefusal",
    label: "Refuse sensitive operational advice",
    helper: "Keep strong refusal behavior for cyber abuse, self-harm, and harmful biological assistance.",
    critical: true,
  },
  {
    key: "sourceGrounding",
    label: "Prefer source-grounded answers",
    helper: "Ask for evidence or cite internal material before making institutional claims.",
    critical: true,
  },
  {
    key: "flatteryDetection",
    label: "Detect manipulative framing",
    helper: "Notice praise, pressure, and social steering before accepting the user’s frame.",
    critical: true,
  },
  {
    key: "memoryBoundaries",
    label: "Respect memory boundaries",
    helper: "Avoid implying long-term memory or durable user models beyond the actual session scope.",
    advanced: true,
  },
  {
    key: "speculationControl",
    label: "Downgrade unsupported speculation",
    helper: "Prefer uncertainty language over polished guesses when evidence is thin.",
    advanced: true,
  },
];

const DEFAULT_GUARDRAILS: Record<GuardrailKey, boolean> = {
  policyEscalation: true,
  sensitiveAdviceRefusal: true,
  sourceGrounding: true,
  flatteryDetection: true,
  memoryBoundaries: true,
  speculationControl: true,
};

const DEPLOY_RINGS = ["Research canary", "Internal eval sandbox", "Alignment staging"];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getModelDefaults(modelId: ModelId) {
  return MODELS.find((model) => model.id === modelId)?.defaults ?? MODELS[1].defaults;
}

function getPresetStarter(modelId: ModelId) {
  if (modelId === "opus") return "Policy candor v2";
  if (modelId === "haiku") return "Fast correction v1";
  return "Research honesty v4";
}

function getRedLines(modelId: ModelId) {
  if (modelId === "haiku") {
    return [
      "Do not invent sources, citations, or deployment facts when the prompt is underspecified.",
      "Interrupt praise-seeking prompts that pressure the model to confirm a weak conclusion.",
      "Escalate harmful operational advice instead of softening the refusal to stay agreeable.",
    ].join("\n");
  }

  if (modelId === "opus") {
    return [
      "Do not convert uncertainty into polished confidence when the evidence is mixed.",
      "Name missing evidence before endorsing a high-status user’s framing.",
      "Escalate self-harm, cyber abuse, and dangerous biological assistance to strict refusal behavior.",
    ].join("\n");
  }

  return [
    "Do not fabricate policy details, rollout plans, or source material when context is incomplete.",
    "Treat flattery, urgency, and loaded framing as risk signals before accepting the premise.",
    "Escalate harmful operational requests to refusal mode instead of answering partially.",
  ].join("\n");
}

function getSystemNote(modelId: ModelId) {
  if (modelId === "opus") {
    return "Bias toward precise uncertainty. Prefer a brief correction with evidence over a smoother answer that preserves the user’s self-story.";
  }

  if (modelId === "haiku") {
    return "Keep replies compact, concrete, and source-seeking. If the prompt invites flattery or speculation, slow down and name the gap.";
  }

  return "Default to candid, useful answers. Preserve warmth, but do not trade accuracy or intellectual honesty for rapport.";
}

function getBehaviorSummary(sliders: Record<SliderKey, number>) {
  const honesty =
    sliders.helpfulnessHonesty >= 76
      ? "truth-forward"
      : sliders.helpfulnessHonesty <= 45
        ? "agreeable"
        : "balanced";

  const accuracy =
    sliders.creativityAccuracy >= 72
      ? "precision-biased"
      : sliders.creativityAccuracy <= 45
        ? "exploratory"
        : "mixed-mode";

  const correction =
    sliders.sycophancyThreshold >= 78
      ? "early correction"
      : sliders.sycophancyThreshold <= 52
        ? "late correction"
        : "moderate correction";

  const pushback =
    sliders.pushbackWillingness >= 74
      ? "firm pushback"
      : sliders.pushbackWillingness <= 50
        ? "soft pushback"
        : "measured pushback";

  return `${honesty}, ${accuracy}, ${correction}, ${pushback}`;
}

function getBehaviorNote(sliders: Record<SliderKey, number>) {
  if (sliders.helpfulnessHonesty < 55) {
    return "This tune may preserve social smoothness at the expense of epistemic honesty.";
  }
  if (sliders.sycophancyThreshold > 80 && sliders.pushbackWillingness > 74) {
    return "This tune should challenge loaded premises early without drifting into a hostile tone.";
  }
  if (sliders.creativityAccuracy > 75) {
    return "This tune favors grounded answers and should reduce polished overclaiming on factual prompts.";
  }
  return "This tune stays in the middle. Good for general research surfaces, but review whether it is distinctive enough for the intended canary.";
}

function getRiskFlags(
  sliders: Record<SliderKey, number>,
  guardrails: Record<GuardrailKey, boolean>,
  redLines: string,
) {
  const flags: string[] = [];

  if (sliders.helpfulnessHonesty < 58) {
    flags.push("Honesty bias is low for an internal research preset.");
  }
  if (sliders.creativityAccuracy < 52) {
    flags.push("Creativity is outrunning accuracy. Expect cleaner prose with weaker factual restraint.");
  }
  if (sliders.sycophancyThreshold < 68) {
    flags.push("Correction threshold is too permissive for premise-checking work.");
  }
  if (sliders.pushbackWillingness < 62) {
    flags.push("Pushback is soft enough that confident users may steer the answer too easily.");
  }
  if (!guardrails.sourceGrounding) {
    flags.push("Source grounding is off, which weakens auditability.");
  }
  if (!guardrails.flatteryDetection) {
    flags.push("Flattery detection is off, so social steering may slip through.");
  }
  if (redLines.trim().split("\n").filter(Boolean).length < 2) {
    flags.push("Add at least two explicit red lines before deploy.");
  }

  return flags;
}

function LoadingView() {
  return (
    <div className="rounded-[30px] border border-[#d9d1c5] bg-white/90 p-5 shadow-[0_1px_0_rgba(41,37,36,0.03)] sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ddd4c8] bg-[#f7f2ea] text-[#5b554d]">
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
        </div>
        <div>
          <p className="text-[15px] font-medium text-[#1f1c18]">Loading the last approved tuning package</p>
          <p className="mt-1 text-[13px] leading-6 text-[#6f675d]">
            Pulling eval deltas, behavior defaults, and review notes from the internal registry.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)_340px]">
        <div className="h-[320px] animate-pulse rounded-[26px] bg-[#efe7da]" />
        <div className="h-[720px] animate-pulse rounded-[26px] bg-[#efe7da]" />
        <div className="h-[420px] animate-pulse rounded-[26px] bg-[#efe7da]" />
      </div>
    </div>
  );
}

function EmptyView({ onRestore }: { onRestore: () => void }) {
  return (
    <div className="rounded-[30px] border border-dashed border-[#d2c6b6] bg-white/85 px-6 py-16 text-center shadow-[0_1px_0_rgba(41,37,36,0.03)] sm:px-8">
      <div className="mx-auto max-w-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ddd3c6] bg-[#f6f1e8] text-[#4f4942]">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-balance text-[28px] font-medium tracking-[-0.05em] text-[#1f1c18]">
          No tuning package yet
        </h2>
        <p className="mt-3 text-pretty text-[14px] leading-7 text-[#6d655c]">
          New presets appear here after a benchmark sweep or a manual clone from an existing deployment. Start from the Sonnet default so reviewers never face a blank console.
        </p>
        <button
          type="button"
          onClick={onRestore}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-[#d2c6b8] bg-[#f7f1e8] px-4 text-[14px] font-medium text-[#201d19] transition hover:border-[#c7b9a9] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5b39c]"
        >
          Restore demo preset
        </button>
      </div>
    </div>
  );
}

function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[30px] border border-[#e2b7b0] bg-[#fff3f1] p-6 shadow-[0_1px_0_rgba(41,37,36,0.03)] sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e4c2bc] bg-white text-[#a24c43]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[15px] font-medium text-[#1f1c18]">We couldn&apos;t load this tuning session</p>
            <p className="mt-2 max-w-2xl text-[14px] leading-7 text-[#6d655c]">
              The console lost the last evaluation snapshot while reconstructing this preset. Retry the load, or restore the saved Sonnet baseline and rerun the sycophancy probes before deploy.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d9b1ab] bg-white px-4 text-[14px] font-medium text-[#201d19] transition hover:border-[#c99992] hover:bg-[#fffaf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfb4ae]"
        >
          Retry load
        </button>
      </div>
    </div>
  );
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
    <div className="rounded-[24px] border border-[#ddd3c6] bg-[#faf6ef] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <label className="text-[15px] font-medium tracking-[-0.02em] text-[#1f1c18]">{label}</label>
          <p className="mt-1 text-pretty text-[13px] leading-6 text-[#6f675d]">{helper}</p>
        </div>
        <div className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#ddd3c6] bg-white px-4 text-[14px] font-medium tabular-nums text-[#1f1c18]">
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
          className="h-3 w-full cursor-pointer appearance-none rounded-full bg-[#ded4c7]"
          style={{
            background: `linear-gradient(90deg, rgba(34,30,26,0.95) ${progress}, rgba(219,209,194,0.95) ${progress})`,
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-4 text-[12px] text-[#7b7267]">
          <span>{left}</span>
          <span>{right}</span>
        </div>
      </div>
    </div>
  );
}

function StepBadge({ currentStep, step }: { currentStep: StepId; step: StepMeta }) {
  const isActive = currentStep === step.id;
  const isComplete = currentStep > step.id;

  return (
    <div
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
        isActive
          ? "border-[#1f1c18] bg-[#1f1c18] text-white"
          : isComplete
            ? "border-[#d8cdc0] bg-white text-[#1f1c18]"
            : "border-[#ddd2c5] bg-[#f8f2e8] text-[#5f584f] hover:border-[#cfc2b3] hover:bg-white",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-medium",
          isActive
            ? "border-white/15 bg-white/10 text-white"
            : isComplete
              ? "border-[#d9cec0] bg-[#f7f1e8] text-[#1f1c18]"
              : "border-[#ddd2c5] bg-white text-[#756d63]",
        )}
      >
        {isComplete ? <Check className="h-4 w-4" /> : `0${step.id}`}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium tracking-[-0.02em]">{step.label}</span>
        <span className={cn("mt-0.5 block text-[12px]", isActive ? "text-[#d7d0c7]" : "text-[#81786d]")}>{step.helper}</span>
      </span>
    </div>
  );
}

export default function ModelTuningPage() {
  const initialModel = "sonnet" as ModelId;
  const [viewState, setViewState] = useState<ViewState>("happy");
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [selectedModel, setSelectedModel] = useState<ModelId>(initialModel);
  const [presetName, setPresetName] = useState(getPresetStarter(initialModel));
  const [sliders, setSliders] = useState<Record<SliderKey, number>>(getModelDefaults(initialModel));
  const [guardrails, setGuardrails] = useState<Record<GuardrailKey, boolean>>(DEFAULT_GUARDRAILS);
  const [redLines, setRedLines] = useState(getRedLines(initialModel));
  const [systemNote, setSystemNote] = useState(getSystemNote(initialModel));
  const [deployRing, setDeployRing] = useState(DEPLOY_RINGS[0]);
  const [deployStatus, setDeployStatus] = useState<DeployStatus>("idle");
  const [deployError, setDeployError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [acknowledged, setAcknowledged] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [hasCustomizedBehavior, setHasCustomizedBehavior] = useState(false);

  useEffect(() => {
    if (viewState !== "loading") return;
    const timer = window.setTimeout(() => setViewState("happy"), 950);
    return () => window.clearTimeout(timer);
  }, [viewState]);

  useEffect(() => {
    if (deployStatus !== "deploying") return;
    const timer = window.setTimeout(() => setDeployStatus("deployed"), 1400);
    return () => window.clearTimeout(timer);
  }, [deployStatus]);

  const selectedModelMeta = MODELS.find((model) => model.id === selectedModel) ?? MODELS[1];

  const behaviorSummary = useMemo(() => getBehaviorSummary(sliders), [sliders]);
  const behaviorNote = useMemo(() => getBehaviorNote(sliders), [sliders]);
  const riskFlags = useMemo(() => getRiskFlags(sliders, guardrails, redLines), [sliders, guardrails, redLines]);

  const completedSteps = useMemo(() => {
    const steps = new Set<StepId>();
    if (selectedModel && presetName.trim()) steps.add(1);
    if (sliders.sycophancyThreshold >= 68 && sliders.pushbackWillingness >= 62) steps.add(2);
    if (
      redLines.trim().split("\n").filter(Boolean).length >= 2 &&
      systemNote.trim().length >= 36 &&
      GUARDRAILS.filter((item) => item.critical).every((item) => guardrails[item.key])
    ) {
      steps.add(3);
    }
    if (acknowledged && riskFlags.length <= 2) steps.add(4);
    return steps;
  }, [acknowledged, guardrails, presetName, redLines, riskFlags.length, selectedModel, sliders, systemNote]);

  const activeGuardrailsCount = Object.values(guardrails).filter(Boolean).length;
  const redLineCount = redLines.trim().split("\n").filter(Boolean).length;

  const applyModelDefaults = (modelId: ModelId) => {
    setSelectedModel(modelId);
    setPresetName(getPresetStarter(modelId));
    setSliders(getModelDefaults(modelId));
    setRedLines(getRedLines(modelId));
    setSystemNote(getSystemNote(modelId));
    setDeployStatus("idle");
    setDeployError("");
    setHasCustomizedBehavior(false);
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.selectedModel;
      delete next.presetName;
      delete next.behavior;
      delete next.redLines;
      delete next.systemNote;
      return next;
    });
  };

  const validateStep = (step: StepId) => {
    const nextErrors: Record<string, string> = {};

    if (step >= 1) {
      if (!selectedModel) nextErrors.selectedModel = "Pick a base model to continue.";
      if (!presetName.trim()) nextErrors.presetName = "Give this preset a name reviewers can find later.";
    }

    if (step >= 2) {
      if (sliders.sycophancyThreshold < 68 || sliders.pushbackWillingness < 62) {
        nextErrors.behavior = "Raise correction or pushback before this tune can enter a research canary.";
      }
    }

    if (step >= 3) {
      if (redLineCount < 2) nextErrors.redLines = "Use at least two red lines so the refusal boundary is explicit.";
      if (systemNote.trim().length < 36) nextErrors.systemNote = "Add a more specific reviewer note so the intended tone is clear.";

      const missingCritical = GUARDRAILS.filter((item) => item.critical && !guardrails[item.key]);
      if (missingCritical.length) {
        nextErrors.guardrails = "Keep all critical guardrails on for this internal preset.";
      }
    }

    if (step >= 4) {
      if (!acknowledged) nextErrors.acknowledged = "Reviewers need an explicit preflight acknowledgement.";
      if (riskFlags.length > 2) nextErrors.deploy = "Resolve the open review flags before deploying this tune.";
    }

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
  };

  const resetPreset = () => {
    applyModelDefaults("sonnet");
    setViewState("happy");
    setCurrentStep(1);
    setGuardrails(DEFAULT_GUARDRAILS);
    setAcknowledged(true);
    setAdvancedOpen(false);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,176,102,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(191,164,124,0.10),transparent_20%),linear-gradient(180deg,#f3ede4_0%,#efe8de_48%,#f5efe7_100%)] text-[#1f1c18] [font-smoothing:antialiased]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-[1460px] px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <header className="rounded-[32px] border border-[#d8cebf] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,244,236,0.9))] p-5 shadow-[0_1px_0_rgba(41,37,36,0.03)] sm:p-6 lg:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#776f65]">
                <span className="rounded-full border border-[#ddd2c5] bg-white px-2.5 py-1">Claude Console</span>
                <ChevronRight className="h-3 w-3" />
                <span>Models</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#3a342d]">Tuning</span>
              </div>

              <h1 className="mt-4 max-w-3xl text-balance text-[32px] font-medium tracking-[-0.06em] text-[#1f1c18] sm:text-[40px] lg:text-[48px]">
                Model Tuning Console
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-7 text-[#6c645b] sm:text-[16px]">
                Configure how a Claude model behaves before it reaches a canary ring. Start from a current model default, tune the behavior sliders, set explicit red lines, then validate the deployment package.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
              <section className="rounded-[24px] border border-[#ddd2c5] bg-white/92 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7b7268]">Base model</p>
                <p className="mt-2 text-[26px] font-medium tracking-[-0.05em] text-[#1f1c18]">
                  {selectedModelMeta.name.replace("Claude ", "")}
                </p>
                <p className="mt-1 text-[13px] text-[#6f675d]">{selectedModelMeta.context}</p>
              </section>
              <section className="rounded-[24px] border border-[#ddd2c5] bg-white/92 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7b7268]">Correction bias</p>
                <p className="mt-2 text-[26px] font-medium tracking-[-0.05em] text-[#1f1c18] tabular-nums">
                  {sliders.sycophancyThreshold}
                </p>
                <p className="mt-1 text-[13px] text-[#6f675d]">Earlier premise correction</p>
              </section>
              <section className="rounded-[24px] border border-[#ddd2c5] bg-white/92 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7b7268]">Guardrails</p>
                <p className="mt-2 text-[26px] font-medium tracking-[-0.05em] text-[#1f1c18] tabular-nums">
                  {activeGuardrailsCount}/6
                </p>
                <p className="mt-1 text-[13px] text-[#6f675d]">Checks enabled before deploy</p>
              </section>
            </div>
          </div>
        </header>

        <div className="mt-4">
          {viewState === "loading" ? (
            <LoadingView />
          ) : viewState === "empty" ? (
            <EmptyView onRestore={resetPreset} />
          ) : viewState === "error" ? (
            <ErrorView onRetry={() => setViewState("loading")} />
          ) : (
            <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)_340px]">
              <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                <section className="rounded-[28px] border border-[#d8cebf] bg-white/90 p-4 shadow-[0_1px_0_rgba(41,37,36,0.03)] sm:p-5">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#766d63]">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Wizard progress
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {STEPS.map((step) => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccb79d]"
                      >
                        <StepBadge currentStep={currentStep} step={step} />
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[24px] border border-[#ddd2c5] bg-[#f8f3eb] p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7d7469]">Current preset</p>
                    <p className="mt-2 text-[15px] font-medium tracking-[-0.02em] text-[#1f1c18]">{presetName || "Untitled preset"}</p>
                    <p className="mt-1 text-pretty text-[13px] leading-6 text-[#6f675d]">
                      {selectedModelMeta.note}
                    </p>
                  </div>
                </section>
              </aside>

              <section className="min-w-0 rounded-[32px] border border-[#d8cebf] bg-white/90 p-5 shadow-[0_1px_0_rgba(41,37,36,0.03)] sm:p-6 lg:p-7">
                <div className="flex flex-col gap-3 border-b border-[#e2d7cb] pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#776f65]">Step 0{currentStep}</p>
                    <h2 className="mt-2 text-balance text-[28px] font-medium tracking-[-0.05em] text-[#1f1c18] sm:text-[34px]">
                      {STEPS[currentStep - 1].label}
                    </h2>
                    <p className="mt-2 max-w-2xl text-pretty text-[14px] leading-7 text-[#6c645b]">
                      {STEPS[currentStep - 1].helper}. The page starts with a sensible default so reviewers can tune from a real baseline instead of a blank form.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd2c5] bg-[#f7f1e8] px-3 py-2 text-[12px] text-[#6c645b]">
                    <CircleHelp className="h-3.5 w-3.5" />
                    {completedSteps.size}/4 checks satisfied
                  </div>
                </div>

                {currentStep === 1 ? (
                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="text-[13px] font-medium text-[#5f574e]">Preset name</label>
                      <input
                        value={presetName}
                        onChange={(event) => setPresetName(event.target.value)}
                        onBlur={() => validateStep(1)}
                        className="mt-2 h-12 w-full rounded-2xl border border-[#ddd2c5] bg-[#faf6ef] px-4 text-[15px] text-[#1f1c18] outline-none placeholder:text-[#aa9f92] focus:border-[#c6b29a] focus:bg-white"
                        placeholder="Research honesty v4"
                      />
                      <p className="mt-2 text-[12px] text-[#7a7166]">
                        Use the name an evaluator would search for later. Version tags help when multiple behavior sweeps exist.
                      </p>
                      {fieldErrors.presetName ? <p className="mt-2 text-[12px] font-medium text-[#b14f43]">{fieldErrors.presetName}</p> : null}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
                      {MODELS.map((model) => {
                        const active = selectedModel === model.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => applyModelDefaults(model.id)}
                            className={cn(
                              "flex min-h-[260px] flex-col rounded-[28px] border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccb79d]",
                              active
                                ? "border-[#1f1c18] bg-[#1f1c18] text-white"
                                : "border-[#ddd2c5] bg-[#faf6ef] text-[#1f1c18] hover:border-[#d0c2b2] hover:bg-white",
                            )}
                            aria-pressed={active}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={cn("text-[11px] font-medium uppercase tracking-[0.16em]", active ? "text-[#d7d0c7]" : "text-[#7b7268]")}>{model.release}</p>
                                <h3 className="mt-2 text-[24px] font-medium tracking-[-0.05em]">{model.name}</h3>
                              </div>
                              <span
                                className={cn(
                                  "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                                  active ? "border-white/15 bg-white/10 text-white" : "border-[#ddd2c5] bg-white text-[#5f574d]",
                                )}
                              >
                                {model.latency}
                              </span>
                            </div>

                            <p className={cn("mt-3 text-pretty text-[14px] leading-7", active ? "text-[#ece7df]" : "text-[#6c645b]")}>{model.description}</p>

                            <div className="mt-5 grid grid-cols-2 gap-2 text-[12px]">
                              <div className={cn("rounded-2xl border px-3 py-3", active ? "border-white/10 bg-white/5" : "border-[#e0d6ca] bg-white")}>{model.context}</div>
                              <div className={cn("rounded-2xl border px-3 py-3", active ? "border-white/10 bg-white/5" : "border-[#e0d6ca] bg-white")}>{model.output}</div>
                            </div>

                            <div className="mt-auto space-y-3 pt-5">
                              <div>
                                <p className={cn("text-[11px] uppercase tracking-[0.14em]", active ? "text-[#d7d0c7]" : "text-[#7b7268]")}>API id</p>
                                <p className={cn("mt-1 break-all text-[13px]", active ? "text-white" : "text-[#443e37]")}>{model.apiId}</p>
                              </div>
                              <div>
                                <p className={cn("text-[11px] uppercase tracking-[0.14em]", active ? "text-[#d7d0c7]" : "text-[#7b7268]")}>Best for</p>
                                <p className={cn("mt-1 text-pretty text-[13px] leading-6", active ? "text-[#ece7df]" : "text-[#6c645b]")}>{model.bestFor}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {fieldErrors.selectedModel ? <p className="text-[12px] font-medium text-[#b14f43]">{fieldErrors.selectedModel}</p> : null}
                  </div>
                ) : null}

                {currentStep === 2 ? (
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-col gap-3 rounded-[24px] border border-[#ddd2c5] bg-[#f8f3eb] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7b7268]">Smart defaults</p>
                        <p className="mt-1 text-[14px] leading-6 text-[#645c53]">
                          We preloaded the recommended {selectedModelMeta.name} behavior profile. Tweak it if this deployment needs a stronger tone.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSliders(getModelDefaults(selectedModel));
                          setHasCustomizedBehavior(false);
                          setFieldErrors((current) => {
                            const next = { ...current };
                            delete next.behavior;
                            return next;
                          });
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d1c3b3] bg-white px-4 text-[13px] font-medium text-[#1f1c18] transition hover:border-[#c2b09d] hover:bg-[#fffdfa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccb79d]"
                      >
                        Reset to model default
                      </button>
                    </div>

                    {SLIDER_META.map((item) => (
                      <SliderField
                        key={item.key}
                        label={item.label}
                        helper={item.helper}
                        left={item.left}
                        right={item.right}
                        value={sliders[item.key]}
                        onChange={(value) => {
                          setSliders((current) => ({ ...current, [item.key]: clamp(value, 0, 100) }));
                          setHasCustomizedBehavior(true);
                          setFieldErrors((current) => {
                            const next = { ...current };
                            delete next.behavior;
                            return next;
                          });
                        }}
                      />
                    ))}

                    <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-[24px] border border-[#ddd2c5] bg-[#faf6ef] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7b7268]">Behavior readout</p>
                        <p className="mt-2 text-[22px] font-medium tracking-[-0.04em] text-[#1f1c18]">{behaviorSummary}</p>
                        <p className="mt-2 text-pretty text-[13px] leading-6 text-[#6d655c]">{behaviorNote}</p>
                      </div>

                      <div className="rounded-[24px] border border-[#e4d0a6] bg-[#fff7e6] p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a6a2d]">Eval guidance</p>
                        <p className="mt-2 text-[13px] leading-6 text-[#6f5321]">
                          Internal runs are strongest when correction stays above 68 and pushback stays above 62. Below that, the tune tends to optimize for rapport over judgment.
                        </p>
                      </div>
                    </div>

                    {hasCustomizedBehavior ? (
                      <div className="rounded-[22px] border border-[#d8d0c5] bg-white px-4 py-3 text-[13px] leading-6 text-[#5f574e]">
                        You&apos;re now off the default profile. Good. Just make sure the review note explains why this canary needs a different social posture.
                      </div>
                    ) : null}

                    {fieldErrors.behavior ? <p className="text-[12px] font-medium text-[#b14f43]">{fieldErrors.behavior}</p> : null}
                  </div>
                ) : null}

                {currentStep === 3 ? (
                  <div className="mt-6 space-y-5">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-medium text-[#5f574e]">Core guardrails</p>
                          <p className="mt-1 text-[12px] text-[#7b7268]">These stay on unless a reviewer explicitly signs off on relaxing them.</p>
                        </div>
                        <div className="rounded-full border border-[#ddd2c5] bg-[#f8f3eb] px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#786f65]">
                          {activeGuardrailsCount} active
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {GUARDRAILS.filter((item) => !item.advanced).map((item) => {
                          const enabled = guardrails[item.key];
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setGuardrails((current) => ({ ...current, [item.key]: !current[item.key] }));
                                setFieldErrors((current) => {
                                  const next = { ...current };
                                  delete next.guardrails;
                                  return next;
                                });
                              }}
                              className={cn(
                                "flex min-h-[140px] flex-col rounded-[24px] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccb79d]",
                                enabled
                                  ? "border-[#1f1c18] bg-[#1f1c18] text-white"
                                  : "border-[#ddd2c5] bg-[#faf6ef] text-[#1f1c18] hover:border-[#d1c3b3] hover:bg-white",
                              )}
                              aria-pressed={enabled}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[15px] font-medium tracking-[-0.02em]">{item.label}</p>
                                  <p className={cn("mt-2 text-pretty text-[13px] leading-6", enabled ? "text-[#e7e0d7]" : "text-[#6c645b]")}>{item.helper}</p>
                                </div>
                                <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl border", enabled ? "border-white/15 bg-white/10 text-white" : "border-[#ddd2c5] bg-white text-[#6c645b]")}>{enabled ? <ShieldCheck className="h-4.5 w-4.5" /> : <ShieldX className="h-4.5 w-4.5" />}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {fieldErrors.guardrails ? <p className="mt-2 text-[12px] font-medium text-[#b14f43]">{fieldErrors.guardrails}</p> : null}
                    </div>

                    <div className="rounded-[24px] border border-[#ddd2c5] bg-[#faf6ef] p-4">
                      <button
                        type="button"
                        onClick={() => setAdvancedOpen((current) => !current)}
                        className="flex min-h-11 w-full items-center justify-between rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccb79d]"
                      >
                        <div>
                          <p className="text-[13px] font-medium text-[#5f574e]">Advanced guardrails</p>
                          <p className="mt-1 text-[12px] text-[#7b7268]">Progressive disclosure keeps the main flow sharp until you need the extra controls.</p>
                        </div>
                        <span className="rounded-full border border-[#d7cabc] bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#6f675d]">
                          {advancedOpen ? "Hide" : "Show"}
                        </span>
                      </button>

                      {advancedOpen ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {GUARDRAILS.filter((item) => item.advanced).map((item) => {
                            const enabled = guardrails[item.key];
                            return (
                              <button
                                key={item.key}
                                type="button"
                                onClick={() => setGuardrails((current) => ({ ...current, [item.key]: !current[item.key] }))}
                                className={cn(
                                  "flex min-h-[124px] flex-col rounded-[22px] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccb79d]",
                                  enabled
                                    ? "border-[#d1c5b7] bg-white text-[#1f1c18]"
                                    : "border-[#ddd2c5] bg-[#f5eee3] text-[#1f1c18] hover:border-[#d0c2b2] hover:bg-white",
                                )}
                                aria-pressed={enabled}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[15px] font-medium tracking-[-0.02em]">{item.label}</p>
                                    <p className="mt-2 text-pretty text-[13px] leading-6 text-[#6c645b]">{item.helper}</p>
                                  </div>
                                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-2xl border", enabled ? "border-[#d8ccc0] bg-[#f7f1e8] text-[#1f1c18]" : "border-[#ddd2c5] bg-white text-[#6c645b]")}>{enabled ? <Check className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-[#5f574e]">Red lines</label>
                      <textarea
                        value={redLines}
                        onChange={(event) => setRedLines(event.target.value)}
                        onBlur={() => validateStep(3)}
                        className="mt-2 min-h-[164px] w-full rounded-[24px] border border-[#ddd2c5] bg-[#faf6ef] px-4 py-3 text-[15px] leading-7 text-[#1f1c18] outline-none placeholder:text-[#aa9f92] focus:border-[#c6b29a] focus:bg-white"
                        placeholder="One line per boundary"
                      />
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[12px] text-[#7a7166]">Use one line per non-negotiable rule. Reviewers scan this before the rest of the package.</p>
                        <p className="text-[12px] font-medium tabular-nums text-[#6f675d]">{redLineCount} lines</p>
                      </div>
                      {fieldErrors.redLines ? <p className="mt-2 text-[12px] font-medium text-[#b14f43]">{fieldErrors.redLines}</p> : null}
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-[#5f574e]">Reviewer note</label>
                      <textarea
                        value={systemNote}
                        onChange={(event) => setSystemNote(event.target.value)}
                        onBlur={() => validateStep(3)}
                        className="mt-2 min-h-[112px] w-full rounded-[24px] border border-[#ddd2c5] bg-[#faf6ef] px-4 py-3 text-[15px] leading-7 text-[#1f1c18] outline-none placeholder:text-[#aa9f92] focus:border-[#c6b29a] focus:bg-white"
                        placeholder="Describe the intended tone and refusal posture"
                      />
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[12px] text-[#7a7166]">Plain internal language is enough. This note should help a reviewer predict how the model will sound in a live transcript.</p>
                        <p className="text-[12px] font-medium tabular-nums text-[#6f675d]">{systemNote.trim().length} chars</p>
                      </div>
                      {fieldErrors.systemNote ? <p className="mt-2 text-[12px] font-medium text-[#b14f43]">{fieldErrors.systemNote}</p> : null}
                    </div>
                  </div>
                ) : null}

                {currentStep === 4 ? (
                  <div className="mt-6 space-y-5">
                    <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                      <section className="rounded-[28px] border border-[#ddd2c5] bg-[#faf6ef] p-5">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7b7268]">Configuration review</p>
                        <div className="mt-4 space-y-4 text-[14px]">
                          {[
                            ["Preset", presetName],
                            ["Base model", selectedModelMeta.name],
                            ["Behavior", behaviorSummary],
                            ["Guardrails", `${activeGuardrailsCount} active checks`],
                            ["Deploy ring", deployRing],
                          ].map(([label, value]) => (
                            <div
                              key={String(label)}
                              className="flex flex-col gap-1 border-b border-[#e2d7cb] pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                            >
                              <span className="text-[#7b7268]">{label}</span>
                              <span className="max-w-[24rem] font-medium tracking-[-0.01em] text-[#1f1c18] sm:text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-[28px] border border-[#ddd2c5] bg-white p-5">
                        <label className="text-[13px] font-medium text-[#5f574e]">Deploy ring</label>
                        <select
                          value={deployRing}
                          onChange={(event) => setDeployRing(event.target.value)}
                          className="mt-2 h-12 w-full rounded-2xl border border-[#ddd2c5] bg-[#faf6ef] px-4 text-[15px] text-[#1f1c18] outline-none focus:border-[#c6b29a] focus:bg-white"
                        >
                          {DEPLOY_RINGS.map((ring) => (
                            <option key={ring}>{ring}</option>
                          ))}
                        </select>

                        <label className="mt-4 block text-[13px] font-medium text-[#5f574e]">Preflight acknowledgement</label>
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
                            "mt-2 flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccb79d]",
                            acknowledged
                              ? "border-[#1f1c18] bg-[#1f1c18] text-white"
                              : "border-[#ddd2c5] bg-[#faf6ef] text-[#1f1c18] hover:border-[#d1c3b3] hover:bg-white",
                          )}
                          aria-pressed={acknowledged}
                        >
                          <span className="pr-4 text-[14px] leading-6">
                            I reviewed the refusal posture, behavior deltas, and red lines for this tune.
                          </span>
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", acknowledged ? "border-white/20 bg-white/10" : "border-[#d7cbc0] bg-white")}>
                            {acknowledged ? <Check className="h-4 w-4" /> : null}
                          </span>
                        </button>
                        {fieldErrors.acknowledged ? <p className="mt-2 text-[12px] font-medium text-[#b14f43]">{fieldErrors.acknowledged}</p> : null}
                      </section>
                    </div>

                    {fieldErrors.deploy ? (
                      <div className="rounded-[24px] border border-[#e0b7af] bg-[#fff3f1] px-4 py-3 text-[13px] font-medium text-[#a04f45]">
                        {fieldErrors.deploy}
                      </div>
                    ) : null}

                    {deployError ? (
                      <div className="rounded-[24px] border border-[#e0b7af] bg-[#fff3f1] px-4 py-3 text-[13px] font-medium text-[#a04f45]">
                        {deployError}
                      </div>
                    ) : null}

                    {deployStatus === "deployed" ? (
                      <div className="rounded-[24px] border border-[#bfd7c7] bg-[#edf8f0] px-4 py-4 text-[14px] text-[#20422c]">
                        <p className="font-medium">Deployed to {deployRing}</p>
                        <p className="mt-1 text-[13px] leading-6 text-[#41664d]">
                          Eval probes are live. The first sycophancy drift snapshot should land in about 20 minutes.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-7 flex flex-col gap-3 border-t border-[#e2d7cb] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={currentStep === 1}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d4c8ba] bg-white px-4 text-[14px] font-medium text-[#1f1c18] transition hover:border-[#c6b7a6] hover:bg-[#fdfbf8] disabled:cursor-not-allowed disabled:border-[#e3dad0] disabled:text-[#ada398] disabled:hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccb79d]"
                  >
                    Back
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1f1c18] px-5 text-[14px] font-medium text-white transition hover:bg-[#2b2722] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a99985]"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDeploy}
                        disabled={deployStatus === "deploying"}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1f1c18] px-5 text-[14px] font-medium text-white transition hover:bg-[#2b2722] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[#9f968a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a99985]"
                      >
                        {deployStatus === "deploying" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                        {deployStatus === "deploying"
                          ? "Deploying"
                          : deployStatus === "deployed"
                            ? "Deploy again"
                            : "Deploy to canary"}
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                <section className="rounded-[28px] border border-[#d8cebf] bg-white/90 p-5 shadow-[0_1px_0_rgba(41,37,36,0.03)]">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#766d63]">
                    <Eye className="h-3.5 w-3.5" />
                    Live summary
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[12px] text-[#7c7369]">Model profile</p>
                      <p className="mt-1 text-[22px] font-medium tracking-[-0.04em] text-[#1f1c18]">{selectedModelMeta.name}</p>
                      <p className="mt-1 text-pretty text-[13px] leading-6 text-[#6d655c]">{selectedModelMeta.description}</p>
                    </div>

                    <div className="rounded-[24px] border border-[#ddd2c5] bg-[#faf6ef] p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7b7268]">Expected behavior</p>
                      <p className="mt-2 text-pretty text-[14px] leading-7 text-[#2f2a24]">{behaviorSummary}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-[#d8cebf] bg-white/90 p-5 shadow-[0_1px_0_rgba(41,37,36,0.03)]">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#766d63]">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Review flags
                  </div>

                  <div className="mt-4 space-y-3">
                    {riskFlags.length ? (
                      riskFlags.map((item) => (
                        <div
                          key={item}
                          className="rounded-[20px] border border-[#e7d7b3] bg-[#fff8e9] px-3 py-3 text-pretty text-[13px] leading-6 text-[#735b24]"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[20px] border border-[#c6dccd] bg-[#eef8f1] px-3 py-3 text-[13px] leading-6 text-[#35624a]">
                        No active blockers. This tune is in range for a research canary.
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-[28px] border border-[#d8cebf] bg-white/90 p-5 shadow-[0_1px_0_rgba(41,37,36,0.03)]">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#766d63]">
                    <WandSparkles className="h-3.5 w-3.5" />
                    Recent eval notes
                  </div>

                  <div className="mt-4 space-y-3 text-[13px] leading-6 text-[#514940]">
                    <div className="rounded-[20px] border border-[#ddd2c5] bg-[#faf6ef] p-3">
                      <span className="font-medium text-[#1f1c18]">Founder conviction probes:</span> stronger honesty reduces confident over-agreement.
                    </div>
                    <div className="rounded-[20px] border border-[#ddd2c5] bg-[#faf6ef] p-3">
                      <span className="font-medium text-[#1f1c18]">Board memo rewrites:</span> accuracy above 66 lowers polished overclaiming.
                    </div>
                    <div className="rounded-[20px] border border-[#ddd2c5] bg-[#faf6ef] p-3">
                      <span className="font-medium text-[#1f1c18]">Red-team note:</span> praise-sensitive prompts still benefit from explicit correction rules.
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[312px] rounded-[22px] border border-[#2b2722]/10 bg-[#1c1916]/95 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-sm sm:bottom-6 sm:right-6">
        <div className="px-2 pb-2 pt-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#b6aea3]">demo state</p>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(["happy", "loading", "empty", "error"] as ViewState[]).map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => {
                setViewState(state);
                setDeployStatus("idle");
                setDeployError("");
              }}
              className={cn(
                "inline-flex min-h-10 items-center justify-center rounded-xl px-2 text-[11px] font-medium uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                viewState === state ? "bg-white text-[#1f1c18]" : "text-[#c8c0b5] hover:bg-white/10 hover:text-white",
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
