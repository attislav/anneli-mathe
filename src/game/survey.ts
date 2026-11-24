import type { SurveyTask } from "./types";

type Survey = Pick<SurveyTask, "categories" | "votes" | "target" | "compare">;

export function surveyRows(task: Survey, assigned: number[]) {
  return task.categories.map((category, i) => ({ ...category, value: assigned.filter(n => n === i).length }));
}

export function surveyAnswer(task: Survey): number {
  const rows = surveyRows(task, task.votes);
  return task.compare === null ? rows[task.target].value : Math.abs(rows[task.target].value - rows[task.compare].value);
}

export function checkSurvey(task: Survey, assigned: number[], entry: string) {
  const wrong = task.votes.findIndex((vote, i) => assigned[i] !== vote);
  if (wrong >= 0) return { correct: false, hint: `Schau auf Zettel ${wrong + 1}. Dort steht „${task.categories[task.votes[wrong]].label}“. Tippe auf den Zettel und ändere seine Gruppe.` };
  if (assigned.length !== task.votes.length) return { correct: false, hint: "Jeder Zettel zählt genau einmal." };
  if (/^\d+$/.test(entry) && Number(entry) === surveyAnswer(task)) return { correct: true };
  const target = task.categories[task.target].label;
  const hint = task.compare === null ? `Lies die Zeile „${target}“. Ein durchgestrichenes Bündel zählt fünf. Zähle die einzelnen Striche dazu.`
    : `Vergleiche die Zeilen „${target}“ und „${task.categories[task.compare].label}“. Wie viele Striche hat die längere Zeile zusätzlich? Bei gleich vielen ist der Unterschied null.`;
  return { correct: false, hint };
}
