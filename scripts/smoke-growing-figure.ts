import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {boardSize,figure,figureHint,gridName,growingFigure,growthResult,newCells,numberHint,pointKey,type Family} from "../src/game/growingFigure";
import {GrowingFigure} from "../src/lesson/GrowingFigure";

// Independent per-family derivation. With initial arm length s, figure n
// has arm length s+n−1. Only these listed endpoints change from 2 to 3.
const proofs:Record<Family,{gain:number;count:(s:number,n:number)=>number;added:(s:number)=>string[]}> = {
  row:{gain:1,count:(s,n)=>s+n-1,added:s=>[s+1+",0"]},
  foot:{gain:1,count:(s,n)=>1+s+n-1,added:s=>[s+1+",1"]}, // unchanged upper shaft
  ribbon:{gain:2,count:(s,n)=>2*(s+n-1),added:s=>[s+1+",0",s+1+",1"]}, // two right ends
  wings:{gain:2,count:(s,n)=>2+2*(s+n-1),added:s=>[2-s+",0",6+s+",0"]}, // body and middle stay fixed
  tower:{gain:3,count:(s,n)=>3*(s+n-1),added:s=>[0,1,2].map(x=>x+","+(3-s))}, // next complete storey
};
for(const family of Object.keys(proofs) as Family[])for(const start of [1,2])for(const target of [5,6,7,8,9]){
  const p={family,start,target},proof=proofs[family],adds=proof.added(start),[w,h]=boardSize(p);
  assert.deepEqual(newCells(p).map(pointKey).sort(),[...adds].sort());
  for(const n of [1,2,3,target]){
    const pts=figure(p,n);
    assert.equal(pts.length,proof.count(start,n));assert.equal(new Set(pts.map(pointKey)).size,pts.length);
    if(n<=3)assert.ok(pts.every(([x,y])=>x>=0&&y>=0&&x<w&&y<h));
  }
  const r=growthResult(p);assert.equal(r.steps,target-3);assert.equal(r.gain,proof.gain);assert.equal(r.total,proof.count(start,target));
  assert.equal(numberHint(p,r.steps,r.gain,r.total),null);
  assert.ok(numberHint(p,r.steps+1,r.gain,r.total));assert.ok(numberHint(p,r.steps,r.gain+1,r.total));assert.ok(numberHint(p,r.steps,r.gain,r.total+1));
  assert.equal(figureHint(p,[...adds].reverse()),null);
  assert.ok(figureHint(p,adds.slice(1)));
  assert.ok(figureHint(p,adds.map((key,i)=>i===0?pointKey(figure(p,2)[0]):key)));
}
for(const level of [1,2,3,4,5] as const){
  const data=growingFigure(level),task={...data,id:"fig",skillId:"figurenWachstum",level};
  assert.ok(level>1||proofs[data.family].gain===1);
  const ask=renderToStaticMarkup(createElement(GrowingFigure,{task,status:"ask",onAnswer(){}}));
  assert.ok(ask.includes("Figur 1")&&ask.includes("Figur 2")&&ask.includes("A1")&&ask.includes("Neue Kästchen prüfen"));
  const reveal=renderToStaticMarkup(createElement(GrowingFigure,{task,status:"reveal",onAnswer(){}}));
  for(const p of newCells(task))assert.ok(reveal.includes(gridName(p)+", neu gelegt"));
  assert.ok(reveal.includes("sind es "+(task.target-3)+" Schritte"));
}
