/**
 * Helpers for homepage entrance animations — especially fallbacks on touch / small
 * viewports where Lenis + ScrollTrigger pin/scrub can leave content at opacity 0.
 */

/** Phones, tablets, and touch laptops — skip scroll-pin scrub that blocks finger scroll. */
export function isCoarsePointerDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(
    "(max-width: 1024px), (pointer: coarse), (hover: none)",
  ).matches;
}

/** Force visible state when GSAP entrance fails or is skipped. */
export function forceRevealInScope(
  scope: ParentNode,
  selectors: string[],
): void {
  selectors.forEach((sel) => {
    scope.querySelectorAll<HTMLElement>(sel).forEach((node) => {
      node.style.opacity = "1";
      node.style.transform = "none";
      node.style.filter = "none";
    });
  });
}

export const LANDING_HERO_REVEAL_SELECTORS = [
  ".landing-hero-tagline",
  ".landing-hero-name-line",
  ".landing-hero-cta > a",
  ".landing-hero-portrait-motion",
  ".landing-hero-scroll",
] as const;

export const BVC_REVEAL_SELECTORS = [
  ".bvc-kicker",
  ".bvc-step",
  ".bvc-line1",
  ".bvc-line2",
  ".bvc-eye",
  ".bvc-tag",
  ".bvc-cta",
  ".bvc-bottom-cap",
  ".bvc-pattern-svg",
] as const;
