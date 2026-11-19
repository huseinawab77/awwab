import { describe, expect, it } from "vitest";
import { fetchAll, PAGE } from "./supabase";

/** A fake query whose .range(a, b) serves rows a..b of `total`, like PostgREST with max-rows. */
function fakeQuery(total: number) {
  const calls: [number, number][] = [];
  const make = () => ({
    range(a: number, b: number) {
      calls.push([a, b]);
      const data = Array.from({ length: Math.max(0, Math.min(b, total - 1) - a + 1) }, (_, i) => ({ n: a + i }));
      return Promise.resolve({ data, error: null });
    },
  });
  return { make, calls };
}

describe("fetchAll", () => {
  it("keeps reading pages until a short page, so nothing past 1000 rows is lost", async () => {
    const q = fakeQuery(PAGE * 2 + 5);
    const rows = await fetchAll(q.make);
    expect(rows).toHaveLength(PAGE * 2 + 5);
    expect(rows.at(-1)).toEqual({ n: PAGE * 2 + 4 });
    expect(q.calls).toHaveLength(3);
  });
  it("returns [] for no rows and throws on an error", async () => {
    expect(await fetchAll(fakeQuery(0).make)).toEqual([]);
    await expect(
      fetchAll(() => ({ range: () => Promise.resolve({ data: null, error: { message: "boom" } }) })),
    ).rejects.toThrow("boom");
  });
});
