"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { playEmberChirp } from "./emberAudio";

const DESKTOP_RUNG_STEP = 58;
const MOBILE_RUNG_STEP = 48;

export function AssemblyLineClimber() {
  const climberRef = useRef<HTMLDivElement>(null);
  const [hopCount, setHopCount] = useState(0);

  useEffect(() => {
    const climber = climberRef.current;
    const factoryFloor = climber?.closest<HTMLElement>(".factory-floor");
    if (!climber || !factoryFloor) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;

      if (reduceMotion.matches) {
        climber.style.removeProperty("--climber-step-x");
        climber.style.removeProperty("--climber-step-y");
        climber.style.removeProperty("--climber-step-tilt");
        return;
      }

      const floorRect = factoryFloor.getBoundingClientRect();
      const stickyTop = Number.parseFloat(getComputedStyle(climber).top) || 0;
      const distance = Math.max(0, Math.min(factoryFloor.offsetHeight, stickyTop - floorRect.top));
      const rungStep = window.innerWidth <= 720 ? MOBILE_RUNG_STEP : DESKTOP_RUNG_STEP;
      const stepProgress = distance / rungStep;
      const step = Math.floor(stepProgress);
      const phase = stepProgress - step;
      const direction = step % 2 === 0 ? 1 : -1;
      const lift = Math.sin(phase * Math.PI);
      const lateral = direction * (phase * 2 - 1) * 3;
      const tilt = -2 + Math.sin(phase * Math.PI * 2);

      climber.style.setProperty("--climber-step-x", `${lateral.toFixed(2)}px`);
      climber.style.setProperty("--climber-step-y", `${(-lift * 4.5).toFixed(2)}px`);
      climber.style.setProperty("--climber-step-tilt", `${tilt.toFixed(2)}deg`);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    reduceMotion.addEventListener("change", requestUpdate);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    requestUpdate();

    return () => {
      reduceMotion.removeEventListener("change", requestUpdate);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={climberRef}
      className="assembly-climber"
      data-motion="rail-follow"
    >
      <button
        type="button"
        className="assembly-climber-figure focus-ring"
        aria-label="Make Ember hop"
        onClick={() => {
          playEmberChirp();
          setHopCount((count) => count + 1);
        }}
      >
        <span
          key={hopCount}
          className={`assembly-climber-image${hopCount > 0 ? " assembly-climber-image--hop" : ""}`}
        >
          <Image
            src="/characters/ember-climbing.png"
            alt=""
            width={512}
            height={512}
            sizes="(max-width: 720px) 96px, (max-width: 1040px) 108px, 124px"
          />
        </span>
      </button>
    </div>
  );
}
