"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

export function LandingHero() {
  const root = useRef<HTMLElement>(null);
  const nameParts = site.name.trim().split(/\s+/);
  const nameFirst = nameParts[0] ?? site.name;
  const nameRest = nameParts.slice(1).join(" ");

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
      });

      tl.from(".landing-hero-tagline", {
        opacity: 0,
        y: 28,
        duration: 0.75,
      })
        .from(
          ".landing-hero-name .landing-hero-name-line",
          {
            opacity: 0,
            y: 44,
            duration: 0.82,
            stagger: 0.11,
          },
          "-=0.45",
        )
        .from(
          ".landing-hero-cta a, .landing-hero-cta .landing-hero-cta-rule",
          {
            opacity: 0,
            y: 18,
            duration: 0.55,
            stagger: 0.07,
          },
          "-=0.5",
        )
        .from(
          ".landing-hero-portrait",
          {
            opacity: 0,
            y: 24,
            scale: 0.98,
            duration: 0.95,
          },
          "-=0.85",
        )
        .from(
          ".landing-hero-scroll",
          {
            opacity: 0,
            y: 14,
            duration: 0.55,
          },
          "-=0.45",
        );

      /** Mouse-style wheel: nub travels down the track, resets (loop). */
      const scrollWheel = gsap.timeline({ repeat: -1, repeatDelay: 0.35 });
      scrollWheel
        .fromTo(
          ".landing-hero-scroll-dot",
          { y: 0, opacity: 1 },
          {
            y: 20,
            opacity: 0.12,
            duration: 1.15,
            ease: "power2.inOut",
          },
        )
        .set(".landing-hero-scroll-dot", { y: 0, opacity: 1 });

      gsap.to(".landing-hero-scroll-glyph", {
        y: 5,
        duration: 2.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative bg-[var(--background)] text-[var(--foreground)] dark:bg-black dark:text-[color-mix(in_oklab,var(--foreground)_92%,white)]"
    >
      <div className="mx-auto grid min-h-[100dvh] max-w-5xl grid-cols-1 items-center gap-2 px-6 pb-10 pt-28 md:gap-16 md:px-14 md:pb-12 md:pt-32 lg:grid-cols-2 lg:gap-2 xl:gap-10">
        <div className="flex flex-col justify-center">
          <p className="landing-hero-tagline font-serif text-lg italic leading-relaxed text-[var(--muted)] md:text-xl">
            {site.tagline}
          </p>
          <h1 className="landing-hero-name mt-8 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[0.92] tracking-tight text-[var(--foreground)] dark:text-[color-mix(in_oklab,var(--foreground)_96%,white)]">
            <span className="landing-hero-name-line block">{nameFirst}</span>
            {nameRest ? (
              <span className="landing-hero-name-line mt-1 block md:mt-1.5">
                {nameRest}
              </span>
            ) : null}
          </h1>
          <div className="landing-hero-cta mt-14 flex flex-wrap items-center gap-4 md:gap-6">
            <Link
              href="#prelude"
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--muted)] transition-colors hover:text-[var(--foreground)] dark:hover:text-white"
            >
              Continue ↓
            </Link>
            <span
              className="landing-hero-cta-rule h-px w-10 bg-[var(--border)] md:w-12 dark:bg-zinc-600"
              aria-hidden
            />
            <Link
              href="/work"
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--accent)] transition-colors hover:text-[var(--foreground)] dark:hover:text-[color-mix(in_oklab,var(--accent)_85%,white)]"
            >
              Work →
            </Link>
          </div>
        </div>

        <div className="landing-hero-portrait relative mx-auto aspect-[1211/816] w-full max-w-3xl sm:max-w-4xl lg:mx-0 lg:max-w-none lg:origin-bottom lg:scale-[1.2] xl:scale-[1.26] lg:justify-self-end">
          <Image
            src={site.heroPortrait.light.image}
            alt={`Illustrated portrait of ${site.name}`}
            width={site.heroPortrait.light.width}
            height={site.heroPortrait.light.height}
            className="absolute inset-0 h-full w-full object-contain object-bottom dark:hidden"
            sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 56vw, 52vw"
            priority
            unoptimized
          />
          <Image
            src={site.heroPortrait.dark.image}
            alt={`Illustrated portrait of ${site.name}`}
            width={site.heroPortrait.dark.width}
            height={site.heroPortrait.dark.height}
            className="absolute inset-0 hidden h-full w-full object-contain object-bottom dark:block"
            sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 56vw, 52vw"
            priority
            unoptimized
          />
        </div>
      </div>

      <Link
        href="#prelude"
        className="landing-hero-scroll pointer-events-auto absolute bottom-6 left-1/2 right-auto top-auto z-10 -translate-x-1/2 md:bottom-8"
        aria-label="Scroll to next section"
      >
        <div
          className="landing-hero-scroll-glyph will-change-transform"
          aria-hidden
        >
          <div className="relative h-12 w-6 overflow-hidden rounded-full border border-[color-mix(in_oklab,var(--foreground)_22%,transparent)] bg-[color-mix(in_oklab,var(--background)_72%,white)] shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)] backdrop-blur-[3px] dark:border-zinc-500/80 dark:bg-zinc-900/50 dark:shadow-none">
            <span className="landing-hero-scroll-dot pointer-events-none absolute left-1/2 top-2 h-2 w-[3px] -translate-x-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_color-mix(in_oklab,var(--accent)_45%,transparent)] will-change-transform" />
          </div>
        </div>
      </Link>
    </section>
  );
}
