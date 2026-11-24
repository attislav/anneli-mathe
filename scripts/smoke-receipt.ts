import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {article, receipt, receiptError, receiptFinding, receiptHint, receiptSum} from "../src/game/receipt";
import {Receipt} from "../src/lesson/Receipt";

const cases=new Set<string>(), sumSigns=new Set<number>(), positions=new Set<number>();
let equalPrices=false,changedOrder=false;
const original=Math.random;
let seed=12345;
try{
  Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(const level of [1,2,3,4,5] as const)for(let run=0;run<150;run++){
    const board=receipt(level),error=receiptError(board);
    assert.equal(board.items.length,level<=2?2:3);
    assert.equal(new Set(board.printed.map(r=>r.id)).size,board.items.length);
    const actual=board.items.reduce((sum,r)=>sum+r.quantity*r.price,0);
    const printed=board.printed.reduce((sum,r)=>sum+r.quantity*r.price,0);
    assert.ok(printed<=100 && actual<=100);
    assert.equal(receiptSum(board.items),actual);assert.equal(receiptSum(board.printed),printed);
    const different=board.printed.flatMap(row=>{
      const real=board.items.find(r=>r.id===row.id)!;
      assert.ok(row.quantity>=1&&row.price>=1);
      return (["quantity","price"] as const).filter(field=>real[field]!==row[field]).map(field=>({id:row.id,field}));
    });
    assert.ok(different.length<=1);
    assert.deepEqual(error,different.length?different[0]:"correct");
    equalPrices ||=new Set(board.items.map(r=>r.price)).size<board.items.length;
    changedOrder ||=board.items.some((r,i)=>r.id!==board.printed[i].id);
    sumSigns.add(Math.sign(printed-actual));
    if(error==="correct"){
      cases.add("correct");
      assert.equal(receiptHint(board,"correct",null),null);
      assert.ok(receiptHint(board,{id:board.items[0].id,field:"price"},board.items[0].price));
    }else{
      cases.add(error.field);positions.add(board.printed.findIndex(r=>r.id===error.id));
      const real=board.items.find(r=>r.id===error.id)!;
      assert.equal(receiptHint(board,error,real[error.field]),null);
      assert.ok(receiptHint(board,error,real[error.field]+1));
      assert.ok(receiptHint(board,"correct",null));
      assert.ok(receiptHint(board,{...error,field:error.field==="price"?"quantity":"price"},real.price));
      assert.ok(receiptHint(board,{...error,id:board.items.find(r=>r.id!==error.id)!.id},real[error.field]));
    }
    assert.ok(board.solution.startsWith(receiptFinding(board)));
  }
}finally{Math.random=original;}
assert.equal(cases.size,3);assert.equal(sumSigns.size,3);assert.equal(positions.size,3);assert.ok(equalPrices&&changedOrder);
assert.equal(article(0,1),"Stift");assert.equal(article(0,2),"Stifte");
const task={...receipt(1),id:"bon",skillId:"kassenbon",level:1 as const};
const ask=renderToStaticMarkup(createElement(Receipt,{task,status:"ask",onAnswer(){}}));
assert.ok(ask.includes("Gedruckter Kassenbon")&&ask.includes("Der Bon stimmt")&&ask.includes("Preisschilder")&&!ask.includes("Tatsächlicher Zahlbetrag"));
const solved=renderToStaticMarkup(createElement(Receipt,{task,status:"reveal",onAnswer(){}}));
assert.ok(solved.includes("Du zahlst")&&!solved.includes("<button"));
const items=[{id:0,quantity:2,price:7},{id:1,quantity:3,price:5}];
for(const changed of ["quantity","price","none"] as const){
  const printed=[{...items[1]},{...items[0]}];
  if(changed!=="none")printed[0][changed]++;
  const example={...task,items,printed};
  function tableAt(status:"ask"|"wrong"|"right"|"reveal"){
    const html=renderToStaticMarkup(createElement(Receipt,{task:example,status,onAnswer(){}}));
    return html.match(/<table[^>]*>(.*?)<\/table>/)![1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  }
  for(const status of ["ask","wrong"] as const){
    const table=tableAt(status);
    assert.ok(table.includes("Gedruckter Kassenbon"));
    assert.ok(table.endsWith("Summe auf dem Bon "+receiptSum(printed)+" ct"));
  }
  for(const status of ["right","reveal"] as const){
    const table=tableAt(status);
    assert.ok(table.startsWith(changed==="none"?"Geprüfter Kassenbon":"Berichtigter Kassenbon"));
    assert.ok(table.endsWith("Heft 3 5 ct 15 ct Stift 2 7 ct 14 ct Dein Zahlbetrag 29 ct"));
  }
}
