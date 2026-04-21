"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  registerGsapPlugins,
  registerSplitText,
  shouldReduceMotion,
  SplitText,
} from "@/lib/gsap-plugins";

function HeroLinePatterns({ className }: { className?: string }) {
  return (
    <svg
      className={`bvc-pattern-svg ${className ?? ""}`}
      viewBox="0 0 1200 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <g className="bvc-pattern-root text-[var(--border-strong)] opacity-[0.35] dark:opacity-[0.42]">
        {/* Soft grid — orthogonals */}
        <line
          className="bvc-path-draw"
          x1="0"
          y1="120"
          x2="1200"
          y2="120"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.55"
        />
        <line
          className="bvc-path-draw"
          x1="0"
          y1="240"
          x2="1200"
          y2="240"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.45"
        />
        <line
          className="bvc-path-draw"
          x1="180"
          y1="0"
          x2="180"
          y2="360"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.4"
        />
        <line
          className="bvc-path-draw"
          x1="1020"
          y1="0"
          x2="1020"
          y2="360"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.4"
        />
        {/* Center guides — frame the eye row */}
        <line
          className="bvc-path-draw"
          x1="520"
          y1="20"
          x2="520"
          y2="340"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeOpacity="0.5"
        />
        <line
          className="bvc-path-draw"
          x1="680"
          y1="20"
          x2="680"
          y2="340"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeOpacity="0.5"
        />
        {/* Flowing curves */}
        <path
          className="bvc-path-draw"
          d="M0 190 C200 130 400 250 600 180 S1000 120 1200 200"
          stroke="currentColor"
          strokeWidth="0.85"
          strokeLinecap="round"
          strokeOpacity="0.65"
        />
        <path
          className="bvc-path-draw"
          d="M0 210 C280 270 520 150 780 210 S1080 280 1200 165"
          stroke="currentColor"
          strokeWidth="0.65"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        {/* Marching dashed arcs */}
        <path
          className="bvc-path-march"
          d="M420 180 A 180 90 0 0 1 780 180"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeDasharray="10 14"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />
        <path
          className="bvc-path-march"
          d="M320 200 A 280 110 0 0 0 880 200"
          stroke="currentColor"
          strokeWidth="0.55"
          strokeDasharray="8 12"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
        {/* Corner ticks */}
        <path
          className="bvc-path-draw"
          d="M40 40 L40 88 M40 40 L88 40"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.55"
        />
        <path
          className="bvc-path-draw"
          d="M1160 40 L1112 40 M1160 40 L1160 88"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.55"
        />
        <path
          className="bvc-path-draw"
          d="M40 320 L40 272 M40 320 L88 320"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.45"
        />
        <path
          className="bvc-path-draw"
          d="M1160 320 L1112 320 M1160 320 L1160 272"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.45"
        />
      </g>
    </svg>
  );
}

