"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { BlogBodyBlock, BlogPost } from "@/content/blog";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";
import { BlogSceneBackdrop } from "@/components/blog/BlogSceneBackdrop";

function formatBlogDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: "" };
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

function SocialRail({ items }: { items: readonly { label: string; href?: string }[] }) {
  return (
    <aside className="relative flex h-full flex-col items-center justify-center gap-10 py-10">
      {items.map((s) => {
        const common = "font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]";
        if (s.href) {
          return (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className={`${common} [writing-mode:vertical-rl] rotate-180`}
            >
              {s.label}
            </a>
          );
        }
        return (
          <span key={s.label} className={`${common} [writing-mode:vertical-rl] rotate-180`}>
            {s.label}
          </span>
        );
      })}
    </aside>
  );
}

function BlogBodyBlocks({ blocks }: { blocks: readonly BlogBodyBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "h2") {
          return (
            <h2 key={i} className="!mt-10 !mb-4">
              {b.text}
            </h2>
          );
        }
        if (b.type === "blockquote") {
          return (
            <figure key={i} className="not-prose my-10 border-l-2 border-[color-mix(in_oklab,var(--accent)_55%,transparent)] pl-6">
              <blockquote className="font-serif text-[18px] leading-relaxed text-[var(--foreground)] md:text-[19px]">
                “{b.quote}”
              </blockquote>
              {b.cite ? (
                <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  {b.cite}
                </figcaption>
              ) : null}
            </figure>
          );
        }
        if (b.type === "figure") {
          return (
            <figure key={i} className="not-prose my-10">
              <div className="overflow-hidden rounded-md border border-[color-mix(in_oklab,var(--border)_92%,transparent)] bg-[color-mix(in_oklab,var(--surface)_70%,transparent)]">
                <div className="relative w-full" style={{ aspectRatio: `${b.width} / ${b.height}` }}>
                  <Image
                    src={b.src}
                    alt={b.alt}
                    fill
                    sizes="(max-width: 1024px) 92vw, 42rem"
                    className="object-contain"
                  />
                </div>
              </div>
              <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                {b.caption}
              </figcaption>
            </figure>
          );
        }
        return <p key={i}>{b.text}</p>;
      })}
    </>
  );
}

function estimateBlockWeight(b: BlogBodyBlock) {
  if (b.type === "p") return Math.max(24, b.text.length);
  if (b.type === "h2") return Math.max(48, b.text.length + 24);
  if (b.type === "blockquote") return Math.max(96, b.quote.length + (b.cite?.length ?? 0));
  return Math.max(160, b.caption.length + 48);
}

function splitBodyBlocks(blocks: readonly BlogBodyBlock[]) {
  if (blocks.length <= 1) {
    return { left: blocks as BlogBodyBlock[], right: [] as BlogBodyBlock[] };
  }

  const weights = blocks.map(estimateBlockWeight);
  const total = weights.reduce((a, b) => a + b, 0);
  const target = total * 0.5;

  let acc = 0;
  let split = 1;
  let best = Number.POSITIVE_INFINITY;

  for (let i = 1; i < blocks.length; i++) {
    acc += weights[i - 1] ?? 0;
    const diff = Math.abs(acc - target);
    if (diff < best) {
      best = diff;
      split = i;
    }
  }

  split = Math.min(Math.max(split, 1), blocks.length - 1);
  return {
    left: blocks.slice(0, split),
    right: blocks.slice(split),
  };
}

