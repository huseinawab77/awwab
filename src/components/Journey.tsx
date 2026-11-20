import { dayName } from "@/lib/dates";

// A winding path with a stop per day (Mon–Thu across the top, Fri–Sun back along the bottom) and a finish flag.
const POS = [
  [40, 44],
  [110, 44],
  [180, 44],
  [250, 44],
  [220, 124],
  [150, 124],
  [80, 124],
] as const;
const PATH = "M40 44 H250 Q272 44 272 84 Q272 124 250 124 H60 Q40 124 40 150 V176";
const SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type Tone = "lime" | "soft" | "empty";
const tone = (s: number | null): Tone => (s === null ? "empty" : s >= 80 ? "lime" : "soft");
const FILL: Record<Tone, string> = {
  lime: "bg-lime",
  soft: "bg-tangerine-soft",
  empty: "bg-paper border-2 border-dashed border-on-ink",
};

export function Journey({ days, today }: { days: { date: string; score: number | null }[]; today: string }) {
  const label = days.map((d) => `${dayName(d.date)} ${d.score ?? "belum"}`).join(", ");
  return (
    <div role="img" aria-label={label} className="relative mx-auto h-[220px] w-[294px] rounded-[22px] bg-butter">
      <svg width="294" height="220" viewBox="0 0 294 220" aria-hidden="true" className="absolute inset-0">
        <path d={PATH} stroke="#DCE9F7" strokeWidth="22" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={PATH} stroke="#FFFFFF" strokeWidth="3" strokeDasharray="2 9" fill="none" strokeLinecap="round" />
        <rect x="36" y="168" width="4" height="34" rx="2" fill="#1F2A3D" />
        <path d="M40 170 L62 177 L40 184 Z" fill="#FF7A2F" />
        <circle cx="236" cy="186" r="10" fill="#B8E04A" />
        <circle cx="254" cy="192" r="7" fill="#B8E04A" />
      </svg>
      {days.map((d, i) => {
        const t = tone(d.score);
        const isToday = d.date === today;
        return (
          <div
            key={d.date}
            data-testid="stop"
            data-tone={t}
            data-today={isToday ? "true" : undefined}
            className="absolute flex w-10 flex-col items-center gap-0.5"
            style={{ left: POS[i][0] - 20, top: POS[i][1] - 17 }}
          >
            <span
              className={`tabular flex h-[34px] w-[34px] items-center justify-center rounded-full text-[11px] font-semibold text-ink ${FILL[t]} ${isToday ? "ring-[3px] ring-ink" : ""}`}
            >
              {d.score ?? ""}
            </span>
            <span className="rounded-md bg-butter px-1 text-[11px] font-semibold text-muted">{SHORT[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
