import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { newTrail, plantedValues, trailMove, trailProblems, type TrailAction, type TrailState } from "../src/game/errorTrail";
import { PartnerTrailView } from "../src/screens/PartnerTrail";

const move=(s:TrailState,...steps:TrailAction[])=>steps.reduce(trailMove,s);
const render=(s:TrailState)=>renderToStaticMarkup(createElement(PartnerTrailView,{s,act(){},onBack(){}}));
const has=new Set<string>();
for(const [index,[start,delta]] of trailProblems.entries()) {
  const tens=Math.sign(delta)*Math.floor(Math.abs(delta)/10)*10, ones=delta-tens;
  const mid=start+tens,end=start+delta;
  if(end===0)has.add("zero");
  if(Math.floor(mid/10)!==Math.floor(end/10))has.add("cross");
  const author=move(newTrail(),{type:"pick",index});
  const wrong=move(author,{type:"number",row:0,text:String(mid+1)},{type:"number",row:1,text:String(end)},{type:"check"});
  assert.equal(wrong.phase,"author");
  const plant=move(wrong,{type:"number",row:0,text:String(mid)},{type:"check"});
  assert.equal(plant.phase,"plant");
  for(const row of [0,1] as const) {
    const selected=move(plant,{type:"row",row});
    for(let fake=0;fake<=101;fake++) {
      const pass=move(selected,{type:"fake",text:String(fake)},{type:"check"});
      if(fake===[mid,end][row] || fake>100 || (row===0 && (fake+ones<0 || fake+ones>100))) {
        assert.equal(pass.phase,"plant");continue;
      }
      assert.equal(pass.phase,"pass");
      const [middle,last]=plantedValues(pass);
      assert.equal(Number(middle!==start+tens)+Number(last!==middle+ones),1);
      if(fake!==1)continue;
      const hidden=render(pass);
      assert.ok(!hidden.includes("Zeile") && !hidden.includes("<input") && !hidden.includes("Aufgabe:"));
      const solve=move(pass,{type:"open"});
      assert.deepEqual(solve.inputs,["",""]);assert.equal(solve.mark,null);
      const bad=move(solve,{type:"row",row:row===0?1:0},{type:"number",row:0,text:String(mid)},{type:"number",row:1,text:String(end)},{type:"check"});
      assert.equal(bad.phase,"solve");
      const retry=move(bad,{type:"row",row},{type:"number",row:0,text:String(mid)},{type:"number",row:1,text:String(end+1)},{type:"check"});
      assert.equal(retry.phase,"solve");
      const done=move(retry,{type:"number",row:1,text:String(end)},{type:"check"});
      assert.equal(done.phase,"done");
      assert.deepEqual(move(done,{type:"reset"}),newTrail());
    }
  }
}
assert.deepEqual(has,new Set(["zero","cross"]));
