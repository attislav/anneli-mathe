"use client";

// „Ich": Haustier füttern, Level, Statistik, Einstellungen und die Eltern-Ecke.

import { TransferSection } from "@/ui/Transfer";
import { BadgesSection } from "@/ui/Badges";
import { useState } from "react";
import { ChevronRight, Heart, Lock, Users, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { START_MASTERY } from "@/game/adaptive";
import { PET_STAGE_NAMES, PETS, petStage } from "@/game/collection";
import { SKILLS } from "@/game/skills";
import { FEED_COST, feedPet, levelInfo, resetAll, streak, todayKey, totalStars, updateSettings, type SaveState } from "@/game/state";
import { sfx } from "@/game/sound";
import { randInt } from "@/game/random";
import { WORLDS } from "@/game/worlds";
import { CoinIcon } from "@/ui/art";
import { Button } from "@/ui/Button";
import { BottomNav, Sheet, useBackdrop } from "@/ui/chrome";
import { Pet } from "@/ui/Pet";

export function MeScreen({ save }: { save: SaveState }) {
  const [hearts, setHearts] = useState(0);
  useBackdrop("#FFE3F0");
  const [parent, setParent] = useState(false);
  const info = levelInfo(save.xp);
  const stage = petStage(info.level);
  const profile = save.profile!;
  const fedToday = save.pet.lastFed === todayKey();
  const nextStageAt = stage === 1 ? 5 : stage === 2 ? 10 : null;

  return (
    <div className="mx-auto min-h-dvh max-w-xl bg-rose-light px-4 pb-28 pt-5">
      <div className="relative flex flex-col items-center rounded-[28px] bg-white px-4 pb-5 pt-4 shadow-[0_6px_0_#FFC2DD]">
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-coin-light py-1.5 pl-2 pr-3 font-display text-lg font-semibold" aria-label={`Du hast ${save.coins} Münzen`}>
          <CoinIcon size={22} />
          {save.coins}
        </div>
        {Array.from({ length: hearts }, (_, i) => (
          <Heart key={i} className="anim-float absolute fill-rose text-rose" size={28} style={{ left: `${30 + ((i * 17) % 40)}%`, top: 60, animationDelay: `${(i % 4) * 0.1}s` }} />
        ))}
        <Pet species={profile.pet} stage={stage} mood={fedToday ? "joy" : "happy"} equipped={save.equipped} size={190} className={hearts ? "anim-pop" : "anim-bob"} />
        <h1 className="font-display text-3xl font-semibold">{profile.petName}</h1>
        <div className="text-ink-soft">
          {PETS[profile.pet].label} · {PET_STAGE_NAMES[stage]}
          {nextStageAt && ` · wächst bei Level ${nextStageAt}`}
        </div>
        <Button
          tone="rose"
          className="mt-4 w-full"
          disabled={save.coins < FEED_COST}
          onClick={() => {
            if (feedPet()) {
              sfx.coin();
              setHearts((h) => h + 4);
            }
          }}
        >
          Füttern
          <span className="flex items-center gap-1 text-lg">
            <CoinIcon size={20} /> {FEED_COST}
          </span>
        </Button>
        <p className="mt-2 text-sm text-ink-soft">{fedToday ? `${profile.petName} ist satt und glücklich!` : `${profile.petName} hat ein bisschen Hunger.`}</p>
      </div>

      <div className="mt-4 rounded-[24px] bg-white p-4">
        <div className="flex items-baseline justify-between">
          <div className="font-display text-2xl font-semibold">{profile.name}</div>
          <div className="font-extrabold text-grape">Level {info.level}</div>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-grape-light">
          <div className="h-full rounded-full bg-grape" style={{ width: `${(info.into / info.need) * 100}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <Stat value={totalStars(save)} label="Sterne" />
          <Stat value={save.stats.lessons} label="Lektionen" />
          <Stat value={save.stats.tasks} label="Aufgaben" />
          <Stat value={streak(save)} label="Tage am Stück" />
        </div>
      </div>

      <BadgesSection save={save} />

      <div className="mt-4 flex flex-col gap-2 rounded-[24px] bg-white p-4">
        <Toggle label="Töne" on={save.settings.sound} onChange={(v) => updateSettings({ sound: v })} icon={save.settings.sound ? <Volume2 /> : <VolumeX />} />
        <Toggle label="Stimme (Lob & Begrüßung)" on={save.settings.voice} onChange={(v) => updateSettings({ voice: v })} />
        <Toggle label="Aufgaben automatisch vorlesen" on={save.settings.autoRead} onChange={(v) => updateSettings({ autoRead: v })} />
      </div>

      <Link href="/wer/" className="mt-4 flex items-center justify-between rounded-[24px] bg-white p-4 font-extrabold">
        <span className="flex items-center gap-2">
          <Users size={22} className="text-grape" /> Kind wechseln oder neues Kind
        </span>
        <ChevronRight size={20} className="text-ink-soft" />
      </Link>

      <button onClick={() => setParent(true)} className="mx-auto mt-6 flex items-center gap-2 font-extrabold text-ink-soft">
        <Lock size={18} /> Eltern-Ecke
      </button>

      {parent && <ParentCorner save={save} onClose={() => setParent(false)} />}
      <BottomNav />
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-mist px-1 py-2">
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-[11px] font-extrabold leading-tight text-ink-soft">{label}</div>
    </div>
  );
}

function Toggle({ label, on, onChange, icon }: { label: string; on: boolean; onChange: (v: boolean) => void; icon?: React.ReactNode }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3">
      <span className="flex items-center gap-2 font-extrabold">
        {icon}
        {label}
      </span>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${on ? "bg-leaf" : "bg-cloud-dark"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${on ? "left-7" : "left-1"}`} />
      </span>
    </label>
  );
}

function ParentCorner({ save, onClose }: { save: SaveState; onClose: () => void }) {
  const [gate] = useState(() => ({ a: randInt(6, 9), b: randInt(6, 9) }));
  const [answer, setAnswer] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const unlocked = Number(answer) === gate.a * gate.b;

  return (
    <Sheet open onClose={onClose}>
      {!unlocked ? (
        <div className="flex flex-col gap-3 text-center">
          <h2 className="font-display text-2xl font-semibold">Nur für Erwachsene</h2>
          <p className="text-ink-soft">
            Wie viel ist {gate.a} × {gate.b}?
          </p>
          <input inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ""))} aria-label="Antwort" className="h-14 rounded-[18px] border-4 border-grape-light text-center font-display text-3xl outline-none focus:border-grape" />
        </div>
      ) : (
        <div className="flex max-h-[75dvh] flex-col gap-4 overflow-y-auto">
          <h2 className="font-display text-2xl font-semibold">Eltern-Ecke</h2>
          <p className="text-sm text-ink-soft">Können-Wert pro Thema (1 = neu, 5 = sicher). Die App stellt Aufgaben so, dass etwa 80 % beim ersten Versuch klappen.</p>
          {WORLDS.map((world) => (
            <div key={world.id}>
              <div className="mb-1 font-extrabold">{world.name}</div>
              {Object.values(SKILLS)
                .filter((s) => s.world === world.id)
                .map((s) => {
                  const m = save.mastery[s.id];
                  const v = m ?? START_MASTERY;
                  const color = m === undefined ? "#C2CAD6" : v >= 3.5 ? "#2BB673" : v >= 2.5 ? "#FFC531" : "#FF9F1C";
                  return (
                    <div key={s.id} className="flex items-center gap-3 py-1 text-sm">
                      <span className="w-40 shrink-0">{s.title}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist">
                        <div className="h-full rounded-full" style={{ width: `${(v / 5) * 100}%`, background: color }} />
                      </div>
                      <span className="w-10 text-right text-ink-soft">{m === undefined ? "–" : v.toFixed(1)}</span>
                    </div>
                  );
                })}
            </div>
          ))}
          <div>
            <div className="mb-2 font-extrabold">Spielhalle pro Tag</div>
            <div className="flex flex-wrap gap-2">
              {[0, 5, 10, 15, 20, 30].map((min) => (
                <button key={min} onClick={() => updateSettings({ arcadeMinutes: min })} className={`h-11 rounded-full px-4 font-extrabold ${save.settings.arcadeMinutes === min ? "bg-grape text-white" : "bg-mist"}`}>
                  {min === 0 ? "aus" : `${min} Min`}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-ink-soft">
            Insgesamt: {save.stats.lessons} Lektionen, {save.stats.tasks} Aufgaben, davon {save.stats.tasks ? Math.round((save.stats.firstTry / save.stats.tasks) * 100) : 0} % beim ersten Versuch richtig.
          </div>
          <Link href="/bericht/" className="flex items-center justify-between rounded-[22px] bg-grape p-4 font-extrabold text-white">
            <span>
              Lernbericht öffnen
              <span className="block text-sm font-normal text-white/85">Was klappt gut, wo hakt es, wie viel wird geübt</span>
            </span>
            <ChevronRight size={20} className="shrink-0" />
          </Link>
          <Link href="/quest/intro/" className="flex items-center justify-between rounded-[22px] bg-mist p-4 font-extrabold">
            <span>
              Alter Story-Modus
              <span className="block text-sm font-normal text-ink-soft">„Anneli und das verzauberte Buch“ – aus der ersten Version</span>
            </span>
            <ChevronRight size={20} className="shrink-0 text-ink-soft" />
          </Link>
          <Link href="/advent/?vorschau=1" className="flex items-center justify-between rounded-[22px] bg-mist p-4 font-extrabold">
            Adventskalender vorab ansehen
            <ChevronRight size={20} className="text-ink-soft" />
          </Link>
          <TransferSection />
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="self-start text-sm font-extrabold text-rose-dark underline">
              Spielstand von {save.profile?.name} löschen
            </button>
          ) : (
            <div className="rounded-2xl bg-rose-light p-3">
              <p className="mb-2 text-sm font-extrabold">Wirklich den ganzen Spielstand von {save.profile?.name} löschen? Das kann man nicht rückgängig machen.</p>
              <div className="flex gap-2">
                <Button tone="rose" size="md" onClick={resetAll}>
                  Ja, löschen
                </Button>
                <Button tone="white" size="md" onClick={() => setConfirmReset(false)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
