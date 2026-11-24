import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { moveStrip, storyStrips, stripAmount, stripEquationHint, stripLayoutHint, stripNumber, stripRoles, stripStoryText, type StoryRole } from "../src/game/storyStrips";
import { StoryStrips, StripResult } from "../src/lesson/StoryStrips";
import type { StripStoryTask } from "../src/game/types";

for(const [a,b] of [[0,0],[0,1],[1,0],[5,5],[6,7],[50,50]]) for(const missing of stripRoles){
  const t:StripStoryTask={...storyStrips(4),id:"s",level:4,skillId:"sachaufgaben",parts:[a,b],names:["Mila","Tom"],unit:["Murmel","Murmeln"],missing};
  const x=missing==="whole"?a+b:missing==="first"?a:b;
  for(const top of stripRoles)for(const left of stripRoles)for(const right of stripRoles){
    const terms=[top,left,right];
    const unique=new Set(terms).size===3;
    assert.equal(stripLayoutHint(terms)===null,unique&&top==="whole");
    for(const op of ["+","−"]){
      const correct=unique && (op==="+"?right==="whole":top==="whole");
      assert.equal(stripEquationHint(t,terms,op,String(x))===null,correct);
      assert.ok(stripEquationHint(t,terms,op,String(x+1)));
    }
  }
  assert.equal(stripNumber(t,missing),"?");
  const text=stripStoryText(t);
  assert.ok(text.includes("Wie viele Murmeln"));
  assert.ok(!text.includes("1 Murmeln"));
  assert.equal(stripAmount(t,0),"keine Murmeln");assert.equal(stripAmount(t,1),"1 Murmel");
  const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(StoryStrips,{task:t,status,onAnswer(){}}));
  assert.ok(!render("ask").includes("Rechenzeichen"));
  assert.ok(render("ask").includes("Ihre Länge verrät keine Anzahl"));
}
let board:(StoryRole|null)[]=[null,null,null];
board=moveStrip(board,"first",0);board=moveStrip(board,"whole",1);board=moveStrip(board,"second",2);
assert.ok(stripLayoutHint(board));
assert.deepEqual(moveStrip(board,"whole",0),["whole","first","second"]);
const story:StripStoryTask={...storyStrips(2),id:"result",skillId:"sachaufgaben",level:2,parts:[8,7],names:["Mila","Tom"],
  unit:["Murmel","Murmeln"],missing:"second",solution:"Tom: 7 Murmeln."};
const result=(terms:(StoryRole|"")[],op:string)=>renderToStaticMarkup(createElement(StripResult,{task:story,terms,op}));
for(const [terms,op,line] of [
  [["first","second","whole"],"+","8 + 7 = 15"],
  [["second","first","whole"],"+","7 + 8 = 15"],
  [["whole","second","first"],"−","15 − 7 = 8"],
  [["whole","first","second"],"−","15 − 8 = 7"],
] as [StoryRole[],string,string][]) {
  const html=result(terms,op);
  assert.ok(html.includes("Deine Rechnung") && html.includes(line) && html.includes("Tom: 7 Murmeln."));
  assert.ok(!html.includes("Ein möglicher Rechenweg"));
}
for(const terms of [["","",""],["first","second","whole"]] as (StoryRole|"")[][]) {
  const html=result(terms,"−");
  assert.ok(html.includes("Ein möglicher Rechenweg") && html.includes("15 − 8 = 7") && html.includes("Tom: 7 Murmeln."));
}
