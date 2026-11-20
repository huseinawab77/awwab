import type { TimeOfDay } from "@/lib/quotes";

/** Flat sky + hills for the quote screen; the palette and the sun/moon follow the time of day. */
export const SCENE: Record<
  TimeOfDay,
  { sky: string; orb: string; cloud: string; back: string; front: string; ground: string; dark: boolean }
> = {
  pagi: { sky: "#FFDDB8", orb: "#FF9F4A", cloud: "#FFF4E6", back: "#F6C48C", front: "#EFAE6E", ground: "#FFF4D6", dark: false },
  siang: { sky: "#CDE5F5", orb: "#FFD45A", cloud: "#FFFFFF", back: "#B9DDA9", front: "#8CC583", ground: "#FFF4D6", dark: false },
  sore: { sky: "#FFBF98", orb: "#FF7A2F", cloud: "#FFE1CC", back: "#E8A07A", front: "#C9785A", ground: "#FFF4D6", dark: false },
  malam: { sky: "#22304A", orb: "#FFF0C2", cloud: "#2C3A55", back: "#2A3750", front: "#33415C", ground: "#172030", dark: true },
};

const ORB: Record<TimeOfDay, { x: number; y: number; r: number }> = {
  pagi: { x: 300, y: 128, r: 34 },
  siang: { x: 296, y: 72, r: 30 },
  sore: { x: 286, y: 158, r: 40 },
  malam: { x: 300, y: 82, r: 26 },
};

const STARS = [
  [250, 30, 1.5], [360, 26, 1.4], [372, 132, 1.1], [236, 120, 1.6], [214, 70, 1.2], [340, 150, 1.3],
  [150, 150, 1], [110, 176, 1.4], [40, 170, 1.2], [290, 176, 1],
] as const;

function Cloud({ x, y, s, fill, delay }: { x: number; y: number; s: number; fill: string; delay: string }) {
  return (
    <g className="sky-drift" style={{ animationDelay: delay }}>
      <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
        <rect x={0} y={10} width={84} height={22} rx={11} />
        <circle cx={28} cy={12} r={14} />
        <circle cx={50} cy={8} r={17} />
      </g>
    </g>
  );
}

export function SkyScene({ time }: { time: TimeOfDay }) {
  const c = SCENE[time];
  const o = ORB[time];
  return (
    <svg viewBox="0 0 390 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className="block h-full w-full">
      <rect width={390} height={300} fill={c.sky} />
      {time === "malam" &&
        STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#FFF4D6" className="sky-twinkle" style={{ animationDelay: `${(i % 5) * 0.5}s` }} />
        ))}
      <circle cx={o.x} cy={o.y} r={o.r + 18} fill={c.orb} opacity={0.22} className="sky-glow" />
      <circle cx={o.x} cy={o.y} r={o.r} fill={c.orb} />
      {time === "malam" && <circle cx={o.x + 11} cy={o.y - 7} r={o.r - 2} fill={c.sky} />}
      {time !== "malam" ? (
        <>
          <Cloud x={150} y={150} s={0.9} fill={c.cloud} delay="0s" />
          <Cloud x={232} y={20} s={0.6} fill={c.cloud} delay="-3s" />
          {time === "pagi" && (
            <g stroke="#9E3F0C" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.7}>
              <path d="M214 196 q5 -5 10 0 q5 -5 10 0" />
              <path d="M240 182 q4 -4 8 0 q4 -4 8 0" />
            </g>
          )}
        </>
      ) : (
        <Cloud x={160} y={150} s={0.8} fill={c.cloud} delay="-2s" />
      )}
      <path d="M0 214 Q92 168 196 204 T390 188 V300 H0Z" fill={c.back} />
      <path d="M0 252 Q118 212 236 246 T390 236 V300 H0Z" fill={c.front} />
      <path d="M0 284 Q195 262 390 284 V300 H0Z" fill={c.ground} />
    </svg>
  );
}
