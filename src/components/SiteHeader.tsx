"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

const navItems = [
  { href: "/work", label: "Work" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/#practice", label: "Practice" },
  { href: "/#contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const immersive = pathname === "/gallery";
  const root = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;
      gsap.from(".header-inner", {
        opacity: 0,
        duration: 0.85,
        ease: "power1.out",
      });
    },
    { scope: root },
  );

  const navTone = immersive
    ? "text-neutral-600 [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-neutral-900 dark:text-neutral-400 dark:[&_a:hover]:text-neutral-100"
    : "text-[var(--muted)] [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-[var(--foreground)]";

  const headerBar =
    immersive
      ? "border-b border-black/[0.06] bg-[color-mix(in_oklab,#ede8de_88%,transparent)] backdrop-blur-md dark:border-white/[0.08] dark:bg-[color-mix(in_oklab,var(--background)_92%,transparent)]"
      : "border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_90%,transparent)] backdrop-blur-md";

  return (
    <header
      ref={root}
      className={`fixed top-0 right-0 left-0 z-50 w-full pt-[env(safe-area-inset-top)] ${headerBar}`}
    >
      <div className="header-inner mx-auto flex max-w-6xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] py-3 md:gap-4 md:px-8 md:py-4">
        <Link
          href="/"
          className="site-logo relative inline-flex min-w-0 shrink items-center leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label={`${site.name} — home`}
        >
          <Image
            src="/Black-Modern-A-letter-Logo-3.png"
            alt=""
            width={320}
            height={320}
            sizes="(max-width: 768px) 36px, 48px"
            className="block h-8 w-auto max-w-[min(8.25rem,50vw)] object-contain object-left invert transition-[filter] duration-300 dark:invert-0 sm:h-10 md:h-12"
            priority
          />
        </Link>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_88%,transparent)] text-[var(--foreground)] md:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>

        <nav
          aria-label="Primary"
          className={`site-nav hidden items-center gap-3 text-sm font-medium sm:gap-5 md:flex md:gap-6 ${navTone}`}
        >
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>

      {menuOpen ? (
        <div
          id="site-mobile-nav"
          className="fixed inset-0 z-[60] flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="relative ml-auto flex h-full w-[min(100%,20rem)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl dark:bg-[var(--background)]"
            style={{
              paddingRight: "max(1rem, env(safe-area-inset-right))",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Menu
              </span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--foreground)]"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <IconClose />
              </button>
            </div>
            <nav
              className={`flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4 text-base font-medium ${navTone}`}
            >
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-3 transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-[var(--border)] px-4 py-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function IconMenu() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
