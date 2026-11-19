"use client";
import { useEffect, useMemo, useState } from "react";
import { RelaxCard } from "@/components/RelaxCard";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { useRange } from "@/hooks/useRange";
import { addDays, dayName, dayShort, monthEnd, monthStart, todayJakarta, weekDays, weekStart } from "@/lib/dates";
import { fmtNum } from "@/lib/format";
import { averageScore, dayScore, isActive, planFor, targetProgress } from "@/lib/score";
import type { Habit, HabitLog, PlanItem } from "@/lib/types";

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const dayNum = (d: string) => Number(d.slice(8, 10));
const monthName = (d: string) => BULAN[Number(d.slice(5, 7)) - 1];

function rangeTitle(days: string[]): string {
  const [a, b] = [days[0], days[6]];
  return monthName(a) === monthName(b)
    ? `${dayNum(a)}–${dayNum(b)} ${monthName(b)}`
    : `${dayNum(a)} ${monthName(a)} – ${dayNum(b)} ${monthName(b)}`;
}

export default function MingguPage() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayJakarta()), []);
  if (!today) return <LoadingView />;
  return <Week today={today} />;
}

function Week({ today }: { today: string }) {
  const [monday, setMonday] = useState(weekStart(today));
  const [selected, setSelected] = useState(today);
  const days = useMemo(() => weekDays(monday), [monday]);
  const from = days[0] < monthStart(selected) ? days[0] : monthStart(selected);
  const to = days[6] > monthEnd(selected) ? days[6] : monthEnd(selected);
  const { data, error, reload, addPlan, removePlan } = useRange(from, to);

  const view = useMemo(() => {
    if (!data) return null;
    const { habits, logs, plans } = data;
    const scores = days.map((d) => (d <= today ? dayScore(planFor(d, habits, logs, plans)) : null));
    const items = planFor(selected, habits, logs, plans);
    const active = (p: Habit["period"]) => habits.filter((h) => h.period === p && isActive(h, selected));
    return { scores, items, weekly: active("weekly"), monthly: active("monthly") };
  }, [data, days, selected, today]);

  if (error) return <ErrorView onRetry={reload} />;
  if (!data || !view) return <LoadingView />;

  const goWeek = (delta: number) => {
    const next = addDays(monday, delta * 7);
    setMonday(next);
    setSelected(weekStart(today) === next ? today : next);
  };
  const thisWeek = weekStart(today) === monday;
  const avg = averageScore(view.scores);
  const scheduled = view.items.filter((i) => i.habit.period !== "daily");
  const dailyCount = view.items.length - scheduled.length;
  const isPast = selected < today;
  const plannedIds = new Set(view.items.map((i) => i.habit.id));
  const selLabel = `${dayName(selected)} ${dayNum(selected)} ${monthName(selected)}`;
  const targetProps = {
    logs: data.logs,
    date: selected,
    planned: plannedIds,
    disabled: isPast,
    dayShortLabel: dayShort(selected),
    dayLongLabel: dayName(selected),
    onAdd: (h: Habit) => addPlan(h.id, selected),
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-2 px-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-plum-soft">{rangeTitle(days)}</span>
          <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight">
            {thisWeek ? "Minggu Ini" : monday < today ? "Minggu Lalu" : "Minggu Depan"}
          </h1>
        </div>
        <div className="flex gap-1.5">
          <NavButton label="Minggu sebelumnya" dir="left" onClick={() => goWeek(-1)} />
          <NavButton label="Minggu berikutnya" dir="right" onClick={() => goWeek(1)} />
        </div>
      </header>
      {avg !== null && (
        <span className="tabular -mt-2 self-start rounded-full bg-mint px-3 py-1.5 text-[13px] font-extrabold text-mint-ink">
          Rata-rata {avg}
        </span>
      )}

      <div className="grid grid-cols-7 gap-1.5 rounded-panel bg-plum p-3.5">
        {days.map((d, i) => {
          const on = d === selected;
          const score = view.scores[i];
          const dot = score === null ? (on ? "bg-butter" : "bg-plum-muted") : score >= 80 ? "bg-lime" : "bg-tangerine-soft";
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              aria-label={`${dayName(d)} ${dayNum(d)} ${monthName(d)}${score === null ? "" : `, skor ${score}`}`}
              onClick={() => setSelected(d)}
              className={`flex flex-col items-center gap-1.5 rounded-full py-2.5 ${on ? "bg-sun text-plum" : "bg-plum-raised text-on-plum"} ${d === today && !on ? "ring-2 ring-sun/60" : ""}`}
            >
              <span className="text-[11px] font-extrabold">{dayShort(d)}</span>
              <span className="font-display text-lg font-bold leading-none">{dayNum(d)}</span>
              <span className={`tabular flex h-[26px] w-[26px] items-center justify-center rounded-full text-[10px] font-extrabold text-plum ${dot}`}>
                {score ?? ""}
              </span>
            </button>
          );
        })}
      </div>

      <section aria-label={`Jadwal ${selLabel}`} className="flex flex-col gap-2 rounded-panel bg-lilac p-3">
        <div className="flex items-baseline justify-between px-2 pt-1">
          <h2 className="font-display text-xl font-bold">
            {selected === today ? `Hari ini, ${dayName(selected)} ${dayNum(selected)}` : `${dayName(selected)} ${dayNum(selected)}`}
          </h2>
          {dailyCount > 0 && <span className="text-xs font-bold text-lilac-ink">+ {dailyCount} rutin harian</span>}
        </div>
        {view.items.length === 0 ? (
          <RelaxCard />
        ) : scheduled.length === 0 ? (
          <p className="px-2 pb-1 text-sm font-semibold text-plum-soft">Cuma rutin harian. Jadwalkan target dari bawah kalau mau.</p>
        ) : (
          scheduled.map((i) => <PlanRow key={i.habit.id} item={i} past={isPast} onRemove={() => removePlan(i.habit.id, selected)} />)
        )}
      </section>

      <TargetList title="Target minggu ini" tint="bg-peach" habits={view.weekly} {...targetProps} />
      <TargetList title="Target bulan ini" tint="bg-mint" habits={view.monthly} {...targetProps} />
    </div>
  );
}

