import assert from "node:assert/strict";
import { mock } from "node:test";
import { firstIncorrectGap, hundredWindow, windowHint, windowValue } from "../src/game/hundredWindow";
import { busJourney, busTable, checkBus } from "../src/game/busTable";
import { classSurvey } from "../src/game/skillsDetektiv";
import { checkShopList, shopList, shopSolution } from "../src/game/shopList";
import { checkMarking, fitsClue, numberDetective } from "../src/game/numberDetective";
import { checkPortions, checkShare, chocolate, examplePortions } from "../src/game/chocolate";
import { checkPlan, examplePlan, followValue, morningPlan, planSlots } from "../src/game/morningPlan";
import { allowedPair, checkClaim, verdict, type Pair } from "../src/game/parityClaim";
import { areaSamples, sampleAction, SampleVisit, samples, sampleFeedback } from "../src/game/labSamples";
import { LAB_GROUPS } from "../src/game/schoolSelection";
import { addHeading, checkWays, wayCards, wayTable } from "../src/game/wayTable";
import { calculation, checkWay, freshWay, twoWays } from "../src/game/twoWays";
import { checkSite, directNeighbor, landmarks, mapCoordinate, siteMap, siteMatches } from "../src/game/siteMap";
import { SiteMap } from "../src/lesson/SiteMap";
import { freshWall, wallMove, wallProblem } from "../src/game/partnerWall";
import { addMeasure, checkTransfer, juice, litres, poured, vesselSize } from "../src/game/juice";
import { JuiceVessels } from "../src/lesson/Juice";
import { buildHint, checkTowerAnswer, leftInBox, moveCube, silhouette, targetTower, tower, towerTotal } from "../src/game/tower";
import { PartnerWallView } from "../src/screens/PartnerWall";
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
const formats = { tower: "tower", juice: "juice", map: "site-map", methods: "two-ways", ways: "way-table", claims: "parity-claim", morning: "morning-plan", chocolate: "chocolate-share", detective: "number-detective", shops: "shop-list", questions: "write-question", split: "split-array", rope: "estimate-rope", viewpoint: "table-view", packets: "sum-packet", tiles: "tile-floor", survey: "class-survey", bus: "bus-table", window: "hundred-window", machine: "machine", cubes: "cube-model", shopping: "baskets", calendar: "calendar", pairs: "number-pairs", route: "grid-route" };
assert.equal(LAB_COUNT, 5);

const exampleTower = [4,1,2,3];
assert.deepEqual(silhouette(exampleTower, "south"), [4,3]);
assert.deepEqual(silhouette(exampleTower, "north"), [3,4]);
assert.deepEqual(silhouette(exampleTower, "west"), [4,3]);
assert.deepEqual(silhouette(exampleTower, "east"), [3,4]);
assert.deepEqual(silhouette([4,3,2,1], "south"), [4,3]);
assert.deepEqual(silhouette([4,3,2,1], "west"), [4,2]);
const emptyBox = { initial: [0,4,1,2], reserve: 0, changes: [] };
assert.equal(moveCube(emptyBox, emptyBox.initial, 0, -1), emptyBox.initial);
assert.equal(moveCube(emptyBox, emptyBox.initial, 2, 1), emptyBox.initial);
const removed = moveCube(emptyBox, emptyBox.initial, 2, -1);
assert.equal(leftInBox(emptyBox, removed), 1);
assert.equal(moveCube(emptyBox, removed, 1, 1), removed);
assert.deepEqual(moveCube(emptyBox, removed, 2, 1), emptyBox.initial);
for (const level of [1,2,3,4,5] as Level[]) {
  for (let i = 0; i < 150; i++) {
    const task = tower(level), built = targetTower(task);
    const viaMoves = task.changes.reduce((h, c) => moveCube(task, h, c.cell, c.delta), task.initial);
    assert.deepEqual(viaMoves, built);
    assert.ok(buildHint(task, task.initial));
    assert.equal(buildHint(task, built), null);
    assert.ok(built.every(h => h >= 0 && h <= 4));
    const view = silhouette(built, task.side);
    assert.ok(towerTotal(built) > towerTotal(view));
    assert.equal(checkTowerAnswer(built, task.side, view, String(towerTotal(built))), null);
    assert.ok(checkTowerAnswer(built, task.side, view, String(towerTotal(view))));
    assert.ok(checkTowerAnswer(built, task.side, [view[0]+1,view[1]], String(towerTotal(built))));
  }
}

