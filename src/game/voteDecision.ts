import { votesLabel } from "./pictogram";
import { pick, shuffle, uid } from "./random";
import type { DataRow, DecisionTask, SurveyTask, VoteChartTask } from "./types";

const options: Omit<DataRow,"value">[] = [
  {label:"Apfel",icon:"apfel"},{label:"Birne",icon:"birne"},{label:"Banane",icon:"banane"},{label:"Trauben",icon:"traube"},
];
const counts = [[4,2],[3,3],[3,2],[1,4],[2,4],[4,3],[5,2]] as const;
export function decisionResult(task: DecisionTask) {
  const changed = task.votes.map((category,i)=>i===task.ticket?1:category);
  const first = changed.filter(v=>v===0).length, second=changed.length-first;
  return {changed,first,second,winner:first===second?2:first>second?0:1};
}
export function decisionHint(task:DecisionTask,to:number,entries:string[],winner:number) {
  if(to!==1) return `Lege Zettel ${task.ticket+1} jetzt zu „${task.names[1]}“.`;
  const correct=decisionResult(task);
  if(entries.length!==2 || entries.some((v,i)=>!/^\d+$/.test(v)||Number(v)!==[correct.first,correct.second][i]))
    return "Ein Zettel wechselt die Gruppe. Eine Stimme geht weg, dieselbe Stimme kommt zur anderen Gruppe dazu.";
  return correct.winner===winner?null:"Vergleiche die neuen Stimmenzahlen. Bei zwei gleichen Zahlen gibt es einen Gleichstand.";
}
export function chartHint(task:VoteChartTask,built:number[]) {
  const wrong=task.amounts.findIndex((value,i)=>value!==built[i]);
  return wrong<0?null:`Prüfe „${task.names[wrong]}“. Ein ganzer Kreis zählt zwei Stimmen, ein halber Kreis eine.`;
}
export function voteTasks(pair:readonly [number,number]=pick(counts)): [SurveyTask, VoteChartTask, DecisionTask] {
  const categories=shuffle(options).slice(0,2), names=categories.map(c=>c.label);
  const votes=shuffle([...Array<number>(pair[0]).fill(0),...Array<number>(pair[1]).fill(1)]);
  const ticket=pick(votes.flatMap((v,i)=>v===0?[i]:[])), base={level:2 as const};
  const survey:SurveyTask={...base,id:uid(),format:"class-survey",skillId:"strichliste",categories,votes,target:0,compare:null,
    question:"Welches Obst wünschen sich die Kinder? Sortiere ihre Stimmzettel.",
    followUp:`Wie viele Stimmen hat „${names[0]}“?`,hint:"Lies jeden Zettel und lege ihn zu seiner Obstsorte.",
    solution:names.map((name,i)=>`${name}: ${votesLabel(pair[i])}.`).join(" ")};
  const chart:VoteChartTask={...base,id:uid(),format:"vote-chart",skillId:"bilddiagramme",names,amounts:[...pair],
    question:"Lege das Bilddiagramm zu deiner Umfrage.",hint:"Für jede Zweiergruppe brauchst du einen ganzen Kreis. Bleibt eine Stimme übrig, lege einen halben.",
    solution:names.map((name,i)=>{const full=Math.floor(pair[i]/2); return `${name}: ${full===1?"1 ganzer Kreis":full+" ganze Kreise"}${pair[i]%2?" und ein halber":""}.`;}).join(" ")};
  const decision:DecisionTask={...base,id:uid(),format:"vote-change",skillId:"diagramm",ticket,votes,names,icons:categories.map(c=>c.icon),
    question:"Ein Kind ändert seine Wahl. Welches Obst hat nun die meisten Stimmen?",
    hint:"Die Zahl der Kinder bleibt gleich. Nur ein Zettel wechselt seinen Platz.",solution:""};
  const {first,second,winner}=decisionResult(decision);
  decision.solution=`${names[0]}: ${votesLabel(first)}. ${names[1]}: ${votesLabel(second)}. ${winner===2?"Es gibt einen Gleichstand.":names[winner]+" hat mehr Stimmen."}`;
  return [survey, chart, decision];
}
