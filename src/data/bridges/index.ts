// Story-Engine als Daten (Roadmap-Architektur-Entscheidung, Wo 1):
// Brücken liegen als JSON-Files unter `src/data/bridges/*.json` — eine pro Brücke.
// Dieser Loader importiert sie statisch (Build-Zeit), validiert leicht,
// und exportiert die kuratierte BRIDGES-Liste in Reihenfolge.
//
// Vorteil ggü. dem alten hardcoded TS-Const: später kann ein Content-Editor
// neue Brücken/Kapitel anlegen, ohne den TS-Code anzufassen
// (Vision-Punkt „Multi-Fach-Plattform mit Inhalts-Autoren-Werkzeugen").
//
// Schema siehe `SCHEMA.md` in diesem Ordner.
//
// IMPORTANT: tsconfig hat `resolveJsonModule: true`, deshalb funktionieren
// die direkten JSON-Imports. Reihenfolge der Imports ist die Lese-Reihenfolge —
// die finale Sortierung erfolgt über `order`.

import steinzaehl from "./steinzaehl.json";
import holzplanken from "./holzplanken.json";
import bruechig from "./bruechig.json";
import waage from "./waage.json";
import nachbarn from "./nachbarn.json";
import zehner from "./zehner.json";

// ----- Public Types ----------------------------------------------------------

/**
 * Die 6 Skills von Kapitel 1 (Sky Kingdom).
 * Spätere Kapitel ergänzen hier eigene Skill-Strings (`money`, `multiply`, …).
 */
export type Skill =
  | "counting20"
  | "addition20"
  | "subtraction20"
  | "compare100"
  | "tensNeighbors"
  | "doubleHalf";

/**
 * Eingabe-Modus pro Brücke. Jede Brücke nutzt einen anderen Input-Mechanismus —
 * Abwechslung und Skill-spezifisch (Roadmap „UX-Konzept & Lernpsychologie").
 *
 *  - `tap-count`     : Anneli tippt Objekte einzeln an, Counter zählt mit hoch,
 *                       finale Auswahl als 4 Number-Buttons (Brücke 1).
 *  - `speech`        : Mikro + Whisper. AKTUELL DEAKTIVIERT — braucht SSR,
 *                       Static-Export blockiert (Brücke 2). Fallback: Keypad.
 *  - `keypad`        : On-Screen-Zahlentastatur (Brücke 2 Fallback + Brücke 3).
 *  - `compare-symbol`: Tap/Drag auf <, =, > zwischen zwei Zahlen (Brücke 4).
 *  - `number-line`   : Tap auf der richtigen Zehnermarke des Zahlenstrahls
 *                       (Brücke 5).
 *  - `mirror`        : Spiegel — Anneli verdoppelt/halbiert durch Tap auf
 *                       Steine, finale Auswahl per Number-Buttons (Brücke 6).
 */
export type InputMode =
  | "tap-count"
  | "speech"
  | "keypad"
  | "compare-symbol"
  | "number-line"
  | "mirror";

/**
 * Voller Brücken-Datensatz, geladen aus JSON.
 *
 * Schema-Felder (siehe `SCHEMA.md`):
 *  - `id`, `order`, `name`, `skill`, `skillLabel`, `description`
 *  - `inputMode`            — welcher Input-Mechanismus
 *  - `totalTasks`           — wie viele Aufgaben pro Brücke
 *  - `story_intro`          — 1-Satz Story-Beat VOR der ersten Aufgabe
 *  - `hint_chain`           — gestaffelte Tipps (1-3 Stufen)
 *  - `completion_beat`      — Story-Beat NACH der letzten Aufgabe
 *
 * Backwards-compat: `bookHint` ist ein Computed Alias auf `hint_chain[0]` —
 * vorhandener Code (`narration.ts`) erwartet weiterhin `bookHint`.
 */
export type Bridge = {
  id: string;
  order: number;
  name: string;
  skill: Skill;
  skillLabel: string;
  description: string;
  inputMode: InputMode;
  totalTasks: number;
  story_intro: string;
  hint_chain: readonly string[];
  completion_beat: string;
  /** Alias auf `hint_chain[0]` — legacy für `narration.ts` und Audio-IDs. */
  bookHint: string;
};

// ----- Loader ----------------------------------------------------------------

/** Roh-JSON-Form (ohne den abgeleiteten `bookHint`-Alias). */
type BridgeJson = Omit<Bridge, "bookHint" | "hint_chain"> & {
  hint_chain: string[];
  // optionale Inline-Kommentare im JSON (z.B. `_inputMode_note`) sind erlaubt
  // und werden ignoriert.
  [k: `_${string}`]: unknown;
};

function adapt(raw: BridgeJson): Bridge {
  if (!raw.hint_chain || raw.hint_chain.length === 0) {
    throw new Error(`Bridge ${raw.id}: hint_chain darf nicht leer sein.`);
  }
  return {
    ...raw,
    hint_chain: raw.hint_chain,
    bookHint: raw.hint_chain[0],
  };
}

/**
 * Die kuratierten Brücken von Kapitel 1 — sortiert nach `order`.
 * Bei jedem Build neu aus den JSONs zusammengebaut, kein Caching im Modul-Body
 * nötig (Top-Level-`const` reicht — Modul wird nur einmal evaluiert).
 */
export const BRIDGES: Bridge[] = [
  adapt(steinzaehl as BridgeJson),
  adapt(holzplanken as BridgeJson),
  adapt(bruechig as BridgeJson),
  adapt(waage as BridgeJson),
  adapt(nachbarn as BridgeJson),
  adapt(zehner as BridgeJson),
].sort((a, b) => a.order - b.order);

export function getBridge(id: string): Bridge | undefined {
  return BRIDGES.find((b) => b.id === id);
}