const { narrow, wide } = vesselSize;
assert.equal(narrow.stepHeight * narrow.width, wide.stepHeight * wide.width);
assert.ok(narrow.stepHeight > wide.stepHeight);
for (const level of [1,2,3,4,5] as Level[]) {
  for (const fraction of [0,0.3,0.6,0.999]) {
    const random = mock.method(Math, "random", () => fraction);
    const task = juice(level);
    random.mock.restore();
    const singleMeasures = Array<number>(task.target).fill(1);
    const mixedMeasures = [2, ...singleMeasures.slice(2)];
    for (const measures of [singleMeasures,mixedMeasures]) {
      const steps = measures.reduce<number[]>((s, n) => addMeasure(s, n as 1 | 2, task.capacity), []);
      assert.equal(poured(steps), task.target);
      assert.equal(poured(steps.slice(0,-1)), task.target - measures.at(-1)!);
    }
    for (const source of ["narrow","wide"] as const) {
      const correct = source === "narrow" ? "before" : "after";
      assert.equal(checkTransfer({ ...task, source }, task.target, correct), null);
      assert.ok(checkTransfer({ ...task, source }, task.target + 1, correct));
      assert.ok(checkTransfer({ ...task, source }, task.target, "same"));
      const markup = renderToStaticMarkup(createElement(JuiceVessels, { capacity: task.capacity, first: source, amounts: [0,task.target] }));
      assert.ok(markup.includes(litres(task.target)));
    }
  }
}
const full = [2,2], almost = [2,1];
assert.equal(addMeasure(full, 1, 4), full);
assert.equal(addMeasure(almost, 2, 4), almost);
assert.deepEqual(addMeasure(almost, 1, 4), [2,1,1]);
assert.equal(litres(3), "1½ Liter");

const wallsBefore = new Map(values);
const wallWriteSpy = mock.method(storage, "setItem");
const draft = ["11", "13", "17", "24", "30", "54"];
let authored = freshWall();
draft.forEach((value, at) => { authored = wallMove(authored, { type: "stone", at, value }); });
const badDraft = wallMove(authored, { type: "stone", at: 4, value: "31" });
assert.match(wallMove(badDraft, { type: "check" }).message, /Mitte rechts/);
assert.equal(wallMove(badDraft, { type: "pass" }), badDraft);
assert.equal(wallProblem(["1","1","1","2","2","4"]), null);
assert.equal(wallProblem(["20","20","20","40","40","80"]), null);
for (const invalid of ["0","21","","-1","1.5"]) assert.ok(wallProblem([invalid, ...draft.slice(1)]));
assert.ok(wallProblem([...draft.slice(0,5), "55"]));
authored = wallMove(authored, { type: "check" });
assert.equal(wallMove(authored, { type: "edit" }).phase, "write");
const wallHtml = (state: ReturnType<typeof freshWall>) => renderToStaticMarkup(createElement(PartnerWallView, { state, act() {}, onBack() {} }));
for (let at = 0; at < 6; at++) {
  const chosen = wallMove(authored, { type: "hide", at });
  const covered = wallMove(chosen, { type: "pass" });
  const neutral = wallHtml(covered).replace(/<[^>]+>/g, "");
  assert.ok(!/\d/.test(neutral));
  const puzzle = wallMove(covered, { type: "open" });
  const markup = wallHtml(puzzle);
  assert.ok(!new RegExp(`>\\s*${draft[at]}\\s*<|aria-label="[^"]*\\b${draft[at]}\\b`).test(markup));
  for (const other of draft.filter(n => n !== draft[at])) assert.ok(markup.includes(">" + other + "<"));
  const retry = wallMove(wallMove(puzzle, { type: "guess", value: "99" }), { type: "solve" });
  assert.ok(retry.message && retry.phase === "solve");
  const solved = wallMove(wallMove(retry, { type: "guess", value: draft[at] }), { type: "solve" });
  assert.equal(solved.phase, "done");
  assert.deepEqual(wallMove(solved, { type: "swap" }), freshWall());
}
assert.equal(wallWriteSpy.mock.callCount(), 0);
wallWriteSpy.mock.restore();
assert.deepEqual(values, wallsBefore);
assert.equal(activeProfileId(), owner);

