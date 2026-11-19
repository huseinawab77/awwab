"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/Toast";
import { getStore, type RangeData } from "@/lib/store";
import type { HabitLog } from "@/lib/types";

type LogPatch = { done?: boolean; value?: number | null };

const SAVE_FAILED = "Belum tersimpan, coba lagi";

/**
 * Loads habits, logs and plans for [from, to] and saves changes optimistically:
 * the screen updates at once, and rolls back with a message if the save fails.
 * Saves for the same habit+date run one after another, so fast taps never race.
 */
export function useRange(from: string, to: string) {
  const [data, setData] = useState<RangeData | null>(null);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const queues = useRef(new Map<string, Promise<unknown>>());

  useEffect(() => {
    let alive = true;
    setError(false);
    getStore()
      .loadRange(from, to)
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [from, to, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  /** Run `save` after earlier saves for the same key; roll back if it fails. */
  const enqueue = useCallback((key: string, save: () => Promise<void>, rollback: () => void) => {
    const prev = queues.current.get(key) ?? Promise.resolve();
    const next = prev.then(save).catch(() => {
      rollback();
      toast(SAVE_FAILED);
    });
    queues.current.set(key, next);
  }, []);

  const setLog = useCallback(
    (habitId: string, date: string, patch: LogPatch) => {
      let before: HabitLog | undefined;
      setData((d) => {
        if (!d) return d;
        before = d.logs.find((l) => l.habitId === habitId && l.date === date);
        const merged: HabitLog = { ...(before ?? { habitId, date, done: false, value: null }), ...patch };
        const logs = before ? d.logs.map((l) => (l === before ? merged : l)) : [...d.logs, merged];
        return { ...d, logs };
      });
      enqueue(
        `log:${habitId}:${date}`,
        () => getStore().upsertLog(habitId, date, patch),
        () =>
          setData((d) => {
            if (!d) return d;
            const rest = d.logs.filter((l) => !(l.habitId === habitId && l.date === date));
            return { ...d, logs: before ? [...rest, before] : rest };
          }),
      );
    },
    [enqueue],
  );

  const addPlan = useCallback(
    (habitId: string, date: string) => {
      setData((d) =>
        d && !d.plans.some((p) => p.habitId === habitId && p.date === date)
          ? { ...d, plans: [...d.plans, { habitId, date }] }
          : d,
      );
      enqueue(
        `plan:${habitId}:${date}`,
        () => getStore().addPlan(habitId, date),
        () => setData((d) => d && { ...d, plans: d.plans.filter((p) => !(p.habitId === habitId && p.date === date)) }),
      );
    },
    [enqueue],
  );

  const removePlan = useCallback(
    (habitId: string, date: string) => {
      setData((d) => d && { ...d, plans: d.plans.filter((p) => !(p.habitId === habitId && p.date === date)) });
      enqueue(
        `plan:${habitId}:${date}`,
        () => getStore().removePlan(habitId, date),
        () => setData((d) => d && { ...d, plans: [...d.plans, { habitId, date }] }),
      );
    },
    [enqueue],
  );

  return { data, loading: data === null && !error, error, reload, setLog, addPlan, removePlan };
}
