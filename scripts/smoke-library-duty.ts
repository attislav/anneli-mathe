import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {bookTransfer,bookingBetween,libraryDuty,receiptHint,stockHint,type Booking} from "../src/game/libraryDuty";
import {LibraryDuty,LibraryLog} from "../src/lesson/LibraryDuty";

for(let total=8;total<=24;total++)for(let shelf=0;shelf<=total;shelf++){
  const initial={shelf,borrowed:total-shelf};
  for(const direction of ["loan","return"] as const)for(let amount=1;amount<=total+1;amount++){
    const booking={direction,amount},expected=shelf+(direction==="return"?amount:-amount);
    const after=bookTransfer(initial,booking);
    if(expected<0||expected>total){assert.equal(after,null);continue;}
    assert.deepEqual(after,{shelf:expected,borrowed:total-expected});
    assert.deepEqual(bookingBetween(initial,after),booking);assert.equal(stockHint(initial,booking,after),null);
    assert.ok(stockHint(initial,booking,initial)); // Same total, wrong allocation.
    assert.equal(receiptHint(initial,after,booking,total,0),null);
    assert.ok(receiptHint(initial,after,booking,total,1));
    assert.ok(receiptHint(initial,after,booking,total+1,0));
    assert.ok(receiptHint(initial,after,{direction,amount:amount+1},total,0));
    assert.ok(receiptHint(initial,after,{direction:direction==="loan"?"return":"loan",amount},total,0));
  }
}
assert.equal(bookingBetween({shelf:5,borrowed:3},{shelf:4,borrowed:3}),null);
const seen=new Set<string>();
let emptyShelf=false,allReturned=false,seed=397;
const original=Math.random;
try{
  Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(const level of [1,2,3,4,5] as const)for(let i=0;i<150;i++){
    const task=libraryDuty(level),total=task.initial.shelf+task.initial.borrowed;
    assert.ok(total>=8&&total<=24);
    let stock=task.initial;
    assert.equal(new Set(task.bookings.map(b=>b.direction)).size,2);
    for(const booking of task.bookings){
      const next=bookTransfer(stock,booking);assert.ok(next);
      stock=next;emptyShelf ||=stock.shelf===0;allReturned ||=stock.borrowed===0;
    }
    const missing=bookingBetween(stock,task.afterMissing);assert.ok(missing);seen.add(missing.direction);
    assert.equal(stockHint(stock,missing,task.afterMissing),null);
  }
}finally{Math.random=original;}
assert.ok(emptyShelf&&allReturned&&seen.size===2);
const task={...libraryDuty(1),id:"lib",skillId:"bestandBuchen",level:1 as const,initial:{shelf:3,borrowed:5},
  bookings:[{direction:"loan",amount:3},{direction:"return",amount:2}] as Booking[],afterMissing:{shelf:3,borrowed:5}};
const view=(solved:boolean,confirmed:{shelf:number;borrowed:number}[])=>renderToStaticMarkup(createElement(LibraryLog,{task,solved,confirmed}));
const initial=view(false,[]),partial=view(false,[{shelf:0,borrowed:8}]);
assert.ok(initial.includes("Am Anfang")&&!initial.includes("Ausleihe ·"));
assert.ok(partial.includes("Von dir bestätigt")&&partial.includes("Ausleihe · 3 Bücher")&&!partial.includes("Rückgabe · 2 Bücher"));
const resolved=view(true,[{shelf:0,borrowed:8}]);
assert.ok(resolved.includes("Vorgerechnet")&&resolved.includes("Rückgabe · 1 Buch")&&resolved.includes("Fehlender Beleg"));
const own=view(true,[{shelf:0,borrowed:8},{shelf:2,borrowed:6}]);assert.ok(!own.includes("Vorgerechnet"));
const ask=renderToStaticMarkup(createElement(LibraryDuty,{task,status:"ask",onAnswer(){}}));
assert.ok(ask.includes("Zwischenstand bestätigen")&&!ask.includes("Ein weiterer Beleg fehlt"));
