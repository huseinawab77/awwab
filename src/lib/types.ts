export type Period = "daily" | "weekly" | "monthly";
export type Kind = "check" | "qty";

export interface Habit {
  id: string;
  name: string;
  kind: Kind;
  period: Period;
  unit: string | null;
  /** qty only: target for one day/session */
  dayTarget: number | null;
  /** qty only: how much the + button adds */
  step: number | null;
  /** weekly/monthly only: target for the whole week/month */
  periodTarget: number | null;
  /** weekly/monthly only: ISO weekdays (Mon=1 … Sun=7) that plan it automatically */
  routineDays: number[];
  sort: number;
  startOn: string;
  archivedOn: string | null;
}

export type NewHabit = Omit<Habit, "id">;

export interface HabitLog {
  habitId: string;
  date: string;
  done: boolean;
  value: number | null;
}

export interface PlanEntry {
  habitId: string;
  date: string;
}

export type Source = "daily" | "routine" | "manual" | "logged";

export interface PlanItem {
  habit: Habit;
  source: Source;
  /** 0..1 */
  credit: number;
  done: boolean;
  value: number | null;
  over: boolean;
}

export interface Settings {
  showQuote: boolean;
  lastQuoteOn: string | null;
  displayName: string | null;
}
