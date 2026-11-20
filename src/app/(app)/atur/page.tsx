"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/app/(auth)/actions";
import { HabitIcon } from "@/components/HabitIcon";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { toast } from "@/components/Toast";
import { todayJakarta } from "@/lib/dates";
import { routineText, targetText } from "@/lib/format";
import { getStore, IS_DEMO } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Habit, Period, Settings } from "@/lib/types";

const GROUPS: { period: Period; title: string }[] = [
  { period: "daily", title: "Harian" },
  { period: "weekly", title: "Mingguan" },
  { period: "monthly", title: "Bulanan" },
];

const SAVE_FAILED = "Belum tersimpan, coba lagi";

export default function AturPage() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setError(false);
    Promise.all([getStore().listHabits(), getStore().getSettings()])
      .then(([h, s]) => {
        setHabits(h);
        setSettings(s);
      })
      .catch(() => setError(true));
  }, [nonce]);

  if (error) return <ErrorView onRetry={() => setNonce((n) => n + 1)} />;
  if (!habits || !settings) return <LoadingView />;

  const active = habits.filter((h) => h.archivedOn === null);
  const archived = habits.filter((h) => h.archivedOn !== null);

  async function move(list: Habit[], i: number, dir: -1 | 1) {
    const a = list[i];
    const b = list[i + dir];
    if (!a || !b || busy) return;
    const before = habits!;
    setHabits(
      before
        .map((h) => (h.id === a.id ? { ...h, sort: b.sort } : h.id === b.id ? { ...h, sort: a.sort } : h))
        .sort((x, y) => x.sort - y.sort),
    );
    setBusy(true);
    try {
      await getStore().swapSort(a, b);
    } catch {
      setHabits(before);
      toast(SAVE_FAILED);
    } finally {
      setBusy(false);
    }
  }

  async function restore(h: Habit) {
    const before = habits!;
    setHabits(before.map((x) => (x.id === h.id ? { ...x, archivedOn: null } : x)));
    try {
      await getStore().restoreHabit(h.id);
      toast(`${h.name} dipulihkan`);
    } catch {
      setHabits(before);
      toast(SAVE_FAILED);
    }
  }

  async function toggleQuote() {
    const before = settings!;
    const next = !before.showQuote;
    setSettings({ ...before, showQuote: next });
    try {
      await getStore().updateSettings({ showQuote: next });
    } catch {
      setSettings(before);
      toast(SAVE_FAILED);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="px-1">
        <h1 className="font-display text-[32px] font-medium leading-tight tracking-[-0.035em]">Atur</h1>
      </header>

      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-xl font-medium">Kebiasaan</h2>
        <Link href="/atur/kebiasaan/baru" className="flex h-11 items-center rounded-full bg-tangerine px-4 text-sm font-semibold text-ink">
          + Kebiasaan baru
        </Link>
      </div>

      {GROUPS.map(({ period, title }) => {
        const list = active.filter((h) => h.period === period);
        if (list.length === 0) return null;
        return (
          <section key={period} aria-label={title} className="flex flex-col gap-2">
            <h3 className="px-1 pt-1 text-sm text-muted">{title}</h3>
            {list.map((h, i) => (
              <div key={h.id} className="flex min-h-[68px] items-center gap-1.5 rounded-row bg-paper p-2.5 shadow-card">
                <Link href={`/atur/kebiasaan/${h.id}`} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-2xl">
                  <HabitIcon icon={h.icon} color={h.color} />
                  <span className="flex min-w-0 flex-col">
                  <span className="font-semibold">{h.name}</span>
                  <span className="text-[13px] text-muted">
                    {targetText(h)}
                    {h.routineDays.length > 0 && `, ${routineText(h.routineDays)}`}
                  </span>
                  </span>
                </Link>
                <OrderButton label={`Naikkan ${h.name}`} dir="up" disabled={i === 0 || busy} onClick={() => move(list, i, -1)} />
                <OrderButton label={`Turunkan ${h.name}`} dir="down" disabled={i === list.length - 1 || busy} onClick={() => move(list, i, 1)} />
              </div>
            ))}
          </section>
        );
      })}

      {archived.length > 0 && (
        <section aria-label="Diarsipkan" className="flex flex-col gap-2">
          <h3 className="px-1 pt-1 text-sm text-muted">Diarsipkan</h3>
          {archived.map((h) => (
            <div key={h.id} className="flex min-h-[60px] items-center gap-3 rounded-row bg-paper p-2.5 opacity-80 shadow-card">
              <HabitIcon icon={h.icon} color={h.color} size={40} />
              <span className="flex-1 font-semibold text-muted">{h.name}</span>
              <button
                type="button"
                onClick={() => restore(h)}
                aria-label={`Pulihkan ${h.name}`}
                className="h-11 rounded-full bg-butter px-4 text-sm font-semibold text-ink border-[1.5px] border-line"
              >
                Pulihkan
              </button>
            </div>
          ))}
        </section>
      )}

      <section aria-label="Tampilan" className="flex flex-col gap-1 rounded-panel bg-paper p-4 shadow-card">
        <h2 className="px-1 font-display text-xl font-medium">Tampilan</h2>
        <button
          type="button"
          role="switch"
          aria-checked={settings.showQuote}
          aria-label="Kutipan harian"
          onClick={toggleQuote}
          className="flex min-h-14 items-center gap-3 rounded-2xl px-1 text-left"
        >
          <span className="flex flex-1 flex-col">
            <span className="font-semibold">Kutipan harian</span>
            <span className="text-xs font-semibold text-muted">Satu kutipan penyemangat tiap pagi sebelum Hari Ini</span>
          </span>
          <span
            aria-hidden="true"
            className={`flex h-8 w-14 flex-none items-center rounded-full p-1 transition-colors ${settings.showQuote ? "bg-ink" : "bg-track"}`}
          >
            <span
              className={`h-6 w-6 rounded-full transition-transform motion-reduce:transition-none ${settings.showQuote ? "translate-x-6 bg-sun" : "bg-paper"}`}
            />
          </span>
        </button>
      </section>

      <Account />

      <section aria-label="Data" className="flex flex-col gap-2 rounded-panel bg-paper p-4 shadow-card">
        <h2 className="px-1 font-display text-xl font-medium">Data</h2>
        <p className="px-1 text-sm font-semibold text-muted">Simpan salinan semua kebiasaan, catatan, dan riwayat kamu sebagai file JSON.</p>
        <button type="button" onClick={downloadBackup} className="mt-1 min-h-[52px] rounded-full bg-butter px-6 font-semibold text-ink border-[1.5px] border-line">
          Unduh cadangan
        </button>
      </section>
    </div>
  );
}

