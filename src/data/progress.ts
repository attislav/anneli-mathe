// Persistenz für den Spielstand: welche Brücken sind fertig, wie viele
// Aufgaben hat Anneli pro Brücke richtig gelöst, was war der letzte Versuch.
//
// Storage: localStorage (Sprint Wo 1). Cloud-Sync (Supabase) ist im Backlog.
//
// Schlüssel: `anneli.progress.v1` (versioniert, damit wir Schema-Brüche
// später migrieren können statt alte Daten zu kaputtmachen).
//
// Der gesamte State ist ein JSON-Objekt — bei Read/Write defensiv: jede
// Funktion ist SSR-safe (prüft `typeof window`), parse-Fehler werden
// stillschweigend als "kein Stand" interpretiert und der Default geliefert.

import type { Skill } from "./bridges";

const STORAGE_KEY = "anneli.progress.v1";

export type BridgeStatus = "todo" | "in-progress" | "done";

export type BridgeProgress = {
  status: BridgeStatus;
  /** Anzahl korrekt gelöster Aufgaben in der laufenden / letzten Session. */
  tasksDone: number;
  /** Anzahl Versuche total (richtig + falsch) in der letzten Session. */
  attempts: number;
  /** ISO-Timestamp des letzten Status-Wechsels. */
  updatedAt: string;
};

export type ProgressState = {
  /** Vogel-Begleiter Name (Onboarding-Frage). Default „Pip". */
  birdName: string;
  /** Brücken-Status pro Brücken-ID. */
  bridges: Record<string, BridgeProgress>;
  /** Adaptive-Level pro Skill — wird über Sessions hinweg gemerkt. */
  skillLevel: Partial<Record<Skill, "easy" | "normal" | "hard">>;
};

const DEFAULT_STATE: ProgressState = {
  birdName: "Pip",
  bridges: {},
  skillLevel: {},
};

/**
 * Lädt den aktuellen Spielstand aus localStorage.
 * SSR-safe: gibt unter Node immer den Default zurück.
 */
export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return cloneDefault();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      birdName: typeof parsed.birdName === "string" ? parsed.birdName : DEFAULT_STATE.birdName,
      bridges: parsed.bridges && typeof parsed.bridges === "object" ? parsed.bridges : {},
      skillLevel: parsed.skillLevel && typeof parsed.skillLevel === "object" ? parsed.skillLevel : {},
    };
  } catch {
    return cloneDefault();
  }
}

/**
 * Schreibt den State zurück nach localStorage. Stillschweigend bei Quota /
 * Privacy-Mode — Persistenz ist Nice-to-Have, nicht Pflicht.
 */
export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota voll oder Storage disabled — wir akzeptieren, dass dann
    // halt nichts persistiert wird.
  }
}

/**
 * Liest den Status einer einzelnen Brücke, default = todo.
 */
export function getBridgeProgress(state: ProgressState, bridgeId: string): BridgeProgress {
  return (
    state.bridges[bridgeId] ?? {
      status: "todo",
      tasksDone: 0,
      attempts: 0,
      updatedAt: new Date(0).toISOString(),
    }
  );
}

/**
 * Markiert eine Brücke als „done" und schreibt den State zurück.
 * Idempotent: mehrfaches Aufrufen schadet nicht.
 */
export function markBridgeDone(
  state: ProgressState,
  bridgeId: string,
  finalStats: { tasksDone: number; attempts: number }
): ProgressState {
  const next: ProgressState = {
    ...state,
    bridges: {
      ...state.bridges,
      [bridgeId]: {
        status: "done",
        tasksDone: finalStats.tasksDone,
        attempts: finalStats.attempts,
        updatedAt: new Date().toISOString(),
      },
    },
  };
  saveProgress(next);
  return next;
}

/**
 * Setzt das Adaptive-Level für einen Skill (z.B. wenn Anneli mehrere
 * Sessions am Stück Bridge X souverän schafft, bleibt sie auf "hard").
 */
export function setSkillLevel(
  state: ProgressState,
  skill: Skill,
  level: "easy" | "normal" | "hard"
): ProgressState {
  const next: ProgressState = {
    ...state,
    skillLevel: { ...state.skillLevel, [skill]: level },
  };
  saveProgress(next);
  return next;
}

/**
 * Setzt den Vogel-Namen (Onboarding-Frage).
 */
export function setBirdName(state: ProgressState, name: string): ProgressState {
  const cleaned = name.trim().slice(0, 24);
  if (!cleaned) return state;
  const next: ProgressState = { ...state, birdName: cleaned };
  saveProgress(next);
  return next;
}

/**
 * Aggregierte Statistik: wie viele der 6 Brücken sind fertig?
 */
export function bridgesDoneCount(state: ProgressState): number {
  return Object.values(state.bridges).filter((b) => b.status === "done").length;
}

function cloneDefault(): ProgressState {
  return {
    birdName: DEFAULT_STATE.birdName,
    bridges: {},
    skillLevel: {},
  };
}
