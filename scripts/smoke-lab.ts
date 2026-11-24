import assert from "node:assert/strict";
import { mock } from "node:test";
import { firstIncorrectGap, hundredWindow, windowHint, windowValue } from "../src/game/hundredWindow";
import { busJourney, busTable, checkBus } from "../src/game/busTable";
import { classSurvey } from "../src/game/skillsDetektiv";
import { checkShopList, shopList, shopSolution } from "../src/game/shopList";
import { createTrip, latestOnTime, snackPairFits, TripRound } from "../src/game/classTrip";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SnackPair } from "../src/lesson/SnackPair";
import { checkSurvey, surveyAnswer, surveyRows } from "../src/game/survey";
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
const formats = { shops: "shop-list", questions: "write-question", split: "split-array", rope: "estimate-rope", viewpoint: "table-view", packets: "sum-packet", tiles: "tile-floor", survey: "class-survey", bus: "bus-table", window: "hundred-window", machine: "machine", cubes: "cube-model", shopping: "baskets", calendar: "calendar", pairs: "number-pairs", route: "grid-route" };
assert.equal(LAB_COUNT, 5);

const goods = ["Apfel", "Birne"];
const offers = [{ name: "Mond", prices: [5, 40] }, { name: "Sonne", prices: [15, 20] }, { name: "Stern", prices: [1, null] }];
for (const stores of [offers, [offers[2], offers[0], offers[1]], [offers[1], offers[2], offers[0]]]) {
  const catalog = { goods, stores };
  const entry = { available: stores.map(s => s.name !== "Stern"), totals: stores.map(s => s.name === "Mond" ? "45" : s.name === "Sonne" ? "35" : ""),
    winner: String(stores.indexOf(offers[1])), saving: "10" };
  assert.ok(checkShopList(catalog, entry).correct);
  assert.equal(checkShopList(catalog, { ...entry, available: stores.map(() => true) }).correct, false);
  assert.equal(checkShopList(catalog, { ...entry, winner: String(stores.indexOf(offers[0])) }).correct, false);
  assert.equal(checkShopList(catalog, { ...entry, saving: "11" }).correct, false);
  assert.equal(checkShopList(catalog, { ...entry, totals: stores.map(() => "35") }).correct, false);
}
const equalStores = { goods, stores: [offers[0], { name: "Sonne", prices: [25, 20] }] };
const equalEntry = { available: [true, true], totals: ["45", "45"], winner: "tie", saving: "0" };
assert.ok(checkShopList(equalStores, equalEntry).correct);
assert.equal(checkShopList(equalStores, { ...equalEntry, winner: "0" }).correct, false);
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  for (let i = 0; i < 40; i++) {
    const catalog = shopList(level);
    const { totals } = shopSolution(catalog);
    assert.equal(catalog.goods.length, level <= 2 ? 2 : 3);
    assert.equal(catalog.stores.length, level <= 2 ? 2 : 3);
    assert.equal(totals.filter(n => n !== null).length, 2);
    assert.ok(totals.every(n => n === null || n > 0 && n <= 100));
  }
}

const survey = { categories: [{ icon: "apfel" as const, label: "Äpfel" }, { icon: "birne" as const, label: "Birnen" }],
  votes: [0, 0, 1, 0, 0, 1, 0], target: 0, compare: null };
