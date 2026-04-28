"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { registerGsapPlugins, shouldReduceMotion } from "@/lib/gsap-plugins";

type AboutVillageLandscapeProps = {
  variant?: "band" | "full";
  className?: string;
};

export function AboutVillageLandscape({
  variant = "band",
  className,
}: AboutVillageLandscapeProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;
      const el = root.current;
      if (!el) return;

      const walkers = el.querySelectorAll<HTMLElement>("[data-walker]");
      if (walkers.length === 0) return;

      walkers.forEach((node, i) => {
        const dur = 14 + (i % 3) * 6 + i * 1.5;
        const delay = i * 1.2;
        const y = Number(node.dataset.y ?? "0");
        const scale = Number(node.dataset.scale ?? "1");
        gsap.set(node, { xPercent: -120, y, scale, opacity: 0.65 });
        gsap.to(node, {
          xPercent: 140,
          duration: dur,
          delay,
          repeat: -1,
          ease: "none",
        });
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={`pointer-events-none absolute z-0 select-none ${
        variant === "full"
          ? "inset-0"
          : "inset-x-0 bottom-0 h-[min(34vw,220px)]"
      } ${className ?? ""}`}
      aria-hidden
    >
      {/* Soft atmospheric wash */}
      <div
        className="absolute inset-0 opacity-[0.55] dark:opacity-[0.38]"
        style={{
          background:
            "radial-gradient(ellipse 85% 60% at 25% 40%, color-mix(in oklab, var(--accent) 12%, transparent) 0%, transparent 62%), radial-gradient(ellipse 80% 55% at 80% 20%, color-mix(in oklab, #2563eb 8%, transparent) 0%, transparent 58%)",
        }}
      />

      {/* Landscape (ink-like lines) */}
      <svg
        viewBox="0 0 1200 260"
        className="absolute inset-x-0 bottom-0 h-[min(38vh,320px)] w-full md:h-[min(44vh,360px)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        <g className="text-[color-mix(in_oklab,var(--foreground)_26%,transparent)] dark:text-[color-mix(in_oklab,var(--foreground)_34%,transparent)]">
          {/* Distant ridge */}
          <path
            d="M0 148 C 120 120, 220 154, 330 132 C 440 110, 520 128, 620 118 C 740 106, 820 132, 920 120 C 1040 106, 1120 122, 1200 114"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.55"
          />
          {/* Mid ridge */}
          <path
            d="M0 176 C 140 162, 240 196, 360 176 C 470 156, 560 178, 680 168 C 820 156, 920 186, 1040 172 C 1120 162, 1160 168, 1200 166"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.75"
          />
          {/* Foreground ground line */}
          <path
            d="M0 214 C 160 220, 260 206, 420 214 C 560 222, 700 214, 840 220 C 980 226, 1080 214, 1200 218"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* A few village marks (huts/trees) */}
          <path
            d="M180 198 l18 -18 l18 18 M192 180 v20"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M920 192 l16 -14 l16 14 M928 178 v18"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.65"
          />
          <path
            d="M560 196 c0 -14 18 -18 18 -30 c0 12 18 16 18 30 c0 12 -36 12 -36 0z"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.55"
          />
        </g>

        {/* Subtle “ink fill” under the horizon */}
        <path
          d="M0 260V206C140 220 240 204 420 214C560 224 700 214 840 220C980 226 1080 214 1200 218V260H0Z"
          fill="color-mix(in oklab, var(--foreground) 6%, transparent)"
          opacity="0.9"
        />
      </svg>

      {/* Walkers (tiny silhouettes) */}
      <div className="absolute inset-0">
        <span
          data-walker
          data-y="0"
          data-scale="0.9"
          className="absolute left-0 bottom-[18%] h-6 w-6 text-[color-mix(in_oklab,var(--foreground)_42%,transparent)] dark:text-[color-mix(in_oklab,var(--foreground)_48%,transparent)]"
        >
          <Walker />
        </span>
        <span
          data-walker
          data-y="2"
          data-scale="0.75"
          className="absolute left-0 bottom-[15%] h-6 w-6 text-[color-mix(in_oklab,var(--foreground)_34%,transparent)] dark:text-[color-mix(in_oklab,var(--foreground)_40%,transparent)]"
        >
          <Walker />
        </span>
        <span
          data-walker
          data-y="-1"
          data-scale="0.65"
          className="absolute left-0 bottom-[17%] h-6 w-6 text-[color-mix(in_oklab,var(--foreground)_30%,transparent)] dark:text-[color-mix(in_oklab,var(--foreground)_36%,transparent)]"
        >
          <Walker />
        </span>
      </div>
    </div>
  );
}

function Walker() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden>
      <path
        d="M12 6.2a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M10.3 21.6l1.3-6.1-2.2-2.8 1.2-3.9c.2-.7.9-1.2 1.6-1.2h.9c.6 0 1.2.3 1.5.9l1.4 2.7 2.3 1.3-.8 1.5-2.7-1.4-1-1.8-.8 2.5 2 2.4-1.1 5.9h-1.7l.9-4.6-1.8-2.1-.9 4.7h-1.6Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M7.7 21.7l2.6-6.1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

