"use client";
import { useState, type ReactNode } from "react";
import { DayPicker } from "./DayPicker";
import { Field, PrimaryButton } from "./ui";
import { toPatch, validateDraft, type Draft, type DraftErrors, type HabitPatch } from "@/lib/habitForm";

/** Create/edit form for one habit. Validates on save and shows every problem next to its field. */
export function HabitForm({
  initial,
  saving,
  onSave,
  footer,
}: {
  initial: Draft;
  saving: boolean;
  onSave: (patch: HabitPatch) => void;
  footer?: ReactNode;
}) {
  const [d, setD] = useState<Draft>(initial);
  const [errors, setErrors] = useState<DraftErrors>({});
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((prev) => ({ ...prev, [k]: v }));
    if (k in errors) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateDraft(d);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    onSave(toPatch(d));
  };

  const qty = d.kind === "qty";
  const daily = d.period === "daily";
  const periodWord = d.period === "weekly" ? "seminggu" : "sebulan";

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-panel bg-paper p-5">
        <Field id="name" label="Nama" value={d.name} maxLength={80} error={errors.name} onChange={(e) => set("name", e.target.value)} />
        <Choice
          legend="Jenis"
          value={d.kind}
          onChange={(v) => set("kind", v)}
          options={[
            { value: "check", label: "Centang" },
            { value: "qty", label: "Angka" },
          ]}
        />
        <Choice
          legend="Periode"
          value={d.period}
          onChange={(v) => set("period", v)}
          options={[
            { value: "daily", label: "Harian" },
            { value: "weekly", label: "Mingguan" },
            { value: "monthly", label: "Bulanan" },
          ]}
        />
      </div>

      {qty && (
        <div className="flex flex-col gap-4 rounded-panel bg-mint p-5">
          <Field id="unit" label="Satuan" placeholder="gelas, menit, halaman…" value={d.unit} error={errors.unit} onChange={(e) => set("unit", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Field
              id="dayTarget"
              label={daily ? "Target per hari" : "Target per sesi"}
              inputMode="decimal"
              value={d.dayTarget}
              error={errors.dayTarget}
              onChange={(e) => set("dayTarget", e.target.value)}
            />
            <Field id="step" label="Tambah per ketukan" inputMode="decimal" value={d.step} error={errors.step} onChange={(e) => set("step", e.target.value)} />
          </div>
        </div>
      )}

      {!daily && (
        <div className="flex flex-col gap-4 rounded-panel bg-lilac p-5">
          <Field
            id="periodTarget"
            label={`Target ${periodWord}`}
            hint={qty ? `Dalam ${d.unit.trim() || "satuan di atas"}` : "Berapa kali"}
            inputMode="decimal"
            value={d.periodTarget}
            error={errors.periodTarget}
            onChange={(e) => set("periodTarget", e.target.value)}
          />
          <DayPicker legend="Hari rutin (opsional)" value={d.routineDays} onChange={(v) => set("routineDays", v)} />
        </div>
      )}

      <PrimaryButton type="submit" disabled={saving}>
        {saving ? "Menyimpan…" : "Simpan"}
      </PrimaryButton>
      {footer}
    </form>
  );
}

function Choice<T extends string>({
  legend,
  value,
  onChange,
  options,
}: {
  legend: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-plum">{legend}</span>
      <div role="radiogroup" aria-label={legend} className="flex gap-1 rounded-full bg-track p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`h-11 flex-1 rounded-full text-sm font-extrabold ${value === o.value ? "bg-plum text-butter" : "text-plum-soft"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
