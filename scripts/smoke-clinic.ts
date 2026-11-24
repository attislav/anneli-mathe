import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CLINIC_CASES, checkModel, clinicTransfer, ClinicRound, initialModel, modelPicture, moveCounter } from "../src/game/clinic";
import { activeProfileId, addProfile, createProfile, readSave, readProfileSave } from "../src/game/state";
import { ClinicFrames, ClinicModel } from "../src/screens/ClinicScreen";

const data = new Map<string, string>();
const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => data.set(k, v) };
Object.defineProperty(globalThis, "window", { value: { localStorage: storage, sessionStorage: storage } });
createProfile({ name: "Lena", pet: "funkel", petName: "Lumi" });
const owner = activeProfileId();
for (const topic of ["plus", "minus"] as const) {
  const model = CLINIC_CASES[topic];
  const before = structuredClone(readSave());
  let state = initialModel;
  const ui = renderToStaticMarkup(createElement(ClinicModel, { topic, onBack() {}, onNext() {} }));
  assert.match(ui, /<button[^>]*type="button"/);
  assert.match(ui, /Zur Sprechstunde/);
  assert.doesNotMatch(ui, /Jetzt selbst rechnen/);
  state = moveCounter(topic, state, 1);
  assert.equal(checkModel(topic, state).phase, "ten");
  state = moveCounter(topic, state, 1);
  state = moveCounter(topic, state, 1);
  assert.equal(checkModel(topic, state).phase, "ten");
  state = moveCounter(topic, state, -1);
  assert.equal(modelPicture(topic, state).total, model.ten);
  state = checkModel(topic, state);
  assert.equal(state.phase, "rest");
  assert.equal(checkModel(topic, state).phase, "rest");
  assert.equal(moveCounter(topic, state, -1).moved, 2);
  while (modelPicture(topic, state).remaining) {
    state = moveCounter(topic, state, 1);
    const { total } = modelPicture(topic, state);
    const html = renderToStaticMarkup(createElement(ClinicFrames, { total, capacity: topic === "plus" ? 13 : 32, start: model.start }));
    assert.match(html, new RegExp(total + " Plättchen"));
    assert.equal([...html.matchAll(/<i [^>]*class="[^"]*(?:bg-grape|bg-leaf-dark)/g)].length, total);
  }
  assert.equal(modelPicture(topic, state).total, topic === "plus" ? 13 : 25);
  state = checkModel(topic, state);
  assert.equal(state.phase, "done");
  assert.deepEqual(readSave(), before);

  let previous = clinicTransfer(topic);
  for (let i = 0; i < 100; i++) {
    const exercise = clinicTransfer(topic, previous);
    assert.notEqual(exercise.a, previous.a);
    assert.notEqual(exercise.b, previous.b);
    assert.notEqual(exercise.a, model.start);
    assert.notEqual(exercise.b, model.distance);
    assert.equal(exercise.task.answer, exercise.a + model.sign * exercise.b);
    assert.ok(topic === "plus" ? exercise.a < 10 && exercise.task.answer > 10 :
      exercise.a % 10 > 0 && exercise.task.answer < exercise.a - exercise.a % 10);
    previous = exercise;
  }
  const abandoned = new ClinicRound(owner, topic);
  assert.equal(abandoned.state.status, "ask");
  assert.deepEqual(readSave(), before);
  const round = new ClinicRound(owner, topic);
  const id = round.state.task.id;
  round.answer(id, false); round.answer(id, true); round.advance(id); round.answer(id, true); round.advance(id);
  assert.equal(round.state.status, "done");
  assert.deepEqual(readSave().log.slice(before.log.length).map(entry => [entry.s, entry.ok]),
    [[topic === "plus" ? "uebergang20" : "uebergang100", 0]]);
  assert.deepEqual({ ...readSave(), mastery: before.mastery, log: before.log }, before);
}
const inactive = new ClinicRound(owner, "minus");
addProfile();
createProfile({ name: "Lino", pet: "drachi", petName: "Leo" });
assert.equal(inactive.answer(inactive.state.task.id, true).status, "ask");
assert.equal(readSave().log.length, 0);
assert.equal(readProfileSave(owner)?.log.length, 2);
console.log("Sprechstunde: Materialzustände beider Rechnungen, Korrekturen, Abbruch, Transfer, Wiederholung und Profile geprüft.");
