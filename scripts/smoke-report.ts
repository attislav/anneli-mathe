import assert from "node:assert/strict";
import { skillReports, suggestedLesson } from "../src/game/report";
import { emptyState } from "../src/game/state";

function reportFixture(skill: string, answers: number, correct = 0) {
  const save = emptyState();
  save.log = Array.from({ length: answers }, (_, i) => ({
    s: skill, t: 1_800_000_000 + i, l: 2, ms: 3000, ok: i < correct ? 1 : 0,
  }));
  return { save, report: skillReports(save)[0] };
}

assert.equal(skillReports(emptyState()).length, 0);
const tooSoon = reportFixture("freunde10", 4);
assert.equal(suggestedLesson(tooSoon.save, tooSoon.report, true), null);
const threshold = reportFixture("freunde10", 5, 3);
assert.equal(suggestedLesson(threshold.save, threshold.report, true), null);

const single = reportFixture("freunde10", 5, 2);
assert.equal(suggestedLesson(single.save, single.report, true)?.href, "/lektion?n=start-1&t=0");
const sibling = suggestedLesson(single.save, single.report, false);
assert.equal(sibling?.node.id, "start-1");
assert.equal(sibling?.href, null);

const mixed = reportFixture("kalender", 8);
assert.equal(suggestedLesson(mixed.save, mixed.report, true), null);
mixed.save.skippedWorlds.push("baeckerei");
assert.equal(suggestedLesson(mixed.save, mixed.report, true), null);
mixed.save.chests.push("schloss-4");
assert.equal(suggestedLesson(mixed.save, mixed.report, true)?.node.id, "schloss-5");

const competing = reportFixture("spiegeln", 10);
competing.save.skippedWorlds.push("schloss", "ozean");
assert.deepEqual(suggestedLesson(competing.save, competing.report, true)?.node.skills, ["spiegeln"]);
console.log("Lernbericht: Datenbasis, Einzelthema, Mix, Pfadfreigabe und Geschwisterprofil geprüft.");
