// Welt 8 · Formen-Ozean — Formen, Körper, Spiegeln, Muster.

import type { ShapeId, ShapeItem, SolidId, TaskDraft, Visual } from "./types";
import { chance, pick, randInt, shuffle } from "./random";
import { chooseFormat, numeric, type Skill } from "./genkit";

export const SHAPE_NAMES: Record<ShapeId, string> = { kreis: "Kreis", dreieck: "Dreieck", quadrat: "Quadrat", rechteck: "Rechteck", fuenfeck: "Fünfeck", sechseck: "Sechseck" };
const SHAPE_PLURAL: Record<ShapeId, string> = { kreis: "Kreise", dreieck: "Dreiecke", quadrat: "Quadrate", rechteck: "Rechtecke", fuenfeck: "Fünfecke", sechseck: "Sechsecke" };
const CORNERS: Record<ShapeId, number> = { kreis: 0, dreieck: 3, quadrat: 4, rechteck: 4, fuenfeck: 5, sechseck: 6 };

export const SOLID_NAMES: Record<SolidId, string> = { wuerfel: "Würfel", quader: "Quader", kugel: "Kugel", zylinder: "Zylinder", kegel: "Kegel", pyramide: "Pyramide" };
const SOLID_FACES: Record<SolidId, number> = { wuerfel: 6, quader: 6, kugel: 1, zylinder: 3, kegel: 2, pyramide: 5 };
const SOLID_CORNERS: Record<SolidId, number> = { wuerfel: 8, quader: 8, kugel: 0, zylinder: 0, kegel: 1, pyramide: 5 };
const ROLLS: Record<SolidId, boolean> = { wuerfel: false, quader: false, kugel: true, zylinder: true, kegel: true, pyramide: false };

const COLORS = ["#FF5D5D", "#4CC3FF", "#FFC531", "#2BB673", "#9B7BFF", "#FF9F1C"];
const EASY: ShapeId[] = ["kreis", "dreieck", "quadrat", "rechteck"];
const ALL: ShapeId[] = [...EASY, "fuenfeck", "sechseck"];

function choiceOf(question: string, correct: string, pool: string[], t: { hint: string; solution: string }, visual?: Visual): TaskDraft {
  const wrong = shuffle(pool.filter((p) => p !== correct)).slice(0, 3);
  return { format: "choice", question, visual, options: shuffle([correct, ...wrong]), answer: correct, hint: t.hint, solution: t.solution };
}

const formen: Skill = {
  id: "formen",
  title: "Formen erkennen",
  world: "ozean",
  gen: (ctx) => {
    const { level } = ctx;
    const pool = level <= 2 ? EASY : ALL;
    const shape = pick(pool);
    const color = pick(COLORS);
    const visual = { kind: "shapes" as const, items: [{ shape, color, size: 1.6 }] };
    const corners = CORNERS[shape];
    const cornerHint = shape === "kreis" ? "Ein Kreis ist ganz rund — er hat keine Ecken." : `Fahr mit dem Finger am Rand entlang und zähl jede Ecke.`;
    if (level >= 3 && (level === 3 || chance(0.5))) {
      if (level === 5) {
        const other = pick(ALL.filter((s) => s !== shape));
        const sum = corners + CORNERS[other];
        return numeric(ctx, `? Ecken`, sum, { question: "Wie viele Ecken haben beide Formen zusammen?", hint: `Zähl erst die Ecken der einen Form, dann der anderen, und rechne plus.`, solution: `${SHAPE_NAMES[shape]}: ${corners}, ${SHAPE_NAMES[other]}: ${CORNERS[other]} — zusammen ${sum}.` });
      }
      const d = numeric(ctx, `? Ecken`, corners, { question: `Wie viele Ecken hat ein ${SHAPE_NAMES[shape]}?`, hint: cornerHint, solution: `Ein ${SHAPE_NAMES[shape]} hat ${corners} Ecken.` });
      return { ...d, visual } as TaskDraft;
    }
    if (level === 4) {
      const riddles: [string, ShapeId][] = [
        ["Ich habe 4 gleich lange Seiten und 4 Ecken.", "quadrat"],
        ["Ich habe 3 Ecken und 3 Seiten.", "dreieck"],
        ["Ich bin rund und habe keine Ecke.", "kreis"],
        ["Ich habe 4 Ecken, aber zwei lange und zwei kurze Seiten.", "rechteck"],
        ["Ich habe 6 Ecken — wie eine Bienenwabe.", "sechseck"],
      ];
      const [text, ans] = pick(riddles);
      return choiceOf(`${text} Wer bin ich?`, SHAPE_NAMES[ans], ALL.map((s) => SHAPE_NAMES[s]), { hint: "Zähl im Kopf die Ecken und denk an die Seiten.", solution: `Das ist ein ${SHAPE_NAMES[ans]}.` });
    }
    return choiceOf("Wie heißt diese Form?", SHAPE_NAMES[shape], pool.map((s) => SHAPE_NAMES[s]), { hint: cornerHint, solution: `Das ist ein ${SHAPE_NAMES[shape]} — ${corners === 0 ? "ganz rund" : `${corners} Ecken`}.` }, visual);
  },
};

