import assert from "node:assert/strict";
import { LAB_TOPICS, type LabTopic } from "../src/game/lab";
import { SCHOOL_PATH, SchoolRound, schoolOrder, schoolRecommendation, setSchoolTopics } from "../src/game/schoolAssignment";
import { schoolTopics } from "../src/game/schoolSelection";
import { activeProfileId, createProfile, emptyState, importAsNewProfile, readSave, replaceSave, switchProfile } from "../src/game/state";
import { exportCode, parseCode } from "../src/game/transfer";

const values = new Map<string, string>();
const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => values.set(k, v) };
Object.defineProperty(globalThis, "window", { value: { localStorage: storage, sessionStorage: storage } });

async function main() {
  assert.deepEqual(schoolTopics(["pairs", "unknown", "pairs", "constructor", "bus", "tiles", "route"]), ["pairs", "bus", "tiles"]);
  assert.deepEqual(schoolTopics(["pairs", "pairs"]), []);
  assert.deepEqual(schoolTopics(null), []);
  for (const topics of [["pairs", "bus"], ["pairs", "bus", "tiles"]] as LabTopic[][]) {
    for (let i = 0; i < 50; i++) {
      const order = schoolOrder(topics);
      assert.deepEqual(new Set(order.slice(0, topics.length)), new Set(topics));
      assert.deepEqual(new Set(order.slice(topics.length)), new Set(topics));
      assert.equal(order.length, 2 * topics.length);
      assert.ok(order.every((topic, j) => topic !== order[j - 1]));
    }
  }
  createProfile({ name: "Leni", pet: "funkel", petName: "Lumi" });
  const owner = activeProfileId();
  assert.equal(schoolRecommendation(emptyState()), null);
  setSchoolTopics(owner, ["bus", "calendar"]);
  assert.equal(schoolRecommendation(readSave())?.href, SCHOOL_PATH + "?start=1");
  setSchoolTopics(owner, ["pairs", "bus"]);
  assert.equal(schoolRecommendation(readSave())?.href, "/lektion/?n=start-1&t=0");
  const round = new SchoolRound(owner, readSave().schoolTopics);
  setSchoolTopics(owner, ["route", "tiles"]);
  for (const [i, topic] of round.order.entries()) {
    const { task } = round.state;
    assert.ok(topic === "pairs" || topic === "bus");
    assert.equal(task.skillId, LAB_TOPICS[topic].skillId);
    round.answer(task.id, i > 0);
    if (i === 0) {
      round.advance(task.id);
      round.answer(task.id, true);
    }
    round.advance(task.id);
  }
  assert.equal(round.state.status, "done");
  assert.equal(round.state.firstRight, 3);
  assert.equal(round.results.get(round.order[0]), 1);
  assert.equal(round.results.size, 2);
  assert.equal(readSave().log.length, 4);
  assert.deepEqual(readSave().nodes, {});

  const interrupted = new SchoolRound(owner, readSave().schoolTopics);
  const exported = await parseCode(await exportCode());
  assert.ok(exported);
  importAsNewProfile(exported);
  const sibling = activeProfileId();
  assert.notEqual(sibling, owner);
  assert.deepEqual(readSave().schoolTopics, ["route", "tiles"]);
  const entries = readSave().log.length;
  interrupted.answer(interrupted.state.task.id, true);
  assert.equal(readSave().log.length, entries);
  setSchoolTopics(owner, []);
  assert.deepEqual(readSave().schoolTopics, ["route", "tiles"]);
  setSchoolTopics(sibling, []);
  assert.equal(schoolRecommendation(readSave()), null);
  replaceSave({ ...exported, schoolTopics: ["bus", "bus", "calendar"] });
  assert.deepEqual(readSave().schoolTopics, ["bus", "calendar"]);
  delete exported.schoolTopics;
  replaceSave(exported);
  assert.deepEqual(readSave().schoolTopics, []);
  switchProfile(owner);
  assert.deepEqual(readSave().schoolTopics, ["route", "tiles"]);
  console.log("Schulauftrag: Aufgabenfolge, Erstwertung, Empfehlungen, alte Spielstände, Spielstand-Code und Geschwister geprüft.");
}

void main();
