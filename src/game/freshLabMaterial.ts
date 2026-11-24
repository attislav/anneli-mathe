import { contentHash } from "./labNotes";
import { taskContentKey } from "./practice";
import type { Task } from "./types";

export const materialHash=(task:Task)=>contentHash(taskContentKey(task));
export function freshLabMaterial(generate:()=>Task,source:number,last?:number) {
  let fallback:Task|undefined;
  for(let attempt=0;attempt<10;attempt++){
    const task=generate(),hash=materialHash(task);
    if(hash!==source && hash!==last)return task;
    if(!fallback || hash!==last)fallback=task;
  }
  return fallback!;
}
