import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {foldCorner,cornerKind,cornerSetFits,drawShape,outlines,paperAxes,rightCorners,type CornerStudy,type Point} from "../src/game/foldCorner";
import {CornerPicture,FoldCorner} from "../src/lesson/FoldCorner";
const checks:{shape:Point[];right:number[]}[]=[
  {shape:[[0,0],[4,3],[1,7],[-3,4]],right:[0,1,2,3]},
  {shape:[[0,0],[5,0],[0,2]],right:[0]},
  {shape:[[0,0],[10,0],[1,40]],right:[]},
  {shape:[[0,0],[10,0],[-1,40]],right:[]},
];
assert.equal(cornerKind(checks[2].shape,0),"narrow");
assert.equal(cornerKind(checks[3].shape,0),"wide");
const quantities=new Set<number>();
for(const {shape,right} of checks){
  assert.deepEqual(rightCorners(shape),right);
  assert.ok(cornerSetFits(shape,[...right].reverse()));
  for(let mask=0;mask<2**shape.length;mask++){
    const marked=shape.flatMap((_,i)=>mask&(1<<i)?[i]:[]);
    assert.equal(cornerSetFits(shape,marked),marked.join()===right.join());
  }
}
for(const level of [1,2,3,4,5] as const)for(const seed of [0,.1,.25,.42,.61,.76,.91,.999]){
  const previous:CornerStudy[]=[];
  const random=Math.random;
  try{
    Math.random=()=>seed;
    for(let k=0;k<5;k++){
      const study=foldCorner(level,previous);
      assert.notEqual(study.tilted,previous.at(-1)?.tilted);
      assert.ok(!previous.some(old=>old.pair===study.pair));
      previous.push(study);
      quantities.add(rightCorners(study.second).length);
      for(const shape of [study.first,study.second]){
        const crosses:number[]=[];
        for(let i=0;i<shape.length;i++){
          const here=shape[i],a=shape[(i+1)%shape.length],b=shape[(i+shape.length-1)%shape.length];
          crosses.push(Math.sign((a[0]-here[0])*(b[1]-here[1])-(a[1]-here[1])*(b[0]-here[0])));
          for(const side of ["previous","next"] as const){
            const {along,across}=paperAxes(shape,i,side);
            assert.ok(Math.abs(along[0]*across[0]+along[1]*across[1])<1e-12);
            const other=side==="next"?b:a;
            assert.ok(across[0]*(other[0]-here[0])+across[1]*(other[1]-here[1])>0);
          }
        }
        assert.equal(new Set(crosses).size,1);assert.ok(!crosses.includes(0));
      }
    }
  }finally{Math.random=random;}
}
assert.ok(quantities.has(0)&&quantities.has(1)&&quantities.has(4));
const task={...foldCorner(4),id:"fold",level:4 as const,skillId:"winkelPruefen"};
const initial=renderToStaticMarkup(createElement(FoldCorner,{task,status:"ask",onAnswer(){}}));
assert.ok(initial.includes("Ecke für die Papierprobe")&&!initial.includes("Hier passt die Falt-Ecke genau"));
const solution=renderToStaticMarkup(createElement(FoldCorner,{task,status:"reveal",onAnswer(){}}));
assert.ok(solution.includes("Papierprobe an der ersten Figur")&&solution.includes("Rechte Ecken der zweiten Figur"));
const boards:Point[][]=[[[0,0],[60,0],[0,40]]];
for(const template of outlines)for(const tilted of [false,true])for(const scale of [1,2])for(const flip of [false,true])
  boards.push(drawShape(template,tilted,scale,flip));
for(const points of boards){
  let fixed="";
  for(let vertex=0;vertex<points.length;vertex++)for(const side of ["next","previous"] as const){
    const html=renderToStaticMarkup(createElement(CornerPicture,{points,vertex,side,marks:points.map((_,i)=>i)}));
    const box=/viewBox="([^"]+)"/.exec(html)![1];
    if(fixed)assert.equal(box,fixed);else fixed=box;
    const [left,top,width,height]=box.split(" ").map(Number),unit=width/100;
    function inside(x:number,y:number,horizontal:number,vertical:number){
      assert.ok(x-horizontal>=left&&x+horizontal<=left+width&&y-vertical>=top&&y+vertical<=top+height);
    }
    for(const [,coords] of html.matchAll(/<polygon points="([^"]+)"/g))for(const pair of coords.split(" ")){
      const [x,y]=pair.split(",").map(Number);inside(x,y,unit/2,unit/2);
    }
    for(const [,x,y] of html.matchAll(/<text x="([^"]+)" y="([^"]+)"/g))inside(Number(x),Number(y),unit*6.9,unit*3);
  }
}

