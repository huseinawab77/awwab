import { describe, expect, it } from "vitest";
import { DEFAULT_HABITS } from "./defaults";

const byName = (name: string) => {
  const h = DEFAULT_HABITS.find((d) => d.name === name);
  if (!h) throw new Error(`missing ${name}`);
  return h;
};

describe("DEFAULT_HABITS", () => {
  it("has 18 pre-selected and 3 optional habits", () => {
    expect(DEFAULT_HABITS.filter((h) => h.selected)).toHaveLength(18);
    expect(DEFAULT_HABITS.filter((h) => !h.selected)).toHaveLength(3);
  });

  it("plans gym on Mon/Wed/Fri, 3 times a week", () => {
    expect(byName("Gym")).toMatchObject({ period: "weekly", kind: "check", routineDays: [1, 3, 5], periodTarget: 3 });
  });

  it("tracks deep work in minutes: 90 per session, 600 per week, +15", () => {
    expect(byName("Deep work")).toMatchObject({
      kind: "qty",
      period: "weekly",
      unit: "menit",
      dayTarget: 90,
      periodTarget: 600,
      step: 15,
    });
  });

  it("tracks protein 120 g a day in steps of 20", () => {
    expect(byName("Protein")).toMatchObject({ kind: "qty", period: "daily", unit: "g", dayTarget: 120, step: 20 });
  });

  it("only gives non-daily habits a period target and routine days", () => {
    for (const h of DEFAULT_HABITS) {
      if (h.period === "daily") {
        expect(h.periodTarget).toBeNull();
        expect(h.routineDays).toEqual([]);
      } else {
        expect(h.periodTarget).toBeGreaterThan(0);
      }
      if (h.kind === "qty") {
        expect(h.dayTarget).toBeGreaterThan(0);
        expect(h.step).toBeGreaterThan(0);
      }
    }
  });
});
