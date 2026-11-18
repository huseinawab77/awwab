import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  formatLong,
  formatShort,
  isoDow,
  monthDays,
  monthEnd,
  monthStart,
  todayJakarta,
  weekDays,
  weekStart,
} from "./dates";

describe("todayJakarta", () => {
  it("rolls over to the new WIB date after 17:00 UTC", () => {
    expect(todayJakarta(new Date("2026-11-18T17:30:00Z"))).toBe("2026-11-19");
  });
  it("stays on the WIB date before midnight WIB", () => {
    expect(todayJakarta(new Date("2026-11-18T16:59:00Z"))).toBe("2026-11-18");
  });
});

describe("weeks start on Monday", () => {
  it("weekStart of a Sunday is the previous Monday", () => {
    expect(weekStart("2026-11-22")).toBe("2026-11-16");
  });
  it("weekStart of a Monday is itself", () => {
    expect(weekStart("2026-11-16")).toBe("2026-11-16");
  });
  it("weekDays ends on Sunday", () => {
    const days = weekDays("2026-11-18");
    expect(days).toHaveLength(7);
    expect(days[0]).toBe("2026-11-16");
    expect(days[6]).toBe("2026-11-22");
  });
  it("isoDow counts Monday as 1 and Sunday as 7", () => {
    expect(isoDow("2026-11-16")).toBe(1);
    expect(isoDow("2026-11-22")).toBe(7);
  });
});

describe("months and arithmetic", () => {
  it("monthEnd handles February", () => {
    expect(monthEnd("2026-02-10")).toBe("2026-02-28");
  });
  it("monthStart is the first", () => {
    expect(monthStart("2026-11-18")).toBe("2026-11-01");
  });
  it("monthDays lists every day", () => {
    expect(monthDays("2026-11-05")).toHaveLength(30);
  });
  it("addDays crosses month ends", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
  it("daysBetween counts whole days", () => {
    expect(daysBetween("2026-11-11", "2026-11-18")).toBe(7);
  });
});

describe("Indonesian formatting", () => {
  it("formatLong", () => {
    expect(formatLong("2026-11-18")).toBe("Rabu, 18 November");
  });
  it("formatShort", () => {
    expect(formatShort("2026-11-18")).toBe("18 Nov");
  });
});
