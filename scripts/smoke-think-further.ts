import assert from "node:assert/strict";
import { mock } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LearningRound, numberTasks } from "../src/game/learningGoals";
import { routeTasks } from "../src/game/changeRoute";
import { decisionResult } from "../src/game/voteDecision";
import { busJourney, busTime } from "../src/game/busTable";
import { readSave } from "../src/game/state";
import { thinkFurther } from "../src/game/thinkFurther";
import { ThinkFurther } from "../src/lesson/ThinkFurther";

export function testThinkFurther(owner:string) {
  const parts=new LearningRound(owner,"numbers",numberTasks(14));
  parts.submitParts(parts.state.task.id,4,"6");
  assert.match(thinkFurther(parts).before,/Links 4, rechts 6/);
  assert.equal(thinkFurther(parts).answer,"Links 5, rechts 5");
  const route=new LearningRound(owner,"routes",routeTasks(0));
  route.submitRoute(route.state.task.id,[0,3,4,7,8]);
  assert.match(thinkFurther(route).before,/A2.*rechts/);
  assert.match(thinkFurther(route).question,/C2.*links.*B3/);
  assert.equal(thinkFurther(route).answer,"links");
  const time=new LearningRound(owner,"times"), bus=time.tasks[0];
  assert.ok(bus.format==="bus-table");
  const {arrival,departure}=busJourney(bus);
  assert.equal(thinkFurther(time).answer,busTime(arrival+5)+" Uhr");
  assert.ok(thinkFurther(time).question.includes(busTime(departure+5)));
  const winners=new Set<string>(), sources=new Set<number>();
  for(let sample=0;sample<7;sample++) for(const seed of [0.2,0.8]) {
    let firstDraw=true;
    const rng=mock.method(Math,"random",()=>{
      if(firstDraw){firstDraw=false;return (sample+0.5)/7;}
      return seed;
    });
    try {
      const votes=new LearningRound(owner,"votes"), transfer=votes.tasks[2];
      assert.ok(transfer.format==="vote-change");
      const {first,second}=decisionResult(transfer), item=thinkFurther(votes), names=transfer.names;
      const from=names.findIndex((name,i)=>item.question.includes("von "+name+" zu "+names[1-i]));
      assert.ok(from>=0 && [first,second][from]>0);
      sources.add(from);
      const a=first+(from===0?-1:1), b=second+(from===1?-1:1);
      assert.ok(item.after.includes(names[0]+": "+a+", "+names[1]+": "+b));
      assert.equal(item.answer,a===b?"Gleichstand":names[a>b?0:1]);
      winners.add(a===b?"gleich":a>b?"erste":"zweite");
      assert.deepEqual(thinkFurther(votes),item);
    } finally {rng.mock.restore();}
  }
  assert.deepEqual(winners,new Set(["erste","zweite","gleich"]));
  assert.equal(sources.size,2);
  for(const goal of ["numbers","times"] as const) {
    const positions=new Set<number>();
    for(const seed of [0.1,0.4,0.6,0.9]) {
      const rng=mock.method(Math,"random",()=>seed);
      try{
        const round=new LearningRound(owner,goal), item=thinkFurther(round);
        positions.add(item.choices.indexOf(item.answer));
        assert.deepEqual(thinkFurther(round),item);
      }finally{rng.mock.restore();}
    }
    assert.deepEqual(positions,new Set([0,1,2]));
  }
  for(const goal of ["numbers","routes","times","votes"] as const) {
    const round=new LearningRound(owner,goal);
    for(let i=0;i<3;i++) {
      const id=round.state.task.id;
      round.answer(id,false); round.advance(id); round.answer(id,false); round.advance(id);
    }
    assert.equal(round.state.status,"done");
    const saved=structuredClone(readSave()), state=structuredClone(round.state);
    const item=thinkFurther(round);
    assert.equal(item.source,"Aus der gezeigten Lösung");
    assert.ok(item.choices.includes(item.answer));
    assert.equal(new Set(item.choices).size,item.choices.length);
    const initial=renderToStaticMarkup(createElement(ThinkFurther,{item}));
    assert.ok(initial.includes("Freiwillig weiterdenken"));
    assert.ok(!initial.includes(item.after));
    assert.deepEqual(thinkFurther(round),item);
    assert.deepEqual(readSave(),saved);
    assert.deepEqual(round.state,state);
  }
}
