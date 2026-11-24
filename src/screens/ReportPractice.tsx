"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clearReportHandoff, pendingReportPractice } from "@/game/reportPractice";
import { activeProfileId, useSave } from "@/game/state";
import { LabActivity } from "./LabScreen";
import { Splash } from "@/ui/chrome";

function Handoff({ticket,owner}:{ticket:string|null;owner:string}) {
  const router=useRouter();
  const [round]=useState(()=>pendingReportPractice(ticket,owner));
  useEffect(()=>{clearReportHandoff(ticket);},[ticket]);
  if(!round)return <main className="mx-auto grid max-w-lg gap-3 p-5"><h1 className="font-display text-2xl">Einzelübung</h1>
    <p>Dieser Start ist abgelaufen. Im Labor kannst du direkt eine neue Aufgabe wählen.</p>
    <Link className="rounded-xl bg-sky-light p-3" href="/labor/" replace>Zum Mathe-Labor</Link></main>;
  const leave=()=>{round.close();router.replace("/labor/");};
  return <LabActivity round={round} onBack={leave} onReplay={leave}/>;
}

export function ReportPracticeScreen() {
  const save=useSave(),search=useSearchParams();
  if(!save)return <Splash/>;
  const owner=activeProfileId(),ticket=search.get("start");
  return <Handoff key={JSON.stringify([owner,ticket])} owner={owner} ticket={ticket}/>;
}
