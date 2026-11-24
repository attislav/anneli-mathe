import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {buildingBlocks,nextGoal,runStep,sameSquare,squareName,stairProgram,walk,type Direction} from "../src/game/stairProgram";
import {StairProgram} from "../src/lesson/StairProgram";

const directions:Direction[]=["right","left","up","down"];
const rightUp:Direction[]=["right","up"];
const target:Direction[]=[...rightUp,...rightUp,...rightUp,...rightUp];
const swapped:Direction[]=["up","right"];
assert.deepEqual(walk({x:2,y:5},target).at(-1),walk({x:2,y:5},Array.from({length:4},()=>swapped).flat()).at(-1));
assert.equal(runStep(target,swapped,4,0),"wrong");
assert.equal(runStep(target,rightUp,2,4),"short");assert.equal(runStep(target,rightUp,5,8),"extra");
assert.deepEqual(buildingBlocks(target),[rightUp,[...rightUp,...rightUp]]);
assert.ok(!sameSquare(nextGoal({x:0,y:8},target,rightUp),nextGoal({x:0,y:8},target,[...rightUp,...rightUp])));
let equivalent=false;
const seen=new Set<Direction>();
for(const level of [1,2,3,4,5] as const)for(const n of [0,.24,.51,.76,.99]){
  let board:ReturnType<typeof stairProgram>;const original=Math.random;
  try{Math.random=()=>n;board=stairProgram(level);}finally{Math.random=original;}
  const {target,start,cols,rows}=board,valid=buildingBlocks(target);equivalent ||=valid.length>1;
  target.forEach(d=>seen.add(d));
  // Any valid program has to be a prefix. Test every prefix/repeat factor and
  // independently verify the entire route and each additional transfer vertex.
  for(let size=1;size<=target.length/2;size++)for(let count=2;count<=target.length;count++){
    const block=target.slice(0,size),attempt=Array.from({length:count},()=>block).flat();
    const matches=target.length===attempt.length&&target.every((d,i)=>d===attempt[i]);
    let cursor=0;
    while(runStep(target,block,count,cursor)==="match")cursor++;
    assert.equal(runStep(target,block,count,cursor)==="done",matches);
    if(!matches)continue;
    assert.ok(valid.some(v=>v.join()===block.join()));
    let x=start.x,y=start.y;
    for(const d of [...target,...block]){
      x+=d==="right"?1:d==="left"?-1:0;y+=d==="down"?1:d==="up"?-1:0;
      assert.ok(x>=0&&x<cols&&y>=0&&y<rows);
    }
    assert.deepEqual(nextGoal(start,target,block),{x,y});
  }
  for(const wrong of directions.filter(d=>d!==target[0]))assert.equal(runStep(target,[wrong],2,0),"wrong");
}
assert.ok(equivalent);assert.equal(seen.size,4);
const task={...stairProgram(3),id:"stair",level:3 as const,skillId:"schleifen"};
const ask=renderToStaticMarkup(createElement(StairProgram,{task,status:"ask",onAnswer(){}}));
assert.ok(ask.includes("Treppenlinie als Punktfolge lesen")&&ask.includes("Programm starten")&&!ask.includes("Neues Ziel prüfen"));
const reveal=renderToStaticMarkup(createElement(StairProgram,{task,status:"reveal",onAnswer(){}}));
assert.ok(reveal.includes("Ein Beispielprogramm")&&reveal.includes(squareName(nextGoal(task.start,task.target,buildingBlocks(task.target)[0]))));
