import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {ComparisonRound,comparisonHint,comparisonTransfer,inverseOptions,models} from "../src/game/comparisonClinic";
import {ComparisonModel} from "../src/lesson/ComparisonClinic";
import {LabActivity} from "../src/screens/LabScreen";
import {activeProfileId,addProfile,createProfile,readSave,switchProfile} from "../src/game/state";
const data=new Map<string,string>();
const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value)};
Object.defineProperty(globalThis,"window",{value:{localStorage:storage,sessionStorage:storage}});
createProfile({name:"Ada",pet:"funkel",petName:"Pip"});
const owner=activeProfileId(),before=structuredClone(readSave());
const model=renderToStaticMarkup(createElement(ComparisonModel,{back(){},next(){}}));
assert.ok(model.includes("Lea hat 14")&&model.includes("Am Beispiel prüfen"));
for(const c of models){
  assert.ok(comparisonHint(c,"",[],"99",-1,true));
  assert.equal(comparisonHint(c,c.names[c.more?0:1],Array.from({length:c.gap},(_,i)=>i),c.more===c.knownFirst?String(c.small):String(c.small+c.gap),-1,true),null);
}
assert.deepEqual(readSave(),before);
let exercise=comparisonTransfer(models[0]);
const forms=new Set<string>();
for(let i=0;i<4;i++){
  forms.add([exercise.more,exercise.knownFirst].join("/"));
  const amounts=exercise.more?[exercise.small+exercise.gap,exercise.small]:[exercise.small,exercise.small+exercise.gap];
  const answer=String(amounts[exercise.knownFirst?1:0]),large=exercise.names[amounts[0]>amounts[1]?0:1],marks=Array.from({length:exercise.gap},(_,i)=>i);
  assert.equal(comparisonHint(exercise,large,marks,answer,0,false),null);
  assert.ok(comparisonHint(exercise,large,marks,answer,1,false));
  assert.ok(comparisonHint(exercise,large,marks.slice(1),answer,0,false));
  assert.ok(comparisonHint(exercise,large,marks,"100",0,false));
  assert.ok(comparisonHint(exercise,exercise.names.find(name=>name!==large)!,marks,answer,0,false));
  assert.ok(inverseOptions(exercise)[0].startsWith(exercise.names[1]));
  const next=comparisonTransfer(exercise);
  assert.ok(next.names.every(name=>!exercise.names.includes(name)));
  assert.notEqual(next.small,exercise.small);assert.notEqual(next.gap,exercise.gap);
  exercise=next;
}
assert.equal(forms.size,4);
const round=new ComparisonRound(owner,exercise);
const screen=()=>renderToStaticMarkup(createElement(LabActivity,{round,onBack(){},onReplay(){}}));
assert.ok(screen().includes("Zusätzlicher Sticker 1"));
round.answer(exercise.id,false);round.advance(exercise.id);round.answer(exercise.id,true);round.answer(exercise.id,true);round.advance(exercise.id);
assert.ok(screen().includes("Zur Sprechstunde"));const saved=structuredClone(readSave());
assert.equal(saved.log.length,before.log.length+1);assert.equal(saved.log.at(-1)?.s,"sachaufgaben");assert.equal(exercise.level,1);
assert.deepEqual({...saved,log:before.log,mastery:before.mastery},before);
const stale=new ComparisonRound(owner);addProfile();createProfile({name:"Lea",pet:"funkel",petName:"Leo"});
const sibling=structuredClone(readSave());stale.answer(stale.exercise.id,true);assert.deepEqual(readSave(),sibling);
switchProfile(owner);stale.close();stale.answer(stale.exercise.id,true);assert.deepEqual(readSave(),saved);
console.log("Vergleichssätze: beide Reihen, vier Vergleichsformen, Umkehrsatz, frischer Transfer, Erstwertung und Profile geprüft.");

