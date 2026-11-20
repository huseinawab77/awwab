import {
  Apple, Bike, BookOpen, Brain, Briefcase, Coins, Droplet, Dumbbell, Egg, Footprints, GraduationCap, HandHeart,
  HeartHandshake, Lightbulb, Moon, NotebookPen, Pencil, Phone, Shirt, Sprout, Trophy, Users, Utensils, Wallet,
  type LucideIcon,
} from "lucide-react";
import { HABIT_COLORS, type HabitColor, type HabitIcon as IconId } from "@/lib/habitIcons";

export const ICONS: Record<IconId, LucideIcon> = {
  dumbbell: Dumbbell, footprints: Footprints, bike: Bike, apple: Apple, egg: Egg, droplet: Droplet, moon: Moon,
  sprout: Sprout, "book-open": BookOpen, "graduation-cap": GraduationCap, brain: Brain, lightbulb: Lightbulb,
  briefcase: Briefcase, "notebook-pen": NotebookPen, pencil: Pencil, trophy: Trophy, wallet: Wallet, coins: Coins,
  users: Users, "hand-heart": HandHeart, "heart-handshake": HeartHandshake, phone: Phone, shirt: Shirt,
  utensils: Utensils,
};

/** A habit's icon on its colour chip. Decorative: the habit's name is always written next to it. */
export function HabitIcon({ icon, color, size = 44 }: { icon: IconId; color: HabitColor; size?: number }) {
  const Icon = ICONS[icon] ?? Sprout;
  const c = HABIT_COLORS[color] ?? HABIT_COLORS.peach;
  return (
    <span
      aria-hidden="true"
      data-icon={icon}
      className="flex flex-none items-center justify-center rounded-[14px]"
      style={{ width: size, height: size, background: c.bg, color: c.ink }}
    >
      <Icon size={Math.round(size / 2)} strokeWidth={2} />
    </span>
  );
}
