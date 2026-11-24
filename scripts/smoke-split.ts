import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { checkSplit, newSplit, parts, splitArray } from "../src/game/splitArray";
import { LabRound } from "../src/game/lab";
import { activeProfileId, createProfile, readSave } from "../src/game/state";
import type { Level, SplitTask } from "../src/game/types";
import { SplitArray } from "../src/lesson/SplitArray";

const task: SplitTask = { ...splitArray(4), id: "fixture", skillId: "malZerlegen", level: 4, rows: 4, cols: 6, axis: "either" };
for (const axis of ["rows", "cols"] as const) {
  const size = task[axis];
  const other = task[axis === "rows" ? "cols" : "rows"];
  for (const line of [null, -1, 0, size, size + 1, 1.5]) assert.equal(parts(task, axis, line), null);
  for (let line = 1; line < size; line++) {
    const split = newSplit(axis, line);
    assert.deepEqual([split.first, split.second, split.total], ["", "", ""]);
    const solution = { ...split, first: String(line * other), second: String((size - line) * other), total: "24" };
    assert.equal(checkSplit(task, solution).correct, true);
    assert.equal(checkSplit(task, { ...solution, first: "0" }).correct, false);
    assert.match(checkSplit(task, { ...solution, second: "0" }).hint ?? "", axis === "rows" ? /unten/ : /rechts/);
    assert.match(checkSplit(task, { ...solution, total: "23" }).hint ?? "", /Teilfelder stimmen/);
    if (solution.first !== solution.second) assert.equal(checkSplit(task, { ...solution, first: solution.second, second: solution.first }).correct, false);
  }
}
assert.equal(parts({ ...task, axis: "rows" }, "cols", 2), null);
const html = renderToStaticMarkup(createElement(SplitArray, { task, status: "ask", onAnswer() {} }));
assert.ok(html.includes("Zwischen Reihen") && html.includes("Zwischen Spalten") && !html.includes('inputmode="numeric"'));
const reveal = renderToStaticMarkup(createElement(SplitArray, { task, status: "reveal", onAnswer() {} }));
assert.match(reveal, /Zusammen/);
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  const t = splitArray(level);
  assert.equal(t.axis, level === 1 ? "rows" : level === 2 ? "cols" : "either");
  assert.ok(t.rows * t.cols <= 100 && t.rows > 1 && t.cols > 1);
  assert.ok(t.axis === "either" ? Math.min(t.rows, t.cols) >= 3 : t[t.axis] >= 3);
}
createProfile({ name: "Lina", pet: "funkel", petName: "Lumi" });
const round = new LabRound("split", activeProfileId());
const current = round.state.task;
assert.equal(current.format, "split-array");
const axis = current.axis === "either" ? "rows" : current.axis;
const fields = parts(current, axis, 1)!;
const entry = { ...newSplit(axis, 1), first: "0", second: String(fields[1].value), total: String(current.rows * current.cols) };
const attempt = checkSplit(current, entry);
round.answer(current.id, attempt.correct, attempt.hint);
round.advance(current.id);
round.answer(current.id, checkSplit(current, { ...entry, first: String(fields[0].value) }).correct);
assert.equal(round.state.status, "right");
assert.deepEqual(readSave().log.map(e => [e.s, e.ok]), [["malZerlegen", 0]]);
console.log("Mal-Feld: alle inneren Schnitte beider Achsen, Eingaben, Teilprodukte und Erstwertung geprüft.");
