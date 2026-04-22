import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

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
