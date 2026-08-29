"use client";

// Eine Übungsrunde im Kopfrechen-Training.
//
// Gestaltungsregeln (aus ROADMAP.md, „Story + Mathe: atmosphärischer Druck,
// nie Stress" — gilt im Training genauso):
//   - KEIN Timer, keine Stoppuhr, kein Game-Over.
//   - KEIN rotes „Falsch!". Bei einer falschen Antwort kommt der Trick-Tipp
//     mit genau diesen Zahlen.
//   - Nach dreimal daneben zeigt die App den Rechenweg und geht weiter —
//     festhängen gibt es nicht.
//   - Die Runde ist immer zu Ende zu bringen. Gezählt wird „dran sein",
//     nicht „fehlerfrei sein".
//
// Adaptiv innerhalb der Runde: 3 richtige Antworten in Folge → eine Stufe
// schwerer, 2 falsche in Folge → eine Stufe leichter. Das Level wird pro
// Modul persistiert und beim nächsten Start wieder aufgenommen.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";
import type { TrainingModule } from "@/data/training/modules";
import { nextTrainingModule } from "@/data/training/modules";
import { generateTrainingTask, type Level, type TrainingTask } from "@/data/training";
import {
  getModuleProgress,
  loadTraining,
  recordRun,
  type TrainingState,
} from "@/data/trainingProgress";
import { ACCENTS } from "@/lib/accents";
import { loadAutoRead, saveAutoRead, useSpeech } from "@/lib/useSpeech";
import { NumberPad } from "./NumberPad";
import { SpeakButton } from "./SpeakButton";
import { TrickCard } from "./TrickCard";
import { useSoundFx } from "@/lib/useSoundFx";

/** Nach so langer Ruhe blenden wir den Tipp von selbst ein. */
const HINT_DELAY_MS = 12000;
/** So lange bleibt „Genau!" stehen, bevor die nächste Aufgabe kommt. */
const SUCCESS_PAUSE_MS = 750;
/** Nach so vielen Fehlversuchen an derselben Aufgabe zeigen wir den Rechenweg. */
const REVEAL_AFTER = 3;

const PRAISE = ["Genau!", "Das sitzt.", "Richtig!", "Stark gerechnet."] as const;
const RETRY = [
  "Fast! Schau mal, wie es leichter geht:",
  "Noch nicht ganz — probier es mit diesem Weg:",
  "Kein Problem. Nimm den Trick zu Hilfe:",
] as const;

type Phase = "asking" | "correct" | "retry" | "reveal" | "done";

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 3 richtig in Folge → schwerer, 2 falsch in Folge → leichter. */
function nextLevel(current: Level, streak: { correct: number; wrong: number }): Level {
  if (streak.correct >= 3) return current === "easy" ? "normal" : "hard";
  if (streak.wrong >= 2) return current === "hard" ? "normal" : "easy";
  return current;
}

