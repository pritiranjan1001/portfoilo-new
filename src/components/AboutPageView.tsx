"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  const [bioExpanded, setBioExpanded] = useState(false);
  const lenis = useLenisInstance();
  const stamped = formatAboutDate(new Date());
  const bioParas = site.aboutBioParagraphs;
  const bioFirst = bioParas[0];
  const bioRest = bioParas.slice(1);

  const bioToggleClass =
    "inline cursor-pointer border-0 bg-transparent p-0 font-body text-base font-medium tracking-wide text-[var(--foreground)] underline decoration-[var(--border-strong)] decoration-2 underline-offset-[6px] transition hover:decoration-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

  const sectionEndRule =
    "mt-12 border-0 border-t border-[var(--border-strong)] md:mt-14";

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
                  <span className="about-anim-bio-line block">
                    {site.aboutStatement.line1}
                  </span>
                  <span className="about-anim-bio-line mt-1 block md:mt-2">
                    {site.aboutStatement.line2}
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
          </div>
        </div>

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

        <AboutFlashbackMemories fullWidth className="mt-12 md:mt-16 lg:mt-20" />
      </main>
      <SiteFooter />
    </>
  );
}
