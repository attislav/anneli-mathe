import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import { attributeSort, countedSlots, sortedAnswer, slotFor, placementIssue, countingHint, countQuestion } from "../src/game/attributeSort";
import {AttributeSort} from "../src/lesson/AttributeSort";

let empty=false, identical=false, zero=false;
const bothQuestions=new Set<string>();
for(const level of [1,2,3,4,5] as const)for(const seed of [0,.34,.51,.7,.99]){
  const original=Math.random;
  let board:ReturnType<typeof attributeSort>;
  try{Math.random=()=>seed;board=attributeSort(level);}finally{Math.random=original;}
  assert.equal(board.cards.length,level+3);
  assert.equal(new Set(board.cards.map(c=>c.id)).size,board.cards.length);
  const places:Record<number,number>={};
  let count=0;
  for(const c of [...board.cards].reverse()){
    const shape=c.shape===board.shape, pattern=c.pattern===board.pattern;
    places[c.id]=shape?(pattern?3:2):(pattern?1:0);
    assert.equal(slotFor(board,c),places[c.id]);
    if(board.countBy==="shape"?shape:pattern)count++;
  }
  bothQuestions.add(board.countBy);
  if(board.countBy==="pattern")assert.match(countQuestion(board),/^Wie viele Karten haben (Punkte|Streifen)\?$/);
  empty ||=new Set(Object.values(places)).size<4;
  identical ||=new Set(board.cards.map(c=>c.shape+c.pattern)).size<board.cards.length;
  zero ||= count===0;
  assert.equal(sortedAnswer(board),count);
  assert.equal(placementIssue(board,places),null);
  assert.equal(countingHint(board,count),null);
  assert.match(countingHint(board,count+1)!,/beiden passenden Feldern/);
  const [card]=board.cards;
  const misplaced={...places,[card.id]:places[card.id]^2};
  const issue=placementIssue(board,misplaced);
  assert.equal(issue?.card,card.id);assert.match(issue!.hint,/Form/);
  misplaced[issue!.card]=places[card.id];assert.equal(placementIssue(board,misplaced),null);
  assert.match(placementIssue(board,{...places,[card.id]:places[card.id]^1})!.hint,/Hat die Karte (Punkte|Streifen)|Ist die Karte ohne Muster/);
  assert.equal(placementIssue(board,{...places,[card.id]:slotFor(board,card)}),null);
  delete places[card.id];
  assert.match(placementIssue(board,places)!.hint,/Lege auch/);
  assert.equal(countedSlots(board).length,2);
}
assert.ok(empty && identical && zero && bothQuestions.size===2);
const task={...attributeSort(1),id:"sorted",level:1 as const,skillId:"merkmaleSortieren"};
const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(AttributeSort,{task,status,onAnswer(){}}));
const ask=render("ask"),reveal=render("reveal");
assert.equal((ask.match(/aria-label="Karte ablegen:/g)??[]).length,4);
assert.equal((ask.match(/<svg/g)??[]).length,4);
assert.ok(ask.includes("Weiter zum Zählen") && !ask.includes("Anzahl der Karten"));
assert.equal((reveal.match(/<svg/g)??[]).length,4);
assert.ok(reveal.includes("Gezählt wurden") && !reveal.includes("<button"));
