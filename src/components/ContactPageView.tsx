"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenisInstance } from "@/components/lenis-context";
import { refreshLenisAndScrollTrigger } from "@/lib/lenis-scroll-sync";
import { site } from "@/lib/site";
import {
  registerGsapPlugins,
  registerSplitText,
  shouldReduceMotion,
  SplitText,
} from "@/lib/gsap-plugins";
import styles from "./contact-page.module.css";

export function ContactPageView() {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const lenis = useLenisInstance();

  useGSAP(
    () => {
      registerGsapPlugins();
      registerSplitText(gsap);
      if (shouldReduceMotion()) return;

      const el = root.current;
      const video = videoRef.current;
      if (!el) return;

      const eyebrow = el.querySelector<HTMLElement>(`.${styles.eyebrow}`);
      const headline = el.querySelector<HTMLElement>(`.${styles.headline}`);
      const dek = el.querySelector<HTMLElement>(`.${styles.dek}`);
      const status = el.querySelector<HTMLElement>(`.${styles.status}`);
      const panelCards = el.querySelectorAll<HTMLElement>(`.${styles.panelCard}`);
      const panelShell = el.querySelector<HTMLElement>(`.${styles.panelShell}`);
      const pageFooter = el.querySelector<HTMLElement>(`.${styles.pageFooter}`);

      if (video) {
        gsap.set(video, { scale: 1.04, opacity: 0 });
        gsap.to(video, {
          scale: 1,
          opacity: 1,
          duration: 2.2,
          ease: "power3.out",
        });
      }

      const splits: SplitText[] = [];
      if (headline) {
        const h = new SplitText(headline, {
          type: "lines",
          linesClass: styles.splitWord,
        });
        splits.push(h);
        gsap.set(h.lines, { opacity: 0, y: 48, rotateX: 10 });
      }
      if (dek) {
        const d = new SplitText(dek, {
          type: "words",
          wordsClass: styles.splitWord,
        });
        splits.push(d);
        gsap.set(d.words, { opacity: 0, y: 18 });
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.15 });

      if (eyebrow) {
        gsap.set(eyebrow, { opacity: 0, y: 20 });
        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0);
      }

      splits.forEach((split, i) => {
        const targets = split.lines ?? split.words;
        if (!targets?.length) return;
        tl.to(
          targets,
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.85,
            stagger: i === 0 ? 0.1 : 0.02,
          },
          i === 0 ? "-=0.35" : "-=0.5",
        );
      });

      if (status) {
        gsap.set(status, { opacity: 0, y: 14 });
        tl.to(status, { opacity: 1, y: 0, duration: 0.55 }, "-=0.35");
      }

      if (panelShell) {
        gsap.set(panelShell, { opacity: 0, y: 28, filter: "blur(8px)" });
        tl.to(
          panelShell,
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 },
          "-=0.3",
        );
      }

      if (panelCards.length) {
        gsap.set(panelCards, { opacity: 0, y: 24 });
        tl.to(
          panelCards,
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: "power2.out" },
          "-=0.55",
        );
      }

      if (pageFooter) {
        gsap.set(pageFooter, { opacity: 0 });
        tl.to(pageFooter, { opacity: 1, duration: 0.5 }, "-=0.2");
      }

      refreshLenisAndScrollTrigger(lenis);

      return () => {
        tl.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: root, dependencies: [lenis] },
  );

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  };

  return (
    <main ref={root} className={styles.page}>
      <div className={styles.media} aria-hidden>
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/contact-video.webm" type="video/webm" />
          <source src="/contact-video.mp4" type="video/mp4" />
        </video>
        <div className={styles.mediaScrim} />
        <div className={styles.mediaVignette} />
        <div className={styles.mediaGrain} />
      </div>

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.grid}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}>Contact</p>
              <h1 className={styles.headline}>
                <span className={styles.headlineLine}>Let&apos;s begin</span>
                <span className={styles.headlineAccentWrap}>
                  <span className={styles.headlineAccent}>a conversation</span>
                  <span className={styles.headlineRule} aria-hidden />
                </span>
              </h1>
              <p className={styles.dek}>
                Exhibitions, editorial commissions, album and publication design — and
                ideas that need a careful eye.
              </p>
              <div className={styles.introMeta}>
                <p className={styles.location}>
                  <span className={styles.locationIcon} aria-hidden>
                    ◎
                  </span>
                  {site.location}
                </p>
                <p className={styles.status}>
                  <span className={styles.statusDot} aria-hidden />
                  New inquiries welcome
                </p>
              </div>
            </div>

            <aside className={styles.panel}>
              <div className={styles.panelShell}>
                <article className={styles.panelCard}>
                  <header className={styles.panelCardHead}>
                    <span className={styles.panelIndex}>01</span>
                    <p className={styles.panelLabel}>Write</p>
                  </header>
                  <a href={`mailto:${site.email}`} className={styles.email}>
                    {site.email}
                  </a>
                  <div className={styles.emailActions}>
                    <a href={`mailto:${site.email}`} className={styles.primaryAction}>
                      <span>Send an email</span>
                      <span className={styles.primaryActionIcon} aria-hidden>
                        →
                      </span>
                    </a>
                    <button
                      type="button"
                      className={styles.secondaryAction}
                      onClick={copyEmail}
                      aria-live="polite"
                    >
                      {copied ? "Copied" : "Copy address"}
                    </button>
                  </div>
                </article>

                <article className={styles.panelCard}>
                  <header className={styles.panelCardHead}>
                    <span className={styles.panelIndex}>02</span>
                    <p className={styles.panelLabel}>Elsewhere</p>
                  </header>
                  <ul className={styles.socialList}>
                    {site.social.map((link, i) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                        >
                          <span className={styles.socialIndex}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className={styles.socialLabel}>{link.label}</span>
                          <span className={styles.socialArrow} aria-hidden>
                            ↗
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </aside>
          </div>

          <footer className={styles.pageFooter}>
            <Link href="/#contact" className={styles.homeLink}>
              <span className={styles.homeLinkArrow} aria-hidden>
                ←
              </span>
              Studio overview on home
            </Link>
            <p className={styles.footerNote}>
              © {new Date().getFullYear()} {site.name}
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
