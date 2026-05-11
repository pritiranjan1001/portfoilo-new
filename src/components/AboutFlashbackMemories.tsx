"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AboutFlashbackPatterns } from "@/components/AboutFlashbackPatterns";
import { useLenisInstance } from "@/components/lenis-context";
import { refreshLenisAndScrollTrigger } from "@/lib/lenis-scroll-sync";
import { site } from "@/lib/site";
import {
  getNativeScrollScroller,
  registerGsapPlugins,
  shouldReduceMotion,
} from "@/lib/gsap-plugins";

type UnifiedSlide = {
  kind: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  title: string;
  description: string;
  year?: string;
};

function buildSlides(
  entries: typeof site.aboutFlashback.entries,
): UnifiedSlide[] {
  return entries.map((e) => {
    if (e.kind === "video") {
      return {
        kind: "video",
        src: e.src,
        poster: e.poster,
        alt: e.caption,
        title: e.caption.split(/[—–-]/)[0]?.trim() || "Memory",
        description: e.caption,
        year: e.year,
      };
    }
    return {
      kind: "image",
      src: e.src,
      alt: e.alt,
      title: e.caption?.trim() || "Memory",
      description: e.alt,
      year: e.year,
    };
  });
}

type AboutFlashbackMemoriesProps = {
  className?: string;
  /** Edge-to-edge under `main` (no side border radius / vertical borders). */
  fullWidth?: boolean;
  /**
   * Full-screen overlay (e.g. cabin blackout): reveal chrome immediately, skip ScrollTrigger,
   * use keyboard on the focused section instead of duplicate global listeners.
   */
  overlayMode?: boolean;
  /** With `overlayMode`: hide eyebrow/title/intro and fit carousel to one viewport (no page scroll). */
  overlayMinimal?: boolean;
};

