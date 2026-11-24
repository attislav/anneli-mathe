import assert from "node:assert/strict";
import { mock } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { bagChance, bagHint, drawBag, drawSeries, nextDrawHint, type BagMark } from "../src/game/drawBag";
import { DrawBag } from "../src/lesson/DrawBag";
import type { BagTask } from "../src/game/types";

const bag:BagMark[]=["Kreis","Stern","Stern"];
const base:BagTask={...drawBag(2),id:"bag",skillId:"zufallBeutel",level:2,bag,next:["Kreis"]};
for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++) {
  const picks=[a,b,c];let i=0;
  const rng=mock.method(Math,"random",()=>(picks[i++]+0.25)/3);
  let series:BagMark[];
  try{series=drawSeries(bag);}finally{rng.mock.restore();}
  assert.deepEqual(series,picks.map(index=>bag[index]));
  assert.equal(i,3);
  const n=picks.filter(index=>index===0).length, task={...base,series};
  assert.equal(nextDrawHint(task,String(n),"some","some"),null);
  assert.ok(nextDrawHint(task,String((n+1)%4),"some","some"));
  assert.ok(nextDrawHint(task,String(n),n===0?"none":"all","some"));
  assert.ok(nextDrawHint(task,String(n),"some","all"));
}
assert.deepEqual(bag,["Kreis","Stern","Stern"]);
for(const level of [1,2,3,4,5] as const) {
  const initial=new Set<string>(), transfer=new Set<string>();
  let seed=4242;
  const rng=mock.method(Math,"random",()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;});
  try {
    for(let i=0;i<100;i++) {
      const t=drawBag(level);
      for(const [event,classes] of [[t.first,initial],[t.next,transfer]] as const) {
        const n=t.bag.filter(m=>event.includes(m)).length, expected=n===0?"none":n===t.bag.length?"all":"some";
        assert.equal(bagChance(t.bag,event),expected);
        assert.equal(bagHint(t.bag,event,expected,expected),null);classes.add(expected);
      }
      assert.notDeepEqual(t.first,t.next);
    }
  } finally {rng.mock.restore();}
  assert.deepEqual(initial,new Set(["all","some","none"]));
  assert.deepEqual(transfer,initial);
}
const html=renderToStaticMarkup(createElement(DrawBag,{task:base,status:"ask",onAnswer(){}}));
assert.ok(html.includes("blind ein Plättchen") && html.includes("Kreis</small>") && html.includes("Stern</small>"));
assert.ok(!html.includes("Zug 1<") && !html.includes("Die drei gezogenen Zeichen"));
