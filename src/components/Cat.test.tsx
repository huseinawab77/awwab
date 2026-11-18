import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cat, catMood } from "./Cat";

describe("catMood follows the score", () => {
  it.each([
    [0, "mengantuk"],
    [49, "mengantuk"],
    [50, "senyum-kecil"],
    [79, "senyum-kecil"],
    [80, "senang"],
    [99, "senang"],
    [100, "berbinar"],
    [null, "senyum-kecil"],
  ] as const)("%s → %s", (score, mood) => {
    expect(catMood(score)).toBe(mood);
  });
});

describe("Cat", () => {
  it("shows the head that matches the score with a readable alt", () => {
    render(<Cat score={100} variant="head" size={112} />);
    const img = screen.getByAltText("Kucing AWWAB berbinar");
    expect(img.getAttribute("src")).toContain("kucing-berbinar.png");
  });

  it("shows the full body variant", () => {
    render(<Cat score={null} variant="body" size={96} />);
    expect(screen.getByAltText("Kucing AWWAB duduk memegang tanda centang")).toBeInTheDocument();
  });
});