export function AboutFlashbackMemories({
  className,
  fullWidth = false,
  overlayMode = false,
  overlayMinimal = false,
}: AboutFlashbackMemoriesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const flashWalkerTrailRef = useRef<HTMLDivElement>(null);
  const walkerExitStripRef = useRef<HTMLDivElement>(null);
  const lenis = useLenisInstance();
  const { aboutFlashback } = site;

  const slides = useMemo(
    () => buildSlides(aboutFlashback.entries),
    [aboutFlashback.entries],
  );

  const [index, setIndex] = useState(0);
  const [w, setW] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  const count = slides.length;
  const reduce = shouldReduceMotion();
  const [portalReady, setPortalReady] = useState(false);
  const [walkerStripTick, bumpWalkerStrip] = useReducer((c: number) => c + 1, 0);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!overlayMinimal) return;
    const el = walkerExitStripRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => bumpWalkerStrip());
    ro.observe(el);
    bumpWalkerStrip();
    return () => ro.disconnect();
  }, [overlayMinimal]);

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setW(el.clientWidth);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  /** Slightly wider hero slide + tighter gap for a more editorial, cinematic strip */
  const slideW = w > 0 ? w * 0.8 : 0;
  const gap = w > 0 ? Math.max(10, w * 0.018) : 0;
  const pad = w > 0 && slideW > 0 ? (w - slideW) / 2 : 0;
  const tx = pad - index * (slideW + gap);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => {
        const n = i + dir;
        if (n < 0) return count - 1;
        if (n >= count) return 0;
        return n;
      });
      setVideoReady(false);
    },
    [count],
  );

  /** Horizontal drag / swipe on the viewport (next / prev), same as arrow buttons. */
  const dragRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
    mode: "idle" | "undecided" | "horizontal";
  }>({ pointerId: -1, originX: 0, originY: 0, mode: "idle" });
  const dragOffsetRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [draggingTrack, setDraggingTrack] = useState(false);

  const resetCarouselDrag = useCallback((el: HTMLDivElement | null, pointerId: number) => {
    if (el && pointerId >= 0) {
      try {
        if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
      } catch {
        /* already released */
      }
    }
    dragRef.current = { pointerId: -1, originX: 0, originY: 0, mode: "idle" };
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setDraggingTrack(false);
  }, []);

  const onCarouselPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (w <= 0 || slideW <= 0) return;
      if (e.button !== 0) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("button, a, video")) return;
      dragRef.current = {
        pointerId: e.pointerId,
        originX: e.clientX,
        originY: e.clientY,
        mode: "undecided",
      };
      dragOffsetRef.current = 0;
      setDragOffset(0);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [w, slideW],
  );

  const onCarouselPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = dragRef.current;
      if (d.mode === "idle" || e.pointerId !== d.pointerId) return;
      const dx = e.clientX - d.originX;
      const dy = e.clientY - d.originY;
      if (d.mode === "undecided") {
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        if (adx < 10 && ady < 10) return;
        if (ady >= adx) {
          resetCarouselDrag(e.currentTarget, e.pointerId);
          return;
        }
        dragRef.current = { ...d, mode: "horizontal" };
        setDraggingTrack(true);
      }
      if (dragRef.current.mode !== "horizontal") return;
      e.preventDefault();
      const lim = Math.max(80, slideW * 0.42);
      const ox =
        dx > lim ? lim + (dx - lim) * 0.22 : dx < -lim ? -lim + (dx + lim) * 0.22 : dx;
      dragOffsetRef.current = ox;
      setDragOffset(ox);
    },
    [resetCarouselDrag, slideW],
  );

  const finishCarouselPointer = useCallback(
    (el: HTMLDivElement, pointerId: number) => {
      const d = dragRef.current;
      const was = d.mode;
      const ox = dragOffsetRef.current;
      if (was === "horizontal") {
        const threshold = Math.min(56, Math.max(36, slideW * 0.11));
        if (ox < -threshold) go(1);
        else if (ox > threshold) go(-1);
      }
      resetCarouselDrag(el, pointerId);
    },
    [go, resetCarouselDrag, slideW],
  );

  const onCarouselPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragRef.current.pointerId !== e.pointerId) return;
      finishCarouselPointer(e.currentTarget, e.pointerId);
    },
    [finishCarouselPointer],
  );

  const onCarouselLostPointerCapture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragRef.current.pointerId !== e.pointerId) return;
      finishCarouselPointer(e.currentTarget, e.pointerId);
    },
    [finishCarouselPointer],
  );

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, [index]);

  const headingId = overlayMode ? "about-flashback-heading-cabin-overlay" : "about-flashback-heading";

  useGSAP(
    () => {
      registerGsapPlugins();
      if (reduce || !overlayMinimal) return;

      const strip = walkerExitStripRef.current;
      if (!strip) return;

      const stampMarkup = `
<svg viewBox="0 0 28 14" width="38" height="19" style="display:block">
  <ellipse cx="6.2" cy="8.0" rx="4.3" ry="3.2" fill="currentColor"></ellipse>
  <ellipse cx="19.8" cy="6.3" rx="7.1" ry="4.6" fill="currentColor"></ellipse>
  <rect x="12.6" y="2.9" width="2.4" height="8.1" rx="1.1" fill="rgba(209,218,229,0.14)"></rect>
</svg>
`;

      const makeStampAt = (
        trailLayer: HTMLDivElement,
        stampClassName: string,
      ) => {
        const el = document.createElement("span");
        el.setAttribute("aria-hidden", "true");
        el.className = stampClassName;
        el.style.filter = "drop-shadow(0 1px 4px rgb(0 0 0 / 0.28))";
        el.innerHTML = stampMarkup;
        trailLayer.appendChild(el);
        return el;
      };

      const stampClassPeripheral =
        "absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2 text-slate-300/47 md:text-slate-300/52";

      const buildExitWalkStrip = (trailLayer: HTMLDivElement, phaseAt: number) => {
        const pw = trailLayer.clientWidth;
        const ph = trailLayer.clientHeight;
        if (pw < 120 || ph < 16) return null;

        gsap.killTweensOf(trailLayer);
        trailLayer.replaceChildren();

        const isMobileView = window.matchMedia?.("(max-width: 639px)")?.matches ?? false;
        const startX = pw * (isMobileView ? 0.34 : 0.38);
        const overshoot = Math.min(240, Math.max(120, pw * 0.18));
        const endX = pw + overshoot;
        const pathLen = Math.max(1, endX - startX);
        const stridePx = isMobileView ? 48 : 58;
        const n = Math.max(8, Math.ceil(pathLen / stridePx));

        const yBase = ph * 0.48;
        const denseSteps = Array.from({ length: n }, (_, i) => {
          const t = n === 1 ? 0 : i / (n - 1);
          const x = startX + pathLen * t;
          const side = i % 2 === 0 ? 1 : -1;
          const yJit = side * Math.min(7, ph * 0.28);
          const driftDown = t * Math.min(18, ph * 0.35);
          const s = 0.78 + (1 - t) * 0.18;
          const rot = i % 2 === 0 ? 10 : 14;
          return { x, y: yBase + yJit + driftDown, s, rot };
        });

        const stamps = denseSteps.map(() => makeStampAt(trailLayer, stampClassPeripheral));
        stamps.forEach((stamp, i) => {
          gsap.set(stamp, { opacity: 0, scale: denseSteps[i]!.s * 0.9 });
        });

        const stepEvery = 0.27;
        const fadeAfter = stepEvery * 2.65;

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          repeat: -1,
          repeatDelay: 4.15,
          delay: phaseAt,
        });

        denseSteps.forEach((p, i) => {
          const stamp = stamps[i];
          const flip = i % 2 === 0 ? 1 : -1;
          const at = i * stepEvery;
          const isTail = i >= stamps.length - 2;

          tl.set(
            stamp,
            {
              x: p.x,
              y: p.y,
              rotate: p.rot,
              scaleX: flip,
              opacity: 0,
              scale: p.s * 0.88,
            },
            at,
          );
          tl.to(stamp, { opacity: 0.56, scale: p.s, duration: 0.17 }, at);
          tl.to(stamp, { scale: p.s * 0.94, duration: 0.22 }, at + 0.17);
          if (!isTail) {
            tl.to(stamp, { opacity: 0, duration: 0.25, ease: "power2.in" }, at + fadeAfter);
          }
        });

        return tl;
      };

      const tStrip = buildExitWalkStrip(strip, 0);

      return () => {
        tStrip?.kill();
      };
    },
    { dependencies: [overlayMinimal, walkerStripTick, portalReady, reduce] },
  );

  useGSAP(
    () => {
      registerGsapPlugins();
      if (reduce || overlayMinimal) return;
      const trailLayer = flashWalkerTrailRef.current;
      if (!trailLayer) return;

      const pw = trailLayer.clientWidth;
      const ph = trailLayer.clientHeight;
      if (pw < 48 || ph < 48) return;

      gsap.killTweensOf(trailLayer);
      trailLayer.replaceChildren();

      const makeStamp = () => {
        const el = document.createElement("span");
        el.setAttribute("aria-hidden", "true");
        el.className =
          "absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2 text-[color-mix(in_oklab,var(--foreground)_88%,transparent)] dark:text-white/[0.8]";
        el.style.filter =
          "drop-shadow(0 1px 2px rgb(0 0 0 / 0.5)) drop-shadow(0 0 1px rgb(0 0 0 / 0.35))";
        el.innerHTML = `
<svg viewBox="0 0 28 14" width="26" height="13" style="display:block">
  <ellipse cx="6.2" cy="8.0" rx="4.3" ry="3.2" fill="currentColor"></ellipse>
  <ellipse cx="19.8" cy="6.3" rx="7.1" ry="4.6" fill="currentColor"></ellipse>
  <rect x="12.6" y="2.9" width="2.4" height="8.1" rx="1.1" fill="rgba(255,255,255,0.22)"></rect>
</svg>
`;
        trailLayer.appendChild(el);
        return el;
      };

      const isMobileView = window.matchMedia?.("(max-width: 639px)")?.matches ?? false;
      const yNear = ph * 0.88;
      const yFar = ph * 0.36;
      const stridePx = isMobileView ? Math.max(26, Math.round(ph / 36)) : Math.max(30, Math.round(ph / 32));

      const dy = Math.abs(yNear - yFar);
      const n = Math.max(12, Math.ceil(dy / stridePx));
      const denseSteps: Array<{ x: number; y: number; s: number; rot: number }> = [];
      const cxMid = pw * 0.5;

      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1);
        const y = yNear + (yFar - yNear) * t;
        const side = i % 2 === 0 ? 1 : -1;
        const spread = pw * (isMobileView ? 0.055 : 0.048) * (1 - t * 0.82);
        const x = cxMid + side * spread;
        const s = 0.38 + (1 - t) * 0.62;
        const rot = -88 + side * (i % 4 === 0 ? 10 : -8) + (1 - t) * 6;
        denseSteps.push({ x, y, s, rot });
      }

      const stamps = denseSteps.map(() => makeStamp());
      stamps.forEach((stamp, i) => {
        gsap.set(stamp, { opacity: 0, scale: denseSteps[i]!.s * 0.9 });
      });

      const stepEvery = 0.29;
      const fadeAfter = stepEvery * 3.2;

      const t = gsap.timeline({
        defaults: { ease: "power2.out" },
        repeat: -1,
        repeatDelay: 2.85,
      });

      denseSteps.forEach((p, i) => {
        const stamp = stamps[i];
        const flip = i % 2 === 0 ? 1 : -1;
        const at = i * stepEvery;
        const isTail = i >= stamps.length - 2;

        t.set(
          stamp,
          {
            x: p.x,
            y: p.y,
            rotate: p.rot,
            scaleX: flip,
            opacity: 0,
            scale: p.s * 0.88,
          },
          at,
        );
        t.to(stamp, { opacity: 0.9, scale: p.s, duration: 0.18 }, at);
        t.to(stamp, { scale: p.s * 0.94, duration: 0.24 }, at + 0.18);
        if (!isTail) {
          t.to(stamp, { opacity: 0, duration: 0.26, ease: "power2.in" }, at + fadeAfter);
        }
      });

      return () => t.kill();
    },
    {
      dependencies: [index, w, overlayMinimal, reduce],
    },
  );

  useGSAP(
    () => {
      registerGsapPlugins();
      const root = sectionRef.current;
      if (!root) return;

      const head = Array.from(root.querySelectorAll(".about-flashback-head"));
      const intro = root.querySelector(".about-flashback-intro");
      const chrome = root.querySelector(".about-flashback-carousel");

      if (overlayMode) {
        const els = [chrome, ...head, intro].filter(
          (n): n is Element => Boolean(n),
        );
        gsap.set(els, { opacity: 1, y: 0 });
        return;
      }

      if (shouldReduceMotion()) {
        gsap.set([...head, intro, chrome].filter(Boolean), { opacity: 1, y: 0 });
        return;
      }

      if (!lenis) {
        gsap.set([...head, intro, chrome].filter(Boolean), { opacity: 1, y: 0 });
        return;
      }

      if (head.length) gsap.set(head, { opacity: 0, y: 28 });
      if (intro) gsap.set(intro, { opacity: 0, y: 20 });
      if (chrome) gsap.set(chrome, { opacity: 0, y: 40 });

      const stScroller = getNativeScrollScroller();
      if (!stScroller) {
        gsap.set([...head, intro, chrome].filter(Boolean), { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          scroller: stScroller,
          start: "top 78%",
          once: true,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "power2.out" },
      });

      if (head.length) {
        tl.to(head, { opacity: 1, y: 0, duration: 0.75, stagger: 0.12 });
      }
      if (intro) {
        tl.to(intro, { opacity: 1, y: 0, duration: 0.6 }, head.length ? "-=0.35" : 0);
      }
      if (chrome) {
        tl.to(chrome, { opacity: 1, y: 0, duration: 0.85 }, intro || head.length ? "-=0.3" : 0);
      }

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
      refreshLenisAndScrollTrigger(lenis);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [overlayMinimal, overlayMode, lenis] },
  );

  useEffect(() => {
    if (!overlayMode) return;
    const root = sectionRef.current;
    if (!root) return;
    queueMicrotask(() => {
      root.focus();
    });
  }, [overlayMode]);

  useEffect(() => {
    if (overlayMode) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, overlayMode]);

  const startVideo = () => {
    setVideoReady(true);
  };

  useEffect(() => {
    if (!videoReady) return;
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
  }, [videoReady, index]);

  return (
    <section
      ref={sectionRef}
      tabIndex={overlayMode ? -1 : undefined}
      onKeyDown={
        overlayMode
          ? (e: ReactKeyboardEvent<HTMLElement>) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                go(-1);
              }
              if (e.key === "ArrowRight") {
                e.preventDefault();
                go(1);
              }
            }
          : undefined
      }
      className={`about-flashback-block relative isolate overflow-hidden border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_6%,transparent)] dark:border-neutral-800/80 dark:bg-[#070708] dark:bg-[radial-gradient(ellipse_100%_80%_at_50%_-18%,color-mix(in_oklab,var(--accent)_18%,transparent)_0%,transparent_50%),radial-gradient(ellipse_90%_60%_at_50%_100%,color-mix(in_oklab,var(--foreground)_6%,transparent)_0%,transparent_45%),#070708] dark:text-neutral-100 ${
        fullWidth
          ? "w-full max-w-none rounded-none border-x-0 border-b-0 border-t"
          : "mt-10 rounded-2xl border md:mt-12 md:rounded-3xl"
      } ${overlayMode ? "border-0 bg-transparent shadow-none outline-none focus:outline-none dark:bg-transparent" : ""} ${
        overlayMinimal ? "flex min-h-0 flex-1 flex-col" : ""
      } ${className ?? ""}`}
      aria-labelledby={headingId}
    >
      {overlayMinimal && portalReady
        ? createPortal(
            <div
              ref={walkerExitStripRef}
              className="pointer-events-none fixed inset-x-0 z-[118] h-[4.85rem] overflow-visible overscroll-none sm:h-[5.15rem] md:h-[5.35rem] bottom-[max(0.65rem,env(safe-area-inset-bottom))]"
              aria-hidden
            />,
            document.body,
          )
        : null}
      {!overlayMinimal && <AboutFlashbackPatterns />}
      {!overlayMinimal ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[2px] bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--accent)_55%,transparent)] to-transparent opacity-90 dark:via-[color-mix(in_oklab,var(--accent)_70%,white_8%)]" />
      ) : null}

      <div
        className={`relative z-10 ${
          overlayMinimal
            ? "flex min-h-0 flex-1 flex-col px-3 py-2 sm:px-4 sm:py-3"
            : fullWidth
              ? "px-4 py-6 sm:px-6 md:px-10 md:py-12 lg:px-14 lg:py-14 xl:px-16"
              : "px-4 py-6 md:px-8 md:py-12 lg:px-10 lg:py-14"
        }`}
      >
        {!overlayMinimal ? (
          <>
            <p className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--accent)_35%,var(--border))] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--accent)] dark:border-white/10 dark:bg-white/[0.06] dark:text-[color-mix(in_oklab,var(--accent)_92%,white)]">
              <span className="h-1 w-1 rounded-full bg-[var(--accent)] shadow-[0_0_12px_color-mix(in_oklab,var(--accent)_80%,transparent)]" aria-hidden />
              {aboutFlashback.eyebrow}
            </p>
            <h2
              id={headingId}
              className="mt-5 font-display text-[clamp(1.85rem,4.2vw,2.85rem)] font-bold leading-[0.98] tracking-tight md:mt-6"
            >
              <span className="about-flashback-head block max-w-[18ch] text-balance text-[var(--foreground)] md:max-w-none md:whitespace-nowrap">
                <span className="inline-block bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--muted)] bg-clip-text text-transparent dark:from-white dark:via-neutral-100 dark:to-neutral-400">
                  {aboutFlashback.titleLine1}
                </span>{" "}
                <span className="text-[var(--muted)] dark:text-neutral-500">{aboutFlashback.titleLine2}</span>
              </span>
            </h2>
            <p className="about-flashback-intro mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-[var(--muted)] md:mt-5 md:text-base md:leading-relaxed dark:text-neutral-400">
              {aboutFlashback.intro}
            </p>
          </>
        ) : (
          <span id={headingId} className="sr-only">
            Flashback memories
          </span>
        )}

        <div
          className={`about-flashback-carousel ${overlayMinimal ? "mt-0 flex min-h-0 flex-1 flex-col justify-center md:justify-center" : "mt-5 md:mt-12"}`}
          role="region"
          aria-roledescription="carousel"
          aria-label="Flashback memories"
        >
          <div
            className={
              overlayMinimal
                ? "flex min-h-0 flex-1 flex-col max-lg:justify-center gap-4 lg:grid lg:grid-cols-[1fr_minmax(0,2.75rem)] lg:items-center lg:gap-5 xl:gap-6"
                : "flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,4.25rem)_1fr_minmax(0,3.5rem)] lg:items-stretch lg:gap-7 xl:gap-10"
            }
          >
            {/* Slide counter — hidden in cabin overlay (single-screen gallery) */}
            {!overlayMinimal ? (
              <div
                className="flex flex-row items-end gap-4 lg:items-center lg:gap-5"
                aria-hidden={false}
              >
                <div
                  className="hidden w-[3px] shrink-0 self-stretch rounded-full bg-gradient-to-b from-[var(--accent)] via-[color-mix(in_oklab,var(--accent)_40%,transparent)] to-transparent lg:block lg:min-h-[4.5rem]"
                  aria-hidden
                />
                <div className="flex flex-row items-end gap-4 lg:flex-col lg:items-start lg:justify-center lg:gap-2">
                  <span className="font-display text-4xl tabular-nums leading-none tracking-tight text-[var(--foreground)] md:text-5xl dark:text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="hidden h-px w-12 bg-gradient-to-r from-[var(--border-strong)] to-transparent lg:block dark:from-white/30" />
                  <span className="font-mono text-[11px] tabular-nums tracking-[0.12em] text-[var(--muted)] md:text-xs dark:text-neutral-500">
                    {String(count).padStart(2, "0")}
                  </span>
                </div>
              </div>
            ) : (
              <p className="sr-only" aria-live="polite">
                Slide {index + 1} of {count}
              </p>
            )}

            {/* Viewport + track */}
            <div
              ref={viewportRef}
              onPointerDown={onCarouselPointerDown}
              onPointerMove={onCarouselPointerMove}
              onPointerUp={onCarouselPointerUp}
              onPointerCancel={onCarouselPointerUp}
              onLostPointerCapture={onCarouselLostPointerCapture}
              onDragStart={(e) => e.preventDefault()}
              className={`relative min-h-0 w-full touch-pan-y select-none overflow-hidden ${
                draggingTrack ? "cursor-grabbing" : "cursor-grab"
              } ${
                overlayMinimal
                  ? "h-[min(58dvh,calc(100dvh-7.25rem))] max-h-[calc(100dvh-7.25rem)] sm:h-[min(60dvh,calc(100dvh-7.5rem))]"
                  : "sm:min-h-[min(52vh,400px)] md:min-h-[min(62vh,560px)]"
              }`}
            >
              {w > 0 && slideW > 0 ? (
                <div
                  ref={trackRef}
                  className={`flex will-change-transform ${overlayMinimal ? "h-full items-stretch" : ""}`}
                  style={{
                    transform: `translate3d(${tx + dragOffset}px,0,0)`,
                    transition:
                      reduce || draggingTrack
                        ? "none"
                        : "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
                    gap: `${gap}px`,
                  }}
                >
                  {slides.map((slide, i) => {
                    const isActive = i === index;
                    const dim = !isActive;
                    return (
                      <div
                        key={`slide-${i}-${slide.src}`}
                        className={`relative shrink-0 overflow-hidden rounded-2xl bg-[var(--surface-elevated)] shadow-[0_18px_50px_-28px_rgba(15,15,18,0.35)] ring-1 ring-black/[0.06] dark:bg-neutral-900/90 dark:shadow-[0_28px_70px_-36px_rgba(0,0,0,0.75)] dark:ring-white/[0.08] ${
                          dim ? "opacity-[0.42] saturate-[0.88]" : "opacity-100 ring-[color-mix(in_oklab,var(--accent)_28%,transparent)] dark:ring-[color-mix(in_oklab,var(--accent)_35%,transparent)]"
                        } ${overlayMinimal ? "flex h-full min-h-0 flex-col" : ""}`}
                        style={{
                          width: slideW,
                          transition: reduce ? "none" : "opacity 0.5s ease, box-shadow 0.5s ease, filter 0.5s ease",
                        }}
                        aria-hidden={!isActive}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <div
                          className={`${
                            overlayMinimal
                              ? "relative min-h-0 w-full flex-1"
                              : "relative aspect-[16/10] w-full md:aspect-[16/9]"
                          } ${dim && !reduce ? "scale-[0.98] transition-transform duration-500 ease-out" : "scale-100 transition-transform duration-500 ease-out"}`}
                        >
                          {slide.kind === "image" ? (
                            <Image
                              src={slide.src}
                              alt={slide.alt}
                              fill
                              draggable={false}
                              className="object-cover"
                              sizes="(max-width: 1024px) 82vw, 64vw"
                              priority={i === 0}
                            />
                          ) : slide.poster ? (
                            <>
                              {isActive && videoReady ? (
                                <video
                                  ref={videoRef}
                                  className="h-full w-full object-cover"
                                  playsInline
                                  controls
                                  preload="metadata"
                                  poster={slide.poster}
                                  draggable={false}
                                >
                                  <source src={slide.src} type="video/mp4" />
                                </video>
                              ) : (
                                <Image
                                  src={slide.poster}
                                  alt=""
                                  fill
                                  draggable={false}
                                  className={`object-cover ${isActive ? "" : "opacity-85"}`}
                                  sizes="(max-width: 1024px) 82vw, 64vw"
                                />
                              )}
                              {isActive && !videoReady ? (
                                <button
                                  type="button"
                                  onClick={startVideo}
                                  className="group/watch absolute bottom-5 right-5 flex h-[7.25rem] w-[7.25rem] flex-col items-center justify-center rounded-full border border-white/25 bg-[color-mix(in_oklab,var(--foreground)_8%,white)]/90 text-center text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--foreground)] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:scale-[1.03] hover:border-[color-mix(in_oklab,var(--accent)_55%,white)] hover:shadow-[0_16px_48px_-10px_color-mix(in_oklab,var(--accent)_35%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] dark:border-white/20 dark:bg-black/45 dark:text-white dark:shadow-[0_20px_50px_-16px_rgba(0,0,0,0.65)] dark:hover:border-[color-mix(in_oklab,var(--accent)_60%,white)] md:bottom-6 md:right-6 md:h-32 md:w-32 md:text-[10px]"
                                  aria-label="Watch video"
                                >
                                  <span className="mb-1.5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_6px_20px_color-mix(in_oklab,var(--accent)_45%,transparent)] ring-2 ring-white/30 transition group-hover/watch:scale-105 dark:ring-black/20">
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="ml-0.5 h-4 w-4 fill-current"
                                      aria-hidden
                                    >
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </span>
                                  <span className="max-w-[6rem] leading-snug text-[var(--foreground)]/90 dark:text-white/90">
                                    Watch video
                                  </span>
                                </button>
                              ) : null}
                            </>
                              ) : (
                            <video
                              ref={isActive ? videoRef : undefined}
                              className="h-full w-full object-cover"
                              playsInline
                              controls={isActive}
                              preload="metadata"
                              draggable={false}
                            >
                              <source src={slide.src} type="video/mp4" />
                            </video>
                          )}

                          {isActive && !overlayMinimal ? (
                            <div
                              ref={flashWalkerTrailRef}
                              className="pointer-events-none absolute inset-0 z-[1]"
                              aria-hidden
                            />
                          ) : null}

                          {/* Bottom-left copy block — reference style */}
                          {isActive ? (
                            <div
                              className={`absolute bottom-0 left-0 z-[2] overflow-hidden rounded-tr-2xl border border-white/20 bg-gradient-to-br from-white/95 via-white/88 to-white/75 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.28)] backdrop-blur-xl before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-[var(--accent)] dark:border-white/10 dark:from-zinc-950/92 dark:via-zinc-950/88 dark:to-zinc-950/75 dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] ${
                                overlayMinimal
                                  ? "m-2 max-w-[min(100%,18rem)] p-3.5 sm:m-3 sm:max-w-[min(100%,20rem)] sm:p-4"
                                  : "m-3 max-w-[min(100%,22rem)] p-4 sm:m-4 sm:rounded-tr-3xl md:max-w-md md:p-6"
                              }`}
                            >
                              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)] md:text-[11px] dark:text-[color-mix(in_oklab,var(--accent)_90%,white)]">
                                {slide.title}
                              </p>
                              <p className="mt-2 font-body text-xs leading-relaxed text-[var(--foreground)]/85 md:text-sm dark:text-neutral-200">
                                {slide.description}
                              </p>
                              {slide.year ? (
                                <p className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] dark:text-neutral-500">
                                  <span className="h-px w-6 bg-[var(--border-strong)] dark:bg-white/20" aria-hidden />
                                  {slide.year}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={`flex items-center justify-center bg-[var(--surface-elevated)] text-sm text-[var(--muted)] dark:bg-neutral-900/80 dark:text-neutral-500 ${
                    overlayMinimal ? "h-[min(240px,calc(100dvh-10rem))]" : "h-[min(52vh,420px)]"
                  }`}
                >
                  Loading…
                </div>
              )}
            </div>

            {/* Arrows — reference: prev thin, next in circle */}
            <div className="flex flex-row items-center justify-center gap-4 sm:gap-5 lg:flex-col lg:justify-center lg:gap-4">
              <button
                type="button"
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--foreground)_12%,var(--border)))] bg-[color-mix(in_oklab,var(--surface-elevated)_92%,white)] text-lg text-[var(--foreground)]/80 shadow-sm backdrop-blur-sm transition hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--border)))] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] dark:border-white/12 dark:bg-white/[0.07] dark:text-white/85 dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] dark:hover:border-white/25 dark:hover:bg-white/[0.12] md:h-14 md:w-14 md:text-xl"
                aria-label="Previous memory"
                onClick={() => go(-1)}
              >
                <span className="transition group-hover:-translate-x-0.5" aria-hidden>
                  ←
                </span>
              </button>
              <button
                type="button"
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--accent)_35%,var(--border)))] bg-[var(--foreground)] text-lg text-[var(--background)] shadow-[0_10px_30px_-8px_color-mix(in_oklab,var(--foreground)_35%,transparent)] transition hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] dark:border-[color-mix(in_oklab,var(--accent)_40%,transparent)] dark:bg-white dark:text-neutral-950 dark:shadow-[0_14px_40px_-10px_rgba(0,0,0,0.55)] dark:hover:bg-neutral-100 md:h-14 md:w-14 md:text-xl"
                aria-label="Next memory"
                onClick={() => go(1)}
              >
                <span className="transition group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </button>
            </div>
          </div>

          {!overlayMinimal ? (
            <p className="mt-8 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] sm:flex dark:text-neutral-500">
              <span className="h-1 w-1 rounded-full bg-[var(--muted)]/60" aria-hidden />
              Arrow keys · drag · prev / next
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
