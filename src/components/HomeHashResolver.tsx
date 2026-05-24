"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenisInstance } from "@/components/lenis-context";
import { getAnchorAlignFromTarget, getAnchorScrollTopPx } from "@/lib/scroll-anchors";
import { refreshLenisAndScrollTrigger } from "@/lib/lenis-scroll-sync";

function scrollToId(id: string, lenis: ReturnType<typeof useLenisInstance>) {
  const el = document.getElementById(id);
  if (!el) return false;

  if (lenis) {
    const align = getAnchorAlignFromTarget(el);
    lenis.scrollTo(getAnchorScrollTopPx(el, align), {
      immediate: true,
      programmatic: true,
    });
    refreshLenisAndScrollTrigger(lenis);
  } else {
    el.scrollIntoView({ block: "start", behavior: "auto" });
  }
  return true;
}

/**
 * Next.js `<Link scroll>` defaults to **true**, which scrolls the window to (0,0) after
 * client navigation and **wipes** in-route hash targets (`/#practice`). This component
 * re-applies the hash scroll after `/` mounts and whenever the hash changes.
 */
export function HomeHashResolver() {
  const pathname = usePathname();
  const lenis = useLenisInstance();

  useEffect(() => {
    if (pathname !== "/") return;

    const run = () => {
      const hash = window.location.hash;
      if (hash.length < 2) return;
      const id = decodeURIComponent(hash.slice(1));
      if (!id) return;
      /** Prelude is no longer a public hash target — strip `/#prelude` from the URL. */
      if (id === "prelude") {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
        return;
      }
      scrollToId(id, lenis);
    };

    run();

    const timeouts = [0, 16, 48, 96, 200, 400, 700, 1200, 2000].map((ms) =>
      window.setTimeout(run, ms),
    );

    const onHashChange = () => {
      run();
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      timeouts.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [pathname, lenis]);

  return null;
}
