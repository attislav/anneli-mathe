import assert from "node:assert/strict";
import { floorComplete, tileFloor, tileFootprint, tileIssue, tileOffsets } from "../src/game/tileFloor";
import type { Level, TilePlacement } from "../src/game/types";

const square = { width: 2, height: 2, example: [[0, 1], [2, 3]] };
const top = { piece: 0, anchor: 0, turns: 0 }, bottom = { piece: 1, anchor: 2, turns: 0 };
assert.deepEqual(tileOffsets(3, 4), tileOffsets(3, 0));
assert.equal(new Set([0, 1, 2, 3].map(turn => JSON.stringify(tileOffsets(3, turn)))).size, 4);
assert.match(tileIssue(square, [], { ...top, anchor: 1 }) ?? "", /ragt/);
assert.match(tileIssue(square, [], { ...top, anchor: 0, turns: 2 }) ?? "", /ragt/);
assert.match(tileIssue(square, [top], { ...bottom, anchor: 0 }) ?? "", /überlappen/);
assert.match(tileIssue(square, [top], top) ?? "", /schon/);
assert.ok(floorComplete(square, [top, bottom]));
const alternative = [{ ...top, turns: 1 }, { ...bottom, turns: 1, anchor: 1 }];
assert.ok(floorComplete(square, alternative));
const undone = alternative.slice(0, -1);
assert.equal(floorComplete(square, undone), false);
assert.equal(tileIssue(square, undone, alternative[1]), undefined);
assert.ok(floorComplete(square, [...undone, alternative[1]]));

for (const level of [1, 2, 3, 4, 5] as Level[]) {
  const outlines = new Set<string>();
  for (let i = 0; i < 150; i++) {
    const task = tileFloor(level);
    const target = task.example.flat();
    assert.ok(target.length >= 4 && target.length <= 9 && new Set(target).size === target.length);
    assert.ok(task.example.length >= 2 && task.example.length <= 4);
    outlines.add(JSON.stringify([task.width, [...target].sort((a, b) => a - b)]));
    const placements: TilePlacement[] = [];
    for (const [piece, group] of task.example.entries()) {
      assert.ok(group.length === 2 || group.length === 3);
      const candidates = group.flatMap(anchor => [0, 1, 2, 3].map(turns => ({ piece, anchor, turns })));
      const match = candidates.find(p => tileFootprint(task, p).every(cell => group.includes(cell)));
      assert.ok(match, "Der Beispielstein muss sich tatsächlich legen lassen.");
      placements.push(match);
    }
    assert.ok(floorComplete(task, placements));
  }
  assert.ok(outlines.size >= 3);
}
console.log("Fliesenatelier: Drehungen, Rand, Überlagerung, alternative Legung und lösbare Vorlagen auf fünf Stufen geprüft.");
