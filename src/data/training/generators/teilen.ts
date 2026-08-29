// Modul 10: Teilen im Zahlenraum des kleinen Einmaleins.
//
// Trick: „Such die Malaufgabe" — jede Geteilt-Aufgabe ist die Umkehrung
// einer Mal-Aufgabe. Deshalb erzeugen wir immer erst das Produkt und
// leiten die Divisionsaufgabe daraus ab: es bleibt nie ein Rest.

import type { Level, TrainingTask } from "../types";
import { pickOne, randInt, taskId } from "../types";
import { gapHint } from "./einmaleins";

export function generateTeilen(level: Level = "normal"): TrainingTask {
  const divisor = level === "easy" ? pickOne([2, 5, 10]) : level === "hard" ? randInt(3, 10) : randInt(2, 10);
  const quotient = level === "easy" ? randInt(2, 5) : randInt(2, 10);
  const dividend = divisor * quotient;
  const form = pickForm(level);

  switch (form) {
    case "divide":
      return {
        id: taskId("tl"),
        moduleId: "teilen",
        prompt: `${dividend} : ${divisor}`,
        correctAnswer: quotient,
        hint: `Such die Malaufgabe: ${divisor} · ? = ${dividend}. ${gapHint(divisor, dividend)}`,
        solution: `${divisor} · ${quotient} = ${dividend}, also ist ${dividend} : ${divisor} = ${quotient}.`,
        level,
      };
    case "reverse":
      return {
        id: taskId("tl"),
        moduleId: "teilen",
        prompt: `? · ${divisor} = ${dividend}`,
        correctAnswer: quotient,
        hint: `Das ist dieselbe Frage wie ${dividend} : ${divisor}. ${gapHint(divisor, dividend)}`,
        solution: `${quotient} · ${divisor} = ${dividend}.`,
        level,
      };
    case "divisor-gap":
      return {
        id: taskId("tl"),
        moduleId: "teilen",
        prompt: `${dividend} : ? = ${quotient}`,
        correctAnswer: divisor,
        hint: `Frag dich: wie viel mal ${quotient} ergibt ${dividend}?`,
        solution: `${dividend} : ${divisor} = ${quotient}.`,
        level,
      };
    case "how-often":
      return {
        id: taskId("tl"),
        moduleId: "teilen",
        prompt: `Wie oft passt ${divisor} in ${dividend}?`,
        correctAnswer: quotient,
        hint: `Zähl die ${divisor}er-Sprünge bis ${dividend} und merk dir, wie viele Sprünge es waren.`,
        solution: `${divisor} passt ${quotient} mal in ${dividend}.`,
        level,
      };
  }
}

type Form = "divide" | "reverse" | "divisor-gap" | "how-often";

function pickForm(level: Level): Form {
  if (level === "easy") return pickOne<Form>(["divide", "divide", "how-often"]);
  if (level === "hard") return pickOne<Form>(["divide", "reverse", "divisor-gap", "divisor-gap"]);
  return pickOne<Form>(["divide", "divide", "reverse", "how-often"]);
}
