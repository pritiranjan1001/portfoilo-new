"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  getNativeScrollScroller,
  registerGsapPlugins,
  shouldReduceMotion,
} from "@/lib/gsap-plugins";

/** Hairline read-progress; scrubbed to the page scroll. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    registerGsapPlugins();
    if (shouldReduceMotion()) return;
    const b = bar.current;
    if (!b) return;

    const scroller = getNativeScrollScroller();
    if (!scroller) return;

    gsap.set(b, { scaleX: 0, transformOrigin: "0 50%" });

    gsap.to(b, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        scroller,
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.45,
      },
    });
  });

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[100] h-px w-full"
      aria-hidden
    >
      <div
        ref={bar}
        className="h-full w-full bg-[var(--foreground)] opacity-[0.18] dark:opacity-[0.28]"
      />
    </div>
  );
}
