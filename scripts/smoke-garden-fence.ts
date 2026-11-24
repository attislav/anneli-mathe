import assert from "node:assert/strict";
import { mock } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fenceAnswer, fenceEdges, fenceHint, gardenEdge, gardenFence } from "../src/game/gardenFence";
import { GardenFence } from "../src/lesson/GardenFence";

// Independent geometric oracle: the cells on opposite sides of each line segment differ.
function expected(shape:string[]) {
  const edges:string[]=[];
  for(let y=0;y<=shape.length;y++) for(let x=0;x<=shape[0].length;x++) {
    if ((shape[y]?.[x]==="#") !== (shape[y-1]?.[x]==="#")) edges.push("h:"+y+":"+x);
    if ((shape[y]?.[x]==="#") !== (shape[y]?.[x-1]==="#")) edges.push("v:"+y+":"+x);
  }
  return edges.sort();
}
const ell=["##","#."], outline=expected(ell);
assert.equal(outline.length,8);
assert.ok(outline.includes("v:1:1") && outline.includes("h:1:1"));
assert.equal(gardenEdge(0,0,"rechts"),gardenEdge(0,1,"links"));
assert.equal(fenceHint(ell,[...outline].reverse()),null);
assert.ok(fenceHint(ell,[...outline,"h:1:0"]));
assert.ok(fenceHint(ell,outline.slice(1)));
const relations=new Set<string>();
for(const sample of [0,0.21,0.41,0.61,0.91]) for(const flip of [0,0.99]) {
  let draws=0;
  const rng=mock.method(Math,"random",()=>draws++===0?sample:flip);
  let data;
  try { data=gardenFence(5); } finally { rng.mock.restore(); }
  const task={...data,id:"fence",level:5 as const,skillId:"zaunlaengen"};
  const size=(shape:string[])=>shape.join("").split("#").length-1;
  assert.equal(size(task.first),size(task.second));
  for(const bed of [task.first,task.second]) assert.deepEqual(fenceEdges(bed).sort(),expected(bed));
  const a=expected(task.first).length,b=expected(task.second).length;
  const relation=b>a?"länger":b<a?"kürzer":"gleich lang";
  relations.add(relation);
  assert.equal(fenceAnswer(task,String(a),String(b),relation),null);
  assert.ok(fenceAnswer(task,String(a+1),String(b),relation));
  assert.ok(fenceAnswer(task,String(a),String(b),""));
  const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(GardenFence,{task,status,onAnswer(){}}));
  assert.ok(render("ask").includes("Seiten von Feld A1"));
  assert.ok(!render("ask").includes(task.solution));
  assert.ok(render("reveal").includes(task.solution));
}
assert.equal(relations.size,3);
