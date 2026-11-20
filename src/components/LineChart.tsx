// Weekly averages for a month on a fixed 0–100 scale, with a faint grid and labeled points.
const W = 294;
const H = 150;
const LEFT = 30;
const RIGHT = 264;
const TOP = 30;
const BOTTOM = 120;

const y = (v: number) => BOTTOM - ((BOTTOM - TOP) * v) / 100;

export function LineChart({ points }: { points: { label: string; value: number | null }[] }) {
  const step = points.length > 1 ? (RIGHT - LEFT) / (points.length - 1) : 0;
  const xs = points.map((_, i) => LEFT + i * step);
  const real = points.map((p, i) => ({ ...p, x: xs[i] })).filter((p): p is { label: string; value: number; x: number } => p.value !== null);
  const line = real.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${y(p.value)}`).join(" ");
  const area = real.length > 1 ? `${line} L${real[real.length - 1].x} ${BOTTOM} L${real[0].x} ${BOTTOM} Z` : "";
  const label = points.map((p) => `${p.label}: ${p.value ?? "belum ada"}`).join(", ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="mx-auto block">
      {[0, 50, 100].map((v) => (
        <line key={v} x1={16} x2={W - 16} y1={y(v)} y2={y(v)} stroke="#F1EBDD" strokeWidth="1" />
      ))}
      {area && <path d={area} fill="#FFE1CC" />}
      {real.length > 1 && <path d={line} stroke="#FF7A2F" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {real.map((p, i) => {
        const last = i === real.length - 1;
        return (
          <g key={p.label}>
            <circle cx={p.x} cy={y(p.value)} r={last ? 7 : 5} fill={last ? "#1F2A3D" : "#FFFFFF"} stroke={last ? "none" : "#FF7A2F"} strokeWidth="3" />
            <text x={p.x} y={y(p.value) - 12} textAnchor="middle" fill="#1F2A3D" fontSize="12" fontWeight="800">
              {p.value}
            </text>
          </g>
        );
      })}
      {points.map((p, i) => (
        <text key={p.label} x={xs[i]} y={H - 8} textAnchor="middle" fill="#5B6577" fontSize="11" fontWeight="700">
          {p.label}
        </text>
      ))}
    </svg>
  );
}
