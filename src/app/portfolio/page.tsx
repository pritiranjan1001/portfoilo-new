import type { Metadata } from "next";
import Link from "next/link";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `Work — ${site.name}.`,
};

export default function PortfolioPage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main className="min-h-[100dvh] px-6 pb-24 pt-28 md:px-14 md:pt-36">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            ← Home
          </Link>
          <p className="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Portfolio
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
            View work on its own page
          </h1>
          <p className="mt-6 text-pretty leading-relaxed text-[var(--muted)]">
            The horizontal project carousel lives on Work—open it for the full-bleed
            pass through each piece.
          </p>
          <Link
            href="/work"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-[var(--foreground)] bg-transparent px-7 py-3.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            Open Work
            <span aria-hidden className="opacity-60">
              →
            </span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
