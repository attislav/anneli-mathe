"use client";

// Lautsprecher-Knopf: liest den zugehörigen Text vor.
//
// Zwei Varianten:
//   - `text`            → dynamischer Text (Aufgabe, Tipp, Rechenweg),
//                         wird aus Zahlen- und Baustein-Clips zusammengesetzt
//   - `staticId` + text → fester Satz, der als ganze Datei vorliegt

import { Volume2 } from "lucide-react";
import type { SpeechHandle } from "@/lib/useSpeech";

type Props = {
  speech: SpeechHandle;
  text: string;
  /** Gesetzt, wenn der Text als fertiger Satz vertont ist. */
  staticId?: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

export function SpeakButton({
  speech,
  text,
  staticId,
  label = "Vorlesen",
  size = "md",
  className = "",
}: Props) {
  const box = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? 15 : 18;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (speech.speaking) {
          speech.stop();
          return;
        }
        if (staticId) speech.speakStatic(staticId, text);
        else speech.speak(text);
      }}
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full bg-[var(--color-lavender)] text-[var(--color-lavender-deep)] shadow-[var(--shadow-soft)] transition-transform hover:scale-110 active:scale-95 ${className}`}
    >
      <Volume2
        size={icon}
        strokeWidth={1.9}
        className={speech.speaking ? "animate-pulse" : ""}
      />
    </button>
  );
}
