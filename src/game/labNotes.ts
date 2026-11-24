import { LAB_TOPIC_IDS, type LabTopic } from "./schoolSelection";
import type { Level } from "./types";

export type LabNote={topic:LabTopic;level:Level;source:number;last?:number};
const hashValue=(n:unknown):n is number=>typeof n==="number" && Number.isInteger(n) && n>=0 && n<=0xffffffff;

export function normalizeNotes(raw:unknown):LabNote[] {
  if(!Array.isArray(raw))return [];
  const notes=new Map<LabTopic,LabNote>();
  for(const item of raw) {
    if(!item || !LAB_TOPIC_IDS.includes(item.topic) || !Number.isInteger(item.level) || item.level<1 || item.level>5 || !hashValue(item.source))continue;
    notes.set(item.topic,{topic:item.topic,level:item.level,source:item.source,...hashValue(item.last)?{last:item.last}:{}});
  }
  return [...notes.values()];
}
export function contentHash(key:string) {
  let hash=2166136261;
  for(let i=0;i<key.length;i++)hash=Math.imul(hash^key.charCodeAt(i),16777619);
  return hash>>>0;
}
