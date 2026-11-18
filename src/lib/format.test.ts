import { describe, expect, it } from "vitest";
import { DOW_SHORT, fmtNum, routineText, targetText } from "./format";
import type { Habit } from "./types";

const base: Habit = {
  id: "x", name: "x", kind: "check", period: "daily", unit: null, dayTarget: null, step: null,
  periodTarget: null, routineDays: [], sort: 0, startOn: "2026-11-01", archivedOn: null,
};

describe("format", () => {
  it("uses Indonesian thousand dots and decimal commas", () => {
    expect(fmtNum(6400)).toBe("6.400");
    expect(fmtNum(22.5)).toBe("22,5");
    expect(fmtNum(0)).toBe("0");
  });

  it("describes targets in plain words", () => {
    expect(targetText(base)).toBe("Tiap hari");
    expect(targetText({ ...base, kind: "qty", unit: "g", dayTarget: 120 })).toBe("120 g tiap hari");
    expect(targetText({ ...base, period: "weekly", periodTarget: 3, unit: "kali" })).toBe("3 kali seminggu");
    expect(
      targetText({ ...base, kind: "qty", period: "weekly", unit: "menit", dayTarget: 90, periodTarget: 600 }),
    ).toBe("600 menit seminggu, 90 per sesi");
    expect(targetText({ ...base, period: "monthly", periodTarget: 2, unit: "kali" })).toBe("2 kali sebulan");
  });

  it("names routine days Monday-first", () => {
    expect(DOW_SHORT).toEqual(["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]);
    expect(routineText([5, 1, 3])).toBe("Sen, Rab, Jum");
    expect(routineText([])).toBe("");
  });
});
