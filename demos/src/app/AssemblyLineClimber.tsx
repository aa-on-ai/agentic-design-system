"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { playEmberChirp } from "./emberAudio";

export function AssemblyLineClimber() {
  const climberRef = useRef<HTMLDivElement>(null);
  const [hopCount, setHopCount] = useState(0);

  return (
    <div
      ref={climberRef}
      className="assembly-climber"
      data-motion="stable"
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
