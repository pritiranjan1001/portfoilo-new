"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
};

export function AboutFlashbackMemories({
  className,
  fullWidth = false,
}: AboutFlashbackMemoriesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  useGSAP(
    () => {
      registerGsapPlugins();
      const root = sectionRef.current;
      if (!root) return;

      const head = root.querySelectorAll(".about-flashback-head");
      const intro = root.querySelector(".about-flashback-intro");
      const chrome = root.querySelector(".about-flashback-carousel");

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
    { scope: sectionRef, dependencies: [lenis] },
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

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
      className={`about-flashback-block relative isolate overflow-hidden border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 ${
        fullWidth
          ? "w-full max-w-none rounded-none border-x-0 border-b-0 border-t"
          : "mt-10 rounded-sm border md:mt-12"
      } ${className ?? ""}`}
      aria-labelledby="about-flashback-heading"
    >
      <AboutFlashbackPatterns />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />

      <div
        className={`relative z-10 ${
          fullWidth
            ? "px-4 py-10 sm:px-6 md:px-10 md:py-12 lg:px-14 lg:py-14 xl:px-16"
            : "px-4 py-10 md:px-8 md:py-12 lg:px-10 lg:py-14"
        }`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--accent)]">
          {aboutFlashback.eyebrow}
        </p>
        <h2
          id="about-flashback-heading"
          className="mt-3 font-display text-[clamp(1.75rem,4vw,2.65rem)] font-bold leading-[0.98] tracking-tight"
        >
          <span className="about-flashback-head block text-[var(--foreground)]">
            {aboutFlashback.titleLine1}
          </span>
          <span className="about-flashback-head mt-1 block text-[var(--muted)] md:mt-1.5">
            {aboutFlashback.titleLine2}
          </span>
        </h2>
        <p className="about-flashback-intro mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-[var(--muted)] md:text-base">
          {aboutFlashback.intro}
        </p>

        <div
          className="about-flashback-carousel mt-10 md:mt-12"
          role="region"
          aria-roledescription="carousel"
          aria-label="Flashback memories"
        >
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,3.5rem)_1fr_minmax(0,2.75rem)] lg:items-stretch lg:gap-6 xl:gap-8">
            {/* Slide counter — reference: large current / muted total */}
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

            {/* Viewport + track */}
            <div
              ref={viewportRef}
              className="relative min-h-[min(52vh,420px)] w-full overflow-hidden md:min-h-[min(58vh,520px)]"
            >
              {w > 0 && slideW > 0 ? (
                <div
                  ref={trackRef}
                  className="flex will-change-transform"
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
                        }`}
                        style={{
                          width: slideW,
                          transition: reduce ? "none" : "opacity 0.45s ease",
                        }}
                        aria-hidden={!isActive}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <div className="relative aspect-[16/10] w-full md:aspect-[16/9]">
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

                          {/* Bottom-left copy block — reference style */}
                          {isActive ? (
                            <div className="absolute bottom-0 left-0 z-[2] m-3 max-w-[min(100%,20rem)] border border-[var(--border)]/60 bg-white/92 p-4 shadow-2xl backdrop-blur-md dark:border-transparent dark:bg-zinc-900/88 sm:m-4 md:max-w-sm md:p-5">
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
                <div className="flex h-[min(52vh,420px)] items-center justify-center bg-[var(--surface-elevated)] text-sm text-[var(--muted)] dark:bg-neutral-900/80 dark:text-neutral-500">
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

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
            Arrow keys · Prev / Next
          </p>
        </div>
      </div>
    </section>
  );
}
