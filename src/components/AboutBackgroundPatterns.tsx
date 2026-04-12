/** Strict grid of evenly spaced square frames for the About page (SVG + CSS motion). */

const VIEW_W = 900;
const VIEW_H = 700;
const PAD = 44;
const SQUARE = 36;
const GAP = 32;
const STEP = SQUARE + GAP;

function fits(x: number, y: number) {
  return x >= PAD && y >= PAD && x + SQUARE <= VIEW_W - PAD && y + SQUARE <= VIEW_H - PAD;
}

function buildGrid(offsetX: number, offsetY: number) {
  const rects: { x: number; y: number; key: string }[] = [];
  for (let y = offsetY; fits(offsetX, y); y += STEP) {
    for (let x = offsetX; fits(x, y); x += STEP) {
      rects.push({ x, y, key: `${x}-${y}` });
    }
  }
  return rects;
}

/** Center the first full grid in the viewBox. */
function firstOrigin() {
  const innerW = VIEW_W - 2 * PAD;
  const innerH = VIEW_H - 2 * PAD;
  const cols = Math.max(1, Math.floor((innerW + GAP) / STEP));
  const rows = Math.max(1, Math.floor((innerH + GAP) / STEP));
  const usedW = cols * SQUARE + (cols - 1) * GAP;
  const usedH = rows * SQUARE + (rows - 1) * GAP;
  return {
    x: PAD + (innerW - usedW) / 2,
    y: PAD + (innerH - usedH) / 2,
  };
}

/** Square grid — use behind the “Where I’ve worked” block only. */
export function AboutExperiencePatterns() {
  const o = firstOrigin();
  const primary = buildGrid(o.x, o.y);

  const off = STEP / 2;
  const secondary = buildGrid(o.x + off, o.y + off).filter((r) => fits(r.x, r.y));

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="about-pattern-float-a absolute inset-0 h-full w-full text-[var(--border-strong)] opacity-[0.38] dark:opacity-[0.3]"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="currentColor" strokeLinejoin="miter">
          {primary.map(({ x, y, key }) => (
            <rect
              key={key}
              x={x}
              y={y}
              width={SQUARE}
              height={SQUARE}
              strokeWidth="0.55"
              strokeOpacity="0.5"
            />
          ))}
        </g>
      </svg>

      <svg
        className="about-pattern-float-b absolute inset-0 h-full w-full text-[var(--border-strong)] opacity-[0.28] dark:opacity-[0.22]"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="currentColor" strokeLinejoin="miter">
          {secondary.map(({ x, y, key }) => (
            <rect
              key={`b-${key}`}
              x={x}
              y={y}
              width={SQUARE}
              height={SQUARE}
              strokeWidth="0.45"
              strokeOpacity="0.42"
              strokeDasharray="4 5"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
