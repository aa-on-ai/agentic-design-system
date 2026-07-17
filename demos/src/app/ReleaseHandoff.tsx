"use client";

import { useEffect, useRef, useState } from "react";

export function ReleaseHandoff() {
  const handoffRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handoff = handoffRef.current;
    const releaseBay = handoff?.closest<HTMLElement>(".release-bay");
    if (!releaseBay) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { threshold: 0.08 },
    );

    observer.observe(releaseBay);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={handoffRef}
      className="release-handoff"
      data-active={active}
      aria-hidden="true"
    >
      <span className="release-handoff-ticket">
        <span className="release-handoff-screen">
          <i />
          <i />
          <i />
        </span>
        <span className="release-handoff-seal">Release<br />cleared</span>
      </span>
    </div>
  );
}
