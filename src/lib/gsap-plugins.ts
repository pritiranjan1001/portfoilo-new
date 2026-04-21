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