function PlanRow({ item, past, onRemove }: { item: PlanItem; past: boolean; onRemove: () => void }) {
  const manual = item.source === "manual";
  const source = item.source === "routine" ? "Dari rutinitas" : manual ? "Dijadwalin manual" : "Dikerjain di luar jadwal";
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-row bg-paper px-3 py-2.5">
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${item.done ? "bg-tangerine" : item.source === "routine" ? "bg-mint" : "bg-peach"}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B2350" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          {item.done ? (
            <path d="M5 12.5l4.5 4.5L19 7" />
          ) : item.source === "routine" ? (
            <path d="M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 1 0 1 6" />
          ) : (
            <path d="M12 5v14M5 12h14" />
          )}
        </svg>
      </span>
      <div className="flex flex-1 flex-col">
        <span className="font-extrabold">{item.habit.name}</span>
        <span className="text-xs font-semibold text-plum-soft">{past ? (item.done ? "Beres" : "Belum") : source}</span>
      </div>
      {manual && !past && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Hapus ${item.habit.name} dari jadwal`}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-track text-plum"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

function TargetList({
  title,
  tint,
  habits,
  logs,
  date,
  planned,
  disabled,
  dayShortLabel,
  dayLongLabel,
  onAdd,
}: {
  title: string;
  tint: string;
  habits: Habit[];
  logs: HabitLog[];
  date: string;
  planned: Set<string>;
  disabled: boolean;
  dayShortLabel: string;
  dayLongLabel: string;
  onAdd: (h: Habit) => void;
}) {
  if (habits.length === 0) return null;
  return (
    <section className={`flex flex-col gap-2 rounded-panel p-3 ${tint}`}>
      <h2 className="px-2 pt-1 font-display text-xl font-bold">{title}</h2>
      {habits.map((h) => {
        const p = targetProgress(h, date, logs);
        const pct = Math.min(100, (100 * p.done) / p.target);
        const isPlanned = planned.has(h.id);
        return (
          <div key={h.id} className="flex items-center gap-3 rounded-row bg-paper px-3 py-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="font-extrabold">{h.name}</span>
              <div className="flex items-center gap-2.5">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-track">
                  <span className={`block h-2 rounded-full ${p.reached ? "bg-lime" : "bg-tangerine"}`} style={{ width: `${pct}%` }} />
                </span>
                <span className={`tabular whitespace-nowrap text-xs font-extrabold ${p.reached ? "text-mint-ink" : "text-plum-soft"}`}>
                  {fmtNum(p.done)} dari {fmtNum(p.target)}
                  {h.unit ? ` ${h.unit}` : ""}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAdd(h)}
              disabled={disabled || isPlanned}
              aria-label={`Jadwalkan ${h.name} ke ${dayLongLabel}`}
              className="h-11 flex-none whitespace-nowrap rounded-full bg-butter px-3.5 text-xs font-extrabold text-plum ring-2 ring-track disabled:opacity-45"
            >
              {isPlanned ? "Terjadwal" : `+ ${dayShortLabel}`}
            </button>
          </div>
        );
      })}
    </section>
  );
}

function NavButton({ label, dir, onClick }: { label: string; dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-plum ring-2 ring-track"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}
