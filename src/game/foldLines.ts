import { pick, randInt } from "./random";
import type { FoldTask, Level } from "./types";

export type FoldLine="vertical"|"horizontal"|"down"|"up";
export const lineNames:Record<FoldLine,string>={
  vertical:"Senkrecht ↕", horizontal:"Waagerecht ↔", down:"Schräg von links oben ↘", up:"Schräg von links unten ↗",
};
const templates=[
  [".##.","###.","..#.","...."], // no central symmetry
  [".##.","####",".##.",".##."],
  [".##.",".##.",".##.",".##."],
  [".##.","####","####",".##."],
  ["##..","###.",".##.","...."],
  ["##..","###.",".###","..##"],
];
export function mirrorCell(cell:number,size:number,line:FoldLine) {
  const row=Math.floor(cell/size), col=cell%size, end=size-1;
  if(line==="vertical")return row*size+end-col;
  if(line==="horizontal")return (end-row)*size+col;
  if(line==="down")return col*size+row;
  return (end-col)*size+end-row;
}
export const foldCellName=(index:number,size:number)=>String.fromCharCode(65+index%size)+(Math.floor(index/size)+1);
export function foldProbe(t:Pick<FoldTask,"size"|"filled">,line:FoldLine) {
  const image=new Set(t.filled.map(i=>mirrorCell(i,t.size,line)));
  return Array.from({length:t.size*t.size},(_,i)=>{
    const before=t.filled.includes(i),after=image.has(i);
    return before?(after?"both":"only-original"):(after?"only-image":"empty");
  });
}
export function fitsFold(t:Pick<FoldTask,"size"|"filled">,line:FoldLine) {
  return t.filled.every(i=>t.filled.includes(mirrorCell(i,t.size,line)));
}
export function foldHint(t:FoldTask,chosen:FoldLine[]) {
  const wrong=t.lines.find(l=>chosen.includes(l)!==fitsFold(t,l));
  return wrong?`Prüfe „${lineNames[wrong]}“ noch einmal. Liegt nach dem Spiegeln jedes Kästchen auf der Figur?`:null;
}
export function foldLines(level:Level):Omit<FoldTask,"skillId"|"level"|"id"> {
  const source=pick(level<=2?templates.slice(0,4):templates), size=4;
  const turns=randInt(0,3);
  const filled=source.join("").split("").flatMap((s,i)=>{
    if(s!== "#")return [];
    for(let k=0;k<turns;k++)i=(i%size)*size+size-1-Math.floor(i/size);
    return [i];
  }).sort((a,b)=>a-b);
  const lines:FoldLine[]=level<=2?["vertical","horizontal"]:["vertical","horizontal","down","up"];
  const fitting=lines.filter(l=>fitsFold({size,filled},l));
  return {format:"fold-lines",size,filled,lines,question:"Welche der gezeigten Linien passen als Faltlinien?",
    hint:"Denke dir die Kästchen über die Linie gespiegelt. Bei einer passenden Linie decken sich Figur und Spiegelbild überall.",
    solution:fitting.length?"Passende Faltlinien: "+fitting.map(l=>lineNames[l]).join(", ")+".":"Keine der gezeigten Linien passt zur Figur."};
}
