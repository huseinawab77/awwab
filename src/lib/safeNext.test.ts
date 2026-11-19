import { describe, expect, it } from "vitest";
import { safeNext } from "./safeNext";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/mulai")).toBe("/mulai");
    expect(safeNext("/password-baru")).toBe("/password-baru");
  });
  it("rejects anything that could leave the site", () => {
    for (const bad of ["//evil.com", "/\\evil.com", "\\\\evil.com", "https://evil.com", "evil.com", "/%5Cevil.com", "", null]) {
      expect(safeNext(bad)).toBe("/hari-ini");
    }
  });
  it("stays on the same origin once resolved", () => {
    for (const p of ["/mulai", "/a/b?c=1"]) {
      expect(new URL(safeNext(p), "https://awwab.app").origin).toBe("https://awwab.app");
    }
  });
});
