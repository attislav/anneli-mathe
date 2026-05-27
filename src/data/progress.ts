// Persistenz für den Spielstand: welche Brücken sind fertig, wie viele
// Aufgaben hat Anneli pro Brücke richtig gelöst, was war der letzte Versuch.
//
// Storage: localStorage (Sprint Wo 1). Cloud-Sync (Supabase) ist im Backlog.
//
// Schlüssel:
//   - `anneli.progress.v2` (CURRENT) — versioniert mit Schema-Version-Feld
//   - `anneli.progress.v1` (LEGACY) — wird beim Laden migriert, dann gelöscht.
//
// Schema-Wechsel v1 → v2 (M4, 2026-05-27):
//   v1 hatte tasksDone-Zahlen, die auf damals kleinere `totalTasks` (4-6)
//   referenzierten. Mit M4 haben Brücken jetzt 7-10 Aufgaben — alte
//   tasksDone-Werte sind nicht mehr „aufschlussreich", aber der Status `done`
//   bleibt gültig. Beim Migrieren cappen wir tasksDone auf einen vernünftigen
//   Maximalwert; das Häkchen „fertig" zeigt die SkyMap nach `status === done`,
//   nicht nach Aufgabenanzahl. Kein Datenverlust für Anneli.
//
// Der gesamte State ist ein JSON-Objekt — bei Read/Write defensiv: jede
// Funktion ist SSR-safe (prüft `typeof window`), parse-Fehler werden
// stillschweigend als "kein Stand" interpretiert und der Default geliefert.

import type { Skill } from "./bridges";

const STORAGE_KEY_V2 = "anneli.progress.v2";
const STORAGE_KEY_V1 = "anneli.progress.v1";
const SCHEMA_VERSION = 2 as const;

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
  /** Schema-Version (für künftige Migrationen). */
  schemaVersion: typeof SCHEMA_VERSION;
  /** Vogel-Begleiter Name (Onboarding-Frage). Default „Pip". */
  birdName: string;
  /** Brücken-Status pro Brücken-ID. */
  bridges: Record<string, BridgeProgress>;
  /** Adaptive-Level pro Skill — wird über Sessions hinweg gemerkt. */
  skillLevel: Partial<Record<Skill, "easy" | "normal" | "hard">>;
};

const DEFAULT_STATE: ProgressState = {
  schemaVersion: SCHEMA_VERSION,
  birdName: "Pip",
  bridges: {},
  skillLevel: {},
};

/**
 * Lädt den aktuellen Spielstand aus localStorage.
 * SSR-safe: gibt unter Node immer den Default zurück.
 *
 * Migrations-Pfad:
 *   1) Prüfe v2 — direkt zurück, wenn vorhanden.
 *   2) Sonst v1 — migriere zu v2, schreibe v2 zurück, lösche v1.
 *   3) Sonst Default.
 */
export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return cloneDefault();

  // v2 lesen
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return normalize(parsed);
    }
  } catch {
    // ignore — wir versuchen v1
  }

  // v1 → v2 Migration
  try {
    const rawV1 = window.localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const v1 = JSON.parse(rawV1) as {
        birdName?: string;
        bridges?: Record<string, Partial<BridgeProgress>>;
        skillLevel?: Partial<Record<Skill, "easy" | "normal" | "hard">>;
      };
      const migrated: ProgressState = {
        schemaVersion: SCHEMA_VERSION,
        birdName: typeof v1.birdName === "string" ? v1.birdName : DEFAULT_STATE.birdName,
        bridges: migrateBridges(v1.bridges ?? {}),
        skillLevel:
          v1.skillLevel && typeof v1.skillLevel === "object" ? v1.skillLevel : {},
      };
      saveProgress(migrated);
      // alten Schlüssel aufräumen — wir haben jetzt v2.
      try {
        window.localStorage.removeItem(STORAGE_KEY_V1);
      } catch {
        // ignore
      }
      return migrated;
    }
  } catch {
    // ignore — Default
  }

  return cloneDefault();
}

/**
 * Schreibt den State zurück nach localStorage. Stillschweigend bei Quota /
 * Privacy-Mode — Persistenz ist Nice-to-Have, nicht Pflicht.
 */
export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  try {
    const withVersion: ProgressState = {
      ...state,
      schemaVersion: SCHEMA_VERSION,
    };
    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(withVersion));
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

// ----- Helpers ---------------------------------------------------------------

function cloneDefault(): ProgressState {
  return {
    schemaVersion: SCHEMA_VERSION,
    birdName: DEFAULT_STATE.birdName,
    bridges: {},
    skillLevel: {},
  };
}

/** Normalisiert beliebige v2-Inputs auf einen validen ProgressState. */
function normalize(parsed: Partial<ProgressState>): ProgressState {
  return {
    schemaVersion: SCHEMA_VERSION,
    birdName:
      typeof parsed.birdName === "string" && parsed.birdName.trim()
        ? parsed.birdName
        : DEFAULT_STATE.birdName,
    bridges:
      parsed.bridges && typeof parsed.bridges === "object"
        ? normalizeBridges(parsed.bridges)
        : {},
    skillLevel:
      parsed.skillLevel && typeof parsed.skillLevel === "object" ? parsed.skillLevel : {},
  };
}

function normalizeBridges(
  raw: Record<string, Partial<BridgeProgress>>
): Record<string, BridgeProgress> {
  const out: Record<string, BridgeProgress> = {};
  for (const [id, bp] of Object.entries(raw)) {
    if (!bp || typeof bp !== "object") continue;
    out[id] = {
      status: bp.status === "done" || bp.status === "in-progress" ? bp.status : "todo",
      tasksDone: typeof bp.tasksDone === "number" ? Math.max(0, Math.floor(bp.tasksDone)) : 0,
      attempts: typeof bp.attempts === "number" ? Math.max(0, Math.floor(bp.attempts)) : 0,
      updatedAt:
        typeof bp.updatedAt === "string" ? bp.updatedAt : new Date(0).toISOString(),
    };
  }
  return out;
}

/**
 * Migriert die `bridges`-Map von v1 auf v2.
 * v1-Schema hatte exakt dieselben Felder pro Brücke — kein struktureller
 * Bruch, aber wir lassen den Code defensiv die Werte normalisieren.
 * `tasksDone` aus v1 referenziert kleinere `totalTasks` — wir behalten den
 * historischen Wert, das SkyMap-Häkchen hängt nur am `status`.
 */
function migrateBridges(
  raw: Record<string, Partial<BridgeProgress>>
): Record<string, BridgeProgress> {
  return normalizeBridges(raw);
}
