"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Cat } from "@/components/Cat";
import { toast } from "@/components/Toast";
import { AccentButton } from "@/components/ui";
import { formatLong, hourJakarta, todayJakarta } from "@/lib/dates";
import { greeting, quoteFor } from "@/lib/quotes";
import { getStore } from "@/lib/store";

/** Once-a-day greeting with a quote; "Mulai hari ini" marks it seen and opens Hari Ini. */
export default function KutipanPage() {
  const router = useRouter();
  const [now, setNow] = useState<{ today: string; hour: number } | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setNow({ today: todayJakarta(), hour: hourJakarta() });
    getStore()
      .getSettings()
      .then((s) => setName(s.displayName))
      .catch(() => undefined);
  }, []);

  if (!now) return <main className="min-h-dvh" aria-busy="true" />;
  const quote = quoteFor(now.today);

  async function start() {
    setLeaving(true);
    try {
      await getStore().updateSettings({ lastQuoteOn: now!.today });
      router.replace("/hari-ini");
    } catch {
      toast("Belum tersimpan, coba lagi");
      setLeaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pb-8 pt-10">
      <header className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-muted">{formatLong(now.today)}</span>
        <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight">
          {greeting(now.hour)}
          {name ? `, ${name}` : ""}
        </h1>
      </header>

      <figure className="flex flex-col gap-5 rounded-panel bg-ink p-6 text-butter">
        <span className="self-start rounded-full bg-sky px-3 py-1 text-xs font-semibold text-sky-ink">{quote.theme}</span>
        <blockquote className="font-display text-[26px] font-medium leading-snug">{quote.text}</blockquote>
        <figcaption className="text-sm font-bold text-on-ink">{quote.author}</figcaption>
      </figure>

      <section className="flex flex-col gap-1.5 rounded-panel bg-sun p-5">
        <h2 className="text-sm font-semibold text-ink">Buat hari ini</h2>
        <p className="font-semibold leading-relaxed text-ink">{quote.reflection}</p>
      </section>

      <div className="mt-auto flex flex-col items-center gap-4 pt-2">
        <Cat score={null} variant="body" size={130} />
        <AccentButton className="w-full" onClick={start} disabled={leaving}>
          {leaving ? "Membuka…" : "Mulai hari ini"}
        </AccentButton>
      </div>
    </main>
  );
}
