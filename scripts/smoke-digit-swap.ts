import assert from "node:assert/strict";
import { mock } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { digitSwap, exampleCards, swapChangeHint, swapLayoutHint, swapValues } from "../src/game/digitSwap";
import { DigitSwap } from "../src/lesson/DigitSwap";

const fixed={min:30,max:68,digits:[3,6,3,0,9]};
assert.deepEqual(swapValues(fixed,[0,1]),{start:36,end:63,tens:30,ones:-3,relation:"größer"});
assert.ok(swapLayoutHint(fixed,[0,0]));
assert.equal(swapLayoutHint(fixed,[0,2]),null);
assert.ok(swapLayoutHint(fixed,[0,3]) && swapLayoutHint(fixed,[3,0]));
assert.equal(swapLayoutHint(fixed,[0,4]),null); // 39 is a legal start; 93 need not be in the starting range.
assert.ok(swapLayoutHint(fixed,[1,4]));
for(const level of [1,2,3,4,5] as const) for(const seed of [0,0.5,0.99]) {
  const rng=mock.method(Math,"random",()=>seed);
  let data:ReturnType<typeof digitSwap>;
  try{data=digitSwap(level);}finally{rng.mock.restore();}
  const relations=new Set<string>(), numbers=new Set<number>();
  for(const [i,a] of data.digits.entries()) for(const [j,b] of data.digits.entries()) {
    const n=a*10+b, m=b*10+a, legal=i!==j && n>=data.min && n<=data.max && n>=10 && m>=10;
    assert.equal(swapLayoutHint(data,[i,j])===null,legal);
    if(!legal)continue;
    const values=swapValues(data,[i,j]), relation=m>n?"größer":m<n?"kleiner":"gleich groß";
    assert.equal(values.start,n);assert.equal(values.end,m);assert.equal(values.relation,relation);
    assert.equal(values.tens+values.ones,m-n);
    assert.equal(swapChangeHint(data,[i,j],String(10*b-10*a),String(a-b)),null);
    assert.ok(swapChangeHint(data,[i,j],String(10*b-10*a),String(a-b+1)));
    relations.add(relation);numbers.add(n);
  }
  assert.deepEqual(relations,new Set(["größer","kleiner","gleich groß"]));
  assert.ok(numbers.size>=3);
  assert.equal(swapLayoutHint(data,exampleCards(data)),null);
  const task={...data,id:"swap",skillId:"zehnerEiner",level};
  const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(DigitSwap,{task,status,onAnswer(){}}));
  assert.ok(!render("ask").includes("Nach dem Platztausch"));
  assert.ok(render("reveal").includes("Eine mögliche Startzahl"));
}
