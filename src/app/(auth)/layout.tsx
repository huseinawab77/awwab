import { Cat } from "@/components/Cat";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pb-10 pt-8">
      <div className="flex w-full max-w-sm flex-col items-center">
        <Cat score={null} variant="body" size={132} className="relative z-10 -mb-6" />
        <div className="w-full rounded-panel bg-paper px-5 pb-6 pt-8 shadow-[0_2px_0_rgba(43,35,80,0.06)]">{children}</div>
        <p className="mt-6 text-center text-sm font-semibold text-plum-soft">Catat harianmu, kejar skor 100.</p>
      </div>
    </main>
  );
}
