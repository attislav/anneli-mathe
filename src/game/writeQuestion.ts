import type { WriteQuestionTask } from "./types";

type Scene = Pick<WriteQuestionTask, "groups" | "scene">;
export type Question = { a: number | null; b: number | null; kind: "sum" | "difference" | null };
export type QuestionEntry = { question: Question; left: number | null; right: number | null; sign: "+" | "−" | null; answer: string };
export function startQuestion(question: Question): QuestionEntry {
  return { question, left: null, right: null, sign: null, answer: "" };
}
export function composeQuestion(scene: Scene, { a, b, kind }: Question) {
  if (a === null || b === null || a === b || !scene.groups[a] || !scene.groups[b] || !kind) return null;
  const first = scene.groups[a], second = scene.groups[b];
  if (kind === "sum") {
    const context = scene.scene === "fruit" ? "liegen zusammen im Korb" : "leben zusammen im Tierheim";
    return { sentence: `Wie viele ${first.label} und ${second.label} ${context}?`,
      left: a, right: b, sign: "+" as const, value: first.value + second.value };
  }
  const [hi, lo] = first.value >= second.value ? [a, b] : [b, a];
  return { sentence: `Wie groß ist der Unterschied zwischen den Gruppen „${first.label}“ und „${second.label}“?`,
    left: hi, right: lo, sign: "−" as const, value: Math.abs(first.value - second.value) };
}
export function checkQuestion(scene: Scene, entry: QuestionEntry) {
  const model = composeQuestion(scene, entry.question);
  if (!model) return { correct: false, hint: "Wähle zuerst zwei verschiedene Gruppen und eine Frage." };
  const { a, b } = entry.question;
  if (!(entry.left === a && entry.right === b || entry.left === b && entry.right === a))
    return { correct: false, hint: "Lies deine Frage. Welche zwei Gruppen kommen darin vor? Wähle genau ihre Zahlen." };
  if (entry.sign !== model.sign) return { correct: false, hint: "Geht es um beide Gruppen zusammen oder um ihren Unterschied? Prüfe dein Rechenzeichen." };
  if (entry.sign === "−" && scene.groups[entry.left!].value < scene.groups[entry.right!].value)
    return { correct: false, hint: "Für den Unterschied rechnest du die kleinere Anzahl von der größeren weg." };
  if (!/^\d+$/.test(entry.answer) || Number(entry.answer) !== model.value)
    return { correct: false, hint: "Deine Rechnung passt zur Frage. Rechne sie noch einmal aus." };
  return { correct: true };
}
