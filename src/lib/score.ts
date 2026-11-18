// The heart of AWWAB: what is planned on a day, and how well it went.
// Pure functions only; every screen computes from the same rules.
import { isoDow, monthEnd, monthStart, weekDays, weekStart } from "./dates";
import type { Habit, HabitLog, PlanEntry, PlanItem, Source } from "./types";

export function isActive(h: Habit, d: string): boolean {
  return h.startOn <= d && (h.archivedOn === null || h.archivedOn > d);
}

function logOf(logs: HabitLog[], habitId: string, d: string): HabitLog | undefined {
  return logs.find((l) => l.habitId === habitId && l.date === d);
}

function touched(log: HabitLog | undefined): boolean {
  return !!log && (log.done || (log.value ?? 0) > 0);
}

export function credit(h: Habit, log?: HabitLog): number {
  if (!log) return 0;
  if (h.kind === "check") return log.done ? 1 : 0;
  const target = h.dayTarget ?? 0;
  if (target <= 0) return 0;
  return Math.min((log.value ?? 0) / target, 1);
}

function sourceFor(h: Habit, d: string, logs: HabitLog[], plans: PlanEntry[]): Source | null {
  if (h.period === "daily") return "daily";
  if (h.routineDays.includes(isoDow(d))) return "routine";
  if (plans.some((p) => p.habitId === h.id && p.date === d)) return "manual";
  if (touched(logOf(logs, h.id, d))) return "logged";
  return null;
}

export function planFor(d: string, habits: Habit[], logs: HabitLog[], plans: PlanEntry[]): PlanItem[] {
  const items: PlanItem[] = [];
  for (const h of habits) {
    if (!isActive(h, d)) continue;
    const source = sourceFor(h, d, logs, plans);
    if (!source) continue;
    const log = logOf(logs, h.id, d);
    const c = credit(h, log);
    items.push({
      habit: h,
      source,
      credit: c,
      done: c >= 1,
      value: log?.value ?? null,
      over: h.kind === "qty" && (log?.value ?? 0) > (h.dayTarget ?? Infinity),
    });
  }
  const rank = (i: PlanItem) => (i.habit.period === "daily" ? 1 : 0);
  return items.sort((a, b) => rank(a) - rank(b) || a.habit.sort - b.habit.sort);
}

export function dayScore(items: PlanItem[]): number | null {
  if (items.length === 0) return null;
  const sum = items.reduce((s, i) => s + i.credit, 0);
  return Math.round((100 * sum) / items.length);
}

export function averageScore(scores: (number | null)[]): number | null {
  const real = scores.filter((s): s is number => s !== null);
  if (real.length === 0) return null;
  return Math.round(real.reduce((a, b) => a + b, 0) / real.length);
}

/** The week (Mon–Sun) or calendar month containing d, for weekly/monthly habits. Daily → the day itself. */
export function periodRange(h: Habit, d: string): [string, string] {
  if (h.period === "weekly") {
    const days = weekDays(d);
    return [weekStart(d), days[6]];
  }
  if (h.period === "monthly") return [monthStart(d), monthEnd(d)];
  return [d, d];
}

export function targetProgress(
  h: Habit,
  d: string,
  logs: HabitLog[],
): { done: number; target: number; reached: boolean } {
  const [from, to] = periodRange(h, d);
  const inRange = logs.filter((l) => l.habitId === h.id && l.date >= from && l.date <= to);
  const done =
    h.kind === "check"
      ? inRange.filter((l) => l.done).length
      : inRange.reduce((s, l) => s + (l.value ?? 0), 0);
  const target = h.periodTarget ?? h.dayTarget ?? 1;
  return { done, target, reached: done >= target };
}

type Stat = { habit: Habit; done: number; of: number };

/** Best and worst daily habit over the given days (pass only days up to today). */
export function habitConsistency(
  habits: Habit[],
  days: string[],
  logs: HabitLog[],
): { best: Stat | null; worst: Stat | null } {
  const stats: Stat[] = [];
  for (const h of habits) {
    if (h.period !== "daily") continue;
    const active = days.filter((d) => isActive(h, d));
    if (active.length < 3) continue;
    const done = active.filter((d) => credit(h, logOf(logs, h.id, d)) >= 1).length;
    stats.push({ habit: h, done, of: active.length });
  }
  if (stats.length === 0) return { best: null, worst: null };
  const ratio = (s: Stat) => s.done / s.of;
  const bySort = (a: Stat, b: Stat) => a.habit.sort - b.habit.sort;
  const best = [...stats].sort((a, b) => ratio(b) - ratio(a) || bySort(a, b))[0];
  const worst = [...stats].sort((a, b) => ratio(a) - ratio(b) || bySort(a, b))[0];
  return {
    best: ratio(best) > 0 ? best : null,
    worst: worst !== best && ratio(worst) < 1 && ratio(worst) < ratio(best) ? worst : null,
  };
}
