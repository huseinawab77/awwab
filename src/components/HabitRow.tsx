"use client";
import { fmtNum } from "@/lib/format";
import type { PlanItem } from "@/lib/types";

/** One habit on a day: tap the circle to finish it; quantities get − / + and a tappable value. */
export function HabitRow({
  item,
  progress,
  onToggle,
  onStep,
  onEdit,
  extra,
}: {
  item: PlanItem;
  /** e.g. "minggu ini 2 dari 3" for weekly/monthly habits */
  progress?: string;
  onToggle: () => void;
  onStep: (delta: number) => void;
  onEdit: () => void;
  extra?: React.ReactNode;
}) {
  const h = item.habit;
  const isQty = h.kind === "qty";
  const value = item.value ?? 0;
  const pct = isQty && h.dayTarget ? Math.min(100, (100 * value) / h.dayTarget) : 0;
  const amount = isQty
    ? `${fmtNum(value)} dari ${fmtNum(h.dayTarget ?? 0)}${h.unit ? ` ${h.unit}` : ""}${item.over ? ", lewat target" : ""}`
    : null;

  return (
    <div className="flex min-h-16 items-center gap-3 rounded-row bg-paper py-2.5 pl-2.5 pr-3">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={item.done}
        aria-label={item.done ? `Batalkan ${h.name}` : `Tandai ${h.name} beres`}
        className={`flex h-11 w-11 flex-none items-center justify-center rounded-full ${item.done ? "bg-tangerine" : "border-[2.5px] border-plum bg-paper"}`}
      >
        {item.done && (
          <svg className="stamp" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 10.5 L8.5 15 L16 6" stroke="#2B2350" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={`text-base font-extrabold ${item.done && !isQty ? "text-plum-soft" : "text-plum"}`}>{h.name}</span>
        {isQty ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Ubah nilai ${h.name}`}
            className="-my-1 flex min-h-8 flex-col items-start gap-1 text-left"
          >
            <span className="tabular text-xs font-semibold text-plum-soft">{amount}</span>
            <span className="h-2 w-full overflow-hidden rounded-full bg-track">
              <span
                className={`block h-2 rounded-full transition-[width] duration-300 ${item.done ? "bg-lime" : "bg-tangerine"}`}
                style={{ width: `${pct}%` }}
              />
            </span>
          </button>
        ) : null}
        {progress && <span className="text-xs font-semibold text-plum-soft">{progress}</span>}
      </div>

      {extra}
      {isQty && (
        <div className="flex flex-none gap-1.5">
          <button
            type="button"
            onClick={() => onStep(-(h.step ?? 1))}
            aria-label={`Kurangi ${h.name}`}
            disabled={value <= 0}
            className="h-11 w-11 rounded-full border-2 border-track bg-paper text-xl font-extrabold text-plum disabled:opacity-40"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => onStep(h.step ?? 1)}
            aria-label={`Tambah ${h.name}`}
            className="h-11 w-11 rounded-full bg-tangerine text-xl font-extrabold text-plum"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
