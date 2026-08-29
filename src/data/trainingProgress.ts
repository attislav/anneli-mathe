// Persistenz für das Kopfrechnen-Training.
//
// BEWUSST GETRENNT vom Story-Fortschritt (`anneli.progress.v1`): Training
// und Geschichte sind zwei unabhängige Wege durch die App. Wer nur rechnet,
// verändert die Geschichte nicht — und umgekehrt.
//
// Schlüssel: `anneli.training.v1` (versioniert für spätere Migrationen).
// Alle Funktionen sind SSR-safe und schlucken Parse-/Quota-Fehler still:
// Persistenz ist Komfort, kein Muss.
//
// Was wir zählen (und was nicht): wir zählen RUNDEN und gelöste Aufgaben —
// also „dran sein". Es gibt bewusst KEINE Fehlerquote als sichtbare Note.
// Die Trefferquote steckt nur im Adaptive-Level und im Eltern-Blick.

import type { Level } from "@/data/exercises/types";

const STORAGE_KEY = "anneli.training.v1";

/** Ab so vielen abgeschlossenen Runden gilt ein Modul als „geübt". */
export const RUNS_FOR_MASTERY = 3;

export type ModuleProgress = {
  /** Abgeschlossene Übungsrunden. */
  runs: number;
  /** Richtig gelöste Aufgaben insgesamt (über alle Runden). */
  solved: number;
  /** Antwort-Versuche insgesamt — für die Trefferquote im Eltern-Blick. */
  attempts: number;
  /** Beste Runde: wie viele Aufgaben auf Anhieb richtig waren. */
  bestFirstTry: number;
  /** Adaptives Level, über Sessions hinweg gemerkt. */
  level: Level;
  /** ISO-Timestamp der letzten Runde. */
  lastPlayed: string | null;
};

export type TrainingState = {
  modules: Record<string, ModuleProgress>;
};

export const EMPTY_MODULE_PROGRESS: ModuleProgress = {
  runs: 0,
  solved: 0,
  attempts: 0,
  bestFirstTry: 0,
  level: "normal",
  lastPlayed: null,
};

export function loadTraining(): TrainingState {
  if (typeof window === "undefined") return { modules: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { modules: {} };
    const parsed = JSON.parse(raw) as Partial<TrainingState>;
    return {
      modules: parsed.modules && typeof parsed.modules === "object" ? parsed.modules : {},
    };
  } catch {
    return { modules: {} };
  }
}

export function saveTraining(state: TrainingState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota voll oder Storage aus — dann eben ohne Speichern weiterspielen.
  }
}

export function getModuleProgress(state: TrainingState | null, moduleId: string): ModuleProgress {
  return state?.modules[moduleId] ?? EMPTY_MODULE_PROGRESS;
}

/**
 * Schreibt das Ergebnis einer Runde fort.
 *
 * `completed` unterscheidet die zu Ende gespielte Runde vom vorzeitigen
 * Abbruch: gerechnete Aufgaben zählen in beiden Fällen, der Runden-Zähler
 * (die Punkte auf der Modul-Karte) erhöht sich nur bei einer ganzen Runde.
 *
 * Idempotent ist das NICHT — pro Runde genau einmal aufrufen.
 */
export function recordRun(
  state: TrainingState,
  moduleId: string,
  run: {
    solved: number;
    attempts: number;
    firstTry: number;
    level: Level;
    completed: boolean;
  }
): TrainingState {
  const prev = getModuleProgress(state, moduleId);
  const next: TrainingState = {
    modules: {
      ...state.modules,
      [moduleId]: {
        runs: prev.runs + (run.completed ? 1 : 0),
        solved: prev.solved + run.solved,
        attempts: prev.attempts + run.attempts,
        bestFirstTry: Math.max(prev.bestFirstTry, run.firstTry),
        level: run.level,
        lastPlayed: new Date().toISOString(),
      },
    },
  };
  saveTraining(next);
  return next;
}

/** Wie viele Module wurden mindestens einmal geübt? */
export function modulesTouched(state: TrainingState | null): number {
  if (!state) return 0;
  return Object.values(state.modules).filter((m) => m.runs > 0).length;
}

/** Insgesamt gelöste Aufgaben über alle Module — die „große Zahl" der Startseite. */
export function totalSolved(state: TrainingState | null): number {
  if (!state) return 0;
  return Object.values(state.modules).reduce((sum, m) => sum + m.solved, 0);
}
