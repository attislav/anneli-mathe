import assert from "node:assert/strict";
import { mock } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DivisionClinicRound, divisionHint, divisionTransfer, meanings, modelDivisionHint, placeCounter } from "../src/game/divisionClinic";
import { addProfile, readSave, switchProfile } from "../src/game/state";
import { DivisionModel } from "../src/lesson/DivisionClinic";
import { divisionLevel } from "../src/game/divisionLevels";

export function testDivisionClinic(owner:string){
  const before=structuredClone(readSave());
  let plates=[0,0,0];
  for(let n=0;n<12;n++)plates=placeCounter(plates,n%3,1);
  assert.deepEqual(plates,[4,4,4]);
  assert.equal(placeCounter(plates,0,1),plates);
  const changed=placeCounter(placeCounter(plates,0,-1),1,1);
  assert.ok(modelDivisionHint("share",changed,"4",meanings[0]));
  assert.ok(modelDivisionHint("group",[4,4,4,0],"3",meanings[1]));
  for(const [stage,digit,unit] of [["share","4",0],["group","3",1]] as const){
    assert.equal(modelDivisionHint(stage,plates,digit,meanings[unit]),null);
    assert.ok(modelDivisionHint(stage,plates,"12",meanings[unit]));
    assert.ok(modelDivisionHint(stage,plates,digit,meanings[1-unit]));
    assert.ok(modelDivisionHint(stage,[0,0,0],digit,meanings[unit]));
  }
  const model=renderToStaticMarkup(createElement(DivisionModel,{onBack(){},onNext(){}}));
  assert.ok(model.includes("Neu legen") && model.includes("Teller 3") && !model.includes("12 : 3 = 4"));
  assert.deepEqual(readSave(),before);
  let task=divisionTransfer();
  for(let i=0;i<80;i++){
    const next=divisionTransfer(task);
    assert.equal(next.share,!task.share);
    assert.notEqual(next.total,task.total);assert.notEqual(next.divisor,task.divisor);
    assert.notEqual(next.total,12);
    assert.notEqual(next.total/next.divisor,next.divisor);
    const answer=String(next.total/next.divisor),unit=next.share?0:1;
    assert.equal(divisionHint(next,answer,meanings[unit]),null);
    assert.ok(divisionHint(next,answer,meanings[1-unit]));
    task=next;
  }
  const round=new DivisionClinicRound(owner,task);
  assert.deepEqual(readSave(),before); // A model visit or aborted transfer has no write.
  addProfile();
  const sibling=structuredClone(readSave());
  round.answer(task.id,true);
  assert.deepEqual(readSave(),sibling);
  switchProfile(owner);
  const resumed=new DivisionClinicRound(owner,divisionTransfer(task));
  resumed.answer(resumed.exercise.id,false);resumed.advance(resumed.exercise.id);
  resumed.answer(resumed.exercise.id,true);resumed.advance(resumed.exercise.id);
  assert.equal(resumed.state.status,"done");
  const after=readSave();
  assert.deepEqual(after.log.slice(before.log.length).map(e=>[e.s,e.ok]),[[resumed.exercise.skillId,0]]);
  assert.deepEqual({...after,mastery:before.mastery,log:before.log},before);

  for(const [plates,per,level] of [[2,5,1],[2,6,4],[2,7,undefined],[3,2,2],[4,2,3],[5,6,4],[5,7,5],[6,8,5],[7,5,undefined]] as const)
    assert.equal(divisionLevel(true,plates,per),level);
  for(const [divisor,q,level] of [[2,5,1],[2,6,2],[3,10,3],[5,2,2],[6,2,4],[7,10,4],[9,11,undefined]] as const)
    assert.equal(divisionLevel(false,divisor,q),level);
  const recorded=new Set<string>();
  for(const share of [true,false])for(let i=0;i<32;i++){
    let draws=0;
    const rng=mock.method(Math,"random",()=>draws++===0?(share?0:0.99):(i+0.5)/32);
    let exercise;
    try{exercise=divisionTransfer();}finally{rng.mock.restore();}
    const d=exercise.divisor,q=exercise.total/d;
    // Independent expectations for the divisors available to this clinic.
    const expected=share?(d===2 && q<=5?1:q<=6 && d<=5?4:5):(d===2?(q<=5?1:2):d===5?2:4);
    const signature=[exercise.skillId,expected].join("/");
    assert.equal(exercise.level,expected);
    if(recorded.has(signature))continue;
    const sample=new DivisionClinicRound(owner,exercise);
    sample.answer(exercise.id,true);
    const stored=readSave().log.at(-1)!;
    assert.deepEqual([stored.s,stored.l,stored.ok],[share?"verteilen":"geteilt",expected,1]);
    recorded.add(signature);
  }
  assert.deepEqual(recorded,new Set(["verteilen/1","verteilen/4","verteilen/5","geteilt/1","geteilt/2","geteilt/4"]));
}
