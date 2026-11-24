import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { geoBoard, pegHint } from "../src/game/geoBoard";
import { GeoBoard, GeoSolution } from "../src/lesson/GeoBoard";

for(const [width,height] of [[1,1],[2,2],[1,2],[1,3],[2,3]]) {
  const ways=new Set<string>();
  for(const [w,h] of [[width,height],[height,width]])for(let x=0;x<4-w;x++)for(let y=0;y<4-h;y++){
    const top=4*y+x;
    const corners=[top,top+w,top+4*h+w,top+4*h];
    for(const loop of [corners,[...corners].reverse()])for(let i=0;i<4;i++)ways.add([...loop.slice(i),...loop.slice(0,i)].join(","));
  }
  assert.ok(ways.size>8); // More than direction/start variations of one placement.
  for(let a=0;a<16;a++)for(let b=0;b<16;b++)for(let c=0;c<16;c++)for(let d=0;d<16;d++){
    const pts=[a,b,c,d];
    assert.equal(pegHint(pts,width,height)===null,ways.has(pts.join(",")));
  }
}
assert.match(pegHint([0,1,1,4],1,2)!,/eigenen Punkt/);
assert.match(pegHint([0,5,4,1],1,2)!,/kreuzt/);
assert.match(pegHint([0,1,2,4],1,2)!,/Linie/);
assert.match(pegHint([1,6,9,4],1,2)!,/schräg/);
const own=renderToStaticMarkup(createElement(GeoSolution,{title:"Rechteck",points:[6,14,13,5],width:1,height:2}));
assert.ok(own.includes("Deine Figur") && own.includes("C2 → C4 → B4 → B2 → C2") && own.includes("2, 1, 2, 1"));
const fallback=renderToStaticMarkup(createElement(GeoSolution,{title:"Quadrat",points:[6,14],width:2,height:2}));
assert.ok(fallback.includes("Ein Beispiel") && fallback.includes("A1 → C1 → C3 → A3 → A1"));
const task={...geoBoard(1),id:"pegs",level:1 as const,skillId:"figurenSpannen"};
const ask=renderToStaticMarkup(createElement(GeoBoard,{task,status:"ask",onAnswer(){}}));
assert.ok(ask.includes('aria-label="D4"') && ask.includes("Letzte Ecke zurücknehmen"));
