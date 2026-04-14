"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * `scroll-smooth` on `<html>` makes `scrollTo({ behavior: "auto" })` smooth and
 * easy to interrupt; Lenis / client navigations can leave the document mid-page.
 * Force an instant jump to top on real route changes when there is no hash target.
 * Routes with a hash (`/#practice`) rely on `HomeHashResolver` inside `LenisScroll`
 * plus `<Link scroll={false}>` so Next does not scroll to (0,0) after navigation.
 */
function forceScrollWindowTop() {
  const html = document.documentElement;
  const body = document.body;
  const prevHtml = html.style.scrollBehavior;
  const prevBody = body.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  body.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.scrollTop = 0;
  body.scrollTop = 0;
  html.style.scrollBehavior = prevHtml;
  body.style.scrollBehavior = prevBody;
}

function scrollForRoute() {
  const hash = window.location.hash;
  if (hash.length > 1) {
    /** Hash scroll is handled by `HomeHashResolver` + Lenis on `/` — avoid fighting Next + native scroll. */
    return;
  }
  forceScrollWindowTop();
}

export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);
  const scheduleRetries = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {
      /* ignore */
    }
  }, []);

  const run = useCallback(() => {
    scrollForRoute();
  }, []);

  useLayoutEffect(() => {
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }
    if (prevPathname.current === pathname) {
      return;
    }
    prevPathname.current = pathname;
    run();
    scheduleRetries.current = true;
  }, [pathname, run]);

  useEffect(() => {
    if (!scheduleRetries.current) {
      return;
    }
    scheduleRetries.current = false;
    run();

    let rafOuter = 0;
    let rafInner = 0;
    rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(() => run());
    });
    const t0 = window.setTimeout(run, 0);
    const t1 = window.setTimeout(run, 48);
    const t2 = window.setTimeout(run, 120);
    const t3 = window.setTimeout(run, 240);

    return () => {
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [pathname, run]);

  return null;
}
