"use client";

// Modul-Seite im Kopfrechen-Training: erst der Trick, dann die Übungsrunde.
//
// Reihenfolge ist Absicht — wer den Trick vorher gesehen hat, übt eine
// Strategie statt bloß Aufgaben abzuarbeiten. Deshalb landet man beim
// Öffnen des Moduls IMMER zuerst auf der Erklärung; die Runde startet man
// selbst. Wer den Trick schon kennt, klickt in zwei Sekunden weiter.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Repeat } from "lucide-react";
import type { TrainingModule } from "@/data/training/modules";
import {
  RUNS_FOR_MASTERY,
  getModuleProgress,
  loadTraining,
  type ModuleProgress,
} from "@/data/trainingProgress";
import { staticAudioId } from "@/data/training/speech";
import { ACCENTS } from "@/lib/accents";
import { useSpeech } from "@/lib/useSpeech";
import { SpeakButton } from "./SpeakButton";
import { TrickCard } from "./TrickCard";
import { TrainingSession } from "./TrainingSession";

export function TrainingModuleView({ module }: { module: TrainingModule }) {
  const accent = ACCENTS[module.accent];
  const speech = useSpeech();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<ModuleProgress | null>(null);

  // Nach jedem Runden-Ende neu lesen, damit die Zähler oben stimmen.
  useEffect(() => {
    if (running) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(getModuleProgress(loadTraining(), module.id));
  }, [module.id, running]);

  if (running) {
    return <TrainingSession module={module} onExit={() => setRunning(false)} />;
  }

  const runs = progress?.runs ?? 0;

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-8">
      <div className="mb-6">
        <Link
          href="/training"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={16} />
          Alle Module
        </Link>
      </div>

      <div
        className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-white ${accent.strong}`}
      >
        Modul {module.order} · {module.range}
      </div>

      <h1 className="mb-2 text-3xl font-semibold md:text-4xl">{module.title}</h1>
      <p className="mb-1 text-sm text-[var(--color-ink-soft)]">{module.grade}</p>
      <div className="mb-6 flex items-start gap-3">
        <p className="flex-1 leading-relaxed text-[var(--color-ink-soft)]">{module.summary}</p>
        <SpeakButton
          speech={speech}
          text={module.summary}
          staticId={staticAudioId.summary(module.id)}
          label="Beschreibung vorlesen"
          size="sm"
        />
      </div>

      {runs > 0 ? (
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-paper)] px-4 py-2 text-sm shadow-[var(--shadow-soft)]">
          <Repeat size={15} strokeWidth={1.9} className={accent.text} />
          {runs === 1 ? "1 Runde geübt" : `${runs} Runden geübt`}
          {progress && progress.solved > 0 ? ` · ${progress.solved} Aufgaben gerechnet` : ""}
          {runs >= RUNS_FOR_MASTERY ? " · sitzt!" : ""}
        </p>
      ) : null}

      <div className="mb-8 space-y-5">
        {module.tricks.map((trick, i) => (
          <TrickCard
            key={trick.title}
            trick={trick}
            accent={module.accent}
            number={module.tricks.length > 1 ? i + 1 : undefined}
            moduleId={module.id}
            trickIndex={i}
            speech={speech}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setRunning(true)}
          className={`inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 ${accent.strong}`}
        >
          <Play size={20} strokeWidth={2.2} />
          {runs > 0 ? "Noch eine Runde" : `${module.taskCount} Aufgaben üben`}
        </button>
        <p className="text-center text-xs text-[var(--color-ink-soft)]">
          Ohne Zeitdruck. Du kannst jederzeit aufhören und später weitermachen.
        </p>
      </div>
    </div>
  );
}
