"use client";
import { CalendarDays, ChartColumn, CircleCheck, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/hari-ini", label: "Hari Ini", Icon: CircleCheck },
  { href: "/minggu", label: "Minggu", Icon: CalendarDays },
  { href: "/rapor", label: "Rapor", Icon: ChartColumn },
  { href: "/atur", label: "Atur", Icon: SlidersHorizontal },
];

/** Floating dark tab bar: every tab shows its icon and label; the active one sits on a sun pill. */
export function BottomNav() {
  const path = usePathname();
  const active = TABS.findIndex((t) => path === t.href || path.startsWith(`${t.href}/`));
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 mx-auto grid h-[68px] max-w-[406px] grid-cols-4 items-center rounded-[24px] bg-ink px-1.5 shadow-float"
    >
      {TABS.map(({ href, label, Icon }, i) => {
        const on = i === active;
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`mx-0.5 flex h-14 flex-col items-center justify-center gap-[3px] rounded-[18px] text-xs transition-colors ${on ? "bg-sun font-semibold text-ink" : "text-on-ink hover:text-paper"}`}
          >
            <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
