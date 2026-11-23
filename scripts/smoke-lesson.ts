import assert from "node:assert/strict";
import type { Task } from "../src/game/types";
import type { PathNode } from "../src/game/worlds";
import { advanceTask, firstAnswer, lateRight, startRun, taskCount, type Run } from "../src/lesson/engine";

const node: PathNode = { id: "mix", title: "Gemischt", kind: "lesson", skills: ["freunde10", "laengenRechnen"] };
const material: Task = { id: "band", skillId: "laengenRechnen", level: 4, format: "length-strips",
  target: 100, lengths: [30, 70, 20], question: "Lege einen Meter.", hint: "Ergänze auf 100 cm.", solution: "30 + 70 = 100." };

for (const kind of ["lesson", "trick"] as const) {
  const lesson = { ...node, kind };
  const run = startRun(lesson, 2, {});
  const missed: Run = firstAnswer(run, material, false).run;
  const help = advanceTask(missed, material, "reveal");
  assert.equal(help.run.usedSupportTask, true);
  assert.equal(help.run.done, 1);
  assert.deepEqual(help.run.mastery, missed.mastery);
  assert.equal(help.run.coins, missed.coins);
  assert.ok(help.task);
  assert.notEqual(help.task.id, material.id);
  assert.equal(help.task.skillId, material.skillId);
  assert.equal(help.task.level, 3);

  // Eine weitere Hilfsaufgabe wäre Stufe 2. Die reguläre Meister-Runde hat mindestens Stufe 3.
  const missedAgain = firstAnswer(help.run, help.task, false).run;
  const regular = advanceTask(missedAgain, help.task, "reveal");
  assert.ok(regular.task && regular.task.level >= 3);
  assert.equal(regular.run.done, 2);
  const last = { ...missed, done: taskCount(lesson) - 1 };
  const finished = advanceTask(last, material, "reveal");
  assert.equal(finished.task, null);
  assert.equal(finished.run.usedSupportTask, false);
  assert.equal(finished.run.done, taskCount(lesson));

  const recovered = advanceTask(lateRight(missed).run, material, "right");
  assert.equal(recovered.task?.format, "input");
  assert.equal(recovered.run.usedSupportTask, false);
  assert.equal(recovered.run.coins, 1);
}
const easiest = advanceTask(startRun(node, 0, {}), { ...material, level: 1 }, "reveal");
assert.equal(easiest.task?.level, 1);
for (const kind of ["boss", "review"] as const) {
  const run = startRun({ ...node, kind, skills: ["freunde10"] }, 0, {});
  const upcoming = advanceTask(run, material, "reveal");
  assert.equal(upcoming.run.usedSupportTask, false);
  assert.equal(upcoming.run.bossHp, run.bossHp);
  assert.equal(upcoming.task?.skillId, "freunde10");
}
const stored = { ...material, question: "Aufgabe aus meiner Kiste" };
const practice = startRun({ ...node, practice: [material, stored] }, 0, {});
const upcoming = advanceTask(practice, material, "reveal");
assert.equal(upcoming.task?.question, stored.question);
assert.equal(upcoming.run.usedSupportTask, false);
console.log("Hilfsaufgabe, Transfer, Rundengrenzen, Übungskiste, Review und Boss geprüft.");
