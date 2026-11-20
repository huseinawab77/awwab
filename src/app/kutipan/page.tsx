"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mascot } from "@/components/Mascot";
import { SCENE, SkyScene } from "@/components/SkyScene";
import { toast } from "@/components/Toast";
import { AccentButton } from "@/components/ui";
import { formatLong, hourJakarta, todayJakarta } from "@/lib/dates";
import { greeting, quoteFor, timeOfDay } from "@/lib/quotes";
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

  const time = timeOfDay(now.hour);
  const scene = SCENE[time];
  const dark = scene.dark;
  const catMood = time === "malam" ? "menguap" : time === "siang" ? "senang" : "melambai";

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col"
      style={{ background: scene.ground, color: dark ? "#FFF4D6" : "#1F2A3D" }}
    >
      <div className="relative h-[330px] w-full overflow-hidden">
        <SkyScene time={time} />
        <header className="absolute inset-x-0 top-0 flex flex-col gap-1 px-6 pt-10">
          <span className="text-sm" style={{ color: dark ? "#C9CED8" : "#5B4636" }}>
            {formatLong(now.today)}
          </span>
          <h1 className="font-display text-[34px] font-medium leading-[1.08] tracking-[-0.035em]">
            {greeting(now.hour)}
            {name ? (
              <>
                ,<br />
                {name}
              </>
            ) : null}
          </h1>
        </header>
        <div className="absolute bottom-2 left-5">
          <Mascot score={null} mood={catMood} size={128} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-2">
        <figure className="flex flex-col gap-3">
          <span
            className="self-start rounded-full px-3 py-1 text-xs font-semibold"
            style={dark ? { background: "#2C3647", color: "#FFE59A" } : { background: "#FFE1CC", color: "#9E3F0C" }}
          >
            {quote.theme}
          </span>
          <span aria-hidden="true" className="font-display -mb-6 text-[72px] font-semibold leading-none text-tangerine">
            “
          </span>
          <blockquote className="font-display text-[25px] font-medium leading-[1.3] tracking-[-0.02em]">{quote.text}</blockquote>
          <figcaption className="flex items-center gap-2 text-sm" style={{ color: dark ? "#C9CED8" : "#5B6577" }}>
            <span aria-hidden="true" className="h-px w-6" style={{ background: "currentColor" }} />
            {quote.author}
          </figcaption>
        </figure>

        <section
          className="flex flex-col gap-1.5 rounded-row p-4"
          style={dark ? { background: "#22304A" } : { background: "#FFFFFF", boxShadow: "0 1px 2px rgba(31,42,61,0.06), 0 6px 16px rgba(31,42,61,0.05)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: dark ? "#FFE59A" : "#9E3F0C" }}>
            Buat hari ini
          </h2>
          <p className="leading-relaxed">{quote.reflection}</p>
        </section>

        <AccentButton className="mt-auto w-full" onClick={start} disabled={leaving}>
          {leaving ? "Membuka…" : "Mulai hari ini"}
        </AccentButton>
      </div>
    </main>
  );
}
