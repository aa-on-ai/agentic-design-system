"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { playEmberChirp } from "./emberAudio";
import { useAssemblyLineMotion } from "./useAssemblyLineMotion";

export function AssemblyLineClimber() {
  const climberRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLSpanElement>(null);
  const [hopCount, setHopCount] = useState(0);
  const pose = useAssemblyLineMotion(climberRef);

  const hop = () => {
    playEmberChirp();
    setHopCount((count) => count + 1);

    const stop = stopRef.current;
    const image = imageRef.current;
    if (!stop || !image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stop.classList.remove("assembly-climber-stop--react");
    image.classList.remove("assembly-climber-image--hop");
    void image.offsetWidth;
    stop.classList.add("assembly-climber-stop--react");
    image.classList.add("assembly-climber-image--hop");
  };

  return (
    <div
      ref={climberRef}
      className="assembly-climber"
      data-motion="rail-follow"
      data-visible="false"
      data-phase="idle"
      data-pose={pose}
      data-station="between"
      data-stop="none"
      data-station-reaction-count="0"
      data-facing="right"
      data-step-side="left"
      data-terminal="none"
      data-terminal-approach="false"
      data-reduced-motion="false"
    >
      <button
        type="button"
        className="assembly-climber-figure focus-ring"
        aria-label="Make Ember hop"
        data-reaction-count={hopCount}
        onClick={hop}
      >
        <span
          ref={stopRef}
          className="assembly-climber-stop"
          aria-hidden="true"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && event.currentTarget.classList.contains("assembly-climber-stop--react")) {
              event.currentTarget.classList.remove("assembly-climber-stop--react");
            }
          }}
        >
          <span
            ref={imageRef}
            className="assembly-climber-image"
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget && event.animationName === "ember-hop") {
                event.currentTarget.classList.remove("assembly-climber-image--hop");
              }
            }}
          >
            <Image
              src={`/characters/ember-${pose === "peek" ? "peek" : "climbing"}.png`}
              alt=""
              width={512}
              height={512}
              sizes="(max-width: 720px) 112px, (max-width: 1040px) 108px, 124px"
            />
          </span>
        </span>
        <span className="sr-only" aria-live="polite">
          {hopCount > 0 ? `Ember hopped ${hopCount} ${hopCount === 1 ? "time" : "times"}` : ""}
        </span>
      </button>
    </div>
  );
}
