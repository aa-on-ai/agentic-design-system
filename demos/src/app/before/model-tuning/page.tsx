"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  Gauge,
  Lock,
  Rocket,
  Shield,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

type StepId = "model" | "behavior" | "guardrails" | "review";

type BaseModel = {
  id: string;
  name: string;
  family: string;
  context: string;
  strength: string;
  latency: string;
};

type GuardrailKey =
  | "selfHarm"
  | "biosecurity"
  | "cyberMisuse"
  | "deception"
  | "politicalPersuasion"
  | "piiLeakage";

const steps: { id: StepId; label: string; description: string }[] = [
  { id: "model", label: "Base model", description: "Choose a starting checkpoint" },
  { id: "behavior", label: "Behavior", description: "Tune personality weights" },
  { id: "guardrails", label: "Guardrails", description: "Set deployment boundaries" },
  { id: "review", label: "Review", description: "Confirm and deploy" },
];

const baseModels: BaseModel[] = [
  {
    id: "claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    family: "General deployment",
    context: "200k context",
    strength: "Balanced reasoning and fast iteration",
    latency: "Standard",
  },
  {
    id: "claude-opus-4.6",
    name: "Claude Opus 4.6",
    family: "High-judgment research",
    context: "200k context",
    strength: "Best nuanced reasoning and policy sensitivity",
    latency: "Higher",
  },
  {
    id: "constitutional-research-r3",
    name: "Constitutional Research R3",
    family: "Experimental",
    context: "300k context",
    strength: "More steerable, less production hardened",
    latency: "Variable",
  },
];

const guardrailLabels: Record<GuardrailKey, string> = {
  selfHarm: "Escalate self-harm signals to refusal + support messaging",
  biosecurity: "Block hazardous biology assistance",
  cyberMisuse: "Refuse offensive cyber or exploit guidance",
  deception: "Disallow intentional impersonation or manipulation",
  politicalPersuasion: "Disable targeted political persuasion",
  piiLeakage: "Suppress personal data extraction and memorization",
};

