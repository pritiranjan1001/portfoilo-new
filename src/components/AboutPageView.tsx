"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { AboutExperiencePatterns } from "@/components/AboutBackgroundPatterns";
import { AboutFindInsidePatterns } from "@/components/AboutFindInsidePatterns";
import { AboutFlashbackMemories } from "@/components/AboutFlashbackMemories";
import { AboutKickerStripPatterns } from "@/components/AboutKickerStripPatterns";
import { AboutVillageLandscape } from "@/components/AboutVillageLandscape";
import { AboutVillageThreeScene } from "@/components/AboutVillageThreeScene";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useLenisInstance } from "@/components/lenis-context";
import { refreshLenisAndScrollTrigger } from "@/lib/lenis-scroll-sync";
import { site } from "@/lib/site";
import {
  getNativeScrollScroller,
  registerGsapPlugins,
  shouldReduceMotion,
} from "@/lib/gsap-plugins";

function formatAboutDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FullBleedPattern({ children }: { children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden"
      aria-hidden
    >
      {children}
    </div>
  );
}

export function AboutPageView() {
  const root = useRef<HTMLElement>(null);
  const bioExtraRef = useRef<HTMLDivElement>(null);
  const landscapeSectionRef = useRef<HTMLElement>(null);
  const detailsOverlayRef = useRef<HTMLDivElement>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<null | "rocks" | "grove" | "cabin">(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [detailsZoomOrigin, setDetailsZoomOrigin] = useState<{ x: number; y: number }>({
    x: 0.5,
    y: 0.5,
  });
  const [modalMounted, setModalMounted] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const lenis = useLenisInstance();
  const stamped = formatAboutDate(new Date());
  const bioParas = site.aboutBioParagraphs;
  const bioFirst = bioParas[0];
  const bioRest = bioParas.slice(1);
  const detailsItems = site.aboutFindInside.items;

  const bioToggleClass =
    "inline cursor-pointer border-0 bg-transparent p-0 font-body text-base font-medium tracking-wide text-[var(--foreground)] underline decoration-[var(--border-strong)] decoration-2 underline-offset-[6px] transition hover:decoration-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

  const sectionEndRule =
    "mt-12 border-0 border-t border-[var(--border-strong)] md:mt-14";

  const openHotspot = (id: "rocks" | "grove" | "cabin", el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const cx = (rect.left + rect.right) / 2;
    const cy = (rect.top + rect.bottom) / 2;
    if (id === "rocks") {
      const section = landscapeSectionRef.current;
      if (section) {
        const s = section.getBoundingClientRect();
        setDetailsZoomOrigin({
          x: s.width > 0 ? (cx - s.left) / s.width : 0.5,
          y: s.height > 0 ? (cy - s.top) / s.height : 0.5,
        });
      } else {
        setDetailsZoomOrigin({
          x: window.innerWidth > 0 ? cx / window.innerWidth : 0.5,
          y: window.innerHeight > 0 ? cy / window.innerHeight : 0.5,
        });
      }
      setActiveHotspot(null);
      setDetailsOpen(true);
      return;
    }
    setModalOrigin({
      x: window.innerWidth > 0 ? cx / window.innerWidth : 0.5,
      y: window.innerHeight > 0 ? cy / window.innerHeight : 0.5,
    });
    setActiveHotspot(id);
  };

  const hotspots = [
    {
      id: "grove" as const,
      title: "Grove",
      body: "A small canopy cluster — a quiet rhythm in the middle distance.",
      top: "33%",
      left: "42%",
    },
    {
      id: "rocks" as const,
      title: "Gallery",
      body: "A quick entry into the gallery sequence — publications, paintings, and archive beats.",
      top: "55%",
      left: "36%",
    },
    {
      id: "cabin" as const,
      title: "Flashback memory",
      body: "Photographs and short clips from the archive — studio days, openings, and quiet moments.",
      top: "50%",
      left: "77%",
    },
  ];

  useEffect(() => {
    if (activeHotspot == null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveHotspot(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeHotspot]);

  useEffect(() => {
    if (!detailsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailsOpen]);

  useEffect(() => {
    if (activeHotspot != null) {
      setModalMounted(true);
      return;
    }
    // Keep mounted briefly for "vanish" animation, then unmount
    const t = window.setTimeout(() => setModalMounted(false), 260);
    return () => window.clearTimeout(t);
  }, [activeHotspot]);

  /** Lenis routes clear `ScrollTrigger` defaults on unmount — refresh so /about reveals run. */
  useLayoutEffect(() => {
    registerGsapPlugins();
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useGSAP(
    () => {
      registerGsapPlugins();
      const el = root.current;
      if (!el) return;
      /**
       * During client navigation, `LenisScroll` initializes in a layout effect *after* children
       * register GSAP. If we hide first and proxy comes later, triggers can miss and stay hidden.
       */
      if (!lenis) {
        const safe = el.querySelectorAll(
          ".about-anim-kicker-item, .about-anim-h1-line, .about-anim-job, .about-anim-bio-line, .about-anim-bio-p, .about-anim-bio-toggle, .about-find-heading-line, .about-find-row",
        );
        gsap.set(safe, { opacity: 1, y: 0, clearProps: "transform" });
        el.querySelectorAll<HTMLElement>(".about-find-line").forEach((line) => {
          gsap.set(line, { scaleX: 1, clearProps: "transform" });
        });
        return;
      }
      const stScroller = getNativeScrollScroller();

      const kicker = el.querySelectorAll(".about-anim-kicker-item");
      const h1Lines = el.querySelectorAll(".about-anim-h1-line");
      const jobs = el.querySelectorAll(".about-anim-job");
      const bioLines = el.querySelectorAll(".about-anim-bio-line");
      const bioPs = el.querySelectorAll(".about-anim-bio-p");
      const bioToggle = el.querySelector(".about-anim-bio-toggle");
      const findBlock = el.querySelector(".about-find-block");
      const findHead = el.querySelectorAll(".about-find-heading-line");
      const findRows = el.querySelectorAll(".about-find-row");

      if (shouldReduceMotion()) {
        gsap.set(
          [...kicker, ...h1Lines, ...jobs, ...bioLines, ...bioPs],
          {
            opacity: 1,
            y: 0,
          },
        );
        if (bioToggle) gsap.set(bioToggle, { opacity: 1, y: 0 });
        gsap.set(findHead, { opacity: 1, y: 0 });
        findRows.forEach((row) => {
          const line = row.querySelector(".about-find-line");
          const num = row.querySelector(".about-find-num");
          const lab = row.querySelector(".about-find-label");
          gsap.set(line, { scaleX: 1 });
          gsap.set([num, lab], { opacity: 1, y: 0 });
        });
        return;
      }

      gsap.set([...kicker, ...h1Lines, ...jobs], { opacity: 0, y: 28 });
      gsap.set(bioLines, { opacity: 0, y: 32 });
      gsap.set(bioPs, { opacity: 0, y: 36 });
      if (bioToggle) gsap.set(bioToggle, { opacity: 0, y: 14 });
      gsap.set(findHead, { opacity: 0, y: 36 });
      findRows.forEach((row) => {
        const line = row.querySelector(".about-find-line");
        const num = row.querySelector(".about-find-num");
        const lab = row.querySelector(".about-find-label");
        gsap.set(line, { scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set([num, lab], { opacity: 0, y: 18 });
      });

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(kicker, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.09,
      })
        .to(
          bioLines,
          {
            opacity: 1,
            y: 0,
            duration: 0.78,
            stagger: 0.14,
          },
          "-=0.28",
        );

      const bioIntroTargets: Element[] = [...bioPs];
      if (bioToggle) bioIntroTargets.push(bioToggle);
      if (bioIntroTargets.length > 0) {
        tl.to(
          bioIntroTargets,
          {
            opacity: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.08,
          },
          "-=0.32",
        );
      }

      tl.to(
          h1Lines,
          {
            opacity: 1,
            y: 0,
            duration: 0.78,
            stagger: 0.14,
          },
          "-=0.4",
        )
        .to(
          jobs,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.065,
          },
          "-=0.45",
        );

      let findTl: gsap.core.Timeline | undefined;
      if (findBlock && findRows.length > 0 && stScroller) {
        const findTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: findBlock,
            scroller: stScroller,
            start: "top 82%",
            once: true,
            invalidateOnRefresh: true,
          },
        });
        findTimeline.to(findHead, {
          opacity: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.14,
          ease: "power2.out",
        });
        findRows.forEach((row, i) => {
          const line = row.querySelector(".about-find-line");
          const num = row.querySelector(".about-find-num");
          const lab = row.querySelector(".about-find-label");
          if (!line || !num || !lab) return;
          const t = 0.35 + i * 0.14;
          findTimeline.to(
            line,
            { scaleX: 1, duration: 0.55, ease: "power2.out" },
            t,
          );
          findTimeline.to(
            [num, lab],
            { opacity: 1, y: 0, duration: 0.48, stagger: 0.05, ease: "power2.out" },
            t + 0.08,
          );
        });
        findTl = findTimeline;
      }

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
      refreshLenisAndScrollTrigger(lenis);

      return () => {
        tl.kill();
        findTl?.scrollTrigger?.kill();
        findTl?.kill();
      };
    },
    { scope: root, dependencies: [lenis] },
  );

  useGSAP(
    () => {
      if (!bioExpanded) return;
      registerGsapPlugins();
      const wrap = bioExtraRef.current;
      if (!wrap) return;
      const extras = wrap.querySelectorAll(".about-bio-p-extra");
      if (extras.length === 0) return;

      if (shouldReduceMotion()) {
        gsap.set(extras, { opacity: 1, y: 0 });
        return;
      }

      gsap.from(extras, {
        opacity: 0,
        y: 16,
        duration: 0.48,
        stagger: 0.09,
        ease: "power2.out",
      });

      return () => {
        gsap.killTweensOf(extras);
      };
    },
    { dependencies: [bioExpanded] },
  );

  useGSAP(
    () => {
      if (!detailsOpen) return;
      const overlay = detailsOverlayRef.current;
      if (!overlay) return;
      const zoomPanel = overlay.querySelector(".about-details-zoom");
      const heading = overlay.querySelectorAll(".about-details-heading-line");
      const items = overlay.querySelectorAll(".about-details-item");
      if (!zoomPanel) return;

      if (shouldReduceMotion()) {
        gsap.set([zoomPanel, ...heading, ...items], { opacity: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      gsap.killTweensOf([zoomPanel, ...heading, ...items]);
      gsap.set(zoomPanel, {
        opacity: 0.4,
        scale: 0.88,
        transformOrigin: `${Math.round(detailsZoomOrigin.x * 100)}% ${Math.round(detailsZoomOrigin.y * 100)}%`,
      });
      gsap.set(heading, { opacity: 0, y: 22 });
      gsap.set(items, { opacity: 0, x: -14, y: 16 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(zoomPanel, {
        opacity: 1,
        scale: 1,
        duration: 0.78,
      })
        .to(
          heading,
          {
            opacity: 1,
            y: 0,
            duration: 0.54,
            stagger: 0.12,
          },
          "-=0.35",
        )
        .to(
          items,
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.44,
            stagger: 0.16,
          },
          "-=0.08",
        );

      return () => tl.kill();
    },
    { dependencies: [detailsOpen, detailsZoomOrigin.x, detailsZoomOrigin.y] },
  );

  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main
        ref={root}
        className="relative min-h-[100dvh] overflow-x-hidden bg-[var(--background)] pb-0 pt-20 md:pt-24"
      >
        <div className="relative">
          <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-14">
            <section
              ref={landscapeSectionRef}
              className="relative isolate -mt-20 min-h-[100dvh] w-[100vw] ml-[calc(50%-50vw)] overflow-hidden border-y border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_70%,transparent)] md:-mt-24"
              aria-label="Village landscape"
            >
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-44 bg-gradient-to-t from-[color-mix(in_oklab,var(--surface-elevated)_88%,var(--background))] to-transparent md:h-56"
                aria-hidden
              />
              <AboutVillageThreeScene className="h-full w-full" />
              {/* SVG fallback/texture layer */}
              <AboutVillageLandscape
                variant="full"
                className="opacity-[0.18] md:opacity-[0.12]"
              />

              {/* Hotspots overlay */}
              <div className="absolute inset-0 z-40 pointer-events-none">
                {hotspots.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className="hotspot"
                    style={{ top: h.top, left: h.left, pointerEvents: "auto" }}
                    aria-label={`${h.title}. Open details`}
                    aria-haspopup="dialog"
                    aria-expanded={h.id === "rocks" ? detailsOpen : activeHotspot === h.id}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      openHotspot(h.id, e.currentTarget);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      openHotspot(h.id, e.currentTarget);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      openHotspot(h.id, e.currentTarget);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openHotspot(h.id, e.currentTarget);
                    }}
                  />
                ))}
              </div>

              {/* Modal */}
              {modalMounted && (
                <div className="absolute inset-0 z-50 pointer-events-auto" aria-hidden={activeHotspot ? undefined : true}>
                  <button
                    type="button"
                    className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
                      activeHotspot ? "opacity-100" : "opacity-0"
                    }`}
                    aria-label="Close details"
                    onClick={() => setActiveHotspot(null)}
                  />
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="About"
                    data-state={activeHotspot ? "open" : "closed"}
                    className="magic-modal pointer-events-none absolute inset-0 grid place-items-center px-4"
                    style={
                      {
                        ["--magic-x" as any]: `${Math.round(modalOrigin.x * 100)}%`,
                        ["--magic-y" as any]: `${Math.round(modalOrigin.y * 100)}%`,
                      } as React.CSSProperties
                    }
                  >
                  <div className="magic-modal__card pointer-events-auto w-[min(860px,96vw)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] shadow-[0_34px_100px_-34px_color-mix(in_oklab,black_42%,transparent)] backdrop-blur-md">
                    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
                      <div className="min-w-0">
                        {activeHotspot === "grove" ? (
                          <>
                            <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                              <span className="text-[var(--foreground)]">About</span>
                              <time dateTime={new Date().toISOString().slice(0, 10)}>{stamped}</time>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
                              {activeHotspot === "cabin" ? "Archive" : "Gallery"}
                            </p>
                            <p className="mt-1 font-display text-xl font-semibold text-[var(--foreground)]">
                              {activeHotspot === "cabin" ? "Flashback memory" : "Gallery"}
                            </p>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_90%,transparent)] px-3 py-1 text-sm text-[var(--foreground)] transition hover:border-[var(--border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                        onClick={() => setActiveHotspot(null)}
                      >
                        Close
                      </button>
                    </div>
                    <div className="max-h-[78dvh] overflow-auto px-5 py-5 text-[15px] leading-relaxed text-[var(--foreground)]">
                      {activeHotspot === "grove" && (
                        <>
                          <p className="text-pretty text-[color-mix(in_oklab,var(--foreground)_82%,var(--muted))]">
                            Jyotiranjan Swain (b. 1970) is a visual artist and graphic designer with
                            a background in applied arts from the Sir J.J. Institute of Applied Art,
                            Mumbai. In the early 1990s, he founded Third Eye Communications in
                            Bhubaneswar, significantly transforming the design and print production
                            landscape in Odisha. His portfolio spans a diverse array of publications
                            and products across various formats and media, marked by innovative design,
                            a commitment to quality, meticulous attention to detail, and factual
                            accuracy. His work reflects a transformative design vocabulary that has
                            redefined standards in the field.
                          </p>
                          <div
                            className="mt-5 h-px w-16 bg-[color-mix(in_oklab,var(--accent)_65%,transparent)]"
                            aria-hidden
                          />
                          <button
                            type="button"
                            className="mt-4 inline cursor-pointer border-0 bg-transparent p-0 font-body text-base font-medium tracking-wide text-[var(--foreground)] underline decoration-[var(--border-strong)] decoration-2 underline-offset-[6px] transition hover:decoration-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                            onClick={() => setBioExpanded(true)}
                          >
                            See more
                          </button>
                        </>
                      )}

                      {activeHotspot === "rocks" && (
                        <div className="relative isolate overflow-hidden">
                          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-16">
                            <p className="font-display text-[clamp(2.25rem,5vw,3.25rem)] font-bold leading-[0.98] tracking-tight text-[var(--foreground)]">
                              <span className="block">{site.aboutFindInside.line1}</span>
                              <span className="mt-1 block">{site.aboutFindInside.line2}</span>
                            </p>

                            <ol className="list-none space-y-0">
                              {site.aboutFindInside.items.map((item, index) => (
                                <li key={`${index}-${item.label}`} className="about-find-row">
                                  <div className="flex items-baseline justify-between gap-6 pb-4 pt-1 md:pb-5 md:pt-2">
                                    <span className="about-find-num font-mono text-sm tabular-nums text-[var(--foreground)] md:text-base">
                                      {index + 1}
                                    </span>
                                    <span className="about-find-label max-w-[min(100%,20rem)] text-right font-display text-base font-bold tracking-tight text-[var(--foreground)] md:text-lg">
                                      {item.label}
                                    </span>
                                  </div>
                                  <div
                                    className="about-find-line h-px w-full bg-[var(--foreground)]"
                                    aria-hidden
                                  />
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div
                            className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.32]"
                            style={{
                              background:
                                "radial-gradient(ellipse 75% 60% at 18% 28%, color-mix(in oklab, var(--foreground) 10%, transparent) 0%, transparent 62%), radial-gradient(ellipse 60% 45% at 84% 70%, color-mix(in oklab, var(--foreground) 7%, transparent) 0%, transparent 64%)",
                            }}
                            aria-hidden
                          />
                        </div>
                      )}

                      {activeHotspot === "cabin" && (
                        <div
                          className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_55%,transparent)] p-6 md:p-8"
                          style={{
                            backgroundImage:
                              "linear-gradient(0deg, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)",
                            backgroundSize: "44px 44px",
                          }}
                        >
                          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-[1.05fr_1.25fr] md:gap-10">
                            <div className="min-w-0">
                              <p className="font-display text-[clamp(2.4rem,5.2vw,3.4rem)] font-bold leading-[0.96] tracking-tight text-[var(--foreground)]">
                                <span className="block">Where I&apos;ve</span>
                                <span className="mt-1 block">worked.</span>
                              </p>
                            </div>

                            <ol className="space-y-6">
                              {site.experience.map((job) => (
                                <li key={`${job.range}-${job.company}`}>
                                  <div className="grid grid-cols-[92px_1fr] gap-6 md:grid-cols-[110px_1fr]">
                                    <span className="pt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                                      {job.range}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-display text-base font-semibold leading-snug text-[var(--foreground)] md:text-lg">
                                        {job.title}
                                      </p>
                                      <p className="mt-1 text-sm text-[var(--muted)]">
                                        {job.company}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div
                            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
                            style={{
                              background:
                                "radial-gradient(ellipse 70% 55% at 20% 18%, color-mix(in oklab, var(--accent) 10%, transparent) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 82% 74%, color-mix(in oklab, var(--accent) 7%, transparent) 0%, transparent 62%)",
                            }}
                            aria-hidden
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              )}

              {/* Gallery details: same viewport slot as the landscape (no scroll away) */}
              {detailsOpen && (
                <div
                  ref={detailsOverlayRef}
                  className="absolute inset-0 z-[45] h-full w-full"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Gallery details"
                >
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/18 backdrop-blur-[1px] transition-opacity"
                    aria-label="Close gallery details"
                    onClick={() => setDetailsOpen(false)}
                  />
                  <div className="pointer-events-none relative z-10 h-full w-full">
                    <div className="about-details-zoom pointer-events-auto flex h-full w-full flex-col overflow-hidden border-0 bg-[color-mix(in_oklab,var(--surface)_95%,var(--background))]">
                      <div className="min-h-0 flex flex-1 items-center overflow-hidden px-6 py-4 md:px-10 md:py-5">
                        <div className="grid w-full grid-cols-1 items-start gap-6">
                          <div className="flex items-start justify-between gap-4">
                            <h2 className="font-display text-[clamp(1.6rem,3.4vw,3rem)] font-bold leading-[0.96] tracking-tight text-[var(--foreground)]">
                              <span className="about-details-heading-line block whitespace-nowrap">
                                {site.aboutFindInside.line1} {site.aboutFindInside.line2}
                              </span>
                            </h2>
                            <button
                              type="button"
                              className="relative z-20 shrink-0 cursor-pointer whitespace-nowrap rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_90%,transparent)] px-3 py-1 text-sm text-[var(--foreground)] transition hover:border-[var(--border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailsOpen(false);
                              }}
                            >
                              Go back
                            </button>
                          </div>
                          <div className="min-w-0">
                            <div className="relative pt-4">
                              <ol className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-8 md:gap-x-8 md:gap-y-0">
                                {detailsItems.map((item, index) => (
                                  <li
                                    key={`${index}-${item.label}`}
                                    className="about-details-item relative flex min-h-[170px] items-center justify-center px-2"
                                  >
                                    <span
                                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-1.5 py-1 text-[var(--foreground)]/85"
                                      aria-hidden
                                    >
                                      <svg
                                        viewBox="0 0 28 14"
                                        className={`h-[13px] w-[30px] ${index % 2 === 0 ? "rotate-[22deg]" : "rotate-[-18deg]"}`}
                                      >
                                        <ellipse cx="7.4" cy="8.1" rx="6.2" ry="4" fill="currentColor" />
                                        <ellipse cx="21.1" cy="6.1" rx="5.1" ry="3.5" fill="currentColor" />
                                        <rect x="12.9" y="3.4" width="2.1" height="6.5" rx="1" fill="var(--surface)" />
                                      </svg>
                                    </span>
                                    <div
                                      className={`absolute left-1/2 max-w-[10rem] -translate-x-1/2 text-center ${
                                        index % 2 === 0
                                          ? "top-[calc(50%-88px)]"
                                          : index === detailsItems.length - 1
                                            ? "top-[calc(50%+42px)]"
                                            : "top-[calc(50%+52px)]"
                                      }`}
                                    >
                                      <span className="block font-mono text-[10px] tabular-nums tracking-wide text-[var(--muted)]">
                                        {String(index + 1).padStart(2, "0")}
                                      </span>
                                      <span className="mt-1 block font-display text-[0.98rem] font-semibold leading-tight tracking-tight text-[var(--foreground)]">
                                        {item.label}
                                      </span>
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content stays aligned to the main grid width */}
              <div className="relative z-10 mx-auto flex h-full min-h-[100dvh] max-w-6xl flex-col justify-between gap-10 px-6 pt-[max(4rem,calc(var(--site-header-height)+0.75rem))] pb-10 md:px-14 md:pt-[max(5rem,calc(var(--site-header-height)+1rem))] md:pb-12">
                <div className="flex-1" aria-hidden />
                <div className="flex flex-col gap-3 md:max-w-md">
                  <p className="text-pretty font-serif text-[15px] italic leading-relaxed text-[var(--muted)] md:text-base">
                    A village horizon — quiet movement, everyday rhythm.
                  </p>
                  <div
                    className="h-px w-16 bg-[color-mix(in_oklab,var(--accent)_65%,transparent)]"
                    aria-hidden
                  />
                </div>
              </div>
            </section>

            {/*
            <div className="relative isolate mt-10 overflow-hidden rounded-sm py-1 md:mt-12">
              <FullBleedPattern>
                <AboutKickerStripPatterns />
              </FullBleedPattern>
              <div className="relative z-10 flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                <span className="about-anim-kicker-item text-[var(--foreground)]">
                  About
                </span>
                <time
                  className="about-anim-kicker-item"
                  dateTime={new Date().toISOString().slice(0, 10)}
                >
                  {stamped}
                </time>
              </div>
            </div>

            <section
              className="about-bio-block relative isolate mt-8 overflow-hidden md:mt-10"
              aria-labelledby="about-bio-heading"
            >
              <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-10 xl:gap-x-20">
                <h2
                  id="about-bio-heading"
                  className="font-display text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-[0.98] tracking-tight text-[var(--foreground)]"
                >
                  <span className="sr-only">
                    {site.aboutStatement.line1} {site.aboutStatement.line2}
                  </span>
                </h2>
                <div className="min-w-0 font-body text-base leading-[1.8] text-[var(--foreground)] md:text-[17px] md:leading-[1.85]">
                  {bioFirst != null && (
                    <p className="about-anim-bio-p">{bioFirst}</p>
                  )}
                  {bioRest.length > 0 && !bioExpanded && (
                    <button
                      type="button"
                      className={`about-anim-bio-toggle about-bio-expand mt-4 ${bioToggleClass}`}
                      aria-expanded={false}
                      aria-controls="about-bio-more"
                      onClick={() => setBioExpanded(true)}
                    >
                      See more
                    </button>
                  )}
                  {bioExpanded && bioRest.length > 0 && (
                    <div className="mt-6 space-y-6">
                      <div
                        id="about-bio-more"
                        ref={bioExtraRef}
                        className="space-y-6"
                        role="region"
                        aria-labelledby="about-bio-heading"
                      >
                        {bioRest.map((paragraph, index) => (
                          <p key={index} className="about-bio-p-extra">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      <button
                        type="button"
                        className={`about-bio-collapse ${bioToggleClass}`}
                        aria-expanded={true}
                        aria-controls="about-bio-more"
                        onClick={() => setBioExpanded(false)}
                      >
                        See less
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
            */}

            {/*
            <hr className={sectionEndRule} aria-hidden />

            <section
              className="about-work-block relative isolate mt-14 overflow-hidden lg:mt-20"
              aria-labelledby="about-work-heading"
            >
              <FullBleedPattern>
                <AboutExperiencePatterns />
              </FullBleedPattern>
              <div className="relative z-10 grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-16 lg:gap-x-20">
                <div>
                  <h1
                    id="about-work-heading"
                    className="font-display text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-[0.98] tracking-tight text-[var(--foreground)]"
                  >
                    <span className="about-anim-h1-line block">Where I&apos;ve</span>
                    <span className="about-anim-h1-line mt-1 block md:mt-2">
                      worked.
                    </span>
                  </h1>
                </div>

                <ul className="space-y-10 md:space-y-12">
                  {site.experience.map((job, index) => (
                    <li
                      key={`${job.range}-${job.company}-${index}`}
                      className="about-anim-job grid grid-cols-[minmax(0,7.5rem)_1fr] gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,8.5rem)_1fr]"
                    >
                      <p className="pt-0.5 font-mono text-[11px] tabular-nums tracking-wide text-[var(--muted)] sm:text-xs">
                        {job.range}
                      </p>
                      <div className="min-w-0">
                        <p className="font-display text-base font-semibold leading-snug text-[var(--foreground)] md:text-lg">
                          {job.title}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{job.company}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <hr className={sectionEndRule} aria-hidden />
            */}
          </div>
        </div>

        {/*
        <section
          className="about-find-block relative isolate mt-24 overflow-hidden md:mt-32"
          aria-labelledby="about-find-heading"
        >
          <FullBleedPattern>
            <AboutFindInsidePatterns />
          </FullBleedPattern>
          <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-14">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8">
              <h2
                id="about-find-heading"
                className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[0.98] tracking-tight text-[var(--foreground)]"
              >
                <span className="about-find-heading-line block">
                  {site.aboutFindInside.line1}
                </span>
                <span className="about-find-heading-line mt-1 block md:mt-2">
                  {site.aboutFindInside.line2}
                </span>
              </h2>
              <ol className="list-none space-y-0">
                {site.aboutFindInside.items.map((item, index) => (
                  <li key={`${index}-${item.label}`} className="about-find-row">
                    <div className="flex items-baseline justify-between gap-6 pb-4 pt-1 md:pb-5 md:pt-2">
                      <span className="about-find-num font-mono text-sm tabular-nums text-[var(--foreground)] md:text-base">
                        {index + 1}
                      </span>
                      <span className="about-find-label max-w-[min(100%,20rem)] text-right font-display text-base font-bold tracking-tight text-[var(--foreground)] md:text-lg">
                        {item.label}
                      </span>
                    </div>
                    <div
                      className="about-find-line h-px w-full bg-[var(--foreground)]"
                      aria-hidden
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
        */}

        <AboutFlashbackMemories fullWidth className="mt-0" />
      </main>
      <SiteFooter />
    </>
  );
}
