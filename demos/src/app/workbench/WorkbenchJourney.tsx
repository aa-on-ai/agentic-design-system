"use client";

import Link from "next/link";
import { useState } from "react";
import { HandoffReviewStep } from "./HandoffReviewStep";
import { IdentityReviewStep } from "./IdentityReviewStep";
import { IntentRouteStep } from "./IntentRouteStep";
import type { ProjectIdentityState } from "./projectIdentity.server";
import { RoutePreview } from "./RoutePreview";
import { SetupMoment } from "./SetupMoment";
import type { IntentId, PresetId } from "./workbenchFixture";
import { buildAgentHandoff, routeWorkbenchIntent } from "./workbenchRouting";
import { inferredValue, type WorkbenchSession } from "./workbenchSession";
import styles from "./workbench.module.css";
import { SystemNav } from "../SystemNav";

type Step = 1 | 2 | 3 | 4;

export function WorkbenchJourney({ session, identityState }: {
  session: WorkbenchSession;
  identityState: ProjectIdentityState;
}) {
  const recommended = inferredValue(session.intake.preset) ?? "marketing-editorial";
  const [step, setStep] = useState<Step>(1);
  const [preset, setPreset] = useState<PresetId>(recommended);
  const [reviewed, setReviewed] = useState(identityState.mode === "unchanged");
  const [confirmed, setConfirmed] = useState(false);
  const [intent, setIntent] = useState<IntentId | null>(null);
  const [task, setTask] = useState("");
  const [routeReviewed, setRouteReviewed] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const blocked = session.intake.status === "blocked"
    || session.intake.questions.some((question) => question.blocks === "project-identity");
  const route = intent ? routeWorkbenchIntent(intent, task) : null;
  const handoff = intent && route?.status === "ready"
    ? buildAgentHandoff(
      session,
      preset,
      intent,
      task,
      route,
      identityState.mode === "unchanged" ? "applied" : "previewed",
    )
    : null;

  function showStep(nextStep: Step) {
    setStep(nextStep);
    const headingIds: Record<Step, string> = {
      1: "starting-point-title",
      2: "identity-review-title",
      3: "job-title",
      4: "handoff-review-title",
    };
    requestAnimationFrame(() => document.getElementById(headingIds[nextStep])?.focus());
  }

  function choosePreset(nextPreset: PresetId) {
    setPreset(nextPreset);
    setReviewed(identityState.mode === "unchanged");
    setConfirmed(false);
    setIntent(null);
    setTask("");
    setRouteReviewed(false);
    setCopyStatus("");
  }

  function chooseIntent(nextIntent: IntentId) {
    setIntent(nextIntent);
    setRouteReviewed(false);
    setCopyStatus("");
  }

  function changeTask(nextTask: string) {
    setTask(nextTask);
    setRouteReviewed(false);
    setCopyStatus("");
  }

  async function copyHandoff() {
    if (!handoff) return;
    try {
      await navigator.clipboard.writeText(handoff);
      setCopyStatus("Agent handoff copied. Nothing ran and no project files changed.");
    } catch {
      setCopyStatus("Clipboard access is unavailable. Select the handoff text and copy it manually.");
    }
  }

  return (
    <>
      <header className={styles.brandBar}>
        <Link className={styles.brand} href="/" aria-label="Agentic Design System home">
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>Agentic Design System</span>
        </Link>
        <SystemNav current="workbench" className={styles.systemNav} />
        <span className={styles.surfaceName}>
          <span className={styles.surfaceLong}>Workbench · Optional control layer · Step {step} of 4</span>
          <span className={styles.surfaceShort}>Step {step} of 4</span>
        </span>
        <span
          className={styles.setupProgress}
          role="progressbar"
          aria-label="Project setup progress"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={step}
        >
          <span style={{ width: `${step * 25}%` }} />
        </span>
      </header>

      {step === 1 && (
        <SetupMoment session={session} preset={preset} recommended={recommended} onPresetChange={choosePreset} />
      )}
      {step === 2 && (
        <IdentityReviewStep
          session={session}
          preset={preset}
          state={identityState}
          reviewed={reviewed}
          confirmed={confirmed}
          onReviewedChange={(nextReviewed) => {
            setReviewed(nextReviewed);
            setConfirmed(false);
          }}
        />
      )}
      {step === 3 && (
        <>
          <IntentRouteStep
            intent={intent}
            task={task}
            onIntentChange={chooseIntent}
            onTaskChange={changeTask}
          />
          <RoutePreview
            intent={intent}
            route={route}
            reviewed={routeReviewed}
            onReviewedChange={setRouteReviewed}
          />
        </>
      )}
      {step === 4 && handoff && intent && route?.status === "ready" && (
        <HandoffReviewStep
          session={session}
          intent={intent}
          route={route}
          handoff={handoff}
          identityApplied={identityState.mode === "unchanged"}
          copyStatus={copyStatus}
        />
      )}

      <footer className={styles.actions}>
        {step === 1 && (
          <Link className={styles.backAction} href="/">Back</Link>
        )}
        {step === 2 && <button className={styles.backAction} type="button" onClick={() => showStep(1)}>Back</button>}
        {step === 3 && <button className={styles.backAction} type="button" onClick={() => showStep(2)}>Back</button>}
        {step === 4 && <button className={styles.backAction} type="button" onClick={() => showStep(3)}>Back</button>}

        {step === 1 && (
          <button className={styles.primaryAction} type="button" disabled={blocked} onClick={() => showStep(2)}>
            Review project identity
          </button>
        )}
        {step === 2 && (
          <button
            className={styles.primaryAction}
            type="button"
            disabled={!reviewed}
            onClick={() => {
              setConfirmed(true);
              showStep(3);
            }}
          >
            {confirmed ? "Continue to choose job" : "Confirm identity"}
          </button>
        )}
        {step === 3 && (
          <button
            className={styles.primaryAction}
            type="button"
            disabled={route?.status !== "ready" || !routeReviewed}
            onClick={() => showStep(4)}
          >
            Review agent handoff
          </button>
        )}
        {step === 4 && (
          <button className={styles.primaryAction} type="button" onClick={copyHandoff}>
            {copyStatus.startsWith("Agent handoff copied") ? "Handoff copied" : "Copy agent handoff"}
          </button>
        )}
      </footer>
    </>
  );
}
