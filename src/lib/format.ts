import type { Habit } from "./types";

export const DOW_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export function fmtNum(n: number): string {
  return nf.format(n);
}

/** "120 g tiap hari", "3 kali seminggu", "600 menit seminggu, 90 per sesi". */
export function targetText(h: Habit): string {
  const unit = h.unit ? ` ${h.unit}` : "";
  if (h.period === "daily") {
    return h.kind === "qty" && h.dayTarget ? `${fmtNum(h.dayTarget)}${unit} tiap hari` : "Tiap hari";
  }
  const span = h.period === "weekly" ? "seminggu" : "sebulan";
  const main = `${fmtNum(h.periodTarget ?? 0)}${unit} ${span}`;
  return h.kind === "qty" && h.dayTarget ? `${main}, ${fmtNum(h.dayTarget)} per sesi` : main;
}

export function routineText(days: number[]): string {
  return [...days].sort((a, b) => a - b).map((d) => DOW_SHORT[d - 1]).join(", ");
}

/** "+4 dari minggu lalu" / "−3 dari bulan lalu" / "Sama kayak minggu lalu"; null when there's nothing to compare. */
export function trendText(now: number | null, before: number | null, period: "week" | "month"): string | null {
  if (now === null || before === null) return null;
  const ref = period === "week" ? "minggu lalu" : "bulan lalu";
  const diff = now - before;
  if (diff === 0) return `Sama kayak ${ref}`;
  return `${diff > 0 ? "+" : "−"}${Math.abs(diff)} dari ${ref}`;
}
