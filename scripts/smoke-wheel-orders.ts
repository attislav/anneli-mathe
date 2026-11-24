import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { collectOrder, wheelOrders, wheelProof, wheelRows, type WheelOrder } from "../src/game/wheelOrders";
import { WheelOrders } from "../src/lesson/WheelOrders";

for (const wheels of [6,8,9,10,11,12,13,14,15,16,17,18]) {
  const valid: WheelOrder[] = [];
  for(let bikes=0; bikes<=wheels; bikes++) for(let trikes=0; trikes<=wheels; trikes++) {
    if (2*bikes + 3*trikes === wheels) valid.push({bikes,trikes});
  }
  assert.ok(valid.length >= 2);
  const rows = wheelRows(wheels);
  const marks = rows.map(({trikes})=>valid.some(o=>o.trikes===trikes));
  assert.deepEqual(rows.map(r=>r.trikes),Array.from({length:Math.floor(wheels/3)+1},(_,i)=>i));
  let saved: WheelOrder[] = [];
  for (const order of valid) {
    saved = collectOrder(wheels,saved,order).orders;
    assert.equal(collectOrder(wheels,saved,order).orders,saved);
  }
  assert.equal(saved.length,valid.length);
  assert.equal(wheelProof(wheels,saved,marks),null);
  assert.equal(wheelProof(wheels,[...saved].reverse(),marks),null);
  assert.ok(wheelProof(wheels,saved.slice(1),marks));
  for (const row of rows) {
    assert.equal(row.rest,wheels-3*row.trikes);
    const wrong = [...marks]; wrong[row.trikes]=!wrong[row.trikes];
    assert.ok(wheelProof(wheels,saved,wrong));
  }
  for(const order of [{bikes:0,trikes:0},{bikes:wheels,trikes:0},{bikes:-3,trikes:4},{bikes:1.5,trikes:1}]) {
    assert.equal(collectOrder(wheels,saved,order).orders,saved);
  }
}
const task = {...wheelOrders(1),wheels:6,level:1 as const,skillId:"kombinatorik",id:"wheel"};
const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(WheelOrders,{task,status,onAnswer(){}}));
assert.ok(!render("ask").includes("Passt für"));
assert.ok(render("reveal").includes("Passt für 0 Fahrräder."));
assert.ok(render("reveal").includes("Passt für 3 Fahrräder."));
assert.ok(render("reveal").includes("Ein Rad bleibt übrig."));
