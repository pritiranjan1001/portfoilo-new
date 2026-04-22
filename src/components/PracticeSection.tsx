"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenisInstance } from "@/components/lenis-context";
import { refreshLenisAndScrollTrigger } from "@/lib/lenis-scroll-sync";
import { site } from "@/lib/site";
import {
  registerGsapPlugins,
  registerSplitText,
  shouldReduceMotion,
  SplitText,
} from "@/lib/gsap-plugins";

export function PracticeSection() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenisInstance();

  useGSAP(
    () => {
      registerGsapPlugins();
      registerSplitText(gsap);
      if (shouldReduceMotion()) return;

      const section = root.current;
      if (!section) return;

      /** Align with Lenis + scrollerProxy — otherwise triggers can fire too early / wrong. */
      if (!lenis) return;

      const heading = section.querySelector(".practice-split-heading");
      if (!(heading instanceof HTMLElement)) return;

      const grid = section.querySelector<HTMLElement>(".practice-discipline-grid");
      if (!grid) return;

      const split = new SplitText(heading, {
        type: "lines,words",
        linesClass: "practice-split-line",
        wordsClass: "practice-split-word",
      });

      gsap.set(split.words, {
        display: "inline-block",
        willChange: "transform, opacity, filter",
      });

      const eyebrow = section.querySelector<HTMLElement>(".practice-eyebrow");
      if (eyebrow) {
        gsap.set(eyebrow, { opacity: 0, y: 14 });
      }
      gsap.set(split.words, {
        opacity: 0,
        y: 40,
        rotateX: -14,
        transformOrigin: "50% 100%",
        filter: "blur(8px)",
      });

      const titleTl = gsap.timeline({
        scrollTrigger: {
          scroller: document.documentElement,
          trigger: section,
          /** Fire when the section actually enters from below — not while still above the fold. */
          start: "top bottom-=8%",
          toggleActions: "play none none none",
          invalidateOnRefresh: true,
        },
        defaults: { ease: "power2.out" },
      });

      titleTl
        .to(".practice-eyebrow", {
          opacity: 1,
          y: 0,
          duration: 0.48,
        })
        .to(
          split.words,
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 0.68,
            stagger: 0.052,
            ease: "power3.out",
          },
          "-=0.08",
        );

      const titleEls = section.querySelectorAll<HTMLElement>(
        ".practice-discipline-title",
      );
      const disciplineSplits = [...titleEls].map(
        (node) =>
          new SplitText(node, {
            type: "words",
            wordsClass: "practice-discipline-w",
          }),
      );

      disciplineSplits.forEach((ds) => {
        gsap.set(ds.words, { display: "inline-block" });
        gsap.set(ds.words, { opacity: 0, y: 20 });
      });

      const cardParas = section.querySelectorAll<HTMLElement>(
        ".practice-discipline-card p",
      );
      gsap.set(cardParas, { opacity: 0, y: 12 });

      const gridTl = gsap.timeline({
        scrollTrigger: {
          scroller: document.documentElement,
          trigger: grid,
          start: "top bottom-=12%",
          toggleActions: "play none none none",
          invalidateOnRefresh: true,
        },
      });

      disciplineSplits.forEach((ds, i) => {
        gridTl.to(
          ds.words,
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.035,
            ease: "power2.out",
          },
          i * 0.14,
        );
      });

      gridTl.to(
        cardParas,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.09,
          ease: "power2.out",
        },
        disciplineSplits.length ? "<0.2" : 0,
      );

      refreshLenisAndScrollTrigger(lenis);

      return () => {
        titleTl.kill();
        gridTl.kill();
        split.revert();
        disciplineSplits.forEach((s) => s.revert());
      };
    },
    { scope: root, dependencies: [lenis] },
  );

  return (
    <section
      ref={root}
      id="practice"
      data-home-section="practice"
      tabIndex={-1}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-x-hidden overflow-y-auto overscroll-y-contain border-t border-[var(--border)] bg-[var(--surface-elevated)] px-6 py-12 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--surface-elevated)] md:overflow-y-visible md:px-14 md:py-16"
    >
      <div className="relative w-full max-w-6xl">
        <header className="max-w-3xl [perspective:1000px]">
          <p className="practice-eyebrow font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
            Practice
          </p>
          <h2 className="practice-split-heading mt-4 font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight tracking-tight text-[var(--foreground)]">
            Art, literature, and the space between
          </h2>
        </header>

        <ul className="practice-discipline-grid mt-12 grid gap-10 border-t border-[var(--border)] pt-10 md:grid-cols-3 md:gap-12 md:pt-12">
          {site.disciplines.map((d, i) => (
            <li key={d.title} className="practice-discipline-card">
              <span className="practice-discipline-index font-mono text-[10px] text-[var(--muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="practice-discipline-title mt-4 font-display text-xl font-semibold text-[var(--foreground)] md:text-2xl">
                {d.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-[15px]">
                {d.blurb}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
