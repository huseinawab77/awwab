import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Journey } from "./Journey";
import { LineChart } from "./LineChart";

const week = [
  { date: "2026-11-16", score: 74 },
  { date: "2026-11-17", score: 82 },
  { date: "2026-11-18", score: 62 },
  { date: "2026-11-19", score: null },
  { date: "2026-11-20", score: null },
  { date: "2026-11-21", score: null },
  { date: "2026-11-22", score: null },
];

describe("Journey", () => {
  it("draws seven labeled stops colored by score", () => {
    render(<Journey days={week} today="2026-11-18" />);
    const stops = screen.getAllByTestId("stop");
    expect(stops).toHaveLength(7);
    expect(stops.map((s) => s.getAttribute("data-tone"))).toEqual(["soft", "lime", "soft", "empty", "empty", "empty", "empty"]);
    for (const label of ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]) expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("marks today and describes the week for screen readers", () => {
    render(<Journey days={week} today="2026-11-18" />);
    expect(screen.getAllByTestId("stop")[2]).toHaveAttribute("data-today", "true");
    expect(screen.getByRole("img")).toHaveAccessibleName("Senin 74, Selasa 82, Rabu 62, Kamis belum, Jumat belum, Sabtu belum, Minggu belum");
  });
});

describe("LineChart", () => {
  it("labels only the weeks that have a value", () => {
    render(
      <LineChart
        points={[
          { label: "Mg 1", value: 66 },
          { label: "Mg 2", value: 69 },
          { label: "Mg 3", value: null },
        ]}
      />,
    );
    expect(screen.getByText("66")).toBeInTheDocument();
    expect(screen.getByText("69")).toBeInTheDocument();
    expect(screen.getByText("Mg 3")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAccessibleName("Mg 1: 66, Mg 2: 69, Mg 3: belum ada");
  });
});
