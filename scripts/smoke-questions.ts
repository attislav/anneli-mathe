import assert from "node:assert/strict";
import { checkQuestion, composeQuestion, startQuestion, type QuestionEntry } from "../src/game/writeQuestion";
import { writeQuestion } from "../src/game/skillsDetektiv";
import { LabRound } from "../src/game/lab";
import { activeProfileId, createProfile, readSave } from "../src/game/state";
import type { WriteQuestionTask } from "../src/game/types";

const task: Pick<WriteQuestionTask, "groups" | "scene"> = { scene: "fruit", groups: [
  { icon: "apfel", label: "Äpfel", value: 5 }, { icon: "birne", label: "Birnen", value: 3 }, { icon: "banane", label: "Bananen", value: 3 },
] };
const sum = { a: 0, b: 1, kind: "sum" } as const;
const difference = { ...sum, kind: "difference" } as const;
assert.equal(composeQuestion(task, sum)?.sentence, "Wie viele Äpfel und Birnen liegen zusammen im Korb?");
assert.equal(composeQuestion(task, difference)?.sentence, "Wie groß ist der Unterschied zwischen den Gruppen „Äpfel“ und „Birnen“?");
assert.equal(composeQuestion(task, { ...sum, b: 0 }), null);
assert.equal(composeQuestion(task, { ...sum, b: null }), null);
const entry: QuestionEntry = { ...startQuestion(sum), left: 0, right: 1, sign: "+", answer: "8" };
assert.equal(checkQuestion(task, entry).correct, true);
assert.equal(checkQuestion(task, { ...entry, left: 1, right: 0 }).correct, true);
assert.equal(checkQuestion(task, { ...entry, right: 2 }).correct, false);
assert.equal(checkQuestion(task, { ...entry, sign: "−" }).correct, false);
assert.equal(checkQuestion(task, { ...entry, answer: "2" }).correct, false);
const diff = { ...entry, question: difference, sign: "−" as const, answer: "2" };
assert.equal(checkQuestion(task, diff).correct, true);
assert.equal(checkQuestion(task, { ...diff, left: 1, right: 0 }).correct, false);
const tie = { ...diff, question: { ...difference, a: 1, b: 2 }, left: 1, right: 2, answer: "0" };
assert.equal(checkQuestion(task, tie).correct, true);
assert.equal(checkQuestion(task, { ...tie, left: 2, right: 1 }).correct, true);
assert.equal(startQuestion(difference).answer, "");
assert.equal(startQuestion(difference).left, null);
assert.equal(startQuestion(difference).sign, null);
const pets: typeof task = { scene: "pets", groups: [
  { label: "Hunde", icon: "hund", value: 8 }, { label: "Hasen", icon: "hase", value: 4 }, { label: "Vögel", icon: "vogel", value: 6 }] };
assert.equal(composeQuestion(pets, sum)?.sentence, "Wie viele Hunde und Hasen leben zusammen im Tierheim?");
for (let i = 0; i < 100; i++) {
  const t = writeQuestion(5);
  assert.equal(new Set(t.groups.map(g => g.label)).size, 3);
  for (const a of [0, 1, 2]) for (const b of [0, 1, 2]) if (a !== b) {
    for (const kind of ["sum", "difference"] as const) {
      const question = { a, b, kind };
      const model = composeQuestion(t, question)!;
      assert.ok(checkQuestion(t, { question, left: model.left, right: model.right, sign: model.sign, answer: String(model.value) }).correct);
    }
  }
}
createProfile({ name: "Lina", pet: "funkel", petName: "Lumi" });
const round = new LabRound("questions", activeProfileId());
const t = round.state.task;
assert.equal(t.format, "write-question");
const model = composeQuestion(t, sum)!;
assert.equal(readSave().log.length, 0);
const ok = { ...entry, answer: String(model.value) };
const wrong = checkQuestion(t, { ...ok, sign: "−" });
round.answer(t.id, wrong.correct, wrong.hint);
round.advance(t.id);
round.answer(t.id, checkQuestion(t, ok).correct);
assert.equal(round.state.status, "right");
assert.deepEqual(readSave().log.map(e => [e.s, e.ok]), [["sachaufgaben", 0]]);
console.log("Fragenwerkstatt: Szenensätze, Modelle, Tausch, Gleichstand, dritte Menge, Korrektur und Erstwertung geprüft.");
