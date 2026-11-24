import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { estimateDescription, lineEstimate, linePosition, nearestAnchors, pointOnLine } from "../src/game/lineEstimate";
import { LineEstimate } from "../src/lesson/LineEstimate";

for(const [low,high] of [[0,20],[0,100],[15,35],[20,60],[35,95]]) {
  const mid=(low+high)/2;
  assert.equal(pointOnLine(-0.1,low,high),low);
  assert.equal(pointOnLine(1.1,low,high),high);
  assert.equal(pointOnLine(0.5,low,high),mid);
  for(let target=low;target<=high;target++) {
    assert.equal(pointOnLine(linePosition(target,low,high),low,high),target);
    const q1=(low+mid)/2,q3=(mid+high)/2;
    const expected=target<q1?[0]:target===q1?[0,1]:target<q3?[1]:target===q3?[1,2]:[2];
    assert.deepEqual(nearestAnchors({low,high,target}),expected);
  }
  const halfStep=0.5/(high-low);
  assert.equal(pointOnLine(halfStep*0.99,low,high),low);
  assert.equal(pointOnLine(halfStep*1.01,low,high),low+1);
}
assert.match(estimateDescription(4,5),/1 Zahlenschritt zu weit links/);
assert.match(estimateDescription(19,5),/14 Zahlenschritte zu weit rechts/);
assert.match(estimateDescription(6,6),/genau/);
for(const level of [1,2,3,4,5] as const) {
  const task={...lineEstimate(level),id:"line",skillId:"zahlenstrahl",level};
  if(level===1)assert.deepEqual([task.low,task.high],[0,20]);
  if(level===2)assert.deepEqual([task.low,task.high],[0,100]);
  if(level>2)assert.ok(task.low>0 && task.high<=100);
  assert.ok(task.low<task.target && task.target<task.high);
  const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(LineEstimate,{task,status,onAnswer(){}}));
  const ask=render("ask");
  assert.ok(ask.includes('role="slider"') && ask.includes('tabindex="0"') && ask.includes("Schätzung festhalten"));
  assert.ok(!ask.includes("Gesuchte Stelle") && !ask.includes("Welcher Anker"));
  assert.ok(render("reveal").includes(task.solution));
}
