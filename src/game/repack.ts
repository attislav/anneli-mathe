import { pick } from "./random";
import type { Level, RepackTask } from "./types";

export type Packing = { boxes:number; fill:number; action:"split"|"merge" };
export type PackedGroup = { sources:number[]; cut?:number };
export function canRepack(pack:Packing) {
  return (pack.action==="split"?pack.fill:pack.boxes)%2===0;
}
export function targetPacking(pack:Packing) {
  if(!canRepack(pack)) return null;
  return pack.action==="split"?{boxes:pack.boxes*2,fill:pack.fill/2}:{boxes:pack.boxes/2,fill:pack.fill*2};
}
export function appendPacking(pack:Packing, groups:PackedGroup[], sources:number[], cut?:number):PackedGroup[] {
  if(new Set(sources).size!==sources.length || sources.some(id=>!Number.isInteger(id)||id<0||id>=pack.boxes||groups.some(group=>group.sources.includes(id)))) return groups;
  if(pack.action==="merge") {
    if(sources.length!==2) return groups;
  } else if(sources.length!==1||cut===undefined||Math.abs(pack.fill-2*cut)>1||!Number.isInteger(cut)||cut<=0||cut>=pack.fill) return groups;
  return [...groups,{sources,cut}];
}
export function materialChecked(pack:Packing,groups:PackedGroup[]) {
  return groups.length===(pack.action==="merge"?Math.floor(pack.boxes/2):canRepack(pack)?pack.boxes:1);
}
export function packingReason(pack:Packing) {
  return canRepack(pack)?"same":pack.action==="split"?"oddFill":"oddBoxes";
}
export function factorsFit(pack:Packing,boxes:string,fill:string) {
  const target=targetPacking(pack);
  return !!target && /^\d+$/.test(boxes) && /^\d+$/.test(fill) && Number(boxes)===target.boxes && Number(fill)===target.fill;
}
export function packingReport(pack:Packing) {
  const target=targetPacking(pack);
  if(target) return pack.boxes+" Schachteln mit je "+pack.fill+" Steinen werden zu "+target.boxes+
    (target.boxes===1?" Schachtel":" Schachteln")+" mit je "+target.fill+". "+pack.boxes+" × "+pack.fill+" = "+target.boxes+
    " × "+target.fill+". Alle "+pack.boxes*pack.fill+" Steine bleiben erhalten.";
  return pack.action==="split"?"In jeder Schachtel bleibt beim gleichmäßigen Teilen ein Stein übrig.":"Beim Bilden von Paaren bleibt eine Schachtel übrig.";
}
export function repack(level:Level,previous:Packing[]=[]):Omit<RepackTask,"id"|"level"|"skillId"> {
  const possibilities:Packing[]=[];
  for(const action of ["split","merge"] as const) {
    for(let boxes=2;boxes<=(level<=2?4:6);boxes++) for(let fill=2;fill<=(level<=2?6:8);fill++){
      possibilities.push({action,boxes,fill});
    }
  }
  const last=previous.at(-1);
  const first=pick(possibilities.filter(pack=>canRepack(pack) && pack.action!==last?.action
    && !previous.some(old=>old.boxes===pack.boxes && old.fill===pack.fill && old.action===pack.action)));
  const possible=pick([true,false]);
  const transfer=pick(possibilities.filter(pack=>pack.action!==first.action && canRepack(pack)===possible
    && (pack.boxes!==first.boxes || pack.fill!==first.fill)));
  return {format:"repack",first,transfer,question:"Anders gepackt, gleich viele",
    hint:"Beim Teilen bekommt jede neue Schachtel gleich viele Steine. Beim Zusammenlegen gehören immer zwei volle Schachteln zusammen.",
    solution:packingReport(first)+" Beim neuen Auftrag: "+packingReport(transfer)};
}
