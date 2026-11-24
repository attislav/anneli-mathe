import {LabSession} from "./lab";
import {pick,shuffle,uid} from "./random";
import {activeProfileId} from "./state";
import type {TheaterTask} from "./types";

export const seats=Array.from({length:12},(_,index)=>index);
export type Theater={occupied:number[];names:string[];affectsBooking:boolean};
export function createTheater():Theater{
  return {occupied:shuffle(seats).slice(0,2),names:shuffle(["Mila","Ben","Lina","Noah","Ada","Amir"]).slice(0,3),affectsBooking:pick([true,false])};
}
export const seatRow=(seat:number)=>Math.floor(seat/4)+1;
export const seatNumber=(seat:number)=>seat%4+1;
export const seatLabel=(seat:number)=>"Reihe "+seatRow(seat)+", Platz "+seatNumber(seat);
export function seatIssue(room:Theater,plan:number[],closed=-1) {
  if(plan.length!==3||plan.some(seat=>!seats.includes(seat)))return "Gib jeder Person einen Platz.";
  if(new Set(plan).size!==3)return "Jede Person braucht einen eigenen Sitz.";
  if(plan.some(seat=>room.occupied.includes(seat)||seat===closed))return "Ein gewählter Sitz ist schon belegt oder gesperrt.";
  if(Math.floor(plan[0]/2)!==Math.floor(plan[1]/2))return room.names[0]+" und "+room.names[1]+" möchten in derselben Reihe direkt nebeneinander sitzen, auf derselben Seite des Gangs.";
  if(![2,3].includes(seatNumber(plan[2])))return room.names[2]+" möchte direkt am Mittelgang sitzen, auf Platz 2 oder 3.";
  return null;
}
export function exampleSeating(room:Theater,closed=-1,old:number[]=[]){
  let best:number[]|undefined, bestKept=-1;
  for(const first of seats)for(const second of seats)for(const third of seats){
    const plan=[first,second,third];
    if(seatIssue(room,plan,closed))continue;
    const kept=plan.filter((seat,i)=>seat===old[i]).length;
    if(kept>bestKept){best=plan;bestKept=kept;}
  }
  if(!best)throw new Error("Es fehlen freie Theatersitze.");
  return best;
}
type Entry={step:1;plan:number[]}|{step:2;tickets:{row:number;seat:number}[]}|{step:3;keep:boolean;plan:number[]};
export class TheaterRound extends LabSession{
  original:number[]=[]; final:number[]=[]; closedSeat=-1;
  readonly revealed=new Set<number>();
  private closed=false;
  constructor(owner:string,readonly room=createTheater()){
    super(owner,3,number=>{
      const task:TheaterTask={id:uid(),level:number===3?2:1,skillId:"lageplan",format:"class-theater",
        question:["Wo sitzen die drei im Theater?","Stelle die drei Eintrittskarten aus.","Passen die Eintrittskarten noch?"][number-1],
        hint:"Lies zuerst die Reihe und dann den Platz. Der Mittelgang liegt zwischen Platz 2 und 3.",
        solution:"Im Sitzplan und auf den Eintrittskarten siehst du eine passende Buchung."};
      return task;
    });
  }
  close(){this.closed=true;}
  submit(id:string,entry:Entry){
    const {task,number,status}=this.state;
    if(this.closed||activeProfileId()!==this.owner||number!==entry.step||task.id!==id||status!=="ask")return this.state;
    let issue:string|null=null;
    if(entry.step===1)issue=seatIssue(this.room,entry.plan);
    else if(entry.step===2){
      const wrong=this.original.findIndex((seat,i)=>seatRow(seat)!==entry.tickets[i]?.row||seatNumber(seat)!==entry.tickets[i]?.seat);
      if(wrong!==-1)issue="Suche "+this.room.names[wrong]+" im Sitzplan. Lies Reihe und Platz für diese Karte ab.";
    }else{
      const canKeep=!this.original.includes(this.closedSeat);
      if(entry.keep!==canKeep)issue="Vergleiche den gesperrten Sitz mit jeder deiner drei Karten.";
      else if(!entry.keep)issue=seatIssue(this.room,entry.plan,this.closedSeat);
    }
    const next=super.answer(id,!issue,issue??undefined);
    if(next.status!=="right"&&next.status!=="reveal")return next;
    if(issue)this.revealed.add(number);
    if(entry.step===1){
      this.original=issue?exampleSeating(this.room):[...entry.plan];
      this.closedSeat=pick(this.room.affectsBooking?this.original:seats.filter(seat=>!this.room.occupied.includes(seat)&&!this.original.includes(seat)));
    }else if(entry.step===3){
      this.final=issue?exampleSeating(this.room,this.closedSeat,this.original):[...(entry.keep?this.original:entry.plan)];
    }
    return next;
  }
}