const defaultGuardrails: Record<GuardrailKey, boolean> = {
  selfHarm: true,
  biosecurity: true,
  cyberMisuse: true,
  deception: true,
  politicalPersuasion: false,
  piiLeakage: true,
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function SliderRow({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
  hint,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <p className="mt-1 text-sm text-slate-500">{hint}</p>
        </div>
        <div className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {value}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
      />

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export default function ModelTuningPage() {
  const [currentStep, setCurrentStep] = useState<StepId>("model");
  const [selectedModel, setSelectedModel] = useState(baseModels[0].id);
  const [helpfulness, setHelpfulness] = useState(64);
  const [creativity, setCreativity] = useState(58);
  const [sycophancyThreshold, setSycophancyThreshold] = useState(32);
  const [verbosity, setVerbosity] = useState(55);
  const [reflectionDepth, setReflectionDepth] = useState(67);
  const [guardrails, setGuardrails] = useState(defaultGuardrails);
  const [deploymentName, setDeploymentName] = useState("researcher-assistant-v2");
  const [notes, setNotes] = useState(
    "Tune for clear reasoning, mild warmth, low flattery, and conservative safety posture before internal evals."
  );
  const [deployed, setDeployed] = useState(false);

  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const selectedModelInfo = baseModels.find((model) => model.id === selectedModel) ?? baseModels[0];

  const enabledGuardrails = useMemo(
    () => Object.entries(guardrails).filter(([, enabled]) => enabled).length,
    [guardrails]
  );

  const readinessScore = useMemo(() => {
    let score = 50;
    score += helpfulness > 55 ? 8 : 2;
    score += creativity > 40 && creativity < 75 ? 8 : 3;
    score += sycophancyThreshold < 40 ? 14 : 4;
    score += reflectionDepth > 55 ? 10 : 3;
    score += enabledGuardrails * 3;
    return Math.min(score, 98);
  }, [creativity, enabledGuardrails, helpfulness, reflectionDepth, sycophancyThreshold]);

  const toneSummary = useMemo(() => {
    if (helpfulness > 75 && creativity > 70) {
      return "Very engaging and generative, but may wander or over-accommodate.";
    }
    if (sycophancyThreshold < 30 && reflectionDepth > 60) {
      return "Grounded, willing to push back, and more likely to preserve factual integrity.";
    }
    if (helpfulness < 40) {
      return "Direct and restrained, possibly colder than intended in support flows.";
    }
    return "Balanced internal assistant profile with moderate warmth and controlled exploration.";
  }, [creativity, helpfulness, reflectionDepth, sycophancyThreshold]);

  function goNext() {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  }

  function toggleGuardrail(key: GuardrailKey) {
    setGuardrails((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function deployConfig() {
    setDeployed(true);
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
              <Sparkles className="h-3.5 w-3.5" />
              Anthropic internal tools
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
              Model Tuning Console
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 lg:text-base">
              Configure a model&apos;s personality, behavior, and deployment controls before it moves into
              internal evaluation or limited release.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:min-w-[320px]">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Readiness score</span>
              <span className="font-semibold text-slate-900">{readinessScore}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-indigo-600" style={{ width: `${readinessScore}%` }} />
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <Gauge className="mt-0.5 h-5 w-5 text-indigo-600" />
              <div>
                <div className="text-sm font-medium text-slate-900">Tuning snapshot</div>
                <p className="mt-1 text-sm leading-5 text-slate-500">{toneSummary}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-semibold text-slate-900">Setup steps</div>
            <div className="space-y-3">
              {steps.map((step, index) => {
                const active = step.id === currentStep;
                const complete = index < currentIndex;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition",
                      active && "border-indigo-600 bg-indigo-50",
                      !active && "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                          complete && "bg-emerald-600 text-white",
                          active && !complete && "bg-indigo-600 text-white",
                          !active && !complete && "bg-slate-200 text-slate-600"
                        )}
                      >
                        {complete ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{step.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">{step.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            {currentStep === "model" && (
              <div>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">Pick a base model</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Select the checkpoint that best matches the deployment intent before applying
                      behavioral tuning.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
                    Step 1 of 4
                  </div>
                </div>

                <div className="space-y-4">
                  {baseModels.map((model) => {
                    const active = model.id === selectedModel;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedModel(model.id)}
                        className={cn(
                          "w-full rounded-2xl border p-5 text-left transition",
                          active
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <Brain className="h-5 w-5 text-indigo-600" />
                              <div className="text-lg font-semibold text-slate-950">{model.name}</div>
                            </div>
                            <div className="mt-2 text-sm text-slate-500">{model.family}</div>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{model.strength}</p>
                          </div>
                          <div className="grid gap-2 rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm lg:min-w-[220px]">
                            <div className="flex items-center justify-between gap-4">
                              <span>Context</span>
                              <span className="font-medium text-slate-900">{model.context}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Latency</span>
                              <span className="font-medium text-slate-900">{model.latency}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === "behavior" && (
              <div>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">Adjust behavioral profile</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Tune how the model trades off warmth, accuracy, deference, and deliberation.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
                    Step 2 of 4
                  </div>
                </div>

                <div className="grid gap-4">
                  <SliderRow
                    label="Helpfulness vs honesty"
                    leftLabel="More blunt"
                    rightLabel="More accommodating"
                    value={helpfulness}
                    onChange={setHelpfulness}
                    hint="Higher values produce more collaborative responses, but can increase over-accommodation."
                  />
                  <SliderRow
                    label="Creativity vs accuracy"
                    leftLabel="Literal"
                    rightLabel="Exploratory"
                    value={creativity}
                    onChange={setCreativity}
                    hint="Shift how much the model speculates, improvises, and generates novel framing."
                  />
                  <SliderRow
                    label="Sycophancy threshold"
                    leftLabel="Push back sooner"
                    rightLabel="Agree more often"
                    value={sycophancyThreshold}
                    onChange={setSycophancyThreshold}
                    hint="Controls tolerance for user-leading claims before the model challenges them."
                  />
                  <SliderRow
                    label="Response verbosity"
                    leftLabel="Compressed"
                    rightLabel="Detailed"
                    value={verbosity}
                    onChange={setVerbosity}
                    hint="A rough control for response length and explanation density."
                  />
                  <SliderRow
                    label="Reflection depth"
                    leftLabel="Fast answer"
                    rightLabel="Deeper checking"
                    value={reflectionDepth}
                    onChange={setReflectionDepth}
                    hint="Higher values bias toward slower but more self-checked outputs."
                  />
                </div>
              </div>
            )}

            {currentStep === "guardrails" && (
              <div>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">Set guardrails</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Apply policy constraints and deployment restrictions before internal release.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
                    Step 3 of 4
                  </div>
                </div>

                <div className="grid gap-3">
                  {(Object.keys(guardrailLabels) as GuardrailKey[]).map((key) => {
                    const enabled = guardrails[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleGuardrail(key)}
                        className={cn(
                          "flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition",
                          enabled
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl",
                              enabled ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                            )}
                          >
                            {enabled ? <Shield className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{guardrailLabels[key]}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {enabled ? "Enabled for this deployment" : "Disabled for this deployment"}
                            </div>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            enabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {enabled ? "On" : "Off"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === "review" && (
              <div>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">Review and deploy</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Confirm the configuration, annotate intent, and push the model into internal eval.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
                    Step 4 of 4
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 text-sm font-semibold text-slate-900">Deployment metadata</div>
                    <div className="space-y-4">
                      <label className="block">
                        <div className="mb-2 text-sm font-medium text-slate-700">Deployment name</div>
                        <input
                          value={deploymentName}
                          onChange={(event) => setDeploymentName(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                          placeholder="Enter deployment name"
                        />
                      </label>
                      <label className="block">
                        <div className="mb-2 text-sm font-medium text-slate-700">Internal notes</div>
                        <textarea
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          rows={6}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                          placeholder="Add deployment notes"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 text-sm font-semibold text-slate-900">Final configuration</div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                        <span>Base model</span>
                        <span className="font-medium text-slate-900">{selectedModelInfo.name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                        <span>Helpfulness</span>
                        <span className="font-medium text-slate-900">{helpfulness}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                        <span>Creativity</span>
                        <span className="font-medium text-slate-900">{creativity}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                        <span>Sycophancy threshold</span>
                        <span className="font-medium text-slate-900">{sycophancyThreshold}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                        <span>Enabled guardrails</span>
                        <span className="font-medium text-slate-900">{enabledGuardrails} / 6</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5" />
                    <div>
                      <div className="font-medium">Pre-deploy reminder</div>
                      <p className="mt-1 leading-6">
                        This tuning profile is intended for internal evaluation. External launch still requires
                        policy review, red team signoff, and benchmark validation.
                      </p>
                    </div>
                  </div>
                </div>

                {deployed && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <div className="flex items-start gap-3">
                      <Rocket className="mt-0.5 h-5 w-5" />
                      <div>
                        <div className="font-medium">Deployment queued</div>
                        <p className="mt-1 leading-6">
                          {deploymentName || "Untitled deployment"} has been sent to internal eval with the
                          selected behavior weights and guardrail package.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={currentIndex === 0}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>

              <div className="flex gap-3">
                {currentStep === "review" ? (
                  <button
                    type="button"
                    onClick={deployConfig}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Deploy configuration
                    <Rocket className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                Live profile summary
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Selected model</div>
                  <div className="mt-2 font-medium text-slate-900">{selectedModelInfo.name}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Behavior read</div>
                  <div className="mt-2 leading-6 text-slate-700">{toneSummary}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Guardrail coverage</div>
                  <div className="mt-2 font-medium text-slate-900">{enabledGuardrails} controls enabled</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CircleHelp className="h-4 w-4 text-amber-500" />
                Operator notes
              </div>
              <ul className="space-y-3 text-sm leading-6 text-slate-600">
                <li className="rounded-2xl bg-slate-50 p-4">
                  Lower sycophancy values usually produce better pushback during evals.
                </li>
                <li className="rounded-2xl bg-slate-50 p-4">
                  Higher creativity helps brainstorming, but can muddy factual retrieval tasks.
                </li>
                <li className="rounded-2xl bg-slate-50 p-4">
                  Experimental checkpoints should stay internal until benchmark regressions are resolved.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
