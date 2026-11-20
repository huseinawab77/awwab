"use client";
import { Plus, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HabitRow } from "@/components/HabitRow";
import { RelaxCard } from "@/components/RelaxCard";
import { ScorePanel, type WeekPill } from "@/components/ScorePanel";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { TimerSheet } from "@/components/TimerSheet";
import { AddToTodaySheet, ValueSheet } from "@/components/TodaySheets";
import { useRange } from "@/hooks/useRange";
import { addDays, formatLong, formatShort, monthEnd, monthStart, todayJakarta, weekDays, weekStart } from "@/lib/dates";
import { fmtNum } from "@/lib/format";
import { dayScore, isActive, planFor, targetProgress } from "@/lib/score";
import { getStore } from "@/lib/store";
import type { Habit, PlanItem } from "@/lib/types";

const BACK_DAYS = 7;

export default function HariIniPage() {
  // "Today" comes from the device clock in WIB, so it is read after mount.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayJakarta()), []);
  if (!today) return <LoadingView />;
  return <Today today={today} />;
}

function Today({ today }: { today: string }) {
  const [date, setDate] = useState(today);
  const [name, setName] = useState<string | null>(null);
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [timing, setTiming] = useState<PlanItem | null>(null);

  const from = weekStart(date) < monthStart(date) ? weekStart(date) : monthStart(date);
  const weekEnd = weekDays(date)[6];
  const to = weekEnd > monthEnd(date) ? weekEnd : monthEnd(date);
  const { data, error, reload, setLog, addPlan } = useRange(from, to);

  useEffect(() => {
    getStore()
      .getSettings()
      .then((s) => setName(s.displayName))
      .catch(() => undefined);
  }, []);

  const minDate = addDays(today, -BACK_DAYS);
  const isToday = date === today;

  const view = useMemo(() => {
    if (!data) return null;
    const { habits, logs, plans } = data;
    const items = planFor(date, habits, logs, plans);
    const week: WeekPill[] = weekDays(date).map((d) => ({
      date: d,
      score: d <= today ? dayScore(planFor(d, habits, logs, plans)) : null,
      selectable: d <= today && d >= minDate,
    }));
    const planned = new Set(items.map((i) => i.habit.id));
    const candidates = habits.filter((h) => h.period !== "daily" && isActive(h, date) && !planned.has(h.id));
    return { items, week, candidates, score: dayScore(items) };
  }, [data, date, today, minDate]);

  if (error) return <ErrorView onRetry={reload} />;
  if (!data || !view) return <LoadingView />;

  const progress = (h: Habit) => {
    if (h.period === "daily") return undefined;
    const p = targetProgress(h, date, data.logs);
    const unit = h.kind === "qty" && h.unit ? ` ${h.unit}` : "";
    return `${h.period === "weekly" ? "minggu ini" : "bulan ini"} ${fmtNum(p.done)} dari ${fmtNum(p.target)}${unit}`;
  };
  const toggle = (i: PlanItem) =>
    i.habit.kind === "check"
      ? setLog(i.habit.id, date, { done: !i.done })
      : setLog(i.habit.id, date, { value: i.done ? 0 : i.habit.dayTarget });
  const step = (i: PlanItem, delta: number) =>
    setLog(i.habit.id, date, { value: Math.max(0, Math.round(((i.value ?? 0) + delta) * 100) / 100) });

  const scheduled = view.items.filter((i) => i.habit.period !== "daily");
  const daily = view.items.filter((i) => i.habit.period === "daily");
  const row = (i: PlanItem) => (
    <HabitRow
      key={i.habit.id}
      item={i}
      progress={progress(i.habit)}
      onToggle={() => toggle(i)}
      onStep={(d) => step(i, d)}
      onEdit={() => setEditing(i)}
      extra={
        i.habit.kind === "qty" && i.habit.unit === "menit" ? (
          <button
            type="button"
            onClick={() => setTiming(i)}
            aria-label={`Timer ${i.habit.name}`}
            className="press flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-sky text-sky-ink"
          >
            <Timer size={20} aria-hidden="true" />
          </button>
        ) : undefined
      }
    />
  );

  return (
    <div className="flex flex-col gap-3.5">
      <header className="flex items-end justify-between gap-2 px-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-muted">{formatLong(date)}</span>
          <h1 className="font-display text-[32px] font-medium leading-tight tracking-[-0.035em]">
            {name ? `Halo, ${name}` : "Halo"}
          </h1>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Hari sebelumnya"
            disabled={date <= minDate}
            onClick={() => setDate(addDays(date, -1))}
            className="press flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-line bg-paper text-ink disabled:opacity-35"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Hari berikutnya"
            disabled={isToday}
            onClick={() => setDate(addDays(date, 1))}
            className="press flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-line bg-paper text-ink disabled:opacity-35"
          >
            <Chevron dir="right" />
          </button>
        </div>
      </header>

      {!isToday && (
        <button
          type="button"
          onClick={() => setDate(today)}
          className="self-start rounded-full bg-sun px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Kembali ke hari ini
        </button>
      )}

      <ScorePanel
        score={view.score}
        items={view.items}
        isToday={isToday}
        week={view.week}
        selected={date}
        onPick={setDate}
      />

      {view.items.length === 0 && <RelaxCard />}

      <section aria-labelledby="jadwal" className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between px-1 pt-1.5">
          <h2 id="jadwal" className="font-display text-xl font-medium tracking-[-0.02em]">
            {isToday ? "Jadwal hari ini" : `Jadwal ${formatShort(date)}`}
          </h2>
          {scheduled.length > 0 && (
            <span className="tabular text-sm text-muted">
              {scheduled.filter((i) => i.done).length} dari {scheduled.length}
            </span>
          )}
        </div>
        {scheduled.map(row)}
        {scheduled.length === 0 && (
          <p className="px-1 text-sm text-muted">Belum ada kebiasaan mingguan atau bulanan di sini.</p>
        )}
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label={isToday ? "Tambah ke hari ini" : `Tambah ke ${formatShort(date)}`}
          className="press flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-[#D9CDAE] text-[15px] font-medium text-ink"
        >
          <Plus size={18} aria-hidden="true" />
          {isToday ? "Tambah ke hari ini" : `Tambah ke ${formatShort(date)}`}
        </button>
      </section>

      {daily.length > 0 && (
        <section aria-labelledby="harian" className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between px-1 pt-1.5">
            <h2 id="harian" className="font-display text-xl font-medium tracking-[-0.02em]">
              Rutin harian
            </h2>
            <span className="tabular text-sm text-muted">
              {daily.filter((i) => i.done).length} dari {daily.length}
            </span>
          </div>
          {daily.map(row)}
        </section>
      )}

      <ValueSheet
        habit={editing?.habit ?? null}
        value={editing?.value ?? null}
        dayLabel={isToday ? "hari ini" : formatShort(date)}
        onSave={(v) => editing && setLog(editing.habit.id, date, { value: v })}
        onClose={() => setEditing(null)}
      />
      <TimerSheet
        habit={timing?.habit ?? null}
        date={date}
        current={view.items.find((i) => i.habit.id === timing?.habit.id)?.value ?? 0}
        otherName={(id) => data.habits.find((h) => h.id === id)?.name ?? null}
        onFinish={(v) => timing && setLog(timing.habit.id, date, { value: v })}
        onClose={() => setTiming(null)}
      />
      <AddToTodaySheet
        open={adding}
        candidates={view.candidates}
        onPick={(h) => addPlan(h.id, date)}
        onClose={() => setAdding(false)}
      />
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
