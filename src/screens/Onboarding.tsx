"use client";

// Erster Start: Name → Ei aussuchen und schlüpfen lassen → Haustier taufen →
// Einstufungs-Abenteuer (oder ganz vorne anfangen).

import { useState } from "react";
import { PETS, type PetSpecies } from "@/game/collection";
import { cancelNewProfile, createProfile, profileList } from "@/game/state";
import { ChevronLeft } from "lucide-react";
import { sfx } from "@/game/sound";
import { Button } from "@/ui/Button";
import { Egg, Pet } from "@/ui/Pet";
import { Confetti, useBackdrop } from "@/ui/chrome";
import { placementResult } from "@/game/placement";
import { Placement } from "./Placement";

const NAME_IDEAS: Record<PetSpecies, string[]> = {
  funkel: ["Funkel", "Mimi", "Flausch", "Luna"],
  drachi: ["Drachi", "Feuerfunke", "Pino", "Smaragd"],
  pieps: ["Pieps", "Wolke", "Hoot", "Federchen"],
};

type Step = "name" | "egg" | "hatch" | "petname" | "start" | "placement";

export function Onboarding() {
  useBackdrop("#7B4DFF");
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<PetSpecies | null>(null);
  const [petName, setPetName] = useState("");
  // Weiteres Kind auf diesem Gerät? Dann darf man zurück zur Auswahl.
  const [others] = useState(() => profileList().length > 0);

  const chooseEgg = (s: PetSpecies) => {
    setSpecies(s);
    setStep("hatch");
    sfx.chest();
    setTimeout(() => {
      setStep("petname");
      setPetName(NAME_IDEAS[s][0]);
    }, 1300);
  };

  const finish = (startIndex: number) => {
    if (!species) return;
    sfx.fanfare();
    const { skipped, mastery } = placementResult(startIndex);
    createProfile({ name: name.trim() || "Rechenheld", pet: species, petName: petName.trim() || NAME_IDEAS[species][0] }, skipped, mastery);
  };

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 bg-grape px-5 py-10 text-center text-white">
      {others && step === "name" && (
        <button onClick={cancelNewProfile} aria-label="Zurück" className="absolute left-4 top-5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/15">
          <ChevronLeft size={26} />
        </button>
      )}
      {step === "name" && (
        <>
          <h1 className="font-display text-4xl font-semibold">Hallo!</h1>
          <p className="text-xl">Wie heißt du?</p>
          <input
            autoFocus
            value={name}
            maxLength={16}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("egg")}
            aria-label="Dein Name"
            className="h-16 w-full max-w-sm rounded-[22px] border-4 border-white/40 bg-white px-5 text-center font-display text-3xl font-semibold text-ink outline-none focus:border-sun"
          />
          <Button tone="sun" className="w-full max-w-sm" disabled={!name.trim()} onClick={() => setStep("egg")}>
            Weiter
          </Button>
        </>
      )}

      {step === "egg" && (
        <>
          <h1 className="font-display text-3xl font-semibold">Such dir ein Ei aus, {name.trim()}!</h1>
          <p className="text-lg text-white/85">Daraus schlüpft dein Begleiter. Er wächst mit, wenn du rechnest.</p>
          <div className="flex w-full justify-center gap-3">
            {(Object.keys(PETS) as PetSpecies[]).map((s, i) => (
              <button key={s} onClick={() => chooseEgg(s)} aria-label={`Ei ${i + 1}`} className="anim-bob rounded-[28px] bg-white/10 p-3" style={{ animationDelay: `${i * 0.3}s` }}>
                <Egg species={s} size={88} />
              </button>
            ))}
          </div>
        </>
      )}

      {step === "hatch" && species && (
        <div className="anim-hatch">
          <Egg species={species} size={150} />
        </div>
      )}

      {step === "petname" && species && (
        <>
          <Confetti />
          <Pet species={species} mood="joy" size={170} className="anim-pop" />
          <h1 className="font-display text-3xl font-semibold">Eine {PETS[species].label}!</h1>
          <p className="text-lg">Wie soll sie heißen?</p>
          <input
            value={petName}
            maxLength={14}
            onChange={(e) => setPetName(e.target.value)}
            aria-label="Name deines Haustiers"
            className="h-14 w-full max-w-sm rounded-[20px] bg-white px-5 text-center font-display text-2xl font-semibold text-ink outline-none"
          />
          <div className="flex flex-wrap justify-center gap-2">
            {NAME_IDEAS[species].map((n) => (
              <button key={n} onClick={() => setPetName(n)} className="rounded-full bg-white/15 px-4 py-2 font-extrabold">
                {n}
              </button>
            ))}
          </div>
          <Button tone="sun" className="w-full max-w-sm" onClick={() => setStep("start")}>
            Weiter
          </Button>
        </>
      )}

      {step === "start" && species && (
        <>
          <Pet species={species} size={110} />
          <h1 className="font-display text-3xl font-semibold">Bereit?</h1>
          <p className="text-lg text-white/85">Ihr startet auf der Startinsel — zum Warmwerden und Kennenlernen.</p>
          <Button tone="sun" className="w-full max-w-sm" onClick={() => finish(0)}>
            Los geht&apos;s!
          </Button>
          <button onClick={() => setStep("placement")} className="mt-2 text-sm font-extrabold text-white/75 underline">
            Ich kann schon viel – kurzer Einstufungstest
          </button>
        </>
      )}

      {step === "placement" && species && <Placement species={species} onDone={finish} />}
    </main>
  );
}
