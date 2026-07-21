import Image from "next/image";
import defaultDesktop from "../../../../../testing/regression/adjacent-actions-v1.3.1/baseline/pawprint/rendered/default-1280x800.png";
import defaultMobile from "../../../../../testing/regression/adjacent-actions-v1.3.1/baseline/pawprint/rendered/default-390x844.png";
import errorDesktop from "../../../../../testing/regression/adjacent-actions-v1.3.1/baseline/pawprint/rendered/error-1280x800.png";
import errorMobile from "../../../../../testing/regression/adjacent-actions-v1.3.1/baseline/pawprint/rendered/error-390x844.png";
import { TRACE } from "./traceData";
import styles from "./trace-two.module.css";

const screenshots = [
  {
    id: "default-desktop",
    state: "Default / 1280",
    title: "New walk is available",
    image: defaultDesktop,
    alt: "Pawprint default desktop state with an enabled New walk button in the header.",
    kind: "desktop",
  },
  {
    id: "error-desktop",
    state: "Error / 1280",
    title: "New walk is unavailable; Retry remains active",
    image: errorDesktop,
    alt: "Pawprint error desktop state with Read-only schedule, a disabled New walk unavailable button, and an enabled Retry now button.",
    kind: "desktop",
  },
  {
    id: "default-mobile",
    state: "Default / 390",
    title: "The mobile add control is active",
    image: defaultMobile,
    alt: "Pawprint default mobile state with an enabled add walk control.",
    kind: "mobile",
  },
  {
    id: "error-mobile",
    state: "Error / 390",
    title: "The add control is disabled; Retry remains active",
    image: errorMobile,
    alt: "Pawprint error mobile state with a dimmed disabled add walk control and an enabled Retry now button.",
    kind: "mobile",
  },
] as const;

export function ProofGallery() {
  return (
    <section className={styles.gallery} aria-labelledby="gallery-title">
      <div className={styles.galleryIntro}>
        <div>
          <p className={styles.sectionLabel}>Rendered evidence</p>
          <h2 id="gallery-title">Look at the state boundary.</h2>
        </div>
        <p>
          The repair touched only the two error captures: {TRACE.evidence.originalRepairDelta.desktopErrorPct}%
          on desktop and {TRACE.evidence.originalRepairDelta.mobileErrorPct}% on mobile. The other six
          screenshot pairs stayed identical.
        </p>
      </div>

      <div className={styles.desktopGallery}>
        {screenshots.filter(({ kind }) => kind === "desktop").map((shot) => (
          <figure key={shot.id}>
            <figcaption><span>{shot.state}</span><strong>{shot.title}</strong></figcaption>
            <Image src={shot.image} alt={shot.alt} sizes="(max-width: 900px) 100vw, 50vw" priority />
          </figure>
        ))}
      </div>

      <div className={styles.mobileGallery}>
        {screenshots.filter(({ kind }) => kind === "mobile").map((shot) => (
          <figure key={shot.id}>
            <figcaption><span>{shot.state}</span><strong>{shot.title}</strong></figcaption>
            <Image src={shot.image} alt={shot.alt} sizes="(max-width: 680px) 86vw, 340px" loading="eager" />
          </figure>
        ))}
        <aside className={styles.galleryNote}>
          <p>Fresh rerun</p>
          <strong>{TRACE.evidence.screenshots} screenshots. Zero perceptual drift.</strong>
          <span>
            The public-hardening rerun recaptured all four states at both breakpoints from behavior
            digest <code>{TRACE.rerun.behaviorDigest.slice(0, 12)}</code>. Every pair matched the lock.
          </span>
        </aside>
      </div>
    </section>
  );
}
