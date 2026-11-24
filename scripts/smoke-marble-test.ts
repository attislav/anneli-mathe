import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {createExperiment,exampleProof,finding,MarbleRound,proofHint,readings,surfaces,type Experiment,type Finding} from "../src/game/marbleTest";
import {activeProfileId,addProfile,createProfile,readSave,switchProfile} from "../src/game/state";
import {LabActivity} from "../src/screens/LabScreen";
import {MeasuringTrack} from "../src/lesson/MarbleTest";

const outcomes=new Set<Finding>(),winners=new Set<Finding>();
// Below, equal and above the threshold on every row, including four identical results.
for(let pattern=0;pattern<81;pattern++){
  const data=Array.from({length:4},(_,i)=>5+Math.floor(pattern/3**i)%3);
  const experiment:Experiment={minimum:6,rolls:{Holz:[data[0],data[1]],Pappe:[data[2],data[3]],Filz:[4,4]}};
  const rows=readings(experiment,["Holz","Pappe"]),max=Math.max(...data);
  const paired=(a:boolean,b:boolean):Finding=>a?(b?"both":"first"):(b?"second":"neither");
  const maximum=paired(Math.max(data[0],data[1])===max,Math.max(data[2],data[3])===max);
  const threshold=paired(Math.min(data[0],data[1])>=6,Math.min(data[2],data[3])>=6);
  outcomes.add(threshold);winners.add(maximum);
  for(const step of [2,3] as const){
    const answer=step===2?maximum:threshold;
    assert.equal(finding(rows,step,6),answer);
    assert.equal(proofHint(rows,step,6,answer,exampleProof(rows,step,6)),null);
    for(let mask=0;mask<16;mask++){
      const marked=[0,1,2,3].filter(i=>mask&(1<<i));
      const expected=step===2?data.every((n,i)=>(n===max)===marked.includes(i)):[0,2].every(i=>{
        const a=marked.includes(i),b=marked.includes(i+1);
        if(data[i]>=6&&data[i+1]>=6)return a&&b;
        return (a||b)&&(!a||data[i]<6)&&(!b||data[i+1]<6);
      });
      assert.equal(proofHint(rows,step,6,answer,marked)===null,expected);
    }
  }
}
assert.equal(outcomes.size,4);assert.equal(winners.size,3);
for(const surface of surfaces)for(const second of surfaces.filter(name=>name!==surface)){
  const experiment=createExperiment(),rows=readings(experiment,[surface,second]);
  assert.deepEqual(rows.map(row=>row.surface),[surface,surface,second,second]);
  for(const row of rows){assert.ok(row.cm>=0&&row.cm<=10);const track=renderToStaticMarkup(createElement(MeasuringTrack,{row}));
    assert.ok(track.includes('cx="'+(16+22*row.cm)+'"')&&track.includes("Start bei null"));}
}

const data=new Map<string,string>();
const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value)};
Object.defineProperty(globalThis,"window",{value:{localStorage:storage,sessionStorage:storage}});
createProfile({name:"Lina",pet:"funkel",petName:"Leo"});
const owner=activeProfileId(),before=structuredClone(readSave());
const experiment:Experiment={minimum:7,rolls:{Holz:[6,8],Pappe:[8,7],Filz:[5,6]}};
const round=new MarbleRound(owner,experiment);
const current=()=>round.state.task.id;
const screen=()=>renderToStaticMarkup(createElement(LabActivity,{round,onBack(){},onReplay(){}}));
assert.ok(screen().includes("Versuch starten"));
round.submit(current(),{step:1,chosen:["Pappe","Holz"],values:[8,7,5,8]});
assert.equal(round.state.status,"wrong");assert.ok(round.state.hint?.includes("Holz, Lauf 1"));
round.advance(current());round.submit(current(),{step:1,chosen:["Pappe","Holz"],values:[8,7,6,8]});
round.advance(current());assert.ok(screen().includes("Unser Versuchsprotokoll"));
round.submit(current(),{step:2,answer:"both",marked:[0,3]});round.advance(current());
round.submit(current(),{step:3,answer:"first",marked:[0,1,2]});round.advance(current());
assert.equal(round.state.status,"done");assert.deepEqual(round.proofs,{2:[0,3],3:[0,1,2]});
const end=screen();assert.ok(end.includes("Neuen Versuch starten")&&end.includes("vier gemessenen Läufe")&&!end.includes("Filz"));
assert.deepEqual(readSave().log.slice(before.log.length).map(e=>[e.s,e.ok]),[["lineal",0],["laengenVergleichen",1],["laengenVergleichen",1]]);
assert.deepEqual(readSave().nodes,before.nodes);assert.equal(readSave().xp,before.xp);
const repeat=new MarbleRound(owner,experiment);
assert.equal(repeat.rows.length,0);assert.deepEqual(repeat.proofs,{});
const sample={step:1 as const,chosen:["Filz","Holz"] as ("Filz"|"Holz")[],values:[0,0,0,0]};
repeat.submit(repeat.state.task.id,sample);repeat.advance(repeat.state.task.id);repeat.submit(repeat.state.task.id,sample);
assert.equal(repeat.state.status,"reveal");assert.deepEqual(repeat.rows.map(row=>row.cm),[5,6,6,8]);repeat.advance(repeat.state.task.id);
const saved=structuredClone(readSave());
addProfile();createProfile({name:"Tom",pet:"funkel",petName:"Pip"});
const sibling=structuredClone(readSave());
repeat.submit(repeat.state.task.id,{step:2,answer:"second",marked:[3]});assert.deepEqual(readSave(),sibling);
switchProfile(owner);repeat.close();repeat.submit(repeat.state.task.id,{step:2,answer:"second",marked:[3]});assert.deepEqual(readSave(),saved);
console.log("Murmelbahn: Projektablauf, Protokoll, inklusive Grenze, Gegenbelege, Gleichstände und Profile geprüft.");
