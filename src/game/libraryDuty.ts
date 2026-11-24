import { pick, randInt, shuffle } from "./random";
import type { Level, LibraryTask } from "./types";

export type Stock = { shelf: number; borrowed: number };
export type Booking = { direction: "loan" | "return"; amount: number };
export const directionNames = { loan: "Ausleihe", return: "Rückgabe" };
export const bookCount = (amount:number) => amount+" "+(amount===1?"Buch":"Bücher");
export const explanations = [
  "Jedes Buch wechselt nur zwischen Regal und Ausleihe.",
  "Ein ausgeliehenes Buch gehört nicht mehr zum Bestand der Bücherei.",
  "Eine Rückgabe bringt ein neues Buch in die Bücherei.",
];
export function bookTransfer(before:Stock, booking:Booking): Stock | null {
  const { direction,amount }=booking;
  if(!Number.isInteger(amount)||amount<1)return null;
  const delta=direction==="loan"?-amount:amount;
  const shelf=before.shelf+delta,borrowed=before.borrowed-delta;
  return shelf<0||borrowed<0?null:{shelf,borrowed};
}
export function bookingBetween(before:Stock,after:Stock):Booking | null {
  const delta=after.shelf-before.shelf;
  if(!delta||before.borrowed-after.borrowed!==delta)return null;
  return {direction:delta<0?"loan":"return",amount:Math.abs(delta)};
}
export function stockHint(before:Stock,booking:Booking,shown:Stock){
  const target=bookTransfer(before,booking)!;
  if(shown.shelf===target.shelf&&shown.borrowed===target.borrowed)return null;
  return directionNames[booking.direction]+": "+bookCount(booking.amount)+(booking.direction==="loan"?" aus dem Regal in die Ausleihe bewegen.":" aus der Ausleihe zurück ins Regal bewegen.")+
    " Prüfe beide Bestände.";
}
export function receiptHint(before:Stock,after:Stock,booking:Booking,total:number,explanation:number){
  const missing=bookingBetween(before,after)!;
  if(missing.direction!==booking.direction)return "Vergleiche den Regalbestand vorher und nachher. Wurden Bücher ausgeliehen oder zurückgebracht?";
  if(missing.amount!==booking.amount)return "Um wie viele Bücher hat sich der Regalbestand verändert?";
  if(total!==before.shelf+before.borrowed)return "Zähle die Bücher im Regal und die ausgeliehenen Bücher zusammen.";
  if(explanation!==0)return "Überlege, wem die Bücher vor und nach der Buchung gehören.";
  return null;
}
export function libraryDuty(level:Level):Omit<LibraryTask,"id"|"level"|"skillId">{
  const total=randInt([8,10,12,15,18][level-1],[10,14,18,21,24][level-1]);
  const shelf=randInt(1,total-1),initial={shelf,borrowed:total-shelf};
  const directions=shuffle(["loan","return"] as const),limit=level+2;
  let current=initial;
  const generated=(direction:Booking["direction"]):Booking=>{
    const available=direction==="loan"?current.shelf:current.borrowed;
    const booking={direction,amount:randInt(1,Math.min(available,limit))};
    current=bookTransfer(current,booking)!;
    return booking;
  };
  const bookings=directions.map(generated);
  const finalDirection=current.borrowed===0?"loan":current.shelf===0?"return":pick(["loan","return"] as const);
  const missing=generated(finalDirection);
  return {format:"library-duty",initial,bookings,afterMissing:current,reasonOrder:shuffle([0,1,2]),
    question:"Übernimm den Dienst in der Klassenbücherei.",hint:"Jede Buchung bewegt dieselben Bücher von einer Seite auf die andere.",
    solution:"Der fehlende Beleg ist eine "+directionNames[missing.direction]+" über "+bookCount(missing.amount)+". Insgesamt gehören "+bookCount(total)+" zur Bücherei. "+explanations[0]};
}
