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
