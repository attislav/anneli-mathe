// Welt 10 · Detektivbüro — Daten und Sachaufgaben: Strichlisten,
// Säulendiagramme, Rechengeschichten, Möglichkeiten zählen, Fehler finden.

import type { DataIcon, DataRow, Level, TaskDraft } from "./types";
import { chance, pick, randInt, shuffle } from "./random";
import { chooseFormat, numeric, type GenCtx, type Skill } from "./genkit";

// ---------------------------------------------------------------------------
// Daten-Themen für Strichliste und Diagramm

type Theme = {
  rows: [DataIcon, string][];
  count: (l: string) => string;
  more: (a: string, b: string) => string;
  total: string;
  most: string;
  least: string;
  unit: string;
};

const THEMES: Theme[] = [
  {
    rows: [["apfel", "Äpfel"], ["banane", "Bananen"], ["birne", "Birnen"], ["kirsche", "Kirschen"], ["traube", "Trauben"]],
    count: (l) => `Wie viele Kinder mögen ${l} am liebsten?`,
    more: (a, b) => `Wie viele Kinder mehr mögen ${a} als ${b}?`,
    total: "Wie viele Kinder wurden insgesamt gefragt?",
    most: "Welches Obst mögen die meisten Kinder?",
    least: "Welches Obst mögen die wenigsten Kinder?",
    unit: "Kinder",
  },
  {
    rows: [["hund", "Hunde"], ["katze", "Katzen"], ["hase", "Hasen"], ["vogel", "Vögel"]],
    count: (l) => `Wie viele ${l} haben die Kinder?`,
    more: (a, b) => `Wie viele ${a} mehr als ${b} gibt es?`,
    total: "Wie viele Haustiere sind es insgesamt?",
    most: "Welches Haustier gibt es am häufigsten?",
    least: "Welches Haustier gibt es am seltensten?",
    unit: "Tiere",
  },
  {
    rows: [["sonne", "Sonnentage"], ["regen", "Regentage"], ["wolke", "Wolkentage"]],
    count: (l) => `Wie viele ${l} gab es?`,
    more: (a, b) => `Wie viele ${a} mehr als ${b} gab es?`,
    total: "Wie viele Tage wurden insgesamt notiert?",
    most: "Welches Wetter gab es am häufigsten?",
    least: "Welches Wetter gab es am seltensten?",
    unit: "Tage",
  },
];

/** `n` Zeilen mit verschiedenen Werten (Vielfache von `step`) zwischen `min` und `max`. */
function makeRows(theme: Theme, n: number, min: number, max: number, step = 1): DataRow[] {
  const picked = shuffle(theme.rows).slice(0, Math.min(n, theme.rows.length));
  const pool = shuffle(Array.from({ length: Math.floor(max / step) - Math.ceil(min / step) + 1 }, (_, i) => (Math.ceil(min / step) + i) * step));
  return picked.map(([icon, label], i) => ({ icon, label, value: pool[i] }));
}

function bundleText(v: number): string {
  const b = Math.floor(v / 5);
  const r = v % 5;
  if (b === 0) return `${v} einzelne Striche: ${v}.`;
  return `${b} Fünferbündel = ${b * 5}${r ? `, dazu ${r} Striche: ${v}` : ""}.`;
}

/** Eine Frage zu Daten stellen (für Strichliste und Diagramm gleich). */
function dataQuestion(ctx: GenCtx, theme: Theme, rows: DataRow[], kind: "count" | "most" | "least" | "more" | "total", read: (r: DataRow) => string): TaskDraft {
  if (kind === "most" || kind === "least") {
    const sorted = [...rows].sort((a, b) => a.value - b.value);
    const ans = kind === "most" ? sorted[sorted.length - 1] : sorted[0];
    return {
      format: "choice",
      question: kind === "most" ? theme.most : theme.least,
      options: rows.map((r) => r.label),
      answer: ans.label,
      hint: kind === "most" ? "Such den größten Wert." : "Such den kleinsten Wert.",
      solution: `${ans.label}: ${ans.value}. ${kind === "most" ? "Das ist am meisten." : "Das ist am wenigsten."}`,
    };
  }
  if (kind === "more") {
    const [a, b] = shuffle(rows).slice(0, 2);
    const [hi, lo] = a.value > b.value ? [a, b] : [b, a];
    const d = hi.value - lo.value;
    return numeric(ctx, `? ${theme.unit}`, d, {
      question: theme.more(hi.label, lo.label),
      hint: `${read(hi)} Und ${read(lo)} Rechne ${hi.value} − ${lo.value}.`,
      solution: `${hi.value} − ${lo.value} = ${d}.`,
    });
  }
  if (kind === "total") {
    const sum = rows.reduce((s, r) => s + r.value, 0);
    return numeric(ctx, `? ${theme.unit}`, sum, {
      question: theme.total,
      hint: `Lies alle Werte ab und zähl sie zusammen: ${rows.map((r) => r.value).join(" + ")}.`,
      solution: `${rows.map((r) => r.value).join(" + ")} = ${sum}.`,
    });
  }
  const r = pick(rows);
  return numeric(ctx, `? ${theme.unit}`, r.value, { question: theme.count(r.label), hint: read(r), solution: `${r.label}: ${r.value}.` });
}

