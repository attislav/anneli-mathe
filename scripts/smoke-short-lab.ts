import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { LabRound, LAB_TOPICS, makeLabTask } from "../src/game/lab";
import { freshLabMaterial, materialHash } from "../src/game/freshLabMaterial";
import { LAB_TOPIC_IDS } from "../src/game/schoolSelection";
import { masteryOf, readSave } from "../src/game/state";
import { LabActivity, LabMenu } from "../src/screens/LabScreen";
import { SampleContinue } from "../src/screens/LabSamples";

export function testShortLab(owner:string) {
  const before=structuredClone(readSave());
  const menu=renderToStaticMarkup(createElement(PathnameContext.Provider,{value:"/labor/"},createElement(LabMenu,{owner,topics:[]})));
  assert.match(menu,/name="einzelthemen-umfang"\/>Eine Aufgabe/);
  assert.match(menu,/checked=""[^>]*\/>Fünf Aufgaben/);
  for(const size of [1,5] as const) {
    let started:LabRound|undefined;
    const followUp=SampleContinue({topic:"pairs",size,onStart:(topic,length)=>{started=new LabRound(topic,owner,length);}});
    assert.ok(renderToStaticMarkup(followUp).includes(size===1?"1 Aufgabe":"5 Aufgaben"));
    followUp.props.onClick();
    assert.equal(started?.size,size);
    assert.equal(started?.topic,"pairs");
    assert.deepEqual(readSave(),before);
  }
  for(const [i,topic] of LAB_TOPIC_IDS.entries()) {
    assert.equal(new LabRound(topic,owner).count,5);
    const round=new LabRound(topic,owner,1), task=round.state.task;
    const expected=Math.min(5,Math.max(1,Math.round(masteryOf(readSave(),LAB_TOPICS[topic].skillId))));
    assert.equal(round.count,1);
    assert.equal(task.level,expected);
    assert.equal(task.skillId,LAB_TOPICS[topic].skillId);
    round.answer(task.id,i%2===0);
    if(i%2!==0){round.advance(task.id);round.answer(task.id,true);}
    if(i===0)assert.ok(round.remember(task.id));
    const saved=structuredClone(readSave());
    round.answer(task.id,true);round.advance(task.id);
    assert.equal(round.state.status,"done");
    if(i===0){
      const end=renderToStaticMarkup(createElement(LabActivity,{round,onBack(){},onReplay(){}}));
      assert.ok(end.includes("von 1 Aufgabe") && end.includes("Noch eine neue Aufgabe zu diesem Thema") && end.includes("Anderes Thema wählen"));
    }
    const replay=round.replay();
    assert.equal(replay.count,1);assert.equal(replay.topic,topic);
    assert.equal(replay.state.task.format,task.format);
    assert.notEqual(replay.state.task.id,task.id);
    assert.deepEqual(readSave(),saved);
  }
  const fixed=makeLabTask("parcels",2);
  assert.ok(fixed.format==="parcel-mass");
  const other={...fixed,other:fixed.other+50};let attempts=0;
  assert.equal(freshLabMaterial(()=>++attempts===1?fixed:other,materialHash(fixed)),other);
  assert.equal(attempts,2);
  attempts=0;
  assert.equal(freshLabMaterial(()=>{attempts++;return fixed;},materialHash(fixed)),fixed);
  assert.equal(attempts,10);
  const after=readSave();
  assert.deepEqual({...after,labNotes:before.labNotes,mastery:before.mastery,log:before.log},before);
}
