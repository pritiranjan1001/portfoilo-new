import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

/**
 * Apply a vertical delta in sync with Lenis (no smoothing). For **wheel** steps only — uses
 * current `lenis.scroll` as the base. (Drag should use absolute mapping from pointer-down;
 * incremental + `animatedScroll` can fight ScrollTrigger snap/pin and jump “backward”.)
 */
export function lenisApplyImmediateDelta(lenis: Lenis, deltaY: number) {
  const next = Math.max(
    0,
    Math.min(lenis.limit, lenis.scroll + deltaY),
  );
  lenis.scrollTo(next, { immediate: true, programmatic: true });
}

/** Clamp and jump to a scroll position (Lenis + ST sync via Lenis `scroll` event). */
export function lenisScrollToImmediateClamped(lenis: Lenis, y: number) {
  const next = Math.max(0, Math.min(lenis.limit, y));
  lenis.scrollTo(next, { immediate: true, programmatic: true });
}

/** After layout / pin / programmatic scroll — keep Lenis dimensions and ScrollTrigger in sync. */
export function refreshLenisAndScrollTrigger(lenis: Lenis | null) {
  requestAnimationFrame(() => {
    lenis?.resize();
    ScrollTrigger.refresh();
    requestAnimationFrame(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
    });
  });
}
