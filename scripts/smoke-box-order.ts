import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {boxes,boxOrder,decisionHint,evidence,lighter,neededPair,rankingHint,weigh,type Box,type Observation,type Pair} from "../src/game/boxOrder";
import {BoxOrder} from "../src/lesson/BoxOrder";

const permutations=boxes.flatMap(first=>boxes.filter(box=>box!==first).map(second=>
  [first,second,boxes.find(box=>box!==first&&box!==second)!]));
const unorderedPairs:Pair[]=[["A","B"],["A","C"],["B","C"]];
function compatible(observations:Observation[]){
  return permutations.filter(order=>observations.every(observation=>
    order.indexOf(lighter(observation))<order.indexOf(observation.heavier)));
}
for(const order of permutations)for(const scenario of ["chain","shared-heavy","shared-light"] as const){
  for(let mask=0;mask<8;mask++){
    const pairs=evidence(order,scenario);
    const initial=pairs.map(([left,right],i)=>weigh(order,mask&(1<<i)?[right,left]:[left,right]));
    if(mask&4)initial.reverse();
    const candidates=compatible(initial),missing=neededPair(initial);
    assert.equal(candidates.length,scenario==="chain"?1:2);
    assert.equal(decisionHint(initial,"enough")===null,candidates.length===1);
    for(const pair of unorderedPairs){
      // A useful third weighing must distinguish the two surviving rankings.
      const predictions=new Set(candidates.map(candidate=>candidate.indexOf(pair[0])>candidate.indexOf(pair[1])));
      assert.equal(decisionHint(initial,pair)===null,predictions.size===2);
      assert.equal(decisionHint(initial,[pair[1],pair[0]])===null,predictions.size===2);
    }
    const all=missing?[...initial,weigh(order,missing)]:initial;
    assert.deepEqual(compatible(all),[order]);
    for(let first=0;first<all.length;first++)for(let second=first+1;second<all.length;second++){
      const sufficient=compatible([all[first],all[second]]).length===1;
      for(const proposed of permutations){
        assert.equal(rankingHint(order,proposed,[first,second],all)===null,sufficient&&proposed.join()===order.join());
      }
    }
    assert.ok(rankingHint(order,order,[0,0],all));
  }
}
const order:Box[]=["B","A","C"];
const task={...boxOrder(4),id:"boxes",skillId:"gewichteOrdnen",level:4 as const,order,
  observations:[weigh(order,["C","B"]),weigh(order,["A","C"])]};
const view=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(BoxOrder,{task,status,onAnswer(){}}));
const ask=view("ask"),reveal=view("reveal");
assert.ok(ask.includes("Kiste B ist leichter als Kiste C.")&&ask.includes("Kiste A ist leichter als Kiste C."));
const slopes=[...ask.matchAll(/<line x1="51" y1="(\d+)" x2="189" y2="(\d+)"/g)].map(match=>Number(match[1])-Number(match[2]));
assert.ok(slopes[0]>0&&slopes[1]<0);
assert.ok(!ask.includes("Wägung 3")&&!ask.includes("Gramm")&&!ask.includes("Reihenfolge prüfen"));
assert.ok(reveal.includes("Wägung 3 · Beispiel")&&reveal.includes("Kiste B ist leichter als Kiste A."));
