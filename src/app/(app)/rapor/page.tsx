"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Cat } from "@/components/Cat";
import { HabitIcon } from "@/components/HabitIcon";
import { ConsistencyCards } from "@/components/ConsistencyCards";
import { Journey } from "@/components/Journey";
import { LineChart } from "@/components/LineChart";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { useRange } from "@/hooks/useRange";
import { addDays, formatMonth, monthDays, monthStart, todayJakarta, weekDays } from "@/lib/dates";
import { fmtNum, trendText } from "@/lib/format";
import { averageScore, dayScore, habitConsistency, isActive, planFor, targetProgress, weeklyAverages } from "@/lib/score";
import { getStore } from "@/lib/store";
import type { Habit, HabitLog } from "@/lib/types";

type Mode = "week" | "month";

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const dayNum = (d: string) => Number(d.slice(8, 10));
const monthName = (d: string) => BULAN[Number(d.slice(5, 7)) - 1];

function weekTitle(days: string[]): string {
  const [a, b] = [days[0], days[6]];
  return monthName(a) === monthName(b)
    ? `${dayNum(a)}–${dayNum(b)} ${monthName(b)}`
    : `${dayNum(a)} ${monthName(a)} – ${dayNum(b)} ${monthName(b)}`;
}

export default function RaporPage() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayJakarta()), []);
  if (!today) return <LoadingView />;
  return <Report today={today} />;
}

function Report({ today }: { today: string }) {
  const [mode, setMode] = useState<Mode>("week");
  // Any date inside the period being viewed.
  const [anchor, setAnchor] = useState(today);

  const days = useMemo(() => (mode === "week" ? weekDays(anchor) : monthDays(anchor)), [mode, anchor]);
  const prevDays = useMemo(
    () => (mode === "week" ? weekDays(addDays(days[0], -7)) : monthDays(addDays(days[0], -1))),
    [mode, days],
  );
  const { data, error, reload } = useRange(prevDays[0], days[days.length - 1]);

  const view = useMemo(() => {
    if (!data) return null;
    const { habits, logs, plans } = data;
    const cache = new Map<string, number | null>();
    const scoreOf = (d: string) => {
      if (d > today) return null;
      if (!cache.has(d)) cache.set(d, dayScore(planFor(d, habits, logs, plans)));
      return cache.get(d) ?? null;
    };
    const upToToday = days.filter((d) => d <= today);
    const period = mode === "week" ? "weekly" : "monthly";
    return {
      scoreOf,
      avg: averageScore(days.map(scoreOf)),
      prevAvg: averageScore(prevDays.map(scoreOf)),
      consistency: habitConsistency(habits, upToToday, logs),
      targets: habits.filter((h) => h.period === period && days.some((d) => isActive(h, d))),
    };
  }, [data, days, prevDays, mode, today]);

  if (error) return <ErrorView onRetry={reload} />;
  if (!data || !view) return <LoadingView />;

  const isCurrent = days.includes(today);
  const go = (delta: number) =>
    setAnchor(mode === "week" ? addDays(days[0], delta * 7) : delta < 0 ? addDays(days[0], -1) : addDays(days[days.length - 1], 1));
  const switchMode = (m: Mode) => {
    setMode(m);
    setAnchor(today);
  };
  const trend = trendText(view.avg, view.prevAvg, mode);
  const periodLabel = `${mode === "week" ? "minggu" : "bulan"} ${isCurrent ? "ini" : "itu"}`;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-2 px-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-muted">{mode === "week" ? weekTitle(days) : formatMonth(days[0])}</span>
          <h1 className="font-display text-[32px] font-medium leading-tight tracking-[-0.035em]">Rapor</h1>
        </div>
        <div className="flex gap-1.5">
          <NavButton label={mode === "week" ? "Minggu sebelumnya" : "Bulan sebelumnya"} dir="left" onClick={() => go(-1)} />
          <NavButton
            label={mode === "week" ? "Minggu berikutnya" : "Bulan berikutnya"}
            dir="right"
            onClick={() => go(1)}
            disabled={isCurrent}
          />
        </div>
      </header>

      <div role="radiogroup" aria-label="Periode rapor" className="grid grid-cols-2 gap-1 rounded-full bg-track p-1">
        {(["week", "month"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => switchMode(m)}
            className={`h-11 rounded-full text-sm font-semibold ${mode === m ? "bg-ink text-butter" : "text-muted"}`}
          >
            {m === "week" ? "Minggu" : "Bulan"}
          </button>
        ))}
      </div>

      <section aria-label="Rata-rata skor" className="flex items-center gap-4 rounded-panel bg-ink p-5 text-butter">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-sm text-on-ink">Rata-rata {periodLabel}</span>
          <span data-testid="average" className="tabular font-display text-[56px] font-medium leading-none">
            {view.avg ?? "–"}
          </span>
          {view.avg === null ? (
            <span className="text-sm font-semibold text-on-ink">Belum ada skor di periode ini</span>
          ) : (
            trend && (
              <span className="tabular mt-1 self-start whitespace-nowrap rounded-full bg-sun px-3 py-1 text-[13px] font-semibold text-ink">
                {trend}
              </span>
            )
          )}
        </div>
        <Cat score={view.avg} variant="head" size={92} className="flex-none" />
      </section>

      <section className="flex flex-col gap-3 rounded-panel bg-paper p-4 shadow-card">
        <h2 className="px-1 font-display text-xl font-medium">{mode === "week" ? "Perjalanan seminggu" : "Rata-rata per minggu"}</h2>
        {mode === "week" ? (
          <Journey days={days.map((d) => ({ date: d, score: view.scoreOf(d) }))} today={today} />
        ) : (
          <LineChart points={weeklyAverages(days, view.scoreOf)} />
        )}
      </section>

      <ConsistencyCards {...view.consistency} />

      <Targets title={mode === "week" ? "Target minggu ini" : "Target bulan ini"} habits={view.targets} logs={data.logs} date={days[0]} />

      {mode === "month" && <MonthNote key={days[0]} month={monthStart(days[0])} />}
    </div>
  );
}

