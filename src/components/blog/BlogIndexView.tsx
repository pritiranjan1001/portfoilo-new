"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { BlogPost } from "@/content/blog";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";
import { BlogSceneBackdrop } from "@/components/blog/BlogSceneBackdrop";

function formatBlogDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function BlogIndexView({ posts }: { posts: readonly BlogPost[] }) {
  const root = useRef<HTMLElement>(null);
  const cardsRef = useRef<Array<HTMLAnchorElement | null>>([]);

  const palette = useMemo(() => {
    const first = posts[0]?.palette;
    return first ?? { ink: "var(--foreground)", accent: "var(--accent)", paper: "var(--background)" };
  }, [posts]);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-blog-card]"), { opacity: 0, y: 18, rotate: -0.35, transformOrigin: "50% 50%" });
      gsap.to(q("[data-blog-card]"), {
        opacity: 1,
        y: 0,
        rotate: 0,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.06,
        delay: 0.08,
      });
    },
    { scope: root, dependencies: [posts.length] },
  );

  return (
    <main ref={root} className="relative min-h-[100dvh] pt-[max(6rem,var(--site-header-height))]">
      <BlogSceneBackdrop ink={palette.ink} accent={palette.accent} paper={palette.paper} />

      <section className="relative mx-auto w-full max-w-6xl px-[max(1rem,env(safe-area-inset-left))] pb-16 md:px-8">
        <header className="relative z-[1] pt-10 md:pt-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Journal</p>
          <h1 className="mt-3 font-display text-[clamp(2.35rem,5.2vw,3.9rem)] leading-[0.95] tracking-tight">
            Blog
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-[15px] leading-relaxed text-[var(--muted)] md:text-[16px]">
          A blog for sharing ideas, insights, and articles.
          </p>
        </header>

        <div className="relative z-[1] mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, idx) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              data-blog-card
              className="group relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] p-5 shadow-[0_18px_40px_-24px_rgba(20,17,13,0.35)] backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))] hover:shadow-[0_26px_64px_-28px_rgba(20,17,13,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] dark:bg-[color-mix(in_oklab,var(--surface)_72%,transparent)]"
              style={
                {
                  ["--card-accent" as never]: p.palette.accent,
                } as React.CSSProperties
              }
              onMouseMove={(e) => {
                if (shouldReduceMotion()) return;
                const a = e.currentTarget;
                const r = a.getBoundingClientRect();
                const px = (e.clientX - r.left) / Math.max(1, r.width);
                const py = (e.clientY - r.top) / Math.max(1, r.height);
                gsap.to(a, {
                  rotateX: gsap.utils.interpolate(2.2, -2.2, py),
                  rotateY: gsap.utils.interpolate(-3.0, 3.0, px),
                  transformPerspective: 800,
                  duration: 0.35,
                  ease: "power3.out",
                  overwrite: "auto",
                });
              }}
              onMouseLeave={(e) => {
                if (shouldReduceMotion()) return;
                gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.55, ease: "power3.out" });
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                  background:
                    "radial-gradient(680px 320px at 16% 18%, color-mix(in oklab, var(--card-accent) 26%, transparent) 0%, transparent 55%), radial-gradient(520px 280px at 90% 85%, color-mix(in oklab, var(--glow-2) 18%, transparent) 0%, transparent 60%)",
                }}
              />

              <div className="relative">
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
                  {formatBlogDate(p.date)}
                </p>
                <h2 className="mt-3 text-pretty font-odia text-[clamp(1.25rem,2.4vw,1.55rem)] font-semibold leading-tight tracking-tight">
                  {p.title}
                </h2>
                <p className="mt-3 text-pretty text-[14px] leading-relaxed text-[var(--muted)]">{p.excerpt}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[color-mix(in_oklab,var(--border)_88%,transparent)] bg-[color-mix(in_oklab,var(--surface-elevated)_62%,transparent)] px-2.5 py-1 text-[11px] font-medium tracking-wide text-[var(--foreground)]/85 dark:bg-[color-mix(in_oklab,var(--surface-elevated)_38%,transparent)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold tracking-wide text-[var(--foreground)]/85">
                  <span className="relative">
                    Read
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-[var(--accent)] transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

