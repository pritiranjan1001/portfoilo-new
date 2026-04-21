"use client";

import Image from "next/image";
import Link from "next/link";
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

export function LandingHero() {
  const root = useRef<HTMLElement>(null);
  const nameParts = site.name.trim().split(/\s+/);
  const nameFirst = nameParts[0] ?? site.name;
  const nameRest = nameParts.slice(1).join(" ");

  useGSAP(
    () => {
      registerGsapPlugins();
      registerSplitText(gsap);
      if (shouldReduceMotion()) return;

      const el = root.current;
      if (!el) return;

      const taglineEl = el.querySelector<HTMLElement>(".landing-hero-tagline");
      const nameLines = el.querySelectorAll<HTMLElement>(".landing-hero-name-line");
      if (!taglineEl || nameLines.length === 0) return;

      const taglineSplit = new SplitText(taglineEl, {
        type: "words",
        wordsClass: "landing-hero-smoke-w",
      });
      const nameSplits = [...nameLines].map(
        (line) =>
          new SplitText(line, {
            type: "chars",
            charsClass: "landing-hero-smoke-c",
          }),
      );

      gsap.set(taglineEl, { opacity: 1, transform: "none" });
      gsap.set([...nameLines], { opacity: 1, transform: "none" });

      gsap.set(taglineSplit.words, {
        display: "inline-block",
        opacity: 0,
        y: 18,
        filter: "blur(14px)",
        willChange: "transform, opacity, filter",
      });

      nameSplits.forEach((split) => {
        split.chars.forEach((node, i) => {
          gsap.set(node, {
            display: "inline-block",
            opacity: 0,
            y: 12 + (i % 5) * 2,
            x: (i % 2 === 0 ? -1 : 1) * (3 + (i % 4)),
            filter: `blur(${10 + (i % 6) * 1.5}px)`,
            willChange: "transform, opacity, filter",
          });
        });
      });

      gsap.set(
        el.querySelectorAll<HTMLElement>(
          ".landing-hero-cta a, .landing-hero-cta .landing-hero-cta-rule",
        ),
        { filter: "blur(8px)" },
      );

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
      });

      tl.to(taglineSplit.words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.92,
        stagger: {
          each: 0.05,
          from: "start",
        },
        ease: "sine.out",
      })
        .to(
          nameSplits[0].chars,
          {
            opacity: 1,
            y: 0,
            x: 0,
            filter: "blur(0px)",
            duration: 1.12,
            stagger: {
              each: 0.028,
              from: "random",
            },
            ease: "power3.out",
          },
          "-=0.48",
        );

      if (nameSplits[1]) {
        tl.to(
          nameSplits[1].chars,
          {
            opacity: 1,
            y: 0,
            x: 0,
            filter: "blur(0px)",
            duration: 1.12,
            stagger: {
              each: 0.028,
              from: "random",
            },
            ease: "power3.out",
          },
          "-=0.58",
        );
      }

      tl.to(
        ".landing-hero-cta a, .landing-hero-cta .landing-hero-cta-rule",
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.62,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.52",
      )
        .to(
          ".landing-hero-portrait-motion",
          {
            opacity: 1,
            duration: 0.95,
            ease: "power2.out",
          },
          "-=0.85",
        )
        .to(
          ".landing-hero-scroll",
          {
            opacity: 1,
            y: 0,
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

      return () => {
        taglineSplit.revert();
        nameSplits.forEach((s) => s.revert());
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative w-full max-w-[100vw] overflow-x-clip bg-[var(--background)] text-[var(--foreground)] dark:bg-black dark:text-[color-mix(in_oklab,var(--foreground)_92%,white)]"
    >
      <div className="mx-auto grid min-h-[100svh] max-w-5xl grid-cols-1 items-center gap-6 px-[max(1rem,env(safe-area-inset-left))] pb-10 pt-[max(7rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] md:gap-16 md:px-14 md:pb-12 md:pt-32 lg:grid-cols-2 lg:gap-2 xl:gap-10">
        <div className="landing-hero-copy flex min-w-0 flex-col justify-center [contain:layout_style]">
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

        <div className="landing-hero-portrait relative mx-auto aspect-[1211/816] w-full min-w-0 max-w-[min(100%,48rem)] sm:max-w-[min(100%,56rem)] lg:mx-0 lg:max-w-none lg:origin-bottom lg:justify-self-end lg:scale-[1.12] xl:scale-[1.18] 2xl:scale-[1.24]">
          {/*
            Entrance motion lives on an inner wrapper so GSAP never overwrites the outer
            responsive scale (lg/xl/2xl) — that scale is what reads as the “full” portrait size.
          */}
          <div className="landing-hero-portrait-motion relative h-full w-full">
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
      </div>

      <Link
        href="#prelude"
        className="landing-hero-scroll pointer-events-auto absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 right-auto top-auto z-10 -translate-x-1/2 md:bottom-8"
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
