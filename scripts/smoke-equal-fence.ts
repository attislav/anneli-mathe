import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { bedAnswer, bedArea, bedBetween, bedCells, equalFence, investigationKey, measureBed, possibleBeds, sizeKey, type BedInvestigation } from "../src/game/equalFence";
import { LabRound } from "../src/game/lab";
import { materialHash } from "../src/game/freshLabMaterial";
import { EqualFence } from "../src/lesson/EqualFence";

const expected = {10:["1 × 4","2 × 3"],12:["1 × 5","2 × 4","3 × 3"],14:["1 × 6","2 × 5","3 × 4"]};
for(const fence of [10,12,14] as const) {
  const grid=fence/2-1;
  const possible=possibleBeds(fence);
  assert.deepEqual(possible.map(sizeKey),expected[fence]);
  const seen=new Set<string>();
  // Independently count each exposed edge of the selected cells for every pair of corners.
  for(let start=0;start<grid*grid;start++) for(let end=0;end<grid*grid;end++) {
    const bed=bedBetween(start,end,grid);
    assert.deepEqual(bed,bedBetween(end,start,grid));
    const cells=bedCells(bed,grid);
    let edges=0;
    for(const cell of cells){
      const x=cell%grid,y=Math.floor(cell/grid);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const col=x+dx,row=y+dy;
        if(col<0||row<0||col>=grid||row>=grid||!cells.includes(row*grid+col)) edges++;
      }
    }
    assert.equal(measureBed(bed,grid,fence,cells,String(cells.length),[])===null,edges===fence);
    if(edges===fence){
      seen.add(sizeKey(bed));
      assert.ok(measureBed(bed,grid,fence,cells.slice(1),String(cells.length),[]));
      assert.ok(measureBed(bed,grid,fence,cells,String(cells.length+1),[]));
      assert.ok(measureBed(bed,grid,fence,cells,String(cells.length),possible));
    }
  }
  assert.deepEqual([...seen].sort(),expected[fence]);
  const task={...equalFence(1),mode:"largest" as const,fence,level:1 as const,id:"bed",skillId:"beetflaechen"};
  const ask=renderToStaticMarkup(createElement(EqualFence,{task,status:"ask",onAnswer(){}}));
  assert.ok(ask.includes("A1")&&ask.includes(String.fromCharCode(64+grid)+grid));
  assert.ok(!ask.includes("Am meisten Platz"));
  const reveal=renderToStaticMarkup(createElement(EqualFence,{task,status:"reveal",onAnswer(){}}));
  for(const shape of expected[fence]) assert.ok(reveal.includes(shape));
  assert.ok(reveal.includes("Am meisten Platz"));
  for(const a of possible) for(const b of possible.filter(b=>sizeKey(b)!==sizeKey(a))) {
    const pair=[a,b];
    const difference={...task,mode:"difference" as const};
    const gap=Math.abs(bedArea(a)-bedArea(b));
    assert.ok(bedAnswer(difference,pair,String(gap)));assert.ok(!bedAnswer(difference,pair,String(gap+1)));
    for(const plants of [bedArea(a),bedArea(b),bedArea(a)+1,bedArea(b)+1]){
      const planting={...task,mode:"plants" as const,plants};
      for(const bed of pair) assert.equal(bedAnswer(planting,pair,sizeKey(bed)),bedArea(bed)>=plants);
      assert.equal(bedAnswer(planting,pair,"none"),pair.every(bed=>bedArea(bed)<plants));
      const end=renderToStaticMarkup(createElement(EqualFence,{task:planting,status:"reveal",onAnswer(){}}));
      assert.ok(end.includes("Zwei mögliche Beete")&&!end.includes("Am meisten Platz"));
    }
  }
}
for(const level of [1,2,3,4,5] as const) for(const seed of [0,.38,.62,.99]){
  const used:BedInvestigation[]=[];
  const random=Math.random;
  try {
    Math.random=()=>seed;
    for(let i=0;i<5;i++){
      const next=equalFence(level,used);
      assert.notEqual(next.mode,used.at(-1)?.mode);
      assert.ok(!used.some(job=>investigationKey(job)===investigationKey(next)));
      used.push(next);
    }
  } finally {Math.random=random;}
}
export function testFenceRound(owner:string){
  const round=new LabRound("equalFence",owner,5), hashes=new Set<number>();
  let previousMode="";
  for(let i=0;i<5;i++){
    const task=round.state.task;assert.equal(task.format,"equal-fence");
    assert.notEqual(task.mode,previousMode);
    previousMode=task.mode;hashes.add(materialHash(task));
    round.answer(task.id,true);round.advance(task.id);
  }
  assert.equal(hashes.size,5);assert.equal(round.state.status,"done");
}

