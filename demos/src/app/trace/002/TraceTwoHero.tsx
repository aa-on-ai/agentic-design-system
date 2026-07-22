import Image from "next/image";
import styles from "./trace-two.module.css";

export function TraceTwoHero() {
  return (
    <section className={styles.hero} aria-labelledby="case-title">
      <div className={styles.caseCopy}>
        <p className={styles.eyebrow}>Pawprint dispatch · one consequential repair</p>
        <h1 id="case-title">The schedule went read-only.<br /><em>The action should have too.</em></h1>
        <p className={styles.heroLede}>
          ADS caught the contradiction, disabled the write action, kept Retry available, and proved
          every unrelated state stayed untouched.
        </p>
        <div className={styles.heroActions}>
          <a className={`${styles.action} ${styles.primaryAction} focus-ring`} href="#inspect">
            Inspect the repair <span aria-hidden="true">↓</span>
          </a>
          <a className={`${styles.action} ${styles.secondaryAction} focus-ring`} href="#packet">
            Open the proof packet <span aria-hidden="true">↗</span>
          </a>
        </div>
        <dl className={styles.heroFacts}>
          <div><dt>Contradiction</dt><dd>1 caught</dd></div>
          <div><dt>Changed captures</dt><dd>2 of 8</dd></div>
          <div><dt>Preserved action</dt><dd>Retry</dd></div>
        </dl>
      </div>

      <div className={styles.heroStage} aria-label="Ember inspecting the Pawprint repair ticket">
        <div className={styles.stageGlow} aria-hidden="true" />
        <Image
          className={styles.ember}
          src="/characters/ember-peek.png"
          width={512}
          height={512}
          priority
          alt="Ember, the ADS workshop character, inspecting a proof ticket"
        />
        <div className={styles.findingTicket}>
          <div className={styles.ticketHead}><span>Finding 01</span><span className={styles.severity}>Major</span></div>
          <strong>State and action disagree</strong>
          <p>“Read-only schedule” appeared beside an active <b>New walk</b> action.</p>
          <div className={styles.ticketRepair}><span>Repair</span><b>Disable the mutation. Keep Retry alive.</b></div>
        </div>
        <div className={styles.stageRail} aria-hidden="true"><i /><i /><i /><i /><i /></div>
      </div>
    </section>
  );
}
