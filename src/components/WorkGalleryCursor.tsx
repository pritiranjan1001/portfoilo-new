"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  zoneRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  /** True while primary button is held (dragging). */
  dragging?: boolean;
};

export function WorkGalleryScrollHint() {
  return (
    <div
      className="pointer-events-none absolute bottom-10 right-6 z-20 hidden flex-col items-end gap-2 md:flex"
      aria-hidden
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
        Drag · scroll
      </span>
    </div>
  );
}

export function WorkGalleryCursor({ zoneRef, enabled, dragging }: Props) {
  const [visible, setVisible] = useState(false);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const active = useRef(false);
  const rafId = useRef(0);
  const shellRef = useRef<HTMLDivElement>(null);
  const inited = useRef(false);

  const applyTransform = useCallback(() => {
    const el = shellRef.current;
    const p = pos.current;
    if (el) {
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    }
  }, []);

  const tick = useCallback(() => {
    if (!active.current) {
      rafId.current = 0;
      return;
    }
    const p = pos.current;
    const t = target.current;
    const k = 0.32;
    const dx = t.x - p.x;
    const dy = t.y - p.y;
    if (dx * dx + dy * dy < 0.04) {
      p.x = t.x;
      p.y = t.y;
      applyTransform();
      rafId.current = 0;
      return;
    }
    p.x += dx * k;
    p.y += dy * k;
    applyTransform();
    rafId.current = requestAnimationFrame(tick);
  }, [applyTransform]);

  useEffect(() => {
    if (!enabled) return;

    const zone = zoneRef.current;
    if (!zone) return;

    const move = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!inited.current) {
        pos.current = { x: e.clientX, y: e.clientY };
        inited.current = true;
        applyTransform();
      }
      if (active.current && rafId.current === 0) {
        rafId.current = requestAnimationFrame(tick);
      }
    };

    const enter = () => {
      active.current = true;
      setVisible(true);
      inited.current = false;
    };

    const leave = () => {
      active.current = false;
      setVisible(false);
      inited.current = false;
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };

    zone.addEventListener("mousemove", move, { passive: true });
    zone.addEventListener("mouseenter", enter);
    zone.addEventListener("mouseleave", leave);

    return () => {
      zone.removeEventListener("mousemove", move);
      zone.removeEventListener("mouseenter", enter);
      zone.removeEventListener("mouseleave", leave);
      active.current = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, zoneRef, tick, applyTransform]);

  if (!enabled) return null;

  return (
    <div
      ref={shellRef}
      className={`pointer-events-none fixed left-0 top-0 z-[80] will-change-transform ${
        visible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-200`}
      style={{ transform: "translate3d(0,0,0)" }}
      aria-hidden
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <div
          className={`h-12 w-12 rounded-full border-2 border-white bg-white/15 shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_6px_28px_rgba(0,0,0,0.55)] transition-[transform,opacity] duration-200 ${
            dragging ? "scale-90 opacity-95" : "opacity-100"
          }`}
        />
      </div>
    </div>
  );
}

export function useWorkGalleryChrome() {
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAllow(fine && !reduce);
  }, []);

  return allow;
}
