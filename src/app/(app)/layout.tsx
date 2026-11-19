"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { todayJakarta } from "@/lib/dates";
import { getStore } from "@/lib/store";

/** Signed-in area: sends first-timers to Mulai, then shows the screen with the tab bar. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([getStore().listHabits(), getStore().getSettings()])
      .then(([habits, settings]) => {
        if (!alive) return;
        if (!habits.some((h) => h.archivedOn === null)) router.replace("/mulai");
        else if (settings.showQuote && settings.lastQuoteOn !== todayJakarta()) router.replace("/kutipan");
        else setReady(true);
      })
      // Offline or slow: let the screen show its own error state.
      .catch(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [router]);

  return (
    <>
      <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-[120px] pt-6">{ready ? children : null}</main>
      <BottomNav />
    </>
  );
}
