// All dates are plain "YYYY-MM-DD" strings in Asia/Jakarta (WIB).
// Arithmetic runs on UTC midnights so it never shifts with the device's timezone.

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAY_MS = 86_400_000;

const wibFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toUtc(d: string): Date {
  return new Date(`${d}T00:00:00Z`);
}

function fromUtc(dt: Date): string {
  return dt.toISOString().slice(0, 10);
}

export function todayJakarta(now: Date = new Date()): string {
  return wibFormatter.format(now);
}

/** Current hour (0–23) in WIB. */
export function hourJakarta(now: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", hourCycle: "h23" }).format(now),
  );
}

export function addDays(d: string, n: number): string {
  return fromUtc(new Date(toUtc(d).getTime() + n * DAY_MS));
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b).getTime() - toUtc(a).getTime()) / DAY_MS);
}

/** Monday = 1 … Sunday = 7 */
export function isoDow(d: string): number {
  const js = toUtc(d).getUTCDay();
  return js === 0 ? 7 : js;
}

export function weekStart(d: string): string {
  return addDays(d, 1 - isoDow(d));
}

export function weekDays(d: string): string[] {
  const start = weekStart(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthStart(d: string): string {
  return `${d.slice(0, 7)}-01`;
}

export function monthEnd(d: string): string {
  const dt = toUtc(monthStart(d));
  return fromUtc(new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)));
}

export function monthDays(d: string): string[] {
  const start = monthStart(d);
  const n = daysBetween(start, monthEnd(d)) + 1;
  return Array.from({ length: n }, (_, i) => addDays(start, i));
}

export function formatLong(d: string): string {
  const dt = toUtc(d);
  return `${HARI[dt.getUTCDay()]}, ${dt.getUTCDate()} ${BULAN[dt.getUTCMonth()]}`;
}

export function formatShort(d: string): string {
  const dt = toUtc(d);
  return `${dt.getUTCDate()} ${BULAN_PENDEK[dt.getUTCMonth()]}`;
}

export function formatMonth(d: string): string {
  const dt = toUtc(d);
  return `${BULAN[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
}

export function dayName(d: string): string {
  return HARI[toUtc(d).getUTCDay()];
}

export function dayShort(d: string): string {
  return HARI[toUtc(d).getUTCDay()].slice(0, 3);
}
