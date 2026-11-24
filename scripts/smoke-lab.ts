import assert from "node:assert/strict";
import { mock } from "node:test";
import { firstIncorrectGap, hundredWindow, windowHint, windowValue } from "../src/game/hundredWindow";
import { busJourney, busTable, checkBus } from "../src/game/busTable";
import type { Level } from "../src/game/types";
import { LAB_COUNT, LAB_TOPICS, LabRound, type LabTopic } from "../src/game/lab";
import { updateMastery } from "../src/game/adaptive";
import { skillReports } from "../src/game/report";
import { getSkill } from "../src/game/skills";
import { activeProfileId, addProfile, createProfile, readProfileSave, readSave, switchProfile } from "../src/game/state";

const values = new Map<string, string>();
const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => values.set(k, v) };
Object.defineProperty(globalThis, "window", { value: { localStorage: storage, sessionStorage: storage } });
createProfile({ name: "Lina", pet: "funkel", petName: "Lumi" }, [], { reihen: 5 });
const owner = activeProfileId();
const before = structuredClone(readSave());
const formats = { bus: "bus-table", window: "hundred-window", machine: "machine", cubes: "cube-model", shopping: "baskets", calendar: "calendar", pairs: "number-pairs", route: "grid-route" };
assert.equal(LAB_COUNT, 5);

const exactBus = { stops: ["Park", "Schule", "Markt"], from: 1, to: 2, earliest: 9 * 60 + 55,
  trips: [[560, 580, 595], [575, 595, 610], [600, 620, 635]] };
assert.deepEqual(busJourney(exactBus), { column: 1, departure: 595, arrival: 610, duration: 15 });
assert.equal(busJourney({ ...exactBus, earliest: 596 }).column, 2);
assert.equal(checkBus(exactBus, 1, 1, "15").correct, true);
assert.match(checkBus(exactBus, 0, 1, "15").hint ?? "", /Spalte/);
assert.match(checkBus(exactBus, 0, 0, "15").hint ?? "", /9:55/);
assert.match(checkBus(exactBus, 1, 1, "55").hint ?? "", /10:00/);
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  let seed = level;
  const random = mock.method(Math, "random", () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  });
  const startMinutes = new Set<number>();
  const durations = new Set<number>();
  let hourChanges = 0;
  for (let i = 0; i < 75; i++) {
    const task = busTable(level);
    const { column, departure, arrival, duration } = busJourney(task);
    startMinutes.add(departure % 60);
    durations.add(duration);
    if (level === 1) assert.ok(!checkBus(task, column, column, duration === 15 ? "30" : "15").correct);
    if (Math.floor(arrival / 60) > Math.floor(departure / 60)) hourChanges++;
    assert.equal(task.trips.length, level <= 2 ? 1 : 3);
    assert.ok(task.from < task.to && departure >= task.earliest && duration > 0);
    assert.ok(task.trips.slice(0, column).every(trip => trip[task.from] < task.earliest));
    assert.ok(task.trips.every(trip => trip.every((time, j) =>
      time >= 0 && time < 1440 && time % (level <= 2 ? 15 : 5) === 0 && (j === 0 || time > trip[j - 1]))));
    assert.equal(arrival - departure, duration);
    assert.ok(checkBus(task, column, column, String(duration)).correct);
    assert.ok(!checkBus(task, column, column, "").correct);
  }
  random.mock.restore();
  if (level === 1) assert.deepEqual(durations, new Set([15, 30]));
  if (level >= 4) {
    assert.ok(startMinutes.size >= 5);
    assert.ok(hourChanges > 40 && hourChanges < 75);
  }
}

const corners = new Set<number>();
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  for (const [a, b] of [[0, 0], [0, 0.999], [0.999, 0], [0.999, 0.999]]) {
    let calls = 0;
    const random = mock.method(Math, "random", () => calls++ === 0 ? a : b);
    const task = hundredWindow(level);
    random.mock.restore();
    assert.equal(task.size, level <= 2 ? 2 : 3);
    assert.equal(task.gaps.length, [1, 2, 2, 3, 4][level - 1]);
    const values = Array.from({ length: task.size ** 2 }, (_, i) => windowValue(task, i));
    for (const [i, value] of values.entries()) {
      assert.ok(value >= 1 && value <= 100);
      if ([1, 10, 91, 100].includes(value)) corners.add(value);
      if (i % task.size !== 0) assert.equal(Math.floor((value - 1) / 10), Math.floor((values[i - 1] - 1) / 10));
    }
    const correct = Object.fromEntries(task.gaps.map(gap => [gap, String(values[gap])]));
    assert.equal(firstIncorrectGap(task, correct), undefined);
    for (const gap of task.gaps) {
      const hint = windowHint(task, gap);
      const anchor = Number(hint.match(/Starte bei (\d+)\./)?.[1]);
      assert.ok(values.includes(anchor) && !task.gaps.includes(values.indexOf(anchor)));
      const delta = hint.includes("nach unten") ? 10 : hint.includes("nach oben") ? -10 : hint.includes("nach rechts") ? 1 : -1;
      assert.equal(anchor + delta, values[gap]);
      assert.equal(firstIncorrectGap(task, { ...correct, [gap]: "" }), gap);
      assert.equal(firstIncorrectGap(task, { ...correct, [gap]: "999" }), gap);
    }
  }
}
assert.deepEqual(corners, new Set([1, 10, 91, 100]));
const neighborSkill = getSkill("nachbarn");
const forceWindow = mock.method(Math, "random", () => 0);
try {
  assert.equal(neighborSkill.gen({ level: 1, avoid: [] }).format, "hundred-window");
} finally {
  forceWindow.mock.restore();
}
for (let i = 0; i < 20; i++) {
  assert.notEqual(neighborSkill.gen({ level: 1, avoid: ["hundred-window"] }).format, "hundred-window");
}

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
console.log("Acht Labor-Themen, fünf Aufgaben, Erstversuche, Profile, Lernbericht und Pfadfortschritt geprüft.");
