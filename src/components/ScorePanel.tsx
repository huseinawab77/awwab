import { Mascot } from "./Mascot";
import { formatLong } from "@/lib/dates";
import { DOW_SHORT } from "@/lib/format";
import type { PlanItem } from "@/lib/types";

export interface WeekPill {
  date: string;
  score: number | null;
  selectable: boolean;
}

export function statusLine(items: PlanItem[], isToday: boolean): string {
  if (items.length === 0) return "Belum ada rencana";
  const done = items.filter((i) => i.done).length;
  if (done === items.length) return isToday ? "Semua beres hari ini. Mantap!" : "Semua beres hari itu. Mantap!";
  if (done === 0 && isToday) return `${items.length} kebiasaan menunggu, yuk mulai`;
  return `${done} dari ${items.length} beres, tinggal ${items.length - done} lagi`;
}

const CONFETTI = ["#FF7A2F", "#FFE59A", "#B8E04A", "#FFFFFF", "#FFB98F"];
const RING = 2 * Math.PI * 17;

/** The day's score on the dark panel with the cat, then the week as seven score rings. */
export function ScorePanel({
  score,
  items,
  isToday,
  week,
  selected,
  onPick,
}: {
  score: number | null;
  items: PlanItem[];
  isToday: boolean;
  week: WeekPill[];
  selected: string;
  onPick: (date: string) => void;
}) {
  const full = score === 100;
  return (
    <>
      <section aria-label="Skor" className="relative flex flex-col gap-3.5 overflow-hidden rounded-panel bg-ink p-[18px] text-butter">
        <div className="flex items-end justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1.5 pb-1">
            <span className="text-sm text-on-ink">{isToday ? "Skor hari ini" : "Skor hari itu"}</span>
            <div className="flex items-baseline gap-1.5">
              <span
                data-testid="score"
                className="tabular font-display text-[72px] font-medium leading-[0.9] tracking-[-0.05em] text-sun"
              >
                {score ?? "–"}
              </span>
              <span className="text-base text-on-ink">/100</span>
            </div>
            <span className="text-[15px] font-medium">{statusLine(items, isToday)}</span>
          </div>
          <Mascot score={score} size={132} className="-mb-5 -mr-2 -mt-3 flex-none" />
        </div>
        {items.length > 0 && (
          <div
            role="img"
            aria-label={`Skor ${score ?? 0} dari 100`}
            className="relative h-2.5 overflow-hidden rounded-full bg-ink-raised"
          >
            <div
              className={`h-2.5 rounded-full transition-[width] duration-300 ease-out ${full ? "bg-lime" : "bg-tangerine"}`}
              style={{ width: `${score ?? 0}%` }}
            />
          </div>
        )}
        {full && isToday && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {Array.from({ length: 14 }, (_, k) => (
              <span
                key={k}
                className="confetti"
                style={{ left: `${6 + k * 6.6}%`, background: CONFETTI[k % 5], animationDelay: `${(k % 5) * 60}ms` }}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-7 gap-1 px-0.5">
        {week.map((p, i) => {
          const on = p.date === selected;
          const has = p.score !== null;
          const frac = has ? (p.score as number) / 100 : 0;
          const label = `${formatLong(p.date)}${has ? `, skor ${p.score}` : ""}`;
          return (
            <button
              key={p.date}
              type="button"
              disabled={!p.selectable}
              aria-label={label}
              aria-pressed={on}
              onClick={() => onPick(p.date)}
              className="press flex flex-col items-center gap-1 py-0.5 disabled:cursor-default"
            >
              <span className={`text-xs ${on ? "font-semibold text-ink" : "text-muted"}`}>{DOW_SHORT[i]}</span>
              <span className={`relative flex h-10 w-10 items-center justify-center rounded-full ${on ? "bg-ink" : ""}`}>
                <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="absolute inset-0 -rotate-90">
                  <circle cx="20" cy="20" r="17" fill="none" stroke={on ? "#2C3647" : "#EDE3C8"} strokeWidth="3.5" />
                  {has && (
                    <circle
                      cx="20"
                      cy="20"
                      r="17"
                      fill="none"
                      stroke={(p.score as number) >= 80 ? "#7FB82E" : "#FF7A2F"}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={`${(RING * frac).toFixed(1)} ${RING.toFixed(1)}`}
                    />
                  )}
                </svg>
                <span className={`tabular relative text-xs font-semibold ${on ? "text-butter" : "text-ink"}`}>{has ? p.score : ""}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
