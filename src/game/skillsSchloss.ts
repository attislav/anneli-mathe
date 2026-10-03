// Welt 7 · Uhrenschloss — Uhr lesen, Uhr stellen, Zeitspannen.
//
// Uhrzeiten schreiben wir wie im Schulbuch „3:30 Uhr“, gesprochen „halb 4“.
// Stundenzahlen bleiben Ziffern — Zahlwörter lesen ist eine zweite Hürde.

import { chance, pick, randInt, shuffle } from "./random";
import { numeric, type Skill } from "./genkit";

const pad = (m: number) => String(m).padStart(2, "0");
/** „3:05 Uhr“ */
export const fmtTime = (h: number, m: number) => `${h}:${pad(m)} Uhr`;
const next = (h: number) => (h % 12) + 1;

/** Umgangssprachlich: „Viertel nach 3“, „halb 4“, „Viertel vor 4“, „3 Uhr“. */
export function timeWords(h: number, m: number): string {
  if (m === 0) return `${h} Uhr`;
  if (m === 15) return `Viertel nach ${h}`;
  if (m === 30) return `halb ${next(h)}`;
  if (m === 45) return `Viertel vor ${next(h)}`;
  if (m < 30) return `${m} nach ${h}`;
  return `${60 - m} vor ${next(h)}`;
}

/** Minuten-Raster je Stufe: volle → halbe → Viertel → 5 Minuten. */
const STEP: Record<number, 5 | 15 | 30 | 60> = { 1: 60, 2: 30, 3: 15, 4: 5, 5: 5 };

function randomTime(level: number): [number, number] {
  const step = STEP[level];
  return [randInt(1, 12), step === 60 ? 0 : step * randInt(0, 60 / step - 1)];
}

/** Falsche Uhrzeiten, die typische Fehler abbilden (Zeiger vertauscht, eine Stunde daneben). */
function timeOptions(h: number, m: number, level: number): string[] {
  const correct = fmtTime(h, m);
  const cands = new Set<string>();
  const swapH = m === 0 ? 12 : m / 5; // Minutenzeiger als Stunde gelesen
  const swapM = (h % 12) * 5;
  if (swapH >= 1 && swapH <= 12) cands.add(fmtTime(swapH, swapM));
  cands.add(fmtTime(next(h), m));
  cands.add(fmtTime(h === 1 ? 12 : h - 1, m));
  if (m === 30) cands.add(fmtTime(next(h), 30));
  if (level >= 2) cands.add(fmtTime(h, (m + 30) % 60));
  if (level >= 3) cands.add(fmtTime(h, (m + 15) % 60));
  cands.add(fmtTime(h, (m + 5 * randInt(1, 3)) % 60));
  cands.delete(correct);
  return shuffle([correct, ...shuffle([...cands]).slice(0, 3)]);
}

function readHint(h: number, m: number): string {
  if (m === 0) return "Der lange Zeiger zeigt genau nach oben auf die 12 — also volle Stunde. Wohin zeigt der kurze?";
  if (m === 30) return `Der lange Zeiger steht unten auf der 6: halbe Stunde. Der kurze ist schon über die ${h} hinaus.`;
  return `Der lange Zeiger zeigt die Minuten: Zähl in 5er-Schritten von der 12 bis zu ihm. Der kurze zeigt die Stunde.`;
}

const uhrLesen: Skill = {
  id: "uhrLesen",
  title: "Uhr lesen",
  world: "schloss",
  gen: (ctx) => {
    const { level } = ctx;
    const [h, m] = randomTime(level);
    const visual = { kind: "clock" as const, hour: h, minute: m };
    const solution = `Es ist ${fmtTime(h, m)} — man sagt auch „${timeWords(h, m)}“.`;
    if (level === 5 && chance(0.4)) {
      // Nachmittags: 24-Stunden-Zeit
      const hh = h === 12 ? 12 : h + 12;
      const correct = fmtTime(hh, m);
      const wrong = [fmtTime(h, m), fmtTime(hh === 23 ? 13 : hh + 1, m), fmtTime(hh, (m + 30) % 60)].filter((w) => w !== correct);
      return {
        format: "choice",
        question: "Es ist nachmittags. Wie spät ist es?",
        visual,
        options: shuffle([correct, ...new Set(wrong)].slice(0, 4)),
        answer: correct,
        hint: `Nachmittags zählt man ab 12 weiter: ${h} Uhr nachmittags ist ${h} + 12.`,
        solution: `${fmtTime(h, m)} am Nachmittag ist ${correct}.`,
      };
    }
    return { format: "choice", question: "Wie spät ist es?", visual, options: timeOptions(h, m, level), answer: fmtTime(h, m), hint: readHint(h, m), solution };
  },
};

