import assert from "node:assert/strict";
import { mock } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fitsFold, foldHint, foldLines, foldProbe, mirrorCell, type FoldLine } from "../src/game/foldLines";
import { FoldGrid, FoldLines } from "../src/lesson/FoldLines";
import type { FoldTask } from "../src/game/types";

// Independent reflection using perpendicular distance to each centre line.
const normals:Record<FoldLine,[number,number]>={horizontal:[0,1],vertical:[1,0],down:[1,-1],up:[1,1]};
for(const [line,normal] of Object.entries(normals)) for(let i=0;i<16;i++) {
  const x=i%4-1.5,y=Math.floor(i/4)-1.5,[dx,dy]=normal;
  const factor=2*(dx*x+dy*y)/(dx*dx+dy*dy);
  assert.equal(mirrorCell(i,4,line as FoldLine),(y-factor*dy+1.5)*4+x-factor*dx+1.5);
}
const sizes=new Set<number>();
for(const level of [1,3] as const)for(let source=0;source<6;source++)for(let turn=0;turn<4;turn++){
  let draws=0;
  const rng=mock.method(Math,"random",()=>draws++===0?(source+.5)/6:(turn+.5)/4);
  let task:FoldTask;
  try{task={...foldLines(level),skillId:"spiegeln",level,id:"fold"};}finally{rng.mock.restore();}
  assert.equal(task.lines.length,level===1?2:4);
  const valid=task.lines.filter(l=>fitsFold(task,l));
  sizes.add(valid.length);
  assert.equal(foldHint(task,[...valid].reverse()),null);
  for(const l of task.lines) {
    const marks=foldProbe(task,l);
    const missing=marks.filter(m=>m==="only-original").length, extra=marks.filter(m=>m==="only-image").length;
    assert.equal(missing,extra);
    assert.equal(missing===0,valid.includes(l));
    assert.ok(foldHint(task,valid.includes(l)?valid.filter(v=>v!==l):[...valid,l]));
  }
  if(turn===0){
    const html=renderToStaticMarkup(createElement(FoldGrid,{task,line:"vertical"}));
    assert.ok(html.includes("Nur Figur") && html.includes("Nur Spiegelbild") && html.includes("Figur und Spiegelbild"));
    const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(FoldLines,{task,status,onAnswer(){}}));
    assert.ok(!render("ask").includes(task.solution));
    assert.ok(render("reveal").includes(task.solution));
  }
}
assert.deepEqual(sizes,new Set([0,1,2,4]));
