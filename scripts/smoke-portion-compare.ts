import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {comparePortions,comparisonHint,portionCompare,portionHint,validPortion} from "../src/game/portionCompare";
import {PortionBoards,PortionCompare} from "../src/lesson/PortionCompare";

const winners=new Set<number>();
const combinations=new Set<string>();
let samePartsTie=false,mixedPartsTie=false;
for(const level of [1,2,3,4,5] as const)for(const pair of [0,.26,.51,.76,.99])for(const flip of [0,.99]){
  const original=Math.random;let data:ReturnType<typeof portionCompare>,i=0;
  try{Math.random=()=>i++===0?pair:flip;data=portionCompare(level);}finally{Math.random=original;}
  const [a,b]=data.boards;
  const names=data.boards.map(board=>board.parts===2?"eine Hälfte":"ein Viertel");
  assert.ok(data.question.startsWith("Du bekommst von Tafel A "+names[0]+" und von Tafel B "+names[1]+"."));
  const combo=a.parts+"/"+b.parts;
  if(!combinations.has(combo)){
    combinations.add(combo);
    const task={...data,id:"wording",skillId:"anteileVergleichen",level};
    const initial=renderToStaticMarkup(createElement(PortionCompare,{task,status:"ask",onAnswer(){}}));
    assert.ok(initial.includes("Tafel A · "+names[0])&&initial.includes("Tafel B · "+names[1]));
    assert.ok(initial.includes("Mehr Kästchen von A")&&initial.includes("Mehr Kästchen von B")&&initial.includes("Gleich viele Kästchen"));
    const end=renderToStaticMarkup(createElement(PortionCompare,{task,status:"reveal",onAnswer(){}}));
    assert.ok(end.includes("Schokolade.") && !end.includes("Anteil ist größer"));
  }
  assert.notDeepEqual([a.rows,a.cols].sort(),[b.rows,b.cols].sort());
  if(level<=2)assert.ok(a.parts===2&&b.parts===2);
  const sizeA=a.rows*a.cols/a.parts,sizeB=b.rows*b.cols/b.parts;
  assert.ok(Number.isInteger(sizeA)&&Number.isInteger(sizeB));
  const winner=sizeA===sizeB?1:sizeA>sizeB?0:2,difference=Math.abs(sizeA-sizeB);
  assert.deepEqual(comparePortions(data.boards),{a:sizeA,b:sizeB,winner,difference});
  winners.add(winner);samePartsTie ||=winner===1&&a.parts===b.parts;mixedPartsTie ||=winner===1&&a.parts!==b.parts;
  const marked=data.boards.map(board=>Array.from({length:board.rows*board.cols/board.parts},(_,j)=>j*board.parts));
  assert.equal(portionHint(data.boards,marked),null);
  assert.ok(portionHint(data.boards,[marked[0].slice(1),marked[1]]));
  assert.equal(comparisonHint(data.boards,sizeA,sizeB,winner,difference),null);
  assert.ok(comparisonHint(data.boards,sizeA,sizeB,winner,difference+1));
  assert.ok(comparisonHint(data.boards,sizeA,sizeB,(winner+1)%3,difference));
  assert.ok(comparisonHint(data.boards,sizeA+1,sizeB,winner,difference));
}
assert.equal(winners.size,3);assert.ok(samePartsTie&&mixedPartsTie);
assert.deepEqual([...combinations].sort(),["2/2","2/4","4/2","4/4"]);
const board={rows:2,cols:4,parts:2 as const};
for(let mask=0;mask<256;mask++){
  const cells=Array.from({length:8},(_,i)=>i).filter(i=>mask&(1<<i));
  assert.equal(validPortion(board,cells),cells.length===4);
}
assert.equal(validPortion(board,[0,1,1,2]),false);assert.equal(validPortion(board,[0,1,2,8]),false);
const task={...portionCompare(1),boards:[board,{rows:4,cols:4,parts:4 as const}],id:"a",skillId:"anteileVergleichen",level:1 as const};
const own=[[0,2,5,7],[0,5,10,15]];
const result=renderToStaticMarkup(createElement(PortionBoards,{task,cells:own,solved:true}));
assert.equal((result.match(/Deine Markierung/g)??[]).length,2);
assert.equal((result.match(/2\.25rem/g)??[]).length,2);
assert.equal((result.match(/h-9 w-9/g)??[]).length,24);
assert.ok(result.includes("Tafel A, Reihe 2, Platz 4, markiert")&&result.includes("Tafel B, Reihe 4, Platz 4, markiert"));
const fallback=renderToStaticMarkup(createElement(PortionBoards,{task,cells:[own[0],[]],solved:true}));
assert.ok(fallback.includes("Deine Markierung") && fallback.includes("Eine mögliche Markierung"));
const initial=renderToStaticMarkup(createElement(PortionCompare,{task,status:"ask",onAnswer(){throw Error("Unbewertete Vermutung");}}));
assert.ok(initial.includes("Vermutung festhalten")&&!initial.includes("Markierungen prüfen")&&!initial.includes("Vergleich prüfen"));
