import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 text-sm text-[var(--muted)] md:flex-row md:items-center">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <blockquote className="max-w-md text-pretty md:max-w-lg md:text-right">
          <p className="font-serif text-sm italic leading-relaxed text-[var(--muted)]">
            &ldquo;{site.footerQuote.line}&rdquo;
          </p>
          <cite className="mt-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] not-italic opacity-90">
            — {site.footerQuote.attribution}
          </cite>
        </blockquote>
      </div>
    </footer>
  );
}
