import { pick, randInt } from "./random";
import type { Level, StairTask } from "./types";

export const arrows={right:"→",left:"←",up:"↑",down:"↓"};
export const directionWords={right:"rechts",left:"links",up:"oben",down:"unten"};
export type Direction=keyof typeof arrows;
export type Square={x:number;y:number};
export const squareName=(p:Square)=>String.fromCharCode(65+p.x)+(p.y+1);
export const sameSquare=(a:Square,b:Square)=>a.x===b.x&&a.y===b.y;
export function moveSquare(square:Square,direction:Direction):Square{
  return {x:square.x+Number(direction==="right")-Number(direction==="left"),y:square.y+Number(direction==="down")-Number(direction==="up")};
}
export function walk(start:Square,directions:Direction[]){
  const points=[start];
  for(const direction of directions)points.push(moveSquare(points[points.length-1],direction));
  return points;
}
export function buildingBlocks(target:Direction[]){
  const blocks:Direction[][]=[];
  for(let size=1;size<=target.length/2;size++){
    if(target.length%size===0&&target.every((direction,i)=>direction===target[i%size]))blocks.push(target.slice(0,size));
  }
  return blocks;
}
export function runStep(target:Direction[],block:Direction[],repeats:number,completed:number){
  const total=block.length*repeats;
  if(completed>=target.length&&completed>=total)return "done";
  if(completed>=total)return "short";
  if(completed>=target.length)return "extra";
  return block[completed%block.length]===target[completed]?"match":"wrong";
}
export const nextGoal=(start:Square,target:Direction[],block:Direction[])=>walk(start,[...target,...block]).at(-1)!;

export function stairProgram(level:Level):Omit<StairTask,"id"|"level"|"skillId">{
  const horizontal=pick<Direction>(level<=2?["right"]:["right","left"]);
  const vertical=pick<Direction>(level===1?["up"]:["up","down"]);
  let unit=[horizontal,vertical];
  if(level>=3&&pick([true,false]))unit=[horizontal,horizontal,vertical];
  if(level>=2&&pick([true,false]))unit.reverse();
  const count=level===1?2:level===2?3:unit.length>2?pick([2,3,4]):level===3?4:pick([4,6]);
  const target=Array.from({length:count},()=>unit).flat();
  // Every equivalent block is a prefix of the target. Include its whole
  // extension so intermediate vertices and the new goal remain in bounds.
  const allPoints=buildingBlocks(target).flatMap(block=>walk({x:0,y:0},[...target,...block]));
  const xs=allPoints.map(point=>point.x),ys=allPoints.map(point=>point.y);
  const start={x:randInt(0,1)-Math.min(...xs),y:randInt(0,1)-Math.min(...ys)};
  const cols=start.x+Math.max(...xs)+randInt(1,2),rows=start.y+Math.max(...ys)+randInt(1,2);
  return {format:"stair-program",target,start,cols,rows,question:"Schreibe ein kurzes Programm für die Treppe.",
    hint:"Der gleiche Baustein soll die markierten Kanten mindestens zweimal hintereinander nachfahren.",
    solution:"Wiederhole denselben Baustein vom bisherigen Ziel aus noch einmal. Jeder Pfeil führt zum nächsten Rasterpunkt."};
}