const misplaced = [1, 0, 0, 0, 0, 1, 0];
assert.deepEqual(surveyRows(survey, misplaced).map(row => row.value), [5, 2]);
assert.equal(checkSurvey(survey, misplaced, "5").correct, false);
assert.match(checkSurvey(survey, misplaced, "5").hint ?? "", /Zettel 1/);
assert.equal(checkSurvey(survey, [...survey.votes, 0], "5").correct, false);
assert.equal(checkSurvey(survey, survey.votes.slice(1), "5").correct, false);
misplaced[0] = 0;
assert.deepEqual(surveyRows(survey, misplaced).map(row => row.value), [6, 1]);
misplaced[2] = 1;
assert.equal(checkSurvey(survey, misplaced, "5").correct, true);
assert.equal(checkSurvey(survey, misplaced, "6").correct, false);
const tie = { ...survey, votes: [0, 1, 1, 0, 0, 1], compare: 1 };
assert.equal(surveyAnswer(tie), 0);
assert.equal(checkSurvey(tie, tie.votes, "0").correct, true);
assert.equal(checkSurvey(tie, tie.votes, "").correct, false);
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  for (let i = 0; i < 80; i++) {
    const task = classSurvey(level);
    const rows = surveyRows(task, task.votes);
    assert.equal(task.votes.length, 4 + level);
    assert.ok(rows.every(row => row.value >= 1));
    assert.equal(rows.reduce((sum, row) => sum + row.value, 0), task.votes.length);
    assert.equal(checkSurvey(task, task.votes, String(surveyAnswer(task))).correct, true);
  }
}

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
  const previousCount = skillReports(readSave()).find(r => r.id === skill)?.count ?? 0;
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
  assert.equal(report?.count, previousCount + LAB_COUNT);
  assert.equal(report?.acc, 3 / 5);
}
let tripSeed = 1234;
const tripRandom = mock.method(Math, "random", () => {
  tripSeed = (Math.imul(1664525, tripSeed) + 1013904223) >>> 0;
  return tripSeed / 2 ** 32;
});
const winners = new Set<string>(), onTimeCounts = new Set<number>();
let zeroWait = false, crossedHour = false;
for (let i = 0; i < 100; i++) {
  const plan = createTrip();
  const [bus, wait, snacks] = plan.tasks;
  const onTime = plan.timetable.filter(row => row.arrival <= plan.appointment);
  const expected = onTime.reduce((later, row) => row.departure > later.departure ? row : later);
  assert.equal(bus.answer, expected.name);
  assert.deepEqual(latestOnTime([...plan.timetable].reverse(), plan.appointment), expected);
  winners.add(expected.name);
  onTimeCounts.add(onTime.length);
  assert.equal(wait.answer, plan.appointment - expected.arrival);
  zeroWait ||= wait.answer === 0;
  crossedHour ||= Math.floor(plan.appointment / 60) > Math.floor(expected.arrival / 60);
  const pairs = [[0, 1], [0, 2], [1, 2]].filter(pair => snackPairFits(snacks, pair));
  assert.equal(pairs.length, 1);
  assert.deepEqual(pairs[0].map(j => snacks.snacks[j].name).sort(), [...plan.snacks].sort());
  if (i < 10) {
    const renderPair = (status: "ask" | "wrong" | "reveal") => renderToStaticMarkup(createElement(SnackPair, {
      task: snacks, status, onAnswer: () => {},
    }));
    const pressed = (html: string) => [...html.matchAll(/aria-pressed="(true|false)"/g)].map(m => m[1] === "true");
    assert.deepEqual(pressed(renderPair("ask")), [false, false, false]);
    assert.deepEqual(pressed(renderPair("wrong")), [false, false, false]);
    assert.deepEqual(pressed(renderPair("reveal")), snacks.snacks.map((_, index) => pairs[0].includes(index)));
  }
  assert.equal(snackPairFits(snacks, [0, 0]), false);
}
tripRandom.mock.restore();
assert.deepEqual(onTimeCounts, new Set([1, 2]));
assert.equal(winners.size, 2);
assert.ok(zeroWait && crossedHour);
const project = new TripRound(owner);
const beforeTrip = readSave();
const first = project.state.task.id;
project.answer(first, false);
project.answer(first, true);
assert.equal(project.state.status, "wrong");
project.advance(first);
project.answer(first, false);
assert.equal(project.state.status, "reveal");
project.advance(first);
assert.deepEqual(project.state.task, project.plan.tasks[1]);
assert.equal(project.plan.tasks[1].answer, project.plan.appointment - project.plan.chosen.arrival);
project.advance(first);
assert.equal(project.state.number, 2);
for (const task of project.plan.tasks.slice(1)) {
  project.answer(task.id, true);
  project.answer(task.id, false);
  project.advance(task.id);
}
assert.equal(project.state.status, "done");
assert.equal(project.state.firstRight, 2);
assert.deepEqual(readSave().log.slice(beforeTrip.log.length).map(e => [e.s, e.ok]), [["uhrLesen", 0], ["zeitspanne", 1], ["einkaufen", 1]]);
const interruptedTrip = new TripRound(owner);
const after = readSave();
assert.deepEqual({ ...after, log: before.log, mastery: before.mastery }, before);
const oldRound = new LabRound("calendar", owner);
addProfile();
createProfile({ name: "Lino", pet: "drachi", petName: "Leo" });
const sibling = activeProfileId();
assert.notEqual(sibling, owner);
assert.equal(interruptedTrip.answer(interruptedTrip.state.task.id, true).status, "ask");
assert.equal(oldRound.answer(oldRound.state.task.id, true).status, "ask");
assert.equal(readSave().log.length, 0);
const siblingRound = new LabRound("calendar", sibling);
siblingRound.answer(siblingRound.state.task.id, true);
switchProfile(owner);
assert.equal(siblingRound.advance(siblingRound.state.task.id).status, "right");
assert.deepEqual(readSave(), after);
assert.equal(readProfileSave(sibling)?.log.length, 1);
console.log(`${Object.keys(LAB_TOPICS).length} Labor-Themen, fünf Aufgaben, Erstversuche, Profile, Lernbericht und Pfadfortschritt geprüft.`);
