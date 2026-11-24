import { LabSession, makeLabTask } from "./lab";
import type { LabNote } from "./labNotes";
import { freshLabMaterial, materialHash as noteHash } from "./freshLabMaterial";
import { activeProfileId, readSave, update } from "./state";
export { noteHash };
export function removeLabNote(owner:string,shown:LabNote) {
  if(owner!==activeProfileId() || !readSave().labNotes.includes(shown))return;
  update(save=>({...save,labNotes:save.labNotes.filter(note=>note!==shown)}));
}
export function freshNoteTask(note:LabNote,generate=makeLabTask) {
  return freshLabMaterial(()=>generate(note.topic,note.level),note.source,note.last);
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
