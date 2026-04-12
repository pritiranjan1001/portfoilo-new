"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

export function SiteHeader() {
  const pathname = usePathname();
  const immersive = pathname === "/gallery";
  const root = useRef<HTMLElement>(null);

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

  return (
    <header
      ref={root}
      className={
        immersive
          ? "fixed top-0 z-50 w-full border-b border-black/[0.06] bg-[color-mix(in_oklab,#ede8de_88%,transparent)] backdrop-blur-md dark:border-white/[0.08] dark:bg-[color-mix(in_oklab,var(--background)_92%,transparent)]"
          : "fixed top-0 z-50 w-full border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_90%,transparent)] backdrop-blur-md"
      }
    >
      <div className="header-inner mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link
          href="/"
          className="site-logo relative inline-flex shrink-0 items-center leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label={`${site.name} — home`}
        >
          <Image
            src="/Black-Modern-A-letter-Logo-3.png"
            alt=""
            width={320}
            height={320}
            sizes="(max-width: 768px) 36px, 48px"
            className="block h-8 w-auto max-w-[min(8.25rem,34vw)] object-contain object-left invert transition-[filter] duration-300 dark:invert-0 sm:h-10 md:h-12"
            priority
          />
        </Link>
        <nav
          className={`site-nav flex items-center gap-3 text-sm font-medium sm:gap-5 md:gap-6 ${
            immersive
              ? "text-neutral-600 [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-neutral-900 dark:text-neutral-400 dark:[&_a:hover]:text-neutral-100"
              : "text-[var(--muted)] [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-[var(--foreground)]"
          }`}
        >
          <Link href="/work">Work</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/about">About</Link>
          <Link href="/#practice">Practice</Link>
          <Link href="/#contact">Contact</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