export function TrainingSession({
  module,
  onExit,
}: {
  module: TrainingModule;
  /** Zurück zur Trick-Ansicht des Moduls. */
  onExit: () => void;
}) {
  const accent = ACCENTS[module.accent];
  const playFx = useSoundFx();
  const speech = useSpeech();

  // „Aufgabe automatisch vorlesen" — für Kinder, die lieber hören als lesen.
  // Einstellung bleibt über Sitzungen hinweg erhalten.
  const [autoRead, setAutoRead] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutoRead(loadAutoRead());
  }, []);

  const [training, setTraining] = useState<TrainingState | null>(null);
  const [level, setLevel] = useState<Level>("normal");
  const [task, setTask] = useState<TrainingTask | null>(null);

  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("asking");
  const [praise, setPraise] = useState<string>(PRAISE[0]);
  const [retryLine, setRetryLine] = useState<string>(RETRY[0]);

  const [taskIndex, setTaskIndex] = useState(0); // wie viele Aufgaben sind durch
  const [solved, setSolved] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [helped, setHelped] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongOnTask, setWrongOnTask] = useState(0);
  const [streak, setStreak] = useState({ correct: 0, wrong: 0 });

  const [showHint, setShowHint] = useState(false);
  const [showTrick, setShowTrick] = useState(false);

  // Sicherung gegen doppeltes Fortschreiben derselben Runde (React 19 kann
  // Effekte im Dev-Modus zweimal ausführen).
  const runRecorded = useRef(false);

  // --- Start: Spielstand laden, Level übernehmen, erste Aufgabe bauen -------
  // Bewusst erst nach dem Mount: localStorage gibt es auf dem Server nicht,
  // und eine im SSR gewürfelte Aufgabe würde beim Hydrieren abweichen.
  useEffect(() => {
    const loaded = loadTraining();
    const startLevel = getModuleProgress(loaded, module.id).level;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTraining(loaded);
    setLevel(startLevel);
    setTask(generateTrainingTask(module.id, startLevel));
  }, [module.id]);

  // --- Aufgabe automatisch vorlesen -----------------------------------------
  // Nur bei einer NEUEN Aufgabe, nicht nach einem zweiten Versuch — sonst
  // redet die App Anneli beim Nachdenken dazwischen.
  useEffect(() => {
    if (!autoRead || !task) return;
    speech.speak(task.prompt);
    // `speech` ist über useCallback stabil; die Aufgabe ist der Auslöser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, autoRead]);

  // --- Tipp nach Ruhephase --------------------------------------------------

  useEffect(() => {
    if (phase !== "asking") return;
    if (value.length > 0) return; // Es wird gerade getippt — kein Nachhaken.
    const timer = window.setTimeout(() => setShowHint(true), HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phase, value, task?.id]);

  // --- Runde abschließen und wegschreiben -----------------------------------

  useEffect(() => {
    if (phase !== "done") return;
    if (!training) return;
    if (runRecorded.current) return;
    runRecorded.current = true;
    const updated = recordRun(training, module.id, {
      solved,
      attempts,
      firstTry,
      level,
      completed: true,
    });
    setTraining(updated);
    playFx("bird-chirp");
  }, [phase, training, module.id, solved, attempts, firstTry, level, playFx]);

  // --- Nächste Aufgabe ------------------------------------------------------

  const advance = useCallback(
    (nextStreak: { correct: number; wrong: number }) => {
      const done = taskIndex + 1;
      setTaskIndex(done);
      if (done >= module.taskCount) {
        setPhase("done");
        return;
      }
      const lvl = nextLevel(level, nextStreak);
      if (lvl !== level) {
        setLevel(lvl);
        setStreak({ correct: 0, wrong: 0 }); // Streak hat ausgelöst — Zähler neu.
      }
      setTask(generateTrainingTask(module.id, lvl));
      setValue("");
      setWrongOnTask(0);
      setShowHint(false);
      setPhase("asking");
    },
    [taskIndex, module.taskCount, module.id, level]
  );

  function handleSubmit() {
    if (!task || phase === "correct" || phase === "done") return;
    const answer = Number(value);
    if (value.length === 0 || Number.isNaN(answer)) return;

    setAttempts((a) => a + 1);

    if (answer === task.correctAnswer) {
      const nextStreak = { correct: streak.correct + 1, wrong: 0 };
      setStreak(nextStreak);
      setSolved((s) => s + 1);
      if (wrongOnTask === 0) setFirstTry((f) => f + 1);
      setPraise(pickRandom(PRAISE));
      setPhase("correct");
      playFx("magic-chime");
      window.setTimeout(() => advance(nextStreak), SUCCESS_PAUSE_MS);
      return;
    }

    const wrongCount = wrongOnTask + 1;
    const nextStreak = { correct: 0, wrong: streak.wrong + 1 };
    setStreak(nextStreak);
    setWrongOnTask(wrongCount);
    setRetryLine(pickRandom(RETRY));
    setValue("");
    setShowHint(true);
    setPhase(wrongCount >= REVEAL_AFTER ? "reveal" : "retry");
  }

  function handleContinueAfterReveal() {
    setHelped((h) => h + 1);
    advance(streak);
  }

  /**
   * Vorzeitiges Beenden. Was schon gerechnet wurde, wird trotzdem
   * gutgeschrieben — nur der Runden-Zähler bleibt stehen. Abbrechen darf
   * sich nie anfühlen wie „alles umsonst".
   */
  function finishEarly() {
    if (training && !runRecorded.current && attempts > 0) {
      runRecorded.current = true;
      recordRun(training, module.id, {
        solved,
        attempts,
        firstTry,
        level,
        completed: false,
      });
    }
    onExit();
  }

  function restart() {
    runRecorded.current = false;
    setTaskIndex(0);
    setSolved(0);
    setFirstTry(0);
    setHelped(0);
    setAttempts(0);
    setWrongOnTask(0);
    setStreak({ correct: 0, wrong: 0 });
    setValue("");
    setShowHint(false);
    setPhase("asking");
    setTask(generateTrainingTask(module.id, level));
  }

  // --- Rendering ------------------------------------------------------------

  if (phase === "done") {
    return (
      <RoundSummary
        module={module}
        firstTry={firstTry}
        helped={helped}
        onRestart={restart}
        onExit={onExit}
      />
    );
  }

  const progressPercent = Math.round((taskIndex / module.taskCount) * 100);
  const showSolution = phase === "reveal";
  const locked = phase === "correct" || phase === "reveal";

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-8">
      {/* Fortschritt: wie weit ist die Runde? Kein Timer, keine Punktzahl. */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
          <span>
            Aufgabe {Math.min(taskIndex + 1, module.taskCount)} von {module.taskCount}
          </span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !autoRead;
                setAutoRead(next);
                saveAutoRead(next);
                if (!next) speech.stop();
              }}
              aria-pressed={autoRead}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold transition-colors ${
                autoRead
                  ? "bg-[var(--color-mint)] text-[var(--color-mint-deep)]"
                  : "bg-[var(--color-lavender)]/50 text-[var(--color-ink-soft)]"
              }`}
            >
              {autoRead ? <Volume2 size={14} strokeWidth={2} /> : <VolumeX size={14} strokeWidth={2} />}
              Vorlesen
            </button>
            <button
              type="button"
              onClick={() => setShowTrick((s) => !s)}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-lavender)]/50 px-3 py-1 font-semibold text-[var(--color-lavender-deep)]"
            >
              <Lightbulb size={14} strokeWidth={2} />
              {showTrick ? "Trick ausblenden" : "Trick zeigen"}
            </button>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-lavender)]/40" aria-hidden>
          <div
            className={`h-full rounded-full transition-all duration-500 ${accent.strong}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {showTrick ? (
        <div className="mb-6">
          <TrickCard
            trick={module.tricks[0]}
            accent={module.accent}
            moduleId={module.id}
            trickIndex={0}
            speech={speech}
          />
        </div>
      ) : null}

      {/* Aufgabe + Antwortfeld */}
      <div className="mb-6 rounded-[var(--radius-card)] bg-[var(--color-paper)] p-8 text-center shadow-[var(--shadow-soft)]">
        {task ? (
          <>
            <div className="mb-5 flex items-center justify-center gap-4">
              <p className="text-4xl font-semibold tabular-nums leading-tight md:text-5xl">
                {promptWithEquals(task.prompt)}
              </p>
              <SpeakButton speech={speech} text={task.prompt} label="Aufgabe vorlesen" />
            </div>
            <div
              className={`mx-auto flex h-16 w-32 items-center justify-center rounded-2xl border-2 text-4xl font-semibold tabular-nums transition-colors ${
                phase === "correct"
                  ? "border-[var(--color-mint-deep)] bg-[var(--color-mint)]/50"
                  : "border-[var(--color-lavender)] bg-[var(--color-bg)]"
              }`}
              aria-live="polite"
              aria-label="Deine Antwort"
            >
              {value || <span className="text-[var(--color-ink-soft)]/40">?</span>}
            </div>
          </>
        ) : (
          // Vor der Hydration steht noch keine Aufgabe fest — Platzhalter in
          // derselben Höhe, damit nichts springt.
          <div className="h-[8.5rem]" aria-hidden />
        )}
      </div>

      {/* Rückmeldung: Lob, sanfter Hinweis oder Rechenweg. Nie ein „Falsch". */}
      <div className="mb-6 min-h-[3.5rem]">
        {phase === "correct" ? (
          <p className="flex items-center justify-center gap-2 text-lg font-semibold text-[var(--color-mint-deep)]">
            <Sparkles size={20} strokeWidth={1.9} />
            {praise}
          </p>
        ) : null}

        {phase === "retry" ? (
          <p className="mb-2 text-center text-[var(--color-ink-soft)]">{retryLine}</p>
        ) : null}

        {showSolution && task ? (
          <div className="rounded-2xl bg-[var(--color-peach)]/50 px-5 py-4 text-center">
            <p className="mb-1 text-sm font-semibold text-[var(--color-peach-deep)]">
              So geht der Rechenweg:
            </p>
            <div className="mb-3 flex items-start justify-center gap-3">
              <p className="leading-relaxed">{task.solution}</p>
              <SpeakButton
                speech={speech}
                text={task.solution}
                label="Rechenweg vorlesen"
                size="sm"
              />
            </div>
            <button
              type="button"
              onClick={handleContinueAfterReveal}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-peach-deep)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)]"
            >
              Verstanden, weiter
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        ) : null}

        {!showSolution && showHint && task ? (
          <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-lavender)]/40 px-5 py-3 text-sm leading-relaxed">
            <p className="flex-1">
              <span className="font-semibold">Tipp:</span> {task.hint}
            </p>
            <SpeakButton speech={speech} text={task.hint} label="Tipp vorlesen" size="sm" />
          </div>
        ) : null}
      </div>

      <NumberPad
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        disabled={locked || !task}
      />

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={finishEarly}
          className="text-sm text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
        >
          Runde beenden
        </button>
      </div>
    </div>
  );
}

