"use client";

import { Maximize2, Minimize2, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./trace-two.module.css";

type Mode = "baseline" | "repaired" | "diff";
type Viewport = "desktop" | "mobile";

const sources = {
  desktop: {
    baseline: "/trace/002/baseline-error-desktop-2x.png",
    repaired: "/trace/002/repaired-error-desktop-2x.png",
    width: 2560,
    height: 1724,
  },
  mobile: {
    baseline: "/trace/002/baseline-error-mobile-2x.png",
    repaired: "/trace/002/repaired-error-mobile-2x.png",
    width: 780,
    height: 1754,
  },
} as const;

function ComparisonPanel({ kind, viewport, zoomed }: { kind: Exclude<Mode, "diff">; viewport: Viewport; zoomed: boolean }) {
  const repaired = kind === "repaired";
  const source = sources[viewport];
  return (
    <figure className={`${styles.comparisonPanel} ${repaired ? "" : styles.baselinePanel}`}>
      <figcaption>
        <span>{repaired ? "Repaired" : "Baseline"} · error / {viewport === "desktop" ? "1280" : "390"}</span>
        <b>{repaired ? "State-aligned action" : "Contradictory action"}</b>
      </figcaption>
      <div
        className={`${styles.shotCrop} ${styles[viewport]} ${zoomed ? styles.zoomed : ""}`}
        tabIndex={0}
        aria-label={`${repaired ? "Repaired" : "Baseline"} ${viewport} evidence. Scroll to inspect the full capture.`}
      >
        <Image
          className={styles.shotImage}
          src={repaired ? source.repaired : source.baseline}
          width={source.width}
          height={source.height}
          sizes={viewport === "desktop" ? "(max-width: 760px) 730px, 920px" : "390px"}
          unoptimized
          priority
          alt={`${repaired ? "Repaired" : "Baseline"} Pawprint error state showing ${repaired ? "New walk unavailable" : "an active New walk action"}.`}
        />
        <div className={`${styles.focusBox} ${repaired ? styles.focusBoxRepaired : ""}`}>
          <span>Read-only</span><b>{repaired ? "New walk unavailable" : "+ New walk"}</b>
        </div>
      </div>
      <p className={`${styles.annotation} ${repaired ? styles.good : styles.bad}`}>
        <i aria-hidden="true">{repaired ? "✓" : "×"}</i>
        {repaired
          ? "The mutation is natively disabled. Retry remains the active recovery path."
          : "The page says read-only while the write action still looks available."}
      </p>
    </figure>
  );
}

export function ProofGallery() {
  const [mode, setMode] = useState<Mode>("diff");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const inspectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === inspectorRef.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await inspectorRef.current?.requestFullscreen();
    else await document.exitFullscreen();
  };

  const visible = mode === "diff" ? ["baseline", "repaired"] as const : [mode] as const;
  const source = sources[viewport];

  return (
    <section className={styles.inspection} id="inspect" aria-labelledby="inspect-title">
      <div className={`${styles.sectionIntro} ${styles.inverse}`}>
        <div><p className={styles.eyebrow}>The contradiction</p><h2 id="inspect-title">See the exact state boundary.<br /><em>At a readable size.</em></h2></div>
        <p>The evidence leads. Baseline, repaired, and diff modes keep the changed control in context; full-resolution originals remain one step away.</p>
      </div>

      <div className={styles.inspectorShell} ref={inspectorRef}>
        <div className={styles.inspectorToolbar}>
          <div className={styles.modeTabs} role="tablist" aria-label="Evidence modes">
            {(["baseline", "repaired", "diff"] as const).map((item) => (
              <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => setMode(item)}>{item}</button>
            ))}
          </div>
          <div className={styles.inspectorTools}>
            {(["desktop", "mobile"] as const).map((item) => (
              <button key={item} type="button" aria-pressed={viewport === item} onClick={() => setViewport(item)}>{item}</button>
            ))}
            <button type="button" aria-label="1:1" aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)}><Search size={13} aria-hidden="true" />1:1</button>
            <button type="button" aria-label={fullscreen ? "Exit full screen" : "View evidence full screen"} aria-pressed={fullscreen} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className={`${styles.comparisonGrid} ${visible.length === 1 ? styles.singlePanel : ""}`}>
          {visible.map((kind) => <ComparisonPanel key={kind} kind={kind} viewport={viewport} zoomed={zoomed} />)}
        </div>

        <div className={styles.inspectorResult}>
          <div><span>Changed</span><strong>Error · desktop + mobile</strong></div>
          <div><span>Pixel-identical</span><strong>Default · loading · empty</strong></div>
          <div><span>Recovery</span><strong>Retry remains active</strong></div>
          <a href={mode === "baseline" ? source.baseline : source.repaired} target="_blank" rel="noreferrer">Open full-resolution original ↗</a>
        </div>
      </div>
    </section>
  );
}
