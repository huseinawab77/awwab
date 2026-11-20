"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HabitForm } from "@/components/HabitForm";
import { Sheet } from "@/components/Sheet";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { toast } from "@/components/Toast";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import { todayJakarta } from "@/lib/dates";
import { draftFrom, emptyDraft, type HabitPatch } from "@/lib/habitForm";
import { getStore } from "@/lib/store";
import type { Habit } from "@/lib/types";

export default function HabitEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "baru";
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [saving, setSaving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  useEffect(() => {
    setError(false);
    getStore()
      .listHabits()
      .then(setHabits)
      .catch(() => setError(true));
  }, [nonce]);

  if (error) return <ErrorView onRetry={() => setNonce((n) => n + 1)} />;
  if (!habits) return <LoadingView />;

  const habit = isNew ? null : (habits.find((h) => h.id === id) ?? null);
  if (!isNew && !habit) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-panel bg-peach p-6 text-center">
        <p className="font-display text-xl font-medium">Kebiasaan ini nggak ketemu</p>
        <Link href="/atur" className="font-bold text-sky-ink underline">
          Kembali ke Atur
        </Link>
      </div>
    );
  }

  async function save(patch: HabitPatch) {
    setSaving(true);
    try {
      if (habit) {
        await getStore().updateHabit(habit.id, patch);
      } else {
        const sort = habits!.reduce((m, h) => Math.max(m, h.sort), -1) + 1;
        await getStore().createHabits([{ ...patch, sort, startOn: todayJakarta(), archivedOn: null }]);
      }
      router.push("/atur");
    } catch {
      toast("Belum tersimpan, coba lagi");
      setSaving(false);
    }
  }

  async function archive() {
    if (!habit) return;
    setSaving(true);
    try {
      await getStore().archiveHabit(habit.id, todayJakarta());
      toast(`${habit.name} diarsipkan`);
      router.push("/atur");
    } catch {
      toast("Belum tersimpan, coba lagi");
      setSaving(false);
      setConfirmArchive(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3 px-1">
        <Link
          href="/atur"
          aria-label="Kembali ke Atur"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-paper text-ink border-[1.5px] border-line"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="font-display text-[28px] font-medium leading-tight tracking-tight">
          {isNew ? "Kebiasaan baru" : "Ubah kebiasaan"}
        </h1>
      </header>

      <HabitForm
        initial={habit ? draftFrom(habit) : emptyDraft()}
        saving={saving}
        onSave={save}
        suggest={isNew}
        footer={
          habit &&
          habit.archivedOn === null && (
            <SecondaryButton type="button" onClick={() => setConfirmArchive(true)} disabled={saving}>
              Arsipkan
            </SecondaryButton>
          )
        }
      />

      {habit && (
        <Sheet open={confirmArchive} onClose={() => setConfirmArchive(false)} title={`Arsipkan ${habit.name}?`}>
          <p className="font-semibold text-muted">
            Mulai hari ini kebiasaan ini nggak muncul lagi di rencana. Riwayatnya tetap tersimpan, dan kamu bisa memulihkannya kapan saja.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <PrimaryButton onClick={archive} disabled={saving}>
              Ya, arsipkan
            </PrimaryButton>
            <SecondaryButton onClick={() => setConfirmArchive(false)}>Batal</SecondaryButton>
          </div>
        </Sheet>
      )}
    </div>
  );
}
