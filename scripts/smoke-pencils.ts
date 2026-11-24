import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { bestShipment, emptyShipment, movePencils, openPack, pencilCount, pencilOrderKey, pencilOrders, shipped, stockLeft, type PencilOrder, type Shipment } from "../src/game/pencilOrders";
import { PencilOrders } from "../src/lesson/PencilOrders";

const order:PencilOrder={packs:6,singles:3,orders:[24,34],optimize:true};
assert.equal(bestShipment(order).opened,1);
assert.equal(bestShipment({...order,singles:8}).opened,0);
const loose={...order,packs:4,singles:18};
for(const [a,b] of [[1,3],[2,2]]){
  const plan:Shipment={opened:0,boxes:[{packs:a,singles:24-a*10},{packs:b,singles:34-b*10}]};
  assert.ok(shipped(loose,plan));
  assert.equal(plan.opened,bestShipment(loose).opened);
  assert.deepEqual(stockLeft(loose,plan),{packs:0,singles:0});
}
const initial=emptyShipment();
let plan=initial;
const history=[plan];
for(const step of [(p:Shipment)=>openPack(order,p),(p:Shipment)=>movePencils(order,p,0,"singles",4),
  (p:Shipment)=>movePencils(order,p,1,"packs",3),(p:Shipment)=>movePencils(order,p,0,"packs",2),
  (p:Shipment)=>movePencils(order,p,1,"singles",4)]){
  plan=step(plan);history.push(plan);
  assert.equal(pencilCount(stockLeft(order,plan))+plan.boxes.reduce((sum,box)=>sum+pencilCount(box),0),63);
}
assert.ok(shipped(order,plan));assert.deepEqual(stockLeft(order,plan),{packs:0,singles:5});
assert.strictEqual(openPack(order,plan),plan);
assert.strictEqual(movePencils(order,plan,0,"singles",6),plan);
assert.strictEqual(movePencils(order,plan,0,"packs",-3),plan);
const returned=movePencils(order,plan,0,"singles",-4);
assert.deepEqual(stockLeft(order,returned),{packs:0,singles:9});assert.ok(!shipped(order,returned));
assert.deepEqual(initial,emptyShipment());
assert.deepEqual(stockLeft(order,history[1]),{packs:5,singles:13});
assert.deepEqual(stockLeft(order,history[0]),{packs:6,singles:3});
const wrongSplit=movePencils(order,returned,1,"singles",4);
assert.equal(wrongSplit.boxes.reduce((n,box)=>n+pencilCount(box),0),58);
assert.ok(!shipped(order,wrongSplit));
for(const level of [1,2,3,4,5] as const) for(const seed of [0,.37,.73,.999]){
  const previous:PencilOrder[]=[];
  const random=Math.random;
  try{
    Math.random=()=>seed;
    for(let i=0;i<5;i++){
      const task=pencilOrders(level,previous);
      assert.ok(!previous.some(old=>pencilOrderKey(old)===pencilOrderKey(task)));
      previous.push(task);
      assert.equal(task.optimize,level>=3);
      const best=bestShipment(task);
      assert.ok(shipped(task,best));
      const necessary=Math.max(0,Math.ceil((task.orders[0]%10+task.orders[1]%10-task.singles)/10));
      assert.equal(best.opened,necessary);
    }
  }finally{Math.random=random;}
}
const snapshot={...pencilOrders(4),...order,id:"pencils",skillId:"stifteBuendeln",level:4 as const};
const ask=renderToStaticMarkup(createElement(PencilOrders,{task:snapshot,status:"ask",onAnswer(){}}));
assert.ok(ask.includes("Beide Lieferscheine bestätigen")&&ask.includes("Lose Stifte je Schritt"));
const reveal=renderToStaticMarkup(createElement(PencilOrders,{task:snapshot,status:"reveal",onAnswer(){}}));
assert.ok(reveal.includes("So können die Lieferscheine aussehen")&&reveal.includes("Im Lager"));

