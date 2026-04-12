/** Background motifs for Flashback — diagonal hatch + light frame strokes + soft vignette (aligned with About bio patterns). */

const VW = 1200;
const VH = 800;

export function AboutFlashbackPatterns() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Fine diagonal hatch */}
      <svg
        className="absolute inset-0 h-full w-full text-[var(--border-strong)] opacity-[0.32] dark:opacity-[0.24]"
        viewBox={`0 0 ${VW} ${VH}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="flashback-hatch"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <path
              d="M0 20 L20 0"
              stroke="currentColor"
              strokeWidth="0.45"
              strokeOpacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#flashback-hatch)" />
      </svg>

      {/* Corner brackets + dashed “timeline” curves */}
      <svg
        className="absolute inset-0 h-full w-full text-[var(--border-strong)] opacity-[0.22] dark:opacity-[0.18]"
        viewBox={`0 0 ${VW} ${VH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="currentColor" strokeLinecap="round">
          <path
            d="M 72 108 L 72 52 L 188 52"
            strokeWidth="0.7"
            strokeOpacity="0.42"
          />
          <path
            d="M 1128 692 L 1148 692 L 1148 548 L 1088 548"
            strokeWidth="0.7"
            strokeOpacity="0.42"
          />
          <path
            d="M 160 640 C 380 560 620 520 1040 620"
            strokeWidth="0.45"
            strokeOpacity="0.36"
            strokeDasharray="6 14"
          />
          <path
            d="M 880 140 L 980 240 L 920 360"
            strokeWidth="0.4"
            strokeOpacity="0.32"
            strokeDasharray="5 11"
          />
        </g>
      </svg>

      {/* Vignette so content stays readable */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_90%_75%_at_50%_42%,transparent_0%,color-mix(in_oklab,var(--background)_88%,var(--foreground))_100%)] opacity-[0.92] dark:bg-[radial-gradient(ellipse_95%_70%_at_50%_38%,transparent_0%,rgba(0,0,0,0.5)_100%)] dark:opacity-100"
        aria-hidden
      />
      {/* Subtle accent wash */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[color-mix(in_oklab,var(--accent)_7%,transparent)] via-transparent to-[color-mix(in_oklab,var(--foreground)_5%,transparent)] opacity-80 dark:from-[color-mix(in_oklab,var(--accent)_12%,transparent)] dark:via-transparent dark:to-black/25 dark:opacity-95"
        aria-hidden
      />
    </div>
  );
}
