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

function keyOf(t: TaskDraftWithSkill) {
  if (t.format === "class-survey") return JSON.stringify([t.skillId, t.format, t.categories, t.votes, t.target, t.compare]);
  if (t.format === "bus-table") return JSON.stringify([t.skillId, t.format, t.stops, t.trips, t.from, t.to, t.earliest]);
  if (t.format === "hundred-window") return JSON.stringify([t.skillId, t.format, t.start, t.size, t.gaps]);
  if (t.format === "length-strips") return JSON.stringify([t.skillId, t.format, t.target, [...t.lengths].sort((a,b) => a-b)]);
  if (t.format === "cube-model") return JSON.stringify([t.format,t.footprint,t.front]);
  if (t.format === "baskets") return JSON.stringify([t.format,t.budget,t.prices]);
  if (t.format === "machine") return JSON.stringify([t.format,t.inputs,t.change,t.probe,t.reverse]);
  if (t.format === "calendar") return JSON.stringify([t.format,t.year,t.month,t.day,t.nights]);
  if (t.format === "grid-route") return JSON.stringify([t.skillId, t.format, t.size, t.stops, t.findStart]);
  if (t.format === "digit-build") return JSON.stringify([t.skillId, t.format, [...t.digits].sort()]);
  if (t.format === "number-pairs") return JSON.stringify([t.skillId, t.operation, t.target, [...t.cards].sort((a, b) => a - b)]);
  if (t.format === "sequence-rule") return JSON.stringify([t.skillId, t.format, t.numbers, t.missing]);
  if (t.format === "bar-build" && t.initialHeights) return JSON.stringify([t.skillId, t.format, t.rows, t.initialHeights]);
  if (t.format === "ten-jump") return JSON.stringify([t.skillId, t.format, t.start, t.delta]);
  if (t.format === "exchange") return JSON.stringify([t.skillId, t.format, t.start, t.take]);
  if (t.format === "turn-array") return JSON.stringify([t.skillId, t.format, t.rows, t.cols]);
  return JSON.stringify([t.skillId, t.format, t.question, "term" in t ? t.term : "", "answer" in t ? t.answer : ""]);
}

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
