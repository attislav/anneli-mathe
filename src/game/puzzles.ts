// Puzzle-Ausmalbilder: Pro Welt eine geheime Malvorlage in 9 Teilen.
//
// Teile gibt es zufällig wie Sticker (Truhen, Lektionen, Tagesschatz, Boss).
// Man sieht nur die Teile, die man schon hat — erst komplett zeigt sich das
// ganze Bild. Dann kann man es in der App ausmalen oder auf A4 drucken.
// Die Bilder sind KI-Linienbilder (scripts/gen-malvorlagen.mjs); im Spiel
// tauchen nur Puzzles auf, deren Bild schon erzeugt wurde.

import cfg from "../../scripts/art/malvorlagen.json";
import ready from "./puzzleImages.json";
import type { WorldId } from "./genkit";

export const PIECES = 9;
export const PIECE_DUPLICATE_COINS = 10;

export type Puzzle = { id: string; world: WorldId; title: string; src: string };

const READY = new Set<string>(ready);

export const PUZZLES: Puzzle[] = cfg.pages.filter((p) => READY.has(p.id)).map((p) => ({ id: p.id, world: p.world as WorldId, title: p.title, src: `/malen/${p.id}.png` }));

export function getPuzzle(id: string): Puzzle | undefined {
  return PUZZLES.find((p) => p.id === id);
}

export function puzzleOfWorld(world: WorldId): Puzzle | undefined {
  return PUZZLES.find((p) => p.world === world);
}

export function isComplete(have: number[] | undefined): boolean {
  return (have?.length ?? 0) >= PIECES;
}
