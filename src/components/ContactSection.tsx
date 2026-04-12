import { site } from "@/lib/site";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="border-t border-[var(--border)] px-6 py-24 md:px-14 md:py-32"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
            Contact
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight tracking-tight text-[var(--foreground)]">
            Collaborations, commissions, conversations
          </h2>
          <p className="mt-6 max-w-md text-[var(--muted)]">
            Open to exhibitions, editorial projects, readings, and unusual ideas.{" "}
            {site.location}
          </p>
        </div>
        <div className="flex flex-col gap-10">
          <a
            href={`mailto:${site.email}`}
            className="group inline-flex w-fit items-center gap-3 border-b border-[var(--border-strong)] pb-1 font-body text-xl text-[var(--foreground)] transition-colors hover:border-[var(--accent)] md:text-2xl"
          >
            {site.email}
            <span
              className="transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </a>
          <div className="flex flex-wrap gap-3">
            {site.social.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
