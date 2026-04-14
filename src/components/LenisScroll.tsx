"use client";

import { useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { HomeHashResolver } from "@/components/HomeHashResolver";
import { LenisInstanceContext } from "@/components/lenis-context";
import { ANCHOR_SCROLL_NUDGE_PX } from "@/lib/scroll-anchors";
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
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    registerGsapPlugins();
    if (shouldReduceMotion()) return;

    const immersive = variant === "immersive";
    const instance = new Lenis({
      lerp: immersive ? 0.038 : 0.08,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: immersive ? 0.88 : 1,
      wheelMultiplier: immersive ? 0.72 : 0.95,
      syncTouchLerp: immersive ? 0.048 : 0.075,
      stopInertiaOnNavigate: true,
    });

    setLenis(instance);

    if (!window.location.hash || window.location.hash.length <= 1) {
      const y = window.scrollY || window.pageYOffset || 0;
      if (y > 1) {
        instance.scrollTo(0, { immediate: true });
      }
    }

    instance.on("scroll", ScrollTrigger.update);

    const scrollToHashIfPresent = () => {
      const hash = window.location.hash;
      if (hash.length < 2) return;
      const id = decodeURIComponent(hash.slice(1));
      const el = document.getElementById(id);
      if (!el) return;
      instance.scrollTo(el, { offset: ANCHOR_SCROLL_NUDGE_PX });
    };
    scrollToHashIfPresent();
    requestAnimationFrame(() => {
      scrollToHashIfPresent();
      requestAnimationFrame(scrollToHashIfPresent);
    });
    const hashTimeouts = [0, 32, 96, 200, 400, 700, 1100, 1700].map((ms) =>
      window.setTimeout(scrollToHashIfPresent, ms),
    );

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
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
      instance.scrollTo(target, { offset: ANCHOR_SCROLL_NUDGE_PX });
    };
    document.addEventListener("click", onHashLinkClick, true);

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      hashTimeouts.forEach((t) => window.clearTimeout(t));
      document.removeEventListener("click", onHashLinkClick, true);
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      try {
        instance.scrollTo(0, { immediate: true });
      } catch {
        /* ignore */
      }
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      html.scrollTop = 0;
      document.body.scrollTop = 0;
      html.style.scrollBehavior = prev;
      instance.destroy();
      ScrollTrigger.refresh();
      setLenis(null);
    };
  }, [variant]);

  return (
    <LenisInstanceContext.Provider value={lenis}>
      {children}
      <HomeHashResolver />
    </LenisInstanceContext.Provider>
  );
}
