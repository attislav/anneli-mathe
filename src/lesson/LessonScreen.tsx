"use client";

// Eine Lektion spielen: (Trick) → Aufgaben → Ergebnis mit Truhe.

import { claimBadges } from "@/game/badges";
import { notePractice, practiceNode, PRACTICE_ID, reviewPractice } from "@/game/practice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Volume2, X } from "lucide-react";
import { starsFor, type Tier } from "@/game/adaptive";
import { petStage } from "@/game/collection";
import { getSkill } from "@/game/skills";
import { bestStars, lessonRewards, levelInfo, logAnswer, readSave, recordLesson, type Reward, type SaveState } from "@/game/state";
import { sfx } from "@/game/sound";
import { stopSpeaking } from "@/game/speech";
import { canRead, canReadText, readTask, readText, stopReading } from "@/game/taskVoice";
import { say, stopVoice } from "@/game/voice";
import type { Task } from "@/game/types";
import { findNode, type PathNode, type World } from "@/game/worlds";
import { CoinIcon } from "@/ui/art";
import { Button, LinkButton } from "@/ui/Button";
import { Sheet, Splash, useBackdrop } from "@/ui/chrome";
import { BossArt } from "@/ui/Creatures";
import { Pet, type Mood } from "@/ui/Pet";
import { completeTask, firstAnswer, isFinished, lateRight, nextTask, startRun, taskCount, BOSS_HP, type Run } from "./engine";
import { TaskView, type Status } from "./formats";
import { ResultView, type Outcome } from "./ResultView";
import { TrickIntro } from "./TrickIntro";
import { HelpSheet } from "./HelpSheet";
import { jumpsFor } from "@/game/jumps";
import { tricksFor } from "@/game/tricks";
import { NumberJump } from "@/ui/NumberJump";

const PRAISE = ["Juhu!", "Super!", "Prima!", "Stark!", "Richtig!", "Genau!"];
const CHEERS = ["Du schaffst das!", "Schau genau hin.", "Ich glaub an dich!", "Los geht's!", "Denk an den Trick!"];

export function LessonScreen({ save, nodeId, tier }: { save: SaveState; nodeId: string; tier: Tier }) {
  const router = useRouter();
  // Die Übungskiste einmal pro Aufruf festhalten — sie ändert sich, während man sie spielt.
  // Normale Lektionen bei jedem Render suchen (die Adresse kann beim Laden kurz leer sein).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const practice = useMemo(() => (nodeId === PRACTICE_ID ? practiceNode(save) : null), [nodeId]);
  const found = nodeId === PRACTICE_ID ? practice : nodeId ? findNode(nodeId) : null;
  const missing = !found || found.node.kind === "chest";

  // Keine Sackgasse: z. B. nach „Zurück" in eine schon geleerte Übungskiste.
  useEffect(() => {
    if (!missing) return;
    const t = setTimeout(() => router.replace("/"), 1800);
    return () => clearTimeout(t);
  }, [missing, nodeId, router]);

  if (!nodeId) return <Splash />;
  if (!found || found.node.kind === "chest") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-2xl">{nodeId === PRACTICE_ID ? "Die Übungskiste ist leer – super!" : "Diese Lektion gibt es nicht."}</p>
        <LinkButton href="/">Zum Pfad</LinkButton>
      </main>
    );
  }
  return <Replayable key={nodeId} save={save} node={found.node} world={found.world} tier={tier} />;
}

function Replayable(props: { save: SaveState; node: PathNode; world: World; tier: Tier }) {
  const [round, setRound] = useState({ n: 0, easier: false });
  return <Lesson key={round.n} {...props} easier={round.easier} onReplay={(easier) => setRound((r) => ({ n: r.n + 1, easier }))} />;
}