/**
 * Reine Terme („3 + 8") bekommen ein „=" angehängt, damit klar ist, wohin die
 * Antwort gehört. Aufgaben, die schon ein „=" oder „?" enthalten
 * („9 + ? = 10") oder als Frage formuliert sind („Das Doppelte von 15"),
 * bleiben unverändert — dort wäre ein Gleichheitszeichen falsch.
 */
function promptWithEquals(prompt: string): string {
  if (prompt.includes("=") || prompt.includes("?")) return prompt;
  const isBareTerm = /[+−·:]/.test(prompt);
  return isBareTerm ? `${prompt} =` : prompt;
}

// ----- Abschluss der Runde ---------------------------------------------------

function RoundSummary({
  module,
  firstTry,
  helped,
  onRestart,
  onExit,
}: {
  module: TrainingModule;
  firstTry: number;
  helped: number;
  onRestart: () => void;
  onExit: () => void;
}) {
  const accent = ACCENTS[module.accent];
  const next = nextTrainingModule(module.id);

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <div className={`rounded-[var(--radius-card)] p-8 text-center shadow-[var(--shadow-soft)] ${accent.soft}`}>
        <Sparkles className="mx-auto mb-3" size={44} strokeWidth={1.6} />
        <h2 className="mb-2 text-2xl font-semibold">Runde geschafft!</h2>
        <p className="mb-1 text-lg">
          {module.taskCount} Aufgaben gerechnet
        </p>
        <p className="mb-6 text-sm text-[var(--color-ink-soft)]">
          {firstTry} davon auf Anhieb
          {helped > 0 ? ` · ${helped} mit Rechenweg` : ""}
        </p>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[var(--color-lavender-deep)] px-6 py-3 font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
          >
            <RotateCcw size={18} strokeWidth={2} />
            Noch eine Runde
          </button>

          {next ? (
            <Link
              href={`/training/${next.id}`}
              className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[var(--color-paper)] px-6 py-3 font-semibold shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
            >
              Weiter: {next.title}
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={onExit}
            className="text-sm text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
          >
            Zurück zum Trick
          </button>
        </div>
      </div>
    </div>
  );
}
