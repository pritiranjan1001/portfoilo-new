"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { shouldReduceMotion } from "@/lib/gsap-plugins";

type Props = {
  zoneRef: RefObject<HTMLElement | null>;
};

const INTERACTIVE =
  "a, button:not(:disabled), [role='button'], input, textarea, select, summary, label[for]";

const FOLLOW_MIN = 0.38;
const FOLLOW_MAX = 0.72;
const SNAP_PX = 0.35;

export function useLandingCursorEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine && !shouldReduceMotion());
  }, []);

  return enabled;
}

function isPointInZone(x: number, y: number, zone: HTMLElement) {
  const el = document.elementFromPoint(x, y);
  if (el && zone.contains(el)) return true;
  const r = zone.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

export function LandingPageCursor({ zoneRef }: Props) {
  const enabled = useLandingCursorEnabled();
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressing, setPressing] = useState(false);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const active = useRef(false);
  const hoveringRef = useRef(false);
  const pressingRef = useRef(false);
  const rafId = useRef(0);
  const shellRef = useRef<HTMLDivElement>(null);

  const applyTransform = useCallback(() => {
    const el = shellRef.current;
    const p = pos.current;
    if (el) {
      el.style.transform = `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0)`;
    }
  }, []);

  const followLoop = useCallback(() => {
    if (!active.current) {
      rafId.current = 0;
      return;
    }

    const p = pos.current;
    const t = target.current;
    const dx = t.x - p.x;
    const dy = t.y - p.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < SNAP_PX * SNAP_PX) {
      p.x = t.x;
      p.y = t.y;
    } else {
      const dist = Math.sqrt(distSq);
      const tFactor = Math.min(1, dist / 140);
      const k =
        FOLLOW_MIN + (FOLLOW_MAX - FOLLOW_MIN) * tFactor * (hoveringRef.current ? 1.08 : 1);
      p.x += dx * k;
      p.y += dy * k;
    }

    applyTransform();
    rafId.current = requestAnimationFrame(followLoop);
  }, [applyTransform]);

  const startLoop = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(followLoop);
  }, [followLoop]);

  const stopLoop = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = 0;
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.dataset.landingCursor = "1";
    } else {
      delete root.dataset.landingCursor;
    }
    return () => {
      delete root.dataset.landingCursor;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const hide = () => {
      active.current = false;
      setVisible(false);
      setHovering(false);
      setPressing(false);
      hoveringRef.current = false;
      pressingRef.current = false;
      stopLoop();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;

      const zone = zoneRef.current;
      if (!zone) return;

      const { clientX: x, clientY: y } = e;

      if (!isPointInZone(x, y, zone)) {
        if (active.current) hide();
        return;
      }

      target.current = { x, y };

      const hit = document.elementFromPoint(x, y);
      const overInteractive = Boolean(hit?.closest(INTERACTIVE));
      if (overInteractive !== hoveringRef.current) {
        hoveringRef.current = overInteractive;
        setHovering(overInteractive);
      }

      if (!active.current) {
        active.current = true;
        pos.current = { x, y };
        setVisible(true);
        applyTransform();
        startLoop();
        return;
      }

      if (!rafId.current) startLoop();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      pressingRef.current = true;
      setPressing(true);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pressingRef.current = false;
      setPressing(false);
    };

    const onWindowLeave = () => hide();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("blur", onWindowLeave);
    document.addEventListener("mouseleave", onWindowLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("blur", onWindowLeave);
      document.removeEventListener("mouseleave", onWindowLeave);
      hide();
    };
  }, [enabled, zoneRef, applyTransform, startLoop, stopLoop]);

  if (!enabled) return null;

  return (
    <div
      ref={shellRef}
      className={`landing-cursor pointer-events-none fixed left-0 top-0 z-[9999] will-change-transform ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transform: "translate3d(0,0,0)", contain: "layout style" }}
      aria-hidden
    >
      <div
        className={`relative h-0 w-0 -translate-x-1/2 -translate-y-1/2 ${
          pressing ? "scale-[0.88]" : "scale-100"
        } transition-transform duration-150 ease-out`}
      >
        <div
          className={`landing-cursor__ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[width,height,border-color,opacity] duration-200 ease-out ${
            hovering
              ? "h-14 w-14 border-[color-mix(in_oklab,var(--accent)_75%,var(--foreground))] opacity-90"
              : "h-9 w-9 border-[color-mix(in_oklab,var(--foreground)_28%,transparent)] opacity-70"
          } ${pressing ? "opacity-75" : ""}`}
        />
        <div
          className={`landing-cursor__dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_color-mix(in_oklab,var(--accent)_50%,transparent)] transition-[width,height] duration-200 ease-out ${
            hovering ? "h-2 w-2" : "h-[5px] w-[5px]"
          }`}
        />
        {hovering ? (
          <span className="landing-cursor__spark absolute left-1/2 top-1/2 h-px w-px -translate-x-1/2 -translate-y-1/2" />
        ) : null}
      </div>
    </div>
  );
}

