"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { site } from "@/lib/site";
import {
  registerGsapPlugins,
  registerSplitText,
  shouldReduceMotion,
  SplitText,
} from "@/lib/gsap-plugins";

export function LandingAbout() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      registerSplitText(gsap);
      if (shouldReduceMotion()) return;

      const section = root.current;
      if (!section) return;

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
          willChange: "transform, opacity",
        },
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power2.out" },
      });

      tl.fromTo(
        eyebrowSplit.words,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.055,
          ease: "power3.out",
        },
      )
        .fromTo(
          descSplit.words,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.022,
            ease: "power2.out",
          },
          "-=0.22",
        )
        .fromTo(
          quoteSplit.words,
          { opacity: 0, x: -10, y: 10 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.52,
            stagger: 0.032,
            ease: "power3.out",
          },
          "-=0.35",
        );

      return () => {
        eyebrowSplit.revert();
        descSplit.revert();
        quoteSplit.revert();
      };
    },
    { scope: root, dependencies: [] },
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
