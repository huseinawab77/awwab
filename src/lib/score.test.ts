import { describe, expect, it } from "vitest";
import {
  averageScore,
  credit,
  dayScore,
  habitConsistency,
  isActive,
  periodRange,
  planFor,
  targetProgress,
} from "./score";
import type { Habit, HabitLog, PlanEntry } from "./types";

let n = 0;
function habit(p: Partial<Habit> & Pick<Habit, "id">): Habit {
  return {
    name: p.id,
    kind: "check",
    period: "daily",
    unit: null,
    dayTarget: null,
    step: null,
    periodTarget: null,
    routineDays: [],
    sort: n++,
    startOn: "2026-11-01",
    archivedOn: null,
    ...p,
  };
}
const check = (habitId: string, date: string): HabitLog => ({ habitId, date, done: true, value: null });
const qty = (habitId: string, date: string, value: number): HabitLog => ({ habitId, date, done: false, value });

const WED = "2026-11-18";
n = 0;
const uang = habit({ id: "uang" });
const baca = habit({ id: "baca" });
const jurnal = habit({ id: "jurnal" });
const buah = habit({ id: "buah" });
const skill = habit({ id: "skill" });
const protein = habit({ id: "protein", kind: "qty", unit: "g", dayTarget: 120, step: 20 });
const langkah = habit({ id: "langkah", kind: "qty", unit: "langkah", dayTarget: 6000, step: 1000 });
const gym = habit({ id: "gym", period: "weekly", periodTarget: 3, routineDays: [1, 3, 5] });
const deep = habit({ id: "deep", kind: "qty", period: "weekly", unit: "menit", dayTarget: 90, step: 15, periodTarget: 600 });
const study = habit({ id: "study", period: "weekly", periodTarget: 5 });
const networking = habit({ id: "networking", period: "weekly", periodTarget: 5 });
const lomba = habit({ id: "lomba", period: "monthly", periodTarget: 2 });
const habits = [uang, baca, jurnal, buah, skill, protein, langkah, gym, deep, study, networking, lomba];

const mockupLogs: HabitLog[] = [
  check("gym", WED),
  qty("deep", WED, 45),
  check("study", WED),
  check("uang", WED),
  check("baca", WED),
  qty("protein", WED, 80),
  qty("langkah", WED, 6400),
];
const mockupPlans: PlanEntry[] = [
  { habitId: "deep", date: WED },
  { habitId: "study", date: WED },
];

describe("dayScore", () => {
  it("matches the mockup Wednesday: 62", () => {
    expect(dayScore(planFor(WED, habits, mockupLogs, mockupPlans))).toBe(62);
  });

  it("is 100 when everything planned is done", () => {
    const items = planFor(WED, habits, mockupLogs, mockupPlans);
    const all: HabitLog[] = items.map((i) =>
      i.habit.kind === "check" ? check(i.habit.id, WED) : qty(i.habit.id, WED, i.habit.dayTarget!),
    );
    expect(dayScore(planFor(WED, habits, all, mockupPlans))).toBe(100);
  });

  it("is null when nothing is planned", () => {
    expect(dayScore([])).toBeNull();
    expect(dayScore(planFor("2026-11-17", [gym], [], []))).toBeNull();
  });
});

