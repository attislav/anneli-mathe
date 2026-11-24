import { LabSession, makeLabTask } from "./lab";
import { type LabNote, contentHash } from "./labNotes";
import { taskContentKey } from "./practice";
import { activeProfileId, readSave, update } from "./state";
import type { Task } from "./types";

export const noteHash=(t:Task)=>contentHash(taskContentKey(t));
export function removeLabNote(owner:string,shown:LabNote) {
  if(owner!==activeProfileId() || !readSave().labNotes.includes(shown))return;
  update(save=>({...save,labNotes:save.labNotes.filter(note=>note!==shown)}));
}
export function freshNoteTask(note:LabNote,generate=makeLabTask) {
  let fallback:Task|undefined;
  for(let attempt=0;attempt<10;attempt++) {
    const task=generate(note.topic,note.level), hash=noteHash(task);
    if(hash!==note.source && hash!==note.last)return task;
    if(!fallback || hash!==note.last)fallback=task;
  }
  return fallback!;
}
export class LabNoteRound extends LabSession {
  constructor(private readonly child:string,readonly note:LabNote) {
    super(child,1,()=>freshNoteTask(note));
  }
  finish(keep:boolean) {
    if(this.child!==activeProfileId() || this.state.status!=="done")return;
    update(save=>({...save,labNotes:save.labNotes.flatMap(n=>{
      if(n.topic!==this.note.topic || n.level!==this.note.level || n.source!==this.note.source || n.last!==this.note.last)return [n];
      return keep?[{...n,last:noteHash(this.state.task)}]:[];
    })}));
  }
}
