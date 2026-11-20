/**
 * AWWAB's cat, full body, drawn as one SVG. Its pose follows the day's score:
 *   pagi (nothing done yet) · ngantuk (<50) · senyum (50–79) · senang (80–99) · berbinar (100).
 * It breathes, blinks and wags while idle, and hops once when its mood changes.
 * All motion stops under prefers-reduced-motion (see globals.css, .mascot).
 */

export type MascotMood = "pagi" | "ngantuk" | "senyum" | "senang" | "berbinar";

export function mascotMood(score: number | null): MascotMood {
  if (score === null || score <= 0) return "pagi";
  if (score < 50) return "ngantuk";
  if (score < 80) return "senyum";
  if (score < 100) return "senang";
  return "berbinar";
}

const LABEL: Record<MascotMood, string> = {
  pagi: "Kucing AWWAB melambai, siap mulai hari",
  ngantuk: "Kucing AWWAB mengantuk",
  senyum: "Kucing AWWAB duduk tersenyum",
  senang: "Kucing AWWAB senang mengangkat kedua tangan",
  berbinar: "Kucing AWWAB melompat kegirangan, mata berbinar",
};

const C = {
  fur: "#F58A3A",
  stripe: "#D9661E",
  cream: "#FFEBD0",
  ear: "#F7AFBE",
  cheek: "#F59AA8",
  ink: "#1F2A3D",
  mouth: "#7A2E3A",
  tongue: "#F27E91",
  sun: "#FFD45A",
};

function Arm({ from, to }: { from: [number, number]; to: [number, number] }) {
  return (
    <>
      <path d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} stroke={C.fur} strokeWidth={17} strokeLinecap="round" />
      <circle cx={to[0]} cy={to[1]} r={9.5} fill={C.cream} />
    </>
  );
}

function Sparkle({ x, y, s, delay }: { x: number; y: number; s: number; delay: string }) {
  return (
    <path
      className="mascot-twinkle"
      style={{ animationDelay: delay, transformOrigin: `${x}px ${y}px` }}
      d={`M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z`}
      fill={C.sun}
    />
  );
}

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === "ngantuk") {
    return (
      <g stroke={C.ink} strokeWidth={3.2} strokeLinecap="round" fill="none">
        <path d="M68 97 Q78 104 88 97" />
        <path d="M112 97 Q122 104 132 97" />
      </g>
    );
  }
  if (mood === "senang") {
    return (
      <g stroke={C.ink} strokeWidth={3.6} strokeLinecap="round" fill="none">
        <path d="M68 100 Q78 88 88 100" />
        <path d="M112 100 Q122 88 132 100" />
      </g>
    );
  }
  if (mood === "berbinar") {
    const star = (x: number, y: number) =>
      `M${x} ${y - 6.5} Q${x + 1.4} ${y - 1.4} ${x + 6.5} ${y} Q${x + 1.4} ${y + 1.4} ${x} ${y + 6.5} Q${x - 1.4} ${y + 1.4} ${x - 6.5} ${y} Q${x - 1.4} ${y - 1.4} ${x} ${y - 6.5}Z`;
    return (
      <g>
        <circle cx={78} cy={96} r={11} fill={C.ink} />
        <circle cx={122} cy={96} r={11} fill={C.ink} />
        <path d={star(78, 96)} fill="#FFFFFF" />
        <path d={star(122, 96)} fill="#FFFFFF" />
      </g>
    );
  }
  // pagi, senyum: open eyes that blink
  return (
    <g className="mascot-blink">
      <circle cx={78} cy={96} r={9.5} fill={C.ink} />
      <circle cx={122} cy={96} r={9.5} fill={C.ink} />
      <circle cx={81.5} cy={92.5} r={3.2} fill="#FFFFFF" />
      <circle cx={125.5} cy={92.5} r={3.2} fill="#FFFFFF" />
    </g>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  if (mood === "ngantuk") return <path d="M95 119 Q100 116 105 119" stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" fill="none" />;
  if (mood === "senyum" || mood === "pagi")
    return <path d="M91 115 Q95.5 121 100 115.5 Q104.5 121 109 115" stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  return (
    <g>
      <path d="M89 115 Q100 136 111 115 Z" fill={C.mouth} />
      <ellipse cx={100} cy={126} rx={6} ry={4} fill={C.tongue} />
    </g>
  );
}

