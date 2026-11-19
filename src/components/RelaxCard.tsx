import { Cat } from "./Cat";

export function RelaxCard({ text = "Hari santai, nggak ada yang dijadwalkan" }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-row bg-plum px-4 py-3">
      <Cat score={null} variant="body" size={84} className="flex-none" />
      <p className="font-bold text-paper">{text}</p>
    </div>
  );
}