const uhrStellen: Skill = {
  id: "uhrStellen",
  title: "Uhr stellen",
  world: "schloss",
  gen: (ctx) => {
    const { level } = ctx;
    const [rh, m] = randomTime(level);
    // Die Uhr startet auf 12:00 — die Aufgabe darf nicht schon gelöst sein.
    const h = rh === 12 && m === 0 ? randInt(1, 11) : rh;
    const say = level >= 3 && m !== 0 && chance(0.5);
    return {
      format: "clock-set",
      question: say ? `Stell die Uhr auf „${timeWords(h, m)}“.` : `Stell die Uhr auf ${fmtTime(h, m)}.`,
      hour: h,
      minute: m,
      step: STEP[level],
      hint: m === 0 ? `Langer Zeiger auf die 12, kurzer Zeiger auf die ${h}.` : `Erst den langen Zeiger: ${m} Minuten sind ${m / 5} Fünferschritte ab der 12. Dann den kurzen in die Nähe der ${h}.`,
      solution: `${fmtTime(h, m)}: Der lange Zeiger steht auf der ${m === 0 ? 12 : m / 5}, der kurze bei der ${h}.`,
    };
  },
};

const zeitWoerter: Skill = {
  id: "zeitWoerter",
  title: "Viertel, halb, dreiviertel",
  world: "schloss",
  trick: {
    title: "Halb heißt: halb zur nächsten",
    example: "halb 4",
    steps: ["„Halb 4“ heißt: Die halbe Stunde BIS 4 Uhr ist geschafft.", "Also ist es 3:30 Uhr — nicht 4:30!", "„Viertel vor 4“ ist 3:45 Uhr, „Viertel nach 3“ ist 3:15 Uhr."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const h = randInt(1, 12);
    const m = level === 1 ? pick([0, 30]) : level === 2 ? pick([30, 15]) : level <= 4 ? pick([15, 30, 45]) : pick([15, 30, 45, 5, 10, 20, 40, 50, 55]);
    const words = timeWords(h, m);
    const toDigits = level <= 2 || chance(0.6);
    if (toDigits) {
      const correct = fmtTime(h, m);
      const wrongs = new Set([fmtTime(next(h), m), fmtTime(h, (m + 30) % 60), fmtTime(h === 1 ? 12 : h - 1, m), fmtTime(h, 60 - m === 60 ? 0 : 60 - m)]);
      wrongs.delete(correct);
      return {
        format: "choice",
        question: `Welche Uhrzeit ist „${words}“?`,
        options: shuffle([correct, ...[...wrongs].slice(0, 3)]),
        answer: correct,
        hint: m === 30 ? `„Halb ${next(h)}“ — die halbe Stunde VOR ${next(h)} Uhr.` : m === 45 ? `„Viertel vor ${next(h)}“ — noch eine Viertelstunde bis ${next(h)} Uhr.` : `Schau, welche Stunde gerade läuft.`,
        solution: `„${words}“ ist ${correct}.`,
      };
    }
    const correct = words;
    const wrongs = new Set([timeWords(next(h), m), timeWords(h, (m + 30) % 60), timeWords(h === 1 ? 12 : h - 1, m)]);
    wrongs.delete(correct);
    return {
      format: "choice",
      question: `Wie sagt man zu ${fmtTime(h, m)}?`,
      options: shuffle([correct, ...[...wrongs].slice(0, 3)]),
      answer: correct,
      hint: m === 30 ? `Bei halb nennt man die NÄCHSTE Stunde.` : `Liegt die Zeit vor oder nach der vollen Stunde?`,
      solution: `${fmtTime(h, m)} sagt man „${words}“.`,
    };
  },
};

const zeitspanne: Skill = {
  id: "zeitspanne",
  title: "Wie lange dauert es?",
  world: "schloss",
  trick: {
    title: "Erst zur vollen Stunde",
    example: "7:45 → 8:20",
    steps: ["Spring zuerst zur nächsten vollen Stunde: 7:45 → 8:00 sind 15 Minuten.", "Dann weiter bis zum Ende: 8:00 → 8:20 sind 20 Minuten.", "Zusammen: 15 + 20 = 35 Minuten."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    if (level === 1) {
      const a = randInt(1, 9);
      const d = randInt(1, 3);
      return numeric(ctx, `${a} Uhr → ${a + d} Uhr: ? Stunden`, d, { question: `Von ${a} Uhr bis ${a + d} Uhr. Wie viele Stunden sind das?`, hint: `Zähl die Stunden: ${a} … ${a + 1} …`, solution: `${a + d} − ${a} = ${d} Stunden.` });
    }
    if (level === 2) {
      const h = randInt(1, 11);
      const a = 15 * randInt(0, 2);
      const b = a + 15 * randInt(1, 4 - a / 15);
      const end = Math.min(b, 60);
      const endTxt = end === 60 ? fmtTime(h + 1, 0) : fmtTime(h, end);
      return numeric(ctx, `? Minuten`, end - a, { question: `Von ${fmtTime(h, a)} bis ${endTxt}. Wie viele Minuten?`, hint: "Eine Viertelstunde sind 15 Minuten. Zähl die Viertel.", solution: `Das sind ${end - a} Minuten.` });
    }
    // Über die volle Stunde hinweg
    const h = randInt(1, 10);
    const step = level === 3 ? 15 : 5;
    const a = 60 - step * randInt(1, level === 3 ? 3 : 6);
    const b = step * randInt(level === 3 ? 0 : 1, level === 3 ? 3 : 6);
    const dur = 60 - a + b;
    if (level === 5 && chance(0.5)) {
      const start = fmtTime(h, a);
      const correct = fmtTime(h + 1, b);
      const wrongs = new Set([fmtTime(h, b), fmtTime(h + 1, (b + 10) % 60), fmtTime(h + 2, b), fmtTime(h + 1, Math.abs(b - 5))]);
      wrongs.delete(correct);
      return {
        format: "choice",
        question: `Der Ritter-Film beginnt um ${start} und dauert ${dur} Minuten. Wann ist er zu Ende?`,
        options: shuffle([correct, ...[...wrongs].slice(0, 3)]),
        answer: correct,
        hint: `Erst bis zur vollen Stunde: ${start} → ${fmtTime(h + 1, 0)} sind ${60 - a} Minuten. Dann noch ${dur - (60 - a)} Minuten.`,
        solution: `${start} + ${dur} Minuten = ${correct}.`,
      };
    }
    return numeric(ctx, `? Minuten`, dur, {
      question: `Von ${fmtTime(h, a)} bis ${fmtTime(h + 1, b)}. Wie viele Minuten sind das?`,
      hint: `Erst bis zur vollen Stunde: ${fmtTime(h, a)} → ${fmtTime(h + 1, 0)} sind ${60 - a} Minuten. Dann noch bis ${fmtTime(h + 1, b)}.`,
      solution: `${60 - a} + ${b} = ${dur} Minuten.`,
    });
  },
};

const zeitEinheiten: Skill = {
  id: "zeitEinheiten",
  title: "Stunden und Minuten",
  world: "schloss",
  gen: (ctx) => {
    const { level } = ctx;
    if (level <= 2) {
      const [label, min] = pick([
        ["eine Stunde", 60],
        ["eine halbe Stunde", 30],
        ["eine Viertelstunde", 15],
        ...(level === 2 ? [["eine Dreiviertelstunde", 45] as [string, number], ["zwei Stunden", 120] as [string, number]] : []),
      ] as [string, number][]);
      return numeric(ctx, `? Minuten`, min, { question: `Wie viele Minuten hat ${label}?`, hint: "Eine ganze Stunde hat 60 Minuten. Die Hälfte davon ist eine halbe Stunde.", solution: `${label[0].toUpperCase()}${label.slice(1)} hat ${min} Minuten.` }, [0, 150]);
    }
    if (level === 3) {
      const hrs = randInt(1, 2);
      const extra = pick([15, 30, 45]);
      return numeric(ctx, `? Minuten`, hrs * 60 + extra, { question: `${hrs} Stunde${hrs > 1 ? "n" : ""} und ${extra} Minuten — wie viele Minuten sind das?`, hint: `Jede Stunde sind 60 Minuten: ${hrs} · 60 = ${hrs * 60}. Dann noch ${extra} dazu.`, solution: `${hrs * 60} + ${extra} = ${hrs * 60 + extra} Minuten.` }, [0, 200]);
    }
    // Minuten → Stunden und Minuten
    const total = level === 4 ? pick([70, 75, 80, 90, 100, 105]) : 5 * randInt(13, 35);
    const hrs = Math.floor(total / 60);
    const rest = total - hrs * 60;
    return numeric(ctx, `${total} Minuten = ${hrs} Std. und ? Minuten`, rest, { question: "Wie viele Minuten bleiben übrig?", hint: `Nimm 60 Minuten für jede volle Stunde weg: ${total} − ${hrs * 60}.`, solution: `${total} − ${hrs * 60} = ${rest}. Also ${hrs} Stunde${hrs > 1 ? "n" : ""} und ${rest} Minuten.` });
  },
};

export const SCHLOSS_SKILLS: Skill[] = [uhrLesen, uhrStellen, zeitWoerter, zeitspanne, zeitEinheiten];
