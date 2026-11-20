import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Mascot, mascotMood } from "./Mascot";

describe("mascotMood follows the day's score", () => {
  it.each([
    [null, "pagi"],
    [0, "pagi"],
    [1, "ngantuk"],
    [49, "ngantuk"],
    [50, "senyum"],
    [79, "senyum"],
    [80, "senang"],
    [99, "senang"],
    [100, "berbinar"],
  ] as const)("%s → %s", (score, mood) => {
    expect(mascotMood(score)).toBe(mood);
  });
});

describe("Mascot", () => {
  it("draws the full-body cat with a label that says how it feels", () => {
    render(<Mascot score={100} size={140} />);
    const img = screen.getByRole("img", { name: "Kucing AWWAB melompat kegirangan, mata berbinar" });
    expect(img).toHaveAttribute("data-mood", "berbinar");
  });

  it("waves good morning before anything is done", () => {
    render(<Mascot score={0} size={140} />);
    expect(screen.getByRole("img", { name: "Kucing AWWAB melambai, siap mulai hari" })).toHaveAttribute("data-mood", "pagi");
  });

  it("sleeps with floating z's when the score is low", () => {
    const { container } = render(<Mascot score={20} size={140} />);
    expect(container.querySelector("[data-part='zzz']")).not.toBeNull();
  });
});