describe("planFor", () => {
  it("lists non-daily first, then daily, each by sort", () => {
    const ids = planFor(WED, habits, mockupLogs, mockupPlans).map((i) => i.habit.id);
    expect(ids).toEqual(["gym", "deep", "study", "uang", "baca", "jurnal", "buah", "skill", "protein", "langkah"]);
  });

  it("counts a habit once even when routine, manual and logged all apply", () => {
    const items = planFor(WED, [gym], [check("gym", WED)], [{ habitId: "gym", date: WED }]);
    expect(items).toHaveLength(1);
    expect(items[0].source).toBe("routine");
  });

  it("adds a weekly habit logged without a schedule, only on that day", () => {
    const logs = [check("networking", "2026-11-17")];
    const tue = planFor("2026-11-17", [networking], logs, []);
    expect(tue.map((i) => [i.habit.id, i.source])).toEqual([["networking", "logged"]]);
    expect(planFor(WED, [networking], logs, [])).toHaveLength(0);
  });

  it("does not treat an untouched log row as logged", () => {
    const logs: HabitLog[] = [{ habitId: "networking", date: WED, done: false, value: 0 }];
    expect(planFor(WED, [networking], logs, [])).toHaveLength(0);
  });

  it("respects start and archive dates", () => {
    const fresh = habit({ id: "fresh", startOn: WED });
    const gone = habit({ id: "gone", archivedOn: "2026-11-19" });
    expect(planFor("2026-11-17", [fresh], [], [])).toHaveLength(0);
    expect(planFor(WED, [fresh], [], [])).toHaveLength(1);
    expect(planFor(WED, [gone], [], [])).toHaveLength(1);
    expect(planFor("2026-11-19", [gone], [], [])).toHaveLength(0);
    expect(isActive(gone, "2026-11-19")).toBe(false);
  });
});

describe("credit", () => {
  it("caps quantities at 1 and flags overshoot", () => {
    expect(credit(protein, qty("protein", WED, 0))).toBe(0);
    expect(credit(protein, qty("protein", WED, 180))).toBe(1);
    expect(planFor(WED, [protein], [qty("protein", WED, 180)], [])[0].over).toBe(true);
    expect(credit(deep, qty("deep", WED, 22.5))).toBe(0.25);
    expect(credit(protein)).toBe(0);
    expect(credit(uang, check("uang", WED))).toBe(1);
  });
});

describe("averageScore", () => {
  it("skips empty days and rounds", () => {
    expect(averageScore([74, 82, null, 62])).toBe(73);
    expect(averageScore([null])).toBeNull();
    expect(averageScore([])).toBeNull();
  });
});

describe("targets", () => {
  it("counts weekly check-ins Monday to Sunday", () => {
    const logs = [check("gym", "2026-11-16"), check("gym", WED), check("gym", "2026-11-15")];
    expect(targetProgress(gym, WED, logs)).toEqual({ done: 2, target: 3, reached: false });
  });

  it("sums weekly quantities", () => {
    const logs = [qty("deep", "2026-11-16", 120), qty("deep", WED, 45)];
    expect(targetProgress(deep, WED, logs)).toEqual({ done: 165, target: 600, reached: false });
  });

  it("uses the calendar month for monthly habits", () => {
    const logs = [check("lomba", "2026-11-30"), check("lomba", "2026-12-01")];
    expect(periodRange(lomba, "2026-12-02")).toEqual(["2026-12-01", "2026-12-31"]);
    expect(targetProgress(lomba, "2026-12-02", logs)).toEqual({ done: 1, target: 2, reached: false });
  });

  it("reaches the target at equality", () => {
    const logs = [check("lomba", "2026-11-03"), check("lomba", "2026-11-20")];
    expect(targetProgress(lomba, WED, logs).reached).toBe(true);
  });
});

describe("habitConsistency", () => {
  const days3 = ["2026-11-16", "2026-11-17", WED];
  const logs3 = [
    check("uang", "2026-11-16"),
    check("uang", "2026-11-17"),
    check("uang", WED),
    check("baca", WED),
    qty("protein", "2026-11-16", 120),
  ];
  const daily = [uang, baca, jurnal, buah, protein, gym];

  it("needs at least three days", () => {
    expect(habitConsistency(daily, days3.slice(0, 2), logs3)).toEqual({ best: null, worst: null });
  });

  it("finds the best and worst daily habits", () => {
    const r = habitConsistency(daily, days3, logs3);
    expect(r.best?.habit.id).toBe("uang");
    expect(r.best).toMatchObject({ done: 3, of: 3 });
    expect(r.worst?.habit.id).toBe("jurnal");
    expect(r.worst).toMatchObject({ done: 0, of: 3 });
  });

  it("has no worst when everything is perfect", () => {
    const perfect = days3.flatMap((d) => [check("uang", d), check("baca", d)]);
    const r = habitConsistency([uang, baca], days3, perfect);
    expect(r.best?.habit.id).toBe("uang");
    expect(r.worst).toBeNull();
  });
});
