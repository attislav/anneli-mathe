// Übungskiste: Was beim ersten Versuch schiefging, kommt wieder —
// nach 1 Tag, dann 3, dann 7 Tagen (Leitner-Kästchen). Richtig in der
// Kiste → ein Fach weiter; nach dem dritten Fach ist die Aufgabe „gelernt"
// und fliegt raus. Falsch → zurück ins erste Fach.

import { getSkill } from "./skills";
import { todayKey, update, type PracticeItem, type SaveState, type TaskDraftWithSkill } from "./state";
import type { Task } from "./types";
import { getWorld, type PathNode, type World } from "./worlds";

export const PRACTICE_ID = "uebungskiste";
const INTERVALS = [1, 3, 7];
const MAX_ITEMS = 60;
const PER_SESSION = 8;

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

/** Aufgabe ohne Laufzeit-ID — so lässt sie sich speichern und wiedererkennen. */
function strip(task: Task): TaskDraftWithSkill {
  const { id, ...rest } = task;
  void id;
  return rest as TaskDraftWithSkill;
}

const keyOf = (t: TaskDraftWithSkill) => JSON.stringify([t.skillId, t.format, t.question, "term" in t ? t.term : "", "answer" in t ? t.answer : ""]);

/** Nach dem ERSTEN Versuch einer normalen Lektionsaufgabe. */
export function notePractice(task: Task, correct: boolean): void {
  if (correct) return;
  const draft = strip(task);
  const key = keyOf(draft);
  update((s) => {
    if (s.practice.some((p) => p.key === key)) return s;
    const item: PracticeItem = { key, task: draft, box: 0, due: inDays(INTERVALS[0]) };
    return { ...s, practice: [...s.practice, item].slice(-MAX_ITEMS) };
  });
}

/** Nach dem ersten Versuch einer Aufgabe IN der Übungskiste. */
export function reviewPractice(task: Task, correct: boolean): void {
  const key = keyOf(strip(task));
  update((s) => {
    const practice = s.practice.flatMap((p): PracticeItem[] => {
      if (p.key !== key) return [p];
      if (!correct) return [{ ...p, box: 0, due: inDays(INTERVALS[0]) }];
      const box = p.box + 1;
      return box >= INTERVALS.length ? [] : [{ ...p, box, due: inDays(INTERVALS[box]) }];
    });
    return { ...s, practice };
  });
}

export function duePractice(s: SaveState): PracticeItem[] {
  const today = todayKey();
  return s.practice.filter((p) => p.due <= today);
}

/** Der Lektions-Knoten für die Übungskiste (oder `null`, wenn nichts fällig ist). */
export function practiceNode(s: SaveState): { node: PathNode; world: World } | null {
  const due = duePractice(s).slice(0, PER_SESSION);
  if (due.length === 0) return null;
  const tasks = due.map((p) => p.task);
  const skills = [...new Set(tasks.map((t) => t.skillId))];
  const world = getWorld(getSkill(skills[0]).world);
  return { node: { id: PRACTICE_ID, kind: "review", title: "Übungskiste", skills, practice: tasks }, world };
}
