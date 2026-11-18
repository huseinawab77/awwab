// Starter habits offered on the Mulai screen, taken from the old AWWAB list.
import type { Habit } from "./types";

export type DefaultHabit = Omit<Habit, "id" | "startOn" | "archivedOn" | "sort"> & { selected: boolean };

const daily = (name: string, selected = true): DefaultHabit => ({
  name, kind: "check", period: "daily", unit: null, dayTarget: null, step: null,
  periodTarget: null, routineDays: [], selected,
});
const dailyQty = (name: string, unit: string, dayTarget: number, step: number): DefaultHabit => ({
  name, kind: "qty", period: "daily", unit, dayTarget, step, periodTarget: null, routineDays: [], selected: true,
});
const times = (name: string, period: "weekly" | "monthly", periodTarget: number, routineDays: number[] = [], selected = true): DefaultHabit => ({
  name, kind: "check", period, unit: "kali", dayTarget: null, step: null, periodTarget, routineDays, selected,
});

export const DEFAULT_HABITS: DefaultHabit[] = [
  daily("Catat pengeluaran"),
  daily("Baca 10 halaman"),
  daily("Journaling"),
  daily("Buah dan sayur"),
  daily("Skill development"),
  dailyQty("Protein", "g", 120, 20),
  dailyQty("Langkah", "langkah", 6000, 1000),
  daily("Selesaikan tugas harian", false),

  times("Gym", "weekly", 3, [1, 3, 5]),
  times("Study session", "weekly", 5),
  {
    name: "Deep work", kind: "qty", period: "weekly", unit: "menit", dayTarget: 90, step: 15,
    periodTarget: 600, routineDays: [], selected: true,
  },
  times("Networking", "weekly", 5),
  times("Bantu orang", "weekly", 3),
  times("Laundry", "weekly", 1),
  times("Bikin menu mingguan", "weekly", 1),

  times("Ikut lomba", "monthly", 2),
  times("Event profesional", "monthly", 1),
  times("Waktu keluarga", "monthly", 2),
  times("Kabarin teman", "monthly", 2),
  times("Selesaikan proyek", "monthly", 1, [], false),
  times("Follow-up relasi", "monthly", 2, [], false),
];
