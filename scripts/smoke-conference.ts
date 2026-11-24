import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {conferenceMove,freshConference,jumpHint,newProblem,sectionHint,type ConferenceState} from "../src/game/conference";
import {ConferenceView} from "../src/screens/PartnerConference";
import {createProfile,readSave} from "../src/game/state";

const storageValues=new Map<string,string>();
const storage={getItem:(key:string)=>storageValues.get(key)??null,setItem:(key:string,value:string)=>storageValues.set(key,value)};
Object.defineProperty(globalThis,"window",{value:{localStorage:storage,sessionStorage:storage}});
createProfile({name:"Jo",pet:"funkel",petName:"Stern"});const original=structuredClone(readSave());
const render=(state:ConferenceState)=>renderToStaticMarkup(createElement(ConferenceView,{state,act(){},onBack(){}}));
const problem={start:37,addend:16};
function step(state:ConferenceState,size:number,landing:number){
  state=conferenceMove(state,{type:"size",value:String(size)});
  state=conferenceMove(state,{type:"landing",value:String(landing)});
  return conferenceMove(state,{type:"add"});
}
function enter(state:ConferenceState,sizes:number[]){
  let landing=state.problem.start;
  for(const size of sizes){landing+=size;state=step(state,size,landing);}
  return conferenceMove(state,{type:"finish"});
}
for(const variant of ["different","whole","same"] as const){
  let state=freshConference(problem);
  assert.ok(!render(state).includes("53")&&!render(state).includes("Plus 6 bis 43"));
  state=step(state,6,44);assert.equal(state.paths[0].length,0);assert.ok(state.message);
  state=step(state,6,43);state=conferenceMove(state,{type:"undo"});assert.equal(state.paths[0].length,0);assert.equal(state.size,"6");
  state=enter(state,[6,4,6]);assert.equal(state.phase,"pass");
  const privateHtml=render(state);
  assert.ok(!privateHtml.includes("37")&&!privateHtml.includes("53")&&!privateHtml.includes("43")&&!privateHtml.includes("<svg"));
  state=conferenceMove(state,{type:"open"});assert.equal(state.phase,"second");
  assert.ok(!render(state).includes("53")&&!render(state).includes("Plus 6 bis 43"));
  const sizes=variant==="different"?[10,6]:variant==="same"?[6,4,6]:[8,8];
  state=enter(state,sizes);assert.equal(state.phase,"compare");
  if(variant==="different"){
    const html=render(state);
    const positions=[...html.matchAll(/data-stop="47" cx="([^"]+)"/g)].map(match=>Number(match[1]));
    assert.deepEqual(positions,[220,220]); // 10/16 of the same linear span on both lines.
    assert.ok(html.includes("37 + 6 = 43")&&html.includes("37 + 10 = 47"));
  }
  assert.deepEqual(state.paths[0].map(jump=>jump.size),[6,4,6]);assert.deepEqual(state.paths[1].map(jump=>jump.size),sizes);
  const end=variant==="whole"?53:47;
  for(const path of [0,1] as const){
    state=conferenceMove(state,{type:"mark",path,value:end});
    state=conferenceMove(state,{type:"mark",path,value:37});
  }
  state=conferenceMove(state,{type:"length",value:"1"});state=conferenceMove(state,{type:"check"});assert.equal(state.phase,"compare");assert.ok(state.message);
  state=conferenceMove(state,{type:"length",value:String(end-37)});state=conferenceMove(state,{type:"check"});assert.equal(state.phase,"done");
  assert.ok(render(state).includes("Rollen tauschen"));assert.deepEqual(conferenceMove(state,{type:"reset",problem:{start:60,addend:9}}),freshConference({start:60,addend:9}));
}
assert.ok(sectionHint([[37,43],[47,53]],"6")); // Same length alone is insufficient.
assert.ok(jumpHint(problem,[],"0","37"));assert.ok(jumpHint(problem,[],"16","53"));
const five=[1,1,1,1].map((size,i)=>({size,landing:38+i}));
assert.ok(jumpHint(problem,five,"1","42"));assert.equal(jumpHint(problem,five,"12","53"),null);
const upper=freshConference({start:78,addend:22});assert.equal(enter(upper,[2,20]).phase,"pass");
for(let i=0;i<100;i++){const generated=newProblem();assert.ok(generated.start+generated.addend<=100&&generated.addend>=5);}
assert.deepEqual(readSave(),original);
console.log("Rechenkonferenz: zwei unabhängige Wege, gemeinsame Abschnitte, Blickschutz, Grenzen und Rollenwechsel geprüft.");
