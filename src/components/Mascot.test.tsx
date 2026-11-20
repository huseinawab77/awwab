import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Mascot, mascotMood } from "./Mascot";

describe("mascotMood: the cat wakes up as the day fills", () => {
  it.each([
    [null, "tidur"],
    [0, "tidur"],
    [1, "menguap"],
    [49, "menguap"],
    [50, "melambai"],
    [79, "melambai"],
    [80, "senang"],
    [99, "senang"],
    [100, "girang"],
  ] as const)("%s → %s", (score, mood) => {
    expect(mascotMood(score)).toBe(mood);
  });
});

describe("Mascot", () => {
  it("shows the painted pose for the mood with a label that says how it feels", () => {
    render(<Mascot score={100} size={140} />);
    const img = screen.getByRole("img", { name: "Kucing AWWAB melompat kegirangan" });
    expect(img.getAttribute("src")).toContain("kucing-girang.webp");
  });

  it("sleeps with floating z's before anything is done", () => {
    const { container } = render(<Mascot score={0} size={140} />);
    expect(screen.getByRole("img", { name: "Kucing AWWAB masih tidur" })).toBeInTheDocument();
    expect(container.querySelector("[data-part='zzz']")).not.toBeNull();
  });

  it("reacts when it is petted", () => {
    const { container } = render(<Mascot score={60} size={140} />);
    fireEvent.click(screen.getByRole("button", { name: "Elus kucing" }));
    expect(container.querySelector("[data-part='pet-heart']")).not.toBeNull();
  });
});
