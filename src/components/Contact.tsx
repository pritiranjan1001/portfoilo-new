"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

export function Contact() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;
      const el = root.current;
      if (!el) return;

      gsap.from(".contact-inner", {
        scrollTrigger: {
          trigger: el,
          start: "top 86%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 16,
        duration: 1.1,
        ease: "power1.out",
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="contact"
      className="scroll-mt-24 px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="contact-inner grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
              Contact
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
              Collaborations, commissions, conversations
            </h2>
            <p className="mt-6 max-w-md text-[var(--muted)]">
              Open to exhibitions, editorial projects, readings, and unusual
              ideas. {site.location}
            </p>
          </div>
          <div className="flex flex-col gap-8">
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex w-fit items-center gap-3 border-b border-[var(--border-strong)] pb-1 font-body text-lg text-[var(--foreground)] transition-colors hover:border-[var(--accent)]"
            >
              {site.email}
              <span
                className="transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              >
                →
              </span>
            </a>
            <div className="contact-links flex flex-wrap gap-3">
              {site.social.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
