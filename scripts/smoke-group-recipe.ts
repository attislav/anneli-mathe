import assert from "node:assert/strict";
import { mock } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { groupRecipe, recipeHint } from "../src/game/groupRecipe";
import { GroupRecipe } from "../src/lesson/GroupRecipe";

const titles = new Set<string>();
const sizes = new Set<number>();
for (const level of [1, 3, 5] as const) {
  for (const sample of [0, 0.4, 0.9]) {
    const rng = mock.method(Math, "random", () => sample);
    let data;
    try { data = groupRecipe(level); } finally { rng.mock.restore(); }
    const task = { ...data, level, id: "recipe", skillId: "gruppenrezepte" };
    titles.add(task.title);
    sizes.add(task.children);
    if (level === 1) assert.equal(task.children, 4);
    const groups = task.children / 2;
    const needs = task.ingredients.map(item => item.base * groups);
    const gaps = task.ingredients.map((item,i) => needs[i] - item.stock);
    assert.deepEqual(gaps.map(Math.sign).sort(), [-1,0,1]);
    const needsText = needs.map(String), missing = gaps.map(n => String(Math.max(0,n)));
    assert.equal(recipeHint(task,groups,needsText),null);
    assert.equal(recipeHint(task,groups,needsText,missing),null);
    assert.ok(recipeHint(task,groups-1,needsText,missing));
    assert.ok(recipeHint(task,groups,needsText,missing.slice(1).concat(missing[0])));
    for (const [i,item] of task.ingredients.entries()) {
      const wrongNeeds = [...needsText], emptyMissing = [...missing];
      wrongNeeds[i] = String(needs[i] + 1);
      emptyMissing[i] = "";
      assert.ok(recipeHint(task,groups,wrongNeeds,missing)?.includes(item.name));
      assert.ok(recipeHint(task,groups,needsText,emptyMissing)?.includes(item.name));
      assert.ok(task.solution.includes(item.name));
    }
    const render = (status:"ask"|"reveal"|"right") => renderToStaticMarkup(createElement(GroupRecipe,{task,status,onAnswer(){}}));
    assert.ok(!render("ask").includes("Fehlmenge"));
    assert.equal(render("right"),render("reveal"));
    for (const [i,item] of task.ingredients.entries()) {
      assert.ok(render("reveal").includes("Fehlmenge "+missing[i]+" "+item.unit));
    }
  }
}
assert.equal(titles.size,3);
assert.deepEqual([...sizes].sort(),[4,6]);
