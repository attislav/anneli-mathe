import assert from "node:assert/strict";
import React,{createElement,isValidElement,type ReactNode} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {endFace,faceNames,guidedStart,moveNames,nextGuided,rollCube,tiltStar,type Face,type Move} from "../src/game/rollCube";
import {CubeView,RollCube} from "../src/lesson/RollCube";
import type {Status} from "../src/lesson/formats";

const vectors:Record<Face,number[]>={top:[0,0,1],bottom:[0,0,-1],right:[1,0,0],left:[-1,0,0],front:[0,1,0],back:[0,-1,0]};
const opposite:Record<Move,Move>={left:"right",right:"left",front:"back",back:"front"};
for(const face of Object.keys(faceNames) as Face[])for(const move of Object.keys(moveNames) as Move[]){
  const [x,y,z]=vectors[face];
  const expected=move==="right"?[z,y,-x]:move==="left"?[-z,y,x]:move==="front"?[x,z,-y]:[x,-z,y];
  assert.equal(vectors[tiltStar(face,move)].join(),expected.join());
  assert.equal(tiltStar(tiltStar(face,move),opposite[move]),face);
  assert.equal(endFace({start:face,moves:[move,move,move,move]}),face);
  assert.ok(renderToStaticMarkup(createElement(CubeView,{face})).includes("Der Stern liegt "+faceNames[face]+"."));
}
for(const move of Object.keys(moveNames) as Move[])assert.equal(endFace({start:"top",moves:[move,move]}),"bottom");
assert.notEqual(endFace({start:"top",moves:["front","right"]}),endFace({start:"top",moves:["right","front"]}));
for(const level of [1,2,3,4,5] as const){
  for(const seed of [0,.18,.4,.61,.83,.999]){
    const original=Math.random;let task;
    try{Math.random=()=>seed;task=rollCube(level);}finally{Math.random=original;}
    assert.equal(task.practice.moves.length,level===1?1:level<=3?2:3);
    assert.equal(task.transfer.moves.length,task.practice.moves.length);
    assert.notEqual(endFace(task.practice),endFace(task.transfer));
  }
}
assert.equal(nextGuided(guidedStart,{start:"top",moves:["front"]},"continue"),guidedStart);

// Drive the real component handlers without a browser. Only React's state
// storage is replaced; the component's validation, event handlers and JSX run.
const task={...rollCube(2),practice:{start:"top" as const,moves:["front","front"] as Move[]},
  transfer:{start:"top" as const,moves:["right","front"] as Move[]},id:"cube",skillId:"wuerfelKippen",level:2 as const};
let status:Status="ask",cursor=0;
const answers:boolean[]=[],states:unknown[]=[];
type HandlerProps={children?:ReactNode;disabled?:boolean;onClick?:()=>void;choose?:(face:Face)=>void};
function controls(node:ReactNode):HandlerProps[]{
  if(Array.isArray(node))return node.flatMap(controls);
  if(!isValidElement<HandlerProps>(node))return [];
  return [node.props,...controls(node.props.children)];
}
const actualState=React.useState;
try{
  React.useState=((initial:unknown)=>{
    const index=cursor++;
    if(index===states.length)states.push(typeof initial==="function"?initial():initial);
    return [states[index],(next:unknown)=>{states[index]=typeof next==="function"?next(states[index]):next;}];
  }) as typeof React.useState;
  function render(){
    cursor=0;
    return controls(RollCube({task,status,onAnswer(correct){answers.push(correct);status=correct?"right":"wrong";}}));
  }
  function click(label:string){
    const button=render().find(props=>props.onClick && React.Children.toArray(props.children).join("")===label);
    assert.ok(button?.onClick&&!button.disabled,label);button.onClick();
  }
  function choose(face:Face){const selector=render().find(props=>props.choose);assert.ok(selector?.choose);selector.choose(face);}
  choose("back");click("Vermutung ausprobieren");click("Jetzt nach vorne zu dir kippen");click("Jetzt nach vorne zu dir kippen");
  click("Kippen noch einmal ansehen");click("Jetzt nach vorne zu dir kippen");click("Jetzt nach vorne zu dir kippen");click("Neuen Weg selbst lösen");
  assert.deepEqual(answers,[]);choose("top");click("Endlage prüfen");assert.deepEqual(answers,[false]);
  status="ask";choose("right");click("Endlage prüfen");assert.deepEqual(answers,[false,true]);
}finally{React.useState=actualState;}

