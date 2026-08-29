// Modul 8 + 9: Einmaleins.
//
// „einmaleins-kern" übt nur die Kernreihen 2, 5 und 10 — die drei Reihen,
// aus denen sich alle anderen ableiten lassen.
// „einmaleins" übt das ganze 1×1 bis 10 · 10 mit Schwerpunkt auf den
// schweren Reihen 3, 4, 6, 7, 8, 9.
//
// Beide teilen sich die Trick-Erklärung `multiplyHint`: sie sucht zu jeder
// Aufgabe die Strategie, mit der man sie am schnellsten ableiten kann
// (Null anhängen, Verdoppeln, Hälfte der 10er, Nachbaraufgabe, 9er-Trick).

import type { Level, TrainingTask } from "../types";
import { pickOne, randInt, taskId } from "../types";

// ---------- Kernreihen (Modul 8) ----------

export function generateEinmaleinsKern(level: Level = "normal"): TrainingTask {
  const row = pickOne(level === "easy" ? [10, 2, 5] : [2, 5, 10]);
  const other = level === "easy" ? randInt(1, 5) : randInt(2, 10);
  const form = pickForm(level);
  return buildTask("einmaleins-kern", row, other, form, level);
}

// ---------- Ganzes 1×1 (Modul 9) ----------

export function generateEinmaleins(level: Level = "normal"): TrainingTask {
  const row =
    level === "easy"
      ? pickOne([3, 4, 2, 5])
      : level === "hard"
        ? pickOne([6, 7, 8, 9, 7, 8])
        : pickOne([3, 4, 6, 7, 8, 9]);
  const other = level === "easy" ? randInt(2, 6) : randInt(2, 10);
  const form = pickForm(level);
  return buildTask("einmaleins", row, other, form, level);
}

// ---------- gemeinsame Mechanik ----------

type Form = "product" | "gap-right" | "gap-left";

function pickForm(level: Level): Form {
  if (level === "easy") return "product";
  if (level === "hard") return pickOne<Form>(["product", "gap-right", "gap-left", "gap-right"]);
  return pickOne<Form>(["product", "product", "product", "gap-right"]);
}

function buildTask(
  moduleId: string,
  row: number,
  other: number,
  form: Form,
  level: Level
): TrainingTask {
  // Tauschaufgabe: bei der reinen Produktaufgabe steht die geübte Reihe mal
  // vorn, mal hinten — Anneli soll merken, dass beides dasselbe ist.
  // Bei Lücken-Aufgaben steht die Reihe dagegen IMMER sichtbar da, damit sie
  // genau die Reihe hochzählt, die dieses Modul übt.
  const swapped = form === "product" ? Math.random() < 0.5 : form === "gap-left";
  const a = swapped ? other : row;
  const b = swapped ? row : other;
  const product = a * b;

  switch (form) {
    case "product":
      return {
        id: taskId("1x1"),
        moduleId,
        prompt: `${a} · ${b}`,
        correctAnswer: product,
        hint: multiplyHint(a, b),
        solution: `${a} · ${b} = ${product}.`,
        level,
      };
    case "gap-right":
      return {
        id: taskId("1x1"),
        moduleId,
        prompt: `${a} · ? = ${product}`,
        correctAnswer: b,
        hint: gapHint(a, product),
        solution: `${a} · ${b} = ${product}, also fehlt die ${b}.`,
        level,
      };
    case "gap-left":
      return {
        id: taskId("1x1"),
        moduleId,
        prompt: `? · ${b} = ${product}`,
        correctAnswer: a,
        hint: `Dreh die Aufgabe um: ${b} · wie viel ergibt ${product}? ${gapHint(b, product)}`,
        solution: `${a} · ${b} = ${product}, also fehlt die ${a}.`,
        level,
      };
  }
}

/**
 * Wählt zu einer Malaufgabe die stärkste Ableitungs-Strategie und formuliert
 * sie mit den konkreten Zahlen. Reihenfolge = pädagogische Priorität.
 */
export function multiplyHint(a: number, b: number): string {
  // Immer so drehen, dass `row` der Faktor mit dem besten Trick ist.
  const order = [10, 1, 5, 2, 9, 4, 8, 3, 6, 7];
  const rowFirst = order.indexOf(a) <= order.indexOf(b);
  const row = rowFirst ? a : b;
  const n = rowFirst ? b : a;

  switch (row) {
    case 1:
      return `Mal 1 ändert nichts — ${n} bleibt ${n}.`;
    case 10:
      return `Mal 10 heißt: einfach eine Null anhängen. Aus ${n} wird ${n * 10}.`;
    case 5:
      return `Die 5er-Reihe ist die halbe 10er-Reihe: 10 · ${n} = ${n * 10}, die Hälfte davon ist ${n * 5}.`;
    case 2:
      return `Mal 2 ist Verdoppeln: ${n} + ${n}.`;
    case 9:
      return `9er-Trick: rechne 10 · ${n} = ${n * 10} und nimm eine ${n} wieder weg.`;
    case 4:
      return `Mal 4 heißt zweimal verdoppeln: ${n} + ${n} = ${n * 2}, und ${n * 2} + ${n * 2} = ${n * 4}.`;
    case 8:
      return `Mal 8 ist mal 4, noch einmal verdoppelt: 4 · ${n} = ${n * 4}, das Doppelte davon ist ${n * 8}.`;
    case 3:
      return `Nachbaraufgabe: 2 · ${n} = ${n * 2}, und noch eine ${n} dazu.`;
    case 6:
      return `Nachbaraufgabe: 5 · ${n} = ${n * 5}, und noch eine ${n} dazu.`;
    case 7:
      return `Zerlege die 7: 5 · ${n} = ${n * 5} und 2 · ${n} = ${n * 2}. Zusammen ${n * 7}.`;
    default:
      return `Geh die ${row}er-Reihe in Sprüngen hoch.`;
  }
}

/**
 * Tipp für Lücken-Aufgaben: hier hilft nicht das Ergebnis, sondern der Weg
 * zur fehlenden Zahl — die Reihe hochzählen bzw. die Umkehrung der
 * Reihen-Regel anwenden.
 */
export function gapHint(row: number, product: number): string {
  if (row === 10) return `Mal 10 hängt nur eine Null an. Welche Zahl wird mit einer Null zu ${product}?`;
  if (row === 5) return `Zähl in Fünfer-Schritten: 5, 10, 15 … bis ${product}. Wie viele Sprünge waren das?`;
  if (row === 2) return `Welche Zahl ergibt verdoppelt ${product}? Das ist die Hälfte von ${product}.`;
  return `Geh die ${row}er-Reihe in Sprüngen hoch und zähl mit, bis du bei ${product} bist.`;
}
