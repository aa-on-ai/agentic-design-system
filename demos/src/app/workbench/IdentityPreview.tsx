import { buildProjectIdentityDraft, diffProjectIdentity } from "./projectIdentity";
import type { ProjectIdentityState } from "./projectIdentity.server";
import type { PresetId } from "./workbenchFixture";
import type { WorkbenchSession } from "./workbenchSession";
import styles from "./workbench.module.css";

export function IdentityPreview({ session, preset, state }: {
  session: WorkbenchSession;
  preset: PresetId;
  state: ProjectIdentityState;
}) {
  let diff;
  try {
    const draft = buildProjectIdentityDraft(session, preset, state.currentContent);
    diff = diffProjectIdentity(state.currentContent, draft);
  } catch {
    return (
      <aside className={styles.previewPane} aria-labelledby="identity-diff-title">
        <div className={styles.previewWrap}>
          <header className={styles.previewHeader}><p>Generated identity diff</p><span>Preview unavailable</span></header>
          <section className={styles.diffSheet}>
            <h2 id="identity-diff-title">Review the project identity diff.</h2>
            <p className={styles.diffUnavailable}>The current identity block is incomplete, so Workbench cannot generate a trustworthy diff.</p>
          </section>
        </div>
      </aside>
    );
  }

  const modeLabel = state.mode === "create"
    ? "New file"
    : state.mode === "update"
      ? "Update"
      : state.mode === "unchanged"
        ? "Current"
        : "Preview only";

  return (
    <aside className={styles.previewPane} aria-labelledby="identity-diff-title">
      <div className={styles.previewWrap}>
        <header className={styles.previewHeader}><p>Generated identity diff</p><span>{modeLabel}</span></header>
        <section className={styles.diffSheet}>
          <header className={styles.diffHeader}>
            <div><span>Exact generated artifact</span><h2 id="identity-diff-title">Review the project identity diff.</h2></div>
            <strong>Project identity file</strong>
          </header>
          <p className={styles.diffIntro}>Existing content is preserved. Added lines appear with a plus and removed lines with a minus.</p>
          <div className={styles.identityDiff} role="region" aria-label="Project identity line diff" tabIndex={0}>
            {diff.map((line, index) => (
              <code key={`${line.kind}-${index}`} data-kind={line.kind}>
                <span aria-hidden="true">{line.kind === "add" ? "+" : line.kind === "remove" ? "−" : " "}</span>
                {line.text || " "}
              </code>
            ))}
          </div>
          <p className={styles.diffFoot}>Reviewing this artifact does not apply it. Local write access remains separately gated.</p>
        </section>
      </div>
    </aside>
  );
}
