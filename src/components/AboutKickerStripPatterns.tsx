/** Ultra-light top band — short vertical ticks (distinct from grids and diagonals). */

const W = 800;
const H = 120;

export function AboutKickerStripPatterns() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.22] dark:opacity-[0.18]"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full text-[var(--border-strong)]"
        viewBox={`0 0 ${W} ${H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <g stroke="currentColor" strokeLinecap="round" strokeWidth="0.35">
          {Array.from({ length: 42 }, (_, i) => {
            const x = 8 + i * 19;
            const h = 18 + (i % 5) * 6;
            return (
              <path
                key={`t-${i}`}
                d={`M ${x} ${(H - h) / 2} L ${x} ${(H + h) / 2}`}
                strokeOpacity={0.25 + (i % 4) * 0.06}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
