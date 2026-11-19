import { Cat } from "./Cat";
import { EnergyBar } from "./EnergyBar";
import { formatLong } from "@/lib/dates";
import type { PlanItem } from "@/lib/types";

const LETTERS = ["S", "S", "R", "K", "J", "S", "M"];

export interface WeekPill {
  date: string;
  score: number | null;
  selectable: boolean;
}

export function statusLine(items: PlanItem[], isToday: boolean): string {
  if (items.length === 0) return "Belum ada rencana";
  const done = items.filter((i) => i.done).length;
  if (done === items.length) return isToday ? "Semua beres hari ini. Mantap." : "Semua beres hari itu. Mantap.";
  return `${done} dari ${items.length} beres, tinggal ${items.length - done} lagi`;
}

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
  return (
    <section aria-label="Skor" className="flex flex-col gap-3.5 rounded-panel bg-plum px-[18px] pb-4 pt-[18px] text-paper">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-on-plum">{isToday ? "Skor hari ini" : "Skor hari itu"}</span>
          <div className="flex items-baseline gap-1.5">
            <span data-testid="score" className="tabular font-display text-[56px] font-extrabold leading-none tracking-tight text-sun">
              {score ?? "–"}
            </span>
            <span className="text-[15px] font-bold text-on-plum">/ 100</span>
          </div>
          <span className="text-sm font-bold">{statusLine(items, isToday)}</span>
        </div>
        <Cat score={score} variant="head" size={112} className="-mr-1 -mt-1 flex-none" />
      </div>
      {items.length > 0 && <EnergyBar items={items} />}
      <div className="grid grid-cols-7 gap-1.5">
        {week.map((p, i) => {
          const on = p.date === selected;
          const dot =
            p.score === null ? (on ? "bg-butter" : "bg-plum-muted") : p.score >= 80 ? "bg-lime" : "bg-tangerine-soft";
          const label = `${formatLong(p.date)}${p.score === null ? "" : `, skor ${p.score}`}`;
          return (
            <button
              key={p.date}
              type="button"
              disabled={!p.selectable}
              aria-label={label}
              aria-pressed={on}
              onClick={() => onPick(p.date)}
              className={`flex flex-col items-center gap-1 rounded-full py-[7px] disabled:cursor-default ${on ? "bg-sun" : "bg-plum-raised"}`}
            >
              <span className={`text-xs font-extrabold ${on ? "text-plum" : "text-on-plum"}`}>{LETTERS[i]}</span>
              <span className={`tabular flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-extrabold text-plum ${dot}`}>
                {p.score ?? ""}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
