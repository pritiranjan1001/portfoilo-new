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

export function WorkGalleryScrollIndicator({
  progress,
  hidden,
  className,
}: {
  progress: number;
  hidden?: boolean;
  className?: string;
}) {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  return (
    <div
      className={`pointer-events-none z-[90] hidden md:block ${
        hidden ? "opacity-0" : "opacity-100"
      } transition-opacity duration-300 ${className ?? ""}`}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_82%,transparent)] shadow-[0_18px_60px_-40px_color-mix(in_oklab,black_55%,transparent)] backdrop-blur-md">
          <span className="text-[12px] leading-none text-[var(--foreground)]/80 motion-safe:animate-[workScrollNudge_1.15s_ease-in-out_infinite]">
            ↓
          </span>
        </div>

        <div className="relative h-20 w-[3px] overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_20%,transparent)]">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-[color-mix(in_oklab,var(--accent)_70%,var(--foreground))]"
            style={{ height: `${Math.round(p * 100)}%` }}
          />
        </div>

        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
          Scroll
        </span>
      </div>
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
          className={`h-12 w-12 rounded-full border-2 border-white bg-white/15 shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_6px_28px_rgba(0,0,0,0.55)] transition-[transform,opacity] duration-200 dark:border-zinc-200/85 dark:bg-zinc-900/35 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.75)] ${
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