function Lesson({ save, node, world, tier, easier, onReplay }: { save: SaveState; node: PathNode; world: World; tier: Tier; easier: boolean; onReplay: (easier: boolean) => void }) {
  const trick = node.kind === "trick" ? getSkill(node.skills[0]).trick : undefined;
  const [phase, setPhase] = useState<"intro" | "play" | "result">(trick ? "intro" : "play");
  const [run, setRun] = useState<Run>(() => startRun(node, tier, save.mastery, easier));
  const [task, setTask] = useState<Task>(() => nextTask(startRun(node, tier, save.mastery, easier)));
  // Wann die aktuelle Aufgabe erschienen ist — für die Antwortzeit im Lernbericht.
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, [task, phase]);
  const [attempt, setAttempt] = useState(0);
  const [retry, setRetry] = useState(0);
  const [status, setStatus] = useState<Status>("ask");
  const [praise, setPraise] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [quit, setQuit] = useState(false);
  // Hilfe: Feststecken erkennen (2× hintereinander falsch oder lange keine Antwort).
  const [wrongInRow, setWrongInRow] = useState(0);
  const [idleAt, setIdleAt] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [helpTask, setHelpTask] = useState<string | null>(null);
  const autoNext = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sperre gegen doppeltes Weiterschalten (Auto-Weiter und Tippen gleichzeitig).
  const advancing = useRef(false);

  const isBoss = node.kind === "boss";
  useBackdrop(isBoss ? "#24275E" : "#F4F1FF");
  const total = taskCount(node);
  const level = levelInfo(save.xp).level;

  // Neue Aufgabe vorlesen, wenn „automatisch vorlesen" an ist.
  useEffect(() => {
    if (phase === "play" && readSave().settings.autoRead) void readTask({ question: task.question, term: "term" in task ? task.term : undefined });
  }, [task, phase]);

  useEffect(
    () => () => {
      stopSpeaking();
      stopVoice();
      stopReading();
    },
    [],
  );

  const finish = useCallback(
    (r: Run) => {
      const s = readSave();
      const firstTime = isBoss ? !s.bosses.includes(node.id) : bestStars(s, node.id) === 0;
      // Der Boss ist geschafft, sobald er besiegt ist. Sonst gilt: weniger als die
      // Hälfte gleich richtig → 0 Sterne, keine Truhe, nichts freigeschaltet.
      const stars = isBoss ? Math.max(1, starsFor(r.firstTry, r.done)) : starsFor(r.firstTry, r.done);
      const passed = stars > 0;
      const rewards: Reward[] = passed ? lessonRewards(s, node, world, firstTime) : [];
      const xp = passed ? 10 + r.firstTry * 3 + (isBoss ? 20 : 0) : r.firstTry * 2;
      const before = levelInfo(s.xp);
      recordLesson({ node, world, tier, stars, coins: r.coins, xp, tasks: r.done, firstTry: r.firstTry, mastery: r.mastery, rewards, passed });
      if (passed) rewards.push(...claimBadges(readSave()));
      const after = levelInfo(readSave().xp);
      if (passed) sfx.fanfare();
      setOutcome({ stars, coins: r.coins, xp, firstTry: r.firstTry, done: r.done, rewards, levelBefore: before.level, levelAfter: after, bestStreak: r.bestStreak });
      setPhase("result");
    },
    [isBoss, node, world, tier],
  );

  const advance = useCallback(() => {
    if (advancing.current) return;
    advancing.current = true;
    if (autoNext.current) clearTimeout(autoNext.current);
    autoNext.current = null;
    if (status === "wrong") {
      setStatus("ask");
      setRetry((n) => n + 1);
      return;
    }
    const r = completeTask(run, status === "right");
    setRun(r);
    if (isFinished(r)) {
      finish(r);
      return;
    }
    setTask(nextTask(r));
    setAttempt(0);
    setStatus("ask");
  }, [status, run, finish]);

  useEffect(() => {
    advancing.current = false;
  }, [task, status, retry]);

  // Lange keine Antwort? Dann bietet das Haustier Hilfe an.
  const idleKey = `${task.id}-${retry}`;
  useEffect(() => {
    if (status !== "ask" || phase !== "play") return;
    const t = setTimeout(() => setIdleAt(idleKey), 45000);
    return () => clearTimeout(t);
  }, [idleKey, status, phase]);
  const idle = idleAt === idleKey;

  const stuck = status === "ask" && (wrongInRow >= 2 || idle) && helpTask !== task.id;
  useEffect(() => {
    if (stuck) void say("help");
  }, [stuck]);

  const openHelp = () => {
    stopReading();
    setHelpTask(task.id);
    setWrongInRow(0);
    setHelp(true);
  };

  useEffect(() => {
    if (status !== "right") return;
    autoNext.current = setTimeout(advance, 1300);
    return () => {
      if (autoNext.current) clearTimeout(autoNext.current);
    };
  }, [status, advance]);

  const onAnswer = (correct: boolean) => {
    if (status !== "ask") return;
    stopReading();
    if (attempt === 0) {
      setWrongInRow((n) => (correct ? 0 : n + 1));
      logAnswer({ t: Math.round(Date.now() / 1000), s: task.skillId, l: task.level, ok: correct ? 1 : 0, ms: Math.min(600000, Date.now() - shownAt.current), ...(node.practice ? { p: 1 as const } : {}) });
      if (node.practice) reviewPractice(task, correct);
      else notePractice(task, correct);
      const res = firstAnswer(run, task, correct);
      setRun(res.run);
      if (correct) {
        setStatus("right");
        setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
        // Während der Aufgaben bewusst leise: Töne und Lob lenken ab.
        // Belohnung (Sterne, Münzen, Fanfare) gibt es gesammelt am Ende.
      } else {
        setStatus("wrong");
        setAttempt(1);
      }
      return;
    }
    if (correct) {
      const res = lateRight(run);
      setRun(res.run);
      setStatus("right");
      setPraise("Geschafft!");
    } else {
      setStatus("reveal");
    }
  };

  if (phase === "intro" && trick) return <TrickIntro trick={trick} save={save} onDone={() => setPhase("play")} />;
  if (phase === "result" && outcome) return <ResultView outcome={outcome} node={node} world={world} tier={tier} save={save} onReplay={onReplay} />;

  const petMood: Mood = status === "right" ? "joy" : status === "wrong" || status === "reveal" ? "think" : "happy";
  const bubble = status === "right" ? praise : status === "wrong" ? "Kein Problem — hier ist ein Tipp." : status === "reveal" ? "So geht's. Beim nächsten Mal klappt's!" : CHEERS[run.done % CHEERS.length];
  const progress = isBoss ? (BOSS_HP - run.bossHp + (status === "right" ? 1 : 0)) / BOSS_HP : (run.done + (status === "right" || status === "reveal" ? 1 : 0)) / total;
  const term = "term" in task ? task.term : undefined;

  return (
    <main className={`mx-auto flex min-h-dvh max-w-xl flex-col pb-60 ${isBoss ? "bg-night" : "bg-mist"}`}>
      <div className="flex items-center gap-3 px-4 pb-2 pt-4">
        <button aria-label="Lektion beenden" onClick={() => setQuit(true)} className="chunky flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white" style={{ ["--shade" as string]: "#DCD6F5", ["--depth" as string]: "4px" }}>
          <X size={22} strokeWidth={3} className="text-ink-soft" />
        </button>
        <div className={`h-4 flex-1 overflow-hidden rounded-full ${isBoss ? "bg-night-light" : "bg-[#E4E0F5]"}`}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(4, progress * 100)}%`, background: isBoss ? "#FF5D9E" : "#2BB673" }} />
        </div>
        <div className="relative flex shrink-0 items-center gap-1.5 rounded-full bg-coin-light py-1.5 pl-2 pr-3 font-display text-lg font-semibold text-ink">
          <CoinIcon size={22} />
          {save.coins}
        </div>
      </div>

      <div className="h-8" />

      {isBoss && (
        <div className="flex flex-col items-center gap-2 px-4">
          <div key={status === "right" ? `hit-${run.done}` : "idle"} className={status === "right" ? "anim-hit" : ""}>
            <BossArt world={world.id} color={world.boss.color} size={120} mood={status === "right" ? "ouch" : "grin"} />
          </div>
          <div className="flex gap-1.5" aria-label={`Boss hat noch ${run.bossHp} Leben`}>
            {Array.from({ length: BOSS_HP }, (_, i) => (
              <div key={i} className="h-3.5 w-7 rounded-full transition-colors" style={{ background: i < run.bossHp - (status === "right" ? 1 : 0) ? "#FF5D9E" : "#3A3E85" }} />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2.5 px-4 pt-1">
        {save.profile && <Pet species={save.profile.pet} stage={petStage(level)} mood={petMood} equipped={save.equipped} size={isBoss ? 60 : 72} className={status === "right" ? "anim-pop" : status === "wrong" ? "anim-wiggle" : ""} />}
        {stuck ? (
          <button onClick={openHelp} className="anim-pop mb-5 flex items-center gap-2 rounded-[18px] rounded-bl-[4px] bg-sun px-4 py-2.5 font-extrabold text-ink shadow-[0_3px_0_#E5A100]">
            <Lightbulb size={20} strokeWidth={2.6} /> Soll ich&apos;s dir zeigen?
          </button>
        ) : (
          <div className="mb-5 rounded-[18px] rounded-bl-[4px] bg-white px-4 py-2.5 font-extrabold text-ink shadow-[0_3px_0_#E4E0F5]">{bubble}</div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 px-4 pb-4 pt-2">
        <h1 className={`font-display text-[1.75rem] font-semibold leading-tight ${isBoss ? "text-white" : ""}`}>{task.question}</h1>
        <div className="flex shrink-0 gap-2">
        <button aria-label="Hilfe" onClick={openHelp} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sun-light text-[#B36B00]">
          <Lightbulb size={22} strokeWidth={2.5} />
        </button>
        {canRead({ question: task.question, term }) && (
          <button aria-label="Vorlesen" onClick={() => void readTask({ question: task.question, term })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-grape-light text-grape">
            <Volume2 size={22} strokeWidth={2.5} />
          </button>
        )}
        </div>
      </div>

      <div className="px-4">
        <TaskView key={task.format === "input" || task.format === "wall" ? `${task.id}-${retry}` : task.id} task={task} status={status} onAnswer={onAnswer} />
      </div>

      {status !== "ask" && <Feedback status={status} task={task} praise={praise} onNext={advance} onHelp={openHelp} />}

      {help && <HelpSheet task={task} save={save} showHint={status !== "reveal"} onClose={() => setHelp(false)} />}

      <Sheet open={quit} onClose={() => setQuit(false)}>
        <div className="flex flex-col gap-3 text-center">
          <h2 className="font-display text-2xl font-semibold">Wirklich aufhören?</h2>
          <p className="text-ink-soft">Deine Münzen aus dieser Runde gehen dann verloren.</p>
          <Button tone="leaf" onClick={() => setQuit(false)}>
            Weiterspielen
          </Button>
          <LinkButton href="/" tone="white">
            Aufhören
          </LinkButton>
        </div>
      </Sheet>
    </main>
  );
}

function Feedback({ status, task, praise, onNext, onHelp }: { status: Status; task: Task; praise: string; onNext: () => void; onHelp: () => void }) {
  if (status === "right") {
    return (
      <div className="anim-sheet fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl rounded-t-[28px] border-t-4 border-leaf bg-leaf-light px-5 pb-[calc(26px+env(safe-area-inset-bottom))] pt-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="anim-pop flex h-12 w-12 items-center justify-center rounded-full bg-leaf text-white">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="font-display text-2xl font-semibold text-leaf-dark">{praise}</div>
        </div>
        <Button tone="leaf" className="w-full" onClick={onNext}>
          Weiter
        </Button>
      </div>
    );
  }
  const reveal = status === "reveal";
  const jumps = jumpsFor("term" in task ? task.term : undefined);
  return (
    <div className="anim-sheet fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl rounded-t-[28px] border-t-4 border-[#FFB648] bg-[#FFF1DB] px-5 pb-[calc(26px+env(safe-area-inset-bottom))] pt-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFB648] text-white">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-display text-2xl font-semibold text-[#8A4B00]">{reveal ? "So geht's:" : "Fast! Kleiner Tipp:"}</div>
          <div className="mt-0.5 text-[17px] leading-snug text-[#6B3A00]">{reveal ? task.solution : task.hint}</div>
          {!reveal && jumps && (
            <div className="mt-2 rounded-[16px] bg-white/80 px-2 pt-1">
              <NumberJump jumps={jumps} />
            </div>
          )}
        </div>
        {canReadText(reveal ? task.solution : task.hint) && (
          <button aria-label="Vorlesen" onClick={() => void readText(reveal ? task.solution : task.hint)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#8A4B00]">
            <Volume2 size={20} />
          </button>
        )}
      </div>
      <button onClick={onHelp} className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-white/70 py-2.5 font-extrabold text-[#8A4B00]">
        <Lightbulb size={20} strokeWidth={2.5} /> {tricksFor("term" in task ? task.term : undefined).length ? "Zeig mir einen Trick" : "Zeig mir, wie's geht"}
      </button>
      <Button tone="coin" className="w-full" onClick={onNext}>
        {reveal ? "Weiter" : "Nochmal probieren"}
      </Button>
    </div>
  );
}
