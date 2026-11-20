"use client";
import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DayPicker } from "./DayPicker";
import { HabitIcon, ICONS } from "./HabitIcon";
import { HABIT_COLORS, ICON_GROUPS, iconLabel, suggestLook, type HabitColor } from "@/lib/habitIcons";
import { Field, PrimaryButton } from "./ui";
import { toPatch, validateDraft, type Draft, type DraftErrors, type HabitPatch } from "@/lib/habitForm";

/** Create/edit form for one habit. Validates on save and shows every problem next to its field. */
export function HabitForm({
  initial,
  saving,
  onSave,
  footer,
  suggest = false,
}: {
  initial: Draft;
  /** New habits: pick an icon and colour from the name until the user picks one. */
  suggest?: boolean;
  saving: boolean;
  onSave: (patch: HabitPatch) => void;
  footer?: ReactNode;
}) {
  const [d, setD] = useState<Draft>(initial);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [lookPicked, setLookPicked] = useState(!suggest);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((prev) => ({ ...prev, [k]: v, ...(k === "name" && !lookPicked ? suggestLook(String(v)) : {}) }));
    if (k in errors) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };
  const pickLook = (patch: Partial<Pick<Draft, "icon" | "color">>) => {
    setLookPicked(true);
    setD((prev) => ({ ...prev, ...patch }));
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
      <div className="flex flex-col gap-4 rounded-panel bg-paper p-5 shadow-card">
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

      <section aria-label="Ikon dan warna" className="flex flex-col gap-3 rounded-panel bg-paper p-5 shadow-card">
        <div className="flex items-center gap-3">
          <HabitIcon icon={d.icon} color={d.color} size={52} />
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold text-ink">Ikon dan warna</span>
            <span className="truncate text-sm text-muted">{d.name.trim() || "Nama kebiasaan"}</span>
          </div>
        </div>
        {ICON_GROUPS.map((g) => (
          <div key={g.title} className="flex flex-col gap-2">
            <span className="text-[13px] text-muted">{g.title}</span>
            <div role="radiogroup" aria-label={g.title} className="grid grid-cols-4 gap-2">
              {g.icons.map((ic) => {
                const on = d.icon === ic;
                const c = HABIT_COLORS[d.color];
                return (
                  <button
                    key={ic}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`Ikon ${iconLabel(ic)}`}
                    onClick={() => pickLook({ icon: ic })}
                    className={`flex h-[52px] items-center justify-center rounded-2xl transition-colors ${on ? "ring-2 ring-ink" : "ring-[1.5px] ring-track"}`}
                    style={{ background: on ? c.bg : "#FFFFFF", color: on ? c.ink : "#1F2A3D" }}
                  >
                    <HabitIconGlyph icon={ic} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-muted">Warna</span>
          <div role="radiogroup" aria-label="Warna" className="flex justify-between">
            {(Object.keys(HABIT_COLORS) as HabitColor[]).map((col) => {
              const on = d.color === col;
              return (
                <button
                  key={col}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`Warna ${HABIT_COLORS[col].label}`}
                  onClick={() => pickLook({ color: col })}
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${on ? "ring-[2.5px] ring-ink ring-offset-2" : ""}`}
                  style={{ background: HABIT_COLORS[col].bg, color: HABIT_COLORS[col].ink }}
                >
                  {on && <Check size={18} strokeWidth={3} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {qty && (
        <div className="flex flex-col gap-4 rounded-panel bg-paper p-5 shadow-card">
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
        <div className="flex flex-col gap-4 rounded-panel bg-paper p-5 shadow-card">
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
      <span className="text-sm font-bold text-ink">{legend}</span>
      <div role="radiogroup" aria-label={legend} className="flex gap-1 rounded-full bg-track p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`h-11 flex-1 rounded-full text-sm font-semibold ${value === o.value ? "bg-ink text-butter" : "text-muted"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function HabitIconGlyph({ icon }: { icon: keyof typeof ICONS }) {
  const Icon = ICONS[icon];
  return <Icon size={24} strokeWidth={2} aria-hidden="true" />;
}
