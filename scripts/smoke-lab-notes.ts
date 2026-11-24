import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { LAB_TOPICS, LabRound, makeLabTask } from "../src/game/lab";
import { freshNoteTask, LabNoteRound, noteHash, removeLabNote } from "../src/game/labNoteRound";
import { normalizeNotes } from "../src/game/labNotes";
import { LAB_TOPIC_IDS } from "../src/game/schoolSelection";
import { activeProfileId, createProfile, importAsNewProfile, readSave, replaceSave, switchProfile, update } from "../src/game/state";
import { exportCode, parseCode } from "../src/game/transfer";
import { LabActivity, LabMenu } from "../src/screens/LabScreen";

const values=new Map<string,string>();
const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)};
Object.defineProperty(globalThis,"window",{value:{localStorage:storage,sessionStorage:storage}});
const view=(round:LabRound|LabNoteRound)=>renderToStaticMarkup(createElement(LabActivity,{round,onBack(){},onReplay(){}}));

async function test() {
  createProfile({name:"Leni",pet:"funkel",petName:"Lumi"});
  const owner=activeProfileId();
  for(const [i,topic] of LAB_TOPIC_IDS.entries()) {
    const round=new LabRound(topic,owner),{task}=round.state;
    assert.equal(round.remember(task.id),false);
    round.answer(task.id,i%2===0);
    if(i%2!==0){assert.equal(round.remember(task.id),false);round.advance(task.id);round.answer(task.id,false);}
    assert.ok(view(round).includes("Das möchte ich nochmal üben"));
    const before=structuredClone(readSave());
    assert.equal(round.remember(task.id),true);
    assert.equal(round.remember(task.id),true);
    const saved=readSave(), note=saved.labNotes.find(n=>n.topic===topic)!;
    assert.deepEqual(note,{topic,level:task.level,source:noteHash(task)});
    assert.deepEqual({...saved,labNotes:before.labNotes},before);
    const one=new LabNoteRound(owner,note);
    assert.equal(one.state.task.format,task.format);
    assert.equal(one.state.task.level,task.level);
    assert.equal(one.state.task.skillId,LAB_TOPICS[topic].skillId);
    assert.notEqual(one.state.task.id,task.id);
    assert.deepEqual(readSave(),saved);
    one.answer(one.state.task.id,true);one.answer(one.state.task.id,true);one.advance(one.state.task.id);
    assert.equal(one.state.status,"done");
    assert.ok(view(one).includes("Abhaken und vom Merkzettel nehmen"));
    assert.equal(readSave().log.length,saved.log.length+1);
    one.finish(true);
    assert.equal(readSave().labNotes.find(n=>n.topic===topic)?.last,noteHash(one.state.task));
  }
  update(s=>({...s,mastery:{...s.mastery,[LAB_TOPICS.parcels.skillId]:5}}));
  const harder=new LabRound("parcels",owner);
  harder.answer(harder.state.task.id,true);
  harder.remember(harder.state.task.id);
  assert.equal(readSave().labNotes.find(n=>n.topic==="parcels")?.level,5);
  const parcel=makeLabTask("parcels",5);
  assert.ok(parcel.format==="parcel-mass");
  const changed={...parcel,other:parcel.other+50};
  let generated=0;
  assert.equal(freshNoteTask({topic:"parcels",level:5,source:noteHash(parcel)},()=>generated++===0?parcel:changed),changed);
  const all=readSave().labNotes;
  assert.equal(all.length,LAB_TOPIC_IDS.length);
  const menu=renderToStaticMarkup(createElement(PathnameContext.Provider,{value:"/labor/"},createElement(LabMenu,{owner,topics:[],notes:all})));
  assert.ok(menu.includes("Mein Merkzettel") && menu.includes(LAB_TOPICS[all[0].topic].prompt));
  for(const entry of all) {
    const title=LAB_TOPICS[entry.topic].title.replaceAll("&","&amp;");
    assert.ok(menu.includes(`aria-label="${title} vom Merkzettel nehmen"`));
    assert.ok(menu.includes(`aria-label="${title} auf Stufe ${entry.level} üben"`));
  }
  const note=all[0], fixed=makeLabTask(note.topic,note.level);
  let calls=0;
  assert.equal(freshNoteTask({...note,source:noteHash(fixed)},()=>{calls++;return fixed;}),fixed);
  assert.equal(calls,10);
  const {labNotes,...legacy}=readSave();
  assert.deepEqual(normalizeNotes([null,{topic:"bogus"},...labNotes,labNotes[0]]),labNotes);
  const exported=await parseCode(await exportCode());assert.ok(exported);
  const stale=new LabNoteRound(owner,note), active=new LabRound(note.topic,owner);
  active.answer(active.state.task.id,true);
  importAsNewProfile(exported);
  assert.deepEqual(readSave().labNotes,labNotes);
  const sibling=structuredClone(readSave());
  const oldRemove=()=>removeLabNote(owner,note);
  oldRemove();
  stale.answer(stale.state.task.id,true);stale.finish(false);
  assert.equal(active.remember(active.state.task.id),false);
  assert.deepEqual(readSave(),sibling);
  replaceSave(legacy);assert.deepEqual(readSave().labNotes,[]);
  switchProfile(owner);
  const restored=structuredClone(readSave());
  oldRemove(); // The old rendered entry was replaced when this profile was loaded again.
  assert.deepEqual(readSave(),restored);
  stale.answer(stale.state.task.id,true);stale.advance(stale.state.task.id);stale.finish(false);
  assert.deepEqual(readSave().labNotes,all.slice(1));
  const prior=readSave(), chosen=prior.labNotes[1];
  removeLabNote(owner,chosen);
  assert.deepEqual(readSave(),{...prior,labNotes:prior.labNotes.filter(n=>n!==chosen)});
  console.log("Merkzettel: alle Laborthemen, Einzelrunden, Profilwechsel und Spielstand-Code geprüft.");
}
test().catch(e=>{console.error(e);process.exitCode=1;});
