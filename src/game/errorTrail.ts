export const trailProblems=[
  [27,15],[48,24],[63,37],[42,-17],[25,-25],[71,-34],[39,12],[50,-28],
] as const;
type Phase="choose"|"author"|"plant"|"pass"|"solve"|"done";
type Row=0|1;
export type TrailState={phase:Phase; problem:number; inputs:[string,string]; row:Row|null; falseValue:string; mark:Row|null; message:string};
export type TrailAction={type:"pick";index:number}|{type:"number";row:Row;text:string}|{type:"row";row:Row}|{type:"fake";text:string}
  |{type:"check"|"open"|"reset"};
export function newTrail():TrailState {return {phase:"choose",problem:-1,inputs:["",""],row:null,falseValue:"",mark:null,message:""};}
export function operation(base:number,step:number){return `${base} ${step<0?"−":"+"} ${Math.abs(step)}`;}
export function trailValues(problem:number) {
  const [start,delta]=trailProblems[problem], tens=Math.trunc(delta/10)*10, ones=delta-tens;
  return {start,tens,ones,mid:start+tens,end:start+delta};
}
export function plantedValues(s:TrailState) {
  const {mid,ones}=trailValues(s.problem);
  const fake=Number(s.falseValue);
  return s.row===0?[fake,fake+ones]:[mid,fake];
}
export function trailMove(s:TrailState,a:TrailAction):TrailState {
  if(a.type==="reset")return newTrail();
  if(a.type==="pick")return s.phase==="choose" && trailProblems[a.index]
    ? {...newTrail(),phase:"author",problem:a.index}:s;
  if(a.type==="open")return s.phase==="pass"?{...s,phase:"solve",message:""}:s;
  if(a.type==="row") {
    if(s.phase==="plant")return {...s,row:a.row,falseValue:"",message:""};
    if(s.phase==="solve")return {...s,mark:a.row,inputs:["",""],message:""};
    return s;
  }
  if(a.type==="fake")return s.phase==="plant" && /^\d{0,3}$/.test(a.text)?{...s,falseValue:a.text,message:""}:s;
  if(a.type==="number") {
    if(!["author","solve"].includes(s.phase) || !/^\d{0,3}$/.test(a.text))return s;
    const inputs:[string,string]=[...s.inputs];inputs[a.row]=a.text;
    return {...s,inputs,message:""};
  }
  if(s.phase==="choose" || s.phase==="pass" || s.phase==="done")return s;
  const {mid,end}=trailValues(s.problem);
  if(s.phase==="plant") {
    if(s.row===null || s.falseValue==="")return {...s,message:"Wähle eine Zeile und erfinde ein falsches Ergebnis."};
    if(Number(s.falseValue)===[mid,end][s.row])return {...s,message:"Diese Zahl stimmt noch. Wähle absichtlich eine andere."};
    if(plantedValues(s).some(v=>v<0 || v>100))return {...s,message:"Wähle eine andere Zahl, damit beide Zeilen zwischen 0 und 100 bleiben."};
    return {...s,phase:"pass",inputs:["",""],mark:null,message:""};
  }
  if(s.phase==="solve" && s.mark!==s.row)return {...s,message:"Prüfe die Rechnungen von oben. Wo stimmt das Ergebnis zum ersten Mal nicht?"};
  if((s.phase==="author" || s.mark===0) && (s.inputs[0]==="" || Number(s.inputs[0])!==mid))return {...s,message:"Prüfe den ersten Schritt mit den Zehnern."};
  if(s.inputs[1]==="" || Number(s.inputs[1])!==end)return {...s,message:"Gehe vom richtigen Zwischenergebnis aus. Rechne jetzt mit den Einern weiter."};
  return s.phase==="author"?{...s,phase:"plant",message:""}:{...s,phase:"done",message:""};
}