export function Mascot({ score, size = 140, className = "" }: { score: number | null; size?: number; className?: string }) {
  const mood = mascotMood(score);
  const sleepy = mood === "ngantuk";
  const armsUp = mood === "senang" || mood === "berbinar";

  return (
    <svg
      key={mood}
      role="img"
      aria-label={LABEL[mood]}
      data-mood={mood}
      viewBox="0 0 200 220"
      width={size}
      height={size * 1.1}
      className={`mascot mascot-hop ${mood === "berbinar" ? "mascot-jump" : ""} ${className}`}
    >
      <ellipse cx={100} cy={212} rx={50} ry={6} fill="rgba(31,42,61,0.14)" className="mascot-shadow" />

      <g className="mascot-body">
        {/* tail, behind the body */}
        <g className="mascot-tail">
          <path
            d={sleepy ? "M138 196 Q170 200 172 178" : "M136 186 Q176 176 168 128"}
            stroke={C.fur}
            strokeWidth={15}
            strokeLinecap="round"
            fill="none"
          />
          <path d={sleepy ? "M170 186 Q172 182 172 178" : "M170 140 Q171 133 168 128"} stroke={C.stripe} strokeWidth={15} strokeLinecap="round" fill="none" />
        </g>

        {/* body and belly */}
        <path d="M58 178 C56 140 76 126 100 126 C124 126 144 140 142 178 C142 199 126 207 100 207 C74 207 58 199 58 178Z" fill={C.fur} />
        <ellipse cx={100} cy={178} rx={26} ry={25} fill={C.cream} />
        {/* feet */}
        <ellipse cx={80} cy={205} rx={14} ry={7.5} fill={C.cream} />
        <ellipse cx={120} cy={205} rx={14} ry={7.5} fill={C.cream} />

        {/* resting paws */}
        {(mood === "senyum" || sleepy || mood === "pagi") && (
          <>
            <ellipse cx={82} cy={sleepy ? 170 : 166} rx={10} ry={14} fill={C.fur} />
            <ellipse cx={85} cy={sleepy ? 182 : 178} rx={9} ry={7} fill={C.cream} />
          </>
        )}
        {(mood === "senyum" || sleepy) && (
          <>
            <ellipse cx={118} cy={sleepy ? 170 : 166} rx={10} ry={14} fill={C.fur} />
            <ellipse cx={115} cy={sleepy ? 182 : 178} rx={9} ry={7} fill={C.cream} />
          </>
        )}

        {/* head */}
        <g className="mascot-head" transform={sleepy ? "rotate(-7 100 140)" : undefined}>
          <path d="M54 60 L47 18 Q48 11 55 14 L92 41 Z" fill={C.fur} />
          <path d="M146 60 L153 18 Q152 11 145 14 L108 41 Z" fill={C.fur} />
          <path d="M60 47 L55 24 L79 40 Z" fill={C.ear} />
          <path d="M140 47 L145 24 L121 40 Z" fill={C.ear} />
          <ellipse cx={100} cy={92} rx={66} ry={55} fill={C.fur} />
          <g stroke={C.stripe} strokeWidth={5} strokeLinecap="round">
            <path d="M89 42 L91 56" />
            <path d="M100 40 L100 56" />
            <path d="M111 42 L109 56" />
          </g>
          <path d="M58 118 Q60 98 100 100 Q140 98 142 118 Q140 146 100 146 Q60 146 58 118Z" fill={C.cream} />
          <ellipse cx={59} cy={112} rx={10} ry={6} fill={C.cheek} opacity={0.85} />
          <ellipse cx={141} cy={112} rx={10} ry={6} fill={C.cheek} opacity={0.85} />
          <Eyes mood={mood} />
          <path d="M94.5 106 Q100 102.5 105.5 106 Q101 112 100 112 Q99 112 94.5 106Z" fill={C.ink} />
          <Mouth mood={mood} />
          <g stroke="#B98A6A" strokeWidth={1.6} strokeLinecap="round" opacity={0.7}>
            <path d="M52 106 L30 101" />
            <path d="M52 113 L31 115" />
            <path d="M148 106 L170 101" />
            <path d="M148 113 L169 115" />
          </g>
        </g>

        {/* raised arms, drawn over the head's edge so they read */}
        {mood === "pagi" && (
          <g className="mascot-wave">
            <Arm from={[128, 150]} to={[176, 104]} />
          </g>
        )}
        {armsUp && (
          <g className={mood === "berbinar" ? "mascot-cheer" : ""}>
            <Arm from={[72, 150]} to={mood === "berbinar" ? [24, 92] : [26, 122]} />
            <Arm from={[128, 150]} to={mood === "berbinar" ? [176, 92] : [174, 122]} />
          </g>
        )}
      </g>

      {sleepy && (
        <g data-part="zzz" fill={C.ink} fontFamily="system-ui, sans-serif" fontWeight={700} className="mascot-zzz">
          <text x={150} y={46} fontSize={18}>z</text>
          <text x={164} y={30} fontSize={13}>z</text>
        </g>
      )}
      {mood === "pagi" && <Sparkle x={186} y={76} s={7} delay="0ms" />}
      {mood === "berbinar" && (
        <g>
          <Sparkle x={22} y={56} s={9} delay="0ms" />
          <Sparkle x={180} y={48} s={11} delay="300ms" />
          <Sparkle x={186} y={150} s={7} delay="600ms" />
          <Sparkle x={16} y={150} s={6} delay="450ms" />
        </g>
      )}
    </svg>
  );
}
