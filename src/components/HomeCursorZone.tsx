"use client";

import { useRef, type ReactNode } from "react";
import { LandingPageCursor } from "@/components/LandingPageCursor";
import { useLenisInstance } from "@/components/lenis-context";
import { useLandingDragScroll } from "@/hooks/useLandingDragScroll";

type Props = {
  children: ReactNode;
};

/** Wraps the homepage so the custom pointer tracks header + main (desktop only). */
export function HomeCursorZone({ children }: Props) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const lenis = useLenisInstance();
  useLandingDragScroll(zoneRef, lenis);

  return (
    <div
      ref={zoneRef}
      className="landing-cursor-zone relative min-h-full select-none [&_input]:select-text [&_textarea]:select-text"
    >
      <LandingPageCursor zoneRef={zoneRef} />
      {children}
    </div>
  );
}
