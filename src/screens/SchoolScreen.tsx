"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LAB_TOPICS, type LabTopic } from "@/game/lab";
import { SchoolRound, setSchoolTopics } from "@/game/schoolAssignment";
import { LAB_GROUPS } from "@/game/schoolSelection";
import { activeProfileId, useSave, needsProfilePick } from "@/game/state";
import { Button } from "@/ui/Button";
import { Splash } from "@/ui/chrome";
import { LabActivity } from "./LabScreen";
import { Onboarding } from "./Onboarding";
import { ProfilePicker } from "./ProfilePicker";

export function SchoolScreen() {
  const save = useSave();
  const start = useSearchParams().get("start") === "1";
  if (!save) return <Splash />;
  if (needsProfilePick()) return <ProfilePicker />;
  if (!save.profile) return <Onboarding />;
  const owner = activeProfileId();
  return <Assignment key={owner} owner={owner} name={save.profile.name} topics={save.schoolTopics} start={start} />;
}

function Assignment({ owner, topics, name, start }: { owner: string; topics: LabTopic[]; name: string; start: boolean }) {
  const [round, setRound] = useState(() => start && topics.length ? new SchoolRound(owner, topics) : null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LabTopic[]>([]);
  const choosing = editing || topics.length === 0;
  function play() {
    setRound(topics.length ? new SchoolRound(owner, topics) : null);
  }
  function toggle(topic: LabTopic) {
    setDraft(old => old.includes(topic) ? old.filter(t => t !== topic) : old.length < 3 ? [...old, topic] : old);
  }
  if (round) return <LabActivity key={round.id} round={round} onReplay={play} onBack={() => setRound(null)} />;
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-4 bg-mist p-5">
    <Link className="w-fit rounded-xl bg-white px-4 py-2" href="/labor/">← Zum Labor</Link>
    <header><h1 className="font-display text-3xl">Mein Schulauftrag</h1><p>Für {name}</p></header>
    {choosing ? <>
      <fieldset className="grid grid-cols-2 gap-2"><legend className="mb-3">Wähle zwei oder drei Themen. Jedes kommt zweimal dran.</legend>
        {LAB_GROUPS.map(group => <div key={group.title} className="col-span-2 grid grid-cols-2 gap-2">
          <h2 className="col-span-2 mt-2 font-display text-lg">{group.title}</h2>
        {group.topics.map(topic => <button key={topic} type="button" aria-pressed={draft.includes(topic)}
          disabled={!draft.includes(topic) && draft.length >= 3} onClick={() => toggle(topic)}
          className="min-h-14 rounded-xl border-2 border-transparent bg-white p-2 aria-pressed:border-grape aria-pressed:bg-grape-light disabled:opacity-50">
          {LAB_TOPICS[topic].title}</button>)}</div>)}
      </fieldset>
      <Button disabled={draft.length < 2} onClick={() => { setSchoolTopics(owner, draft); setEditing(false); }}>Auftrag speichern</Button>
      {topics.length > 0 && <Button tone="white" onClick={() => setEditing(false)}>Abbrechen</Button>}
    </> : <>
      <ul className="rounded-2xl bg-white p-4">{topics.map(topic => <li key={topic}>{LAB_TOPICS[topic].title}</li>)}</ul>
      <Button onClick={play}>{topics.length * 2} Aufgaben starten</Button>
      <Button tone="white" onClick={() => { setDraft([...topics]); setEditing(true); }}>Themen ändern</Button>
      <button type="button" className="min-h-11 text-ink-soft" onClick={() => { setSchoolTopics(owner, []); setDraft([]); }}>Auftrag löschen</button>
    </>}
  </main>;
}
