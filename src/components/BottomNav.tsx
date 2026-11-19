"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/hari-ini", label: "Hari Ini", icon: <path d="M4 12.5l4.5 4.5L20 6" /> },
  {
    href: "/minggu",
    label: "Minggu",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="4" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  { href: "/rapor", label: "Rapor", icon: <path d="M5 20V11M12 20V5M19 20v-6" /> },
  {
    href: "/atur",
    label: "Atur",
    icon: (
      <>
        <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
        <circle cx="16" cy="7" r="2.2" />
        <circle cx="10" cy="17" r="2.2" />
      </>
    ),
  },
];

/** Floating plum tab bar; the active tab grows into a labeled sun pill. */
export function BottomNav() {
  const path = usePathname();
  const active = TABS.findIndex((t) => path === t.href || path.startsWith(`${t.href}/`));
  const columns = TABS.map((_, i) => (i === active ? "1.6fr" : "1fr")).join(" ");
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-4 bottom-[max(14px,env(safe-area-inset-bottom))] z-40 mx-auto grid h-[68px] max-w-[398px] items-center rounded-full bg-plum px-2 shadow-float"
      style={{ gridTemplateColumns: columns }}
    >
      {TABS.map((t, i) => {
        const on = i === active;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            aria-label={on ? undefined : t.label}
            className={`flex h-[50px] items-center justify-center gap-1.5 rounded-full text-sm font-extrabold ${on ? "bg-sun text-plum" : "text-on-plum hover:text-paper"}`}
          >
            <svg width={on ? 20 : 24} height={on ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {t.icon}
            </svg>
            {on && t.label}
          </Link>
        );
      })}
    </nav>
  );
}
