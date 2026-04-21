"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLenisInstance } from "@/components/lenis-context";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

const navItems = [
  { href: "/work", label: "Work" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/#practice", label: "Practice" },
  { href: "/#contact", label: "Contact" },
] as const;

/** First home visit per tab: CSS + GSAP entrance; later returns to `/` stay visible (no flicker). */
const HEADER_HOME_ENTRANCE_KEY = "pf-header-home-in";

export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const immersive = pathname === "/gallery";
  const workRoute = pathname === "/work";
  const aboutRoute = pathname === "/about";
  const lenis = useLenisInstance();
  /** /work: white nav only when the dark gallery sits under the fixed header (not over the cream intro). */
  const [workGalleryUnderHeader, setWorkGalleryUnderHeader] = useState(false);
  /** Home + About: frosted bar after scrolling so nav stays legible over busy content. */
  const [headerScrolled, setHeaderScrolled] = useState(false);
  /** Home + About: tuck header away on scroll down; show again on scroll up / near top. */
  const [headerRetracted, setHeaderRetracted] = useState(false);
  const root = useRef<HTMLElement>(null);
  /** Avoid animating header “in” on first paint when already visible. */
  const headerWasRetracted = useRef(false);
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

  const [headerEntrance, setHeaderEntrance] = useState(home);

  useLayoutEffect(() => {
    if (!home) {
      setHeaderEntrance(false);
      return;
    }
    try {
      setHeaderEntrance(sessionStorage.getItem(HEADER_HOME_ENTRANCE_KEY) !== "1");
    } catch {
      setHeaderEntrance(true);
    }
  }, [home]);

  useEffect(() => {
    if (!workRoute) {
      setWorkGalleryUnderHeader(false);
      return;
    }

    const HEADER_ZONE = 76;

    const measure = () => {
      const el = document.getElementById("work-gallery-pin");
      if (!el) {
        setWorkGalleryUnderHeader(false);
        return;
      }
      const r = el.getBoundingClientRect();
      setWorkGalleryUnderHeader(r.top < HEADER_ZONE && r.bottom > HEADER_ZONE);
    };

    measure();

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const ticker = () => {
      measure();
    };
    gsap.ticker.add(ticker);

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      gsap.ticker.remove(ticker);
    };
  }, [workRoute]);

  const surfaceScrollRoute = home || aboutRoute;

  useEffect(() => {
    if (!surfaceScrollRoute || workRoute || immersive) {
      setHeaderScrolled(false);
      return;
    }

    const SCROLL_THRESHOLD = 20;

    const scrollY = () =>
      lenis ? lenis.scroll : window.scrollY || document.documentElement.scrollTop || 0;

    const measure = () => {
      setHeaderScrolled(scrollY() > SCROLL_THRESHOLD);
    };

    measure();

    if (lenis) {
      return lenis.on("scroll", measure);
    }

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [surfaceScrollRoute, workRoute, immersive, lenis]);

  const hideHeaderOnScrollRoute = home || aboutRoute;

  useEffect(() => {
    if (menuOpen) {
      setHeaderRetracted(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!hideHeaderOnScrollRoute || immersive || workRoute || shouldReduceMotion()) {
      setHeaderRetracted(false);
      return;
    }

    const TOP_ALWAYS_VISIBLE = 40;
    const MIN_BEFORE_HIDE = 64;
    const DELTA_MIN = 5;

    const scrollY = () =>
      lenis ? lenis.scroll : window.scrollY || document.documentElement.scrollTop || 0;

    let lastY = scrollY();

    const onScroll = () => {
      if (menuOpen) {
        setHeaderRetracted(false);
        lastY = scrollY();
        return;
      }

      const y = scrollY();
      const dy = y - lastY;
      lastY = y;

      if (y <= TOP_ALWAYS_VISIBLE) {
        setHeaderRetracted(false);
        return;
      }

      if (y < MIN_BEFORE_HIDE) {
        setHeaderRetracted(false);
        return;
      }

      if (Math.abs(dy) < DELTA_MIN) return;

      if (dy > 0) {
        setHeaderRetracted(true);
      } else {
        setHeaderRetracted(false);
      }
    };

    onScroll();

    if (lenis) {
      return lenis.on("scroll", onScroll);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideHeaderOnScrollRoute, immersive, workRoute, lenis, menuOpen]);

  /** Home / About: animated hide-on-scroll (slide + soft blur + opacity). */
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const dock =
      hideHeaderOnScrollRoute && !immersive && !workRoute && !shouldReduceMotion();

    if (!dock) {
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform,opacity,filter" });
      el.style.pointerEvents = "";
      el.removeAttribute("aria-hidden");
      headerWasRetracted.current = false;
      return;
    }

    if (menuOpen) {
      headerWasRetracted.current = false;
      gsap.killTweensOf(el);
      gsap.to(el, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.38,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          el.style.pointerEvents = "";
          el.removeAttribute("aria-hidden");
        },
      });
      return;
    }

    if (headerRetracted) {
      gsap.to(el, {
        y: () => -el.offsetHeight,
        opacity: 0.82,
        filter: "blur(2px)",
        duration: 0.52,
        ease: "power3.in",
        overwrite: "auto",
        onComplete: () => {
          el.style.pointerEvents = "none";
          el.setAttribute("aria-hidden", "true");
        },
      });
      headerWasRetracted.current = true;
      return;
    }

    el.style.pointerEvents = "auto";
    el.removeAttribute("aria-hidden");

    const animateIn = headerWasRetracted.current;
    headerWasRetracted.current = false;

    if (animateIn) {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.58,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.set(el, { y: 0, opacity: 1, filter: "none" });
    }
  }, [
    headerRetracted,
    hideHeaderOnScrollRoute,
    immersive,
    menuOpen,
    workRoute,
  ]);

  useGSAP(
    () => {
      registerGsapPlugins();
      const inner = root.current?.querySelector<HTMLElement>(".header-inner");
      if (!inner) return;
      if (shouldReduceMotion()) return;
      if (!home) {
        gsap.set(inner, { clearProps: "opacity" });
        return;
      }
      if (!headerEntrance) {
        gsap.set(inner, { opacity: 1, clearProps: "opacity" });
        return;
      }
      gsap.to(inner, {
        opacity: 1,
        duration: 0.85,
        ease: "power1.out",
        onComplete: () => {
          try {
            sessionStorage.setItem(HEADER_HOME_ENTRANCE_KEY, "1");
          } catch {
            /* ignore */
          }
        },
      });
    },
    { scope: root, dependencies: [home, headerEntrance] },
  );

  const workLightNav = workRoute && workGalleryUnderHeader;

  const navTone = immersive
    ? "text-neutral-600 [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-neutral-900 dark:text-neutral-400 dark:[&_a:hover]:text-neutral-100"
    : workLightNav
      ? "[&_a]:transition-colors [&_a]:duration-300 text-white/92 [&_a]:text-white/92 [&_a:hover]:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_0_24px_rgba(0,0,0,0.35)]"
      : "text-[var(--muted)] [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-[var(--foreground)]";

  const headerBarElevated =
    surfaceScrollRoute && headerScrolled && !workRoute && !immersive;

  const headerBar =
    immersive
      ? "border-b border-black/[0.06] bg-transparent dark:border-white/[0.08]"
      : workRoute && !workLightNav
        ? "border-b border-transparent bg-transparent"
        : workRoute && workLightNav
          ? "border-b border-white/15 bg-transparent"
          : headerBarElevated
            ? "border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_93%,transparent)] shadow-[0_12px_40px_-12px_rgba(20,17,13,0.14)] backdrop-blur-xl backdrop-saturate-150 dark:bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.55)]"
            : surfaceScrollRoute
              ? "border-b border-transparent bg-transparent"
              : "border-b border-[var(--border)] bg-transparent";

  return (
    <>
      <header
        ref={root}
        aria-hidden={headerRetracted && hideHeaderOnScrollRoute && !menuOpen}
        className={`fixed top-0 right-0 left-0 z-50 w-full pt-[env(safe-area-inset-top)] will-change-transform transition-[border-color,background-color,box-shadow,backdrop-filter] duration-300 ease-out ${headerBar}`}
      >
        <div
          className={`header-inner mx-auto flex max-w-6xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] py-3 md:gap-4 md:px-8 md:py-4${home && headerEntrance ? " header-inner--entrance" : ""}`}
        >
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
              className={`block h-8 w-auto max-w-[min(8.25rem,50vw)] object-contain object-left transition-[filter] duration-300 sm:h-10 md:h-12 ${
                workLightNav
                  ? "brightness-0 invert drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
                  : "invert dark:invert-0"
              }`}
              priority
            />
          </Link>

          <button
            type="button"
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg md:hidden ${
              workLightNav
                ? "border border-white/30 bg-black/35 text-white shadow-[0_1px_3px_rgba(0,0,0,0.6)] backdrop-blur-sm"
                : "border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_88%,transparent)] text-[var(--foreground)]"
            }`}
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
              <Link
                key={href}
                href={href}
                scroll={href.includes("#") ? false : undefined}
              >
                {label}
              </Link>
            ))}
            <span
              className={
                workLightNav
                  ? "[&>div[role='group']]:border-white/35 [&>div[role='group']]:bg-black/40 [&>div[role='group']]:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] [&_button]:text-white/95 [&_button]:ring-offset-black/50"
                  : ""
              }
            >
              <ThemeToggle />
            </span>
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
                scroll={href.includes("#") ? false : undefined}
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