const strichliste: Skill = {
  id: "strichliste",
  title: "Strichlisten",
  world: "detektiv",
  trick: {
    title: "Fünferbündel zählen",
    example: "5, 10, 15 …",
    steps: ["Bei einer Strichliste macht man 4 Striche und den fünften quer drüber. Das ist ein Fünferbündel.", "Zähl erst die Bündel in Fünferschritten: 5, 10, 15 …", "Dann zähl die einzelnen Striche dazu. Fertig!"],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const theme = pick(THEMES);
    const n = level >= 3 ? randInt(3, 4) : 3;
    const [min, max] = ([[1, 9], [3, 14], [4, 19], [3, 20], [5, 20]] as const)[level - 1];
    const rows = makeRows(theme, n, min, max);
    const kinds = level === 1 ? ["count"] : level === 2 ? ["count", "most", "least"] : level === 3 ? ["count", "more"] : level === 4 ? ["more", "total", "most"] : ["more", "total"];
    const kind = pick(kinds) as "count" | "most" | "least" | "more" | "total";
    const d = dataQuestion(ctx, theme, rows, kind, (r) => `${r.label}: ${bundleText(r.value)}`);
    return { ...d, visual: { kind: "tally", rows } } as TaskDraft;
  },
};

const DIAGRAM: Record<Level, { step: number; max: number }[]> = {
  1: [{ step: 1, max: 8 }],
  2: [{ step: 1, max: 10 }],
  3: [{ step: 2, max: 16 }],
  4: [{ step: 2, max: 20 }, { step: 5, max: 40 }],
  5: [{ step: 5, max: 50 }, { step: 10, max: 100 }],
};

