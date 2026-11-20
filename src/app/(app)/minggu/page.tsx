"use client";
import { Check, Plus, X } from "lucide-react";
import { HabitIcon } from "@/components/HabitIcon";
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
          <span className="text-sm text-muted">{rangeTitle(days)}</span>
          <h1 className="font-display text-[32px] font-medium leading-tight tracking-[-0.035em]">
            {thisWeek ? "Minggu Ini" : monday < today ? "Minggu Lalu" : "Minggu Depan"}
          </h1>
        </div>
        <div className="flex gap-1.5">
          <NavButton label="Minggu sebelumnya" dir="left" onClick={() => goWeek(-1)} />
          <NavButton label="Minggu berikutnya" dir="right" onClick={() => goWeek(1)} />
        </div>
      </header>
      {avg !== null && (
        <span className="tabular -mt-2 self-start rounded-full bg-mint px-3 py-1.5 text-[13px] font-semibold text-mint-ink">
          Rata-rata {avg}
        </span>
      )}

      <div className="grid grid-cols-7 gap-[5px]">
        {days.map((d, i) => {
          const on = d === selected;
          const score = view.scores[i];
          const dot = score === null ? "bg-transparent" : score >= 80 ? "bg-lime" : "bg-tangerine-soft";
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              aria-label={`${dayName(d)} ${dayNum(d)} ${monthName(d)}${score === null ? "" : `, skor ${score}`}`}
              onClick={() => setSelected(d)}
              className={`press flex h-[84px] flex-col items-center justify-center gap-1 rounded-2xl ${on ? "bg-ink text-butter" : "bg-paper text-ink shadow-card"} ${d === today && !on ? "ring-2 ring-ink" : ""}`}
            >
              <span className="text-xs opacity-80">{dayShort(d)}</span>
              <span className="tabular font-display text-lg font-semibold leading-none">{dayNum(d)}</span>
              <span className={`tabular flex h-[18px] min-w-[26px] items-center justify-center rounded-full px-1 text-[11px] font-semibold text-ink ${dot}`}>
                {score ?? ""}
              </span>
            </button>
          );
        })}
      </div>

      <section aria-label={`Jadwal ${selLabel}`} className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between px-1 pt-1.5">
          <h2 className="font-display text-xl font-medium">
            {selected === today ? `Hari ini, ${dayName(selected)} ${dayNum(selected)}` : `${dayName(selected)} ${dayNum(selected)}`}
          </h2>
          {dailyCount > 0 && <span className="text-sm text-muted">+ {dailyCount} rutin harian</span>}
        </div>
        {view.items.length === 0 ? (
          <RelaxCard />
        ) : scheduled.length === 0 ? (
          <p className="rounded-row border-[1.5px] border-dashed border-[#D9CDAE] p-4 text-center text-[15px] text-muted">Cuma rutin harian. Jadwalkan target dari bawah kalau mau.</p>
        ) : (
          scheduled.map((i) => <PlanRow key={i.habit.id} item={i} past={isPast} onRemove={() => removePlan(i.habit.id, selected)} />)
        )}
      </section>

      <TargetList title="Target minggu ini" habits={view.weekly} {...targetProps} />
      <TargetList title="Target bulan ini" habits={view.monthly} {...targetProps} />
    </div>
  );
}

function PlanRow({ item, past, onRemove }: { item: PlanItem; past: boolean; onRemove: () => void }) {
  const manual = item.source === "manual";
  const source = item.source === "routine" ? "Dari rutinitas" : manual ? "Dijadwalin manual" : "Dikerjain di luar jadwal";
  return (
    <div className="flex min-h-[68px] items-center gap-3 rounded-row bg-paper p-2.5 shadow-card">
      <HabitIcon icon={item.habit.icon} color={item.habit.color} />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className={`font-semibold ${item.done ? "text-muted line-through decoration-2" : ""}`}>{item.habit.name}</span>
        <span className="text-[13px] text-muted">{past ? (item.done ? "Beres" : "Belum") : source}</span>
      </div>
      {manual && !past && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Hapus ${item.habit.name} dari jadwal`}
          className="press flex h-11 w-11 items-center justify-center rounded-[14px] text-muted"
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function TargetList({
  title,
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
    <section className="flex flex-col gap-2">
      <h2 className="px-1 pt-1.5 font-display text-xl font-medium tracking-[-0.02em]">{title}</h2>
      {habits.map((h) => {
        const p = targetProgress(h, date, logs);
        const pct = Math.min(100, (100 * p.done) / p.target);
        const isPlanned = planned.has(h.id);
        return (
          <div key={h.id} className="flex min-h-[68px] items-center gap-3 rounded-row bg-paper p-2.5 shadow-card">
            <HabitIcon icon={h.icon} color={h.color} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="font-semibold">{h.name}</span>
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
                  <span className={`block h-1.5 rounded-full ${p.reached ? "bg-leaf" : "bg-tangerine"}`} style={{ width: `${pct}%` }} />
                </span>
                <span className={`whitespace-nowrap text-[13px] ${p.reached ? "font-semibold text-mint-ink" : "text-muted"}`}>
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
              className={`press flex h-11 flex-none items-center gap-1 whitespace-nowrap rounded-[14px] px-3 text-sm font-semibold ${isPlanned ? "bg-mint text-mint-ink" : "border-[1.5px] border-line bg-paper text-ink disabled:opacity-40"}`}
            >
              {isPlanned ? <Check size={16} strokeWidth={2.6} aria-hidden="true" /> : <Plus size={16} strokeWidth={2.4} aria-hidden="true" />}
              {isPlanned ? "Terjadwal" : dayShortLabel}
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
      className="press flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-line bg-paper text-ink"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}
