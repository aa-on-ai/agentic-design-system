"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { playEmberChirp } from "./emberAudio";
import { useAssemblyLineMotion } from "./useAssemblyLineMotion";

export function AssemblyLineClimber() {
  const climberRef = useRef<HTMLDivElement>(null);
  const [hopCount, setHopCount] = useState(0);
  useAssemblyLineMotion(climberRef);

  return (
    <div
      ref={climberRef}
      className="assembly-climber"
      data-active="false"
      data-direction="idle"
      data-pose="climb"
      data-reduced-motion="false"
      data-station="between"
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
            className="assembly-climber-pose assembly-climber-pose--climb-left"
          />
          <Image
            src="/characters/ember-climbing.png"
            alt=""
            width={512}
            height={512}
            sizes="(max-width: 720px) 96px, (max-width: 1040px) 108px, 124px"
            className="assembly-climber-pose assembly-climber-pose--climb-right"
          />
          <Image
            src="/characters/ember-climbing.png"
            alt=""
            width={512}
            height={512}
            sizes="(max-width: 720px) 96px, (max-width: 1040px) 108px, 124px"
            className="assembly-climber-pose assembly-climber-pose--reach"
          />
          <Image
            src="/characters/ember-climbing.png"
            alt=""
            width={512}
            height={512}
            sizes="(max-width: 720px) 96px, (max-width: 1040px) 108px, 124px"
            className="assembly-climber-pose assembly-climber-pose--contact"
          />
          <Image
            src="/characters/ember-peek.png"
            alt=""
            width={512}
            height={512}
            sizes="(max-width: 720px) 96px, (max-width: 1040px) 108px, 124px"
            className="assembly-climber-pose assembly-climber-pose--inspect"
          />
          <Image
            src="/characters/ember-climbing.png"
            alt=""
            width={512}
            height={512}
            sizes="(max-width: 720px) 96px, (max-width: 1040px) 108px, 124px"
            className="assembly-climber-pose assembly-climber-pose--release"
          />
        </span>
      </button>
    </div>
  );
}
