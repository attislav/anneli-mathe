import { pick } from "./random";
import type { EqualFenceTask, Level } from "./types";

export type Bed = { left: number; top: number; width: number; height: number };
export function bedBetween(first: number, last: number, grid: number): Bed {
  const x = first % grid, y = Math.floor(first / grid);
  const endX = last % grid, endY = Math.floor(last / grid);
  return {left: Math.min(x,endX), top: Math.min(y,endY), width: Math.abs(x-endX)+1, height: Math.abs(y-endY)+1};
}
export function bedCells(bed: Bed, grid: number) {
  return Array.from({length:bed.width * bed.height},(_,index) =>
    (bed.top + Math.floor(index/bed.width)) * grid + bed.left + index % bed.width);
}
export function sizeKey(bed: Pick<Bed,"width"|"height">) {
  return Math.min(bed.width,bed.height) + " × " + Math.max(bed.width,bed.height);
}
export function possibleBeds(fence: number): Bed[] {
  const beds:Bed[]=[];
  for(let width=1; width<=fence/4; width++) beds.push({left:0,top:0,width,height:fence/2-width});
  return beds;
}
export function outlineIssue(bed:Bed, fence:number, found:Bed[]) {
  const used=2*(bed.width+bed.height);
  if(used!==fence) return "An den vier Seiten liegen zusammen " + used + " Zaunstücke. Du hast " + fence + ". Setze die Ecken neu.";
  if(found.some(other=>sizeKey(other)===sizeKey(bed))) return "Diese Form hast du schon. Auch gedreht bleibt sie gleich. Probiere eine andere Seitenlänge.";
  return null;
}
export function measureBed(bed:Bed, grid:number, fence:number, marked:number[], count:string, found:Bed[]) {
  const issue=outlineIssue(bed,fence,found);
  if(issue) return issue;
  const cells=bedCells(bed,grid);
  if(marked.length!==cells.length || cells.some(cell=>!marked.includes(cell))) return "Markiere jedes Kästchen innerhalb des Zauns genau einmal.";
  if(!/^\d+$/.test(count) || Number(count)!==cells.length) return "Zähle die markierten Kästchen noch einmal, Reihe für Reihe.";
  return null;
}
export type BedInvestigation = { fence:10|12|14 } & ({ mode:"largest" } | { mode:"difference" } | { mode:"plants"; plants:number });
export const bedArea=(bed:Bed)=>bed.width*bed.height;
export const investigationKey=(job:BedInvestigation)=>[job.fence,job.mode,job.mode==="plants"?job.plants:""].join("/");
export function bedAnswer(job:BedInvestigation,beds:Bed[],answer:string) {
  if(job.mode==="largest") return possibleBeds(job.fence).every(required=>beds.some(bed=>sizeKey(bed)===sizeKey(required)))
    && beds.some(bed=>sizeKey(bed)===answer && bedArea(bed)===Math.max(...beds.map(bedArea)));
  if(beds.length!==2) return false;
  if(job.mode==="difference") return /^\d+$/.test(answer)&&Number(answer)===Math.abs(bedArea(beds[0])-bedArea(beds[1]));
  const fitting=beds.filter(bed=>bedArea(bed)>=job.plants);
  return fitting.length ? fitting.some(bed=>sizeKey(bed)===answer) : answer==="none";
}
export function equalFence(level:Level, previous:BedInvestigation[]=[]):BedInvestigation & Pick<EqualFenceTask,"format"|"question"|"hint"|"solution"> {
  const jobs:BedInvestigation[]=[];
  for(const fence of level<=2?[10,12] as const:[12,14] as const) {
    const beds=possibleBeds(fence);
    jobs.push({fence,mode:"largest"},{fence,mode:"difference"});
    for(const plants of [bedArea(beds[0]),bedArea(beds[0])+1,bedArea(beds.at(-1)!)]) jobs.push({fence,mode:"plants",plants});
  }
  const available=jobs.filter(job=>job.mode!==previous.at(-1)?.mode&&!previous.some(old=>investigationKey(old)===investigationKey(job)));
  const mode=pick([...new Set(available.map(job=>job.mode))]);
  const job=pick(available.filter(job=>job.mode===mode));
  return {format:"equal-fence",...job,question:job.mode==="largest"?"Welches Beet hat am meisten Platz?":
    job.mode==="difference"?"Um wie viele Kästchen unterscheiden sich deine Beete?":"In welches deiner Beete passen "+job.plants+" Pflanzen?",
    hint:"Baue zuerst ein ganz schmales Beet. Mache dann die kurze Seite um ein Kästchen länger. Wie muss sich die andere Seite ändern?",
    solution:"Vergleiche die gezählten Innenkästchen aller Rechtecke mit demselben Zaun."};
}
