import type { Habit, HabitLog, NewHabit, PlanEntry, Settings } from "../types";

export interface RangeData {
  habits: Habit[];
  logs: HabitLog[];
  plans: PlanEntry[];
}

export interface ExportDump {
  habits: Habit[];
  logs: HabitLog[];
  plans: PlanEntry[];
  notes: { month: string; body: string }[];
  settings: Settings;
}

/** Everything the screens read or write. Every method throws on failure. */
export interface DataStore {
  loadRange(from: string, to: string): Promise<RangeData>;
  upsertLog(habitId: string, date: string, patch: { done?: boolean; value?: number | null }): Promise<void>;
  addPlan(habitId: string, date: string): Promise<void>;
  removePlan(habitId: string, date: string): Promise<void>;

  listHabits(): Promise<Habit[]>;
  createHabits(list: NewHabit[]): Promise<Habit[]>;
  updateHabit(id: string, patch: Partial<NewHabit>): Promise<void>;
  archiveHabit(id: string, on: string): Promise<void>;
  restoreHabit(id: string): Promise<void>;
  swapSort(a: Habit, b: Habit): Promise<void>;

  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<void>;
  getMonthNote(month: string): Promise<string>;
  saveMonthNote(month: string, body: string): Promise<void>;
  exportAll(): Promise<ExportDump>;
}
