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

  const slideW = w > 0 ? w * 0.76 : 0;
  const gap = w > 0 ? Math.max(12, w * 0.02) : 0;
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

      const head = root.querySelectorAll(".about-flashback-head");
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
        gsap.set([...head, intro, chrome], { opacity: 1, y: 0 });
        return;
      }

      if (!lenis) {
        gsap.set([...head, intro, chrome], { opacity: 1, y: 0 });
        return;
      }

      gsap.set(head, { opacity: 0, y: 28 });
      gsap.set(intro, { opacity: 0, y: 20 });
      gsap.set(chrome, { opacity: 0, y: 40 });

      const stScroller = getNativeScrollScroller();
      if (!stScroller) {
        gsap.set([...head, intro, chrome], { opacity: 1, y: 0 });
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

      tl.to(head, { opacity: 1, y: 0, duration: 0.75, stagger: 0.12 })
        .to(intro, { opacity: 1, y: 0, duration: 0.6 }, "-=0.35")
        .to(chrome, { opacity: 1, y: 0, duration: 0.85 }, "-=0.3");

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
      className={`about-flashback-block relative isolate overflow-hidden border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 ${
        fullWidth
          ? "w-full max-w-none rounded-none border-x-0 border-b-0 border-t"
          : "mt-10 rounded-sm border md:mt-12"
      } ${overlayMode ? "border-0 bg-transparent outline-none focus:outline-none" : ""} ${
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
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
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
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--accent)]">
              {aboutFlashback.eyebrow}
            </p>
            <h2
              id={headingId}
              className="mt-3 font-display text-[clamp(1.75rem,4vw,2.65rem)] font-bold leading-[0.98] tracking-tight"
            >
              <span className="about-flashback-head whitespace-nowrap text-[var(--foreground)]">
                {aboutFlashback.titleLine1}{" "}
                <span className="text-[var(--muted)]">{aboutFlashback.titleLine2}</span>
              </span>
            </h2>
            <p className="about-flashback-intro mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-[var(--muted)] md:text-base">
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
                ? "flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[1fr_minmax(0,2.75rem)] lg:items-center lg:gap-5 xl:gap-6"
                : "flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,3.5rem)_1fr_minmax(0,2.75rem)] lg:items-stretch lg:gap-6 xl:gap-8"
            }
          >
            {/* Slide counter — hidden in cabin overlay (single-screen gallery) */}
            {!overlayMinimal ? (
              <div
                className="flex flex-row items-end gap-4 lg:flex-col lg:items-start lg:justify-center lg:gap-0"
                aria-hidden={false}
              >
                <span className="font-display text-4xl tabular-nums leading-none text-[var(--foreground)] md:text-5xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="hidden h-px w-10 bg-[var(--border-strong)] lg:block dark:bg-white/25" />
                <span className="font-mono text-xs tabular-nums text-[var(--muted)] md:text-sm">
                  {String(count).padStart(2, "0")}
                </span>
              </div>
            ) : (
              <p className="sr-only" aria-live="polite">
                Slide {index + 1} of {count}
              </p>
            )}

            {/* Viewport + track */}
            <div
              ref={viewportRef}
              className={`relative min-h-0 w-full overflow-hidden ${
                overlayMinimal
                  ? "h-[min(58dvh,calc(100dvh-7.25rem))] max-h-[calc(100dvh-7.25rem)] sm:h-[min(60dvh,calc(100dvh-7.5rem))]"
                  : "sm:min-h-[min(48vh,380px)] md:min-h-[min(58vh,520px)]"
              }`}
            >
              {w > 0 && slideW > 0 ? (
                <div
                  ref={trackRef}
                  className={`flex will-change-transform ${overlayMinimal ? "h-full items-stretch" : ""}`}
                  style={{
                    transform: `translate3d(${tx}px,0,0)`,
                    transition: reduce ? "none" : "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
                    gap: `${gap}px`,
                  }}
                >
                  {slides.map((slide, i) => {
                    const isActive = i === index;
                    const dim = !isActive;
                    return (
                      <div
                        key={`slide-${i}-${slide.src}`}
                        className={`relative shrink-0 overflow-hidden rounded-sm bg-[var(--surface-elevated)] dark:bg-neutral-900 ${
                          dim ? "opacity-[0.38]" : "opacity-100"
                        } ${overlayMinimal ? "flex h-full min-h-0 flex-col" : ""}`}
                        style={{
                          width: slideW,
                          transition: reduce ? "none" : "opacity 0.45s ease",
                        }}
                        aria-hidden={!isActive}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <div
                          className={
                            overlayMinimal
                              ? "relative min-h-0 w-full flex-1"
                              : "relative aspect-[16/10] w-full md:aspect-[16/9]"
                          }
                        >
                          {slide.kind === "image" ? (
                            <Image
                              src={slide.src}
                              alt={slide.alt}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 76vw, 58vw"
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
                                >
                                  <source src={slide.src} type="video/mp4" />
                                </video>
                              ) : (
                                <Image
                                  src={slide.poster}
                                  alt=""
                                  fill
                                  className={`object-cover ${isActive ? "" : "opacity-85"}`}
                                  sizes="(max-width: 1024px) 76vw, 58vw"
                                />
                              )}
                              {isActive && !videoReady ? (
                                <button
                                  type="button"
                                  onClick={startVideo}
                                  className="group/watch absolute bottom-5 right-5 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-dashed border-[var(--border-strong)] bg-white/90 text-center text-[9px] font-mono uppercase tracking-[0.18em] text-[var(--foreground)] shadow-sm backdrop-blur-sm transition hover:border-[var(--accent)] hover:bg-white dark:border-white/35 dark:bg-black/25 dark:text-white/90 dark:shadow-none dark:hover:border-white/55 dark:hover:bg-black/40 md:h-32 md:w-32 md:text-[10px]"
                                  aria-label="Watch video"
                                >
                                  <span className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] dark:border-white/40 dark:bg-white/10">
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="ml-0.5 h-4 w-4 fill-current"
                                      aria-hidden
                                    >
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </span>
                                  <span className="max-w-[5.5rem] leading-tight">
                                    Watch
                                    <br />
                                    video
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
                              className={`absolute bottom-0 left-0 z-[2] border border-[var(--border)]/60 bg-white/92 shadow-2xl backdrop-blur-md dark:border-transparent dark:bg-zinc-900/88 ${
                                overlayMinimal
                                  ? "m-2 max-w-[min(100%,17rem)] p-3 sm:m-3 sm:p-4"
                                  : "m-3 max-w-[min(100%,20rem)] p-4 sm:m-4 md:max-w-sm md:p-5"
                              }`}
                            >
                              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] md:text-xs dark:text-white">
                                {slide.title}
                              </p>
                              <p className="mt-2 font-body text-xs leading-relaxed text-[var(--muted)] md:text-sm dark:text-neutral-300">
                                {slide.description}
                              </p>
                              {slide.year ? (
                                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] dark:text-neutral-500">
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
            <div className="flex flex-row items-center justify-center gap-6 lg:flex-col lg:justify-center lg:gap-5">
              <button
                type="button"
                className="group flex h-11 w-11 items-center justify-center text-[var(--foreground)]/75 transition hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] dark:text-white/80 dark:hover:text-white"
                aria-label="Previous memory"
                onClick={() => go(-1)}
              >
                <span className="text-2xl font-light leading-none">←</span>
              </button>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-md transition hover:bg-[color-mix(in_oklab,var(--surface-elevated)_92%,var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] dark:border-transparent dark:bg-neutral-800 dark:text-white dark:shadow-lg dark:hover:bg-neutral-700 md:h-14 md:w-14"
                aria-label="Next memory"
                onClick={() => go(1)}
              >
                <span className="text-xl font-light leading-none md:text-2xl">→</span>
              </button>
            </div>
          </div>

          {!overlayMinimal ? (
            <p className="mt-6 hidden font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] sm:block">
              Arrow keys · Prev / Next
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
