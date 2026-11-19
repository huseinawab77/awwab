"use client";
import { useEffect, useState } from "react";
import { Sheet } from "./Sheet";
import { PrimaryButton } from "./ui";
import { targetText } from "@/lib/format";
import type { Habit } from "@/lib/types";

/** Type an exact value for a quantity habit. Empty or negative values can't be saved. */
export function ValueSheet({
  habit,
  value,
  dayLabel,
  onSave,
  onClose,
}: {
  habit: Habit | null;
  value: number | null;
  dayLabel: string;
  onSave: (v: number) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (habit) setText(value === null ? "" : String(value));
  }, [habit, value]);

  const parsed = text.trim() === "" ? NaN : Number(text.replace(",", "."));
  const valid = Number.isFinite(parsed) && parsed >= 0;

  return (
    <Sheet open={habit !== null} onClose={onClose} title={habit?.name ?? ""}>
      {habit && (
        <form
          className="flex flex-col gap-4 pb-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSave(parsed);
            onClose();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="value-input" className="text-sm font-bold">
              {habit.name} {dayLabel} ({habit.unit})
            </label>
            <input
              id="value-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={text !== "" && !valid}
              aria-describedby="value-help"
              className="tabular h-16 rounded-2xl border-2 border-track bg-paper px-4 font-display text-3xl font-extrabold focus:border-plum focus:outline-none"
            />
            <p id="value-help" className={`text-xs font-semibold ${text !== "" && !valid ? "text-tangerine-ink" : "text-plum-soft"}`}>
              {text !== "" && !valid ? "Isi angka 0 atau lebih." : `Target ${targetText(habit).toLowerCase()}.`}
            </p>
          </div>
          <PrimaryButton type="submit" disabled={!valid}>
            Simpan
          </PrimaryButton>
        </form>
      )}
    </Sheet>
  );
}

/** Pick a weekly/monthly habit to plan on this day. */
export function AddToTodaySheet({
  open,
  candidates,
  onPick,
  onClose,
}: {
  open: boolean;
  candidates: Habit[];
  onPick: (h: Habit) => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Tambah ke jadwal">
      <div className="flex flex-col gap-2 pb-2">
        {candidates.length === 0 ? (
          <p className="rounded-row bg-paper p-4 font-semibold text-plum-soft">
            Semua kebiasaan mingguan dan bulanan sudah ada di jadwal ini.
          </p>
        ) : (
          candidates.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => {
                onPick(h);
                onClose();
              }}
              className="flex min-h-14 flex-col items-start justify-center rounded-row bg-paper px-4 py-2 text-left"
            >
              <span className="font-extrabold">{h.name}</span>
              <span className="text-xs font-semibold text-plum-soft">{targetText(h)}</span>
            </button>
          ))
        )}
      </div>
    </Sheet>
  );
}
