import assert from "node:assert/strict";
import { mock } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parcelLimitHint, parcelMass, parcelWeights, weighingHint } from "../src/game/parcelMass";
import { ParcelMass } from "../src/lesson/ParcelMass";
import { Scale } from "../src/lesson/Balance";

for(const level of [1,2,3,4,5] as const) {
  const seen=new Set<string>();
  for(const seed of [0,0.5,0.999]) {
    const rng=mock.method(Math,"random",()=>seed);
    let sample;
    try{sample=parcelMass(level);}finally{rng.mock.restore();}
    const task={...sample,level,skillId:"paeckchenWiegen",id:"weigh"};
    const weights=parcelWeights(level), unit=weights[0];
    assert.equal(unit,level===1?100:50);
    assert.equal(task.mass%unit,0);
    const pile=Array<number>(task.mass/unit).fill(unit);
    assert.equal(weighingHint(task,pile,String(task.mass)),null);
    assert.ok(weighingHint(task,pile,""));
    assert.ok(weighingHint(task,pile.slice(1),String(task.mass)));
    assert.ok(weighingHint(task,[...pile,unit],String(task.mass)));
    const total=task.mass+task.other, answer=total<1000?"under":total===1000?"exact":"over";
    assert.ok(task.other>=100 && task.other<=1000);
    seen.add(answer);
    assert.equal(parcelLimitHint(task,String(total),answer),null);
    assert.ok(parcelLimitHint(task,String(total+50),answer));
    assert.ok(parcelLimitHint(task,String(total),answer==="exact"?"under":"exact"));
  }
  assert.deepEqual(seen,new Set(["under","exact","over"]));
}
const target={...parcelMass(2),mass:350,id:"scale",skillId:"paeckchenWiegen",level:2 as const};
assert.equal(weighingHint(target,[200,100,50],"350"),null);
assert.equal(weighingHint(target,[100,100,100,50],"350"),null);
for(const n of [0,350,400]) {
  const html=renderToStaticMarkup(createElement(Scale,{left:350,right:n,labels:["Päckchen","Gewichte"]}));
  assert.ok(!html.includes("350") && html.includes(n===0?"linke Seite":n===350?"gleich schwer":"rechte Seite"));
}
const before=renderToStaticMarkup(createElement(ParcelMass,{task:target,status:"ask",onAnswer(){}}));
assert.ok(!before.includes("350") && !before.includes("Versandtasche"));
const solved=renderToStaticMarkup(createElement(ParcelMass,{task:target,status:"reveal",onAnswer(){}}));
assert.ok(solved.includes("350") && solved.includes("1000 g = 1 kg"));
