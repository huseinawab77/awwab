import type { PlanItem } from "@/lib/types";

const MAX_SEGMENTS = 12;

type Seg = "all" | "done" | "partial" | "empty";
const COLOR: Record<Seg, string> = {
  all: "bg-lime",
  done: "bg-tangerine",
  partial: "bg-tangerine-soft",
  empty: "bg-plum-muted",
};

/** One segment per planned habit, filled ones first; one plain bar when there are many. */
export function EnergyBar({ items }: { items: PlanItem[] }) {
  const done = items.filter((i) => i.done).length;
  const label = `${done} dari ${items.length} beres`;
  const all = items.length > 0 && done === items.length;

  if (items.length > MAX_SEGMENTS) {
    const pct = Math.round((100 * items.reduce((s, i) => s + i.credit, 0)) / items.length);
    return (
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-3 overflow-hidden rounded-full bg-plum-muted"
      >
        <div className={`h-3 rounded-full transition-[width] duration-300 ${all ? "bg-lime" : "bg-tangerine"}`} style={{ width: `${pct}%` }} />
      </div>
    );
  }

  const segs: Seg[] = [...items]
    .sort((a, b) => b.credit - a.credit)
    .map((i) => (all ? "all" : i.credit >= 1 ? "done" : i.credit > 0 ? "partial" : "empty"));

  return (
    <div role="img" aria-label={label} className="flex gap-1">
      {segs.map((s, idx) => (
        <span key={idx} data-seg={s} className={`h-3 flex-1 rounded-full transition-colors duration-300 ${COLOR[s]}`} />
      ))}
    </div>
  );
}
