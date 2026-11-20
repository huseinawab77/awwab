// localStorage-backed store for local UI tests (NEXT_PUBLIC_DEMO=1). Same contract as Supabase.
import { isHabitColor, isHabitIcon, suggestLook } from "../habitIcons";
import type { Habit, HabitLog, NewHabit, PlanEntry, Settings } from "../types";
import type { DataStore, ExportDump } from "./types";

const KEY = "awwab:demo-db";

interface Db {
  habits: Habit[];
  logs: HabitLog[];
  plans: PlanEntry[];
  notes: { month: string; body: string }[];
  settings: Settings;
  failNext?: number;
}

const empty = (): Db => ({
  habits: [],
  logs: [],
  plans: [],
  notes: [],
  settings: { showQuote: true, lastQuoteOn: null, displayName: null },
});

function read(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const db = { ...empty(), ...JSON.parse(raw) } as Db;
    // Older demo data has no icon/colour: give each habit the look its name suggests.
    db.habits = db.habits.map((h) => (isHabitIcon(h.icon) && isHabitColor(h.color) ? h : { ...h, ...suggestLook(h.name) }));
    return db;
  } catch {
    return empty();
  }
}

function write(db: Db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

/** Simulates the network being down when the browser is offline. */
function guard() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) throw new Error("offline");
}

const bySort = (a: Habit, b: Habit) => a.sort - b.sort;

export function createMemoryStore(): DataStore {
  return {
    async loadRange(from, to) {
      guard();
      const db = read();
      return {
        habits: [...db.habits].sort(bySort),
        logs: db.logs.filter((l) => l.date >= from && l.date <= to),
        plans: db.plans.filter((p) => p.date >= from && p.date <= to),
      };
    },
    async upsertLog(habitId, date, patch) {
      guard();
      const db = read();
      const i = db.logs.findIndex((l) => l.habitId === habitId && l.date === date);
      const base: HabitLog = i >= 0 ? db.logs[i] : { habitId, date, done: false, value: null };
      const next = { ...base, ...patch };
      if (i >= 0) db.logs[i] = next;
      else db.logs.push(next);
      write(db);
    },
    async addPlan(habitId, date) {
      guard();
      const db = read();
      if (!db.plans.some((p) => p.habitId === habitId && p.date === date)) db.plans.push({ habitId, date });
      write(db);
    },
    async removePlan(habitId, date) {
      guard();
      const db = read();
      db.plans = db.plans.filter((p) => !(p.habitId === habitId && p.date === date));
      write(db);
    },
    async listHabits() {
      guard();
      return [...read().habits].sort(bySort);
    },
    async createHabits(list: NewHabit[]) {
      guard();
      const db = read();
      const created = list.map((h) => ({ ...h, id: crypto.randomUUID() }));
      db.habits.push(...created);
      write(db);
      return created;
    },
    async updateHabit(id, patch) {
      guard();
      const db = read();
      db.habits = db.habits.map((h) => (h.id === id ? { ...h, ...patch } : h));
      write(db);
    },
    async archiveHabit(id, on) {
      await this.updateHabit(id, { archivedOn: on });
    },
    async restoreHabit(id) {
      await this.updateHabit(id, { archivedOn: null });
    },
    async swapSort(a, b) {
      guard();
      const db = read();
      db.habits = db.habits.map((h) => (h.id === a.id ? { ...h, sort: b.sort } : h.id === b.id ? { ...h, sort: a.sort } : h));
      write(db);
    },
    async getSettings() {
      guard();
      return read().settings;
    },
    async updateSettings(patch) {
      guard();
      const db = read();
      db.settings = { ...db.settings, ...patch };
      write(db);
    },
    async getMonthNote(month) {
      guard();
      return read().notes.find((n) => n.month === month)?.body ?? "";
    },
    async saveMonthNote(month, body) {
      guard();
      const db = read();
      db.notes = [...db.notes.filter((n) => n.month !== month), { month, body }];
      write(db);
    },
    async exportAll(): Promise<ExportDump> {
      const db = read();
      return { habits: db.habits, logs: db.logs, plans: db.plans, notes: db.notes, settings: db.settings };
    },
  };
}
