"use client";

import { useRouter } from "next/navigation";
import { prepareReportPractice, reportTopics } from "@/game/reportPractice";
import { LAB_TOPICS } from "@/game/lab";

export function ReportPracticeChoice({owner,skill}:{owner:string|null;skill:string}) {
  const router=useRouter();
  const topics=reportTopics(skill);
  if(!topics.length)return <p className="p-2 text-sm">Für diese Kompetenz gibt es zurzeit keine einzelne Laborübung.</p>;
  return <div className="grid gap-1 rounded-lg bg-mist p-2"><p className="text-sm font-bold">Eine Übung dazu</p>
    {!owner && <p className="text-sm">Eine Übung lässt sich im Spielprofil dieses Kindes starten.</p>}
    {topics.map(topic=>owner?<button type="button" key={topic} className="grid min-h-11 rounded-lg bg-white p-2 text-left" onClick={()=>{
      const href=prepareReportPractice(owner,skill,topic);
      if(href)router.push(href);
    }}><strong>{LAB_TOPICS[topic].title} starten</strong><span className="text-sm">{LAB_TOPICS[topic].prompt}</span></button>:
      <p key={topic} className="grid rounded-lg bg-white p-2"><strong>{LAB_TOPICS[topic].title}</strong><span className="text-sm">{LAB_TOPICS[topic].prompt}</span></p>)}</div>;
}

