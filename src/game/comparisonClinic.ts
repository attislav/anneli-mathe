import {LabSession} from "./lab";
import {pick,uid} from "./random";
import type {ComparisonTask} from "./types";

export type Comparison = {names:[string,string]; small:number; gap:number; more:boolean; knownFirst:boolean; optionOrder:number[]};
export const largeName=(c:Comparison)=>c.names[c.more?0:1];
export function missingValue(c:Comparison){
  const knownIsLarge=c.more===c.knownFirst;
  return knownIsLarge?c.small:c.small+c.gap;
}
export function inverseOptions(c:Comparison){
  const [a,b]=c.names, opposite=c.more?"weniger":"mehr";
  return [b+" hat "+c.gap+" Sticker "+opposite+" als "+a+".",b+" hat "+c.gap+" Sticker "+(c.more?"mehr":"weniger")+" als "+a+".",
    b+" hat "+(c.gap+1)+" Sticker "+opposite+" als "+a+"."];
}
export function comparisonText(c:Comparison){
  const [a,b]=c.names,known=c.knownFirst?a:b;
  const amount=c.more===c.knownFirst?c.small+c.gap:c.small;
  return a+" hat "+c.gap+" Sticker "+(c.more?"mehr":"weniger")+" als "+b+". "+known+" hat "+amount+" Sticker. Wie viele hat "+(c.knownFirst?b:a)+"?";
}
export function comparisonHint(c:Comparison,large:string,marks:number[],value:string,inverse:number,model:boolean){
  if(large!==largeName(c))return "Lies den Vergleich langsam. Wer hat am Ende ein paar Sticker mehr?";
  if(marks.length!==c.gap||!Array.from({length:c.gap},(_,i)=>i).every(i=>marks.includes(i)))return "Markiere den Unterschied direkt hinter dem gleich langen Teil, Kästchen für Kästchen.";
  if(!/^\d+$/.test(value)||Number(value)!==missingValue(c))return "Die kürzere Reihe und die zusätzlichen Sticker ergeben zusammen die längere Reihe.";
  return model||inverse===0?null:"Beginne den Satz beim anderen Kind. Aus mehr wird weniger und aus weniger wird mehr.";
}
export const models:Comparison[]=[
  {names:["Lea","Tom"],small:10,gap:4,more:true,knownFirst:true,optionOrder:[0,1,2]},
  {names:["Noah","Ada"],small:9,gap:5,more:false,knownFirst:true,optionOrder:[2,0,1]},
];
export function comparisonTransfer(previous:Comparison=models[0]):ComparisonTask{
  const names=pick(([["Ida","Ben"],["Omar","Jana"],["Mia","Luis"],["Evi","Nils"]] as [string,string][])
    .filter(pair=>pair.every(name=>!previous.names.includes(name))));
  const combinations=[[true,true],[false,true],[false,false],[true,false]];
  const index=combinations.findIndex(([more,known])=>more===previous.more&&known===previous.knownFirst);
  const [more,knownFirst]=models.includes(previous)?pick(combinations.filter((_,i)=>i!==index)):combinations[(index+1)%4];
  const options:{small:number;gap:number}[]=[];
  for(let small=5;small<=13;small++)for(let gap=2;gap<=6;gap++)
    if(small!==previous.small && gap!==previous.gap && small+gap!==previous.small+previous.gap)options.push({small,gap});
  const c={names,...pick(options),more,knownFirst,optionOrder:pick([[1,0,2],[2,1,0],[0,2,1]])};
  return {...c,id:uid(),format:"comparison-story",skillId:"sachaufgaben",level:1,question:comparisonText(c),
    hint:"Wer hat mehr? Ordne die Namen zu. Die Kästchen am Ende zeigen den Unterschied.",
    solution:inverseOptions(c)[0]+" "+names[knownFirst?1:0]+" hat "+missingValue(c)+" Sticker."};
}
export class ComparisonRound extends LabSession{
  private closed=false;
  constructor(owner:string,readonly exercise=comparisonTransfer()){super(owner,1,()=>exercise);}
  close(){this.closed=true;}
  override answer(id:string,correct:boolean,hint?:string){return this.closed?this.state:super.answer(id,correct,hint);}
}
