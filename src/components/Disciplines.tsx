"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

const ease = "power1.out";

export function Disciplines() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;
      const el = root.current;
      if (!el) return;

      gsap.from(".disc-head", {
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 14,
        duration: 1.15,
        ease,
      });

      gsap.from(".disc-card", {
        scrollTrigger: {
          trigger: ".disc-grid",
          start: "top 90%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 16,
        duration: 1,
        stagger: 0.07,
        ease,
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="disciplines"
      className="scroll-mt-24 border-t border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="disc-head mb-16 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Practice
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
            Art, literature, and everything in between
          </h2>
        </div>
        <ul className="disc-grid grid gap-10 md:grid-cols-3 md:gap-8">
          {site.disciplines.map((d, i) => (
            <li
              key={d.title}
              className="disc-card group relative border border-[var(--border)] bg-[var(--surface)] p-8 transition-[box-shadow,transform] duration-500 ease-out hover:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.2)]"
            >
              <span
                className="font-mono text-[10px] text-[var(--muted)]"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-[var(--foreground)]">
                {d.title}
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[var(--muted)]">
                {d.blurb}
              </p>
              <div className="mt-6 h-px w-10 bg-[var(--accent)]/80 transition-all duration-500 group-hover:w-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
