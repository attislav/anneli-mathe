import { LabSession } from "./lab";
import { pick, uid } from "./random";
import { mapCoordinate } from "./siteMap";
import { activeProfileId } from "./state";
import type { ReadingTask } from "./types";

export const cornerCell=(n:number)=>mapCoordinate(3,n);
export const packs=[
  {label:"1 Kissen",cushions:1,baskets:0,price:3},{label:"2 Kissen",cushions:2,baskets:0,price:4},
  {label:"1 Bücherkorb",cushions:0,baskets:1,price:3},{label:"2 Bücherkörbe",cushions:0,baskets:2,price:5},
];
export const cornerSetup=()=>({shelf:pick([6,7,8]),window:pick([0,1,2]),stockC:pick([1,2,3]),stockB:pick([0,1,2]),budget:pick([20,22,24])});
export type CornerSetup=ReturnType<typeof cornerSetup>;
export const roomLabel=(s:CornerSetup,n:number)=>n===3?"Tür":n===4||n===5?"Laufweg":n===s.shelf?"Regal":n===s.window?"Fensterplatz":"frei";
export function layoutHint(s:CornerSetup,cells:number[]){
  if(cells.length<2||cells.length>3)return "Lege zwei oder drei Matten.";
  if(new Set(cells).size!==cells.length||cells.some(n=>!Number.isInteger(n)||n<0||n>8))return "Jede Matte braucht ihr eigenes Feld.";
  if(cells.some(n=>["Tür","Laufweg","Regal"].includes(roomLabel(s,n))))return "Tür, Laufweg und Regal müssen frei bleiben.";
  return cells.includes(s.window)?null:"Eine Matte soll am Fenster auf "+cornerCell(s.window)+" liegen.";
}
export const needs=(s:CornerSetup,mats:number)=>({cushions:Math.max(0,2*mats-s.stockC),baskets:Math.max(0,mats-s.stockB)});
export function purchase(counts:number[]){
  const totals={cushions:0,baskets:0,price:0};
  for(const [i,pack] of packs.entries()){
    totals.cushions+=counts[i]*pack.cushions;totals.baskets+=counts[i]*pack.baskets;totals.price+=counts[i]*pack.price;
  }
  return totals;
}
export function orderHint(s:CornerSetup,mats:number,counts:number[]){
  if(counts.length!==packs.length||counts.some(n=>!Number.isInteger(n)||n<0))return "Wähle ganze Packungen.";
  const need=needs(s,mats),order=purchase(counts);
  if(order.cushions<need.cushions)return "Es fehlen noch Kissen. Vergleiche deine Packungen mit dem Einkaufszettel.";
  if(order.baskets<need.baskets)return "Es fehlen noch Bücherkörbe.";
  return order.price>s.budget?"Diese Bestellung kostet mehr als euer Geld. Probiere andere Packungen.":null;
}
type Entry={step:1;cells:number[]}|{step:2;cushions:number;baskets:number}|{step:3;counts:number[];left:number};
const metadata=[
  ["lageplan",1,"Wo sollen eure Lesematten liegen?","Lies die Feldnamen und suche den Fensterplatz."],
  ["sachaufgaben",2,"Was fehlt für deine Leseecke?","Zähle die Plätze. Ziehe dann den Vorrat ab."],
  ["einkaufen",3,"Welche Packungen kaufst du?","Prüfe die Stückzahlen und ziehe den Preis deiner Bestellung vom Budget ab."],
] as const;
export class ReadingRound extends LabSession {
  cells:number[]=[];
  order:number[]=[];
  ownOrder=false;
  readonly examples=new Set<number>();
  private closed=false;
  constructor(owner:string,readonly setup=cornerSetup()){
    super(owner,3,n=>{
      const [skillId,level,question,hint]=metadata[n-1];
      const task:ReadingTask={id:uid(),format:"reading-corner",skillId,level,question,hint,solution:"Der Plan zeigt, womit ihr weiterarbeitet."};return task;
    });
  }
  close(){this.closed=true;}
  submit(id:string,entry:Entry){
    const {task,number,status}=this.state;
    if(this.closed||activeProfileId()!==this.owner||id!==task.id||number!==entry.step||status!=="ask")return this.state;
    const s=this.setup,need=needs(s,this.cells.length);
    let hint:string|null=null,validOrder=false;
    if(entry.step===1)hint=layoutHint(s,entry.cells);
    if(entry.step===2){
      if(entry.cushions!==need.cushions)hint="Für jedes Kind brauchst du ein Kissen. Ziehe die vorhandenen Kissen ab.";
      else if(entry.baskets!==need.baskets)hint="Für jede Matte brauchst du einen Bücherkorb. Wie viele fehlen nach dem Vorrat?";
    }
    if(entry.step===3){
      hint=orderHint(s,this.cells.length,entry.counts);
      validOrder=hint===null;
      if(validOrder&&entry.left!==s.budget-purchase(entry.counts).price)hint="Die Packungen passen. Rechne Budget minus Einkaufspreis.";
    }
    const next=super.answer(id,hint===null,hint??undefined);
    if(next.status==="right"||next.status==="reveal"){
      if(next.status==="reveal")this.examples.add(entry.step);
      if(entry.step===1)this.cells=hint?[s.window,(s.window+1)%3]:[...entry.cells];
      if(entry.step===3){
        this.ownOrder=validOrder;
        this.order=validOrder?[...entry.counts]:[need.cushions%2,Math.floor(need.cushions/2),need.baskets%2,Math.floor(need.baskets/2)];
      }
    }
    return next;
  }
}
