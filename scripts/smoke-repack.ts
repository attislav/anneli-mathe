import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { appendPacking, canRepack, factorsFit, materialChecked, packingReason, repack, targetPacking, type PackedGroup, type Packing } from "../src/game/repack";
import { Repack, SplitResult } from "../src/lesson/Repack";

const split:Packing={action:"split",boxes:3,fill:8};
assert.deepEqual(targetPacking(split),{boxes:6,fill:4});
for(const action of ["split","merge"] as const){
  const pack=action==="split"?split:{action,boxes:6,fill:4};
  assert.ok(!factorsFit(pack,String(pack.boxes),String(pack.fill)));
  const target=targetPacking(pack)!;
  assert.ok(!factorsFit(pack,String(target.fill),String(target.boxes)));
  assert.ok(factorsFit(pack,String(target.boxes),String(target.fill)));
}
for(const cut of [2,3]){
  const html=renderToStaticMarkup(createElement(SplitResult,{fill:5,cut}));
  assert.ok(html.includes("links "+cut+", rechts "+(5-cut)));
  assert.ok(html.includes(cut===2?"rechten":"linken"));
  assert.ok(html.lastIndexOf('aria-label="1 Stein"')>html.indexOf("Seite kommt ein Stein heraus"));
}
assert.deepEqual(targetPacking({action:"merge",boxes:6,fill:4}),{boxes:3,fill:8});
assert.deepEqual(appendPacking(split,[],[0],2),[]);
let halves:PackedGroup[]=[];
for(const id of [2,0,1]) halves=appendPacking(split,halves,[id],4);
assert.ok(materialChecked(split,halves));assert.ok(!materialChecked(split,halves.slice(0,-1)));
const pairs:Packing={action:"merge",boxes:4,fill:3};
for(const order of [[0,1,2,3],[2,0,1,3],[3,0,2,1]]){
  let groups=appendPacking(pairs,[],order.slice(0,2));
  assert.deepEqual(appendPacking(pairs,groups,[order[0],order[3]]),groups);
  assert.deepEqual(appendPacking(pairs,groups,[order[3],order[3]]),groups);
  groups=appendPacking(pairs,groups,order.slice(2));
  assert.ok(materialChecked(pairs,groups));
}
for(const level of [1,2,3,4,5] as const) for(const seed of [0,.25,.48,.55,.82,.999]){
  const previous:Packing[]=[];
  const random=Math.random;
  try{
    Math.random=()=>seed;
    for(let turn=0;turn<5;turn++){
      const task=repack(level,previous);
      assert.ok(canRepack(task.first));assert.notEqual(task.first.action,task.transfer.action);
      assert.notEqual(previous.at(-1)?.action,task.first.action);
      assert.ok(!previous.some(old=>JSON.stringify(old)===JSON.stringify(task.first)));
      previous.push(task.first);
      for(const pack of [task.first,task.transfer]){
        const target=targetPacking(pack);
        if(target) assert.equal(target.boxes*target.fill,pack.boxes*pack.fill);
        assert.equal(packingReason(pack),target?"same":pack.action==="split"?"oddFill":"oddBoxes");
        let moves:PackedGroup[]=[];
        if(pack.action==="split"){
          for(let id=0;id<(target?pack.boxes:1);id++)moves=appendPacking(pack,moves,[id],Math.floor(pack.fill/2));
        }else for(let id=0;id+1<pack.boxes;id+=2)moves=appendPacking(pack,moves,[id,id+1]);
        assert.ok(materialChecked(pack,moves));
      }
    }
  }finally{Math.random=random;}
}
const sample={...repack(2),first:split,transfer:{action:"merge" as const,boxes:3,fill:4},id:"test",level:2 as const,skillId:"gleichUmpacken"};
const start=renderToStaticMarkup(createElement(Repack,{task:sample,status:"ask",onAnswer(){}}));
assert.ok(start.includes("Schachtel A")&&!start.includes("ohne Partner"));
const reveal=renderToStaticMarkup(createElement(Repack,{task:sample,status:"reveal",onAnswer(){}}));
assert.ok(reveal.includes("24 Steine")&&reveal.includes("eine Schachtel übrig"));

