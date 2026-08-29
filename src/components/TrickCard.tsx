// Erklärt einen Rechentrick: Idee, Beispiel, Schritt für Schritt.
//
// Der Trick ist der Kern jedes Trainings-Moduls — Kopfrechnen soll nicht
// „schneller zählen" heißen, sondern „geschickter denken". Deshalb steht die
// Erklärung VOR der Übungsrunde und ist während der Runde jederzeit wieder
// aufrufbar.

import { Lightbulb } from "lucide-react";
import type { Accent, Trick } from "@/data/training/modules";
import { ACCENTS } from "@/lib/accents";

export function TrickCard({
  trick,
  accent,
  number,
}: {
  trick: Trick;
  accent: Accent;
  /** Optionale Nummer, wenn ein Modul mehrere Tricks hat. */
  number?: number;
}) {
  const a = ACCENTS[accent];

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-paper)] p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${a.strong}`}
        >
          <Lightbulb size={20} strokeWidth={1.9} />
        </span>
        <h3 className="text-xl font-semibold leading-snug">
          {number ? `Trick ${number}: ` : "Trick: "}
          {trick.title}
        </h3>
      </div>

      <p className="mb-5 leading-relaxed text-[var(--color-ink-soft)]">{trick.idea}</p>

      <div
        className={`mb-5 rounded-2xl px-5 py-4 text-center text-2xl font-semibold tabular-nums ${a.soft}`}
      >
        {trick.example}
      </div>

      <ol className="space-y-2">
        {trick.steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${a.strong}`}
            >
              {i + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
