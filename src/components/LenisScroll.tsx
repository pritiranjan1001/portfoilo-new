"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { HomeHashResolver } from "@/components/HomeHashResolver";
import { LenisInstanceContext } from "@/components/lenis-context";
import { getAnchorAlignFromTarget, getAnchorScrollTopPx } from "@/lib/scroll-anchors";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

function isKeyboardFocusEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el?.closest) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return Boolean(el.closest("[contenteditable='true']"));
}

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

  /**
   * Lenis drives scroll with raf + lerp; ScrollTrigger must read/write scroll through
   * `scrollerProxy` or pin + scrub never sync (pins appear to do nothing).
   */
  useLayoutEffect(() => {
    registerGsapPlugins();
    if (shouldReduceMotion()) return;

    const immersive = variant === "immersive";

    // On hard reload the browser may restore scroll position before Lenis/ScrollTrigger
    // initialize, which can cause a visible vertical "nudge" when pinning starts.
    const prevScrollRestoration = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }
    // Don't force a pre-init scroll jump here; it can fight pinning on route changes.

    const instance = new Lenis({
      lerp: immersive ? 0.038 : 0.09,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: immersive ? 0.88 : 1,
      wheelMultiplier: immersive ? 0.72 : 1,
      syncTouchLerp: immersive ? 0.048 : 0.08,
      stopInertiaOnNavigate: true,
    });

    /**
     * Lenis scrolls via `window.scrollTo` → updates `document.documentElement` scroll.
     * Proxy must match the element ScrollTrigger uses as `scroller`, or pin + scrub drift / fail.
     */
    const scroller = document.documentElement;
    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (arguments.length && typeof value === "number") {
          instance.scrollTo(value, { immediate: true });
        }
        return instance.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });
    ScrollTrigger.defaults({ scroller });

    setLenis(instance);
    ScrollTrigger.refresh();

    if (!window.location.hash || window.location.hash.length <= 1) {
      instance.scrollTo(0, { immediate: true, programmatic: true });
      requestAnimationFrame(() => ScrollTrigger.update());
    }

    instance.on("scroll", ScrollTrigger.update);

    const scrollToHashIfPresent = () => {
      const hash = window.location.hash;
      if (hash.length < 2) return;
      const id = decodeURIComponent(hash.slice(1));
      const el = document.getElementById(id);
      if (!el) return;
      /** `immediate` keeps hash scroll reliable; animated element scroll can stall if Lenis state drifts from the document. */
      const align = getAnchorAlignFromTarget(el);
      instance.scrollTo(getAnchorScrollTopPx(el, align), { immediate: true });
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
      const align = getAnchorAlignFromTarget(target);
      instance.scrollTo(getAnchorScrollTopPx(target, align), { immediate: true });
    };
    document.addEventListener("click", onHashLinkClick, true);

    /**
     * Native arrow / Page / Home / End scroll the document, but Lenis ignores those
     * `scroll` events while a wheel-driven smooth scroll is active (`isScrolling === "smooth"`),
     * which feels like lag or dropped keys. Route the same keys through `scrollTo` with
     * `programmatic: false` so they use the same smoothing path as the wheel.
     * `/work` uses its own key handler for the horizontal gallery — leave that alone.
     */
    const arrowStepPx = () => Math.max(72, Math.round(window.innerHeight * 0.08));
    const pageStepPx = () => Math.round(window.innerHeight * 0.85);

    const onKeyDown = (e: KeyboardEvent) => {
      if (window.location.pathname === "/work") return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isKeyboardFocusEditable(e.target)) return;

      const { key } = e;
      if (
        key !== "ArrowDown" &&
        key !== "ArrowUp" &&
        key !== "PageDown" &&
        key !== "PageUp" &&
        key !== "Home" &&
        key !== "End"
      ) {
        return;
      }

      e.preventDefault();

      const o = instance.options;
      const smoothOpts = {
        programmatic: false as const,
        lerp: o.lerp,
        ...(typeof o.duration === "number" && typeof o.easing === "function"
          ? { duration: o.duration, easing: o.easing }
          : {}),
      };

      if (key === "Home") {
        instance.scrollTo(0, smoothOpts);
        return;
      }
      if (key === "End") {
        instance.scrollTo(instance.limit, smoothOpts);
        return;
      }

      let delta = 0;
      if (key === "ArrowDown") delta = arrowStepPx();
      else if (key === "ArrowUp") delta = -arrowStepPx();
      else if (key === "PageDown") delta = pageStepPx();
      else if (key === "PageUp") delta = -pageStepPx();

      instance.scrollTo(instance.targetScroll + delta, smoothOpts);
    };

    window.addEventListener("keydown", onKeyDown);

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      try {
        window.history.scrollRestoration = prevScrollRestoration;
      } catch {
        /* ignore */
      }
      window.removeEventListener("keydown", onKeyDown);
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
      ScrollTrigger.scrollerProxy(document.documentElement, null as never);
      ScrollTrigger.defaults({ scroller: undefined });
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
