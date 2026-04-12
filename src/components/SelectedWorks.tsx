"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

const ease = "power1.out";

export function SelectedWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;
      const el = root.current;
      if (!el) return;

      gsap.from(".work-header > *", {
        scrollTrigger: {
          trigger: ".work-header",
          start: "top 88%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 14,
        duration: 1,
        stagger: 0.06,
        ease,
      });

      gsap.from(".work-card", {
        scrollTrigger: {
          trigger: ".work-grid",
          start: "top 90%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 18,
        duration: 1,
        stagger: 0.05,
        ease,
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className="scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="work-header mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
              Selected work
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
              A cross-section of projects
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
            From canvas to page to room—each piece extends the same inquiry in a
            different medium.
          </p>
        </div>

        <div className="work-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {site.works.slice(0, 6).map((work, index) => (
            <article
              key={`selected-work-${index}`}
              className={`work-card group relative overflow-hidden border border-[var(--border)] bg-[var(--surface)] ${
                index === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-1" : ""
              }`}
            >
              <div
                className={`relative aspect-[4/3] bg-gradient-to-br ${work.accent} ${
                  index === 0 ? "min-h-[280px] lg:aspect-[21/9]" : ""
                }`}
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.12%22/%3E%3C/svg%3E')] opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 flex items-end p-6 md:p-8">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/70">
                      {work.category} · {work.year}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white md:text-2xl">
                      {work.title}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 cursor-default bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.06]" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
