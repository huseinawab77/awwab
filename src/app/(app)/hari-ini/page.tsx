"use client";
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
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-lilac text-lilac-ink"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2M9 2h6" />
            </svg>
          </button>
        ) : undefined
      }
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-2 px-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-plum-soft">{formatLong(date)}</span>
          <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight">
            {name ? `Halo, ${name}` : "Halo"}
          </h1>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Hari sebelumnya"
            disabled={date <= minDate}
            onClick={() => setDate(addDays(date, -1))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-plum ring-2 ring-track disabled:opacity-40"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Hari berikutnya"
            disabled={isToday}
            onClick={() => setDate(addDays(date, 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-plum ring-2 ring-track disabled:opacity-40"
          >
            <Chevron dir="right" />
          </button>
        </div>
      </header>

      {!isToday && (
        <button
          type="button"
          onClick={() => setDate(today)}
          className="self-start rounded-full bg-sun px-4 py-2.5 text-sm font-extrabold text-plum"
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

      <section aria-labelledby="jadwal" className="flex flex-col gap-2 rounded-panel bg-lilac p-3">
        <div className="flex items-baseline justify-between px-2 pt-1">
          <h2 id="jadwal" className="font-display text-xl font-bold">
            {isToday ? "Jadwal hari ini" : `Jadwal ${formatShort(date)}`}
          </h2>
          {scheduled.length > 0 && (
            <span className="tabular text-[13px] font-bold text-lilac-ink">
              {scheduled.filter((i) => i.done).length} dari {scheduled.length}
            </span>
          )}
        </div>
        {scheduled.map(row)}
        {scheduled.length === 0 && (
          <p className="px-2 pb-1 text-sm font-semibold text-plum-soft">Belum ada kebiasaan mingguan atau bulanan di sini.</p>
        )}
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label={isToday ? "Tambah ke hari ini" : `Tambah ke ${formatShort(date)}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-row border-2 border-dashed border-lilac-ink/40 text-sm font-extrabold text-lilac-ink"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          {isToday ? "Tambah ke hari ini" : `Tambah ke ${formatShort(date)}`}
        </button>
      </section>

      {daily.length > 0 && (
        <section aria-labelledby="harian" className="flex flex-col gap-2 rounded-panel bg-mint p-3">
          <div className="flex items-baseline justify-between px-2 pt-1">
            <h2 id="harian" className="font-display text-xl font-bold">
              Rutin harian
            </h2>
            <span className="tabular text-[13px] font-bold text-mint-ink">
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
