"use client";

import { useEffect, type RefObject } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import {
  lenisScrollDragRelease,
  lenisScrollDragSmooth,
  lenisSyncDragScroll,
} from "@/lib/lenis-scroll-sync";
import { shouldReduceMotion } from "@/lib/gsap-plugins";

const DRAG_THRESHOLD_PX = 4;
const DRAG_LERP = 0.58;
const INTERACTIVE =
  "a, button:not(:disabled), [role='button'], input, textarea, select, summary, label[for]";

/**
 * Desktop: click-drag scrolls the page with Lenis smoothing (not instant jumps / text select).
 */
export function useLandingDragScroll(
  zoneRef: RefObject<HTMLElement | null>,
  lenis: Lenis | null,
) {
  useEffect(() => {
    if (!lenis || shouldReduceMotion()) return;
    const zone = zoneRef.current;
    if (!zone) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let pointerId = -1;
    let startY = 0;
    let startScroll = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;
    let dragging = false;
    let suppressClick = false;
    let pendingY: number | null = null;
    let rafId = 0;

    const clearDrag = () => {
      dragging = false;
      pointerId = -1;
      pendingY = null;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      document.documentElement.removeAttribute("data-landing-drag-scroll");
    };

    const applyScroll = () => {
      rafId = 0;
      if (pendingY === null) return;
      const y = pendingY;
      pendingY = null;
      lenisScrollDragSmooth(lenis, y, DRAG_LERP);
      ScrollTrigger.update();
    };

    const scheduleScroll = (y: number) => {
      pendingY = y;
      if (!rafId) {
        rafId = requestAnimationFrame(applyScroll);
      }
    };

    const blockSelect = (e: Event) => {
      if (!dragging) return;
      e.preventDefault();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      if (target?.closest(INTERACTIVE)) return;

      suppressClick = false;
      pointerId = e.pointerId;
      startY = e.clientY;
      lastY = e.clientY;
      lastT = performance.now();
      velocity = 0;
      startScroll = lenis.scroll;
      dragging = false;
      try {
        zone.setPointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dy = e.clientY - startY;
      if (!dragging && Math.abs(dy) < DRAG_THRESHOLD_PX) return;

      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) {
        velocity = (e.clientY - lastY) / dt;
      }
      lastY = e.clientY;
      lastT = now;

      if (!dragging) {
        dragging = true;
        document.documentElement.dataset.landingDragScroll = "1";
        lenisSyncDragScroll(lenis);
        document.addEventListener("selectstart", blockSelect, true);
      }

      e.preventDefault();
      scheduleScroll(startScroll - dy);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      suppressClick = dragging;
      document.removeEventListener("selectstart", blockSelect, true);

      if (dragging) {
        if (pendingY !== null) {
          lenisScrollDragSmooth(lenis, pendingY, 0.72);
          ScrollTrigger.update();
        }
        lenisScrollDragRelease(lenis, velocity);
        ScrollTrigger.update();
      }

      clearDrag();
      try {
        zone.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };

    zone.addEventListener("pointerdown", onPointerDown);
    zone.addEventListener("pointermove", onPointerMove, { passive: false });
    zone.addEventListener("pointerup", onPointerUp);
    zone.addEventListener("pointercancel", onPointerUp);
    zone.addEventListener("click", onClickCapture, true);

    return () => {
      zone.removeEventListener("pointerdown", onPointerDown);
      zone.removeEventListener("pointermove", onPointerMove);
      zone.removeEventListener("pointerup", onPointerUp);
      zone.removeEventListener("pointercancel", onPointerUp);
      zone.removeEventListener("click", onClickCapture, true);
      document.removeEventListener("selectstart", blockSelect, true);
      clearDrag();
    };
  }, [lenis, zoneRef]);
}