function EyeMark({ className }: { className?: string }) {
  const rid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 220 130"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        {/* Sclera — soft volume */}
        <radialGradient id={`${rid}-sclera`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--surface) 88%, white)" />
          <stop offset="55%" stopColor="color-mix(in oklab, var(--surface-elevated) 70%, var(--muted))" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--muted) 35%, transparent)" />
        </radialGradient>
        {/* Iris + pupil — theme via globals: light = soft gray / white; dark = charcoal */}
        <radialGradient id={`${rid}-iris`} cx="42%" cy="42%" r="58%">
          <stop offset="0%" stopColor="var(--bvc-eye-iris-0)" />
          <stop offset="38%" stopColor="var(--bvc-eye-iris-1)" />
          <stop offset="72%" stopColor="var(--bvc-eye-iris-2)" />
          <stop offset="100%" stopColor="var(--bvc-eye-iris-3)" />
        </radialGradient>
        <linearGradient id={`${rid}-irisSweep`} x1="15%" y1="0%" x2="95%" y2="100%">
          <stop offset="0%" stopColor="color-mix(in oklab, white 22%, transparent)" stopOpacity="0.45" />
          <stop offset="45%" stopColor="transparent" />
          <stop offset="100%" stopColor="var(--bvc-eye-sweep-end)" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id={`${rid}-pupil`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="var(--bvc-eye-pupil-0)" />
          <stop offset="68%" stopColor="var(--bvc-eye-pupil-1)" />
          <stop offset="100%" stopColor="var(--bvc-eye-pupil-2)" />
        </radialGradient>
        <filter id={`${rid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.65" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Soft ambient shadow under the almond */}
        <filter id={`${rid}-drop`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="4"
            floodColor="currentColor"
            floodOpacity="0.2"
          />
        </filter>
        {/* Inner (nasal) corner — soft grey */}
        <radialGradient id={`${rid}-corner`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--muted) 40%, var(--surface))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <g filter={`url(#${rid}-drop)`}>
        {/* Almond boundary — outer stroke */}
        <path
          d="M18 65c32-42 150-42 184 0-32 42-150 42-184 0z"
          fill={`url(#${rid}-sclera)`}
          opacity="0.94"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
      {/* Nasal corner tint (left side of icon) */}
      <ellipse
        cx="34"
        cy="64"
        rx="14"
        ry="20"
        fill={`url(#${rid}-corner)`}
        opacity="0.62"
      />

      {/* Subtle upper lid shadow */}
      <path
        d="M22 62c30-28 146-28 176 0"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="8"
        strokeLinecap="round"
        filter={`url(#${rid}-soft)`}
      />

      {/* Iris + limbal ring */}
      <circle cx="110" cy="65" r="31" fill={`url(#${rid}-iris)`} />
      <circle
        cx="110"
        cy="65"
        r="31"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="110" cy="65" r="28.5" stroke="currentColor" strokeOpacity="0.14" strokeWidth="0.75" fill="none" />
      {/* Iris sheen */}
      <circle cx="110" cy="65" r="30" fill={`url(#${rid}-irisSweep)`} opacity="0.85" />

      {/* Pupil + mouse-tracking group */}
      <g
        className="eye-pupil-group"
        style={{ transformOrigin: "110px 65px" }}
      >
        <circle cx="110" cy="65" r="13" fill={`url(#${rid}-pupil)`} />
        <circle cx="110" cy="65" r="13" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" fill="none" />
        {/* Primary highlight */}
        <ellipse cx="104" cy="58" rx="4.2" ry="3.2" fill="white" opacity="0.92" />
        {/* Secondary micro highlight */}
        <circle cx="116" cy="70" r="1.6" fill="white" opacity="0.35" />
        {/* Lower crescent catch */}
        <path
          d="M 102 72 A 8 5 0 0 0 118 72"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

    </svg>
  );
}

export function BeyondVisibleCover() {
  const root = useRef<HTMLElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      const reduce = shouldReduceMotion();
      const el = root.current;
      const grad = layer.current;
      if (!el) return;

      if (reduce) {
        return;
      }

      if (grad) gsap.set(grad, { backgroundPosition: "0% 50%" });

      const kickerEl = el.querySelector<HTMLElement>(".bvc-kicker");
      const line1El = el.querySelector<HTMLElement>(".bvc-line1");
      const line2El = el.querySelector<HTMLElement>(".bvc-line2");
      const tagL1 = el.querySelector<HTMLElement>(".bvc-tag-line1");
      const tagL2 = el.querySelector<HTMLElement>(".bvc-tag-line2");
      const ctaWords = el.querySelector<HTMLElement>(".bvc-cta-words");
      const capEl = el.querySelector<HTMLElement>(".bvc-bottom-cap");
      const tagRoot = el.querySelector<HTMLElement>(".bvc-tag");
      const ctaRoot = el.querySelector<HTMLElement>(".bvc-cta");
      if (
        !kickerEl ||
        !line1El ||
        !line2El ||
        !tagL1 ||
        !tagL2 ||
        !ctaWords ||
        !capEl ||
        !tagRoot ||
        !ctaRoot
      ) {
        return;
      }

      registerSplitText(gsap);

      const kickerSplit = new SplitText(kickerEl, {
        type: "chars",
        charsClass: "bvc-split-c",
      });
      const line1Split = new SplitText(line1El, {
        type: "chars",
        charsClass: "bvc-line1-c",
      });
      const line2Split = new SplitText(line2El, {
        type: "chars",
        charsClass: "bvc-line2-c",
      });
      const tag1Split = new SplitText(tagL1, {
        type: "words",
        wordsClass: "bvc-split-w",
      });
      const tag2Split = new SplitText(tagL2, {
        type: "words",
        wordsClass: "bvc-split-w",
      });
      const ctaSplit = new SplitText(ctaWords, {
        type: "words",
        wordsClass: "bvc-split-w",
      });
      const capSplit = new SplitText(capEl, {
        type: "words",
        wordsClass: "bvc-split-w",
      });

      gsap.set(
        [
          ...kickerSplit.chars,
          ...line1Split.chars,
          ...line2Split.chars,
          ...tag1Split.words,
          ...tag2Split.words,
          ...ctaSplit.words,
          ...capSplit.words,
        ],
        {
          display: "inline-block",
          willChange: "transform, opacity, filter",
        },
      );

      gsap.set(line1El, { transformStyle: "preserve-3d" });
      gsap.set(line2El, { transformStyle: "preserve-3d" });

      kickerSplit.chars.forEach((node, i) => {
        gsap.set(node, {
          opacity: 0,
          y: 36,
          scale: 0.35,
          rotateZ: (i % 2 === 0 ? -1 : 1) * (10 + (i % 4) * 3),
          filter: "blur(10px)",
        });
      });

      gsap.set(line1Split.chars, {
        opacity: 0,
        x: -36,
        rotateY: 72,
        rotateZ: -5,
        transformOrigin: "left center",
        filter: "blur(7px)",
      });
      gsap.set(line2Split.chars, {
        opacity: 0,
        x: 36,
        rotateY: -72,
        rotateZ: 5,
        transformOrigin: "right center",
        filter: "blur(7px)",
      });
      gsap.set(tag1Split.words, {
        opacity: 0,
        y: 22,
        skewX: -10,
        filter: "blur(5px)",
      });
      gsap.set(tag2Split.words, {
        opacity: 0,
        y: 22,
        skewX: 10,
        filter: "blur(5px)",
      });
      gsap.set(ctaSplit.words, {
        opacity: 0,
        y: 28,
        scale: 0.82,
        rotateZ: -6,
      });
      gsap.set(capSplit.words, {
        opacity: 0,
        y: 16,
        rotateZ: -5,
        filter: "blur(5px)",
      });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      tl.set(kickerEl, { opacity: 1, transform: "none" }, 0.04)
        .to(
          kickerSplit.chars,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateZ: 0,
            filter: "blur(0px)",
            duration: 0.55,
            stagger: {
              each: 0.038,
              from: "random",
            },
            ease: "back.out(1.55)",
          },
          0.1,
        )
        .to(".bvc-step", { opacity: 0.55, y: 0, duration: 0.55 }, 0.15)
        .set(line1El, { opacity: 1, transform: "none" }, 0.17)
        .to(
          line1Split.chars,
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            rotateZ: 0,
            filter: "blur(0px)",
            duration: 0.78,
            stagger: {
              each: 0.034,
            },
            ease: "expo.out",
          },
          0.18,
        )
        .to(
          ".bvc-eye",
          {
            opacity: 1,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
          },
          0.35,
        )
        .set(line2El, { opacity: 1, transform: "none" }, 0.41)
        .to(
          line2Split.chars,
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            rotateZ: 0,
            filter: "blur(0px)",
            duration: 0.78,
            stagger: {
              each: 0.034,
            },
            ease: "expo.out",
          },
          0.42,
        )
        .set(tagRoot, { opacity: 1, transform: "none" }, 0.51)
        .to(
          tag1Split.words,
          {
            opacity: 1,
            y: 0,
            skewX: 0,
            filter: "blur(0px)",
            duration: 0.5,
            stagger: 0.075,
            ease: "power3.out",
          },
          0.52,
        )
        .to(
          tag2Split.words,
          {
            opacity: 1,
            y: 0,
            skewX: 0,
            filter: "blur(0px)",
            duration: 0.5,
            stagger: 0.075,
            ease: "power3.out",
          },
          0.6,
        )
        .set(ctaRoot, { opacity: 1, transform: "none" }, 0.61)
        .to(
          ctaSplit.words,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateZ: 0,
            duration: 0.58,
            stagger: {
              each: 0.09,
              from: "center",
            },
            ease: "back.out(1.35)",
          },
          0.62,
        )
        .set(capEl, { opacity: 1, transform: "none" }, 0.67)
        .to(
          capSplit.words,
          {
            opacity: 0.85,
            y: 0,
            rotateZ: 0,
            filter: "blur(0px)",
            duration: 0.55,
            stagger: {
              amount: 0.42,
              from: "center",
            },
            ease: "power2.inOut",
          },
          0.68,
        );

      const textSplits = [
        kickerSplit,
        line1Split,
        line2Split,
        tag1Split,
        tag2Split,
        ctaSplit,
        capSplit,
      ];

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      const floatTween = gsap.to(".bvc-eye-inner", {
        y: -4,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      const gradTween = grad
        ? gsap.to(grad, {
            backgroundPosition: "100% 50%",
            duration: 14,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          })
        : null;

      const shimmerTween = gsap.to(".bvc-shimmer", {
        opacity: 0.45,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      let patternDraw: gsap.core.Tween | undefined;
      let patternMarch: gsap.core.Tween | undefined;
      let patternDrift: gsap.core.Tween | undefined;
      const patternSvg = el.querySelector(".bvc-pattern-svg");
      if (patternSvg) {
        const drawEls = patternSvg.querySelectorAll<SVGGeometryElement>(
          ".bvc-path-draw",
        );
        drawEls.forEach((node) => {
          const len = node.getTotalLength?.() ?? 0;
          if (len > 0) {
            gsap.set(node, {
              strokeDasharray: len,
              strokeDashoffset: len,
            });
          }
        });
        patternDraw = gsap.to(drawEls, {
          strokeDashoffset: 0,
          duration: 1.45,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.18,
        });
        const marchEls =
          patternSvg.querySelectorAll<SVGGeometryElement>(".bvc-path-march");
        patternMarch = gsap.to(marchEls, {
          strokeDashoffset: "-=80",
          duration: 22,
          repeat: -1,
          ease: "none",
          delay: 0.65,
        });
        const driftRoot = patternSvg.querySelector(".bvc-pattern-root");
        if (driftRoot) {
          patternDrift = gsap.to(driftRoot, {
            x: 5,
            y: -4,
            duration: 14,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 0.4,
          });
        }
      }

      return () => {
        tl.kill();
        textSplits.forEach((s) => s.revert());
        floatTween.kill();
        gradTween?.kill();
        shimmerTween.kill();
        patternDraw?.kill();
        patternMarch?.kill();
        patternDrift?.kill();
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (shouldReduceMotion()) return;
      const el = root.current;
      if (!el) return;
      const pupil = el.querySelector<SVGGElement>(".eye-pupil-group");
      if (!pupil) return;

      let tx = 0;
      let ty = 0;
      let cx = 0;
      let cy = 0;
      let rafId = 0;
      let running = true;

      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        let nx = px * 22;
        let ny = py * 15;
        const maxMag = 17;
        const m = Math.hypot(nx, ny);
        if (m > maxMag && m > 0) {
          nx = (nx / m) * maxMag;
          ny = (ny / m) * maxMag;
        }
        tx = nx;
        ty = ny;
      };

      const tick = () => {
        if (!running) return;
        cx += (tx - cx) * 0.22;
        cy += (ty - cy) * 0.22;
        pupil.setAttribute("transform", `translate(${cx}, ${cy})`);
        rafId = requestAnimationFrame(tick);
      };

      el.addEventListener("mousemove", onMove, { passive: true });
      rafId = requestAnimationFrame(tick);

      return () => {
        running = false;
        cancelAnimationFrame(rafId);
        el.removeEventListener("mousemove", onMove);
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="prelude"
      className="relative flex min-h-[56dvh] flex-col overflow-hidden border-t border-[var(--border)] px-5 pb-10 pt-16 md:min-h-[58dvh] md:px-12 md:pb-12 md:pt-20"
    >
      <div
        ref={layer}
        className="pointer-events-none absolute inset-0 bg-[length:200%_100%] bg-no-repeat"
        style={{
          backgroundImage: "var(--bvc-cover-gradient)",
        }}
        aria-hidden
      />
      <div
        className="bvc-shimmer pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay dark:opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 85% 65% at 68% 38%, var(--bvc-shimmer-spot), transparent 72%)",
        }}
        aria-hidden
      />

      <p className="bvc-kicker relative z-10 text-center font-mono text-[12px] uppercase tracking-[0.42em] text-[var(--foreground)] md:text-[13px]">
        morphology.
      </p>
      <span className="bvc-step absolute right-5 top-16 font-mono text-[11px] tracking-widest text-[var(--muted)] md:right-12 md:top-20 md:text-xs">
        02 / 03
      </span>

      {/* Hero: stacked on mobile (see beyond / eye / the visible); horizontal row from md */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-x-clip overflow-y-visible px-2 py-8 sm:px-4 md:py-10">
        <div className="pointer-events-none absolute inset-0 z-0">
          <HeroLinePatterns className="mx-auto h-full max-h-[min(100%,26rem)] w-full" />
        </div>
        <div className="bvc-hero-type relative z-10 mx-auto flex w-full max-w-[min(100%,90rem)] flex-col items-center justify-center gap-4 sm:gap-5 [perspective:min(1100px,92vw)] [transform-style:preserve-3d] md:flex-row md:flex-nowrap md:gap-8 lg:gap-12">
          <h2 className="bvc-line1 w-full min-w-0 text-center font-display text-[clamp(1.05rem,5.5vw+0.5rem,2.75rem)] font-bold leading-tight tracking-[-0.02em] text-[var(--foreground)] [transform-style:preserve-3d] md:flex-1 md:whitespace-nowrap md:text-right md:text-[clamp(0.8rem,3.2vw+0.55rem,3.75rem)] md:leading-none">
            see beyond
          </h2>

          <div className="bvc-eye relative shrink-0 py-1 md:py-0 [transform:translateZ(24px)]">
            <div className="bvc-eye-inner will-change-transform">
              <EyeMark className="mx-auto w-[clamp(5.25rem,42vw,11rem)] text-[var(--foreground)] md:w-[clamp(4.5rem,26vw,18.5rem)]" />
            </div>
          </div>

          <h2 className="bvc-line2 w-full min-w-0 text-center font-display text-[clamp(1.05rem,5.5vw+0.5rem,2.75rem)] font-bold leading-tight tracking-[-0.02em] text-[var(--foreground)] [transform-style:preserve-3d] md:flex-1 md:whitespace-nowrap md:text-left md:text-[clamp(0.8rem,3.2vw+0.55rem,3.75rem)] md:leading-none">
            the visible
          </h2>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex w-full flex-shrink-0 flex-col gap-8 pb-8 pt-6 md:flex-row md:items-end md:justify-between md:gap-10 md:px-2 md:pb-10 md:pt-8">
        <div className="bvc-tag order-2 flex w-full justify-center md:order-1 md:max-w-[13rem] md:justify-start md:pb-0.5">
          <div className="flex flex-col items-center gap-2 text-center md:items-start md:gap-2.5 md:text-left">
            <p className="bvc-tag-line1 font-mono text-[11px] uppercase leading-snug tracking-[0.28em] text-[var(--foreground)] md:text-xs md:tracking-[0.32em]">
              light bends
            </p>
            <p className="bvc-tag-line2 font-mono text-[11px] uppercase leading-snug tracking-[0.28em] text-[var(--muted)] md:text-xs md:tracking-[0.32em]">
              meaning follows
            </p>
          </div>
        </div>

        <div className="order-1 flex w-full flex-col items-center gap-4 md:order-2 md:max-w-md md:flex-1 md:gap-5">
          <div className="bvc-cta flex w-full justify-center">
            <Link
              href="#about"
              className="group inline-flex flex-col items-center gap-2 font-display text-base font-medium tracking-wide text-[var(--foreground)] md:text-lg"
            >
              <span className="bvc-cta-words border-b-2 border-[var(--foreground)] pb-1 transition-colors group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                Discover words
              </span>
            </Link>
          </div>
          <p className="bvc-bottom-cap max-w-[22rem] text-center font-mono text-[10px] leading-relaxed uppercase tracking-[0.26em] text-[var(--muted)] md:text-[11px]">
            A pause before the essay
          </p>
        </div>

        <div className="order-3 hidden shrink-0 md:block md:w-[11rem]" aria-hidden />
      </div>
    </section>
  );
}
