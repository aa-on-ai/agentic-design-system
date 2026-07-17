"use client";

import { type RefObject, useEffect } from "react";

const RUNG_STEP = 58;
const ACTIVE_LINE = 0.5;
const POSE_BY_STAGE: Record<string, string> = {
  intent: "reach",
  baseline: "contact",
  rubric: "inspect",
  evidence: "inspect",
  release: "release",
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function useAssemblyLineMotion(climberRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const climber = climberRef.current;
    const factoryFloor = climber?.closest<HTMLElement>(".factory-floor");
    if (!climber || !factoryFloor) return;

    const stations = Array.from(factoryFloor.querySelectorAll<HTMLElement>(".station[data-stage]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeStation: HTMLElement | null = null;
    let stationPose = "climb";
    let frame = 0;
    let previousY = window.scrollY;
    let smoothedVelocity = 0;
    let previousStep = -1;
    let idleTimer = 0;

    const updateActiveStation = () => {
      const focusY = window.innerHeight * ACTIVE_LINE;
      let closest: HTMLElement | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const station of stations) {
        const rect = station.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;
        const distance = Math.abs(rect.top + rect.height / 2 - focusY);
        if (distance < closestDistance) {
          closest = station;
          closestDistance = distance;
        }
      }

      if (closest !== activeStation) {
        if (activeStation) activeStation.dataset.active = "false";
        if (closest) closest.dataset.active = "true";
        activeStation = closest;
      }

      const stage = activeStation?.dataset.stage ?? "";
      stationPose = POSE_BY_STAGE[stage] ?? "climb";
      climber.dataset.station = stage || "between";
    };

    const update = () => {
      frame = 0;
      const rect = factoryFloor.getBoundingClientRect();
      const active = rect.top < window.innerHeight * 0.78 && rect.bottom > window.innerHeight * 0.28;
      climber.dataset.active = String(active);
      updateActiveStation();

      if (reduceMotion.matches) {
        climber.dataset.reducedMotion = "true";
        climber.dataset.direction = "idle";
        climber.dataset.pose = stationPose;
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
        climber.dataset.pose = "climb";
      }

      const floorY = window.scrollY + rect.top;
      const distance = Math.max(0, window.scrollY - floorY + window.innerHeight * 0.42);
      const stepProgress = distance / RUNG_STEP;
      const step = Math.floor(stepProgress);
      const phase = stepProgress - step;
      const strideDirection = step % 2 === 0 ? 1 : -1;
      const lift = Math.sin(phase * Math.PI);
      const lateral = strideDirection * (phase * 2 - 1) * 4.5;
      const strideTilt = Math.sin(phase * Math.PI * 2) * 0.8;
      const velocityTilt = clamp(smoothedVelocity * 0.16, -3.2, 3.2);
      const stretch = 1 + lift * 0.012;

      if (step !== previousStep) {
        climber.dataset.stepSide = step % 2 === 0 ? "left" : "right";
        previousStep = step;
      }

      climber.style.setProperty("--climber-x", `${lateral.toFixed(2)}px`);
      climber.style.setProperty("--climber-y", `${(-lift * 7).toFixed(2)}px`);
      climber.style.setProperty("--climber-tilt", `${(strideTilt + velocityTilt).toFixed(2)}deg`);
      climber.style.setProperty("--climber-scale-x", (2 - stretch).toFixed(3));
      climber.style.setProperty("--climber-scale-y", stretch.toFixed(3));
      previousY = window.scrollY;

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        climber.dataset.direction = "idle";
        climber.dataset.pose = stationPose;
        smoothedVelocity = 0;
        climber.style.setProperty("--climber-tilt", "0deg");
      }, 150);
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
      window.clearTimeout(idleTimer);
      if (activeStation) activeStation.dataset.active = "false";
    };
  }, [climberRef]);
}
