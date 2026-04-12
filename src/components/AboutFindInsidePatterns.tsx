/** Stipple + horizontal ruling — distinct from bio diagonals and the work square grid. */

const VW = 900;
const VH = 720;

export function AboutFindInsidePatterns() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="about-find-float-a absolute inset-0 h-full w-full text-[var(--border-strong)] opacity-[0.32] dark:opacity-[0.26]"
        viewBox={`0 0 ${VW} ${VH}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="about-find-dots"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="0.9" fill="currentColor" opacity="0.55" />
            <circle cx="13" cy="13" r="0.65" fill="currentColor" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#about-find-dots)" />
      </svg>

      <svg
        className="about-find-float-b absolute inset-0 h-full w-full text-[var(--border-strong)] opacity-[0.22] dark:opacity-[0.18]"
        viewBox={`0 0 ${VW} ${VH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="currentColor" strokeLinecap="round" opacity="0.85">
          {Array.from({ length: 18 }, (_, i) => {
            const y = 28 + i * 38;
            return (
              <path
                key={`h-${i}`}
                d={`M 0 ${y} L ${VW} ${y}`}
                strokeWidth="0.4"
                strokeOpacity={0.35 + (i % 3) * 0.08}
                strokeDasharray={i % 2 === 0 ? "5 14" : "2 10"}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
