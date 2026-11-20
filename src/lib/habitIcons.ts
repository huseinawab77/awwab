// The icons and colours a habit can wear (DESIGN.md v4, "Ilustrasi & ikon"). Icon ids are Lucide names.

export const ICON_GROUPS = [
  {
    title: "Sehat dan olahraga",
    icons: ["dumbbell", "footprints", "bike", "apple", "egg", "droplet", "moon", "sprout"],
  },
  {
    title: "Belajar dan kerja",
    icons: ["book-open", "graduation-cap", "brain", "lightbulb", "briefcase", "notebook-pen", "pencil", "trophy"],
  },
  {
    title: "Hidup dan sosial",
    icons: ["wallet", "coins", "users", "hand-heart", "heart-handshake", "phone", "shirt", "utensils"],
  },
] as const;

export type HabitIcon = (typeof ICON_GROUPS)[number]["icons"][number];

const LABELS: Record<HabitIcon, string> = {
  dumbbell: "Dumbel",
  footprints: "Langkah",
  bike: "Sepeda",
  apple: "Apel",
  egg: "Telur",
  droplet: "Air",
  moon: "Tidur",
  sprout: "Tunas",
  "book-open": "Buku",
  "graduation-cap": "Toga",
  brain: "Otak",
  lightbulb: "Lampu ide",
  briefcase: "Tas kerja",
  "notebook-pen": "Jurnal",
  pencil: "Pensil",
  trophy: "Piala",
  wallet: "Dompet",
  coins: "Koin",
  users: "Orang",
  "hand-heart": "Bantu",
  "heart-handshake": "Keluarga",
  phone: "Telepon",
  shirt: "Baju",
  utensils: "Makan",
};

export const iconLabel = (icon: HabitIcon) => LABELS[icon];

/** Chip colours: background and the icon's stroke on it (both pass 4.5:1). */
export const HABIT_COLORS = {
  peach: { bg: "#FFE1CC", ink: "#9E3F0C", label: "Peach" },
  mint: { bg: "#D9F0E1", ink: "#2E6A40", label: "Mint" },
  sky: { bg: "#DCE9F7", ink: "#1F5590", label: "Biru langit" },
  sun: { bg: "#FFEDB3", ink: "#7A5300", label: "Kuning" },
  rose: { bg: "#FADDE3", ink: "#9C2F4A", label: "Merah muda" },
  teal: { bg: "#D3EFEC", ink: "#0F625C", label: "Toska" },
} as const;

export type HabitColor = keyof typeof HABIT_COLORS;

const ALL_ICONS: readonly string[] = ICON_GROUPS.flatMap((g) => g.icons);
export const isHabitIcon = (v: unknown): v is HabitIcon => typeof v === "string" && ALL_ICONS.includes(v);
export const isHabitColor = (v: unknown): v is HabitColor => typeof v === "string" && v in HABIT_COLORS;

export const FALLBACK_LOOK: { icon: HabitIcon; color: HabitColor } = { icon: "sprout", color: "peach" };

// First match wins, tested against the lower-cased name.
const RULES: [RegExp, HabitIcon, HabitColor][] = [
  [/\b(gym|angkat|workout|olahraga|push ?up|boxing)/, "dumbbell", "peach"],
  [/\b(langkah|jalan|lari|jogging)/, "footprints", "teal"],
  [/\b(sepeda|gowes)/, "bike", "teal"],
  [/\b(buah|sayur|makan sehat)/, "apple", "mint"],
  [/\b(protein|telur)/, "egg", "peach"],
  [/\b(minum|air)\b/, "droplet", "sky"],
  [/\b(tidur|istirahat)/, "moon", "sky"],
  [/\b(baca|buku)/, "book-open", "sky"],
  [/\b(study|belajar|kuliah|kelas)/, "graduation-cap", "sun"],
  [/\b(deep work|fokus)/, "brain", "sky"],
  [/\b(skill|ide|kreatif)/, "lightbulb", "sun"],
  [/\b(kerja|tugas|proyek|event|profesional)/, "briefcase", "teal"],
  [/\b(jurnal|journal|catatan harian)/, "notebook-pen", "rose"],
  [/\b(lomba|kompetisi)/, "trophy", "sun"],
  [/\b(pengeluaran|uang|keuangan|nabung|tabung)/, "wallet", "mint"],
  [/\b(networking|relasi|teman|kabar)/, "users", "teal"],
  [/\b(bantu|sedekah|amal)/, "hand-heart", "rose"],
  [/\b(keluarga|orang tua|ibu|ayah)/, "heart-handshake", "rose"],
  [/\b(telepon|telpon)/, "phone", "teal"],
  [/\b(laundry|cuci baju|baju)/, "shirt", "sky"],
  [/\b(menu|masak|meal)/, "utensils", "peach"],
];

/** A sensible icon and colour from a habit's name, for starter habits and new ones. */
export function suggestLook(name: string): { icon: HabitIcon; color: HabitColor } {
  const n = name.toLowerCase();
  for (const [re, icon, color] of RULES) if (re.test(n)) return { icon, color };
  return FALLBACK_LOOK;
}
