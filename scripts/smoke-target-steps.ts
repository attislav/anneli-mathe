import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { equations, intermediate, possibleRoutes, solves, targetSteps, type Route } from "../src/game/targetSteps";
import { TargetRoute, TargetSteps } from "../src/lesson/TargetSteps";

const orders=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
for(const level of [1,2,3,4,5] as const){
  // Deterministically select each material. Shuffling has no effect on the
  // independent permutation check below.
  for(const random of [0,.26,.51,.76]){
    const original=Math.random;
    let board:ReturnType<typeof targetSteps>;
    try{Math.random=()=>random;board=targetSteps(level);}finally{Math.random=original;}
    assert.equal(board.limit,[10,20,40,70,100][level-1]);
    assert.ok(Math.max(...board.cards)>=[3,8,13,26,38][level-1]);
    const mids=new Set<number>();
    let accepted=0;
    for(const [first,second,last] of orders)for(const x of [1,-1])for(const y of [1,-1]){
      const middle=board.cards[first]+x*board.cards[second];
      const end=middle+y*board.cards[last];
      const expected=middle>=0 && middle<=board.limit && end===board.target;
      const route:Route={first,second,sign:x===1?"+":"−",lastSign:y===1?"+":"−"};
      assert.equal(solves(board,route),expected);
      if(expected){accepted++;mids.add(middle);}
    }
    assert.equal(possibleRoutes(board).length,accepted);
    assert.ok(mids.size>=2,"A voluntary new route always has a different intermediate number.");
  }
}
const task={...targetSteps(1),id:"a",skillId:"zielzahlWege",level:1 as const,cards:[2,3,2],target:3,limit:10};
const chosen:Route={first:1,second:2,sign:"−",lastSign:"+"};
assert.equal(intermediate(task,{first:0,second:0,sign:"+"}),null);
assert.equal(intermediate(task,{first:0,second:1,sign:"−"}),null);
assert.equal(solves(task,chosen),true);
assert.equal(solves(task,{...chosen,lastSign:"−"}),false);
assert.deepEqual(equations(task,chosen),["3 − 2 = 1","1 + 2 = 3"]);
const shown=renderToStaticMarkup(createElement(TargetRoute,{task,route:chosen,title:"Dein Weg"}));
assert.ok(shown.includes("3 − 2 = 1")&&shown.includes("1 + 2 = 3"));
const ask=renderToStaticMarkup(createElement(TargetSteps,{task,status:"ask",onAnswer(){}}));
assert.ok(ask.includes("Karte A")&&ask.includes("Karte C")&&ask.includes("Mein Zwischenstand")&&!ask.includes("Meine Vorhersage"));
const reveal=renderToStaticMarkup(createElement(TargetSteps,{task,status:"reveal",onAnswer(){}}));
assert.ok(reveal.includes("Ein möglicher Weg")&&!reveal.includes("Anderen Weg ausprobieren"));
