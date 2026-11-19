import data from "./quotes.json";
import { daysBetween } from "./dates";

export interface Quote {
  id: string;
  text: string;
  author: string;
  theme: string;
  reflection: string;
}

export const QUOTES: Quote[] = data;

/** One quote per day, cycling through the list from 1 Jan 2026. */
export function quoteFor(date: string): Quote {
  const n = QUOTES.length;
  const i = ((daysBetween("2026-01-01", date) % n) + n) % n;
  return QUOTES[i];
}

export function greeting(hour: number): string {
  if (hour >= 4 && hour <= 10) return "Selamat pagi";
  if (hour >= 11 && hour <= 14) return "Selamat siang";
  if (hour >= 15 && hour <= 17) return "Selamat sore";
  return "Selamat malam";
}
