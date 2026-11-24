import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {draftIssue,freshRiddle,riddleMove,riddleNumbers,starts,type RiddleState} from "../src/game/partnerRiddle";
import {clueText,fitsClue} from "../src/game/numberDetective";
import type {NumberClue} from "../src/game/types";
import {createProfile,readSave} from "../src/game/state";
import {RiddleView} from "../src/screens/PartnerRiddle";

const values=new Map<string,string>();
const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value)};
Object.defineProperty(globalThis,"window",{value:{localStorage:storage,sessionStorage:storage}});
createProfile({name:"Marie",pet:"funkel",petName:"Pip"});
const before=structuredClone(readSave());
const html=(state:RiddleState)=>renderToStaticMarkup(createElement(RiddleView,{state,act(){},onBack(){}}));
for(const start of starts){
  const numbers=riddleNumbers(start);assert.equal(new Set(numbers).size,12);
  for(const [index,secret] of numbers.entries()){
    assert.equal(numbers.filter(n=>n%10===secret%10).length,3);
    const lo=numbers[index-index%4],range:NumberClue={kind:"range",lo,hi:lo+3};
    const ends:NumberClue={kind:"ends",digits:[secret%10]};
    const clues=[range,ends];assert.equal(draftIssue(numbers,secret,clues),null);
    assert.deepEqual(numbers.filter(n=>clues.every(clue=>fitsClue(n,clue))),[secret]);
    assert.match(draftIssue(numbers,secret,[{kind:"range",lo:secret,hi:secret},ends])!,/alleine/);
    assert.match(draftIssue(numbers,secret,[{kind:"parity",even:secret%2!==0},ends])!,/passt nicht/);
    const ambiguous=[range,{kind:"parity",even:secret%2===0} as NumberClue];
    const alternative=numbers.find(n=>n!==secret&&ambiguous.every(clue=>fitsClue(n,clue)));
    assert.ok(alternative!==undefined && draftIssue(numbers,secret,ambiguous)?.includes("Auch die "+alternative));
  }
}
const threeClues:NumberClue[]=[{kind:"range",lo:2,hi:25},{kind:"ends",digits:[4]},{kind:"parity",even:true}];
const fullDraft=draftIssue(riddleNumbers(2),4,threeClues);
assert.ok(fullDraft?.includes("Auch die 14")&&fullDraft.includes("ersetze")&&!fullDraft.includes("ergänze"));
assert.equal(draftIssue(riddleNumbers(2),4,[{kind:"range",lo:2,hi:5},...threeClues.slice(1)]),null);
let state=freshRiddle(2);
state=riddleMove(state,{type:"secret",value:4});
state=riddleMove(state,{type:"add",clue:{kind:"range",lo:4,hi:4}});
state=riddleMove(state,{type:"add",clue:{kind:"ends",digits:[4]}});
state=riddleMove(state,{type:"check"});assert.equal(state.phase,"write");assert.match(state.message,/alleine/);
state=riddleMove(state,{type:"remove",value:0});
state=riddleMove(state,{type:"add",clue:{kind:"range",lo:2,hi:5}});
state=riddleMove(state,{type:"add",clue:{kind:"parity",even:true}});
state=riddleMove(state,{type:"check"});assert.equal(state.phase,"ready");
state=riddleMove(state,{type:"edit"});assert.equal(state.phase,"write");
state=riddleMove(state,{type:"check"});
const clues=structuredClone(state.clues);
state=riddleMove(state,{type:"pass"});
const neutral=html(state).replace(/<[^>]+>/g,"");
assert.ok(neutral.includes("Gerät weitergeben")&&!/\d/.test(neutral));
assert.ok(!html(state).includes("Geheimzahl")&&clues.every(clue=>!html(state).includes(clueText(clue))));
state=riddleMove(state,{type:"open"});assert.equal(state.phase,"solve");assert.deepEqual(state.clues,clues);
assert.ok(!html(state).includes("Deine Geheimzahl")&&!html(state).includes('aria-pressed="true"'));
state=riddleMove(state,{type:"guess",value:14});state=riddleMove(state,{type:"solve"});assert.equal(state.phase,"solve");
state=riddleMove(state,{type:"guess",value:4});state=riddleMove(state,{type:"solve"});assert.equal(state.phase,"explain");
const rejected=clues.map((clue,i)=>fitsClue(state.near!,clue)?-1:i).filter(i=>i>=0);
assert.equal(rejected.length,2);
for(const [i,clue] of clues.entries()){
  const choice=riddleMove(state,{type:"reason",value:i}),result=riddleMove(choice,{type:"explain"});
  assert.equal(result.phase,fitsClue(state.near!,clue)?"explain":"done");
}
state=riddleMove(riddleMove(state,{type:"reason",value:rejected[0]}),{type:"explain"});
assert.ok(html(state).includes("Rollen tauschen"));
assert.deepEqual(riddleMove(state,{type:"reset",start:77}),freshRiddle(77));assert.deepEqual(readSave(),before);
console.log("Partner-Zahlenrätsel: alle 84 Geheimzahlen, Korrektur, neutrale Übergabe, Begründungen und Rollenwechsel geprüft.");
