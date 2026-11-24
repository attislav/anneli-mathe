import { randInt, shuffle } from "./random";
import type { Level, RibbonTask } from "./types";

export const signs=[["●","Kreis"],["▲","Dreieck"],["★","Stern"],["◆","Raute"],["♥","Herz"],["■","Quadrat"]] as const;
export function repeatBand(unit:number[]) {return [...unit,...unit,...unit];}
export function smallestUnit(unit:number[]) {
  for(let size=1;size<unit.length;size++){
    if(unit.length%size===0 && unit.every((value,i)=>value===unit[i%size]))return unit.slice(0,size);
  }
  return unit;
}
export function ribbonHint(unit:number[],size:number,copies:number) {
  const band=repeatBand(unit);
  if(!Number.isInteger(size)||size<1||size>unit.length || !band.every((v,i)=>v===band[i%size]))
    return "Schau auf den Anfang. Kommen diese Zeichen immer in derselben Reihenfolge wieder?";
  if(size!==smallestUnit(unit).length)return "Dein Baustein wiederholt sich. Geht es auch mit weniger Zeichen?";
  if(copies*size!==band.length)return "Lege deinen Baustein vom ersten bis zum letzten Zeichen. Wie oft passt er genau?";
  return null;
}
export const missingIndex=(unit:number[],offset:number)=>unit.length+offset%(2*unit.length);
export function patternRibbon(level:Level):Omit<RibbonTask,"id"|"level"|"skillId"> {
  const min=level>=4?3:2, max=level===1?2:level===2?3:4;
  return {format:"pattern-ribbon",palette:shuffle(signs.map((_,i)=>i)).slice(0,Math.min(4,level+1)),min,max,offset:randInt(0,11),
    question:"Erfinde ein Musterband.",hint:"Beginne links. Suche die kürzeste Folge, die das ganze Band füllt.",
    solution:"Die Trennstriche zeigen den kürzesten Baustein. In jedem Baustein stehen dieselben Zeichen an derselben Stelle."};
}
