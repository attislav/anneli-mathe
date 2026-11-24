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

export function taskContentKey(t: TaskDraftWithSkill) {
  if (t.format === "write-question") return JSON.stringify([t.skillId, t.format, t.scene, t.groups]);
  if (t.format === "split-array") return JSON.stringify([t.skillId, t.format, t.rows, t.cols, t.axis]);
  if (t.format === "estimate-rope") return JSON.stringify([t.skillId, t.format, t.length, t.unit]);
  if (t.format === "table-view") return JSON.stringify([t.skillId, t.format, t.items, t.side, t.reverse]);
  if (t.format === "sum-packet") return JSON.stringify([t.skillId, t.format, t.before, t.changes, t.exact]);
  if (t.format === "tile-floor") return JSON.stringify([t.skillId, t.format, t.width, t.height, t.example]);
  if (t.format === "class-survey") return JSON.stringify([t.skillId, t.format, t.categories, t.votes, t.target, t.compare]);
  if (t.format === "bus-table") return JSON.stringify([t.skillId, t.format, t.stops, t.trips, t.from, t.to, t.earliest]);
  if (t.format === "hundred-window") return JSON.stringify([t.skillId, t.format, t.start, t.size, t.gaps]);
  if (t.format === "length-strips") return JSON.stringify([t.skillId, t.format, t.target, [...t.lengths].sort((a,b) => a-b)]);
  if (t.format === "cube-model") return JSON.stringify([t.format,t.footprint,t.front]);
  if (t.format === "shop-list") return JSON.stringify([t.format, t.goods, t.stores]);
  if (t.format === "number-detective") return JSON.stringify([t.format, t.numbers, t.clues, t.excluded]);
  if (t.format === "parity-claim") return JSON.stringify([t.format, t.rule, t.evenSum, t.limit]);
  if (t.format === "way-table") return JSON.stringify([t.format, t.first, t.second, t.blocked]);
  if (t.format === "two-ways") return JSON.stringify([t.format, t.a, t.b, t.minus, t.roundFirst]);
  if (t.format === "site-map") return JSON.stringify([t.format, t.cells, t.mode, t.target, t.anchor, t.closed]);
  if (t.format === "juice") return JSON.stringify([t.format, t.target, t.capacity, t.source]);
  if (t.format === "tower") return JSON.stringify([t.format, t.initial, t.changes, t.reserve, t.side]);
  if (t.format === "fact-family") return JSON.stringify([t.format, t.parts]);
  if (t.format === "clarify-story") return JSON.stringify([t.format, t.scene, t.facts]);
  if (t.format === "remainders") return JSON.stringify([t.format,t.scene,t.total,t.size]);
  if (t.format === "balance") return JSON.stringify([t.format,t.base,t.start,t.change]);
  if (t.format === "weekly") return JSON.stringify([t.format,t.start,t.weeks,t.weekdays,t.cancel,t.move,t.query,t.anchor,t.activity]);
  if (t.format === "symbol-code") return JSON.stringify([t.format,t.sun,t.moon,t.clue,t.focus,t.repeat,t.explore]);
  if (t.format === "roll-cube") return JSON.stringify([t.format,t.practice,t.transfer]);
  if (t.format === "dot-ways") return JSON.stringify([t.format,t.cols,[...t.dots].sort((a,b)=>a-b)]);
  if (t.format === "portion-compare") return JSON.stringify([t.format,t.boards]);
  if (t.format === "growing-figure") return JSON.stringify([t.format,t.family,t.start,t.target]);
  if (t.format === "pattern-ribbon") return JSON.stringify([t.format,[...t.palette].sort(),t.min,t.max,t.offset]);
  if (t.format === "receipt") return JSON.stringify([t.format,...[t.items,t.printed].map(rows=>[...rows].sort((a,b)=>a.id-b.id))]);
  if (t.format === "attribute-sort") return JSON.stringify([t.format,t.shape,t.pattern,t.countBy,t.cards.map(c=>[c.shape,c.pattern].join("/")).sort()]);
  if (t.format === "target-steps") return JSON.stringify([t.format,[...t.cards].sort((a,b)=>a-b),t.target,t.limit]);
  if (t.format === "geo-board") return JSON.stringify([t.format,t.width,t.height,t.side]);
  if (t.format === "strip-story") return JSON.stringify([t.format,t.parts,t.missing,t.names,t.unit]);
  if (t.format === "line-estimate") return JSON.stringify([t.format,t.low,t.high,t.target]);
  if (t.format === "fold-lines") return JSON.stringify([t.format,t.filled,t.lines]);
  if (t.format === "draw-bag") return JSON.stringify([t.format,[...t.bag].sort(),t.first,t.next]);
  if (t.format === "digit-swap") return JSON.stringify([t.format,t.min,t.max,[...t.digits].sort()]);
  if (t.format === "parcel-mass") return JSON.stringify([t.format,t.mass,t.other]);
  if (t.format === "garden-fence") return JSON.stringify([t.format,t.first,t.second]);
  if (t.format === "wheel-orders") return JSON.stringify([t.format,t.wheels]);
  if (t.format === "group-recipe") return JSON.stringify([t.format,t.title,t.children,t.ingredients]);
  if (t.format === "pictogram") return JSON.stringify([t.format,t.title,t.names,t.keyValue,t.first,t.second]);
  if (t.format === "chocolate-share") return JSON.stringify([t.format, t.rows, t.cols, t.children]);
  if (t.format === "morning-plan") return JSON.stringify([t.format, t.start, t.duration, t.step, t.fixed, t.activities, t.target, t.follow]);
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
  const key = taskContentKey(draft);
  update((s) => {
    if (s.practice.some((p) => p.key === key)) return s;
    const item: PracticeItem = { key, task: draft, box: 0, due: inDays(INTERVALS[0]) };
    return { ...s, practice: [...s.practice, item].slice(-MAX_ITEMS) };
  });
}

/** Nach dem ersten Versuch einer Aufgabe IN der Übungskiste. */
export function reviewPractice(task: Task, correct: boolean): void {
  const key = taskContentKey(strip(task));
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
