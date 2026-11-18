"use client";
import { createClient } from "../supabase/client";
import { createMemoryStore } from "./memory";
import { createSupabaseStore } from "./supabase";
import type { DataStore } from "./types";

export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

let store: DataStore | null = null;

/** The one data store for this browser session. */
export function getStore(): DataStore {
  if (!store) store = IS_DEMO ? createMemoryStore() : createSupabaseStore(createClient());
  return store;
}

export type { DataStore, RangeData, ExportDump } from "./types";
