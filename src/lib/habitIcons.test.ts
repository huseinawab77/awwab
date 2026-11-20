import { describe, expect, it } from "vitest";
import { DEFAULT_HABITS } from "./defaults";
import { HABIT_COLORS, ICON_GROUPS, iconLabel, isHabitColor, isHabitIcon, suggestLook } from "./habitIcons";

describe("icon set", () => {
  it("offers 24 icons in 3 groups of 8, each with an Indonesian label", () => {
    expect(ICON_GROUPS).toHaveLength(3);
    for (const g of ICON_GROUPS) expect(g.icons).toHaveLength(8);
    expect(iconLabel("dumbbell")).toBe("Dumbel");
  });
  it("offers 6 colours, none of them violet", () => {
    expect(Object.keys(HABIT_COLORS)).toEqual(["peach", "mint", "sky", "sun", "rose", "teal"]);
  });
  it("validates stored values", () => {
    expect(isHabitIcon("book-open")).toBe(true);
    expect(isHabitIcon("rocket")).toBe(false);
    expect(isHabitColor("sky")).toBe(true);
    expect(isHabitColor("purple")).toBe(false);
  });
});

describe("suggestLook", () => {
  it.each([
    ["Gym", "dumbbell"],
    ["Baca 10 halaman", "book-open"],
    ["Catat pengeluaran", "wallet"],
    ["Minum air 2 liter", "droplet"],
    ["Tidur sebelum jam 11", "moon"],
    ["Langkah", "footprints"],
    ["Main gitar", "sprout"],
  ])("%s → %s", (name, icon) => {
    expect(suggestLook(name).icon).toBe(icon);
  });
  it("gives every starter habit an icon from the set", () => {
    for (const h of DEFAULT_HABITS) {
      expect(isHabitIcon(h.icon)).toBe(true);
      expect(isHabitColor(h.color)).toBe(true);
    }
  });
});
