import { clueText, fitsClue } from "./numberDetective";
import { pick } from "./random";
import type { NumberClue } from "./types";

// Each column has the same final digit in three different rows. Every number
// can be isolated by its row's interval together with its final digit.
export const starts=[2,15,27,41,56,67,77] as const;
export function riddleNumbers(start:number){
  return Array.from({length:12},(_,index)=>start+10*Math.floor(index/4)+index%4);
}
export function draftIssue(numbers:number[],secret:number|null,clues:NumberClue[]){
  if(secret===null||!numbers.includes(secret))return "Wähle zuerst deine Geheimzahl.";
  if(clues.length<2||clues.length>3)return "Dein Rätsel braucht zwei oder drei Hinweise.";
  for(const [index,clue] of clues.entries()){
    if(!fitsClue(secret,clue))return "Hinweis "+(index+1)+" passt nicht zu deiner "+secret+": "+clueText(clue);
    if(numbers.filter(number=>fitsClue(number,clue)).length===1)return "Hinweis "+(index+1)+" verrät die "+secret+" schon alleine. Mach ihn weniger genau.";
  }
  const other=numbers.find(number=>number!==secret&&clues.every(clue=>fitsClue(number,clue)));
  if(other===undefined)return null;
  const correction=clues.length===3?"Entferne einen deiner drei Hinweise und ersetze ihn durch einen genaueren.":
    "Ändere einen Hinweis oder ergänze einen dritten.";
  return "Auch die "+other+" passt zu allen Hinweisen. "+correction;
}
export function nearMisses(numbers:number[],clues:NumberClue[]){
  return numbers.filter(number=>clues.some(clue=>fitsClue(number,clue))&&clues.some(clue=>!fitsClue(number,clue)));
}
export type RiddleState={
  phase:"write"|"ready"|"pass"|"solve"|"explain"|"done";
  numbers:number[];secret:number|null;clues:NumberClue[];near:number|null;guess:number|null;reason:number|null;message:string;
};
export const freshRiddle=(start:number=pick(starts)):RiddleState=>({
  phase:"write",numbers:riddleNumbers(start),secret:null,clues:[],near:null,guess:null,reason:null,message:"",
});
export type RiddleAction={type:"secret"|"guess"|"reason"|"remove";value:number}|{type:"add";clue:NumberClue}
  |{type:"check"|"edit"|"pass"|"open"|"solve"|"explain"}|{type:"reset";start:number};
export function riddleMove(state:RiddleState,action:RiddleAction):RiddleState{
  const {phase,numbers,secret,clues}=state;
  if(phase==="write"){
    if(action.type==="secret"&&numbers.includes(action.value))return {...state,secret:action.value,message:""};
    if(action.type==="remove")return {...state,clues:clues.filter((_,i)=>i!==action.value),message:""};
    if(action.type==="add"){
      if(clues.length>=3)return {...state,message:"Du hast drei Hinweise. Entferne einen, um einen neuen zu bauen."};
      if(clues.some(clue=>clueText(clue)===clueText(action.clue)))return {...state,message:"Diesen Hinweis hast du schon."};
      return {...state,clues:[...clues,action.clue],message:""};
    }
    if(action.type==="check"){
      const message=draftIssue(numbers,secret,clues);
      if(message)return {...state,message};
      // Prefer a close numerical neighbour among the numbers which fit some
      // clues. It can violate more than one clue, each of which is accepted.
      const near=nearMisses(numbers,clues).sort((a,b)=>Math.abs(a-secret!)-Math.abs(b-secret!))[0];
      return {...state,phase:"ready",near,message:""};
    }
  }
  if(phase==="ready"&&action.type==="edit")return {...state,phase:"write",near:null,message:""};
  if(phase==="ready"&&action.type==="pass")return {...state,phase:"pass",message:""};
  if(phase==="pass"&&action.type==="open")return {...state,phase:"solve"};
  if(phase==="solve"&&action.type==="guess"&&numbers.includes(action.value))return {...state,guess:action.value,message:""};
  if(phase==="solve"&&action.type==="solve"){
    if(state.guess===null)return {...state,message:"Wähle eine Zahl."};
    const wrong=clues.find(clue=>!fitsClue(state.guess!,clue));
    return wrong?{...state,message:"Prüfe deine Zahl mit diesem Hinweis: "+clueText(wrong)}:{...state,phase:"explain",message:""};
  }
  if(phase==="explain"&&action.type==="reason"&&clues[action.value])return {...state,reason:action.value,message:""};
  if(phase==="explain"&&action.type==="explain"&&state.reason!==null&&state.near!==null){
    return fitsClue(state.near,clues[state.reason])?{...state,message:"Dieser Hinweis passt auch zur "+state.near+". Suche einen, der sie ausschließt."}:
      {...state,phase:"done",message:""};
  }
  if(phase==="done"&&action.type==="reset")return freshRiddle(action.start);
  return state;
}
