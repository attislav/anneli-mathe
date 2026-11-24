import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {createTheater,exampleSeating,seatIssue,seatLabel,seatNumber,seatRow,seats,TheaterRound} from "../src/game/classTheater";
import {activeProfileId,addProfile,createProfile,readSave,switchProfile} from "../src/game/state";
import {LabActivity} from "../src/screens/LabScreen";

const room={...createTheater(),occupied:[1,10],names:["Mia","Ben","Ava"]};
for(const closed of [-1,...seats.filter(s=>!room.occupied.includes(s))]){
  const unavailable=[...room.occupied,closed];
  let solutions=0;
  for(const a of seats)for(const b of seats)for(const c of seats){
    const cells=[a,b,c];
    const independent=new Set(cells).size===3&&cells.every(seat=>!unavailable.includes(seat))&&
      seatRow(a)===seatRow(b)&&["1,2","2,1","3,4","4,3"].includes([seatNumber(a),seatNumber(b)].join(","))&&[2,3].includes(seatNumber(c));
    assert.equal(seatIssue(room,cells,closed)===null,independent);
    if(independent)solutions++;
  }
  assert.ok(solutions>1);
}
for(const a of seats)for(const b of seats.filter(s=>s>a))for(const closed of seats.filter(s=>s!==a&&s!==b)){
  const layout={...room,occupied:[a,b]};
  assert.equal(seatIssue(layout,exampleSeating(layout,closed),closed),null);
}
const data=new Map<string,string>();
const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value)};
Object.defineProperty(globalThis,"window",{value:{localStorage:storage,sessionStorage:storage}});
createProfile({name:"Mila",pet:"funkel",petName:"Milo"});
const owner=activeProfileId(),before=structuredClone(readSave());
for(const affectsBooking of [true,false]){
  const round=new TheaterRound(owner,{...room,affectsBooking});
  const current=()=>round.state.task.id;
  const screen=()=>renderToStaticMarkup(createElement(LabActivity,{round,onBack(){},onReplay(){}}));
  assert.ok(screen().includes("Für wen wählst du einen Sitz?"));
  const plan=[7,6,9];
  round.submit(current(),{step:1,plan:[5,6,9]});assert.equal(round.state.status,"wrong");
  round.advance(current());round.submit(current(),{step:1,plan});round.advance(current());
  assert.deepEqual(round.original,plan);assert.equal(plan.includes(round.closedSeat),affectsBooking);
  assert.ok(screen().includes("Eintrittskarte für"));
  const tickets=plan.map(seat=>({row:seatRow(seat),seat:seatNumber(seat)}));
  round.submit(current(),{step:2,tickets});round.advance(current());
  assert.ok(screen().includes(seatLabel(round.closedSeat)));
  const next=affectsBooking?exampleSeating(room,round.closedSeat,plan):plan;
  round.submit(current(),{step:3,keep:!affectsBooking,plan:next});round.advance(current());
  assert.equal(round.state.status,"done");assert.deepEqual(round.final,next);
  assert.ok(screen().includes("Die Eintrittskarten sind fertig!"));
}
const round=new TheaterRound(owner,room);assert.deepEqual(round.original,[]);assert.deepEqual(round.final,[]);
const invalid=()=>round.submit(round.state.task.id,{step:1,plan:[0,0,1]});
invalid();round.advance(round.state.task.id);invalid();assert.equal(round.state.status,"reveal");assert.ok(round.revealed.has(1));
assert.equal(seatIssue(room,round.original),null);
round.advance(round.state.task.id);
const saved=structuredClone(readSave());assert.equal(saved.log.length-before.log.length,7);
assert.deepEqual({...saved,log:before.log,mastery:before.mastery},before);
addProfile();createProfile({name:"Tom",pet:"funkel",petName:"Pip"});
const stale=()=>round.submit(round.state.task.id,{step:2,tickets:[]});
const sibling=structuredClone(readSave());stale();assert.deepEqual(readSave(),sibling);
switchProfile(owner);round.close();stale();assert.deepEqual(readSave(),saved);
console.log("Klassentheater: Sitzwünsche, echte Eintrittskarten, beide Sperrfälle, Projektabschluss und Profilgrenzen geprüft.");

