import assert from "node:assert/strict";
import { LAB_COUNT, LAB_TOPICS, LabRound, type LabTopic } from "../src/game/lab";
import { updateMastery } from "../src/game/adaptive";
import { skillReports } from "../src/game/report";
import { activeProfileId, addProfile, createProfile, readProfileSave, readSave, switchProfile } from "../src/game/state";

const values = new Map<string, string>();
const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => values.set(k, v) };
Object.defineProperty(globalThis, "window", { value: { localStorage: storage, sessionStorage: storage } });
createProfile({ name: "Lina", pet: "funkel", petName: "Lumi" }, [], { reihen: 5 });
const owner = activeProfileId();
const before = structuredClone(readSave());
const formats = { machine: "machine", cubes: "cube-model", shopping: "baskets", calendar: "calendar", pairs: "number-pairs", route: "grid-route" };
assert.equal(LAB_COUNT, 5);

for (const topic of Object.keys(LAB_TOPICS) as LabTopic[]) {
  const round = new LabRound(topic, owner);
  const startLog = readSave().log.length;
  const skill = LAB_TOPICS[topic].skillId;
  let mastery = readSave().mastery[skill] ?? 2;
  for (let n = 1; n <= LAB_COUNT; n++) {
    const { task } = round.state;
    assert.equal(round.state.number, n);
    assert.equal(task.format, formats[topic]);
    assert.equal(task.skillId, skill);
    assert.equal(task.level, Math.round(mastery));
    assert.equal(round.advance(task.id).status, "ask");
    const correct = n > 2;
    round.answer(task.id, correct, "Mein Tipp");
    round.answer(task.id, !correct);
    if (!correct) {
      assert.equal(round.state.status, "wrong");
      assert.equal(round.state.hint, "Mein Tipp");
      assert.equal(round.advance(task.id).status, "ask");
      assert.equal(round.answer(task.id, n === 2).status, n === 2 ? "right" : "reveal");
    }
    mastery = updateMastery(mastery, correct);
    assert.equal(readSave().mastery[skill], mastery);
    assert.equal(readSave().log.length, startLog + n);
    assert.equal(readSave().log.at(-1)?.ok, Number(correct));
    round.advance(task.id);
    round.answer(task.id, false);
  }
  assert.equal(round.state.status, "done");
  assert.equal(round.state.firstRight, 3);
  assert.equal(round.advance(round.state.task.id).number, LAB_COUNT);
  const report = skillReports(readSave()).find(r => r.id === skill);
  assert.equal(report?.count, 5);
  assert.equal(report?.acc, 3 / 5);
}
const after = readSave();
assert.deepEqual({ ...after, log: before.log, mastery: before.mastery }, before);
const oldRound = new LabRound("calendar", owner);
addProfile();
createProfile({ name: "Lino", pet: "drachi", petName: "Leo" });
const sibling = activeProfileId();
assert.notEqual(sibling, owner);
assert.equal(oldRound.answer(oldRound.state.task.id, true).status, "ask");
assert.equal(readSave().log.length, 0);
const siblingRound = new LabRound("calendar", sibling);
siblingRound.answer(siblingRound.state.task.id, true);
switchProfile(owner);
assert.equal(siblingRound.advance(siblingRound.state.task.id).status, "right");
assert.deepEqual(readSave(), after);
assert.equal(readProfileSave(sibling)?.log.length, 1);
console.log("Sechs Labor-Themen, fünf Aufgaben, Erstversuche, Profile, Lernbericht und Pfadfortschritt geprüft.");
