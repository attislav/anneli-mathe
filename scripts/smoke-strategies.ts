import assert from "node:assert/strict";
import { checkSplit, newSplit } from "../src/game/splitArray";
import { composeQuestion } from "../src/game/writeQuestion";
import { normalizeCards, questionCard, splitCard, strategyKey } from "../src/game/strategyCards";
import { rememberStrategy, removeStrategy, startStrategy, strategyExercise } from "../src/game/strategyPractice";
import { activeProfileId, createProfile, importAsNewProfile, readSave, replaceSave, switchProfile } from "../src/game/state";
import { exportCode, parseCode } from "../src/game/transfer";
import type { Level, SplitTask, WriteQuestionTask } from "../src/game/types";

const values = new Map<string, string>();
const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => values.set(k, v) };
Object.defineProperty(globalThis, "window", { value: { localStorage: storage, sessionStorage: storage } });
async function main() {
  createProfile({ name: "Lena", pet: "funkel", petName: "Lumi" });
  const owner = activeProfileId();
  const base: SplitTask = { format: "split-array", rows: 10, cols: 5, axis: "either", level: 5, skillId: "malZerlegen",
    id: "first", question: "", solution: "", hint: "" };
  const split = splitCard(base, "rows", 9);
  const another = splitCard(base, "cols", 2);
  const fruit: WriteQuestionTask = { ...base, format: "write-question", skillId: "sachaufgaben", scene: "fruit",
    groups: [{ icon: "kirsche", label: "Kirschen", value: 3 }, { icon: "apfel", label: "Äpfel", value: 5 }, { icon: "birne", label: "Birnen", value: 7 }] };
  const question = questionCard(fruit, { a: 1, b: 2, kind: "difference" })!;
  const swapped = questionCard(fruit, { a: 2, b: 1, kind: "difference" })!;
  assert.equal(strategyKey(question), strategyKey(swapped));
  for (const level of [1, 2, 3, 4, 5] as Level[]) {
    const [minRows, maxRows, minCols, maxCols, maxCount] = [[3,4,2,4,6], [3,5,3,5,9], [4,6,4,7,15], [4,8,4,8,25], [4,10,4,10,45]][level - 1];
    const axis = level === 2 ? "cols" : "rows";
    let field = splitCard({ ...base, level, rows: maxRows, cols: maxCols }, axis, (axis === "rows" ? maxRows : maxCols) - 1);
    let story = { ...question, level, original: [2, 4, 6] };
    for (let i = 0; i < 12; i++) {
      const fresh = strategyExercise(field);
      assert.equal(fresh.task.level, level);
      assert.ok(fresh.numbers[0] >= minRows && fresh.numbers[0] <= maxRows && fresh.numbers[1] >= minCols && fresh.numbers[1] <= maxCols);
      assert.notDeepEqual(fresh.numbers, field.original);
      assert.notDeepEqual(fresh.numbers, field.previous);
      field = { ...field, previous: fresh.numbers };
      const counts = strategyExercise(story).numbers;
      assert.ok(counts.every((v, j) => v >= 2 && v <= maxCount && v !== story.original[j] && v !== story.previous?.[j]));
      story = { ...story, previous: counts };
    }
  }
  assert.deepEqual(normalizeCards([{ ...split, original: [4, 4], level: 1, axis: "cols", line: 3 }]), []);
  assert.deepEqual(normalizeCards([{ ...split, original: [4, 4], level: 2, axis: "rows", line: 3 }]), []);
  assert.equal(questionCard(fruit, { a: 1, b: 1, kind: "sum" }), null);
  assert.deepEqual(readSave().strategies, []);
  for (const card of [split, another, split, question, swapped]) rememberStrategy(owner, card);
  assert.equal(readSave().strategies.length, 3);
  assert.equal(readSave().log.length, 0);
  let lastCols = 5;
  for (let i = 0; i < 60; i++) {
    const round = startStrategy(owner, strategyKey(split))!;
    const task = round.state.task;
    assert.equal(task.format, "split-array");
    assert.equal(task.rows, 10);
    assert.equal(task.presetLine, 9);
    assert.ok(Math.abs(task.cols - 5) >= 2 && Math.abs(task.cols - lastCols) >= 2);
    lastCols = task.cols;
    assert.ok(checkSplit(task, { ...newSplit("rows", 9), first: String(9 * task.cols), second: String(task.cols), total: String(10 * task.cols) }).correct);
  }
  assert.equal(readSave().log.length, 0);
  let previous = [5, 7, 3];
  for (let i = 0; i < 30; i++) {
    const round = startStrategy(owner, strategyKey(question))!;
    const task = round.state.task;
    assert.equal(task.format, "write-question");
    const q = task.preset!;
    assert.equal(task.groups[q.a].icon, "apfel");
    assert.equal(task.groups[q.b].icon, "birne");
    const current = [task.groups[q.a].value, task.groups[q.b].value, task.groups.find(g => g.icon === "kirsche")!.value];
    assert.ok(current.every((n, j) => n !== previous[j] && n !== question.original[j]));
    assert.notEqual(composeQuestion(task, q)?.value, Math.abs(previous[0] - previous[1]));
    previous = current;
    if (i === 0) {
      round.answer(task.id, false); round.answer(task.id, true); round.advance(task.id); round.answer(task.id, true); round.advance(task.id);
      assert.equal(round.state.status, "done");
    }
  }
  const splitRound = startStrategy(owner, strategyKey(split))!;
  splitRound.answer(splitRound.state.task.id, true);
  assert.deepEqual(readSave().log.map(e => [e.s, e.ok]), [["sachaufgaben", 0], ["malZerlegen", 1]]);
  assert.deepEqual(readSave().nodes, {});
  removeStrategy(owner, strategyKey(another));
  assert.equal(readSave().strategies.length, 2);
  const imported = await parseCode(await exportCode());
  assert.ok(imported);
  importAsNewProfile(imported);
  const sibling = activeProfileId();
  assert.equal(readSave().strategies.length, 2);
  assert.equal(startStrategy(owner, strategyKey(question)), null);
  removeStrategy(owner, strategyKey(question));
  assert.equal(readSave().strategies.length, 2);
  removeStrategy(sibling, strategyKey(question));
  assert.equal(readSave().strategies.length, 1);
  delete imported.strategies;
  replaceSave(imported);
  assert.deepEqual(readSave().strategies, []);
  switchProfile(owner);
  assert.equal(readSave().strategies.length, 2);
  assert.deepEqual(normalizeCards([null, { ...split, line: 10 }, { ...question, icons: ["a", "b", "c"] }]), []);
  console.log("Eigene Rechenwege, Randteilung, neue Mengen, Deduplizierung, Erstwertung, Spielstand-Code und Geschwister geprüft.");
}
void main();
