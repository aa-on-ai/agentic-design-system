import { IdentityPreview } from "./IdentityPreview";
import type { ProjectIdentityState } from "./projectIdentity.server";
import type { PresetId } from "./workbenchFixture";
import type { WorkbenchSession } from "./workbenchSession";
import styles from "./workbench.module.css";

export function IdentityReviewStep({ session, preset, state, reviewed, confirmed, onReviewedChange }: {
  session: WorkbenchSession;
  preset: PresetId;
  state: ProjectIdentityState;
  reviewed: boolean;
  confirmed: boolean;
  onReviewedChange: (reviewed: boolean) => void;
}) {
  return (
    <>
      <section className={styles.questionPane} aria-labelledby="identity-review-title">
        <div className={styles.questionInner}>
          <p className={styles.kicker}>Project identity</p>
          <h1 id="identity-review-title" tabIndex={-1}>Review project identity.</h1>
          <p className={styles.intro}>
            Check the exact generated diff before confirming it. This review stays local and does not write to the project.
          </p>

          <label className={styles.reviewCheck}>
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(event) => onReviewedChange(event.target.checked)}
            />
            <span>
              <strong>I reviewed this exact project identity change</strong>
              <small>Confirm only when the selected direction and every generated line are correct.</small>
            </span>
          </label>

          <div className={styles.localReviewNote}>
            <strong>Local review only</strong>
            <span>The safe server apply route remains gated. No project file changes in this step.</span>
          </div>

          {confirmed && (
            <p className={styles.reviewSuccess} role="status">
              <strong>Project identity reviewed</strong>
              <span>Your confirmation is saved for this browser session. No project file changed.</span>
            </p>
          )}
        </div>
      </section>
      <IdentityPreview session={session} preset={preset} state={state} />
    </>
  );
}
