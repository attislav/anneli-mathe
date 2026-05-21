"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Feather } from "lucide-react";
import type { Bridge } from "@/data/bridges";
import { audioSrc } from "@/data/narration";
import { generateExercise, hasGeneratorFor, type Exercise, type Level } from "@/data/exercises";
import {
  loadProgress,
  markBridgeDone,
  setSkillLevel,
  type ProgressState,
} from "@/data/progress";
import { MathInput } from "./MathInput";
import { AudioButton } from "./AudioButton";

// ----- Konstanten ------------------------------------------------------------

/** Quips, die bei „nochmal versuchen" angezeigt werden (kein „falsch!"). */
const RETRY_QUIPS = [
  { text: "Probier es nochmal — Pip glaubt an dich.", audio: "quip-wrong-1" },
  { text: "Beinahe! Die Brücke wackelt nur — sie hält noch.", audio: "quip-wrong-2" },
  { text: "Hmmm. Lass uns das nochmal zusammen anschauen.", audio: "quip-wrong-3" },
  { text: "Fast! Atme einmal tief durch und versuch's nochmal.", audio: "quip-wrong-4" },
] as const;

/** Kleine Freude-Quips nach einer einzelnen richtigen Aufgabe. */
const STEP_SUCCESS_QUIPS = [
  { text: "Genau!", audio: "quip-success-1" },
  { text: "Das sitzt.", audio: "quip-success-2" },
] as const;

/** Tipp-Verzögerung in ms — nach so vielen ms ohne Antwort blendet der Hint ein. */
const HINT_DELAY_MS = 8000;

// ----- Helpers ---------------------------------------------------------------

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Adaptive-Update: liefert das Level der NÄCHSTEN Aufgabe basierend
 * auf den letzten Antworten. Rolling Streaks:
 *   - 3 richtig in Folge → eine Stufe höher (cap "hard")
 *   - 2 falsch in Folge → eine Stufe runter (cap "easy")
 *   - sonst gleich bleiben
 */
function nextLevel(current: Level, streak: { correct: number; wrong: number }): Level {
  if (streak.correct >= 3) {
    if (current === "easy") return "normal";
    if (current === "normal") return "hard";
    return "hard";
  }
  if (streak.wrong >= 2) {
    if (current === "hard") return "normal";
    if (current === "normal") return "easy";
    return "easy";
  }
  return current;
}

// ----- Component -------------------------------------------------------------

type Status = "asking" | "retry" | "step-success" | "complete";

