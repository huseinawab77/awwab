"use client";
import { Check, Minus, Plus } from "lucide-react";
import { HabitIcon } from "./HabitIcon";
import { fmtNum } from "@/lib/format";
import type { PlanItem } from "@/lib/types";

/**
 * One habit on a day: icon chip, name, and on the right the circle to finish it.
 * Quantities get a tappable value with a bar, and − / + buttons instead of the circle.
 */
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
  const struck = item.done && !isQty;

  return (
    <div data-habit={h.name} className="flex min-h-[68px] items-center gap-3 rounded-row bg-paper p-2.5 shadow-card">
      <HabitIcon icon={h.icon} color={h.color} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={`text-base font-semibold ${struck ? "text-muted line-through decoration-2" : "text-ink"}`}>{h.name}</span>
        {isQty && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Ubah nilai ${h.name}`}
            className="-my-1 flex min-h-8 flex-col items-start gap-1.5 text-left"
          >
            <span className="text-[13px] text-muted">{amount}</span>
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-track">
              <span
                className={`block h-1.5 rounded-full transition-[width] duration-300 ease-out ${item.done ? "bg-leaf" : "bg-tangerine"}`}
                style={{ width: `${pct}%` }}
              />
            </span>
          </button>
        )}
        {progress && <span className="text-[13px] text-muted">{progress}</span>}
      </div>

      {extra}
      {isQty ? (
        <div className="flex flex-none gap-1.5">
          <button
            type="button"
            onClick={() => onStep(-(h.step ?? 1))}
            aria-label={`Kurangi ${h.name}`}
            disabled={value <= 0}
            className="press flex h-11 w-11 items-center justify-center rounded-[14px] border-[1.5px] border-line bg-paper text-ink disabled:opacity-40"
          >
            <Minus size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onStep(h.step ?? 1)}
            aria-label={`Tambah ${h.name}`}
            className="press flex h-11 w-11 items-center justify-center rounded-[14px] bg-tangerine text-ink"
          >
            <Plus size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={item.done}
          aria-label={item.done ? `Batalkan ${h.name}` : `Tandai ${h.name} beres`}
          className={`press flex h-11 w-11 flex-none items-center justify-center rounded-full transition-colors ${item.done ? "bg-tangerine" : "border-2 border-[#D9CDAE] bg-paper"}`}
        >
          {item.done && <Check className="pop" size={20} strokeWidth={3} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
