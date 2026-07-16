"use client";

import Image from "next/image";
import { useState } from "react";
import { playEmberChirp } from "./emberAudio";

export function FooterEmber() {
  const [reactionCount, setReactionCount] = useState(0);

  const react = () => {
    playEmberChirp();
    setReactionCount((count) => count + 1);
  };

  return (
    <button
      type="button"
      className="footer-ember focus-ring"
      aria-label="Make Ember pop up"
      data-reaction-count={reactionCount}
      onClick={react}
    >
      <span key={reactionCount} className="footer-ember-image" aria-hidden="true">
        <Image src="/characters/ember-peek.png" alt="" width={512} height={512} sizes="120px" />
      </span>
      <span className="sr-only" aria-live="polite">
        {reactionCount > 0 ? `Ember popped up ${reactionCount} ${reactionCount === 1 ? "time" : "times"}` : ""}
      </span>
    </button>
  );
}
