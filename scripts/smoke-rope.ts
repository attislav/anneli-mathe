import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { checkCoverage, checkRope, estimateRope, wholeCm } from "../src/game/estimateRope";
import { LAB_TOPICS, LabRound } from "../src/game/lab";
import { getSkill } from "../src/game/skills";
import { skillReports, suggestedLesson } from "../src/game/report";
import { activeProfileId, createProfile, logAnswer, readSave } from "../src/game/state";
import { LAB_GROUPS, LAB_TOPIC_IDS } from "../src/game/schoolSelection";
import type { Level, RopeTask } from "../src/game/types";
import { EstimateRope } from "../src/lesson/EstimateRope";

const two = { unit: 2 as const, length: 6 };
const correct = [0, 2, 4];
for (const tip of [0, 1, 5, 6, 7, 23, 100]) {
  assert.equal(checkRope(two, correct, tip, "6", String(Math.abs(tip - 6))).correct, true);
}
assert.equal(checkCoverage(two, [4, 0, 2]), undefined);
assert.match(checkCoverage(two, [0, 3]) ?? "", /Lücke/);
assert.match(checkCoverage(two, [0, 1, 4]) ?? "", /überlappen/);
assert.match(checkCoverage(two, [0, 2, 2, 4]) ?? "", /überlappen/);
assert.match(checkCoverage(two, [0, 2, 5]) ?? "", /hinaus/);
assert.equal(checkRope(two, [0, 2], 6, "6", "0").correct, false);
assert.equal(checkRope(two, [0, 1, 4], 6, "6", "0").correct, false);
assert.equal(checkRope(two, correct, 6, "3", "3").correct, false);
assert.equal(checkRope(two, correct, 2, "6", "2").correct, false);
for (const invalid of ["", "-2", "1.5", "abc", "Infinity"]) assert.equal(wholeCm(invalid), null);
assert.equal(wholeCm("0"), 0);
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  for (let i = 0; i < 50; i++) {
    const task = estimateRope(level);
    assert.equal(task.unit, level >= 4 ? 2 : 1);
    assert.ok(task.length % task.unit === 0 && task.length < task.extent);
    if (level <= 2) assert.ok(task.length >= 3 && task.length <= 8);
  }
}
const task: RopeTask = { ...estimateRope(5), id: "rope", skillId: LAB_TOPICS.rope.skillId, level: 5 };
const html = renderToStaticMarkup(createElement(EstimateRope, { task, status: "ask", onAnswer() {} }));
assert.ok(html.includes("Tipp festhalten") && !html.includes("Messung prüfen") && !html.includes('type="range"'));
const widths = [...html.matchAll(/width:([\d.]+)%/g)].map(match => Number(match[1]));
assert.ok(Math.abs(widths[0] / widths[1] - task.length / task.unit) < 0.00001);
assert.equal(LAB_GROUPS.flatMap(group => [...group.topics] as string[]).length, new Set(LAB_TOPIC_IDS).size);
assert.deepEqual(new Set(LAB_TOPIC_IDS), new Set(Object.keys(LAB_TOPICS)));
createProfile({ name: "Mina", pet: "funkel", petName: "Lumi" });
logAnswer({ t: 1, l: 1, s: "schaetzen", ok: 1, ms: 4000 });
const round = new LabRound("rope", activeProfileId());
for (let i = 0; i < 5; i++) {
  const { id } = round.state.task;
  round.answer(id, false); round.advance(id); round.answer(id, true); round.advance(id);
}
const save = readSave();
const reports = skillReports(save);
assert.equal(reports.find(r => r.id === "schaetzen")?.count, 1);
const measured = reports.find(r => r.id === "schaetzungPruefen");
assert.ok(measured && measured.count === 5 && measured.title === "Schätzungen durch Messen prüfen");
assert.equal(suggestedLesson(save, measured, true), null);
const open = { ...save, skippedWorlds: ["ozean" as const], nodes: { "werkstatt-6": { stars: [1, 0, 0] as [number, number, number], plays: 1 } } };
assert.equal(suggestedLesson(open, measured, true)?.node.id, "werkstatt-7");
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  assert.equal(getSkill("schaetzen").gen({ level, avoid: [] }).format, "choice");
  assert.equal(getSkill("schaetzungPruefen").gen({ level, avoid: [] }).format, "estimate-rope");
}
console.log("Schätzlabor: gemeinsamer Maßstab, freie Schätzung, Abstände, Lücken, Überlappung, Rand und Themenauswahl geprüft.");
