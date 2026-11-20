"use client";
import { useEffect, useState } from "react";
import { Sheet } from "./Sheet";
import { AccentButton, PrimaryButton } from "./ui";
import { clearTimer, elapsedMinutes, elapsedMs, pauseTimer, readTimer, startTimer, type TimerState } from "@/lib/timer";
import type { Habit } from "@/lib/types";

function clock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Focus timer for a minutes habit. Finishing adds the whole minutes to that day's value. */
export function TimerSheet({
  habit,
  date,
  current,
  otherName,
  onFinish,
  onClose,
}: {
  habit: Habit | null;
  date: string;
  current: number;
  /** name of the habit a running timer belongs to */
  otherName: (habitId: string) => string | null;
  onFinish: (minutes: number) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<TimerState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!habit) return;
    setState(readTimer());
    setNote(null);
    setNow(Date.now());
  }, [habit]);

  const running = state?.startedAt != null;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  if (!habit) return null;

  const mine = state && state.habitId === habit.id && state.date === date ? state : null;
  const busyWith = state && !mine ? (otherName(state.habitId) ?? "lain") : null;
  const shown = mine ? elapsedMs(mine, now) : 0;
  const stop = () => {
    clearTimer();
    setState(null);
  };

  const finish = () => {
    const minutes = mine ? elapsedMinutes(mine, Date.now()) : 0;
    stop();
    if (minutes <= 0) {
      setNote("Belum ada menit yang tercatat");
      return;
    }
    onFinish(current + minutes);
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={`Timer ${habit.name}`}>
      <div className="flex flex-col gap-4 pb-2">
        {busyWith ? (
          <div className="flex flex-col gap-3 rounded-row bg-peach p-4">
            <p className="font-bold">Timer {busyWith} masih jalan.</p>
            <p className="text-sm font-semibold text-muted">Selesaikan atau batalkan dulu sebelum mulai timer baru.</p>
            <PrimaryButton onClick={stop}>Batalkan timer {busyWith}</PrimaryButton>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1 rounded-panel bg-ink py-8 text-paper">
              <span role="timer" aria-live="off" className="tabular font-display text-6xl font-medium tracking-tight text-sun">
                {clock(shown)}
              </span>
              <span className="text-sm font-semibold text-on-ink">
                {running ? "Lagi fokus" : mine ? "Dijeda" : `Sudah ${current} menit, target ${habit.dayTarget}`}
              </span>
            </div>
            {note && (
              <p role="status" className="rounded-row bg-paper p-3 text-center text-sm font-bold text-tangerine-ink border-[1.5px] border-line">
                {note}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {running ? (
                <PrimaryButton onClick={() => setState(pauseTimer(Date.now()))}>Jeda</PrimaryButton>
              ) : (
                <PrimaryButton
                  onClick={() => {
                    setNote(null);
                    setNow(Date.now());
                    setState(startTimer(habit.id, date, Date.now()));
                  }}
                >
                  {mine ? "Lanjut" : "Mulai"}
                </PrimaryButton>
              )}
              <AccentButton onClick={finish} disabled={!mine}>
                Selesai
              </AccentButton>
            </div>
            {mine && (
              <button type="button" onClick={stop} className="min-h-11 text-sm font-bold text-muted">
                Batal, jangan dicatat
              </button>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}
