import { describe, expect, it } from "vitest";
import { greeting, QUOTES, quoteFor, timeOfDay } from "./quotes";

describe("quoteFor", () => {
  it("gives a different quote on consecutive days and the same one on the same day", () => {
    expect(quoteFor("2026-11-18").id).not.toBe(quoteFor("2026-11-19").id);
    expect(quoteFor("2026-11-18").id).toBe(quoteFor("2026-11-18").id);
  });
  it("cycles through all 45 quotes", () => {
    expect(QUOTES).toHaveLength(45);
    expect(quoteFor("2026-01-01").id).toBe(QUOTES[0].id);
    expect(quoteFor("2026-02-15").id).toBe(QUOTES[0].id);
    expect(quoteFor("2025-12-31").id).toBe(QUOTES[44].id);
  });
});

describe("greeting", () => {
  it("follows the time of day", () => {
    expect(greeting(4)).toBe("Selamat pagi");
    expect(greeting(10)).toBe("Selamat pagi");
    expect(greeting(11)).toBe("Selamat siang");
    expect(greeting(16)).toBe("Selamat sore");
    expect(greeting(18)).toBe("Selamat malam");
    expect(greeting(2)).toBe("Selamat malam");
  });
});

describe("timeOfDay", () => {
  it("matches the greeting's hours", () => {
    expect(timeOfDay(4)).toBe("pagi");
    expect(timeOfDay(10)).toBe("pagi");
    expect(timeOfDay(11)).toBe("siang");
    expect(timeOfDay(14)).toBe("siang");
    expect(timeOfDay(15)).toBe("sore");
    expect(timeOfDay(17)).toBe("sore");
    expect(timeOfDay(18)).toBe("malam");
    expect(timeOfDay(3)).toBe("malam");
  });
});
