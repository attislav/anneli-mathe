import { pick } from "./random";
import type { Level, PencilTask } from "./types";

export type Stock = {packs:number; singles:number};
export type PencilOrder = Stock & {orders:[number,number]; optimize:boolean};
export type Shipment = {opened:number; boxes:[Stock,Stock]};
export const emptyShipment=():Shipment=>({opened:0,boxes:[{packs:0,singles:0},{packs:0,singles:0}]});
export const pencilCount=(stock:Stock)=>stock.packs*10+stock.singles;
export function stockLeft(order:PencilOrder,plan:Shipment):Stock {
  return {packs:order.packs-plan.opened-plan.boxes[0].packs-plan.boxes[1].packs,
    singles:order.singles+10*plan.opened-plan.boxes[0].singles-plan.boxes[1].singles};
}
export function movePencils(order:PencilOrder,plan:Shipment,to:0|1,kind:keyof Stock,amount:number):Shipment {
  if(!Number.isInteger(amount)||amount===0||plan.boxes[to][kind]+amount<0||stockLeft(order,plan)[kind]<amount) return plan;
  const next:Shipment={opened:plan.opened,boxes:[{...plan.boxes[0]},{...plan.boxes[1]}]};
  next.boxes[to][kind]+=amount;
  return next;
}
export function openPack(order:PencilOrder,plan:Shipment):Shipment {
  return stockLeft(order,plan).packs>0?{...plan,opened:plan.opened+1}:plan;
}
export function shipped(order:PencilOrder,plan:Shipment) {
  const rest=stockLeft(order,plan);
  return [plan.opened,...Object.values(rest),...plan.boxes.flatMap(box=>Object.values(box))].every(n=>Number.isInteger(n)&&n>=0)
    &&plan.boxes.every((box,i)=>pencilCount(box)===order.orders[i]);
}
export function bestShipment(order:PencilOrder):Shipment {
  for(let opened=0;opened<=order.packs;opened++){
    for(let first=0;first<=Math.floor(order.orders[0]/10);first++) for(let second=0;second<=Math.floor(order.orders[1]/10);second++){
      const plan:Shipment={opened,boxes:[{packs:first,singles:order.orders[0]-first*10},{packs:second,singles:order.orders[1]-second*10}]};
      if(shipped(order,plan))return plan;
    }
  }
  throw new Error("Bestellung übersteigt den Vorrat.");
}
export function pencilOrderKey(order:PencilOrder){return [order.packs,order.singles,...order.orders,order.optimize].join("/");}
export function pencilOrders(level:Level,previous:PencilOrder[]=[]):Omit<PencilTask,"id"|"level"|"skillId"> {
  const options:PencilOrder[]=[];
  const optimize=level>=3;
  const quantities=level===1?[11,12,14,16,21]:level===2?[13,17,22,24,28]:[16,18,22,24,27,31,34,36];
  for(const first of quantities)for(const second of quantities){
    const total=first+second;
    for(const spare of [0,2,5,10]){
      const stock=total+spare;
      for(const looseTen of (level>=2?[0,1]:[0])){
        const order:PencilOrder={orders:[first,second],packs:Math.floor(stock/10)-looseTen,singles:stock%10+10*looseTen,optimize};
        if(!previous.some(old=>pencilOrderKey(old)===pencilOrderKey(order)))options.push(order);
      }
    }
  }
  const order=pick(options);
  return {format:"pencil-orders",...order,question:"Packe die Stifte für zwei Klassen.",
    hint:"Ein verschlossenes Päckchen enthält zehn Stifte. Du kannst auch mehr als neun lose Stifte in eine Lieferung legen.",
    solution:"Die Lieferscheine zeigen die Päckchen, die losen Stifte und den Rest im Lager."};
}
