"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Client navigations keep the previous scroll offset; Lenis also syncs from the
 * current window scroll on mount. Reset to top when the route path changes.
 * Runs in useLayoutEffect so it runs before LenisScroll’s useEffect initializes Lenis.
 * If the URL has a hash, scroll to that element after resetting (cross-route hash links).
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }
    if (prevPathname.current === pathname) {
      return;
    }
    prevPathname.current = pathname;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const hash = window.location.hash;
    if (hash.length <= 1) return;
    const id = decodeURIComponent(hash.slice(1));
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "auto", block: "start" });
  }, [pathname]);

  return null;
}
