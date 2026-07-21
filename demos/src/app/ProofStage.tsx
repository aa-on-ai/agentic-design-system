"use client";

import Image, { type StaticImageData } from "next/image";
import { type KeyboardEvent, useRef, useState } from "react";
import iter1Desktop from "../../../docs/loop-demo/iter1/default-1280x800.png";
import iter1Mobile from "../../../docs/loop-demo/iter1/default-390x844.png";
import iter2Desktop from "../../../docs/loop-demo/iter2/default-1280x800.png";
import iter2Mobile from "../../../docs/loop-demo/iter2/default-390x844.png";
import iter3Desktop from "../../../docs/loop-demo/iter3/default-1280x800.png";
import iter3Mobile from "../../../docs/loop-demo/iter3/default-390x844.png";

type Iteration = {
  id: string;
  label: string;
  desktop: StaticImageData;
  mobile: StaticImageData;
  axe: number;
  touch: number;
  verdict: "needs_revision" | "satisfied";
  note: string;
};

const iterations: Iteration[] = [
  {
    id: "iter1",
    label: "Baseline",
    desktop: iter1Desktop,
    mobile: iter1Mobile,
    axe: 12,
    touch: 114,
    verdict: "needs_revision",
    note: "The rendered UI looked plausible. The browser evidence found a broken interaction floor.",
  },
  {
    id: "iter2",
    label: "Revision",
    desktop: iter2Desktop,
    mobile: iter2Mobile,
    axe: 12,
    touch: 12,
    verdict: "needs_revision",
    note: "The touch-target repair worked, but serious accessibility findings still blocked a pass.",
  },
  {
    id: "iter3",
    label: "Final",
    desktop: iter3Desktop,
    mobile: iter3Mobile,
    axe: 0,
    touch: 0,
    verdict: "satisfied",
    note: "Every rendered gate cleared across four states and three breakpoints.",
  },
];

export function ProofStage() {
  const [activeId, setActiveId] = useState("iter3");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = iterations.find((iteration) => iteration.id === activeId) ?? iterations[2];

  const selectTab = (index: number) => {
    const nextIndex = (index + iterations.length) % iterations.length;
    setActiveId(iterations[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab(iterations.length - 1);
    }
  };

  return (
    <section className="proof-stage" aria-labelledby="proof-stage-title">
      <div className="proof-stage-head">
        <div>
          <p className="proof-stage-kicker">Real ADS run / Orders screen</p>
          <h2 id="proof-stage-title">The UI is only half the artifact.</h2>
        </div>
        <span
          className={`proof-stage-verdict proof-stage-verdict--${active.verdict}`}
        >
          {active.verdict}
        </span>
      </div>

      <div className="iteration-tabs" role="tablist" aria-label="Orders run iterations">
        {iterations.map((iteration, index) => (
          <button
            key={iteration.id}
            id={`${iteration.id}-tab`}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-controls="orders-proof-panel"
            aria-selected={active.id === iteration.id}
            tabIndex={active.id === iteration.id ? 0 : -1}
            onClick={() => setActiveId(iteration.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            <span>0{index + 1}</span>
            {iteration.label}
          </button>
        ))}
      </div>

      <div
        id="orders-proof-panel"
        className="proof-viewport"
        role="tabpanel"
        aria-labelledby={`${active.id}-tab`}
      >
        <Image
          key={`${active.id}-desktop`}
          className="proof-image proof-image--desktop"
          src={active.desktop}
          alt={`Orders screen at ${active.label.toLowerCase()} iteration, desktop viewport`}
          priority
          sizes="(max-width: 980px) 100vw, 58vw"
        />
        <Image
          key={`${active.id}-mobile`}
          className="proof-image proof-image--mobile"
          src={active.mobile}
          alt={`Orders screen at ${active.label.toLowerCase()} iteration, mobile viewport`}
          priority
          sizes="(max-width: 620px) 92vw, 390px"
        />
        <div
          className="proof-callout"
          aria-label={`${active.axe} axe violations, ${active.touch} undersized touch targets`}
        >
          <strong>{active.axe} axe</strong>
          <span>{active.touch} touch</span>
        </div>
      </div>

      <div className="proof-stage-foot">
        <p
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${active.verdict}. ${active.axe} axe violations. ${active.touch} undersized touch targets. ${active.note}`}
        >
          {active.note}
        </p>
        <span>4 states · 390 / 768 / 1280px</span>
      </div>
    </section>
  );
}
