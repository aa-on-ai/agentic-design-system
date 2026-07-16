"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { playEmberChirp } from "./emberAudio";

const RUNG_STEP = 28;

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
    let idleTimer = 0;

    const update = () => {
      frame = 0;

      const rect = factoryFloor.getBoundingClientRect();
      const active = rect.top < window.innerHeight * 0.78 && rect.bottom > window.innerHeight * 0.28;
      climber.dataset.active = String(active);

      if (reduceMotion.matches) {
        climber.dataset.reducedMotion = "true";
        return;
      }

      climber.dataset.reducedMotion = "false";

      const delta = window.scrollY - previousY;
      if (Math.abs(delta) > 1) {
        climber.dataset.direction = delta > 0 ? "down" : "up";
      }

      const floorY = window.scrollY + rect.top;
      const distance = Math.max(0, window.scrollY - floorY + window.innerHeight * 0.42);
      const rung = Math.floor(distance / RUNG_STEP);
      const flip = rung % 2 === 0 ? 1 : -1;
      const bob = Math.sin(distance / 13) * 2.5;
      const tilt = delta > 1 ? 1.5 : delta < -1 ? -1.5 : 0;

      climber.style.setProperty("--climber-flip", String(flip));
      climber.style.setProperty("--climber-bob", `${bob.toFixed(2)}px`);
      climber.style.setProperty("--climber-tilt", `${tilt}deg`);
      previousY = window.scrollY;

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        climber.dataset.direction = "idle";
        climber.style.setProperty("--climber-tilt", "0deg");
      }, 140);
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
          />
        </span>
      </button>
    </div>
  );
}
