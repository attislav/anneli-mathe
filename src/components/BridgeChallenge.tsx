"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import { AudioButton } from "./AudioButton";
import { BookSays } from "./BookSays";
import { useSoundFx } from "@/lib/useSoundFx";
import { BridgeInput, type InputStatus } from "./inputs";

// ----- Konstanten ------------------------------------------------------------

/** Quips, die bei „nochmal versuchen" angezeigt werden (kein „falsch!").
 *  `{bird}` wird beim Rendern durch den persistierten Vogel-Namen ersetzt
 *  (Default: Pip). So fühlt sich der Begleiter persönlich an, ohne dass wir
 *  pro Anneli neue Audios brauchen — die Audio-Datei bleibt mit „Pip"
 *  generiert, der Text auf dem Screen ist dynamisch. */
const RETRY_QUIPS = [
  { text: "Probier es nochmal — {bird} glaubt an dich.", audio: "quip-wrong-1" },
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

/**
 * Warm-Up-Override (M4): bei mehr Aufgaben pro Brücke fühlt sich ein
 * sofortiger Start auf „normal" oder „hard" überrumpelnd an. Wir geben
 * Anneli 2 sanfte Einstiegs-Aufgaben und steigern dann.
 *
 *   index 0 (1. Aufgabe): immer easy
 *   index 1 (2. Aufgabe): easy → easy, normal → easy, hard → normal
 *   ab index 2: adaptiveLevel wie gehabt
 *
 * Stretch-Cap am Ende: in der allerletzten Aufgabe nicht erstmalig auf
 * „hard" hochschalten — der Abschluss soll ein Erfolgserlebnis sein.
 */
function applyWarmup(
  baseLevel: Level,
  taskIndex: number,
  totalTasks: number,
  isFinalTask: boolean
): Level {
  if (taskIndex === 0) return "easy";
  if (taskIndex === 1) {
    if (baseLevel === "hard") return "normal";
    return "easy";
  }
  // Letzte Aufgabe: kein neuer hard-Sprung, aber falls Anneli schon auf
  // hard war, dort bleiben.
  if (isFinalTask && baseLevel === "hard" && totalTasks >= 8) {
    return "normal";
  }
  return baseLevel;
}

// ----- Component -------------------------------------------------------------

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
    // Initial 1 Aufgabe — Warmup-Override: erste Aufgabe immer easy.
    // Die folgenden werden adaptiv nachgeneriert (siehe handleAnswer).
    return [generateExercise(bridge.skill, "easy")];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge.id]);

  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tasksDone, setTasksDone] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState({ correct: 0, wrong: 0 });
  const [wrongInARow, setWrongInARow] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const [status, setStatus] = useState<InputStatus>("asking");
  const [retryQuip, setRetryQuip] = useState<typeof RETRY_QUIPS[number] | null>(null);
  const [stepQuip, setStepQuip] = useState<typeof STEP_SUCCESS_QUIPS[number] | null>(null);
  const playFx = useSoundFx();

  // Beim Betreten der Brücke einmalig knarzen — Atmosphäre, kein Game-Over-Vibe.
  // (Datei darf fehlen, useSoundFx scheitert leise.)
  useEffect(() => {
    const t = window.setTimeout(() => playFx("bridge-creak"), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge.id]);

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

  // ----- Hint-Timer: nach HINT_DELAY_MS Tipp einblenden ---------------------
  // Input-Komponenten managen ihren eigenen "in progress"-State (z.B. ob
  // Anneli schon getippt hat) — wir können das hier nicht mehr generisch
  // wissen. Pragmatisch: Hint blendet trotzdem nach 8s ein, wenn der Status
  // "asking" ist und der Tap-Timer läuft.

  useEffect(() => {
    if (status !== "asking") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowHint(false);
    const timer = window.setTimeout(() => setShowHint(true), HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [currentIndex, status]);

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

  // ----- Antwort-Handler (vom Input-Component aufgerufen) -------------------

  function handleAnswer(answer: number) {
    if (!hasGenerator || !current) return;
    if (status === "step-success" || status === "complete") return;

    const isCorrect = answer === current.correctAnswer;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (isCorrect) {
      const nextDone = tasksDone + 1;
      const nextStreak = { correct: streak.correct + 1, wrong: 0 };
      setTasksDone(nextDone);
      setStreak(nextStreak);
      setWrongInARow(0);
      setStepQuip(pickRandom(STEP_SUCCESS_QUIPS));

      // Magisches Glöckchen — sanftes Erfolgs-Signal, kein Arcade-Buzzer.
      playFx("magic-chime");

      if (nextDone >= totalTasks) {
        // Alle Aufgaben geschafft → Brücke ist repariert.
        setStatus("complete");
        // Bei Brücken-Abschluss zusätzlich Vogel-Chirp.
        window.setTimeout(() => playFx("bird-chirp"), 600);
        return;
      }

      setStatus("step-success");
      // Kurze Pause, dann nächste Aufgabe generieren.
      window.setTimeout(() => {
        const newLevel = nextLevel(level, nextStreak);
        if (newLevel !== level) setLevel(newLevel);
        // Warm-Up + End-Cap auf das frisch berechnete Level anwenden.
        const upcomingIndex = currentIndex + 1; // wir hängen am Ende an
        const isFinalTask = upcomingIndex === totalTasks - 1;
        const effectiveLevel = applyWarmup(newLevel, upcomingIndex, totalTasks, isFinalTask);
        const nextEx = generateExercise(bridge.skill, effectiveLevel);
        setExercises((prev) => [...prev, nextEx]);
        setCurrentIndex((i) => i + 1);
        setStatus("asking");
        setRetryQuip(null);
        setStepQuip(null);
        setShowHint(false);
        // Streak zurücksetzen nur nach Level-Wechsel (Streak ist die Trigger-Größe).
        if (newLevel !== level) setStreak({ correct: 0, wrong: 0 });
      }, 850);
    } else {
      const nextWrongInRow = wrongInARow + 1;
      const nextStreak = { correct: 0, wrong: streak.wrong + 1 };
      setStreak(nextStreak);
      setWrongInARow(nextWrongInRow);
      setRetryQuip(pickRandom(RETRY_QUIPS));
      setStatus("retry");
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

      // Nach kurzer Pause zurück zu "asking" — damit der Input wieder aktiv ist.
      window.setTimeout(() => setStatus((s) => (s === "retry" ? "asking" : s)), 900);
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

      {/* Brücken-Bild: solange Aufgaben laufen, zeigen wir die wackelige
          (kaputte) Brücke mit sanftem Wackeln — kein Stress-Effekt, nur leise
          Atmosphäre. Sobald alle Aufgaben gelöst sind, wird das Bild in der
          CompleteCard durch die reparierte Variante ersetzt. */}
      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]">
        <Image
          src={`/bridges/${bridge.id}/${status === "complete" ? "repaired" : "broken"}.png`}
          alt={`${bridge.name} — ${status === "complete" ? "repariert" : "wackelig"}`}
          width={1024}
          height={1024}
          priority
          className={`h-full w-full object-cover ${
            status === "complete" ? "" : "animate-bridge-wobble"
          }`}
        />
      </div>

      <div className="mb-2 inline-flex items-center justify-center rounded-full bg-[var(--color-mint)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-mint-deep)]">
        Brücke {bridge.order} · {bridge.skillLabel}
      </div>
      <h1 className="mb-2 text-3xl font-semibold md:text-4xl">{bridge.name}</h1>
      <p className="mb-4 text-[var(--color-ink-soft)]">{bridge.description}</p>

      {/* Story-Intro: 1-Satz-Beat vom Buch VOR der ersten Aufgabe. Audio nutzt
          die existierende `bridge-<id>-hint`-Vertonung, die ebenfalls vom Buch
          gesprochen wird — gleicher Sprecher, also tonlich konsistent. So
          hören wir die Story, sie wird nicht nur gelesen. */}
      {status !== "complete" ? (
        <BookSays audio={`bridge-${bridge.id}-hint`}>{bridge.story_intro}</BookSays>
      ) : null}

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
        <>
          {/* Abschluss-Beat vom Buch — die Story geht weiter, sobald die
              Brücke repariert ist. Audio-ID `bridge-<id>-complete` ist
              optional (vorerst nicht vertont): AudioButton scheitert leise,
              wenn die mp3 fehlt. Wenn wir später `npm run gen:narration` mit
              den completion_beats laufen lassen, klingt's auch. */}
          <BookSays audio={`bridge-${bridge.id}-complete`}>{bridge.completion_beat}</BookSays>
          <CompleteCard bridge={bridge} tasksDone={tasksDone} attempts={attempts} />
        </>
      ) : (
        <div className="rounded-[var(--radius-card)] bg-[var(--color-paper)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
          {current.vignette ? (
            <p className="mb-4 text-center text-base italic leading-relaxed text-[var(--color-ink-soft)]">
              {current.vignette}
            </p>
          ) : null}

          <p className="mb-6 whitespace-pre-line text-center text-2xl font-medium">
            {current.prompt}
          </p>

          {/* Input-Modus-Switch: jede Brücke hat ihren eigenen Mechanismus. */}
          <BridgeInput
            mode={bridge.inputMode}
            exercise={current}
            status={status}
            onSubmit={handleAnswer}
            disabled={status === "step-success"}
          />

          {/* Hint-System: kein "falsch!"-Buzzer, nur sanfter Tipp.
              `{bird}`-Platzhalter wird hier durch Annelis Vogel-Namen ersetzt. */}
          {status === "retry" && retryQuip ? (
            <div className="mt-6 flex items-center justify-center gap-3 text-base text-[var(--color-ink-soft)]">
              <p>
                {retryQuip.text.replace("{bird}", progress?.birdName ?? "Pip")}
              </p>
              <AudioButton src={audioSrc(retryQuip.audio)} />
            </div>
          ) : null}

          {showHint && status !== "step-success" ? (
            <div className="mt-6 rounded-2xl bg-[var(--color-lavender)]/40 px-5 py-3 text-center text-sm text-[var(--color-ink)]">
              <span className="font-semibold">Tipp:</span>{" "}
              {/* Gestaffelter Hint aus der `hint_chain` der Brücke:
                  0 falsche Versuche → Stufe 0 (sanft),
                  1 falsch → Stufe 1 (konkreter),
                  ≥2 falsch → Stufe 2 (Anleitung).
                  Fallback auf den aufgabenspezifischen `exercise.hint`, wenn
                  die Brücke nur einen Eintrag hat — so bleibt der Generator-
                  Hint nicht ungenutzt. */}
              {bridge.hint_chain[Math.min(wrongInARow, bridge.hint_chain.length - 1)] ??
                current.hint ??
                "Schau nochmal genau hin."}
            </div>
          ) : null}

          {status === "step-success" && stepQuip ? (
            <div className="mt-6 flex items-center justify-center gap-2 text-base font-semibold text-[var(--color-mint-deep)]">
              <Sparkles size={20} strokeWidth={1.8} />
              <span>{stepQuip.text}</span>
            </div>
          ) : null}
        </div>
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
