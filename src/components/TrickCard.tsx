// Erklärt einen Rechentrick: Idee, Beispiel, Schritt für Schritt.
//
// Der Trick ist der Kern jedes Trainings-Moduls — Kopfrechnen soll nicht
// „schneller zählen" heißen, sondern „geschickter denken". Deshalb steht die
// Erklärung VOR der Übungsrunde und ist während der Runde jederzeit wieder
// aufrufbar.

"use client";

import { Lightbulb, Volume2 } from "lucide-react";
import type { Accent, Trick } from "@/data/training/modules";
import { staticAudioId } from "@/data/training/speech";
import { ACCENTS } from "@/lib/accents";
import type { SpeechHandle } from "@/lib/useSpeech";
import { SpeakButton } from "./SpeakButton";

export function TrickCard({
  trick,
  accent,
  number,
  moduleId,
  trickIndex,
  speech,
}: {
  trick: Trick;
  accent: Accent;
  /** Optionale Nummer, wenn ein Modul mehrere Tricks hat. */
  number?: number;
  /** Für die Audio-IDs der vorproduzierten Erklär-Sätze. */
  moduleId: string;
  trickIndex: number;
  /** Wenn gesetzt, bekommt die Karte einen Vorlese-Knopf. */
  speech?: SpeechHandle;
}) {
  const a = ACCENTS[accent];

  // Der ganze Trick am Stück: Titel, Idee, dann jeder Schritt. So hört
  // Anneli die Erklärung wie vorgelesen, statt sie klicken zu müssen.
  const readAloud = [
    { id: staticAudioId.trickTitle(moduleId, trickIndex), text: trick.title },
    { id: staticAudioId.trickIdea(moduleId, trickIndex), text: trick.idea },
    ...trick.steps.map((step, si) => ({
      id: staticAudioId.trickStep(moduleId, trickIndex, si),
      text: step,
    })),
  ];

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-paper)] p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${a.strong}`}
        >
          <Lightbulb size={20} strokeWidth={1.9} />
        </span>
        <h3 className="flex-1 text-xl font-semibold leading-snug">
          {number ? `Trick ${number}: ` : "Trick: "}
          {trick.title}
        </h3>
        {speech ? (
          <button
            type="button"
            onClick={() =>
              speech.speaking ? speech.stop() : speech.speakStaticSequence(readAloud)
            }
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-lavender)] px-3 py-1.5 text-xs font-semibold text-[var(--color-lavender-deep)] transition-transform hover:scale-105"
          >
            <Volume2 size={14} strokeWidth={2} className={speech.speaking ? "animate-pulse" : ""} />
            {speech.speaking ? "Stopp" : "Vorlesen"}
          </button>
        ) : null}
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
            <span className="flex-1 leading-relaxed">{step}</span>
            {speech ? (
              <SpeakButton
                speech={speech}
                text={step}
                staticId={staticAudioId.trickStep(moduleId, trickIndex, i)}
                label={`Schritt ${i + 1} vorlesen`}
                size="sm"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