const formenZaehlen: Skill = {
  id: "formenZaehlen",
  title: "Formen zählen",
  world: "ozean",
  gen: (ctx) => {
    const { level } = ctx;
    const kinds = shuffle(level <= 2 ? EASY : ALL).slice(0, level <= 1 ? 2 : level <= 3 ? 3 : 4);
    const total = level <= 1 ? randInt(5, 6) : level <= 3 ? randInt(7, 9) : randInt(9, 12);
    const items: ShapeItem[] = Array.from({ length: total }, () => ({ shape: pick(kinds), color: pick(COLORS) }));
    const target = pick(kinds);
    const count = items.filter((i) => i.shape === target).length;
    const visual = { kind: "shapes" as const, items, scatter: true };
    if (level === 5 && target !== "kreis" && chance(0.5)) {
      const d = numeric(ctx, `? Ecken`, count * CORNERS[target], { question: `Wie viele Ecken haben alle ${SHAPE_PLURAL[target]} zusammen?`, hint: `Zähl die ${SHAPE_PLURAL[target]}: ${count}. Jedes hat ${CORNERS[target]} Ecken.`, solution: `${count} · ${CORNERS[target]} = ${count * CORNERS[target]}.` });
      return { ...d, visual } as TaskDraft;
    }
    const d = numeric(ctx, `? ${SHAPE_PLURAL[target]}`, count, { question: `Wie viele ${SHAPE_PLURAL[target]} siehst du?`, hint: `Tipp jedes ${SHAPE_NAMES[target]} in Gedanken an und zähl mit.`, solution: `Es sind ${count} ${count === 1 ? SHAPE_NAMES[target] : SHAPE_PLURAL[target]}.` }, [0, 15]);
    return { ...d, visual } as TaskDraft;
  },
};

const spiegeln: Skill = {
  id: "spiegeln",
  title: "Spiegeln",
  world: "ozean",
  trick: {
    title: "Gleich weit weg vom Spiegel",
    example: "▮ | ▮",
    steps: ["Die Linie in der Mitte ist der Spiegel.", "Ein Kästchen direkt am Spiegel bleibt auch drüben direkt am Spiegel.", "Zwei Kästchen weg vom Spiegel → drüben auch zwei Kästchen weg. Oben und unten bleiben gleich."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const [rows, half, n] = level === 1 ? [3, 2, randInt(2, 3)] : level === 2 ? [4, 3, randInt(3, 4)] : level === 3 ? [5, 3, 5] : level === 4 ? [5, 4, randInt(6, 7)] : [6, 4, 8];
    const all: [number, number][] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < half; c++) all.push([r, c]);
    const cells = shuffle(all).slice(0, n);
    return {
      format: "mirror",
      question: "Spiegle das Muster! Tippe rechts die Kästchen an.",
      rows,
      half,
      cells,
      color: pick(COLORS),
      hint: "Schau dir jedes Kästchen an: Wie weit ist es vom Spiegel weg? Drüben muss es genauso weit weg sein — in derselben Reihe.",
      solution: "Das Spiegelbild ist wie zugeklappt: jedes Kästchen landet in derselben Reihe, gleich weit vom Spiegel.",
    };
  },
};

const sameItem = (a: ShapeItem, b: ShapeItem) => a.shape === b.shape && a.color === b.color;

