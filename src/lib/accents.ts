// Pastell-Akzente für die Trainings-Module.
//
// Tailwind 4 kann Klassennamen nicht zur Laufzeit zusammenbauen (der Scanner
// sieht nur literale Strings), deshalb liegt hier pro Akzent ein fertiges
// Klassen-Set statt eines dynamischen `bg-[var(--color-${accent})]`.

import type { Accent } from "@/data/training/modules";

export type AccentClasses = {
  /** Flächiger, heller Hintergrund (Karten, Chips). */
  soft: string;
  /** Kräftiger Hintergrund (Buttons, Fortschritt). */
  strong: string;
  /** Textfarbe in der kräftigen Variante des Akzents. */
  text: string;
  /** Rahmen in der kräftigen Akzentfarbe. */
  border: string;
};

export const ACCENTS: Record<Accent, AccentClasses> = {
  mint: {
    soft: "bg-[var(--color-mint)]",
    strong: "bg-[var(--color-mint-deep)]",
    text: "text-[var(--color-mint-deep)]",
    border: "border-[var(--color-mint-deep)]",
  },
  lavender: {
    soft: "bg-[var(--color-lavender)]",
    strong: "bg-[var(--color-lavender-deep)]",
    text: "text-[var(--color-lavender-deep)]",
    border: "border-[var(--color-lavender-deep)]",
  },
  peach: {
    soft: "bg-[var(--color-peach)]",
    strong: "bg-[var(--color-peach-deep)]",
    text: "text-[var(--color-peach-deep)]",
    border: "border-[var(--color-peach-deep)]",
  },
  turquoise: {
    soft: "bg-[var(--color-accent-turquoise)]/25",
    strong: "bg-[var(--color-accent-turquoise)]",
    text: "text-[var(--color-accent-turquoise)]",
    border: "border-[var(--color-accent-turquoise)]",
  },
  honey: {
    soft: "bg-[var(--color-accent-honey)]/25",
    strong: "bg-[var(--color-accent-honey)]",
    text: "text-[var(--color-accent-honey)]",
    border: "border-[var(--color-accent-honey)]",
  },
  rose: {
    soft: "bg-[var(--color-accent-rose)]/20",
    strong: "bg-[var(--color-accent-rose)]",
    text: "text-[var(--color-accent-rose)]",
    border: "border-[var(--color-accent-rose)]",
  },
};
