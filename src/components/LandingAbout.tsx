"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

export function LandingAbout() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;

      const section = root.current;
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power2.out" },
      });

      tl.from(".landing-about-eyebrow", {
        opacity: 0,
        y: 20,
        duration: 0.55,
      })
        .from(
          ".landing-about-desc",
          {
            opacity: 0,
            y: 32,
            duration: 0.7,
          },
          "-=0.28",
        )
        .from(
          ".landing-about-quote",
          {
            opacity: 0,
            x: -16,
            duration: 0.72,
          },
          "-=0.42",
        );
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section
      ref={root}
      id="about"
      className="border-t border-[var(--border)] px-6 py-24 md:px-14 md:py-32"
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
