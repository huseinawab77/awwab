import { beforeEach, describe, expect, it } from "vitest";
import { clearTimer, elapsedMinutes, elapsedMs, pauseTimer, readTimer, startTimer } from "./timer";

const at = (hhmm: string) => new Date(`2026-11-18T${hhmm}:00+07:00`).getTime();

beforeEach(() => localStorage.clear());

describe("focus timer", () => {
  it("counts only running time across a pause", () => {
    startTimer("deep", "2026-11-18", at("10:00"));
    pauseTimer(at("10:25"));
    startTimer("deep", "2026-11-18", at("10:30"));
    expect(elapsedMinutes(readTimer()!, at("10:47"))).toBe(42);
  });

  it("survives a reload because it lives in storage", () => {
    startTimer("deep", "2026-11-18", at("10:00"));
    const again = readTimer();
    expect(again).toMatchObject({ habitId: "deep", date: "2026-11-18" });
    expect(elapsedMinutes(again!, at("10:30"))).toBe(30);
  });

  it("rounds partial minutes down and reports milliseconds", () => {
    startTimer("deep", "2026-11-18", at("10:00"));
    const s = readTimer()!;
    expect(elapsedMinutes(s, at("10:00") + 59_000)).toBe(0);
    expect(elapsedMs(s, at("10:00") + 90_000)).toBe(90_000);
  });

  it("keeps the elapsed time while paused", () => {
    startTimer("deep", "2026-11-18", at("10:00"));
    pauseTimer(at("10:10"));
    expect(readTimer()!.startedAt).toBeNull();
    expect(elapsedMinutes(readTimer()!, at("11:00"))).toBe(10);
  });

  it("clears", () => {
    startTimer("deep", "2026-11-18", at("10:00"));
    clearTimer();
    expect(readTimer()).toBeNull();
  });

  it("ignores broken storage", () => {
    localStorage.setItem("awwab:timer", "{not json");
    expect(readTimer()).toBeNull();
  });
});
