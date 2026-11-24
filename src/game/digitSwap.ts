import { randInt, shuffle } from "./random";
import type { Level, SwapTask } from "./types";

type Layout=Pick<SwapTask,"digits"|"min"|"max">;
export function swapLayoutHint(t:Layout,cards:number[]) {
  if(cards.length!==2 || cards[0]===cards[1] || cards.some(i=>!Number.isInteger(i)||i<0||i>=t.digits.length))
    return "Wähle zwei verschiedene Karten. Auch zwei Karten mit derselben Ziffer sind erlaubt.";
  const [a,b]=cards.map(i=>t.digits[i]), n=10*a+b;
  if(a===0 || b===0)return "Die 0 würde vor oder nach dem Tausch vorne liegen. Beide Zahlen sollen zweistellig sein.";
  if(n<t.min || n>t.max)return `Deine Startzahl soll zwischen ${t.min} und ${t.max} liegen. Prüfe die Zehnerkarte.`;
  return null;
}
export function swapValues(t:Layout,cards:number[]) {
  const [a,b]=cards.map(i=>t.digits[i]);
  return {start:10*a+b,end:10*b+a,tens:(b-a)*10,ones:a-b,relation:b>a?"größer":a>b?"kleiner":"gleich groß"};
}
export const signed=(n:number)=>n>0?"+"+n:n<0?"−"+Math.abs(n):"0";
export function swapChangeHint(t:Layout,cards:number[],tens:string,ones:string) {
  const {tens:dt,ones:du}=swapValues(t,cards);
  if(tens!==String(dt))return "Vergleiche die Zehnerwerte vor und nach dem Tausch. Jede Zehnerkarte zählt ihre Ziffer mal zehn.";
  return ones===String(du)?null:"Vergleiche die Einer. Werden es mehr, weniger oder bleiben es gleich viele?";
}
export function exampleCards(t:Layout) {
  for(const i of t.digits.keys())for(const j of t.digits.keys())if(!swapLayoutHint(t,[i,j]))return [i,j];
  throw new Error("Keine zweistellige Startzahl");
}
export function digitSwap(level:Level):Omit<SwapTask,"id"|"skillId"|"level"> {
  const a=randInt(1,level<=2?3:6), b=randInt(a+1,level<=2?5:8);
  const digits=shuffle(level<3?[a,a,b]:level<4?[a,b,b,9]:[a,a,b,9,0]);
  return {format:"digit-swap",digits,min:10*a,max:10*b+9,question:"Was passiert, wenn deine Ziffernkarten die Plätze tauschen?",
    hint:"Wähle zwei Karten. Schau zuerst, welche Ziffer beim Tauschen an den Zehnerplatz kommt.",
    solution:"Die neue Zehnerziffer entscheidet, ob die Zahl größer oder kleiner wird. Sind die Ziffern gleich, bleibt die Zahl gleich."};
}
