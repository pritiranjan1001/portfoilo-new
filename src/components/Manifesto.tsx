"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;
      const el = root.current;
      if (!el) return;

      gsap.set(".mani-line", { scaleX: 0, transformOrigin: "50% 50%" });

      gsap.fromTo(
        ".mani-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "50% 50%",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            end: "top 40%",
            scrub: 0.55,
          },
        },
      );

      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            toggleActions: "play none none none",
          },
          defaults: { ease: "power1.out" },
        })
        .from(".mani-quote", { opacity: 0, y: 12, duration: 1.1 })
        .from(".mani-byline", { opacity: 0, duration: 0.65 }, "-=0.5");
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="border-y border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-4xl text-center">
        <div
          className="mani-line mx-auto mb-10 h-px w-24 bg-[var(--foreground)] opacity-25 md:mb-12"
          aria-hidden
        />
        <blockquote className="mani-quote font-serif text-2xl italic leading-snug text-[var(--foreground)] md:text-3xl md:leading-tight">
          “I work where image and sentence overlap—neither fully explains the
          other, and that gap is the interesting part.”
        </blockquote>
        <p className="mani-byline mt-8 font-mono text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
          — Studio note
        </p>
      </div>
    </section>
  );
}
