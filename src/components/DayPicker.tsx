"use client";
import { DOW_SHORT } from "@/lib/format";

/** Toggle Mon–Sun as routine days. */
export function DayPicker({ value, onChange, legend }: { value: number[]; onChange: (days: number[]) => void; legend: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-bold text-ink">{legend}</legend>
      <div className="grid grid-cols-7 gap-1.5">
        {DOW_SHORT.map((label, i) => {
          const day = i + 1;
          const on = value.includes(day);
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b))}
              className={`h-11 rounded-full text-xs font-semibold ${on ? "bg-ink text-sun" : "bg-paper text-ink border-[1.5px] border-line"}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
