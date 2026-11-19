"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/app/(auth)/actions";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { toast } from "@/components/Toast";
import { todayJakarta } from "@/lib/dates";
import { routineText, targetText } from "@/lib/format";
import { getStore, IS_DEMO } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Habit, Period, Settings } from "@/lib/types";

const GROUPS: { period: Period; title: string; tint: string }[] = [
  { period: "daily", title: "Harian", tint: "bg-mint" },
  { period: "weekly", title: "Mingguan", tint: "bg-lilac" },
  { period: "monthly", title: "Bulanan", tint: "bg-peach" },
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
        <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight">Atur</h1>
      </header>

      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-xl font-bold">Kebiasaan</h2>
        <Link href="/atur/kebiasaan/baru" className="flex h-11 items-center rounded-full bg-tangerine px-4 text-sm font-extrabold text-plum">
          + Kebiasaan baru
        </Link>
      </div>

      {GROUPS.map(({ period, title, tint }) => {
        const list = active.filter((h) => h.period === period);
        if (list.length === 0) return null;
        return (
          <section key={period} aria-label={title} className={`flex flex-col gap-2 rounded-panel p-3 ${tint}`}>
            <h3 className="px-2 pt-1 font-display text-lg font-bold">{title}</h3>
            {list.map((h, i) => (
              <div key={h.id} className="flex items-center gap-1.5 rounded-row bg-paper py-1.5 pl-1.5 pr-2">
                <Link href={`/atur/kebiasaan/${h.id}`} className="flex min-h-11 min-w-0 flex-1 flex-col justify-center rounded-2xl px-2.5 py-1">
                  <span className="font-extrabold">{h.name}</span>
                  <span className="text-xs font-semibold text-plum-soft">
                    {targetText(h)}
                    {h.routineDays.length > 0 && `, ${routineText(h.routineDays)}`}
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
        <section aria-label="Diarsipkan" className="flex flex-col gap-2 rounded-panel bg-track p-3">
          <h3 className="px-2 pt-1 font-display text-lg font-bold">Diarsipkan</h3>
          {archived.map((h) => (
            <div key={h.id} className="flex items-center gap-3 rounded-row bg-paper px-4 py-2">
              <span className="flex-1 font-extrabold text-plum-soft">{h.name}</span>
              <button
                type="button"
                onClick={() => restore(h)}
                aria-label={`Pulihkan ${h.name}`}
                className="h-11 rounded-full bg-butter px-4 text-sm font-extrabold text-plum ring-2 ring-track"
              >
                Pulihkan
              </button>
            </div>
          ))}
        </section>
      )}

      <section aria-label="Tampilan" className="flex flex-col gap-1 rounded-panel bg-paper p-4">
        <h2 className="px-1 font-display text-xl font-bold">Tampilan</h2>
        <button
          type="button"
          role="switch"
          aria-checked={settings.showQuote}
          aria-label="Kutipan harian"
          onClick={toggleQuote}
          className="flex min-h-14 items-center gap-3 rounded-2xl px-1 text-left"
        >
          <span className="flex flex-1 flex-col">
            <span className="font-extrabold">Kutipan harian</span>
            <span className="text-xs font-semibold text-plum-soft">Satu kutipan penyemangat tiap pagi sebelum Hari Ini</span>
          </span>
          <span
            aria-hidden="true"
            className={`flex h-8 w-14 flex-none items-center rounded-full p-1 transition-colors ${settings.showQuote ? "bg-plum" : "bg-track"}`}
          >
            <span
              className={`h-6 w-6 rounded-full transition-transform motion-reduce:transition-none ${settings.showQuote ? "translate-x-6 bg-sun" : "bg-paper"}`}
            />
          </span>
        </button>
      </section>

      <Account />

      <section aria-label="Data" className="flex flex-col gap-2 rounded-panel bg-paper p-4">
        <h2 className="px-1 font-display text-xl font-bold">Data</h2>
        <p className="px-1 text-sm font-semibold text-plum-soft">Simpan salinan semua kebiasaan, catatan, dan riwayat kamu sebagai file JSON.</p>
        <button type="button" onClick={downloadBackup} className="mt-1 min-h-[52px] rounded-full bg-butter px-6 font-extrabold text-plum ring-2 ring-track">
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
    <section aria-label="Akun" className="flex flex-col gap-2 rounded-panel bg-paper p-4">
      <h2 className="px-1 font-display text-xl font-bold">Akun</h2>
      <p className="break-all px-1 text-sm font-semibold text-plum-soft">
        {IS_DEMO ? "Mode demo, data cuma ada di browser ini" : (email ?? "Memuat…")}
      </p>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Link
          href="/password-baru"
          className="flex min-h-[52px] items-center justify-center rounded-full bg-butter px-4 text-sm font-extrabold text-plum ring-2 ring-track"
        >
          Ganti password
        </Link>
        <form action={signOut}>
          <button type="submit" className="min-h-[52px] w-full rounded-full bg-plum px-4 text-sm font-extrabold text-paper">
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
      className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-butter text-plum disabled:opacity-30"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === "up" ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} />
      </svg>
    </button>
  );
}