function Targets({ title, habits, logs, date }: { title: string; habits: Habit[]; logs: HabitLog[]; date: string }) {
  if (habits.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 pt-1.5 font-display text-xl font-medium tracking-[-0.02em]">{title}</h2>
      {habits.map((h) => {
        const p = targetProgress(h, date, logs);
        const pct = Math.min(100, (100 * p.done) / p.target);
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
          </div>
        );
      })}
    </section>
  );
}

type NoteStatus = "loading" | "idle" | "saving" | "saved" | "error";

/** Free-text note for the month; saves itself 800ms after typing stops, and on leaving the month. */
function MonthNote({ month }: { month: string }) {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<NoteStatus>("loading");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    getStore()
      .getMonthNote(month)
      .then((b) => {
        if (!alive) return;
        setBody(b);
        setStatus("idle");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [month]);

  // Flush an unsaved note when the month changes or the tab is left.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (pending.current !== null) void getStore().saveMonthNote(month, pending.current).catch(() => undefined);
    },
    [month],
  );

  const save = (text: string) => {
    if (timer.current) clearTimeout(timer.current);
    pending.current = null;
    setStatus("saving");
    getStore()
      .saveMonthNote(month, text)
      .then(() => setStatus("saved"))
      .catch(() => {
        pending.current = text;
        setStatus("error");
      });
  };

  const onChange = (text: string) => {
    setBody(text);
    pending.current = text;
    setStatus("idle");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(text), 800);
  };

  const statusText =
    status === "saving" ? "Menyimpan…" : status === "saved" ? "Tersimpan" : status === "error" ? "Belum tersimpan, coba lagi" : "";

  return (
    <section className="flex flex-col gap-2 rounded-panel bg-paper p-4 shadow-card">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <label htmlFor="month-note" className="font-display text-xl font-medium">
          Catatan bulan ini
        </label>
        <span role="status" className={`text-xs font-bold ${status === "error" ? "text-tangerine-ink" : "text-muted"}`}>
          {statusText}
        </span>
      </div>
      <textarea
        id="month-note"
        value={body}
        disabled={status === "loading"}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => pending.current !== null && save(pending.current)}
        placeholder="Apa yang jalan bagus bulan ini? Apa yang mau diubah?"
        rows={5}
        maxLength={5000}
        className="w-full resize-y rounded-2xl border-[1.5px] border-line bg-butter/40 p-4 text-base font-medium text-ink placeholder:text-muted/70 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ink"
      />
    </section>
  );
}

function NavButton({
  label,
  dir,
  onClick,
  disabled,
}: {
  label: string;
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="press flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-line bg-paper text-ink disabled:opacity-35"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}
