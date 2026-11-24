import { LabRound, LAB_TOPICS } from "./lab";
import { LAB_TOPIC_IDS, type LabTopic } from "./schoolSelection";
import { activeProfileId, needsProfilePick, readSave } from "./state";

export const reportTopics=(skill:string)=>LAB_TOPIC_IDS.filter(topic=>LAB_TOPICS[topic].skillId===skill);
const available=(owner:string)=>owner===activeProfileId() && !!readSave().profile && !needsProfilePick();

export class ReportPracticeRound extends LabRound {
  private isCurrent(){return current?.round===this && available(this.owner);}
  close(){if(current?.round===this)current=null;}
  override answer(taskId:string,correct:boolean,hint?:string) {
    return this.isCurrent() ? super.answer(taskId,correct,hint) : this.state;
  }
  override remember(taskId:string){return this.isCurrent() && super.remember(taskId);}
  override advance(taskId:string){return this.isCurrent()?super.advance(taskId):this.state;}
}

// Only the live tab can hand over a round. The URL contains neither profile
// nor report data and cannot recreate a used or reloaded handoff.
let current:{pending:boolean;owner:string;round:ReportPracticeRound}|null=null;
export function prepareReportPractice(owner:string,skill:string,topic:LabTopic) {
  if(!available(owner) || !reportTopics(skill).includes(topic) || !readSave().log.some(e=>e.s===skill))return null;
  const round=new ReportPracticeRound(topic,owner,1);
  current={pending:true,owner,round};
  return "/labor/berichtsaufgabe/?start="+encodeURIComponent(round.id);
}
export function pendingReportPractice(key:string|null,owner:string) {
  return current?.pending && current.round.id===key && current.owner===owner && available(owner)?current.round:null;
}
export function clearReportHandoff(key:string|null) {
  if(current && current.round.id===key)current.pending=false;
}
