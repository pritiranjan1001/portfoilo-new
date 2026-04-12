"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const killMobileMenuTweens = useCallback(() => {
    const el = mobileMenuRef.current;
    if (!el) return;
    const inner = el.querySelectorAll(
      ".site-mobile-nav__link, .site-mobile-nav__footer, .site-mobile-nav__close",
    );
    gsap.killTweensOf([el, ...inner]);
  }, []);

  const closeMenu = useCallback(
    (quick?: boolean) => {
      registerGsapPlugins();
      const el = mobileMenuRef.current;
      if (!el || shouldReduceMotion() || quick) {
        killMobileMenuTweens();
        setMenuOpen(false);
        return;
      }
      killMobileMenuTweens();
      const q = gsap.utils.selector(el);
      gsap
        .timeline({
          defaults: { ease: "power2.in" },
          onComplete: () => setMenuOpen(false),
        })
        .to(
          q(".site-mobile-nav__link"),
          {
            opacity: 0,
            y: -22,
            stagger: { each: 0.05, from: "end" },
            duration: 0.24,
          },
          0,
        )
        .to(q(".site-mobile-nav__footer"), { opacity: 0, y: 14, duration: 0.2 }, 0)
        .to(
          q(".site-mobile-nav__close"),
          { opacity: 0, rotation: -92, scale: 0.82, duration: 0.26 },
          0,
        )
        .to(el, { autoAlpha: 0, duration: 0.34, ease: "power2.inOut" }, 0.08);
    },
    [killMobileMenuTweens],
  );

  useEffect(() => {
    killMobileMenuTweens();
    setMenuOpen(false);
  }, [pathname, killMobileMenuTweens]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen, closeMenu]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    const el = mobileMenuRef.current;
    if (!el) return;
    registerGsapPlugins();
    const q = gsap.utils.selector(el);
    if (shouldReduceMotion()) {
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(q(".site-mobile-nav__link"), { opacity: 1, y: 0 });
      gsap.set(q(".site-mobile-nav__footer"), { opacity: 1, y: 0 });
      gsap.set(q(".site-mobile-nav__close"), { opacity: 1, scale: 1, rotation: 0 });
      return;
    }
    gsap.set(el, { autoAlpha: 0 });
    gsap.set(q(".site-mobile-nav__link"), { opacity: 0, y: 40 });
    gsap.set(q(".site-mobile-nav__footer"), { opacity: 0, y: 20 });
    gsap.set(q(".site-mobile-nav__close"), { opacity: 0, scale: 0.82, rotation: 88 });
    gsap.to(el, { autoAlpha: 1, duration: 0.48, ease: "power2.out" });
    gsap.to(q(".site-mobile-nav__close"), {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.5,
      ease: "power3.out",
    });
    gsap.to(q(".site-mobile-nav__link"), {
      opacity: 1,
      y: 0,
      stagger: 0.075,
      duration: 0.55,
      ease: "power3.out",
      delay: 0.08,
    });
    gsap.to(q(".site-mobile-nav__footer"), {
      opacity: 1,
      y: 0,
      duration: 0.42,
      ease: "power2.out",
      delay: 0.32,
    });
    const animated = el.querySelectorAll(
      ".site-mobile-nav__link, .site-mobile-nav__footer, .site-mobile-nav__close",
    );
    return () => {
      gsap.killTweensOf([el, ...animated]);
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
    <>
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
              sizes="(max-width: 768px) min(50vw, 8.25rem), 8.25rem"
              quality={100}
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
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
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
      </header>

      {menuOpen ? (
        <div
          ref={mobileMenuRef}
          id="site-mobile-nav"
          className="site-mobile-nav-root fixed inset-0 z-[110] flex h-[100dvh] max-h-[100dvh] w-full flex-col bg-[var(--background)] text-[var(--foreground)] md:hidden"
          style={{
            paddingTop: "max(0.75rem, env(safe-area-inset-top))",
            paddingRight: "max(1rem, env(safe-area-inset-right))",
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            paddingLeft: "max(1rem, env(safe-area-inset-left))",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="flex shrink-0 items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
              Menu
            </span>
            <button
              type="button"
              className="site-mobile-nav__close inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_92%,transparent)] text-[var(--foreground)] shadow-sm dark:bg-[color-mix(in_oklab,var(--surface)_88%,transparent)]"
              aria-label="Close menu"
              onClick={() => closeMenu()}
            >
              <IconClose />
            </button>
          </div>

          <nav
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 overflow-y-auto overscroll-y-contain py-8"
            aria-label="Primary mobile"
          >
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="site-mobile-nav__link font-display text-[clamp(1.85rem,7.5vw,3.15rem)] font-medium leading-tight tracking-tight text-[var(--foreground)] transition-colors duration-300 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] py-2"
                onClick={() => closeMenu(true)}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="site-mobile-nav__footer flex shrink-0 justify-center border-t border-[var(--border)] pt-6">
            <ThemeToggle />
          </div>
        </div>
      ) : null}
    </>
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
