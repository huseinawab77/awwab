import type { Habit, Kind, NewHabit, Period } from "./types";

/** What the habit form holds while editing: numbers stay as typed text until saved. */
export interface Draft {
  name: string;
  kind: Kind;
  period: Period;
  unit: string;
  dayTarget: string;
  step: string;
  periodTarget: string;
  routineDays: number[];
}

export type DraftErrors = Partial<Record<"name" | "unit" | "dayTarget" | "step" | "periodTarget", string>>;

export type HabitPatch = Pick<NewHabit, "name" | "kind" | "period" | "unit" | "dayTarget" | "step" | "periodTarget" | "routineDays">;

export function emptyDraft(): Draft {
  return { name: "", kind: "check", period: "daily", unit: "", dayTarget: "", step: "", periodTarget: "", routineDays: [] };
}

const str = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

export function draftFrom(h: Habit): Draft {
  return {
    name: h.name,
    kind: h.kind,
    period: h.period,
    unit: h.kind === "qty" ? (h.unit ?? "") : "",
    dayTarget: str(h.dayTarget),
    step: str(h.step),
    periodTarget: str(h.periodTarget),
    routineDays: h.routineDays,
  };
}

/** "2,5" or "2.5" → 2.5; anything else (empty, text) → NaN. */
function parse(s: string): number {
  const t = s.trim().replace(",", ".");
  return t === "" ? NaN : Number(t);
}

const positive = (s: string) => {
  const n = parse(s);
  return Number.isFinite(n) && n > 0;
};

export function validateDraft(d: Draft): DraftErrors {
  const e: DraftErrors = {};
  const name = d.name.trim();
  if (!name) e.name = "Nama wajib diisi";
  else if (name.length > 60) e.name = "Nama maksimal 60 huruf";
  if (d.kind === "qty") {
    if (!d.unit.trim()) e.unit = "Satuan wajib diisi";
    else if (d.unit.trim().length > 20) e.unit = "Satuan maksimal 20 huruf";
    if (!positive(d.dayTarget)) e.dayTarget = "Isi angka lebih dari 0";
    if (!positive(d.step)) e.step = "Isi angka lebih dari 0";
  }
  if (d.period !== "daily" && !positive(d.periodTarget)) e.periodTarget = "Isi angka lebih dari 0";
  return e;
}

/** Habit fields from a valid draft. Fields that don't apply to the kind/period are cleared. */
export function toPatch(d: Draft): HabitPatch {
  const qty = d.kind === "qty";
  const daily = d.period === "daily";
  return {
    name: d.name.trim(),
    kind: d.kind,
    period: d.period,
    unit: qty ? d.unit.trim() : daily ? null : "kali",
    dayTarget: qty ? parse(d.dayTarget) : null,
    step: qty ? parse(d.step) : null,
    periodTarget: daily ? null : parse(d.periodTarget),
    routineDays: daily ? [] : [...d.routineDays].sort((a, b) => a - b),
  };
}
