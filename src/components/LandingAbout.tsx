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

export function LandingAbout() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenisInstance();

  useGSAP(
    () => {
      registerGsapPlugins();
      registerSplitText(gsap);
      if (shouldReduceMotion()) return;

      const section = root.current;
      if (!section) return;

      /** Lenis + scrollerProxy — pin/scrub not required; triggers must use the same scroller. */
      if (!lenis) return;

      const eyebrow = section.querySelector<HTMLElement>(
        ".landing-about-eyebrow",
      );
      const desc = section.querySelector<HTMLElement>(".landing-about-desc");
      const quote = section.querySelector<HTMLElement>(".landing-about-quote");
      if (!eyebrow || !desc || !quote) return;

      const eyebrowSplit = new SplitText(eyebrow, {
        type: "words",
        wordsClass: "landing-about-w",
      });
      const descSplit = new SplitText(desc, {
        type: "words",
        wordsClass: "landing-about-w",
      });
      const quoteSplit = new SplitText(quote, {
        type: "words",
        wordsClass: "landing-about-w",
      });

      gsap.set([eyebrow, desc, quote], { opacity: 1 });
      gsap.set(
        [
          ...eyebrowSplit.words,
          ...descSplit.words,
          ...quoteSplit.words,
        ],
        {
          display: "inline-block",
          willChange: "transform, opacity, filter",
        },
      );

      /** Pre-hide all spans so nothing reads as “half on” before the trigger fires. */
      gsap.set(eyebrowSplit.words, {
        opacity: 0,
        y: 22,
        filter: "blur(10px)",
      });
      gsap.set(descSplit.words, {
        opacity: 0,
        y: 26,
        filter: "blur(8px)",
      });
      gsap.set(quoteSplit.words, {
        opacity: 0,
        x: -12,
        y: 16,
        filter: "blur(6px)",
      });

      /**
       * One-shot reveal when the section enters — not scrubbed to scroll.
       * Scrub on long copy leaves the paragraph stuck mid-tween (clear + blurred words at once).
       */
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        paused: true,
        scrollTrigger: {
          scroller: document.documentElement,
          trigger: section,
          start: "top bottom-=10%",
          toggleActions: "play none none none",
          invalidateOnRefresh: true,
        },
      });

      tl.to(eyebrowSplit.words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.5,
        stagger: { each: 0.06, from: "start" },
        ease: "power3.out",
      })
        .to(
          descSplit.words,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.75,
            stagger: { each: 0.012, from: "start" },
            ease: "power2.out",
          },
          "-=0.15",
        )
        .to(
          quoteSplit.words,
          {
            opacity: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
            duration: 0.55,
            stagger: { each: 0.022, from: "start" },
            ease: "power3.out",
          },
          "-=0.25",
        );

      refreshLenisAndScrollTrigger(lenis);

      return () => {
        tl.kill();
        eyebrowSplit.revert();
        descSplit.revert();
        quoteSplit.revert();
      };
    },
    { scope: root, dependencies: [lenis] },
  );

  return (
    <section
      ref={root}
      id="about"
      data-home-section="about"
      className="flex min-h-[100dvh] flex-col justify-center border-t border-[var(--border)] px-6 py-16 md:box-border md:px-14 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <p className="landing-about-eyebrow font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
          A few words
        </p>
        <p className="landing-about-desc mt-8 font-body text-lg leading-relaxed text-[var(--foreground)] md:text-xl">
          {site.description}
        </p>
        <blockquote className="landing-about-quote mt-12 border-l-2 border-[var(--accent)] pl-6 font-serif text-lg italic leading-snug text-[var(--muted)] md:text-xl">
          I work where image and sentence overlap—neither fully explains the other,
          and that gap is the interesting part.
        </blockquote>
      </div>
    </section>
  );
}
