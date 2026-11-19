// Focus timer that keeps running when the app is closed: only the start time and banked time are stored.
export interface TimerState {
  habitId: string;
  date: string;
  /** epoch ms when the current run started; null while paused */
  startedAt: number | null;
  /** time banked from earlier runs */
  elapsedMs: number;
}

const KEY = "awwab:timer";

export function readTimer(): TimerState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as TimerState;
    return typeof s.habitId === "string" && typeof s.elapsedMs === "number" ? s : null;
  } catch {
    return null;
  }
}

function save(s: TimerState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

/** Start, or resume the paused timer for the same habit and day. */
export function startTimer(habitId: string, date: string, now: number): TimerState {
  const cur = readTimer();
  const banked = cur && cur.habitId === habitId && cur.date === date ? cur.elapsedMs : 0;
  const s: TimerState = { habitId, date, startedAt: now, elapsedMs: banked };
  save(s);
  return s;
}

export function pauseTimer(now: number): TimerState | null {
  const cur = readTimer();
  if (!cur || cur.startedAt === null) return cur;
  const s = { ...cur, startedAt: null, elapsedMs: elapsedMs(cur, now) };
  save(s);
  return s;
}

export function elapsedMs(s: TimerState, now: number): number {
  return s.elapsedMs + (s.startedAt === null ? 0 : Math.max(0, now - s.startedAt));
}

export function elapsedMinutes(s: TimerState, now: number): number {
  return Math.floor(elapsedMs(s, now) / 60_000);
}

export function clearTimer() {
  localStorage.removeItem(KEY);
}
