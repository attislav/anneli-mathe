import { pick } from "./random";
import type { GrowthTask, Level } from "./types";

export type Family="row"|"foot"|"ribbon"|"wings"|"tower";
export const growthRules={
  row:{name:"Schlange",rule:"Verlängere die Reihe immer am rechten Ende um ein Kästchen.",gain:1},
  foot:{name:"Stiefel",rule:"Der Schaft links bleibt stehen. Verlängere die untere Reihe rechts um ein Kästchen.",gain:1},
  ribbon:{name:"Doppelband",rule:"Beide Reihen wachsen nach rechts. Hänge an jede Reihe ein Kästchen an.",gain:2},
  wings:{name:"Flügel",rule:"Der Rumpf in der Mitte bleibt stehen. Verlängere den linken und den rechten Flügel außen um je ein Kästchen.",gain:2},
  tower:{name:"Turm",rule:"Baue oben ein neues Stockwerk aus drei Kästchen. Der Fuß des Turms bleibt stehen.",gain:3},
};
type Plan=Pick<GrowthTask,"family"|"start"|"target">;
export type Point=[number,number];
export const pointKey=([x,y]:Point)=>x+","+y;
export const gridName=([x,y]:Point)=>String.fromCharCode(65+x)+(y+1);
export function figure(plan:Plan,n:number):Point[]{
  const size=plan.start+n-1;
  const line=(length:number,x:number,y:number):Point[]=>Array.from({length},(_,i)=>[x+i,y]);
  switch(plan.family){
    case "row":return line(size,0,0);
    case "foot":return [[0,0],...line(size,0,1)];
    case "ribbon":return [...line(size,0,0),...line(size,0,1)];
    case "wings":return [[4,1],...line(size*2+1,4-size,0)];
    case "tower":return Array.from({length:size},(_,i)=>line(3,0,4-i)).flat();
  }
}
export function boardSize(plan:Plan) {
  if(plan.family==="wings")return [9,2];
  if(plan.family==="tower")return [4,5];
  return [plan.start+3,plan.family==="row"?2:3];
}
export function newCells(plan:Plan){
  const prior=new Set(figure(plan,2).map(pointKey));
  return figure(plan,3).filter(p=>!prior.has(pointKey(p)));
}
export function figureHint(plan:Plan,selected:string[]){
  const expected=newCells(plan).map(pointKey);
  if(selected.length!==expected.length)return "Vergleiche Figur 1 und Figur 2. Wie viele Kästchen kommen bei jedem Schritt dazu?";
  if(new Set(selected).size!==expected.length||selected.some(key=>!expected.includes(key)))return "Die Anzahl passt. Schau auf die Bauvorschrift: An welchen Enden wächst die Figur?";
  return null;
}
export function growthResult(plan:Plan){
  const from=figure(plan,3).length,steps=plan.target-3,gain=growthRules[plan.family].gain;
  return {from,steps,gain,total:from+steps*gain};
}
export function numberHint(plan:Plan,steps:number,gain:number,total:number){
  const answer=growthResult(plan);
  if(steps!==answer.steps)return "Starte bei Figur 3. Zähle die Sprünge bis Figur "+plan.target+".";
  if(gain!==answer.gain)return "Schau auf deine neuen Kästchen in Figur 3. So viele kommen bei jedem Sprung dazu.";
  if(total!==answer.total)return "Beginne mit den Kästchen von Figur 3. Addiere den Zuwachs für jeden Sprung.";
  return null;
}
export function growingFigure(level:Level):Omit<GrowthTask,"id"|"level"|"skillId">{
  const families:Family[]=level===1?["row","foot"]:level===2?["foot","ribbon"]:level===3?["ribbon","wings"]:["wings","tower","ribbon"];
  const family=pick(families),start=pick([1,2]),target=level<=2?5:level===3?pick([5,6]):level===4?pick([6,7]):pick([7,8,9]);
  const plan={family,start,target},r=growthResult(plan);
  return {format:"growing-figure",...plan,question:"Wie wächst die Figur?",hint:growthRules[family].rule,
    solution:"Neu in Figur 3: "+newCells(plan).map(gridName).join(", ")+". Von Figur 3 bis Figur "+target+" sind es "+r.steps+" Schritte. "+r.from+" + "+r.steps+" × "+r.gain+" = "+r.total+" Kästchen."};
}
