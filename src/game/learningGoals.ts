import { busJourney, busTable, busTime } from "./busTable";
import { familyLines, familyText } from "./factFamily";
import { LabSession } from "./lab";
import { morningPlan } from "./morningPlan";
import { pick, randInt, shuffle, uid } from "./random";
import { LAB_GROUPS } from "./schoolSelection";
import type { Task } from "./types";

export const learningGoals = {
  numbers: { area: 0, title: "Zahlen zerlegen und nutzen" },
  times: { area: 2, title: "Zeiten lesen und planen" },
};
export type LearningGoal = keyof typeof learningGoals;
export function lastLabArea(owner: string) {
  try {
    const index = Number(window.sessionStorage.getItem("labor-bereich-" + owner));
    return Number.isInteger(index) && LAB_GROUPS[index] ? index : 0;
  } catch { return 0; }
}
export function rememberLabArea(owner: string, index: number) {
  if (!LAB_GROUPS[index]) return;
  try { window.sessionStorage.setItem("labor-bereich-" + owner, String(index)); } catch { /* Still selectable for this visit. */ }
}
export function numberTasks(total = randInt(12,19)): [Task, Task, Task] {
  const base = { id: uid(), level: 1 as const };
  const parts: [number,number] = [3,7];
  return [
    { ...base, skillId: "freunde10", format: "input", answer: 7, term: "10", question: "Verteile zehn Plättchen auf zwei Felder.",
      hint: "Links sollen mindestens zwei Plättchen liegen. Rechts müssen es mehr sein als links.", solution: "Zum Beispiel passen links 3 und rechts 7 Plättchen. Zusammen sind es 10." },
    { ...base, id: uid(), skillId: "rechenfamilien", format: "fact-family", parts, cards: shuffle([...parts,10]),
      question: "Welche Rechenfamilie gehört zu deinen beiden Feldern?", hint: "Beide Teile ergeben zusammen zehn.", solution: familyLines({parts}).map(familyText).join(" · ") },
    { ...base, id: uid(), level: total < 15 ? 3 : 4, skillId: total < 15 ? "uebergang20" : "plus20", format: "input", question: `Im Korb liegen ${total} Äpfel. Davon sind 5 grün. Wie viele sind rot, wenn alle übrigen Äpfel rot sind?`,
      term: `${total} − 5`, answer: total-5, hint: "Du kennst das Ganze und den grünen Teil. Suche den anderen Teil.",
      solution: `${total} − 5 = ${total-5}. Es sind ${total-5} rote Äpfel.` },
  ];
}
function timeTasks(): [Task, Task, Task] {
  const bus = busTable(1), { duration, departure } = busJourney(bus);
  const start = pick([8,9,10])*60, lastStart = (Math.floor(departure/60) === 9 ? 10 : 9)*60 + 45;
  const bikeTime = pick([10,20,25]), end = lastStart + bikeTime;
  return [
    { ...bus, id: uid(), level: 1, skillId: "zeitspanne" },
    { ...morningPlan(2), id: uid(), level: 2, skillId: "zeitPlanen", start, fixed: start,
      activities: [{ name: "Busfahrt zum Park", duration }, { name: "Im Park zeichnen", duration: 15 }], follow: "end", target: 0,
      question: `Euer bestellter Bus fährt, sobald ihr einsteigt. Plane die Fahrt mit den eben ermittelten ${duration} Minuten ein.`,
      hint: `Halte den Morgenkreis um ${busTime(start)} Uhr frei. Zeichnen kommt nach der Fahrt.` },
    { format: "clock-set", id: uid(), level: 3, skillId: "uhrStellen", hour: Math.floor(end/60), minute: end%60, step: 5,
      question: `Eine Radtour beginnt um ${busTime(lastStart)} Uhr und dauert ${bikeTime} Minuten. Stelle die Ankunftszeit ein.`,
      hint: "Zähle die Fahrzeit zur Startzeit dazu.", solution: `Nach ${bikeTime} Minuten ist es ${busTime(end)} Uhr.` },
  ];
}
export class LearningRound extends LabSession {
  constructor(owner: string, readonly goal: LearningGoal, readonly tasks = goal === "numbers" ? numberTasks() : timeTasks()) {
    super(owner, 3, number => tasks[number-1]);
  }
  submitParts(taskId: string, left: number, answer: string) {
    if (this.goal !== "numbers" || this.state.number !== 1 || this.state.status !== "ask" || this.state.task.id !== taskId) return this.state;
    const correct = Number.isInteger(left) && left >= 2 && left < 5 && /^\d+$/.test(answer) && Number(answer) === 10-left;
    const state = this.answer(taskId,correct,left < 2 || left >= 5 ? this.state.task.hint : "Deine Verteilung passt. Zähle die Plättchen rechts noch einmal.");
    if (correct && state.status === "right") {
      const parts: [number,number] = [left,10-left], family = this.tasks[1];
      if (family.format === "fact-family") {
        family.parts = parts; family.cards = shuffle([...parts,10]); family.solution = familyLines({parts}).map(familyText).join(" · ");
      }
    }
    return state;
  }
}
