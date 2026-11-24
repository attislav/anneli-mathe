import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {missingIndex,patternRibbon,repeatBand,ribbonHint,smallestUnit} from "../src/game/patternRibbon";
import {PatternRibbon,RibbonBand,RibbonSolution} from "../src/lesson/PatternRibbon";

for(const [unit,expected] of [[[0,0,0,0],[0]],[[0,1,0,1],[0,1]],[[0,0,1],[0,0,1]]]){
  assert.deepEqual(smallestUnit(unit),expected);
}
// Brute-force testing compares whole bands made from independent candidate blocks.
for(const length of [2,3,4])for(let code=0;code<4**length;code++){
  const unit=Array.from({length},(_,i)=>Math.floor(code/4**i)%4);
  const whole=[...unit,...unit,...unit],asText=whole.join("");
  const valid=Array.from({length},(_,i)=>i+1).filter(k=>whole.length%k===0 && whole.slice(0,k).join("").repeat(whole.length/k)===asText);
  assert.deepEqual(smallestUnit(unit),whole.slice(0,valid[0]));
  for(let k=1;k<=length;k++)for(let n=0;n<=whole.length;n++)
    assert.equal(ribbonHint(unit,k,n)===null,k===valid[0] && n*k===whole.length);
  for(let offset=0;offset<12;offset++){
    const index=missingIndex(unit,offset);assert.ok(index>=length&&index<whole.length);
    assert.equal(whole[index],unit[index%valid[0]]);
  }
}
const task={...patternRibbon(5),id:"band",level:5 as const,skillId:"musterbausteine"};
const own=[1,0,1,0],piece=smallestUnit(own),band=repeatBand(own),hidden=missingIndex(own,task.offset);
const result=renderToStaticMarkup(createElement(RibbonSolution,{task,own}));
assert.ok(result.includes("Dein Musterband")&&result.includes("Dreieck · Kreis")&&result.includes("6 Mal"));
assert.ok(renderToStaticMarkup(createElement(RibbonSolution,{task,own:[]})).includes("Ein Beispielband"));
const mask=renderToStaticMarkup(createElement(RibbonBand,{band,size:piece.length,hidden}));
const cells=mask.match(/<li\b[^>]*>[\s\S]*?<\/li>/g)!;
assert.equal(cells.length,12);assert.ok(cells[hidden].includes("verdecktes Zeichen")&&!cells[hidden].includes("Dreieck")&&!cells[hidden].includes("Kreis"));
assert.equal(cells.filter(c=>c.includes("Baustein beginnt")).length,6);
for(const level of [1,2,3,4,5] as const){
  const t=patternRibbon(level);assert.ok(t.palette.length>=2 && new Set(t.palette).size===t.palette.length);
  assert.ok(t.min>=2&&t.min<=t.max&&t.max<=4);
}
const start=renderToStaticMarkup(createElement(PatternRibbon,{task,status:"ask",onAnswer(){}}));
assert.ok(start.includes("Letztes Zeichen zurücknehmen")&&start.includes("Band dreimal legen")&&!start.includes("Einteilung prüfen"));
