/* eslint-disable @next/next/no-img-element -- small static PNGs, sized explicitly */
export type CatMood = "mengantuk" | "senyum-kecil" | "senang" | "berbinar";

const ALT: Record<CatMood, string> = {
  mengantuk: "Kucing AWWAB mengantuk",
  "senyum-kecil": "Kucing AWWAB senyum kecil",
  senang: "Kucing AWWAB senang",
  berbinar: "Kucing AWWAB berbinar",
};

/** <50 sleepy, 50–79 small smile, 80–99 happy, 100 sparkling; no score yet → small smile. */
export function catMood(score: number | null): CatMood {
  if (score === null) return "senyum-kecil";
  if (score >= 100) return "berbinar";
  if (score >= 80) return "senang";
  if (score >= 50) return "senyum-kecil";
  return "mengantuk";
}

// Native PNG sizes, so the browser reserves the right space before load.
const HEAD_RATIO = 416 / 551;
const BODY_RATIO = 1133 / 1060;

export function Cat({
  score,
  variant,
  size,
  className,
}: {
  score: number | null;
  variant: "head" | "body";
  size: number;
  className?: string;
}) {
  if (variant === "body") {
    return (
      <img
        src="/maskot/kucing-full-body.png"
        alt="Kucing AWWAB duduk memegang tanda centang"
        width={size}
        height={Math.round(size * BODY_RATIO)}
        className={className}
      />
    );
  }
  const mood = catMood(score);
  return (
    <img
      key={mood}
      src={`/maskot/kucing-${mood}.png`}
      alt={ALT[mood]}
      width={size}
      height={Math.round(size * HEAD_RATIO)}
      className={className}
    />
  );
}
