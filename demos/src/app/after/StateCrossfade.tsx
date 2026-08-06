"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Frame = {
  id: number;
  key: string;
  content: ReactNode;
  active: boolean;
};

export function StateCrossfade({
  stateKey,
  children,
  className = "",
}: {
  stateKey: string;
  children: ReactNode;
  className?: string;
}) {
  const [frames, setFrames] = useState<Frame[]>([
    { id: 0, key: stateKey, content: children, active: true },
  ]);
  const frameId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrame = useRef<number | null>(null);
  const currentKey = useRef(stateKey);

  useEffect(() => {
    if (stateKey === currentKey.current) return;
    currentKey.current = stateKey;
    const id = ++frameId.current;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrames([{ id, key: stateKey, content: children, active: true }]);
      return;
    }

    setFrames((current) => {
      const outgoing = current.find((frame) => frame.active) ?? current.at(-1);
      return [
        ...(outgoing ? [{ ...outgoing, active: false }] : []),
        { id, key: stateKey, content: children, active: false },
      ];
    });
    animationFrame.current = requestAnimationFrame(() => {
      animationFrame.current = requestAnimationFrame(() => {
        setFrames((current) => current.map((frame) => ({ ...frame, active: frame.id === id })));
        animationFrame.current = null;
      });
    });

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setFrames((current) => current.filter((frame) => frame.id === id));
      timer.current = null;
    }, 200);
  }, [children, stateKey]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
  }, []);

  return (
    <div className={`ads-state-crossfade ${className}`.trim()}>
      {frames.map((frame) => (
        <div
          key={frame.id}
          data-state-frame
          data-state-key={frame.key}
          data-active={frame.active}
          className={`ads-state-frame ${frame.active ? "is-active" : ""}`}
          aria-hidden={!frame.active}
          inert={!frame.active}
        >
          {frame.content}
        </div>
      ))}
    </div>
  );
}