export function BridgeChallenge({ bridge }: { bridge: Bridge }) {
  // ----- State (Persistenz + Adaptive) --------------------------------------

  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [level, setLevel] = useState<Level>("normal");

  useEffect(() => {
    // Persistenz erst client-side — sauberes Hydration-Verhalten.
    // localStorage gibt es nicht auf dem Server, also müssen wir hier mit
    // setState arbeiten. Das ist genau das, was der Lint-Hint diskutiert,
    // aber für SSR-safe localStorage-Hydration der dokumentierte Weg.
    const loaded = loadProgress();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loaded);
    setLevel(loaded.skillLevel[bridge.skill] ?? "normal");
  }, [bridge.skill]);

  // ----- Aufgaben-Liste (lazy, generiert beim ersten Render) ----------------

  const totalTasks = bridge.totalTasks;
  const hasGenerator = hasGeneratorFor(bridge.skill);
  const initialExercises = useMemo<Exercise[]>(() => {
    if (!hasGenerator) {
      // Fallback: ein einziger Placeholder, damit die UI nicht crasht.
      return [
        {
          id: "placeholder",
          skill: bridge.skill,
          prompt: "Diese Brücke wird gerade noch gebaut.",
          correctAnswer: 0,
          level: "normal",
        },
      ];
    }
    // Initial 1 Aufgabe — die folgenden werden adaptiv nachgeneriert.
    return [generateExercise(bridge.skill, "normal")];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge.id]);

  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tasksDone, setTasksDone] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState({ correct: 0, wrong: 0 });
  const [wrongInARow, setWrongInARow] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const [retryQuip, setRetryQuip] = useState<typeof RETRY_QUIPS[number] | null>(null);
  const [stepQuip, setStepQuip] = useState<typeof STEP_SUCCESS_QUIPS[number] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = exercises[currentIndex];

  // ----- Auto-Play der Audio-Quips ------------------------------------------

  useEffect(() => {
    if (status === "retry" && retryQuip) {
      new Audio(audioSrc(retryQuip.audio)).play().catch(() => {});
    }
    if (status === "step-success" && stepQuip) {
      new Audio(audioSrc(stepQuip.audio)).play().catch(() => {});
    }
  }, [status, retryQuip, stepQuip]);

  // ----- Hint-Timer: nach HINT_DELAY_MS ohne Eingabe Tipp einblenden --------

  useEffect(() => {
    if (status !== "asking") return;
    if (value.length > 0) return; // Anneli ist dabei zu tippen — kein Druck.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowHint(false);
    const timer = window.setTimeout(() => setShowHint(true), HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [currentIndex, status, value]);

  // ----- Bridge-Abschluss persistieren --------------------------------------

  useEffect(() => {
    if (status !== "complete") return;
    if (!progress) return;
    const updated = markBridgeDone(progress, bridge.id, {
      tasksDone,
      attempts,
    });
    const withLevel = setSkillLevel(updated, bridge.skill, level);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(withLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ----- Handler -------------------------------------------------------------

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasGenerator || !current) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;

    const isCorrect = parsed === current.correctAnswer;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (isCorrect) {
      const nextDone = tasksDone + 1;
      const nextStreak = { correct: streak.correct + 1, wrong: 0 };
      setTasksDone(nextDone);
      setStreak(nextStreak);
      setWrongInARow(0);
      setStepQuip(pickRandom(STEP_SUCCESS_QUIPS));

      if (nextDone >= totalTasks) {
        // Alle Aufgaben geschafft → Brücke ist repariert.
        setStatus("complete");
        return;
      }

      setStatus("step-success");
      // Kurze Pause, dann nächste Aufgabe generieren.
      window.setTimeout(() => {
        const newLevel = nextLevel(level, nextStreak);
        if (newLevel !== level) setLevel(newLevel);
        const nextEx = generateExercise(bridge.skill, newLevel);
        setExercises((prev) => [...prev, nextEx]);
        setCurrentIndex((i) => i + 1);
        setValue("");
        setStatus("asking");
        setRetryQuip(null);
        setStepQuip(null);
        setShowHint(false);
        // Streak zurücksetzen nur nach Level-Wechsel (Streak ist die Trigger-Größe).
        if (newLevel !== level) setStreak({ correct: 0, wrong: 0 });
        requestAnimationFrame(() => inputRef.current?.focus());
      }, 850);
    } else {
      const nextWrongInRow = wrongInARow + 1;
      const nextStreak = { correct: 0, wrong: streak.wrong + 1 };
      setStreak(nextStreak);
      setWrongInARow(nextWrongInRow);
      setRetryQuip(pickRandom(RETRY_QUIPS));
      setStatus("retry");
      setValue("");
      setShowHint(true); // Bei falsch sofort Hint zeigen.

      // Nach 3× falsch derselben Aufgabe: leichtere Variante anbieten.
      if (nextWrongInRow >= 3 && hasGenerator) {
        const easierLevel: Level = level === "hard" ? "normal" : "easy";
        const replacement = generateExercise(bridge.skill, easierLevel);
        // Aufgabe an aktueller Stelle ersetzen, Counter reset.
        setExercises((prev) => {
          const copy = [...prev];
          copy[currentIndex] = replacement;
          return copy;
        });
        setWrongInARow(0);
        if (easierLevel !== level) setLevel(easierLevel);
        setStreak({ correct: 0, wrong: 0 });
      }

      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  // ----- Rendering ----------------------------------------------------------

  if (!hasGenerator || !current) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <Link
          href="/quest/sky-kingdom"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={16} />
          Zurück zur Karte
        </Link>
        <h1 className="mb-4 text-3xl font-semibold">{bridge.name}</h1>
        <p className="text-[var(--color-ink-soft)]">
          Diese Brücke wird gerade noch gebaut. Schau bald wieder vorbei.
        </p>
      </div>
    );
  }

  const progressPercent = Math.round((tasksDone / totalTasks) * 100);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href="/quest/sky-kingdom"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} />
        Zurück zur Karte
      </Link>

      <div className="mb-2 inline-flex items-center justify-center rounded-full bg-[var(--color-mint)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-mint-deep)]">
        Brücke {bridge.order} · {bridge.skillLabel}
      </div>
      <h1 className="mb-2 text-3xl font-semibold md:text-4xl">{bridge.name}</h1>
      <p className="mb-6 text-[var(--color-ink-soft)]">{bridge.description}</p>

      {/* Progressbar — sichtbarer Fortschritt der Brücken-Reparatur. */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
          <span>
            Aufgabe {Math.min(tasksDone + (status === "complete" ? 0 : 1), totalTasks)} von{" "}
            {totalTasks}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-lavender)]/40"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-[var(--color-mint-deep)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {status === "complete" ? (
        <CompleteCard bridge={bridge} tasksDone={tasksDone} attempts={attempts} />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-[var(--radius-card)] bg-[var(--color-paper)] p-8 shadow-[var(--shadow-soft)]"
        >
          {current.vignette ? (
            <p className="mb-4 text-center text-base italic leading-relaxed text-[var(--color-ink-soft)]">
              {current.vignette}
            </p>
          ) : null}

          <p className="mb-6 whitespace-pre-line text-center text-2xl font-medium">
            {current.prompt}
          </p>

          <div className="mb-6 flex justify-center">
            <MathInput
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              aria-label="Deine Antwort"
              disabled={status === "step-success"}
            />
          </div>

          {/* Hint-System: kein "falsch!"-Buzzer, nur sanfter Tipp. */}
          {status === "retry" && retryQuip ? (
            <div className="mb-4 flex items-center justify-center gap-3 text-base text-[var(--color-ink-soft)]">
              <p>{retryQuip.text}</p>
              <AudioButton src={audioSrc(retryQuip.audio)} />
            </div>
          ) : null}

          {showHint && current.hint && status !== "step-success" ? (
            <div className="mb-6 rounded-2xl bg-[var(--color-lavender)]/40 px-5 py-3 text-center text-sm text-[var(--color-ink)]">
              <span className="font-semibold">Tipp:</span> {current.hint}
            </div>
          ) : null}

          {status === "step-success" && stepQuip ? (
            <div className="mb-4 flex items-center justify-center gap-2 text-base font-semibold text-[var(--color-mint-deep)]">
              <Sparkles size={20} strokeWidth={1.8} />
              <span>{stepQuip.text}</span>
            </div>
          ) : null}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={value.length === 0 || status === "step-success"}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-lavender-deep)] px-6 py-3 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              Brücke prüfen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ----- Sub-Komponenten -------------------------------------------------------

function CompleteCard({
  bridge,
  tasksDone,
  attempts,
}: {
  bridge: Bridge;
  tasksDone: number;
  attempts: number;
}) {
  const accuracyPct = attempts > 0 ? Math.round((tasksDone / attempts) * 100) : 100;
  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-mint)] p-8 text-center shadow-[var(--shadow-soft)]">
      <Feather
        className="mx-auto mb-3 text-[var(--color-mint-deep)]"
        size={48}
        strokeWidth={1.6}
      />
      <p className="mb-2 text-lg font-semibold text-[var(--color-mint-deep)]">
        Du hast die {bridge.name} repariert!
      </p>
      <p className="mb-6 text-sm text-[var(--color-ink-soft)]">
        {tasksDone} Aufgaben geschafft · {accuracyPct}% Treffer
      </p>
      <Link
        href="/quest/sky-kingdom"
        className="inline-flex items-center justify-center rounded-full bg-[var(--color-mint-deep)] px-6 py-3 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
      >
        Weiter zur Karte →
      </Link>
    </div>
  );
}