const muster: Skill = {
  id: "muster",
  title: "Muster fortsetzen",
  world: "ozean",
  gen: (ctx) => {
    const { level } = ctx;
    if (level >= 4 && chance(0.4)) {
      const start = randInt(1, 10);
      const step = level === 4 ? pick([2, 3, 5, 10]) : pick([3, 4, 6, 7, 9]);
      const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
      return numeric(ctx, `${seq.slice(0, 4).join(", ")}, ?`, seq[4], { question: "Wie geht das Zahlenmuster weiter?", hint: `Wie groß ist der Sprung von einer Zahl zur nächsten? ${seq[1]} − ${seq[0]} = ${step}.`, solution: `Immer + ${step}: ${seq[3]} + ${step} = ${seq[4]}.` });
    }
    const unitLen = level <= 2 ? 2 : level === 3 ? 3 : randInt(3, 4);
    const shapes = shuffle(EASY);
    const colors = shuffle(COLORS);
    const unit: ShapeItem[] = Array.from({ length: unitLen }, (_, i) => (level === 1 ? { shape: shapes[i], color: colors[0] } : { shape: shapes[i % shapes.length], color: colors[i] }));
    // Bei Stufe 2+ dürfen sich Formen wiederholen, aber nicht zwei gleiche Teile im Muster.
    if (level >= 4) unit[unitLen - 1] = { shape: unit[0].shape, color: colors[unitLen] };
    const shownLen = unitLen * 2 + randInt(0, unitLen - 1);
    const items = Array.from({ length: shownLen }, (_, i) => unit[i % unitLen]);
    const next = unit[shownLen % unitLen];
    const distractors: ShapeItem[] = [];
    for (const cand of [...unit, { shape: next.shape, color: pick(colors.filter((c) => c !== next.color)) }, { shape: pick(EASY.filter((s) => s !== next.shape)), color: next.color }]) {
      if (!sameItem(cand, next) && !distractors.some((d) => sameItem(d, cand))) distractors.push(cand);
    }
    const options = shuffle([next, ...distractors.slice(0, 3)]);
    return {
      format: "pattern",
      question: "Was kommt als Nächstes?",
      items,
      options,
      answer: options.findIndex((o) => sameItem(o, next)),
      hint: `Such das Stück, das sich immer wiederholt. Es ist ${unitLen} Teile lang.`,
      solution: `Das Muster wiederholt sich alle ${unitLen} Teile — als Nächstes kommt das ${SHAPE_NAMES[next.shape]}.`,
    };
  },
};

const koerper: Skill = {
  id: "koerper",
  title: "Körper",
  world: "ozean",
  gen: (ctx) => {
    const { level } = ctx;
    const pool: SolidId[] = level <= 2 ? ["wuerfel", "kugel", "zylinder", "pyramide"] : ["wuerfel", "quader", "kugel", "zylinder", "kegel", "pyramide"];
    const solid = pick(pool);
    const visual = { kind: "solid" as const, solid };
    if (level === 3 && chance(0.6)) {
      const correct = ROLLS[solid] ? "Ja, er kann rollen" : "Nein, er kippt nur";
      return { format: "choice", question: `Kann ${solid === "kugel" ? "die" : "der"} ${SOLID_NAMES[solid]} rollen?`, visual, options: ["Ja, er kann rollen", "Nein, er kippt nur"], answer: correct, hint: "Hat er eine runde, gebogene Fläche? Dann kann er rollen.", solution: ROLLS[solid] ? `${SOLID_NAMES[solid]}: Die gebogene Fläche rollt.` : `${SOLID_NAMES[solid]}: nur flache Flächen — er rollt nicht.` };
    }
    if (level >= 4) {
      const flat = solid !== "kugel";
      if (level === 5 && chance(0.5)) {
        const d = numeric(ctx, `? Ecken`, SOLID_CORNERS[solid], { question: `Wie viele Ecken hat ${solid === "kugel" || solid === "pyramide" ? "die" : "der"} ${SOLID_NAMES[solid]}?`, hint: "Zähl oben und unten getrennt.", solution: `${SOLID_NAMES[solid]}: ${SOLID_CORNERS[solid]} Ecken.` }, [0, 12]);
        return { ...d, visual } as TaskDraft;
      }
      if (flat) {
        const d = numeric(ctx, `? Flächen`, SOLID_FACES[solid], { question: `Wie viele Flächen hat ${solid === "pyramide" ? "die" : "der"} ${SOLID_NAMES[solid]}?`, hint: "Denk an die Flächen, die du nicht siehst: hinten und unten.", solution: `${SOLID_NAMES[solid]}: ${SOLID_FACES[solid]} Flächen.` }, [0, 12]);
        return { ...d, visual } as TaskDraft;
      }
    }
    return choiceOf("Wie heißt dieser Körper?", SOLID_NAMES[solid], pool.map((s) => SOLID_NAMES[s]), { hint: "Ist er rund? Hat er Ecken? Spitze oben?", solution: `Das ist ${solid === "kugel" || solid === "pyramide" ? "eine" : "ein"} ${SOLID_NAMES[solid]}.` }, visual);
  },
};

export const OZEAN_SKILLS: Skill[] = [formen, formenZaehlen, spiegeln, muster, koerper];
