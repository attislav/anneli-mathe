"use client";

// Übersicht aller Kopfrechen-Module.
//
// Die Module sind nach Zahlenraum sortiert (bis 10 → bis 20 → bis 100 →
// Einmaleins), aber NICHT gesperrt: wer schon sicher bis 20 rechnet, springt
// direkt weiter. Das Sperren von Inhalten ist genau die Bevormundung, die
// die App laut ROADMAP nicht sein will.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calculator, Check, Lightbulb } from "lucide-react";
import { TRAINING_MODULES } from "@/data/training/modules";
import {
  RUNS_FOR_MASTERY,
  getModuleProgress,
  loadTraining,
  modulesTouched,
  totalSolved,
  type TrainingState,
} from "@/data/trainingProgress";
import { ACCENTS } from "@/lib/accents";

export function TrainingHome() {
  const [training, setTraining] = useState<TrainingState | null>(null);

  useEffect(() => {
    // localStorage erst nach dem Mount — vorher zeigen wir den Nullstand.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTraining(loadTraining());
  }, []);

  const solved = totalSolved(training);
  const touched = modulesTouched(training);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <header className="mb-8 text-center">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-mint)] text-[var(--color-mint-deep)]">
          <Calculator size={28} strokeWidth={1.8} />
        </span>
        <h1 className="mb-3 text-3xl font-semibold md:text-4xl">Kopfrechnen</h1>
        <p className="mx-auto max-w-lg leading-relaxed text-[var(--color-ink-soft)]">
          Zehn Module, von kleinen Zahlen bis zum Einmaleins. In jedem Modul lernst du
          zuerst einen Trick — und übst ihn dann an echten Aufgaben. Ohne Zeitdruck.
        </p>
        {solved > 0 ? (
          <p className="mt-4 text-sm text-[var(--color-mint-deep)]">
            <strong>{solved}</strong> Aufgaben gerechnet · {touched} von{" "}
            {TRAINING_MODULES.length} Modulen ausprobiert
          </p>
        ) : null}
      </header>

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {TRAINING_MODULES.map((mod) => {
          const accent = ACCENTS[mod.accent];
          const mp = getModuleProgress(training, mod.id);
          const mastered = mp.runs >= RUNS_FOR_MASTERY;

          return (
            <li key={mod.id}>
              <Link
                href={`/training/${mod.id}`}
                className="group flex h-full flex-col rounded-[var(--radius-card)] bg-[var(--color-paper)] p-6 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-white ${accent.strong}`}
                  >
                    Modul {mod.order} · {mod.range}
                  </span>
                  {mastered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-mint-deep)]">
                      <Check size={14} strokeWidth={2.4} />
                      sitzt
                    </span>
                  ) : null}
                </div>

                <h2 className="mb-2 text-xl font-semibold leading-snug">{mod.title}</h2>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {mod.summary}
                </p>

                <p className={`mb-3 inline-flex items-center gap-2 text-sm font-medium ${accent.text}`}>
                  <Lightbulb size={15} strokeWidth={2} />
                  {mod.tricks[0].title}
                </p>

                {/* Übungs-Punkte: gefüllt für jede geübte Runde. Sie zählen,
                    wie oft geübt wurde — nicht, wie fehlerfrei. */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1" aria-hidden>
                    {Array.from({ length: RUNS_FOR_MASTERY }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full ${
                          i < mp.runs ? accent.strong : "bg-[var(--color-lavender)]/50"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--color-ink-soft)]">
                    {mp.runs === 0
                      ? "noch nicht geübt"
                      : mp.runs === 1
                        ? "1 Runde geübt"
                        : `${mp.runs} Runden geübt`}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
