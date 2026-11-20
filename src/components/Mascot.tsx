"use client";
import { useState } from "react";

/**
 * AWWAB's cat, from Awab's painted pose sheet. It wakes up as the day fills:
 *   tidur (nothing done) · menguap (<50) · melambai (50–79) · senang (80–99) · girang (100).
 * Each pose has its own idle motion and overlay (z's, hearts, sparks), hops once when the mood
 * changes, and wiggles with a heart when tapped. All motion stops under prefers-reduced-motion.
 */

export type MascotMood = "tidur" | "menguap" | "melambai" | "senang" | "girang";

export function mascotMood(score: number | null): MascotMood {
  if (score === null || score <= 0) return "tidur";
  if (score < 50) return "menguap";
  if (score < 80) return "melambai";
  if (score < 100) return "senang";
  return "girang";
}

const POSE: Record<MascotMood, { label: string; w: number; h: number }> = {
  tidur: { label: "Kucing AWWAB masih tidur", w: 520, h: 319 },
  menguap: { label: "Kucing AWWAB menguap, mulai bangun", w: 520, h: 511 },
  melambai: { label: "Kucing AWWAB melambai senang", w: 520, h: 515 },
  senang: { label: "Kucing AWWAB memegang pipi, senang sekali", w: 519, h: 520 },
  girang: { label: "Kucing AWWAB melompat kegirangan", w: 520, h: 458 },
};

function Zzz({ big }: { big: boolean }) {
  return (
    <svg data-part="zzz" aria-hidden="true" viewBox="0 0 60 60" className="mascot-fx absolute -top-[6%] right-[2%] w-[34%] overflow-visible">
      {[
        { x: 6, y: 50, s: big ? 14 : 11, d: "0s" },
        { x: 22, y: 34, s: big ? 18 : 14, d: "0.9s" },
        { x: 40, y: 16, s: big ? 22 : 17, d: "1.8s" },
      ].map((z, i) => (
        <text key={i} x={z.x} y={z.y} fontSize={z.s} fontWeight={700} fill="#E8D3B0" className="mascot-z" style={{ animationDelay: z.d }}>
          z
        </text>
      ))}
    </svg>
  );
}

function Hearts() {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 60" className="mascot-fx absolute -top-[4%] left-0 w-full overflow-visible">
      {[
        { x: 10, d: "0s", s: 1 },
        { x: 82, d: "0.8s", s: 0.8 },
        { x: 50, d: "1.6s", s: 0.65 },
      ].map((h, i) => (
        <g key={i} transform={`translate(${h.x} 40) scale(${h.s})`}>
          <path className="mascot-heart" style={{ animationDelay: h.d }} d="M0 4 C-6 -3 -12 2 -6 8 L0 13 L6 8 C12 2 6 -3 0 4Z" fill="#F27E91" />
        </g>
      ))}
    </svg>
  );
}

function Sparks() {
  const marks = [
    { x: 8, y: 30, r: -35 },
    { x: 20, y: 12, r: -15 },
    { x: 80, y: 12, r: 15 },
    { x: 92, y: 30, r: 35 },
  ];
  return (
    <svg aria-hidden="true" viewBox="0 0 100 60" className="mascot-fx absolute -top-[14%] left-0 w-full overflow-visible">
      {marks.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.r})`}>
          <rect className="mascot-spark" style={{ animationDelay: `${i * 0.12}s` }} x={-1.5} y={-7} width={3} height={9} rx={1.5} fill="#FFD45A" />
        </g>
      ))}
    </svg>
  );
}

export function Mascot({
  score,
  mood: moodOverride,
  size = 140,
  className = "",
}: {
  score: number | null;
  /** Pick the pose directly (e.g. on the quote screen) instead of from the score. */
  mood?: MascotMood;
  size?: number;
  className?: string;
}) {
  const mood = moodOverride ?? mascotMood(score);
  const pose = POSE[mood];
  const [pets, setPets] = useState(0);

  return (
    <button
      type="button"
      aria-label="Elus kucing"
      onClick={() => setPets((n) => n + 1)}
      className={`relative flex flex-none items-end justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span key={mood} className={`mascot mascot-${mood} mascot-hop relative block w-full`}>
        <span key={pets} className={pets > 0 ? "mascot-pet block" : "block"}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small local webp, sized by the parent */}
          <img
            src={`/maskot/kucing-${mood}.webp`}
            alt={pose.label}
            width={pose.w}
            height={pose.h}
            draggable={false}
            className="mascot-pose block h-auto w-full select-none"
          />
        </span>
        {(mood === "tidur" || mood === "menguap") && <Zzz big={mood === "tidur"} />}
        {mood === "senang" && <Hearts />}
        {mood === "girang" && <Sparks />}
        {pets > 0 && (
          <svg key={`h${pets}`} data-part="pet-heart" aria-hidden="true" viewBox="-14 -6 28 22" className="mascot-pet-heart absolute left-1/2 top-[8%] w-[22%] -translate-x-1/2">
            <path d="M0 4 C-6 -3 -12 2 -6 8 L0 13 L6 8 C12 2 6 -3 0 4Z" fill="#FF7A2F" />
          </svg>
        )}
      </span>
    </button>
  );
}
