import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {countStars,fairWheel,fairnessHint,initialChoice,transferHint,type SymbolFace} from "../src/game/fairWheel";
import {ChanceWheel,FairWheel} from "../src/lesson/FairWheel";

for(const size of [4,6,8]){
  // Check every construction, including all adjacent/non-alternating arrangements.
  for(let mask=0;mask<2**size;mask++){
    const digits=mask.toString(2).padStart(size,"0");
    const fields:SymbolFace[]=[...digits].map(digit=>digit==="1"?"star":"moon");
    const stars=digits.replaceAll("0","").length,moons=size-stars;
    assert.equal(initialChoice(fields),stars===moons?"equal":stars>moons?"star":"moon");
    assert.equal(fairnessHint(fields,0)===null,stars===moons);
    assert.ok(fairnessHint(fields,1));assert.ok(fairnessHint(fields,2));
  }
  for(let a=0;a<=size;a++)for(let b=0;b<=size;b++){
    const row=(stars:number):SymbolFace[]=>Array.from({length:size},(_,i)=>i<stars?"star":"moon");
    const winner=a===b?"equal":a>b?"first":"second";
    assert.equal(transferHint(row(a),row(b),a,b,winner),null);
    assert.equal(transferHint(row(b),row(a),b,a,winner==="first"?"second":winner==="second"?"first":"equal"),null);
    assert.ok(transferHint(row(a),row(b),a+1,b,winner));
  }
}
const outcomes=new Set<string>(),starts=new Set<string>();
let seed=50;
const original=Math.random;
try{
  Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(const level of [1,2,3,4,5] as const)for(let run=0;run<50;run++){
    const wheel=fairWheel(level),{initial,first,second}=wheel;
    const size=level===1?4:level<=3?6:8;
    assert.ok([initial,first,second].every(fields=>fields.length===size));
    assert.equal(new Set([initial,first,second].map(fields=>fields.join(","))).size,3);
    outcomes.add(String(Math.sign(countStars(first)-countStars(second))));
    starts.add(initialChoice(initial));if(countStars(initial)===0||countStars(initial)===size)starts.add("monochrome");
  }
}finally{Math.random=original;}
assert.equal(outcomes.size,3);assert.equal(starts.size,4);
const fields:SymbolFace[]=["star","star","moon","moon"];
const graphic=renderToStaticMarkup(createElement(ChanceWheel,{title:"Dein faires Rad",fields}));
assert.ok(graphic.includes("Feld 1: Stern. Feld 2: Stern. Feld 3: Mond. Feld 4: Mond"));
assert.equal((graphic.match(/<path /g)??[]).length,4);
const interactive=renderToStaticMarkup(createElement(ChanceWheel,{title:"Dein Rad",fields,change(){}}));
assert.equal((interactive.match(/<button/g)??[]).length,4);assert.ok(interactive.includes("Feld 3: Mond wechseln"));
const task={...fairWheel(1),id:"wheel",skillId:"faireChancen",level:1 as const};
const ask=renderToStaticMarkup(createElement(FairWheel,{task,status:"ask",onAnswer(){}}));
assert.ok(ask.includes("jedes Feld dieselbe Chance")&&ask.includes("Ausgangsrad prüfen")&&!ask.includes("Rad B"));
const reveal=renderToStaticMarkup(createElement(FairWheel,{task,status:"reveal",onAnswer(){}}));
assert.ok(reveal.includes("Ein mögliches faires Rad")&&reveal.includes("Rad A")&&reveal.includes("Rad B"));
