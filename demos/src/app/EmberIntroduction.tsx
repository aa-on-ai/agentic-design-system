"use client";

/* Keep Ember’s character interaction portable to the standalone homepage export. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import styles from "./EmberIntroduction.module.css";

const messages = [
  { title: "I’m Ember, your evidence-reading companion.", text: "I help you read what was checked, what the evidence shows, and what still needs your judgment. I don’t make the taste call for you." },
  { title: "Keep the whole picture.", text: "This workshop illustration stays uncropped, even on a phone. The composition is part of the product’s character." },
  { title: "Leave a way through.", text: "Try copying the request below. If clipboard access is blocked, the text stays selected so you can copy it yourself." },
  { title: "A check isn’t a verdict.", text: "A working button doesn’t tell us whether this page feels right. That’s still a human judgment. Yours." },
];

export function EmberIntroduction({ asset }: { asset: (path: string) => string }) {
  const [step, setStep] = useState(0);
  const character = useRef<HTMLImageElement>(null);
  const response = useRef<Animation | null>(null);
  const last = step === messages.length - 1;
  const hint = step === 0 ? "Show me what you notice" : last ? "Take another look" : "Next observation";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopMotion = () => { if (preference.matches) response.current?.cancel(); };
    preference.addEventListener("change", stopMotion);
    return () => {
      preference.removeEventListener("change", stopMotion);
      response.current?.cancel();
    };
  }, []);

  const advance = () => {
    setStep(current => (current + 1) % messages.length);
    const image = character.current;
    if (!image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Retarget from the current pose when someone taps again mid-response.
    const currentPose = getComputedStyle(image).transform;
    response.current?.cancel();
    response.current = image.animate([
      { transform: currentPose === "none" ? "translateY(0) rotate(0)" : currentPose },
      { transform: "translateY(-7px) rotate(-3deg)", offset: 0.38 },
      { transform: "translateY(0) rotate(0)" },
    ], { duration: 280, easing: "cubic-bezier(.22,.61,.36,1)" });
  };

  return (
    <section className={styles.introduction} id="ember" aria-label="Ember, the evidence-reading companion" data-ember-step={step}>
      <button className={styles.character} type="button" onClick={advance}
        aria-label="Next observation from Ember" aria-controls="ember-message" data-ember-character>
        <img ref={character} src={asset("/characters/ember-graphite-rose.webp")}
          alt="" width="512" height="512" loading="lazy" />
        <span className={styles.characterHint} aria-hidden="true">Tap me</span>
      </button>
      <button className={styles.bubble} type="button" onClick={advance} data-ember-chat>
        <span className={styles.messages} id="ember-message">
          {messages.map((message, index) => (
            <span className={styles.message} key={message.title} data-current={index === step}
              aria-hidden={index !== step}>
              <span className={styles.hello}>{message.title}</span>
              <span className={styles.promise}>{message.text}</span>
            </span>
          ))}
        </span>
        <span className={styles.invitation}>
          <span className={styles.prompt}>{hint}
            {last ? <RotateCcw size={17} strokeWidth={1.6} aria-hidden="true" />
              : <ArrowRight size={17} strokeWidth={1.6} aria-hidden="true" />}
            <span className={styles.position} aria-hidden="true">{String(step + 1).padStart(2, "0")} / 04</span>
          </span>
        </span>
      </button>
      <span className={styles.screenReaderOnly} role="status" aria-live="polite" aria-atomic="true">
        {`${step + 1} of ${messages.length}. ${messages[step].title} ${messages[step].text}`}
      </span>
    </section>
  );
}
