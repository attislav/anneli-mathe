// Single source of truth for spoken narration in the app.
// Each entry is rendered to public/audio/{id}.mp3 by scripts/generate-narration.mjs.
// Editing a text? Delete the matching .mp3 (or all of them) and re-run the script.

import { BRIDGES } from "./bridges";

export type NarrationEntry = {
  id: string;
  text: string;
  /** Optional override of the global instructions for this line. */
  instructions?: string;
};

const DEFAULT_INSTRUCTIONS = `
Speak in German with warmth and a hint of playful cheekiness — like a witty
older book sharing a secret with a 7-year-old child. Conversational tone, not
theatrical. Slightly conspiratorial but always kind. Speak clearly enough for
a young child to follow.
`.trim();

const ENCOURAGING_INSTRUCTIONS = `
Speak in German, warm and reassuring, like a kind older friend who is not
worried at all. A little smile in the voice. Light and easy, no drama.
`.trim();

// Story beats and book lines.
const STORY: NarrationEntry[] = [
  {
    id: "intro-book-greeting",
    text: `Na endlich! Ich dachte schon, du machst mich nie auf. Komm mit, Anneli — ich zeige dir, wo wir sind. Du wirst staunen.`,
  },
  {
    id: "library-welcome",
    text: `Willkommen in der Bibliothek der Welten. Hier sind unendlich viele Geschichten zuhause — und alle haben Hilfe nötig. Hörst du das? Aus dieser Tür kommt Wind. Das ist das Himmelreich. Und die Brücken zwischen den schwebenden Inseln zerbröckeln gerade alle. Ohne dich finden die Vögel nie wieder zueinander. Trauen wir uns?`,
  },
  {
    id: "sky-kingdom-arrival",
    text: `Da sind wir. Sechs Brücken — alle wackelig. Such dir eine aus, mit der du anfangen willst. Du musst nicht der Reihe nach, ich verrate dich nicht.`,
  },
];

// One audio hint per bridge — voiced by the book before tasks begin.
const BRIDGE_HINTS: NarrationEntry[] = BRIDGES.map((b) => ({
  id: `bridge-${b.id}-hint`,
  text: b.bookHint,
}));

// Quips when an answer is wrong — keep them short, light, varied.
const WRONG_QUIPS: NarrationEntry[] = [
  { id: "quip-wrong-1", text: "Oh, hoppla! Knapp daneben. Probier nochmal.", instructions: ENCOURAGING_INSTRUCTIONS },
  { id: "quip-wrong-2", text: "Beinahe! Die Brücke wackelt nur — sie hält noch.", instructions: ENCOURAGING_INSTRUCTIONS },
  { id: "quip-wrong-3", text: "Hmmm. Lass uns das nochmal zusammen anschauen.", instructions: ENCOURAGING_INSTRUCTIONS },
  { id: "quip-wrong-4", text: "Fast! Atme einmal tief durch und versuch's nochmal.", instructions: ENCOURAGING_INSTRUCTIONS },
];

// Celebration when a bridge is repaired.
const SUCCESS_QUIPS: NarrationEntry[] = [
  { id: "quip-success-1", text: "Die Brücke hält! Du hast sie repariert." },
  { id: "quip-success-2", text: "Ha! Genau richtig. Schau, wie sie sich aufrichtet." },
];

export const NARRATION: NarrationEntry[] = [
  ...STORY,
  ...BRIDGE_HINTS,
  ...WRONG_QUIPS,
  ...SUCCESS_QUIPS,
];

export const NARRATION_DEFAULT_INSTRUCTIONS = DEFAULT_INSTRUCTIONS;

export function audioSrc(id: string): string {
  return `/audio/${id}.mp3`;
}
