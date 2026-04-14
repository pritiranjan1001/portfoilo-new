import { site } from "@/lib/site";

export function PracticeSection() {
  return (
    <section
      id="practice"
      tabIndex={-1}
      className="relative flex flex-col items-center overflow-hidden border-t border-[var(--border)] bg-[var(--surface-elevated)] px-6 py-16 md:px-14 md:py-24 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--surface-elevated)]"
    >
      <div className="relative w-full max-w-6xl">
        <header className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
            Practice
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight tracking-tight text-[var(--foreground)]">
            Art, literature, and the space between
          </h2>
        </header>

        <ul className="mt-12 grid gap-10 border-t border-[var(--border)] pt-10 md:grid-cols-3 md:gap-12 md:pt-12">
          {site.disciplines.map((d, i) => (
            <li key={d.title}>
              <span className="font-mono text-[10px] text-[var(--muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-[var(--foreground)] md:text-2xl">
                {d.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-[15px]">
                {d.blurb}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
