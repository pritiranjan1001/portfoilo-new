"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;

      const ease = "power1.out";
      const move = 18;

      gsap.set(
        [
          ".hero-tagline",
          ".hero-line",
          ".hero-desc",
          ".hero-cta",
          ".hero-scroll",
        ],
        { opacity: 0, y: move },
      );
      gsap.set(".hero-dot", { opacity: 0 });
      gsap.set(".hero-orb", { opacity: 0 });

      gsap.to(".hero-orb", {
        opacity: 1,
        duration: 1.6,
        stagger: 0.2,
        ease,
      });

      const tl = gsap.timeline({ defaults: { ease } });
      tl.to(".hero-tagline", { opacity: 1, y: 0, duration: 0.95 })
        .to(
          ".hero-line",
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.06 },
          "-=0.55",
        )
        .to(".hero-dot", { opacity: 1, duration: 0.5 }, "-=0.5")
        .to(".hero-desc", { opacity: 1, y: 0, duration: 0.9 }, "-=0.45")
        .to(".hero-cta", { opacity: 1, y: 0, duration: 0.75 }, "-=0.5")
        .to(".hero-scroll", { opacity: 1, y: 0, duration: 0.65 }, "-=0.45");

      gsap.to(".hero-scroll-dot", {
        opacity: 0.35,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      const el = root.current;
      if (el) {
        gsap.fromTo(
          ".hero-orb-a",
          { y: 0 },
          {
            y: -64,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: 0.9,
            },
          },
        );
        gsap.fromTo(
          ".hero-orb-b",
          { y: 0 },
          {
            y: 48,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: 1.15,
            },
          },
        );
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative min-h-[100dvh] overflow-hidden px-5 pb-24 pt-32 md:px-8 md:pt-40"
    >
      <div
        className="hero-orb hero-orb-a pointer-events-none absolute -right-24 top-20 h-96 w-96 rounded-full bg-[var(--glow)] blur-3xl md:right-10"
        aria-hidden
      />
      <div
        className="hero-orb hero-orb-b pointer-events-none absolute -left-32 bottom-32 h-80 w-80 rounded-full bg-[var(--glow-2)] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="hero-tagline mb-6 max-w-xl font-serif text-lg italic leading-relaxed text-[var(--muted)] md:text-xl">
          {site.tagline}
        </p>
        <h1 className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-[var(--foreground)]">
          {site.name.split(" ").map((word, i) => (
            <span key={word} className="hero-line block">
              <span className="inline-block">
                {word}
                {i === 0 && (
                  <span className="hero-dot ml-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)] align-middle opacity-80 md:h-2.5 md:w-2.5" />
                )}
              </span>
            </span>
          ))}
        </h1>
        <p className="hero-desc mt-10 max-w-2xl text-pretty font-body text-lg leading-relaxed text-[var(--muted)] md:text-xl">
          {site.description}
        </p>
        <div className="hero-cta mt-14 flex flex-wrap items-center gap-4">
          <a
            href="/work"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--foreground)] bg-transparent px-7 py-3.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            View selected work
            <span aria-hidden className="opacity-60">
              →
            </span>
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-[var(--muted)] underline decoration-[var(--border-strong)] underline-offset-[6px] transition-colors hover:text-[var(--foreground)]"
          >
            Get in touch
          </a>
        </div>
      </div>

      <div className="hero-scroll absolute bottom-10 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="flex h-12 w-6 items-start justify-center rounded-full border border-[var(--border)] pt-2">
          <span className="hero-scroll-dot h-1 w-px bg-[var(--accent)]" />
        </div>
      </div>
    </section>
  );
}
