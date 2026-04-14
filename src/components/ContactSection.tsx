"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

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

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;
      const el = root.current;
      if (!el) return;

      gsap.from(".contact-anim", {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 28,
        duration: 0.95,
        stagger: 0.09,
        ease: "power2.out",
      });

      gsap.from(".contact-scribble-svg", {
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        scale: 0.92,
        rotate: -4,
        duration: 1.25,
        ease: "power3.out",
      });
    },
    { scope: root },
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
      className="relative flex flex-1 flex-col justify-center overflow-hidden border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_88%,var(--surface-elevated))] px-6 py-12 md:px-14 md:py-16"
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

      <ContactScribble className="contact-scribble-svg pointer-events-none absolute -bottom-8 -right-4 h-[min(52vw,280px)] w-[min(95vw,520px)] text-[#1e4fd6] opacity-[0.55] select-none md:-right-2 md:bottom-0 md:h-[min(38vw,320px)] dark:text-[#6ba3ff] dark:opacity-[0.4]" />

      <div className="relative z-[1] mx-auto grid max-w-6xl gap-14 lg:grid-cols-12 lg:gap-10 lg:gap-y-16">
        <div className="lg:col-span-6">
          <p className="contact-anim font-mono text-xs uppercase tracking-[0.32em] text-[var(--accent)]">
            Contact us
          </p>
          <h2 className="contact-anim mt-5 font-display text-[clamp(1.85rem,4.2vw,3.35rem)] font-semibold leading-[1.05] tracking-tight text-[var(--foreground)]">
            <span className="block">Collaborations,</span>
            <span className="block">commissions,</span>
            <span className="mt-1 block font-normal">
              <span className="relative inline-block">
                <span className="font-serif italic text-[var(--accent)]">
                  conversations
                </span>
                <span
                  className="absolute -bottom-1 left-0 h-px w-full origin-left bg-[color-mix(in_oklab,var(--accent)_55%,transparent)]"
                  aria-hidden
                />
              </span>
            </span>
          </h2>
          <p className="contact-anim mt-8 max-w-md text-[15px] leading-relaxed text-[var(--muted)] md:text-base">
            Open to exhibitions, editorial projects, readings, and unusual ideas.{" "}
            <span className="whitespace-nowrap">{site.location}</span>
          </p>
          <p className="contact-anim mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <span
              className="inline-block size-1.5 rounded-full bg-[var(--accent)]"
              aria-hidden
            />
            New inquiries welcome
          </p>
        </div>

        <div className="contact-anim flex flex-col justify-center gap-10 lg:col-span-5 lg:col-start-8">
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6 shadow-[0_24px_60px_-28px_color-mix(in_oklab,var(--foreground)_18%,transparent)] backdrop-blur-sm dark:bg-[var(--surface)]/80 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
              Write
            </p>
            <a
              href={`mailto:${site.email}`}
              className="group mt-4 inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-[var(--border-strong)] pb-1.5 font-body text-[clamp(1.05rem,2.4vw,1.35rem)] text-[var(--foreground)] transition-colors hover:border-[var(--accent)]"
            >
              <span className="break-all">{site.email}</span>
              <span
                className="inline-block shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            </a>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copyEmail}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              >
                {copied ? "Copied" : "Copy address"}
              </button>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
              Elsewhere
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {site.social.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--muted)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--foreground)] hover:shadow-md"
                >
                  {link.label}
                  <span
                    className="text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  >
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