assert.equal(mapCoordinate(4, 0), "A1");
assert.equal(mapCoordinate(4, 15), "D4");
assert.ok(!directNeighbor(4, 0, 5, null) && !directNeighbor(4, 3, 4, null));
assert.ok(!directNeighbor(4, 6, 10, [10, 6]) && !directNeighbor(4, 10, 6, [10, 6]));
assert.ok(directNeighbor(4, 14, 15, null));
for (const level of [1,2,3,4,5] as Level[]) {
  for (let i = 0; i < 100; i++) {
    const map = siteMap(level);
    const matches = siteMatches(map);
    assert.equal(matches.length, 1);
    const cell = matches[0];
    assert.equal(map.cells[cell], map.target);
    assert.ok(checkSite(map, map.mode === "place" ? map.target : mapCoordinate(map.size, cell)));
    assert.ok(!checkSite(map, "X0"));
    if (map.mode === "neighbor") {
      const anchor = map.cells.indexOf(map.anchor);
      assert.equal(map.cells.filter(p => p === map.target).length, 2);
      assert.equal(Math.abs(Math.floor(cell / map.size) - Math.floor(anchor / map.size)) + Math.abs(cell % map.size - anchor % map.size), 1);
      if (map.closed) {
        const blocked = map.closed.find(n => n !== anchor)!;
        assert.equal(map.cells[blocked], map.target);
        assert.ok(!checkSite(map, mapCoordinate(map.size, blocked)));
      }
    }
    if (i === 0) {
      const task = { ...map, id: "check", level, skillId: "lageplan" };
      const markup = (status: "ask" | "reveal") => renderToStaticMarkup(createElement(SiteMap, { task, status, onAnswer() {} }));
      assert.ok(!markup("ask").includes(task.solution));
      assert.ok(markup("reveal").includes(task.solution));
      assert.ok(task.solution.includes(landmarks[task.target].symbol));
    }
  }
}

const plusWay = { a: 49, b: 26, minus: false, roundFirst: true };
const minusWay = { a: 62, b: 29, minus: true, roundFirst: false };
assert.deepEqual(calculation(plusWay, "steps"), { term: "49 + 20", middle: 69, result: 75, sign: "+", amount: 6 });
assert.deepEqual(calculation(plusWay, "round"), { term: "50 + 26", middle: 76, result: 75, sign: "−", amount: 1 });
assert.deepEqual(calculation(minusWay, "round"), { term: "62 − 30", middle: 32, result: 33, sign: "+", amount: 1 });
for (const level of [1,2,3,4,5] as Level[]) {
  for (let i = 0; i < 150; i++) {
    const problem = twoWays(level);
    const result = problem.a + (problem.minus ? -problem.b : problem.b);
    assert.notEqual(calculation(problem, "round").term, calculation(problem, "steps").term);
    for (const method of ["steps", "round"] as const) {
      const path = calculation(problem, method);
      assert.ok(path.middle >= 0 && path.middle <= 100 && result >= 0 && result <= 100);
      assert.ok(path.amount > 0 && path.amount < 10);
      assert.equal(path.middle + path.amount * (path.sign === "+" ? 1 : -1), result);
      const correct = { method, middle: String(path.middle), sign: path.sign, amount: String(path.amount), result: String(result) };
      assert.equal(checkWay(problem, correct), null);
      assert.ok(checkWay(problem, { ...correct, middle: String(path.middle + 1) }));
      assert.ok(checkWay(problem, { ...correct, sign: path.sign === "+" ? "−" : "+" }));
      assert.ok(checkWay(problem, { ...correct, amount: String(path.amount + 1) }));
      assert.deepEqual(freshWay(method), { method, middle: "", sign: "", amount: "", result: "" });
    }
  }
}

for (const level of [1, 2, 3, 4, 5] as Level[]) {
  const task = wayTable(level), keys = wayCards(task);
  assert.deepEqual(new Set(task.cards), new Set(keys));
  const count = String(keys.length - Number(task.blocked !== null));
  const entries = Object.fromEntries(keys.toReversed().map(key => [key, key === task.blocked ? "closed" : key]));
  assert.equal(checkWays(task, entries, count, "pairs"), null);
  assert.ok(checkWays(task, entries, count, "parts"));
  assert.ok(checkWays(task, entries, "10", "pairs"));
  const [a, b] = keys.filter(k => k !== task.blocked);
  assert.match(checkWays(task, { ...entries, [a]: b }, count, "pairs") ?? "", /doppelt/);
  assert.match(checkWays(task, { ...entries, [a]: "" }, count, "pairs") ?? "", /fehlt/);
  assert.match(checkWays(task, { ...entries, [a]: b, [b]: a }, count, "pairs") ?? "", /Überschriften/);
  if (task.blocked) assert.match(checkWays(task, { ...entries, [task.blocked]: task.blocked }, count, "pairs") ?? "", /gesperrt/);
}
for (const a of [0,1,2]) for (const b of [0,1,2].filter(n => n !== a)) {
  const first = addHeading([], a, 3);
  assert.deepEqual(addHeading(first, a, 3), first);
  const order = addHeading(first, b, 3);
  assert.deepEqual(order.slice(0, 2), [a,b]);
  assert.equal(new Set(order).size, 3);
}

