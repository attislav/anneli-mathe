export const surveyThemes = {
  fruit: { title: "Lieblingsobst", options: ["Äpfel","Birnen","Bananen","Trauben"] },
  play: { title: "Pausenspiele", options: ["Fangen","Verstecken","Seilspringen","Fußball"] },
  outing: { title: "Ausflugsziele", options: ["Zoo","Wald","Sportplatz","Schwimmbad"] },
};
type Theme = keyof typeof surveyThemes;
export type SurveyQuestion = "first"|"second"|"difference"|"tie";
export function newSurvey() {
  return { phase:"setup" as "setup"|"collect"|"author"|"pass"|"solve"|"done", theme:null as Theme|null,
    items:[] as string[], votes:[] as number[], kind:null as SurveyQuestion|null, input:"", message:"" };
}
export type LocalSurvey = ReturnType<typeof newSurvey>;
export type SurveyMove = { type:"theme"; value:Theme } | { type:"item"; value:string } | { type:"vote"; side:0|1 } |
  { type:"kind"; value:SurveyQuestion } | { type:"answer"; value:string } |
  { type:"start"|"undo"|"makeQuestion"|"edit"|"check"|"open"|"swap" };
export const surveyCounts = (s: LocalSurvey) => [s.votes.filter(v=>v===0).length,s.votes.filter(v=>v===1).length];
export function surveyPrompt(s: LocalSurvey, kind=s.kind) {
  if(kind==="tie") return "Haben beide Gruppen gleich viele Stimmen?";
  if(kind==="difference") return "Wie groß ist der Unterschied zwischen den beiden Stimmenzahlen?";
  return `Wie viele Stimmen hat „${s.items[kind==="second"?1:0]}“?`;
}
export function surveyResult(s: LocalSurvey) {
  const [a,b]=surveyCounts(s);
  if(s.kind==="tie") return a===b?"Ja":"Nein";
  return String(s.kind==="difference"?Math.abs(a-b):s.kind==="first"?a:b);
}
export function surveyMove(s:LocalSurvey, action:SurveyMove):LocalSurvey {
  switch(action.type) {
    case "theme":return s.phase==="setup" && s.theme!==action.value ? {...newSurvey(),theme:action.value} : s;
    case "item":
      if(s.phase!=="setup" || !s.theme || !surveyThemes[s.theme].options.includes(action.value))return s;
      return {...s,items:s.items.includes(action.value)?s.items.filter(v=>v!==action.value):s.items.length<2?[...s.items,action.value]:s.items};
    case "start":return s.phase==="setup" && s.items.length===2?{...s,phase:"collect"}:s;
    case "vote":return s.phase==="collect" && s.votes.length<99?{...s,votes:[...s.votes,action.side]}:s;
    case "undo":return s.phase==="collect"?{...s,votes:s.votes.slice(0,-1)}:s;
    case "makeQuestion":return s.phase==="collect" && s.votes.length>0?{...s,phase:"author",input:"",message:""}:s;
    case "edit":return s.phase==="author"?{...s,phase:"collect",input:"",message:""}:s;
    case "kind":return s.phase==="author"?{...s,kind:action.value,input:"",message:""}:s;
    case "answer":
      if(!s.kind || (s.phase!=="author" && s.phase!=="solve"))return s;
      if(s.kind==="tie" ? !["Ja","Nein"].includes(action.value) : !/^\d{0,2}$/.test(action.value))return s;
      return {...s,input:action.value,message:""};
    case "check":
      if(!s.kind || !s.input || (s.phase!=="author"&&s.phase!=="solve"))return s;
      if((s.kind==="tie"?s.input:String(Number(s.input)))!==surveyResult(s)) return {...s,message:
        s.kind==="tie"?"Vergleiche beide Stimmenzahlen. Sind sie gleich?" : s.kind==="difference"?"Zähle von der kleineren Stimmenzahl bis zur größeren weiter.":"Schau nur auf die Gruppe, nach der gefragt wird."};
      return {...s,phase:s.phase==="author"?"pass":"done",input:"",message:""};
    case "open":return s.phase==="pass"?{...s,phase:"solve"}:s;
    case "swap":return s.phase==="done"?newSurvey():s;
  }
}
