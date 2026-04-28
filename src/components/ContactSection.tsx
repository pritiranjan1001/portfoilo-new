"use client";

import { useRef, useState } from "react";
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

function ContactScribble({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 520 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M48 168c32-88 118-132 198-118 62 11 108 58 96 112-14 68-118 96-214 52C32 170-8 98 24 52c38-54 134-62 220-18"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />
      <path
        d="M72 196c48-24 112-20 168 8 40 20 64 52 52 84-18 48-108 44-196-16C24 220-8 140 36 88c52-68 168-76 268-8"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M320 44c28 12 52 40 44 72-10 44-62 56-120 36"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

export function ContactSection() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const lenis = useLenisInstance();

  useGSAP(
    () => {
      registerGsapPlugins();
      registerSplitText(gsap);
      if (shouldReduceMotion()) return;
      const el = root.current;
      if (!el) return;

      if (!lenis) return;

      const eyebrow = el.querySelector<HTMLElement>(".contact-eyebrow");
      const line1 = el.querySelector<HTMLElement>(".contact-h2-line1");
      const line2 = el.querySelector<HTMLElement>(".contact-h2-line2");
      const accent = el.querySelector<HTMLElement>(".contact-split-accent");
      const body = el.querySelector<HTMLElement>(".contact-body");
      if (!eyebrow || !line1 || !line2 || !accent || !body) return;

      const eyebrowSplit = new SplitText(eyebrow, {
        type: "words",
        wordsClass: "contact-split-w",
      });
      const line1Split = new SplitText(line1, {
        type: "words",
        wordsClass: "contact-split-w",
      });
      const line2Split = new SplitText(line2, {
        type: "words",
        wordsClass: "contact-split-w",
      });
      const accentSplit = new SplitText(accent, {
        type: "words",
        wordsClass: "contact-split-w",
      });
      const bodySplit = new SplitText(body, {
        type: "words",
        wordsClass: "contact-split-w",
      });

      gsap.set(
        [eyebrow, line1, line2, accent, body],
        { opacity: 1 },
      );
      gsap.set(
        [
          ...eyebrowSplit.words,
          ...line1Split.words,
          ...line2Split.words,
          ...accentSplit.words,
          ...bodySplit.words,
        ],
        {
          display: "inline-block",
          willChange: "transform, opacity",
        },
      );

      gsap.set(eyebrowSplit.words, { opacity: 0, y: 16 });
      gsap.set(line1Split.words, { opacity: 0, y: 22 });
      gsap.set(line2Split.words, { opacity: 0, y: 22 });
      gsap.set(accentSplit.words, { opacity: 0, y: 18 });
      gsap.set(bodySplit.words, { opacity: 0, y: 14 });
      const statusEl = el.querySelector<HTMLElement>(".contact-status");
      if (statusEl) gsap.set(statusEl, { opacity: 0, y: 10 });
      gsap.set(el.querySelectorAll(".contact-rail .contact-anim"), {
        opacity: 0,
        y: 26,
      });
      const scribble = el.querySelector<HTMLElement>(".contact-scribble-svg");
      if (scribble) {
        gsap.set(scribble, { opacity: 0, scale: 0.92, rotation: -4 });
      }

      const scrollSt = {
        scroller: document.documentElement,
        trigger: el,
        start: "top bottom-=10%",
        toggleActions: "play none none none" as const,
        invalidateOnRefresh: true,
      };

      const contactTl = gsap.timeline({
        paused: true,
        scrollTrigger: scrollSt,
        defaults: { ease: "power2.out" },
      });

      if (scribble) {
        contactTl.add(
          gsap.to(scribble, {
            opacity: 0.55,
            scale: 1,
            rotation: 0,
            duration: 1.25,
            ease: "power3.out",
          }),
          0,
        );
      }

      contactTl
        .to(eyebrowSplit.words, {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: 0.06,
          ease: "power3.out",
        }, 0)
        .to(
          line1Split.words,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.07,
            ease: "power3.out",
          },
          "-=0.2",
        )
        .to(
          line2Split.words,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.07,
            ease: "power3.out",
          },
          "-=0.35",
        )
        .to(
          accentSplit.words,
          {
            opacity: 1,
            y: 0,
            duration: 0.52,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.32",
        )
        .to(
          bodySplit.words,
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.018,
            ease: "power2.out",
          },
          "-=0.28",
        )
        .to(
          ".contact-status",
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            ease: "power2.out",
          },
          "-=0.22",
        )
        .to(
          ".contact-rail .contact-anim",
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.15",
        );

      refreshLenisAndScrollTrigger(lenis);

      return () => {
        contactTl.kill();
        eyebrowSplit.revert();
        line1Split.revert();
        line2Split.revert();
        accentSplit.revert();
        bodySplit.revert();
      };
    },
    { scope: root, dependencies: [lenis] },
  );

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      ref={root}
      id="contact"
      data-home-section="contact"
      data-anchor-align="center"
      className="relative flex h-[100dvh] flex-col justify-center overflow-hidden border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_88%,var(--surface-elevated))] px-6 py-10 text-center md:min-h-[100dvh] md:px-14 md:py-16 md:text-left"
    >
      {/* Soft wash + grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(ellipse 120% 80% at 100% 100%, color-mix(in oklab, var(--accent) 12%, transparent) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 0% 0%, color-mix(in oklab, #2563eb 8%, transparent) 0%, transparent 50%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "220px 220px",
        }}
        aria-hidden
      />

      <ContactScribble className="contact-scribble-svg pointer-events-none absolute -bottom-10 -right-6 h-[min(44vw,240px)] w-[min(92vw,520px)] text-[#1e4fd6] opacity-[0.5] select-none md:-right-2 md:bottom-0 md:h-[min(38vw,320px)] dark:text-[#6ba3ff] dark:opacity-[0.4]" />

      <div className="relative z-[1] mx-auto grid max-w-6xl justify-items-center gap-10 lg:grid-cols-12 lg:justify-items-stretch lg:gap-10 lg:gap-y-16">
        <div className="lg:col-span-6">
          <p className="contact-eyebrow font-mono text-xs uppercase tracking-[0.32em] text-[var(--accent)]">
            Contact us
          </p>
          <h2 className="mt-5 font-display text-[clamp(1.85rem,4.2vw,3.35rem)] font-semibold leading-[1.05] tracking-tight text-[var(--foreground)]">
            <span className="contact-h2-line1 block">Collaborations,</span>
            <span className="contact-h2-line2 block">commissions,</span>
            <span className="mt-1 block font-normal">
              <span className="relative inline-block">
                <span className="contact-split-accent font-serif italic text-[var(--accent)]">
                  conversations
                </span>
                <span
                  className="absolute -bottom-1 left-0 h-px w-full origin-left bg-[color-mix(in_oklab,var(--accent)_55%,transparent)]"
                  aria-hidden
                />
              </span>
            </span>
          </h2>
          <p className="contact-body mt-8 max-w-md text-[15px] leading-relaxed text-[var(--muted)] md:text-base">
            Open to exhibitions, editorial projects, readings, and unusual ideas.{" "}
            <span className="whitespace-nowrap">{site.location}</span>
          </p>
          <p className="contact-status mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <span
              className="inline-block size-1.5 rounded-full bg-[var(--accent)]"
              aria-hidden
            />
            New inquiries welcome
          </p>
        </div>

        <div className="contact-rail flex w-full max-w-md flex-col items-center justify-center gap-7 lg:col-span-5 lg:col-start-8 lg:max-w-none lg:items-stretch lg:gap-10">
          <div className="contact-anim relative border-t border-[color-mix(in_oklab,var(--foreground)_14%,transparent)] pt-6 md:pt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--muted)]">
              Write
            </p>
            <a
              href={`mailto:${site.email}`}
              className="group mt-4 inline-flex max-w-full items-baseline justify-center gap-3 font-display text-[clamp(1.25rem,4.4vw,1.75rem)] font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] md:justify-start"
            >
              <span className="min-w-0 break-all">
                <span className="border-b border-[color-mix(in_oklab,var(--foreground)_22%,transparent)] pb-1 transition-colors group-hover:border-[color-mix(in_oklab,var(--accent)_65%,transparent)]">
                  {site.email}
                </span>
              </span>
              <span
                className="inline-block shrink-0 translate-y-[1px] opacity-70 transition-[transform,opacity] duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                aria-hidden
              >
                →
              </span>
            </a>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <button
                type="button"
                onClick={copyEmail}
                className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--muted)] underline decoration-[color-mix(in_oklab,var(--foreground)_18%,transparent)] decoration-2 underline-offset-[6px] transition-colors hover:text-[var(--foreground)] hover:decoration-[color-mix(in_oklab,var(--accent)_70%,transparent)]"
              >
                {copied ? "Copied" : "Copy address"}
              </button>
            </div>
          </div>

          <div className="contact-anim border-t border-[color-mix(in_oklab,var(--foreground)_14%,transparent)] pt-6 md:pt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--muted)]">
              Elsewhere
            </p>
            <div className="mt-4 flex flex-nowrap items-center justify-center gap-5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-1 lg:justify-items-start lg:gap-2">
              {site.social.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex shrink-0 items-center justify-between gap-2 py-1.5 text-[13px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)] md:text-[15px] lg:w-full lg:justify-between lg:py-2"
                >
                  <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-[color-mix(in_oklab,var(--accent)_60%,transparent)]">
                    {link.label}
                  </span>
                  <span className="text-xs opacity-60 transition-[transform,opacity] group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden>
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
