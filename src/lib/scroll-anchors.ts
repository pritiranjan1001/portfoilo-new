/** Extra px after scroll-padding so hash targets sit under the fixed header without a gap. */
export const ANCHOR_SCROLL_NUDGE_PX = 8;

type AnchorAlign = "top" | "center";

function getHeaderHeightPx(): number {
  const header = document.querySelector<HTMLElement>("header");
  if (header?.offsetHeight) return header.offsetHeight;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--site-header-height")
    .trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Resolved `scroll-margin-top` in px (e.g. prelude = 0, other home sections = header height). */
function getScrollMarginTopPx(target: HTMLElement): number {
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop);
  return Number.isFinite(margin) ? margin : getHeaderHeightPx();
}

/**
 * Compute an absolute scrollTop for an in-page anchor.
 * - **top**: places the element top right under the fixed header
 * - **center**: centers the element in the remaining viewport (below the header)
 */
export function getAnchorScrollTopPx(target: HTMLElement, align: AnchorAlign): number {
  const headerH = getHeaderHeightPx();
  const currentY =
    window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  const rect = target.getBoundingClientRect();
  const topAbs = currentY + rect.top;

  if (align === "center") {
    const usableViewport = Math.max(0, window.innerHeight - headerH);
    const centerAbs = topAbs + rect.height / 2;
    return Math.max(0, centerAbs - usableViewport / 2);
  }

  return Math.max(0, topAbs - getScrollMarginTopPx(target) - ANCHOR_SCROLL_NUDGE_PX);
}

export function getAnchorAlignFromTarget(target: HTMLElement): AnchorAlign {
  const raw = target.getAttribute("data-anchor-align");
  return raw === "center" ? "center" : "top";
}