const sampleVisit = new SampleVisit();
const sampleWrites = mock.method(storage, "setItem");
for (const group of LAB_GROUPS) {
  const pool = samples.filter(s => (group.topics as readonly LabTopic[]).includes(s.topic));
  assert.ok(pool.length >= 2 && pool.length <= 3);
  assert.equal(new Set(pool.map(s => s.topic)).size, pool.length);
  assert.deepEqual(pool, areaSamples(group.title));
  for (const item of pool) {
    const choice = new SampleVisit();
    assert.ok(sampleAction[item.topic]);
    assert.equal(choice.choose(group.title, item), item);
    assert.notEqual(choice.next(group.title), item);
  }
  const seen = pool.map(() => sampleVisit.next(group.title));
  assert.deepEqual(new Set(seen), new Set(pool));
  assert.notEqual(sampleVisit.next(group.title), seen.at(-1));
  for (const s of seen) {
    assert.equal(s.options.filter(o => o === s.answer).length, 1);
    assert.match(sampleFeedback(s, s.answer), /^Richtig!/);
    assert.ok(sampleFeedback(s, s.options.find(o => o !== s.answer)!).includes(s.answer));
    assert.ok(sampleFeedback(s, null).includes(s.explanation));
    const next = new LabRound(s.topic, owner);
    assert.equal(next.state.task.format, formats[s.topic]);
    assert.equal(next.state.task.skillId, LAB_TOPICS[s.topic].skillId);
    assert.notEqual(next.state.task.question, s.question);
    assert.equal(next.count, 5);
    assert.equal(next.state.number, 1);
  }
}
assert.equal(sampleWrites.mock.callCount(), 0);
sampleWrites.mock.restore();
assert.deepEqual(readSave(), before);

for (const rule of ["even", "odd", "mixed", "any", "one-even", "one-odd"] as const) {
  for (const evenSum of [false, true]) for (const limit of [4, 6, 10]) {
    const claim = { rule, limit, evenSum };
    const holds: Pair[] = [], fails: Pair[] = [];
    for (let a = 1; a <= limit; a++) for (let b = 1; b <= limit; b++) {
      const evenA = a % 2 === 0, evenB = b % 2 === 0;
      const expected = { even: evenA && evenB, odd: !evenA && !evenB, mixed: evenA !== evenB, any: true,
        "one-even": evenA || evenB, "one-odd": !evenA || !evenB }[rule];
      assert.equal(allowedPair(claim, [a, b]), expected);
      if (expected) ((a + b) % 2 === Number(!evenSum) ? holds : fails).push([a, b]);
      else assert.ok(checkClaim(claim, verdict(claim), [a, b], [a, b], rule));
    }
    const result = !holds.length ? "nie" : !fails.length ? "immer" : "manchmal";
    assert.equal(verdict(claim), result);
    if (result === "manchmal") {
      for (const yes of holds) for (const no of fails) {
        assert.equal(checkClaim(claim, result, yes, no, ""), null);
        assert.equal(checkClaim(claim, result, no, yes, ""), null);
      }
      assert.ok(checkClaim(claim, result, holds[0], holds[0], ""));
    } else for (const pair of [...holds, ...fails]) {
      assert.equal(checkClaim(claim, result, pair, [null, null], rule), null);
      assert.ok(checkClaim(claim, result, pair, [null, null], ""));
    }
    assert.ok(checkClaim(claim, result, [null, null], [null, null], ""));
    assert.equal(allowedPair(claim, [limit + 1, 2]), false);
  }
}

