"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { playEmberChirp } from "./emberAudio";

const RUNG_STEP = 58;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function AssemblyLineClimber() {
  const climberRef = useRef<HTMLDivElement>(null);
  const [hopCount, setHopCount] = useState(0);

  useEffect(() => {
    const climber = climberRef.current;
    const factoryFloor = climber?.closest<HTMLElement>(".factory-floor");
    if (!climber || !factoryFloor) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previousY = window.scrollY;
    let smoothedVelocity = 0;
    let previousStep = -1;
    let idleTimer = 0;

    const update = () => {
      frame = 0;

      const rect = factoryFloor.getBoundingClientRect();
      const active = rect.top < window.innerHeight * 0.78 && rect.bottom > window.innerHeight * 0.28;
      climber.dataset.active = String(active);

      if (reduceMotion.matches) {
        climber.dataset.reducedMotion = "true";
        climber.dataset.direction = "idle";
        climber.style.setProperty("--climber-tilt", "0deg");
        smoothedVelocity = 0;
        previousY = window.scrollY;
        return;
      }

      climber.dataset.reducedMotion = "false";

      const delta = window.scrollY - previousY;
      smoothedVelocity = smoothedVelocity * 0.72 + delta * 0.28;
      if (Math.abs(delta) > 1) {
        climber.dataset.direction = delta > 0 ? "down" : "up";
      }

      const floorY = window.scrollY + rect.top;
      const distance = Math.max(0, window.scrollY - floorY + window.innerHeight * 0.42);
      const stepProgress = distance / RUNG_STEP;
      const step = Math.floor(stepProgress);
      const phase = stepProgress - step;
      const strideDirection = step % 2 === 0 ? 1 : -1;
      const lift = Math.sin(phase * Math.PI);
      const lateral = strideDirection * (phase * 2 - 1) * 4.5;
      const vertical = -lift * 7;
      const strideTilt = Math.sin(phase * Math.PI * 2) * 0.8;
      const velocityTilt = clamp(smoothedVelocity * 0.16, -3.2, 3.2);
      const stretch = 1 + lift * 0.012;

      if (step !== previousStep) {
        climber.dataset.stepSide = step % 2 === 0 ? "left" : "right";
        previousStep = step;
      }

      climber.style.setProperty("--climber-x", `${lateral.toFixed(2)}px`);
      climber.style.setProperty("--climber-y", `${vertical.toFixed(2)}px`);
      climber.style.setProperty("--climber-tilt", `${(strideTilt + velocityTilt).toFixed(2)}deg`);
      climber.style.setProperty("--climber-scale-x", (2 - stretch).toFixed(3));
      climber.style.setProperty("--climber-scale-y", stretch.toFixed(3));
      previousY = window.scrollY;

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        climber.dataset.direction = "idle";
        smoothedVelocity = 0;
        climber.style.setProperty("--climber-tilt", "0deg");
      }, 120);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const handleMotionPreference = () => requestUpdate();
    reduceMotion.addEventListener("change", handleMotionPreference);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    requestUpdate();

    return () => {
      reduceMotion.removeEventListener("change", handleMotionPreference);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div
      ref={climberRef}
      className="assembly-climber"
      data-active="false"
      data-direction="idle"
      data-reduced-motion="false"
      data-step-side="left"
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
        <span key={hopCount} className="assembly-climber-image">
          <Image
            src="/characters/ember-climbing.png"
            alt=""
            width={512}
            height={512}
            sizes="(max-width: 720px) 96px, (max-width: 1040px) 108px, 124px"
            className="assembly-climber-pose assembly-climber-pose--left"
          />
          <Image
            src="/characters/ember-climbing.png"
            alt=""
            width={512}
            height={512}
            sizes="(max-width: 720px) 96px, (max-width: 1040px) 108px, 124px"
            className="assembly-climber-pose assembly-climber-pose--right"
          />
        </span>
      </button>
    </div>
  );
}
