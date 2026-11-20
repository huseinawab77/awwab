import { describe, expect, it } from "vitest";
import { draftFrom, emptyDraft, toPatch, validateDraft } from "./habitForm";
import type { Habit } from "./types";

const ok = { ...emptyDraft(), name: "Minum air", kind: "qty" as const, unit: "gelas", dayTarget: "8", step: "1" };

describe("validateDraft", () => {
  it("accepts a daily quantity habit", () => {
    expect(validateDraft(ok)).toEqual({});
  });
  it("needs a name of 1–60 letters", () => {
    expect(validateDraft({ ...ok, name: "  " }).name).toBe("Nama wajib diisi");
    expect(validateDraft({ ...ok, name: "x".repeat(61) }).name).toBe("Nama maksimal 60 huruf");
  });
  it("needs unit, day target and step above 0 for quantities", () => {
    const e = validateDraft({ ...ok, unit: "", dayTarget: "0", step: "abc" });
    expect(e.unit).toBe("Satuan wajib diisi");
    expect(e.dayTarget).toBe("Isi angka lebih dari 0");
    expect(e.step).toBe("Isi angka lebih dari 0");
  });
  it("caps the unit at 20 letters, like the database", () => {
    expect(validateDraft({ ...ok, unit: "x".repeat(21) }).unit).toBe("Satuan maksimal 20 huruf");
  });
  it("needs a period target for weekly and monthly habits", () => {
    const e = validateDraft({ ...emptyDraft(), name: "Gym", period: "weekly", periodTarget: "" });
    expect(e.periodTarget).toBe("Isi angka lebih dari 0");
  });
  it("ignores quantity fields for check habits", () => {
    expect(validateDraft({ ...emptyDraft(), name: "Journaling", unit: "", dayTarget: "" })).toEqual({});
  });
});

describe("toPatch", () => {
  it("turns a valid draft into habit fields, clearing what doesn't apply", () => {
    expect(toPatch(ok)).toEqual({
      name: "Minum air",
      kind: "qty",
      period: "daily",
      unit: "gelas",
      dayTarget: 8,
      step: 1,
      periodTarget: null,
      routineDays: [],
      icon: "sprout",
      color: "peach",
    });
    expect(
      toPatch({ ...emptyDraft(), name: " Gym ", period: "weekly", periodTarget: "3", routineDays: [2, 4] }),
    ).toEqual({ name: "Gym", kind: "check", period: "weekly", unit: "kali", dayTarget: null, step: null, periodTarget: 3, routineDays: [2, 4], icon: "sprout", color: "peach" });
  });
  it("accepts a decimal comma", () => {
    expect(toPatch({ ...ok, dayTarget: "2,5", step: "0,5" }).dayTarget).toBe(2.5);
  });
});

describe("draftFrom", () => {
  it("round-trips an existing habit", () => {
    const h: Habit = {
      id: "a", name: "Deep work", kind: "qty", period: "weekly", unit: "menit", dayTarget: 90, step: 15,
      periodTarget: 600, routineDays: [1], icon: "brain", color: "sky", sort: 0, startOn: "2026-11-18", archivedOn: null,
    };
    expect(toPatch(draftFrom(h))).toEqual({
      name: "Deep work", kind: "qty", period: "weekly", unit: "menit", dayTarget: 90, step: 15, periodTarget: 600, routineDays: [1], icon: "brain", color: "sky",
    });
  });
});

describe("icon and colour", () => {
  it("a new draft starts with the fallback look", () => {
    expect(emptyDraft()).toMatchObject({ icon: "sprout", color: "peach" });
  });
  it("toPatch keeps the picked icon and colour", () => {
    expect(toPatch({ ...ok, icon: "droplet", color: "teal" })).toMatchObject({ icon: "droplet", color: "teal" });
  });
});
