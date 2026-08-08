import { StartingPointPreview } from "./StartingPointPreview";
import { PRESETS, type PresetId } from "./workbenchFixture";
import type { WorkbenchSession } from "./workbenchSession";
import styles from "./workbench.module.css";

type SetupMomentProps = {
  session: WorkbenchSession;
  preset: PresetId;
  recommended: PresetId;
  onPresetChange: (preset: PresetId) => void;
};

export function SetupMoment({ session, preset, recommended, onPresetChange }: SetupMomentProps) {
  return (
    <>
      <section className={styles.questionPane} aria-labelledby="starting-point-title">
        <div className={styles.questionInner}>
          <p className={styles.kicker}>Recommended starting point</p>
          <h1 id="starting-point-title" tabIndex={-1}>Choose a starting point.</h1>
          <p className={styles.intro}>
            We recommend marketing and editorial because this project is public-facing. Choose another direction if the primary job is different.
          </p>

          <fieldset className={styles.postureChoices}>
            <legend className={styles.visuallyHidden}>Project direction</legend>
            {PRESETS.map((item) => (
              <label className={styles.option} key={item.id}>
                <input
                  type="radio"
                  name="starting-point"
                  value={item.id}
                  checked={preset === item.id}
                  onChange={() => onPresetChange(item.id)}
                />
                <span className={styles.radio} aria-hidden="true" />
                <span className={styles.optionCopy}>
                  <span className={styles.optionTitle}>
                    <strong>{item.label}</strong>
                    {item.id === recommended && <span className={styles.recommended}>Recommended</span>}
                  </span>
                  <span className={styles.optionNote}>{item.note}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <p className={styles.impactNote}>
            <strong>What this changes</strong>
            <span>This direction shapes the project identity prepared next. You will review the exact artifact before anything is applied.</span>
          </p>
        </div>
      </section>
      <StartingPointPreview session={session} preset={preset} />
    </>
  );
}
