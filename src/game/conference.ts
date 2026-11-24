import { randInt } from "./random";

export type Problem={start:number;addend:number};
export type Jump={size:number;landing:number};
type Phase="first"|"pass"|"second"|"compare"|"done";
export type ConferenceState={
  phase:Phase;problem:Problem;paths:[Jump[],Jump[]];size:string;landing:string;
  marked:[number[],number[]];length:string;message:string;
};
export function newProblem():Problem{
  const start=randInt(12,78);
  return {start,addend:randInt(5,Math.min(30,100-start))};
}
export const freshConference=(problem:Problem=newProblem()):ConferenceState=>({
  problem,phase:"first",paths:[[],[]],size:"",landing:"",marked:[[],[]],length:"",message:"",
});
export const stops=(start:number,path:Jump[])=>[start,...path.map(jump=>jump.landing)];
const wholeNumber=(value:string)=>/^\d+$/.test(value);
export function jumpHint(problem:Problem,path:Jump[],size:string,landing:string){
  const previous=path.at(-1)?.landing??problem.start,end=problem.start+problem.addend;
  if(!wholeNumber(size)||Number(size)<1)return "Jeder Sprung geht mindestens eins vorwärts.";
  if(!wholeNumber(landing)||Number(landing)!==previous+Number(size))return "Starte bei "+previous+" und gehe deine Sprungweite vorwärts. Wo landest du?";
  if(Number(landing)>end)return "Mit diesem Sprung legst du insgesamt mehr als "+problem.addend+" zurück. Wähle einen kürzeren Sprung.";
  if(path.length===0&&Number(landing)===end)return "Teile den Weg in mindestens zwei Sprünge auf.";
  if(path.length>=5)return "Fünf Sprünge sind gelegt. Nimm einen zurück, um ihn zu ändern.";
  if(path.length===4&&Number(landing)<end)return "Das wäre der fünfte Sprung. Prüfe, wie viel von "+problem.addend+" insgesamt noch fehlt.";
  return null;
}
export function sectionHint(marked:[number[],number[]],length:string){
  const [first,second]=marked;
  if(first.length!==2||second.length!==2)return "Markiere in jedem Weg einen Anfang und ein Ende.";
  if(first[0]!==second[0]||first[1]!==second[1])return "Beide Abschnitte müssen bei derselben Zahl beginnen und bei derselben Zahl enden.";
  return wholeNumber(length)&&Number(length)===first[1]-first[0]?null:"Zähle von der Anfangszahl bis zur Endzahl oder addiere die Sprünge dazwischen.";
}
export type ConferenceAction=
  {type:"size"|"landing"|"length";value:string}|{type:"mark";path:0|1;value:number}|
  {type:"add"|"undo"|"finish"|"open"|"check"}|{type:"reset";problem:Problem};
export function conferenceMove(state:ConferenceState,action:ConferenceAction):ConferenceState{
  const {phase,paths,problem}=state;
  if(phase==="first"||phase==="second"){
    const index=phase==="first"?0:1,path=paths[index];
    const replace=(next:Jump[]):[Jump[],Jump[]]=>index===0?[next,paths[1]]:[paths[0],next];
    if(action.type==="size"||action.type==="landing")return {...state,[action.type]:action.value,message:""};
    if(action.type==="undo"&&path.length){
      const previous=path[path.length-1];
      return {...state,paths:replace(path.slice(0,-1)),size:String(previous.size),landing:String(previous.landing),message:""};
    }
    if(action.type==="add"){
      const message=jumpHint(problem,path,state.size,state.landing);
      if(message)return {...state,message};
      return {...state,paths:replace([...path,{size:Number(state.size),landing:Number(state.landing)}]),size:"",landing:"",message:""};
    }
    if(action.type==="finish"){
      if(path.length<2||path.at(-1)?.landing!==problem.start+problem.addend)return {...state,message:"Dein Weg braucht zwei bis fünf Sprünge. Zusammen sollen sie "+problem.addend+" ergeben."};
      return {...state,phase:phase==="first"?"pass":"compare",size:"",landing:"",message:""};
    }
  }
  if(phase==="pass"&&action.type==="open")return {...state,phase:"second"};
  if(phase==="compare"){
    if(action.type==="length")return {...state,length:action.value,message:""};
    if(action.type==="mark"&&stops(problem.start,paths[action.path]).includes(action.value)){
      const selected=state.marked[action.path],value=action.value;
      const next=selected.includes(value)?selected.filter(n=>n!==value):selected.length===2?[value]:[...selected,value].sort((a,b)=>a-b);
      return {...state,marked:action.path===0?[next,state.marked[1]]:[state.marked[0],next],length:"",message:""};
    }
    if(action.type==="check"){
      const message=sectionHint(state.marked,state.length);
      return message?{...state,message}:{...state,phase:"done",message:""};
    }
  }
  if(phase==="done"&&action.type==="reset")return freshConference(action.problem);
  return state;
}
