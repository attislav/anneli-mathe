import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { routeFollowUps, routeProblem, routeStep, routeTasks, routeTurn } from "../src/game/changeRoute";
import { LearningRound } from "../src/game/learningGoals";
import { readSave } from "../src/game/state";
import { DrawRoute, RouteTurn } from "../src/lesson/ChangeRoute";

// In screen coordinates the clockwise neighbour of north is east.
const neighbours=[1,5,7,3];
for(const [source,entry,arrow,direction] of [[1,"B1","↓","unten"],[5,"C2","←","links"],[7,"B3","↑","oben"],[3,"A2","→","rechts"]] as const) {
  const start=source===1 || source===3?0:8;
  const goal=8-start;
  const [turn]=routeFollowUps([start,source,4,5,4,7,goal===8?8:6,...(goal===0?[3,0]:[])]);
  const html=renderToStaticMarkup(createElement(RouteTurn,{task:turn,status:"ask",onAnswer(){}}));
  assert.equal(html.match(/Hier stehst du/g)?.length,1);
  assert.ok(html.includes(`B2, Brunnen, Hier stehst du, Ankunft von ${entry}, Blick auf dem Plan nach ${direction}`));
  assert.ok(html.includes(">"+arrow+"</b>"));
  assert.ok(html.includes("zum ersten Mal") && !html.includes("Park, Hier stehst du"));
}
for(let incoming=0;incoming<4;incoming++) for(let outgoing=0;outgoing<4;outgoing++) {
  const route=[neighbours[incoming],4,neighbours[outgoing]];
  assert.equal(routeTurn(route),["zurück","links","geradeaus","rechts"][(outgoing-incoming+4)%4]);
}
function walks(route:number[],goal:number):number[][] {
  const end=route.at(-1)!;
  if(end===goal)return [route];
  const out:number[][]=[];
  for(let n=0;n<9;n++) {
    const near=Math.abs(n%3-end%3)+Math.abs(Math.floor(n/3)-Math.floor(end/3))===1;
    if(near && !route.includes(n))out.push(...walks([...route,n],goal));
  }
  return out;
}
for(const start of [0,2,6,8]) {
  const [task]=routeTasks(start), choices=walks([start],task.goal).filter(r=>r.includes(4));
  assert.ok(choices.length>1);
  assert.equal(routeProblem(task,task.example),null);
  for(const route of choices) {
    assert.equal(routeProblem(task,route),null);
    const [turn,detour]=routeFollowUps(route);
    assert.deepEqual(turn.route,route);
    const next=route[route.indexOf(4)+1];
    assert.deepEqual(detour.closed,[4,next]);
    assert.ok(!routeStep(4,next,detour.closed) && !routeStep(next,4,detour.closed));
    const legal=walks([4],task.goal).filter(r=>!r.some((v,i)=>i>0 && [v,r[i-1]].includes(4) && [v,r[i-1]].includes(next)));
    assert.ok(legal.length>=2);
    for(const alternative of legal)assert.equal(routeProblem(detour,alternative),null);
    assert.equal(routeProblem(detour,detour.example),null);
  }
  const html=renderToStaticMarkup(createElement(DrawRoute,{task,status:"ask",onAnswer(){}}));
  assert.ok(html.includes("B2, Brunnen") && html.includes("Letzten Schritt zurück"));
}
export function testChangeRoute(owner:string) {
  const save=structuredClone(readSave());
  for(const useOwn of [true,false]) {
    const tasks=routeTasks(0), round=new LearningRound(owner,"routes",tasks);
    const route=useOwn?[0,3,4,7,8]:tasks[0].example;
    if(useOwn)round.submitRoute(tasks[0].id,route);
    else {
      round.submitRoute(tasks[0].id,[0,1]);
      round.advance(tasks[0].id);
      round.submitRoute(tasks[0].id,[0,1]);
      assert.equal(round.state.status,"reveal");
    }
    round.advance(tasks[0].id);
    assert.deepEqual(tasks[1].route,route);
    assert.deepEqual(tasks[2].closed,[4,route[route.indexOf(4)+1]]);
    for(const task of tasks.slice(1)) {
      round.answer(task.id,true);round.answer(task.id,true);round.advance(task.id);
    }
    assert.equal(round.state.status,"done");
  }
  const after=readSave();
  assert.deepEqual(after.log.slice(save.log.length).map(e=>[e.s,e.ok]),[1,0].flatMap(ok=>[["rasterwege",ok],["standpunkte",1],["rasterwege",1]]));
  assert.deepEqual({...after,log:save.log,mastery:save.mastery},save);
}