const diagramm: Skill = {
  id: "diagramm",
  title: "Säulendiagramme",
  world: "detektiv",
  trick: {
    title: "Diagramm lesen",
    example: "Säule",
    steps: ["Geh mit dem Finger oben an der Säule entlang nach links zur Zahl.", "Schau, was ein Kästchen wert ist — manchmal 1, manchmal 2 oder 5!", "Liegt die Säule zwischen zwei Zahlen? Dann ist es genau die Mitte."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const theme = pick(THEMES);
    if (level >= 2 && chooseFormat(ctx, ["bar-build", "choice", "input"]) === "bar-build") {
      const step = level >= 4 ? 2 : 1;
      const max = level >= 4 ? 16 : level === 3 ? 10 : 8;
      const rows = makeRows(theme, level >= 3 ? 4 : 3, step, max, step);
      return {
        format: "bar-build",
        question: "Zeichne das Säulendiagramm zur Strichliste.",
        rows,
        step,
        max,
        hint: step === 1 ? "Zähl die Striche. Für jeden Strich geht die Säule ein Kästchen hoch." : "Achtung: Ein Kästchen ist 2 wert! Bei 8 Strichen geht die Säule bis zur 8 — das sind 4 Kästchen.",
        solution: rows.map((r) => `${r.label}: ${r.value}`).join(", ") + ".",
      };
    }
    const { step, max } = pick(DIAGRAM[level]);
    const n = level >= 3 ? 4 : 3;
    const rows = makeRows(theme, n, step, max, step);
    const kinds = level === 1 ? ["count"] : level === 2 ? ["count", "most", "least"] : level === 3 ? ["count", "more"] : ["count", "more", "total"];
    const kind = pick(kinds) as "count" | "most" | "least" | "more" | "total";
    const d = dataQuestion(ctx, theme, rows, kind, (r) => (step === 1 ? `Die Säule ${r.label} geht bis ${r.value}.` : `Ein Kästchen ist ${step} wert. Die Säule ${r.label} geht bis ${r.value}.`));
    return { ...d, visual: { kind: "bars", rows, step, max } } as TaskDraft;
  },
};

// ---------------------------------------------------------------------------
// Sachaufgaben

const NAMES = ["Mia", "Ben", "Lea", "Tom", "Emma", "Noah", "Ida", "Paul", "Lina", "Finn"];
const THINGS = ["Murmeln", "Sticker", "Muscheln", "Bonbons", "Karten", "Perlen"];

function story(ctx: GenCtx, question: string, answer: number, unit: string, hint: string, solution: string): TaskDraft {
  return numeric(ctx, `? ${unit}`, answer, { question, hint, solution });
}

const sachaufgaben: Skill = {
  id: "sachaufgaben",
  title: "Sachaufgaben",
  world: "detektiv",
  trick: {
    title: "Die Detektiv-Fragen",
    example: "Was weiß ich?",
    steps: ["Was weiß ich? Such die Zahlen in der Geschichte.", "Was wird gefragt? Lies die Frage am Ende ganz genau.", "Welche Rechnung passt? Kommt etwas dazu (+), geht etwas weg (−), gibt es mehrmals gleich viel (·) oder wird verteilt (:)?"],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const [n1, n2] = shuffle(NAMES);
    const thing = pick(THINGS);
    if (level === 1) {
      if (chance(0.5)) {
        const a = randInt(3, 12);
        const b = randInt(2, 20 - a);
        return story(ctx, `${n1} hat ${a} ${thing}. ${n1} bekommt ${b} dazu. Wie viele ${thing} hat ${n1} jetzt?`, a + b, thing, `Es kommt etwas dazu — also plus: ${a} + ${b}.`, `${a} + ${b} = ${a + b}.`);
      }
      const a = randInt(8, 20);
      const b = randInt(2, a - 2);
      return story(ctx, `${n1} hat ${a} ${thing}. ${n1} verschenkt ${b} davon. Wie viele bleiben übrig?`, a - b, thing, `Es geht etwas weg — also minus: ${a} − ${b}.`, `${a} − ${b} = ${a - b}.`);
    }
    if (level === 2) {
      if (chance(0.5)) {
        const bT = randInt(1, 4);
        const bO = randInt(1, 5);
        const aT = randInt(bT + 1, 8);
        const aO = randInt(bO, 9);
        const a = aT * 10 + aO;
        const b = bT * 10 + bO;
        return story(ctx, `${n1} hat ${a} ${thing}, ${n2} hat ${b}. Wie viele ${thing} hat ${n1} mehr?`, a - b, thing, `„Wie viele mehr“ heißt: den Unterschied ausrechnen. ${a} − ${b}.`, `${a} − ${b} = ${a - b}.`);
      }
      const a = randInt(25, 69);
      const b = randInt(1, a % 10 || 1) + 10 * randInt(0, 2);
      if (b >= a || b % 10 > a % 10) return sachaufgaben.gen(ctx);
      return story(ctx, `Im Bus sitzen ${a} Kinder. An der Haltestelle steigen ${b} aus. Wie viele Kinder sind noch im Bus?`, a - b, "Kinder", `Aussteigen heißt: weniger. ${a} − ${b}.`, `${a} − ${b} = ${a - b}.`);
    }
    if (level === 3) {
      const form = pick(["fehlt", "plus", "minus"] as const);
      if (form === "fehlt") {
        const goal = pick([30, 40, 50, 60, 80, 100]);
        const have = randInt(goal - 39, goal - 3);
        if (have % 10 === 0 || have < 5) return sachaufgaben.gen(ctx);
        return story(ctx, `${n1} will ${goal} ${thing} sammeln und hat schon ${have}. Wie viele fehlen noch?`, goal - have, thing, `Von ${have} bis ${goal} — ergänze: ${have} + ? = ${goal}.`, `${have} + ${goal - have} = ${goal}.`);
      }
      if (form === "plus") {
        const a = randInt(15, 68);
        const b = randInt(11 - (a % 10 || 10), 9) + 10 * randInt(0, 2);
        if (a % 10 === 0 || (a % 10) + (b % 10) < 10 || a + b > 100) return sachaufgaben.gen(ctx);
        return story(ctx, `Im Zug sitzen ${a} Leute. Am Bahnhof steigen ${b} ein. Wie viele sitzen jetzt im Zug?`, a + b, "Leute", `Einsteigen heißt: mehr. ${a} + ${b} — Pause am Zehner!`, `${a} + ${b} = ${a + b}.`);
      }
      const a = randInt(31, 95);
      const b = randInt((a % 10) + 1, 9) + 10 * randInt(0, 2);
      if (a % 10 === 9 || b >= a) return sachaufgaben.gen(ctx);
      return story(ctx, `${n1} hat ${a} ${thing} und verliert ${b} davon. Wie viele ${thing} hat ${n1} noch?`, a - b, thing, `Verlieren heißt: weniger. ${a} − ${b} — Pause am Zehner!`, `${a} − ${b} = ${a - b}.`);
    }
    if (level === 4) {
      const a = randInt(2, 9);
      const b = randInt(2, 9);
      const form = pick(["mal", "teilen", "reihen"] as const);
      if (form === "mal") return story(ctx, `${n1} hat ${a} Tüten. In jeder Tüte sind ${b} ${thing}. Wie viele ${thing} sind es zusammen?`, a * b, thing, `${a}-mal gleich viel — also mal: ${a} · ${b}.`, `${a} · ${b} = ${a * b}.`);
      if (form === "teilen") return story(ctx, `${a * b} Kekse werden gerecht an ${a} Kinder verteilt. Wie viele Kekse bekommt jedes Kind?`, b, "Kekse", `Gerecht verteilen heißt: geteilt. ${a * b} : ${a}. Welche Zahl mal ${a} gibt ${a * b}?`, `${a * b} : ${a} = ${b}, weil ${b} · ${a} = ${a * b}.`);
      return story(ctx, `Im Saal stehen ${a} Reihen mit je ${b} Stühlen. Wie viele Stühle sind das?`, a * b, "Stühle", `${a} Reihen mit je ${b} — also ${a} · ${b}.`, `${a} · ${b} = ${a * b}.`);
    }
    // Stufe 5: zwei Schritte
    const form = pick(["geld", "kisten", "hin-her"] as const);
    if (form === "geld") {
      const k = randInt(2, 5);
      const p = randInt(2, 9);
      const have = pick([20, 30, 50, 100].filter((x) => x > k * p));
      return story(ctx, `${n1} hat ${have} €. ${n1} kauft ${k} Hefte für je ${p} €. Wie viel Geld bleibt übrig?`, have - k * p, "€", `Zwei Schritte! Erst: Was kosten die Hefte? ${k} · ${p}. Dann: ${have} minus das Ergebnis.`, `${k} · ${p} = ${k * p}, ${have} − ${k * p} = ${have - k * p}.`);
    }
    if (form === "kisten") {
      const k = randInt(2, 6);
      const j = randInt(4, 9);
      const e = randInt(2, k * j - 2);
      return story(ctx, `In ${k} Kisten sind je ${j} Äpfel. ${e} Äpfel werden gegessen. Wie viele Äpfel sind noch da?`, k * j - e, "Äpfel", `Zwei Schritte! Erst: Wie viele Äpfel sind es? ${k} · ${j}. Dann ${e} weg.`, `${k} · ${j} = ${k * j}, ${k * j} − ${e} = ${k * j - e}.`);
    }
    const a = randInt(20, 60);
    const b = randInt(8, 30);
    const c = randInt(5, Math.min(40, a + b - 1));
    return story(ctx, `${n1} hat ${a} ${thing}. ${n1} bekommt ${b} dazu und schenkt dann ${c} an ${n2}. Wie viele ${thing} hat ${n1} jetzt?`, a + b - c, thing, `Zwei Schritte! Erst ${a} + ${b}, dann ${c} weg.`, `${a} + ${b} = ${a + b}, ${a + b} − ${c} = ${a + b - c}.`);
  },
};

// ---------------------------------------------------------------------------
// Möglichkeiten zählen

const COMBOS: [string, string, string][] = [
  ["Hosen", "T-Shirts", "Wie viele verschiedene Outfits kann {n} anziehen?"],
  ["Eissorten", "Waffeln", "Wie viele verschiedene Eis-Waffeln kann {n} bestellen?"],
  ["Brotsorten", "Beläge", "Wie viele verschiedene Pausenbrote kann {n} machen?"],
  ["Mützen", "Schals", "Wie viele verschiedene Paare aus Mütze und Schal gibt es?"],
];

const kombinatorik: Skill = {
  id: "kombinatorik",
  title: "Wie viele Möglichkeiten?",
  world: "detektiv",
  trick: {
    title: "Ordentlich zählen",
    example: "2 Hosen · 3 Shirts",
    steps: ["Nimm das erste Teil und probier alles damit durch.", "Dann das zweite Teil — wieder alles durch.", "Jedes Mal gleich viele? Dann rechne einfach mal!"],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const n = pick(NAMES);
    const pair = (a: number, b: number) => {
      const [x, y, q] = pick(COMBOS);
      const ans = a * b;
      return numeric(ctx, "? Möglichkeiten", ans, {
        question: `${n} hat ${a} ${x} und ${b} ${y}. ${q.replace("{n}", n)}`,
        hint: `Zu jedem der ${a} ${x} passen alle ${b} ${y}. Das sind ${a}-mal ${b}.`,
        solution: `${a} · ${b} = ${ans} Möglichkeiten.`,
      }, [1, Math.max(30, ans + 6)]);
    };
    if (level === 1) return pair(2, 2);
    if (level === 2) {
      const [a, b] = pick([[2, 3], [3, 2], [3, 3], [2, 4]] as const);
      return pair(a, b);
    }
    if (level === 3) {
      if (chance(0.35)) {
        const [a, b, c] = shuffle(NAMES).slice(0, 3);
        return numeric(ctx, "? Möglichkeiten", 6, {
          question: `${a}, ${b} und ${c} stellen sich in eine Reihe. Wie viele verschiedene Reihenfolgen gibt es?`,
          hint: `Wer steht vorne? Dafür gibt es 3 Möglichkeiten. Dahinter bleiben jedes Mal noch 2 Reihenfolgen übrig.`,
          solution: `3 · 2 = 6 Reihenfolgen: ${[[a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]].map((r) => r.join("-")).join(", ")}.`,
        }, [1, 12]);
      }
      return pair(randInt(2, 3), randInt(3, 4));
    }
    if (level === 4) {
      if (chance(0.35)) {
        const cards = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort((a, b) => a - b);
        return numeric(ctx, "? Zahlen", 6, {
          question: `Du hast die Ziffernkarten ${cards.join(", ")}. Wie viele verschiedene zweistellige Zahlen kannst du legen? (Jede Karte nur einmal.)`,
          hint: `Für die Zehnerstelle gibt es 3 Karten. Für die Einerstelle bleiben dann jeweils 2 übrig.`,
          solution: `3 · 2 = 6: ${cards.flatMap((a) => cards.filter((b) => b !== a).map((b) => `${a}${b}`)).join(", ")}.`,
        }, [1, 12]);
      }
      return pair(randInt(3, 4), randInt(3, 5));
    }
    const form = pick(["hand", "drei", "reihe4"] as const);
    if (form === "hand") {
      const k = randInt(3, 6);
      const ans = (k * (k - 1)) / 2;
      return numeric(ctx, "? Handschläge", ans, {
        question: `${k} Detektive treffen sich. Jeder gibt jedem genau einmal die Hand. Wie viele Handschläge sind das?`,
        hint: `Der Erste gibt ${k - 1} Hände. Der Zweite noch ${k - 2} neue, denn den Ersten hatte er schon …`,
        solution: `${Array.from({ length: k - 1 }, (_, i) => k - 1 - i).join(" + ")} = ${ans}.`,
      }, [1, 20]);
    }
    if (form === "drei") {
      const a = randInt(2, 3);
      const b = randInt(2, 3);
      const ans = a * b * 2;
      return numeric(ctx, "? Möglichkeiten", ans, {
        question: `${n} hat ${a} Hosen, ${b} Pullis und 2 Mützen. Wie viele verschiedene Outfits gibt es?`,
        hint: `Erst Hosen und Pullis: ${a} · ${b}. Jedes davon gibt es mit 2 Mützen.`,
        solution: `${a} · ${b} = ${a * b}, ${a * b} · 2 = ${ans}.`,
      }, [1, 30]);
    }
    return numeric(ctx, "? Reihenfolgen", 24, {
      question: "4 Kinder stellen sich in eine Reihe. Wie viele verschiedene Reihenfolgen gibt es?",
      hint: "Vorne: 4 Möglichkeiten. Dann 3, dann 2, dann 1. Rechne 4 · 3 · 2 · 1.",
      solution: "4 · 3 = 12, 12 · 2 = 24, 24 · 1 = 24.",
    }, [1, 30]);
  },
};

// ---------------------------------------------------------------------------
// Fehler-Detektiv

type Eq = { text: string; right: number; shown: number; why: string };

function eqFor(level: Level): { a: number; b: number; op: "+" | "−" | "·" | ":"; r: number; slip: number[] } {
  const op = level <= 3 ? pick(["+", "−"] as const) : level === 4 ? "·" : pick(["+", "−", "·", ":"] as const);
  if (op === "·" || op === ":") {
    const a = randInt(2, 10);
    const b = randInt(2, 10);
    return op === "·" ? { a, b, op, r: a * b, slip: [a, -a, b, -b] } : { a: a * b, b: a, op, r: b, slip: [1, -1] };
  }
  if (level === 1) {
    const a = randInt(3, 15);
    const b = op === "+" ? randInt(2, 20 - a) : randInt(1, a - 1);
    return { a, b, op, r: op === "+" ? a + b : a - b, slip: [1, -1, 2] };
  }
  if (level === 2) {
    const a = randInt(21, 79);
    const b = op === "+" ? randInt(1, 9 - (a % 10) || 1) + 10 * randInt(0, 1) : randInt(1, a % 10 || 1) + 10 * randInt(0, 1);
    return { a, b, op, r: op === "+" ? a + b : a - b, slip: [10, -10, 1] };
  }
  // Stufe 3 und 5: über den Zehner — typischer Fehler: Zehner vergessen
  const a = randInt(23, 78);
  const b = op === "+" ? randInt(Math.max(1, 11 - (a % 10)), 9) + 10 * randInt(0, 1) : randInt((a % 10) + 1, 9) + 10 * randInt(0, 1);
  const r = op === "+" ? a + b : a - b;
  return { a, b, op, r, slip: op === "+" ? [-10, 1, -1] : [10, 1, -1] };
}

function makeEq(level: Level, wrong: boolean): Eq {
  for (;;) {
    const e = eqFor(level);
    if (e.r < 0 || e.r > 100 || (e.op === "−" && e.b >= e.a) || e.b <= 0) continue;
    const shown = wrong ? e.r + pick(e.slip) : e.r;
    if (shown < 0) continue;
    return { text: `${e.a} ${e.op} ${e.b} = ${shown}`, right: e.r, shown, why: `${e.a} ${e.op} ${e.b} = ${e.r}` };
  }
}

const fehlerDetektiv: Skill = {
  id: "fehlerDetektiv",
  title: "Fehler-Detektiv",
  world: "detektiv",
  gen: (ctx) => {
    const { level } = ctx;
    const n = level <= 2 ? 3 : 4;
    const findRight = level >= 3 && chance(0.3);
    for (;;) {
      const eqs = [makeEq(level, !findRight), ...Array.from({ length: n - 1 }, () => makeEq(level, findRight))];
      const texts = eqs.map((e) => e.text);
      if (new Set(texts).size !== n) continue;
      const odd = eqs[0];
      const isPlus = odd.text.includes("+");
      return {
        format: "choice",
        question: findRight ? "Nur eine Rechnung stimmt. Welche?" : "Welche Rechnung stimmt nicht?",
        options: shuffle(texts),
        answer: odd.text,
        hint: findRight ? "Rechne jede Aufgabe nach. Nur bei einer passt das Ergebnis." : isPlus ? "Rechne jede Aufgabe nach — und prüf mit der Umkehraufgabe: Ergebnis minus die zweite Zahl muss die erste geben." : "Rechne jede Aufgabe nach. Bei einer hat sich ein Fehler versteckt!",
        solution: findRight ? `${odd.text} stimmt. Die anderen sind falsch.` : `${odd.text} ist falsch. Richtig ist ${odd.why}.`,
      };
    }
  },
};

export const DETEKTIV_SKILLS: Skill[] = [strichliste, diagramm, sachaufgaben, kombinatorik, fehlerDetektiv];
