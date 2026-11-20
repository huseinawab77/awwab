import { SecondaryButton } from "./ui";

/** Soft placeholder blocks while data loads. */
export function LoadingView() {
  return (
    <div aria-busy="true" aria-label="Memuat" className="flex animate-pulse flex-col gap-4 motion-reduce:animate-none">
      <div className="h-48 rounded-panel bg-ink/15" />
      <div className="h-40 rounded-panel bg-sky" />
      <div className="h-64 rounded-panel bg-mint" />
    </div>
  );
}

export function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-panel bg-peach p-6 text-center">
      <p className="font-display text-xl font-medium">Data belum kebaca</p>
      <p className="text-sm font-semibold text-muted">Cek koneksi internet kamu, lalu coba lagi.</p>
      <SecondaryButton onClick={onRetry}>Coba lagi</SecondaryButton>
    </div>
  );
}
