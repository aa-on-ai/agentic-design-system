import { INTENTS, type IntentId } from "./workbenchFixture";
import type { WorkbenchRoute } from "./workbenchRouting";
import { projectDisplayName, type WorkbenchSession } from "./workbenchSession";
import styles from "./workbench.module.css";

type HandoffReviewStepProps = {
  session: WorkbenchSession;
  intent: IntentId;
  route: WorkbenchRoute;
  handoff: string;
  identityApplied: boolean;
  copyStatus: string;
};

export function HandoffReviewStep(props: HandoffReviewStepProps) {
  const intentLabel = INTENTS.find((item) => item.id === props.intent)?.label ?? props.intent;

  return (
    <>
      <section className={styles.questionPane} aria-labelledby="handoff-review-title">
        <div className={styles.questionInner}>
          <p className={styles.kicker}>Agent handoff</p>
          <h1 id="handoff-review-title" tabIndex={-1}>Review the exact job.</h1>
          <p className={styles.intro}>
            This is what the agent would receive. Read it, go back to revise it, or copy it when you are satisfied.
          </p>

          <dl className={styles.handoffSummary}>
            <div><dt>Project</dt><dd>{projectDisplayName(props.session)}</dd></div>
            <div><dt>Job</dt><dd>{intentLabel}</dd></div>
            <div><dt>Route</dt><dd>{props.route.label}</dd></div>
            <div><dt>Identity</dt><dd>{props.identityApplied ? "Already applied" : "Reviewed preview"}</dd></div>
          </dl>

          <div className={styles.handoffBoundary}>
            <strong>Nothing runs here</strong>
            <p>Copying the handoff does not change files, start an agent, or deploy anything.</p>
          </div>
          <p className={styles.copyStatus} role="status" aria-live="polite" aria-atomic="true">{props.copyStatus}</p>
        </div>
      </section>

      <aside className={styles.previewPane} aria-labelledby="handoff-preview-title">
        <div className={styles.previewWrap}>
          <header className={styles.previewHeader}>
            <p>Exact handoff</p>
            <span>No execution</span>
          </header>
          <section className={styles.handoffSheet}>
            <header>
              <span>Ready to copy</span>
              <h2 id="handoff-preview-title">The agent gets only this scope.</h2>
            </header>
            <pre tabIndex={0} aria-label="Generated agent handoff"><code>{props.handoff}</code></pre>
          </section>
        </div>
      </aside>
    </>
  );
}
