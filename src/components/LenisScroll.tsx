"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

type LenisScrollProps = {
  children: ReactNode;
  /** Heavier inertia + gentler wheel steps (best on /work horizontal gallery). */
  variant?: "default" | "immersive";
};

/**
 * Smooth vertical scroll (Lenis + GSAP ScrollTrigger) for immersive routes
 * such as /work and /gallery — pairs with horizontal pin + scrub galleries.
 */
export function LenisScroll({
  children,
  variant = "default",
}: LenisScrollProps) {
  useEffect(() => {
    registerGsapPlugins();
    if (shouldReduceMotion()) return;

    const immersive = variant === "immersive";
    const lenis = new Lenis({
      /** Lower lerp = silkier catch-up; immersive tightens further for /work. */
      lerp: immersive ? 0.045 : 0.08,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: immersive ? 0.92 : 1,
      wheelMultiplier: immersive ? 0.82 : 0.95,
      syncTouchLerp: immersive ? 0.055 : 0.075,
    });

    /** Align Lenis with the window after route changes (SPA keeps scroll Y). */
    if (!window.location.hash || window.location.hash.length <= 1) {
      lenis.scrollTo(0, { immediate: true });
    }

    lenis.on("scroll", ScrollTrigger.update);

    /** Same-page #anchors use Lenis (native scroll + Lenis fight; hash jumps feel abrupt). */
    const onHashLinkClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const el = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (!el) return;
      const a = el as HTMLAnchorElement;
      let url: URL;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (url.pathname !== window.location.pathname || url.hash.length < 2) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      const header = document.querySelector("header");
      const offset = header ? -Math.round(header.getBoundingClientRect().height) : 0;
      lenis.scrollTo(target, { offset });
    };
    document.addEventListener("click", onHashLinkClick);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.removeEventListener("click", onHashLinkClick);
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [variant]);

  return <>{children}</>;
}
