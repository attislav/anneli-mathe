import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { checkView, ownView, SIDES, tableView } from "../src/game/tableView";
import { LabRound } from "../src/game/lab";
import { activeProfileId, createProfile, readSave } from "../src/game/state";
import { TableView } from "../src/lesson/TableView";
import type { Level, TableItem, TableSide, ViewpointTask } from "../src/game/types";

// Tisch auf Papier: hinten Tasse/Buch, vorne Schlüssel/Apfel.
const items: TableItem[] = ["Tasse", "Buch", "Schlüssel", "Apfel"];
const expected: Record<TableSide, TableItem[]> = {
  unten: ["Tasse", "Buch", "Schlüssel", "Apfel"],
  oben: ["Apfel", "Schlüssel", "Buch", "Tasse"],
  links: ["Buch", "Apfel", "Tasse", "Schlüssel"],
  rechts: ["Schlüssel", "Tasse", "Apfel", "Buch"],
};
for (const side of SIDES) {
  const task: ViewpointTask = { ...tableView(4), items, side, reverse: false, id: "fixture", level: 4, skillId: "standpunkte" };
  const pair = expected[side].slice(2);
  assert.deepEqual(ownView(items, side), expected[side]);
  for (const a of items) for (const b of items) {
    assert.equal(checkView(task, [a, b], null).correct, a === pair[0] && b === pair[1]);
  }
  assert.match(checkView(task, [...pair].reverse(), null).hint ?? "", /Blickrichtung/);
  for (const answer of SIDES) assert.equal(checkView({ ...task, reverse: true }, [], answer).correct, answer === side);
  for (const status of ["ask", "wrong", "reveal", "right"] as const) {
    const html = renderToStaticMarkup(createElement(TableView, { task: { ...task, reverse: true }, status, onAnswer: () => {} }));
    const solved = status === "reveal" || status === "right";
    assert.equal(html.includes("So sieht Mila den Tisch"), solved);
    assert.equal(html.includes("Mila steht"), solved);
  }
}
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  for (let i = 0; i < 60; i++) {
    const task = tableView(level);
    assert.equal(new Set(task.items).size, 4);
    if (level === 1) assert.equal(task.side, "unten");
    if (level === 2) assert.ok(["unten", "oben"].includes(task.side));
    if (level < 4) assert.equal(task.reverse, false);
    if (level === 5) assert.equal(task.reverse, true);
  }
}
createProfile({ name: "Lina", pet: "funkel", petName: "Lumi" });
const round = new LabRound("viewpoint", activeProfileId());
const task = round.state.task;
assert.equal(task.format, "table-view");
const pair = ownView(task.items, task.side).slice(2);
const wrong = checkView(task, [...pair].reverse(), null);
round.answer(task.id, wrong.correct, wrong.hint);
assert.match(round.state.hint ?? "", /Blickrichtung/);
round.advance(task.id);
round.answer(task.id, checkView(task, pair, null).correct);
assert.equal(round.state.status, "right");
assert.deepEqual(readSave().log.map(e => [e.s, e.ok]), [["standpunkte", 0]]);
console.log("Standpunkte: alle vier Blickrichtungen, Spiegelverwechslung, Umkehraufgabe, Auflösung und Zweitversuch geprüft.");
