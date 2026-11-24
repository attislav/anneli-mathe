import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cornerSetup, layoutHint, needs, orderHint, purchase, ReadingRound, type CornerSetup } from "../src/game/readingCorner";
import { activeProfileId, addProfile, createProfile, readSave, switchProfile } from "../src/game/state";
import { CornerNote } from "../src/lesson/ReadingCorner";

const base:CornerSetup={shelf:7,window:2,stockC:1,stockB:0,budget:20};
for(const shelf of [6,7,8])for(const window of [0,1,2]){
  const setup={...base,shelf,window}, valid=[0,0];
  for(let mask=0;mask<512;mask++){
    const cells=Array.from({length:9},(_,i)=>i).filter(i=>mask&(1<<i));
    const ok=[2,3].includes(cells.length)&&cells.includes(window)&&[3,4,5,shelf].every(n=>!cells.includes(n));
    assert.equal(layoutHint(setup,cells)===null,ok);
    if(ok)valid[cells.length-2]++;
  }
  assert.ok(valid.every(n=>n>1));
}
assert.ok(layoutHint(base,[2,2]));
let exact=false;
for(const stockC of [1,2,3])for(const stockB of [0,1,2])for(const budget of [20,22,24])for(const mats of [2,3]){
  const setup={...base,stockC,stockB,budget};
  let valid=0;
  for(let a=0;a<=8;a++)for(let b=0;b<=6;b++)for(let c=0;c<=8;c++)for(let d=0;d<=4;d++){
    const cost=3*a+4*b+3*c+5*d;
    const ok=a+2*b+stockC>=2*mats && c+2*d+stockB>=mats && cost<=budget;
    assert.equal(orderHint(setup,mats,[a,b,c,d])===null,ok);
    if(ok){valid++;exact ||=cost===budget;}
  }
  assert.ok(valid>1);
}
assert.ok(exact);
const data=new Map<string,string>();
const storage={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)};
Object.defineProperty(globalThis,"window",{value:{localStorage:storage,sessionStorage:storage}});
createProfile({name:"Nina",pet:"funkel",petName:"Leo"});
const owner=activeProfileId(),before=structuredClone(readSave());
const aborted=new ReadingRound(owner,cornerSetup());aborted.close();aborted.submit(aborted.state.task.id,{step:1,cells:[0,2]});
assert.deepEqual(readSave(),before);
const round=new ReadingRound(owner,base),cells=[2,6,0],counts=[0,3,1,1],cost=purchase(counts).price;
const id=()=>round.state.task.id;
round.submit(id(),{step:1,cells});round.submit(id(),{step:1,cells});round.advance(id());
assert.deepEqual(round.cells,cells);
assert.deepEqual(needs(base,cells.length),{cushions:5,baskets:3});
round.submit(id(),{step:2,cushions:5,baskets:3});round.advance(id());
round.submit(id(),{step:3,counts,left:base.budget-cost});round.advance(id());
assert.equal(round.state.status,"done");assert.deepEqual(round.order,counts);
const note=renderToStaticMarkup(createElement(CornerNote,{round,completed:3}));
assert.ok(note.includes("Dein Grundriss")&&note.includes("Deine Bestellung")&&note.includes("Dein Restgeld")&&note.includes("Für später übrig"));
assert.deepEqual(readSave().log.slice(-3).map(e=>[e.s,e.ok]),[["lageplan",1],["sachaufgaben",1],["einkaufen",1]]);
assert.deepEqual(readSave().nodes,before.nodes);assert.equal(readSave().xp,before.xp);
const sample=new ReadingRound(owner,base);
function twice(entry:Parameters<ReadingRound["submit"]>[1]){
  sample.submit(sample.state.task.id,entry);sample.advance(sample.state.task.id);
  sample.submit(sample.state.task.id,entry);assert.equal(sample.state.status,"reveal");sample.advance(sample.state.task.id);
}
twice({step:1,cells:[3,4]});assert.equal(layoutHint(base,sample.cells),null);
twice({step:2,cushions:100,baskets:100});
twice({step:3,counts:[0,0,0,0],left:0});assert.equal(orderHint(base,sample.cells.length,sample.order),null);
assert.ok(renderToStaticMarkup(createElement(CornerNote,{round:sample,completed:3})).includes("Beispielbestellung"));
const stale=new ReadingRound(owner,base);addProfile();createProfile({name:"Tim",pet:"funkel",petName:"Ari"});
const sibling=structuredClone(readSave());stale.submit(stale.state.task.id,{step:1,cells:[0,2]});
assert.deepEqual(readSave(),sibling);assert.deepEqual(stale.cells,[]);switchProfile(owner);
assert.equal(readSave().log.length,before.log.length+6);
console.log("Leseecke: alle Raumpläne, zulässige Bestellungen, eigener Projektabschluss, Auflösung und Profile geprüft.");
