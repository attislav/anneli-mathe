// Single source of truth for spoken narration in the app.
//
// Jede Zeile trägt ein `speaker`-Field — das bestimmt:
//   1. welche ElevenLabs-Stimme die Zeile generiert (siehe `voices.ts`),
//   2. unter welchem Pfad die mp3 liegt (`public/audio/<speaker>/<id>.mp3`).
//
// Audios werden via `scripts/generate-narration-elevenlabs.mjs` erzeugt.
// Editing a text? Delete the matching .mp3 (or all of them) and re-run the script.

import { BRIDGES } from "./bridges";
import { speakerAudioSrc, type Speaker } from "./voices";

export type NarrationEntry = {
  id: string;
  text: string;
  /** Welche Rolle spricht? Bestimmt Voice + Output-Pfad. */
  speaker: Speaker;
};

// Story-Beats — wer was sagt:
//  - "Anneli öffnete das Buch…" → narrator (Erzähler-Stimme)
//  - "Na endlich!" → book (das Buch spricht direkt)
//  - "Komm, ich helf dir!" → bird_pip (der Vogel-Begleiter)
const STORY: NarrationEntry[] = [
  {
    id: "intro-book-greeting",
    speaker: "book",
    text: `Na endlich! Ich dachte schon, du machst mich nie auf. Komm mit, Anneli — ich zeige dir, wo wir sind. Du wirst staunen.`,
  },
  {
    id: "library-welcome",
    speaker: "book",
    text: `Willkommen in der Bibliothek der Welten. Hier sind unendlich viele Geschichten zuhause — und alle haben Hilfe nötig. Hörst du das? Aus dieser Tür kommt Wind. Das ist das Himmelreich. Und die Brücken zwischen den schwebenden Inseln zerbröckeln gerade alle. Ohne dich finden die Vögel nie wieder zueinander. Trauen wir uns?`,
  },
  {
    id: "sky-kingdom-arrival",
    speaker: "book",
    text: `Da sind wir. Sechs Brücken — alle wackelig. Such dir eine aus, mit der du anfangen willst. Du musst nicht der Reihe nach, ich verrate dich nicht.`,
  },
  // Erzähler-Stimme: Rahmen-Sätze, wenn die App eine Szene anschiebt.
  {
    id: "narrator-opening",
    speaker: "narrator",
    text: `Anneli öffnete das alte Buch — und auf einmal war alles anders.`,
  },
  // Pip stellt sich vor — Vogel-Begleiter, wird nach Onboarding mit Namen ersetzt.
  {
    id: "bird-pip-intro",
    speaker: "bird_pip",
    text: `Hallo Anneli! Ich bin's, dein Vogel. Ich flieg neben dir her, ja? Wenn's wackelig wird, bin ich da.`,
  },
];

// One audio hint per bridge — voiced by the book before tasks begin.
const BRIDGE_HINTS: NarrationEntry[] = BRIDGES.map((b) => ({
  id: `bridge-${b.id}-hint`,
  speaker: "book" as const,
  text: b.bookHint,
}));

// Quips when an answer is wrong — keep them short, light, varied.
// Sprecher: Pip — der Vogel-Begleiter macht Mut, nicht das ernste Buch.
const WRONG_QUIPS: NarrationEntry[] = [
  { id: "quip-wrong-1", speaker: "bird_pip", text: "Oh, hoppla! Knapp daneben. Probier nochmal." },
  { id: "quip-wrong-2", speaker: "bird_pip", text: "Beinahe! Die Brücke wackelt nur — sie hält noch." },
  { id: "quip-wrong-3", speaker: "bird_pip", text: "Hmmm. Lass uns das nochmal zusammen anschauen." },
  { id: "quip-wrong-4", speaker: "bird_pip", text: "Fast! Atme einmal tief durch und versuch's nochmal." },
];

// Celebration when a bridge is repaired — Pip jubelt, dann Buch erzählt weiter.
const SUCCESS_QUIPS: NarrationEntry[] = [
  { id: "quip-success-1", speaker: "bird_pip", text: "Die Brücke hält! Du hast sie repariert." },
  { id: "quip-success-2", speaker: "bird_pip", text: "Ha! Genau richtig. Schau, wie sie sich aufrichtet." },
];

export const NARRATION: NarrationEntry[] = [
  ...STORY,
  ...BRIDGE_HINTS,
  ...WRONG_QUIPS,
  ...SUCCESS_QUIPS,
];

/**
 * Find a narration entry by id. Returns undefined if not found.
 */
export function getNarration(id: string): NarrationEntry | undefined {
  return NARRATION.find((n) => n.id === id);
}

/**
 * Resolve the audio src for a narration id.
 * Uses the speaker-aware path (`/audio/<speaker>/<id>.mp3`).
 * Falls back to legacy flat path (`/audio/<id>.mp3`) if the id is unknown
 * — useful while components still pass raw ids.
 */
export function audioSrc(id: string): string {
  const entry = getNarration(id);
  if (entry) return speakerAudioSrc(entry.speaker, id);
  return `/audio/${id}.mp3`;
}
