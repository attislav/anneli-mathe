import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {coveredCounters,evidenceHint,judge,possibleTotals,reason} from "../src/game/coveredCounters";
import {Bowls,CoveredCounters} from "../src/lesson/CoveredCounters";

const base={...coveredCounters(2),id:"bounds",skillId:"mengengrenzen",level:2 as const,bowls:[{tens:1,units:9},{tens:2,units:0}],needed:39};
for(let first=0;first<=9;first++)for(let second=0;second<=9;second++){
  const bowls=[{tens:1,units:first},{tens:2,units:second}];
  for(const opened of [[],[0],[1],[0,1],[1,0]]){
    // Enumerate every completion consistent with what a child can see.
    const totals:number[]=[];
    for(let a=0;a<=9;a++)for(let b=0;b<=9;b++){
      if((!opened.includes(0)||first===a)&&(!opened.includes(1)||second===b))totals.push(30+a+b);
    }
    const minimum=Math.min(...totals),maximum=Math.max(...totals);
    for(let needed=29;needed<=50;needed++){
      const board={bowls,needed};
      assert.deepEqual(possibleTotals(board,opened),{minimum,maximum});
      const expected=totals.every(total=>total>=needed)?"enough":totals.every(total=>total<needed)?"short":"open";
      assert.equal(judge(board,opened),expected);
      assert.equal(evidenceHint(board,opened,expected,minimum,maximum),null);
      assert.ok(evidenceHint(board,opened,expected,minimum+1,maximum));
      assert.ok(evidenceHint(board,opened,expected,minimum,maximum-1));
      if(expected==="open")assert.ok(minimum<needed&&maximum>=needed);
    }
  }
}
assert.equal(judge(base,[]),"open");assert.equal(judge(base,[0]),"enough"); // Minimum equals 39: B stays covered.
assert.equal(judge(base,[1]),"open");assert.equal(judge(base,[1,0]),"enough"); // Maximum equals 39: equality remains possible.
assert.equal(judge({...base,needed:40},[1]),"short"); // Even the maximum misses by one.
assert.ok(reason(base,[0]).includes("39"));
const changed={...base,bowls:[{tens:1,units:2},{tens:2,units:8}]};
const screen=(task:typeof base,status:"ask"|"reveal")=>renderToStaticMarkup(createElement(CoveredCounters,{task,status,onAnswer(){}}));
assert.equal(screen(base,"ask"),screen(changed,"ask"));
assert.equal(screen(base,"reveal"),screen(changed,"reveal"));
assert.ok(!screen(base,"ask").includes("Schale A öffnen"));
assert.ok(screen(base,"reveal").includes("Schale A öffnen"));
for(const needed of [29,30,49])assert.ok(!screen({...base,needed},"reveal").includes("Schale A öffnen"));
const partial=(units:number)=>renderToStaticMarkup(createElement(Bowls,{task:{...base,bowls:[base.bowls[0],{tens:2,units}]},opened:[0]}));
assert.equal(partial(0),partial(8));assert.ok(partial(8).includes("9 einzelne Plättchen"));
for(const level of [1,2,3,4,5] as const){
  const board=coveredCounters(level);
  assert.ok(board.needed>0&&board.needed<=100&&possibleTotals(board,[]).maximum<=100);
}
