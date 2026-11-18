"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Cat } from "@/components/Cat";
import { DayPicker } from "@/components/DayPicker";
import { Sheet } from "@/components/Sheet";
import { toast } from "@/components/Toast";
import { AccentButton, Field, PrimaryButton } from "@/components/ui";
import { todayJakarta } from "@/lib/dates";
import { DEFAULT_HABITS, type DefaultHabit } from "@/lib/defaults";
import { routineText, targetText } from "@/lib/format";
import { getStore } from "@/lib/store";
import type { Period } from "@/lib/types";

const GROUPS: { period: Period; title: string; tint: string }[] = [
  { period: "daily", title: "Harian", tint: "bg-mint" },
  { period: "weekly", title: "Mingguan", tint: "bg-lilac" },
  { period: "monthly", title: "Bulanan", tint: "bg-peach" },
];

const asHabit = (d: DefaultHabit) => ({ ...d, id: d.name, sort: 0, startOn: "", archivedOn: null });

export default function MulaiPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [list, setList] = useState<DefaultHabit[]>(DEFAULT_HABITS);
  const [editing, setEditing] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStore()
      .listHabits()
      .then((habits) => {
        if (habits.some((h) => h.archivedOn === null)) router.replace("/hari-ini");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  const count = useMemo(() => list.filter((h) => h.selected).length, [list]);

  async function start() {
    setSaving(true);
    try {
      const today = todayJakarta();
      const chosen = list.filter((h) => h.selected);
      await getStore().createHabits(
        chosen.map(({ selected: _selected, ...h }, i) => ({ ...h, sort: i, startOn: today, archivedOn: null })),
      );
      router.replace("/hari-ini");
    } catch {
      toast("Belum tersimpan, coba lagi");
      setSaving(false);
    }
  }

  if (checking) return <main className="min-h-dvh" aria-busy="true" />;

  if (step === 2) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
        <Cat score={null} variant="body" size={170} />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight">Siap, {count} kebiasaan.</h1>
          <p className="font-semibold text-plum-soft">
            Tiap hari skornya dihitung dari yang direncanain hari itu. Beres semua, skornya 100.
          </p>
        </div>
        <AccentButton className="w-full" onClick={start} disabled={saving}>
          {saving ? "Menyiapkan…" : "Mulai hari ini"}
        </AccentButton>
        <button type="button" onClick={() => setStep(1)} className="py-2 text-sm font-bold text-lilac-ink">
          Ubah pilihan
        </button>
      </main>
    );
  }

  const current = editing === null ? null : list[editing];
  const update = (patch: Partial<DefaultHabit>) =>
    setList((l) => l.map((h, i) => (i === editing ? { ...h, ...patch } : h)));

  return (
    <main className="mx-auto max-w-md px-4 pb-32 pt-6">
      <header className="mb-5 flex flex-col gap-1 px-1">
        <p className="text-sm font-semibold text-plum-soft">Langkah 1 dari 2</p>
        <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight">Pilih kebiasaanmu</h1>
        <p className="font-semibold text-plum-soft">Centang yang mau dilacak. Ketuk namanya buat ubah target.</p>
      </header>

      <div className="flex flex-col gap-4">
        {GROUPS.map((g) => (
          <section key={g.period} className={`flex flex-col gap-2 rounded-panel p-3 ${g.tint}`} aria-labelledby={`g-${g.period}`}>
            <h2 id={`g-${g.period}`} className="px-2 pt-1 font-display text-xl font-bold">
              {g.title}
            </h2>
            {list.map((h, i) =>
              h.period !== g.period ? null : (
                <div key={h.name} className="flex min-h-16 items-center gap-3 rounded-row bg-paper py-2 pl-2.5 pr-3">
                  <button
                    type="button"
                    aria-pressed={h.selected}
                    aria-label={`${h.selected ? "Batal pilih" : "Pilih"} ${h.name}`}
                    onClick={() => setList((l) => l.map((x, j) => (j === i ? { ...x, selected: !x.selected } : x)))}
                    className={`flex h-11 w-11 flex-none items-center justify-center rounded-full ${h.selected ? "bg-tangerine" : "border-[2.5px] border-plum bg-paper"}`}
                  >
                    {h.selected && (
                      <svg className="stamp" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M4 10.5 L8.5 15 L16 6" stroke="#2B2350" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <button type="button" onClick={() => setEditing(i)} className="flex min-h-11 flex-1 flex-col items-start text-left">
                    <span className={`text-base font-extrabold ${h.selected ? "text-plum" : "text-plum-soft"}`}>{h.name}</span>
                    <span className="text-xs font-semibold text-plum-soft">
                      {targetText(asHabit(h))}
                      {h.routineDays.length > 0 && `, rutin ${routineText(h.routineDays)}`}
                    </span>
                  </button>
                </div>
              ),
            )}
          </section>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-butter via-butter to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
        <div className="mx-auto max-w-md">
          <PrimaryButton className="w-full" disabled={count === 0} onClick={() => setStep(2)}>
            Lanjut ({count} kebiasaan)
          </PrimaryButton>
        </div>
      </div>

      <Sheet open={current !== null} onClose={() => setEditing(null)} title={current?.name ?? ""}>
        {current && (
          <div className="flex flex-col gap-4 pb-2">
            {current.kind === "qty" && (
              <>
                <Field
                  id="day-target"
                  label={current.period === "daily" ? `Target per hari (${current.unit})` : `Target per sesi (${current.unit})`}
                  type="number"
                  inputMode="decimal"
                  min={1}
                  value={current.dayTarget ?? ""}
                  onChange={(e) => update({ dayTarget: Math.max(1, Number(e.target.value) || 1) })}
                />
                <Field
                  id="step"
                  label={`Tombol + menambah (${current.unit})`}
                  type="number"
                  inputMode="decimal"
                  min={1}
                  value={current.step ?? ""}
                  onChange={(e) => update({ step: Math.max(1, Number(e.target.value) || 1) })}
                />
              </>
            )}
            {current.period !== "daily" && (
              <>
                <Field
                  id="period-target"
                  label={`Target ${current.period === "weekly" ? "seminggu" : "sebulan"} (${current.unit})`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={current.periodTarget ?? ""}
                  onChange={(e) => update({ periodTarget: Math.max(1, Number(e.target.value) || 1) })}
                />
                <DayPicker
                  legend="Hari rutin (opsional, otomatis masuk jadwal)"
                  value={current.routineDays}
                  onChange={(routineDays) => update({ routineDays })}
                />
              </>
            )}
            {current.kind === "check" && current.period === "daily" && (
              <p className="font-semibold text-plum-soft">Kebiasaan ini cukup dicentang tiap hari.</p>
            )}
            <PrimaryButton onClick={() => setEditing(null)}>Selesai</PrimaryButton>
          </div>
        )}
      </Sheet>
    </main>
  );
}
