"use client";

import { type RefObject, useEffect, useState } from "react";

const DESKTOP_RUNG_STEP = 58;
const MOBILE_RUNG_STEP = 48;
const STATION_SETTLE_DELAY = 160;
const ARRIVAL_TO_PEEK_DELAY = 220;
const PEEK_TO_REST_DELAY = 240;

type StationMatch = {
  distance: number;
  station: HTMLElement | null;
};

const findNearestStation = (climber: HTMLElement, stations: HTMLElement[]): StationMatch => {
  const figure = climber.querySelector<HTMLElement>(".assembly-climber-figure");
  const figureRect = figure?.getBoundingClientRect();
  const focusY = figureRect ? figureRect.top + figureRect.height * 0.52 : climber.getBoundingClientRect().top;
  let nearest: HTMLElement | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const station of stations) {
    const marker = station.querySelector<HTMLElement>(".station-index");
    if (!marker) continue;
    const markerRect = marker.getBoundingClientRect();
    const distance = Math.abs(markerRect.top + markerRect.height / 2 - focusY);
    if (distance < nearestDistance) {
      nearest = station;
      nearestDistance = distance;
    }
  }

  return { distance: nearestDistance, station: nearest };
};

export function useAssemblyLineMotion(climberRef: RefObject<HTMLDivElement | null>) {
  const [pose, setPose] = useState<"climb" | "peek">("peek");

  useEffect(() => {
    const climber = climberRef.current;
    const factoryFloor = climber?.closest<HTMLElement>(".factory-floor");
    if (!climber || !factoryFloor) return;

    const stations = Array.from(factoryFloor.querySelectorAll<HTMLElement>(".station[data-stage]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const peekPreload = new window.Image();
    peekPreload.src = "/characters/ember-peek.png";
    void peekPreload.decode().catch(() => undefined);
    let latchedStation: HTMLElement | null = null;
    let frame = 0;
    let previousY = window.scrollY;
    let smoothedVelocity = 0;
    let settleTimer = 0;
    let phaseTimer = 0;
    let restTimer = 0;
    let stationReactionCount = 0;

    const stationDistance = (station: HTMLElement) => {
      const figure = climber.querySelector<HTMLElement>(".assembly-climber-figure");
      const marker = station.querySelector<HTMLElement>(".station-index");
      if (!figure || !marker) return Number.POSITIVE_INFINITY;
      const figureRect = figure.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();
      return Math.abs(markerRect.top + markerRect.height / 2 - (figureRect.top + figureRect.height * 0.52));
    };

    const setPoseState = (nextPose: "climb" | "peek") => {
      climber.dataset.pose = nextPose;
      setPose(nextPose);
    };

    const clearPhaseTimers = () => {
      window.clearTimeout(phaseTimer);
      window.clearTimeout(restTimer);
      phaseTimer = 0;
      restTimer = 0;
    };

    const clearStationState = () => {
      for (const station of stations) {
        station.dataset.active = "false";
        station.dataset.arrival = "false";
      }
    };

    const faceStation = (station: HTMLElement) => {
      const stage = station.dataset.stage ?? "between";
      const machineSide = window.innerWidth <= 720
        ? "right"
        : station.dataset.side === "left" ? "right" : "left";
      climber.dataset.station = stage;
      climber.dataset.stop = stage;
      climber.dataset.facing = machineSide;
      climber.style.setProperty("--climber-step-x", "0px");
      climber.style.setProperty("--climber-step-y", "0px");
      climber.style.setProperty("--climber-step-tilt", "0deg");
    };

    const restAtStation = (station: HTMLElement) => {
      clearPhaseTimers();
      clearStationState();
      station.dataset.active = "true";
      faceStation(station);
      climber.dataset.phase = "resting";
      setPoseState("peek");
    };

    const reactAtStation = (station: HTMLElement) => {
      clearPhaseTimers();
      clearStationState();
      latchedStation = station;
      stationReactionCount += 1;
      climber.dataset.stationReactionCount = String(stationReactionCount);
      station.dataset.arrival = "true";
      faceStation(station);
      climber.dataset.phase = "arriving";
      setPoseState("climb");

      phaseTimer = window.setTimeout(() => {
        phaseTimer = 0;
        climber.dataset.phase = "peeking";
        setPoseState("peek");
        restTimer = window.setTimeout(() => {
          restTimer = 0;
          restAtStation(station);
        }, PEEK_TO_REST_DELAY);
      }, ARRIVAL_TO_PEEK_DELAY);
    };

    const settle = () => {
      settleTimer = 0;
      if (reduceMotion.matches) return;

      const match = findNearestStation(climber, stations);
      const enterThreshold = window.innerWidth <= 720 ? 76 : 94;
      const exitThreshold = window.innerWidth <= 720 ? 116 : 138;
      if (!match.station || match.distance > enterThreshold) {
        if (latchedStation && stationDistance(latchedStation) <= exitThreshold) {
          restAtStation(latchedStation);
          return;
        }

        clearPhaseTimers();
        clearStationState();
        latchedStation = null;
        climber.dataset.phase = "idle";
        climber.dataset.station = "between";
        climber.dataset.stop = "none";
        setPoseState("climb");
        return;
      }

      if (match.station === latchedStation) {
        restAtStation(match.station);
        return;
      }

      reactAtStation(match.station);
    };

    const scheduleSettle = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, STATION_SETTLE_DELAY);
    };

    const update = () => {
      frame = 0;

      const floorRect = factoryFloor.getBoundingClientRect();
      const visible = floorRect.top < window.innerHeight * 0.88 && floorRect.bottom > window.innerHeight * 0.12;
      climber.dataset.visible = String(visible);

      const stagedAtMobileStart = window.innerWidth <= 720 && floorRect.top > 0;
      if (stagedAtMobileStart) {
        window.clearTimeout(settleTimer);
        settleTimer = 0;
        clearPhaseTimers();
        clearStationState();
        latchedStation = null;
        smoothedVelocity = 0;
        climber.dataset.reducedMotion = String(reduceMotion.matches);
        climber.dataset.phase = "staged";
        climber.dataset.station = "between";
        climber.dataset.stop = "none";
        setPoseState("peek");
        climber.style.setProperty("--climber-step-x", "0px");
        climber.style.setProperty("--climber-step-y", "0px");
        climber.style.setProperty("--climber-step-tilt", "0deg");
        previousY = window.scrollY;
        return;
      }

      if (reduceMotion.matches) {
        clearPhaseTimers();
        clearStationState();
        latchedStation = null;
        climber.dataset.reducedMotion = "true";
        climber.dataset.phase = "reduced";
        climber.dataset.station = "between";
        climber.dataset.stop = "none";
        setPoseState("climb");
        climber.style.removeProperty("--climber-step-x");
        climber.style.removeProperty("--climber-step-y");
        climber.style.removeProperty("--climber-step-tilt");
        previousY = window.scrollY;
        return;
      }

      climber.dataset.reducedMotion = "false";
      clearPhaseTimers();
      clearStationState();
      climber.dataset.phase = "moving";
      climber.dataset.stop = "none";
      setPoseState("climb");

      const exitThreshold = window.innerWidth <= 720 ? 116 : 138;
      if (latchedStation && stationDistance(latchedStation) > exitThreshold) {
        latchedStation = null;
        climber.dataset.station = "between";
      }

      const delta = window.scrollY - previousY;
      const boundedVelocity = Math.max(-24, Math.min(24, delta));
      smoothedVelocity += (boundedVelocity - smoothedVelocity) * 0.28;
      const stickyTop = Number.parseFloat(getComputedStyle(climber).top) || 0;
      const distance = Math.max(0, Math.min(factoryFloor.offsetHeight, stickyTop - floorRect.top));
      const rungStep = window.innerWidth <= 720 ? MOBILE_RUNG_STEP : DESKTOP_RUNG_STEP;
      const stepProgress = distance / rungStep;
      const step = Math.floor(stepProgress);
      const phase = stepProgress - step;
      const direction = step % 2 === 0 ? 1 : -1;
      const lift = Math.sin(phase * Math.PI);
      const speedEnergy = Math.min(1, Math.abs(smoothedVelocity) / 12);
      const lateral = direction * (phase * 2 - 1) * (3.5 + speedEnergy * 1.5);
      const strideTilt = Math.sin(phase * Math.PI * 2) * 1.35;
      const velocityTilt = Math.max(-2.6, Math.min(2.6, smoothedVelocity * 0.12));

      climber.dataset.stepSide = step % 2 === 0 ? "left" : "right";
      climber.dataset.facing = step % 2 === 0 ? "right" : "left";
      climber.style.setProperty("--climber-step-x", `${lateral.toFixed(2)}px`);
      climber.style.setProperty("--climber-step-y", `${(-lift * (6.5 + speedEnergy * 1.5)).toFixed(2)}px`);
      climber.style.setProperty("--climber-step-tilt", `${(strideTilt + velocityTilt).toFixed(2)}deg`);
      previousY = window.scrollY;
      scheduleSettle();
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
      window.clearTimeout(settleTimer);
      clearPhaseTimers();
      clearStationState();
    };
  }, [climberRef]);

  return pose;
}
