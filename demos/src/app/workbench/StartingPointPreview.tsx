import { PRESETS, STARTING_POINT_PROFILES, type PresetId } from "./workbenchFixture";
import { inferredValue, projectDisplayName, type WorkbenchSession } from "./workbenchSession";
import styles from "./workbench.module.css";

export function StartingPointPreview({ session, preset }: {
  session: WorkbenchSession;
  preset: PresetId;
}) {
  const profile = STARTING_POINT_PROFILES[preset];
  const label = PRESETS.find((item) => item.id === preset)?.label ?? preset;
  const projectName = projectDisplayName(session);
  const audience = inferredValue(session.intake.claims.audience) ?? "Needs review";

  return (
    <aside className={styles.previewPane} aria-labelledby="identity-preview-label">
      <div className={styles.previewWrap}>
        <header className={styles.previewHeader}>
          <p id="identity-preview-label">Identity preview</p>
          <span>Updates with your selection</span>
        </header>
        <article className={styles.identitySheet} aria-live="polite" aria-atomic="true">
          <header className={styles.sheetTitle}>
            <span className={styles.projectMark} aria-hidden="true">{projectName.charAt(0)}</span>
            <div><span>Prepared project identity</span><h2>{projectName}</h2></div>
          </header>
          <p className={styles.postureSummary}>{profile.summary}</p>
          <dl className={styles.identityFields}>
            <div><dt>Project direction</dt><dd>{label}</dd></div>
            <div><dt>Primary audience</dt><dd>{audience}</dd></div>
          </dl>
          <div className={styles.principles}>
            <span>Design principles</span>
            <ul>{profile.principles.map((principle) => <li key={principle}>{principle}</li>)}</ul>
          </div>
          <footer className={styles.sheetFoot}>
            <span>The exact project identity draft is the next review step.</span>
            <strong>Next step, review the draft</strong>
          </footer>
        </article>
      </div>
    </aside>
  );
}