const morning = { start: 540, duration: 60, step: 15, fixed: 555, activities: [{ name: "Malen", duration: 15 }, { name: "Zeigen", duration: 15 }] };
assert.equal(checkPlan(morning, [540, 570]), null);
assert.equal(checkPlan(morning, [540, 585]), null);
assert.equal(followValue({ ...morning, follow: "end", target: 1 }, [540, 585]), 600);
assert.equal(followValue({ ...morning, follow: "end", target: 1 }, [540, 570]), 585);
assert.equal(followValue({ ...morning, follow: "pause", target: 1 }, [540, 585]), 15);
assert.equal(followValue({ ...morning, follow: "pause", target: 1 }, [540, 570]), 0);
for (const bad of [[540, 555], [540, 540], [580, 585], [540, 600], [525, 570], [585, 570], [540, null]]) assert.ok(checkPlan(morning, bad));
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  for (const fraction of [0, 0.5, 0.9999]) {
    const random = mock.method(Math, "random", () => fraction);
    const template = morningPlan(level);
    random.mock.restore();
    for (const fixed of planSlots(template)) {
      const plan = { ...template, fixed };
      const first = examplePlan(plan);
      assert.equal(checkPlan(plan, first), null);
      const slots = planSlots(plan);
      const alternative = slots.some(a => slots.some(b => (first.length === 2 ? [[]] : slots.map(t => [t])).some(tail => {
        const candidate = [a, b, ...tail];
        return candidate.some((v, i) => v !== first[i]) && checkPlan(plan, candidate) === null;
      })));
      assert.ok(alternative, `Stufe ${level} mit Termin um ${fixed} braucht mehr als einen Plan.`);
    }
  }
}

const fourPortions = { rows: 3, cols: 4, children: 4 as const };
const differentShapes = [0,0,0,1, 2,2,1,1, 2,3,3,3];
assert.equal(checkPortions(fourPortions, differentShapes), null);
const twoPortions = { rows: 2, cols: 3, children: 2 as const };
const disconnected = [0,0,1, 1,1,0];
assert.match(checkPortions(twoPortions, disconnected) ?? "", /Seiten/);
assert.match(checkPortions(twoPortions, [0,0,1, 1,1,-1]) ?? "", /Ordne/);
assert.match(checkPortions(twoPortions, [0,0,1, 1,1,1]) ?? "", /Kind 1 hat zu wenige.*Kind 2 hat zu viele/);
assert.match(checkPortions(twoPortions, [1,1,0, 0,0,0]) ?? "", /Kind 2 hat zu wenige.*Kind 1 hat zu viele/);
assert.equal(checkPortions(twoPortions, [0,0,1, 0,1,1]), null);
assert.equal(checkShare(fourPortions, "3", "ein Viertel"), null);
assert.ok(checkShare(fourPortions, "4", "ein Viertel"));
assert.ok(checkShare(fourPortions, "3", "eine Hälfte"));
assert.equal(checkShare(twoPortions, "3", "eine Hälfte"), null);
for (const level of [1, 2, 3, 4, 5] as Level[]) {
  for (let i = 0; i < 25; i++) {
    const task = chocolate(level);
    assert.equal(checkPortions(task, examplePortions(task)), null);
  }
}

for (const fraction of [0, 0.13, 0.26, 0.39, 0.52, 0.65, 0.78, 0.99999]) {
  const random = mock.method(Math, "random", () => fraction);
  try {
    for (const level of [1, 2, 3, 4, 5] as Level[]) {
      const { numbers, clues, excluded } = numberDetective(level);
      const answers = numbers.filter(n => clues.every(c => fitsClue(n, c)));
      assert.equal(answers.length, 1);
      if (fraction === 0) assert.deepEqual(answers, [1]);
      if (fraction > 0.99) assert.deepEqual(answers, [100]);
      assert.equal(numbers.length, level <= 2 ? 8 : 12);
      numbers.forEach((n, i) => assert.equal(n, numbers[0] + Math.floor(i / 4) * 10 + i % 4));
      assert.equal(clues.filter(c => !fitsClue(excluded, c)).length, level >= 4 ? 2 : 1);
      for (const clue of clues) {
        const others = clues.filter(c => c !== clue);
        assert.ok(numbers.filter(n => others.every(c => fitsClue(n, c))).length >= 2);
        const matching = numbers.filter(n => fitsClue(n, clue));
        assert.ok(matching.length >= 2);
        assert.equal(checkMarking(numbers, clue, matching.slice(1)), false);
        assert.equal(checkMarking(numbers, clue, numbers), false);
        assert.ok(checkMarking(numbers, clue, matching.toReversed()));
        for (const order of [others, others.toReversed()]) {
          let remaining = matching;
          for (const c of order) remaining = remaining.filter(n => fitsClue(n, c));
          assert.deepEqual(remaining, answers);
        }
      }
    }
  } finally { random.mock.restore(); }
}

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
