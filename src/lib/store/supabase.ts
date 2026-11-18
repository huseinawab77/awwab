// Supabase-backed store. Rows are scoped by RLS; user_id defaults to auth.uid() on insert.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Habit, HabitLog, NewHabit, PlanEntry, Settings } from "../types";
import type { DataStore, ExportDump } from "./types";

type HabitRow = {
  id: string;
  name: string;
  kind: Habit["kind"];
  period: Habit["period"];
  unit: string | null;
  day_target: number | string | null;
  step: number | string | null;
  period_target: number | string | null;
  routine_days: number[] | null;
  sort: number;
  start_on: string;
  archived_on: string | null;
};
type LogRow = { habit_id: string; date: string; done: boolean; value: number | string | null };
type PlanRow = { habit_id: string; date: string };

// Postgres numeric can come back as a string.
const num = (v: number | string | null): number | null => (v === null ? null : Number(v));

const toHabit = (r: HabitRow): Habit => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
  period: r.period,
  unit: r.unit,
  dayTarget: num(r.day_target),
  step: num(r.step),
  periodTarget: num(r.period_target),
  routineDays: r.routine_days ?? [],
  sort: r.sort,
  startOn: r.start_on,
  archivedOn: r.archived_on,
});

const toRow = (h: Partial<NewHabit>) => {
  const row: Record<string, unknown> = {};
  if (h.name !== undefined) row.name = h.name.trim();
  if (h.kind !== undefined) row.kind = h.kind;
  if (h.period !== undefined) row.period = h.period;
  if (h.unit !== undefined) row.unit = h.unit;
  if (h.dayTarget !== undefined) row.day_target = h.dayTarget;
  if (h.step !== undefined) row.step = h.step;
  if (h.periodTarget !== undefined) row.period_target = h.periodTarget;
  if (h.routineDays !== undefined) row.routine_days = h.routineDays;
  if (h.sort !== undefined) row.sort = h.sort;
  if (h.startOn !== undefined) row.start_on = h.startOn;
  if (h.archivedOn !== undefined) row.archived_on = h.archivedOn;
  return row;
};

const toLog = (r: LogRow): HabitLog => ({ habitId: r.habit_id, date: r.date, done: r.done, value: num(r.value) });
const toPlan = (r: PlanRow): PlanEntry => ({ habitId: r.habit_id, date: r.date });

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/** Like check, for list queries: no rows → []. */
function rows<T>(res: { data: T[] | null; error: { message: string } | null }): T[] {
  return check(res) ?? [];
}

const HABIT_COLS = "id,name,kind,period,unit,day_target,step,period_target,routine_days,sort,start_on,archived_on";

export function createSupabaseStore(sb: SupabaseClient): DataStore {
  return {
    async loadRange(from, to) {
      const [h, l, p] = await Promise.all([
        sb.from("habits").select(HABIT_COLS).order("sort"),
        sb.from("habit_logs").select("habit_id,date,done,value").gte("date", from).lte("date", to),
        sb.from("plan_entries").select("habit_id,date").gte("date", from).lte("date", to),
      ]);
      return {
        habits: rows(h).map((r) => toHabit(r as HabitRow)),
        logs: rows(l).map((r) => toLog(r as LogRow)),
        plans: rows(p).map((r) => toPlan(r as PlanRow)),
      };
    },
    async upsertLog(habitId, date, patch) {
      const row: Record<string, unknown> = { habit_id: habitId, date };
      if (patch.done !== undefined) row.done = patch.done;
      if (patch.value !== undefined) row.value = patch.value;
      check(await sb.from("habit_logs").upsert(row, { onConflict: "habit_id,date" }));
    },
    async addPlan(habitId, date) {
      check(await sb.from("plan_entries").upsert({ habit_id: habitId, date }, { onConflict: "habit_id,date", ignoreDuplicates: true }));
    },
    async removePlan(habitId, date) {
      check(await sb.from("plan_entries").delete().eq("habit_id", habitId).eq("date", date));
    },
    async listHabits() {
      return rows(await sb.from("habits").select(HABIT_COLS).order("sort")).map((r) => toHabit(r as HabitRow));
    },
    async createHabits(list) {
      if (list.length === 0) return [];
      const data = check(await sb.from("habits").insert(list.map(toRow)).select(HABIT_COLS));
      return (data as HabitRow[]).map(toHabit).sort((a, b) => a.sort - b.sort);
    },
    async updateHabit(id, patch) {
      check(await sb.from("habits").update(toRow(patch)).eq("id", id));
    },
    async archiveHabit(id, on) {
      check(await sb.from("habits").update({ archived_on: on }).eq("id", id));
    },
    async restoreHabit(id) {
      check(await sb.from("habits").update({ archived_on: null }).eq("id", id));
    },
    async swapSort(a, b) {
      check(await sb.from("habits").update({ sort: b.sort }).eq("id", a.id));
      check(await sb.from("habits").update({ sort: a.sort }).eq("id", b.id));
    },
    async getSettings(): Promise<Settings> {
      const data = check(await sb.from("settings").select("show_quote,last_quote_on,display_name").maybeSingle());
      const r = data as { show_quote: boolean; last_quote_on: string | null; display_name: string | null } | null;
      return { showQuote: r?.show_quote ?? true, lastQuoteOn: r?.last_quote_on ?? null, displayName: r?.display_name ?? null };
    },
    async updateSettings(patch) {
      const row: Record<string, unknown> = {};
      if (patch.showQuote !== undefined) row.show_quote = patch.showQuote;
      if (patch.lastQuoteOn !== undefined) row.last_quote_on = patch.lastQuoteOn;
      if (patch.displayName !== undefined) row.display_name = patch.displayName;
      check(await sb.from("settings").upsert(row, { onConflict: "user_id" }));
    },
    async getMonthNote(month) {
      const data = check(await sb.from("month_notes").select("body").eq("month", month).maybeSingle());
      return (data as { body: string } | null)?.body ?? "";
    },
    async saveMonthNote(month, body) {
      check(await sb.from("month_notes").upsert({ month, body }, { onConflict: "user_id,month" }));
    },
    async exportAll(): Promise<ExportDump> {
      const [h, l, p, n, settings] = await Promise.all([
        sb.from("habits").select(HABIT_COLS).order("sort"),
        sb.from("habit_logs").select("habit_id,date,done,value").order("date"),
        sb.from("plan_entries").select("habit_id,date").order("date"),
        sb.from("month_notes").select("month,body").order("month"),
        this.getSettings(),
      ]);
      return {
        habits: rows(h).map((r) => toHabit(r as HabitRow)),
        logs: rows(l).map((r) => toLog(r as LogRow)),
        plans: rows(p).map((r) => toPlan(r as PlanRow)),
        notes: rows(n) as { month: string; body: string }[],
        settings,
      };
    },
  };
}
