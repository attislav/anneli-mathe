import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {countHint,dotWays,partHint,relocateDot} from "../src/game/dotWays";
import {DotResult,DotWays} from "../src/lesson/DotWays";

for(const level of [1,2,3,4,5] as const)for(const countRoll of [0,.25,.5,.75,.99])for(const layout of [0,.4,.8]){
  const original=Math.random;let board:ReturnType<typeof dotWays>,call=0;
  try{Math.random=()=>call++===0?countRoll:layout;board=dotWays(level);}finally{Math.random=original;}
  const {cols,dots}=board,n=dots.length;
  assert.equal(cols,level<3?5:10);assert.equal(new Set(dots).size,n);
  assert.ok(n>=4&&n<2*cols&&dots.every(k=>k>=0&&k<2*cols));
  for(let first=1;first<n;first++){
    let alternatives=0;
    for(let next=1;next<n;next++){
      const different=next!==first&&next!==n-first;
      assert.equal(partHint(dots,dots.slice(-next),first)===null,different);
      if(different)alternatives++;
    }
    assert.ok(alternatives>0);
  }
  assert.ok(partHint(dots,[]));assert.ok(partHint(dots,dots));assert.ok(partHint(dots,[dots[0],dots[0]]));
  const marked=[dots[0],dots.at(-1)!];
  assert.equal(countHint(dots,marked,n-2,n),null);
  assert.ok(countHint(dots,marked,n-1,n));assert.ok(countHint(dots,marked,n-2,n+1));
  const empty=Array.from({length:2*cols},(_,i)=>i).find(i=>!dots.includes(i))!;
  const moved=relocateDot(dots,dots[0],empty,cols);
  assert.equal(moved.length,n);assert.equal(new Set(moved).size,n);assert.ok(moved.includes(empty)&&!moved.includes(dots[0]));
  assert.deepEqual(relocateDot(dots,dots[0],dots[1],cols),dots);
}
const task={...dotWays(1),id:"ways",skillId:"punktZerlegen",level:1 as const,dots:[0,2,4,5,6,9]};
const initial=renderToStaticMarkup(createElement(DotWays,{task,status:"ask",onAnswer(){throw Error("unbewertete Schätzung");}}));
assert.ok(initial.includes("Ohne Schätzung starten")&&!initial.includes("Erste Zerlegung prüfen"));
const first={dots:task.dots,marked:[0,4]},second={dots:[0,2,3,4,5,8],marked:[8,2,3]};
const result=renderToStaticMarkup(createElement(DotResult,{task,first,second}));
assert.ok(result.includes("Dein Weg 1")&&result.includes("Dein Weg 2")&&result.includes("2 + 4 = 6")&&result.includes("3 + 3 = 6"));
assert.ok(result.includes("Reihe 2, Platz 4: markierter Punkt"));
const example=renderToStaticMarkup(createElement(DotResult,{task,first,second:{...second,marked:[0,2,3,8]}}));
assert.ok(example.includes("Dein Weg 1")&&example.includes("Ein Beispiel 2")&&example.includes("1 + 5 = 6"));

// Both fields in the component's initial state must preserve even an asymmetric layout.
const asymmetric={...task,dots:[0,1,2,3,5,6]};
const initialFields=renderToStaticMarkup(createElement(DotWays,{task:asymmetric,status:"reveal",onAnswer(){}}));
const filled=Array.from(initialFields.matchAll(/aria-label="Reihe (\d+), Platz (\d+): ([^"]+)"/g),
  m=>({pos:(Number(m[1])-1)*asymmetric.cols+Number(m[2])-1,on:m[3]!=="leer"}));
assert.equal(filled.length,20);
for(const start of [0,10])assert.deepEqual(filled.slice(start,start+10).filter(c=>c.on).map(c=>c.pos),asymmetric.dots);
const unchanged=renderToStaticMarkup(createElement(DotResult,{task:asymmetric,
  first:{dots:asymmetric.dots,marked:[0,1]},second:{dots:[...asymmetric.dots],marked:[0,5,6]}}));
assert.ok(unchanged.includes("Dein Weg 1")&&unchanged.includes("Dein Weg 2")&&unchanged.includes("2 + 4 = 6")&&unchanged.includes("3 + 3 = 6"));
