import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryStore } from "./memory";
import type { DataStore } from "./types";
import type { NewHabit } from "../types";

const gymDef: NewHabit = {
  name: "Gym", kind: "check", period: "weekly", unit: "kali", dayTarget: null, step: null,
  periodTarget: 3, routineDays: [1, 3, 5], icon: "dumbbell", color: "peach", sort: 0, startOn: "2026-11-16", archivedOn: null,
};

let store: DataStore;
beforeEach(() => {
  localStorage.clear();
  store = createMemoryStore();
});

describe("memory store", () => {
  it("creates habits with ids and lists them by sort", async () => {
    await store.createHabits([{ ...gymDef, name: "B", sort: 1 }, { ...gymDef, name: "A", sort: 0 }]);
    const list = await store.listHabits();
    expect(list.map((h) => h.name)).toEqual(["A", "B"]);
    expect(list[0].id).toBeTruthy();
  });

  it("keeps one log per habit and date, merging patches", async () => {
    const [gym] = await store.createHabits([gymDef]);
    await store.upsertLog(gym.id, "2026-11-18", { done: true });
    await store.upsertLog(gym.id, "2026-11-18", { value: 3 });
    const { logs } = await store.loadRange("2026-11-16", "2026-11-22");
    expect(logs).toEqual([{ habitId: gym.id, date: "2026-11-18", done: true, value: 3 }]);
  });

  it("loads only the requested date range", async () => {
    const [gym] = await store.createHabits([gymDef]);
    await store.upsertLog(gym.id, "2026-11-10", { done: true });
    await store.upsertLog(gym.id, "2026-11-18", { done: true });
    await store.addPlan(gym.id, "2026-11-25");
    const r = await store.loadRange("2026-11-16", "2026-11-22");
    expect(r.logs.map((l) => l.date)).toEqual(["2026-11-18"]);
    expect(r.plans).toEqual([]);
    expect(r.habits).toHaveLength(1);
  });

  it("adds plans once and removes them", async () => {
    const [gym] = await store.createHabits([gymDef]);
    await store.addPlan(gym.id, "2026-11-19");
    await store.addPlan(gym.id, "2026-11-19");
    expect((await store.loadRange("2026-11-19", "2026-11-19")).plans).toHaveLength(1);
    await store.removePlan(gym.id, "2026-11-19");
    expect((await store.loadRange("2026-11-19", "2026-11-19")).plans).toHaveLength(0);
  });

  it("archives, restores and swaps sort order", async () => {
    const [a, b] = await store.createHabits([{ ...gymDef, name: "A", sort: 0 }, { ...gymDef, name: "B", sort: 1 }]);
    await store.archiveHabit(a.id, "2026-11-18");
    expect((await store.listHabits()).find((h) => h.id === a.id)?.archivedOn).toBe("2026-11-18");
    await store.restoreHabit(a.id);
    expect((await store.listHabits()).find((h) => h.id === a.id)?.archivedOn).toBeNull();
    await store.swapSort(a, b);
    expect((await store.listHabits()).map((h) => h.name)).toEqual(["B", "A"]);
  });

  it("survives a reload (persists to localStorage)", async () => {
    await store.createHabits([gymDef]);
    await store.updateSettings({ displayName: "Awab" });
    const again = createMemoryStore();
    expect(await again.listHabits()).toHaveLength(1);
    expect((await again.getSettings()).displayName).toBe("Awab");
  });

  it("stores month notes and exports everything", async () => {
    await store.saveMonthNote("2026-11-01", "Bulan ini oke");
    expect(await store.getMonthNote("2026-11-01")).toBe("Bulan ini oke");
    const dump = await store.exportAll();
    expect(Object.keys(dump)).toEqual(["habits", "logs", "plans", "notes", "settings"]);
  });
});
