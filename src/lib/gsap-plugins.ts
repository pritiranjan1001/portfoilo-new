import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

type SplitTextWithRegister = typeof SplitText & {
  register: (core: typeof gsap) => void;
};

export function registerGsapPlugins() {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/** Required before constructing SplitText (links SplitText to the gsap instance). */
export function registerSplitText(gsapCore: typeof gsap) {
  if (typeof window === "undefined") return;
  (SplitText as SplitTextWithRegister).register(gsapCore);
}

export { SplitText };

export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * ScrollTrigger `scroller` for routes **without** Lenis. After Lenis unmounts, defaults can be
 * stale; pinning this keeps scroll-driven reveals from never firing (sections stuck at opacity 0).
 */
export function getNativeScrollScroller(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return document.documentElement;
}
