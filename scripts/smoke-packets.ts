import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SumPacket } from "../src/lesson/SumPacket";
import { checkPacket, packetValues, sumPacket, type PacketEntry } from "../src/game/sumPacket";
import { getSkill } from "../src/game/skills";
import type { Level, PacketTask } from "../src/game/types";

const effects = new Set<number>();
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  for (let i = 0; i < 120; i++) {
    const task = sumPacket(level);
    const { sum, oldSum, a, b, delta } = packetValues(task);
    assert.ok([...task.before, a, b, sum, oldSum].every(n => Number.isInteger(n) && n >= 0 && n <= 100));
    assert.equal(task.changes.filter(Boolean).length, level <= 2 ? 1 : 2);
    assert.equal(task.exact, level >= 4);
    effects.add(delta);
    const entry: PacketEntry = { changed: [...task.changes], direction: Math.sign(delta), amount: String(Math.abs(delta)), result: String(sum) };
    assert.deepEqual(checkPacket(task, "change", entry), { next: "predict" });
    assert.deepEqual(checkPacket(task, "predict", entry), { next: "result" });
    assert.deepEqual(checkPacket(task, "result", entry), { correct: true });
    assert.equal(checkPacket(task, "result", { ...entry, changed: [null, null] }).correct, false);
    assert.equal(checkPacket(task, "result", { ...entry, direction: null }).correct, false);
    assert.equal(checkPacket(task, "result", { ...entry, result: "" }).correct, false);
    if (delta && task.exact) assert.equal(checkPacket(task, "predict", { ...entry, amount: "999" }).correct, false);
  }
}
assert.ok([-20, -10, -2, -1, 0, 1, 2, 10, 20].every(n => effects.has(n)));
assert.equal(getSkill("rechenpaeckchen").gen({ level: 4, avoid: [] }).format, "sum-packet");
const edge: PacketTask = { ...sumPacket(5), id: "test", skillId: "rechenpaeckchen", level: 5, before: [90, 10], changes: [10, -10] };
assert.deepEqual(packetValues(edge), { a: 100, b: 0, oldSum: 100, sum: 100, delta: 0 });
const zero = { ...edge, before: [1, 10] as [number, number], changes: [-1, -10] as [number, number] };
assert.equal(packetValues(zero).sum, 0);
const narrow = { ...edge, before: [2, 95] as [number, number], changes: [1, -1] as [number, number] };
const buttons = [...renderToStaticMarkup(createElement(SumPacket, { task: narrow, status: "ask", onAnswer: () => {} }))
  .matchAll(/<button\b([^>]*)>([−+]\d+)<\/button>/g)];
assert.equal(buttons.length, 8);
assert.deepEqual(buttons.map(match => match[1].includes("disabled")), [true, false, false, false, false, false, false, true]);
for (const status of ["ask", "wrong", "reveal", "right"] as const) {
  const html = renderToStaticMarkup(createElement(SumPacket, { task: edge, status, onAnswer: () => {} }));
  assert.equal(html.includes("Nachher"), status === "right" || status === "reveal");
  assert.equal(html.includes("Zehner und"), status === "right" || status === "reveal");
  assert.equal(html.includes("Ergebnis prüfen"), false);
}
console.log("Rechenpäckchen: Änderungen, Vorhersage vor Ergebnis, Gegenbewegungen, 0/100 und bildliche Auflösung geprüft.");
