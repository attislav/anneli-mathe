import { pick } from "./random";
import type { CornerTask,Level } from "./types";

export type Point=[number,number];
export type CornerKind="right"|"narrow"|"wide";
export type CornerStudy={first:Point[];second:Point[];tilted:boolean;pair:string};
export const outlines:Point[][]=[
  [[0,0],[6,0],[6,4],[0,4]],           // rectangle: four
  [[0,0],[6,0],[0,4]],                 // right triangle: one
  [[0,0],[6,0],[3,5]],                 // acute triangle: none
  [[0,0],[7,0],[5,4],[0,4]],           // right trapezoid: two
  [[0,0],[6,0],[8,4],[2,4]],           // parallelogram: none
  [[0,0],[7,0],[1,6]],                 // close to a right angle
  [[0,0],[2,0],[6,3],[2,6],[-1,4]],    // pentagon
];
export const cornerName=(i:number)=>String.fromCharCode(65+i);
export function cornerKind(points:Point[],i:number):CornerKind{
  const [x,y]=points[i],before=points[(i+points.length-1)%points.length],after=points[(i+1)%points.length];
  const dot=(before[0]-x)*(after[0]-x)+(before[1]-y)*(after[1]-y);
  return dot===0?"right":dot>0?"narrow":"wide";
}
export function rightCorners(points:Point[]){
  return points.flatMap((_,i)=>cornerKind(points,i)==="right"?[i]:[]);
}
export function cornerSetFits(points:Point[],marks:number[]){
  const expected=rightCorners(points);
  return marks.length===expected.length&&expected.every(i=>marks.includes(i));
}
// Rotate with an integer similarity so every right angle retains an exact zero dot product.
export function drawShape(template:Point[],tilted:boolean,scale:number,flip:boolean):Point[]{
  return template.map(([x,y])=>{
    const u=flip?-x:x;
    return tilted?[(4*u-3*y)*scale,(3*u+4*y)*scale]:[5*u*scale,5*y*scale];
  });
}
export function paperAxes(points:Point[],i:number,side:"next"|"previous"){
  const center=points[i],n=points.length;
  const base=points[(i+(side==="next"?1:n-1))%n],other=points[(i+(side==="next"?n-1:1))%n];
  const dx=base[0]-center[0],dy=base[1]-center[1],length=Math.hypot(dx,dy);
  const sign=Math.sign(dx*(other[1]-center[1])-dy*(other[0]-center[0]));
  return {along:[dx/length,dy/length],across:[-sign*dy/length,sign*dx/length]};
}
export function paperPolygon(points:Point[],vertex:number,side:"next"|"previous"):Point[] {
  const center=points[vertex],axes=paperAxes(points,vertex,side);
  const distances=points.map((a,i)=>{
    const j=(i+1)%points.length,b=points[j];
    const dx=b[0]-a[0],dy=b[1]-a[1], edgeLength=Math.hypot(dx,dy);
    if(i===vertex||j===vertex)return edgeLength;
    return Math.abs(dx*(center[1]-a[1])-dy*(center[0]-a[0]))/edgeLength;
  });
  const length=Math.min(...distances)*0.62;
  return [[0,0],[1,0],[1,1],[0,1]].map(([a,b])=>[
    center[0]+length*(a*axes.along[0]+b*axes.across[0]),
    center[1]+length*(a*axes.along[1]+b*axes.across[1])
  ]);
}
export function paperView(points:Point[]) {
  const corners=points.flatMap((_,i)=>[...paperPolygon(points,i,"previous"),...paperPolygon(points,i,"next")]);
  const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  // Reserve 12% on each side for the outward label offset, check mark and line widths.
  const span=Math.max(48,maxX-minX,maxY-minY)/0.76;
  return {left:(minX+maxX-span)/2,top:(minY+maxY-span)/2,span};
}
export function foldCorner(level:Level,previous:CornerStudy[]=[]):Omit<CornerTask,"id"|"level"|"skillId">{
  const tilted=previous.length?!previous.at(-1)!.tilted:pick([true,false]);
  const pool=outlines.slice(0,level<=2?5:outlines.length);
  const choices:{template:Point[];transfer:Point[];pair:string}[]=[];
  for(const [i,template] of pool.entries())for(const [j,transfer] of pool.entries()){
    const pair=i+"/"+j;
    if(i!==j && !previous.some(old=>old.pair===pair)) choices.push({template,transfer,pair});
  }
  const {template,transfer,pair}=pick(choices);
  const first=drawShape(template,tilted,pick([1,2]),pick([true,false]));
  const second=drawShape(transfer,!tilted,pick([1,2]),pick([true,false]));
  return {format:"fold-corner",first,second,tilted,pair,question:"Prüfe eine Ecke mit deiner Falt-Ecke.",
    hint:"Lege eine Papierkante auf eine Seite der Figur. Schau am anderen Rand der Papierecke, wie weit die Figur reicht.",
    solution:"Die markierten Buchstaben zeigen alle Ecken, an denen die Falt-Ecke genau passt."};
}
