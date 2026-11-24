import assert from "node:assert/strict";
import { createElement, isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LAB_TOPICS } from "../src/game/lab";
import { findLabTopics, suggestedTerms } from "../src/game/labSearch";
import { LAB_TOPIC_IDS } from "../src/game/schoolSelection";
import { LabSearch, SearchHit } from "../src/screens/LabSearch";
import { LabActivity, LabMenu } from "../src/screens/LabScreen";

function findButton(node:ReactNode, label:string): (()=>void) | undefined {
  if (Array.isArray(node)) return node.map(child=>findButton(child,label)).find(Boolean);
  if (!isValidElement<{children?:ReactNode;onClick?:()=>void}>(node)) return;
  if(node.type==="button" && node.props.children===label) return node.props.onClick;
  return findButton(node.props.children,label);
}

export function testLabSearch(owner:string) {
  for(const topic of LAB_TOPIC_IDS) assert.equal(findLabTopics(LAB_TOPICS[topic].title)[0],topic);
  for(const term of suggestedTerms) assert.ok(findLabTopics(term).length,term);
  assert.equal(findLabTopics("Treffen")[0],"sharedTime");
  assert.ok(findLabTopics("Uhr").includes("morning"));
  assert.deepEqual(findLabTopics("Wuerfel"),findLabTopics("WÜRFEL"));
  assert.deepEqual(findLabTopics("groß"),findLabTopics("gross"));
  assert.deepEqual(findLabTopics("fair"),["wheelChance"]);
  assert.deepEqual(findLabTopics("Falten"),["folds"]);
  assert.ok(findLabTopics("Geld").includes("shopping"));
  for(const term of ["  ","???","Rückgeld","Mondrakete"]) assert.deepEqual(findLabTopics(term),[]);
  const empty=renderToStaticMarkup(createElement(LabSearch,{query:"Mondrakete",setQuery(){},size:1,setSize(){},start(){},back(){}}));
  assert.match(empty,/Keine passende Einzelaufgabe/);
  // React applies the same menu state updates from the real buttons between server renders.
  for(const size of [1,5] as const){
    let step=0;
    const checkMarkup: (()=>void)[]=[];
    function Visit(){
      const menu=LabMenu({owner,topics:[]});
      switch(step++){
        case 0: {
          const open=findButton(menu,"Aufgabe finden");
          assert.ok(open); open(); break;
        }
        case 1:
          assert.equal(menu.type,LabSearch);
          menu.props.setQuery("Treffen");menu.props.setSize(size);break;
        case 2: {
          const [topic]=findLabTopics(menu.props.query);
          const hit=SearchHit({topic,size:menu.props.size,start:menu.props.start});
          hit.props.onClick();break;
        }
        case 3: {
          assert.equal(menu.type,LabActivity);
          assert.equal(menu.props.round.topic,"sharedTime");
          assert.equal(menu.props.round.count,size);
          const searchBack = />Zurück zu den Suchergebnissen<\/button>/;
          const running={...menu.props,round:menu.props.round.replay()};
          checkMarkup.push(()=>{
            assert.match(renderToStaticMarkup(createElement(LabActivity,running)),searchBack);
            assert.match(renderToStaticMarkup(createElement(LabActivity,{...running,backLabel:undefined})),/Runde beenden und Thema wählen/);
          });
          const round=menu.props.round;
          for(let i=0;i<size;i++){
            const id=round.state.task.id;
            round.answer(id,true);round.advance(id);
          }
          assert.equal(round.state.status,"done");
          checkMarkup.push(()=>{
            assert.match(renderToStaticMarkup(menu),searchBack);
            assert.match(renderToStaticMarkup(createElement(LabActivity,{...menu.props,backLabel:undefined})),/Anderes Thema wählen/);
          });
          menu.props.onReplay();break;
        }
        case 4:
          assert.equal(menu.type,LabActivity);
          assert.equal(menu.props.round.state.status,"ask");
          checkMarkup.push(()=>assert.match(renderToStaticMarkup(menu),/>Zurück zu den Suchergebnissen<\/button>/));
          menu.props.onBack();break;
        case 5:
          assert.equal(menu.type,LabSearch);
          assert.equal(menu.props.query,"Treffen");assert.equal(menu.props.size,size);
          menu.props.back();break;
        case 6:
          assert.ok(findButton(menu,"Aufgabe finden"));
          return createElement("span",null,"zurück");
        default: throw new Error("Unerwarteter Suchschritt");
      }
      return null;
    }
    assert.match(renderToStaticMarkup(createElement(Visit)),/zurück/);
    assert.equal(step,7);
    for(const check of checkMarkup) check();
  }
}
