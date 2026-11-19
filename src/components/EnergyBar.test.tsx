import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EnergyBar } from "./EnergyBar";
import type { Habit, PlanItem } from "@/lib/types";

const h = (id: string): Habit => ({
  id, name: id, kind: "check", period: "daily", unit: null, dayTarget: null, step: null,
  periodTarget: null, routineDays: [], sort: 0, startOn: "2026-11-01", archivedOn: null,
});
const item = (id: string, credit: number): PlanItem => ({
  habit: h(id), source: "daily", credit, done: credit >= 1, value: null, over: false,
});

describe("EnergyBar", () => {
  it("draws one segment per item, colored by credit", () => {
    render(<EnergyBar items={[item("a", 1), item("b", 0.5), item("c", 0)]} />);
    const bar = screen.getByRole("img", { name: "1 dari 3 beres" });
    const segs = bar.querySelectorAll("[data-seg]");
    expect([...segs].map((s) => s.getAttribute("data-seg"))).toEqual(["done", "partial", "empty"]);
  });

  it("turns every segment lime when everything is done", () => {
    render(<EnergyBar items={[item("a", 1), item("b", 1)]} />);
    const segs = screen.getByRole("img").querySelectorAll("[data-seg]");
    expect([...segs].every((s) => s.getAttribute("data-seg") === "all")).toBe(true);
  });

  it("switches to one progress bar above 12 items", () => {
    const many = Array.from({ length: 13 }, (_, i) => item(`h${i}`, i < 13 * 0.5 ? 1 : 0));
    render(<EnergyBar items={many} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "54");
    expect(bar).toHaveAccessibleName("7 dari 13 beres");
  });
});