async function downloadBackup() {
  try {
    const dump = await getStore().exportAll();
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `awwab-cadangan-${todayJakarta()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    toast("Cadangan belum bisa dibuat, coba lagi");
  }
}

function Account() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    if (IS_DEMO) return;
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => undefined);
  }, []);

  return (
    <section aria-label="Akun" className="flex flex-col gap-2 rounded-panel bg-paper p-4 shadow-card">
      <h2 className="px-1 font-display text-xl font-medium">Akun</h2>
      <p className="break-all px-1 text-sm font-semibold text-muted">
        {IS_DEMO ? "Mode demo, data cuma ada di browser ini" : (email ?? "Memuat…")}
      </p>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Link
          href="/password-baru"
          className="flex min-h-[52px] items-center justify-center rounded-full bg-butter px-4 text-sm font-semibold text-ink border-[1.5px] border-line"
        >
          Ganti password
        </Link>
        <form action={signOut}>
          <button type="submit" className="min-h-[52px] w-full rounded-full bg-ink px-4 text-sm font-semibold text-paper">
            Keluar
          </button>
        </form>
      </div>
    </section>
  );
}

function OrderButton({ label, dir, disabled, onClick }: { label: string; dir: "up" | "down"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-butter text-ink disabled:opacity-30"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === "up" ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} />
      </svg>
    </button>
  );
}