export function BlogDetailView({ post }: { post: BlogPost }) {
  const root = useRef<HTMLElement>(null);
  const palette = useMemo(() => post.palette, [post.palette]);
  const { date, time } = useMemo(() => formatBlogDateTime(post.date), [post.date]);
  const { left: leftBody, right: rightBody } = useMemo(() => splitBodyBlocks(post.body), [post.body]);
  const singleColumnArticle = rightBody.length === 0;

  useGSAP(
    () => {
      registerGsapPlugins();
      const q = gsap.utils.selector(root);

      if (shouldReduceMotion()) {
        gsap.set(q("[data-blog-in]"), { clearProps: "all" });
        gsap.set(q("[data-blog-line]"), { clearProps: "all" });
        return;
      }

      gsap.set(q("[data-blog-line='x']"), { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(q("[data-blog-line='y']"), { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(q("[data-blog-in]"), { opacity: 0, y: 14, filter: "blur(5px)" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(q("[data-blog-line='x']"), { scaleX: 1, duration: 1.05, stagger: 0.06 }, 0)
        .to(q("[data-blog-line='y']"), { scaleY: 1, duration: 1.05, stagger: 0.06 }, 0.05)
        .to(
          q("[data-blog-in]"),
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85, stagger: 0.05 },
          0.12,
        );

      return () => {
        tl.kill();
      };
    },
    { scope: root, dependencies: [post.slug] },
  );

  const clipStyle: CSSProperties = {
    clipPath: "polygon(14% 0%, 100% 0%, 100% 86%, 86% 100%, 0% 100%, 0% 14%)",
  };

  const heroAspectStyle: CSSProperties = {
    aspectRatio: `${post.heroImage.width} / ${post.heroImage.height}`,
  };

  const socials = post.socials ?? [];

  return (
    <main ref={root} className="relative min-h-[100dvh] pt-[max(6rem,var(--site-header-height))]">
      <BlogSceneBackdrop ink={palette.ink} accent={palette.accent} paper={palette.paper} />

      <article className="relative mx-auto w-full max-w-6xl px-[max(1rem,env(safe-area-inset-left))] pb-24 md:px-8">
        <div className="relative">
          <div className="flex items-center justify-between gap-4 py-5" data-blog-in>
            <Link
              href="/blog"
              className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)] transition-colors hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              ← Journal
            </Link>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Blog</p>
          </div>
          <div data-blog-line="x" className="h-px w-full bg-[color-mix(in_oklab,var(--border)_92%,transparent)]" />
        </div>

        {/* hero title */}
        <header className="px-4 py-10 md:px-10 md:py-14">
          <h1
            data-blog-in
            className="mx-auto max-w-[min(52rem,92vw)] text-center font-display text-[clamp(2.05rem,4.6vw,3.55rem)] leading-[1.02] tracking-tight text-balance"
          >
            {post.title}
          </h1>
        </header>

        {/* hero image + rail */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_7.25rem]">
          <div className="relative">
            <div
              data-blog-line="y"
              className={`absolute top-0 right-0 hidden h-full w-px bg-[color-mix(in_oklab,var(--border)_92%,transparent)] lg:block ${
                singleColumnArticle ? "lg:hidden" : ""
              }`}
            />
            <div className="px-4 py-8 md:px-10 md:py-10">
              <div
                data-blog-in
                className={`mx-auto w-full ${singleColumnArticle ? "max-w-none" : "max-w-[min(56rem,92vw)]"}`}
              >
                <div className="relative overflow-hidden rounded-sm border border-[color-mix(in_oklab,var(--border)_92%,transparent)] bg-[color-mix(in_oklab,var(--surface)_70%,transparent)] shadow-[0_30px_90px_-55px_rgba(20,17,13,0.55)]">
                  <div className="relative w-full" style={{ ...clipStyle, ...heroAspectStyle }}>
                    <Image
                      src={post.heroImage.src}
                      alt={post.heroImage.alt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 92vw, 56rem"
                      className="object-cover"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 mix-blend-multiply dark:mix-blend-soft-light"
                      style={{
                        background:
                          "radial-gradient(900px 520px at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 55%), radial-gradient(700px 420px at 85% 85%, rgba(0,0,0,0.18) 0%, transparent 60%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative border-t border-[color-mix(in_oklab,var(--border)_92%,transparent)] lg:border-t-0 lg:border-l lg:border-[color-mix(in_oklab,var(--border)_92%,transparent)]">
            <div data-blog-in className="hidden lg:block">
              {socials.length ? <SocialRail items={socials} /> : null}
            </div>
            <div data-blog-in className="lg:hidden">
              {socials.length ? (
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6">
                  {socials.map((s) =>
                    s.href ? (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        {s.label}
                      </a>
                    ) : (
                      <span
                        key={s.label}
                        className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]"
                      >
                        {s.label}
                      </span>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* asterisk divider */}
        <div className="relative py-10">
          <div data-blog-line="x" className="h-px w-full bg-[color-mix(in_oklab,var(--border)_92%,transparent)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--background)] px-4 font-mono text-sm text-[var(--muted)]">
            *
          </div>
        </div>

        {/* article: desktop uses both columns; mobile stacks */}
        <div
          className={`grid grid-cols-1 border-t border-[color-mix(in_oklab,var(--border)_92%,transparent)] ${
            singleColumnArticle ? "lg:grid-cols-1" : "lg:grid-cols-2"
          }`}
        >
          <div
            className={`relative px-4 py-10 md:px-10 ${
              singleColumnArticle ? "" : "lg:border-r lg:border-[color-mix(in_oklab,var(--border)_92%,transparent)]"
            }`}
          >
            <div
              data-blog-line="y"
              className={`absolute top-0 right-0 hidden h-full w-px bg-[color-mix(in_oklab,var(--border)_92%,transparent)] lg:block ${
                singleColumnArticle ? "lg:hidden" : ""
              }`}
            />
            <div data-blog-in>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                Blog — Posted {date}
                {time ? `, ${time}` : ""}
              </p>
              <h2 className="mt-6 max-w-md font-display text-[clamp(1.35rem,2.4vw,1.85rem)] leading-snug tracking-tight text-balance">
                {post.secondaryHeadline}
              </h2>
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[color-mix(in_oklab,var(--border)_88%,transparent)] bg-[color-mix(in_oklab,var(--surface-elevated)_55%,transparent)] px-2.5 py-1 text-[11px] font-medium tracking-wide text-[var(--foreground)]/85 dark:bg-[color-mix(in_oklab,var(--surface-elevated)_30%,transparent)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10 lg:mt-12">
              <div data-blog-in className="prose prose-neutral max-w-none prose-p:text-[15px] prose-p:leading-[1.85] prose-headings:font-display prose-headings:tracking-tight md:prose-p:text-[16px] dark:prose-invert lg:hidden">
                <BlogBodyBlocks blocks={post.body} />
              </div>

              <div
                data-blog-in
                className="hidden prose prose-neutral max-w-none prose-p:text-[15px] prose-p:leading-[1.85] prose-headings:font-display prose-headings:tracking-tight md:prose-p:text-[16px] dark:prose-invert lg:block"
              >
                <BlogBodyBlocks blocks={leftBody} />
              </div>
            </div>
          </div>

          <div
            className={`border-t border-[color-mix(in_oklab,var(--border)_92%,transparent)] px-4 py-10 md:px-10 lg:border-t-0 lg:pt-10 ${
              singleColumnArticle ? "hidden" : ""
            }`}
          >
            <div
              data-blog-in
              className="hidden prose prose-neutral max-w-none prose-p:text-[15px] prose-p:leading-[1.85] prose-headings:font-display prose-headings:tracking-tight md:prose-p:text-[16px] dark:prose-invert lg:block"
            >
              <BlogBodyBlocks blocks={rightBody} />
            </div>
          </div>
        </div>

        <div data-blog-line="x" className="mt-10 h-px w-full bg-[color-mix(in_oklab,var(--border)_92%,transparent)]" />
      </article>
    </main>
  );
}
