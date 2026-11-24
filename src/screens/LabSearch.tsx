import { LAB_TOPICS, type LabTopic } from "@/game/lab";
import { findLabTopics, suggestedTerms } from "@/game/labSearch";

export function RoundSize({size, onChange}: {size:1|5; onChange:(size:1|5)=>void}) {
  return <fieldset className="mb-2 flex flex-wrap gap-2"><legend className="text-sm font-bold">Umfang für die Einzelthemen</legend>
    {([1,5] as const).map(n=><label key={n} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-white px-3">
      <input type="radio" name="einzelthemen-umfang" checked={size===n} onChange={()=>onChange(n)}/>
      {n===1?"Eine Aufgabe":"Fünf Aufgaben"}</label>)}</fieldset>;
}
export function SearchHit({topic, size, start}: {topic:LabTopic; size:1|5; start:(topic:LabTopic,size:1|5)=>void}) {
  return <button type="button" className="grid w-full gap-1 rounded-2xl bg-white p-3 text-left" onClick={()=>start(topic,size)}>
    <strong>{LAB_TOPICS[topic].title}</strong><span>{LAB_TOPICS[topic].prompt}</span></button>;
}
export function LabSearch({query, setQuery, size, setSize, start, back}: {
  query:string; setQuery:(value:string)=>void; size:1|5; setSize:(size:1|5)=>void;
  start:(topic:LabTopic,size:1|5)=>void; back:()=>void;
}) {
  const matches=findLabTopics(query);
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-4 bg-mist p-4">
    <button type="button" className="min-h-11 justify-self-start underline" onClick={back}>← Zu den Lernbereichen</button>
    <h1 className="font-display text-3xl">Aufgabe finden</h1>
    <label className="grid gap-1 font-bold">Was möchtest du üben?
      <input type="search" value={query} autoComplete="off" placeholder="Suchwort eingeben"
        className="min-h-12 rounded-xl border-2 bg-white px-3" onChange={event=>setQuery(event.target.value)}/></label>
    <div className="flex flex-wrap gap-2">{suggestedTerms.map(term=><button key={term} type="button"
      className="min-h-11 rounded-xl bg-sky-light px-3" aria-pressed={query===term} onClick={()=>setQuery(term)}>{term}</button>)}</div>
    <RoundSize size={size} onChange={setSize}/>
    <p role="status">{!query.trim() ? "Tippe ein Wort an oder gib dein eigenes ein." : matches.length ?
      matches.length + (matches.length===1?" passende Aufgabe":" passende Aufgaben") : "Keine passende Einzelaufgabe gefunden. Probiere ein anderes Wort."}</p>
    {matches.length>0 && <ul className="grid gap-2">{matches.map(topic=><li key={topic}><SearchHit topic={topic} size={size} start={start}/></li>)}</ul>}
  </main>;
}
