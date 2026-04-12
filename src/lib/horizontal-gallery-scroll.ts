import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Even snap increments — longer, softer easing so slides don’t feel abrupt. */
export function horizontalSlideSnap(slideCount: number) {
  if (slideCount <= 1) return undefined;
  return {
    snapTo: 1 / (slideCount - 1),
    duration: { min: 0.45, max: 1.05 },
    delay: 0.08,
    inertia: true,
    ease: "power3.inOut",
  } as const;
}

/** Stable pixel distance for pinned horizontal track (avoids subpixel end glitches). */
export function measureHorizontalScrollEnd(
  outer: HTMLElement,
  track: HTMLElement,
  slideCount: number,
): number {
  const viewW = outer.clientWidth || window.innerWidth;
  const measured = track.scrollWidth - viewW;
  const fallback = Math.max(0, slideCount * viewW - viewW);
  const raw = measured > 2 ? measured : fallback;
  return Math.max(0, Math.round(raw));
}

/** ResizeObserver fires very often — debounce ScrollTrigger.refresh to prevent jank. */
export function createDebouncedScrollTriggerRefresh(delayMs: number) {
  let id: ReturnType<typeof setTimeout> | null = null;

  return {
    schedule() {
      if (id) clearTimeout(id);
      id = setTimeout(() => {
        id = null;
        ScrollTrigger.refresh();
      }, delayMs);
    },
    flush() {
      if (id) clearTimeout(id);
      id = null;
      ScrollTrigger.refresh();
    },
    cancel() {
      if (id) clearTimeout(id);
      id = null;
    },
  };
}
