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

function clampScroll(lenis: Lenis, y: number) {
  return Math.max(0, Math.min(lenis.limit, y));
}

/** Sync Lenis internal state before / after a drag gesture. */
export function lenisSyncDragScroll(lenis: Lenis) {
  const y = lenis.scroll;
  lenis.scrollTo(y, { immediate: true, programmatic: true, force: true });
}

/**
 * Smooth follow while dragging (Lenis lerp). Coalesce with rAF in the caller.
 * `lerp` 0.45–0.65 reads fluid without lagging far behind the pointer.
 */
export function lenisScrollDragSmooth(
  lenis: Lenis,
  y: number,
  lerp = 0.52,
) {
  lenis.scrollTo(clampScroll(lenis, y), {
    programmatic: false,
    lerp,
    force: true,
  });
}

/** Release drag with light inertia (matches Lenis wheel feel). */
export function lenisScrollDragRelease(
  lenis: Lenis,
  velocityPxPerMs: number,
) {
  const throwPx = velocityPxPerMs * 220;
  const target = clampScroll(lenis, lenis.scroll - throwPx);
  lenis.scrollTo(target, {
    programmatic: false,
    lerp: lenis.options.lerp ?? 0.09,
    force: true,
  });
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
