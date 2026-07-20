"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { playEmberChirp } from "./emberAudio";

export function FooterEmber() {
  const imageRef = useRef<HTMLSpanElement>(null);
  const [reactionCount, setReactionCount] = useState(0);

  const react = () => {
    playEmberChirp();
    setReactionCount((count) => count + 1);

    const image = imageRef.current;
    if (!image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    image.classList.remove("footer-ember-image--bounce");
    void image.offsetWidth;
    image.classList.add("footer-ember-image--bounce");
  };

  return (
    <button
      type="button"
      className="footer-ember focus-ring"
      aria-label="Make Ember bounce"
      data-reaction-count={reactionCount}
      onClick={react}
    >
      <span
        ref={imageRef}
        className="footer-ember-image"
        aria-hidden="true"
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === "ember-peek-pop") {
            event.currentTarget.classList.remove("footer-ember-image--bounce");
          }
        }}
      >
        <Image src="/characters/ember-peek.png" alt="" width={512} height={512} sizes="120px" />
      </span>
      <span className="sr-only" aria-live="polite">
        {reactionCount > 0 ? `Ember bounced ${reactionCount} ${reactionCount === 1 ? "time" : "times"}` : ""}
      </span>
    </button>
  );
}
