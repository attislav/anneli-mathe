// ============ EXERCISE GENERATION ============
import { state, DIFFICULTY } from "./state.js";
import { getErrorRepeatExercises } from "./error-pool.js";

// ============ HELPERS ============

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ============ GENERATORS ============

function generateNormal(config, count) {
  if (count === undefined) count = config.count;
  for (let i = 0; i < count; i++) {
    let op;
    if (state.currentOperation === "plus") {
      op = "+";
    } else if (state.currentOperation === "minus") {
      op = "-";
    } else {
      op = Math.random() < 0.5 ? "+" : "-";
    }

    let a, b;
    if (op === "+") {
      a = randomInt(1, config.maxNumber);
      b = randomInt(1, config.maxResult - a);
      if (b < 1) b = 1;
    } else {
      a = randomInt(2, config.maxResult);
      b = randomInt(1, a);
      if (b > config.maxNumber) b = config.maxNumber;
      if (a <= b) a = b + 1;
      if (a > config.maxResult) a = config.maxResult;
    }

    state.exercises.push({
      type: "normal",
      a, b, op,
      answer: op === "+" ? a + b : a - b,
    });
  }
}

function generateLuecken(config) {
  for (let i = 0; i < config.count; i++) {
    const op = Math.random() < 0.5 ? "+" : "-";
    let a, b, result;

    if (op === "+") {
      a = randomInt(1, config.maxNumber);
      b = randomInt(1, config.maxResult - a);
      if (b < 1) b = 1;
      result = a + b;
    } else {
      a = randomInt(2, config.maxResult);
      b = randomInt(1, a);
      if (b > config.maxNumber) b = config.maxNumber;
      if (a <= b) a = b + 1;
      if (a > config.maxResult) a = config.maxResult;
      result = a - b;
    }

    const gapPositions = ["left", "right"];
    const gap = pickRandom(gapPositions);

    if (gap === "left") {
      state.exercises.push({
        type: "luecke",
        display: { left: null, op, right: b, result },
        answer: a,
      });
    } else {
      state.exercises.push({
        type: "luecke",
        display: { left: a, op, right: null, result },
        answer: b,
      });
    }
  }
}

function generateZehner(config) {
  for (let i = 0; i < config.count; i++) {
    const target = pickRandom(config.zehnerTargets);
    state.exercises.push({
      type: "zehner",
      target,
    });
  }
}

function generateVergleichen(config) {
  for (let i = 0; i < config.count; i++) {
    const op1 = Math.random() < 0.5 ? "+" : "-";
    const op2 = Math.random() < 0.5 ? "+" : "-";
    let a1, b1, a2, b2;

    if (op1 === "+") {
      a1 = randomInt(1, config.maxNumber);
      b1 = randomInt(0, Math.min(config.maxNumber, config.maxResult - a1));
    } else {
      a1 = randomInt(2, config.maxResult);
      b1 = randomInt(0, Math.min(config.maxNumber, a1));
    }

    if (op2 === "+") {
      a2 = randomInt(1, config.maxNumber);
      b2 = randomInt(0, Math.min(config.maxNumber, config.maxResult - a2));
    } else {
      a2 = randomInt(2, config.maxResult);
      b2 = randomInt(0, Math.min(config.maxNumber, a2));
    }

    const result1 = op1 === "+" ? a1 + b1 : a1 - b1;
    const result2 = op2 === "+" ? a2 + b2 : a2 - b2;

    let answer;
    if (result1 > result2) answer = ">";
    else if (result1 < result2) answer = "<";
    else answer = "=";

    state.exercises.push({
      type: "vergleichen",
      left: { a: a1, op: op1, b: b1, result: result1 },
      right: { a: a2, op: op2, b: b2, result: result2 },
      answer,
    });
  }
}

function generateVerdoppeln(config) {
  for (let i = 0; i < config.count; i++) {
    const isDoppelt = Math.random() < 0.5;
    if (isDoppelt) {
      const num = randomInt(1, Math.floor(config.maxResult / 2));
      state.exercises.push({
        type: "verdoppeln",
        mode: "doppelt",
        num,
        answer: num * 2,
      });
    } else {
      const half = randomInt(1, Math.floor(config.maxResult / 2));
      const num = half * 2;
      state.exercises.push({
        type: "verdoppeln",
        mode: "halb",
        num,
        answer: half,
      });
    }
  }
}

function generateNachbarn(config) {
  for (let i = 0; i < config.count; i++) {
    const num = randomInt(1, config.maxResult - 1);
    state.exercises.push({
      type: "nachbarn",
      num,
      answerBefore: num - 1,
      answerAfter: num + 1,
    });
  }
}

function generateReihen(config) {
  const patterns = [
    { step: 1, name: "+1" },
    { step: 2, name: "+2" },
    { step: 3, name: "+3" },
    { step: 5, name: "+5" },
  ];
  if (config.maxResult >= 20) {
    patterns.push({ step: 10, name: "+10" });
  }

  for (let i = 0; i < config.count; i++) {
    const pattern = pickRandom(patterns);
    const maxStart = Math.max(1, config.maxResult - pattern.step * 5);
    const start = randomInt(0, maxStart);
    const sequence = [];
    for (let j = 0; j < 5; j++) {
      sequence.push(start + j * pattern.step);
    }
    const answer = start + 5 * pattern.step;

    state.exercises.push({
      type: "reihen",
      sequence,
      answer,
      step: pattern.step,
    });
  }
}

// ============ READING / TOPIC CONTENT GENERATORS ============

function generateLesen() {
  const data = state.readingData;
  if (!data || !Array.isArray(data.items) || data.items.length === 0) return;

  const item = pickRandom(data.items);
  state.exercises.push({
    type: "lesen",
    passage: item.passage,
    title: item.title,
    questions: item.questions.map((q) => ({
      prompt: q.prompt,
      choices: [...q.choices],
      answerIndex: q.answerIndex,
      selected: null,
    })),
  });
}

function generateThema() {
  const data = state.topicsData;
  if (!data || !Array.isArray(data.items) || data.items.length === 0) return;

  const item = pickRandom(data.items);
  state.exercises.push({
    type: "thema",
    card: item.card,
    title: item.title,
    facts: item.facts || [],
    questions: item.questions.map((q) => ({
      prompt: q.prompt,
      choices: [...q.choices],
      answerIndex: q.answerIndex,
      selected: null,
    })),
  });
}

// ============ WORD PROBLEMS (Textaufgaben) ============

const WORD_PROBLEM_TEMPLATES = [
  { text: (a, b) => `Anna hat ${a} Äpfel. Sie bekommt ${b} dazu. Wie viele hat sie jetzt?`, op: "+" },
  { text: (a, b) => `Tom hat ${a} Bonbons. Er gibt ${b} davon ab. Wie viele hat er noch?`, op: "-" },
  { text: (a, b) => `Im Bus sitzen ${a} Kinder. An der Haltestelle steigen ${b} ein. Wie viele sitzen jetzt im Bus?`, op: "+" },
  { text: (a, b) => `Mama kauft ${a} Brötchen. Die Familie isst ${b} davon. Wie viele sind noch da?`, op: "-" },
  { text: (a, b) => `${a} Vögel sitzen auf dem Baum. ${b} fliegen dazu. Wie viele sind es insgesamt?`, op: "+" },
  { text: (a, b) => `Lisa hat ${a} Buntstifte. ${b} sind kaputt. Wie viele gute Stifte hat sie?`, op: "-" },
  { text: (a, b) => `Im Garten wachsen ${a} Blumen. Papa pflanzt ${b} neue. Wie viele sind es jetzt?`, op: "+" },
  { text: (a, b) => `Es liegen ${a} Bücher auf dem Tisch. ${b} werden weggeräumt. Wie viele liegen noch da?`, op: "-" },
  { text: (a, b) => `${a} Schmetterlinge fliegen im Garten. ${b} kommen noch dazu. Wie viele sind es?`, op: "+" },
  { text: (a, b) => `Tim hat ${a} Murmeln. Er verliert ${b}. Wie viele hat er noch?`, op: "-" },
];

function generateTextaufgaben(config) {
  for (let i = 0; i < config.count; i++) {
    const template = pickRandom(WORD_PROBLEM_TEMPLATES);
    let a, b;
    if (template.op === "+") {
      a = randomInt(1, config.maxNumber);
      b = randomInt(1, config.maxResult - a);
      if (b < 1) b = 1;
    } else {
      a = randomInt(2, config.maxResult);
      b = randomInt(1, Math.min(a - 1, config.maxNumber));
    }
    const answer = template.op === "+" ? a + b : a - b;
    state.exercises.push({
      type: "textaufgabe",
      text: template.text(a, b),
      answer,
      op: template.op,
      a, b,
    });
  }
}

// ============ CLOCK READING (Uhrzeit) ============

function generateUhrzeit(config) {
  const count = config.count;
  for (let i = 0; i < count; i++) {
    const mode = Math.random() < 0.5 ? "voll" : "halb";
    const hour = randomInt(1, 12);
    let displayText, answer;

    if (mode === "voll") {
      displayText = `${hour}:00`;
      answer = `${hour} uhr`;
    } else {
      displayText = `${hour}:30`;
      answer = `halb ${(hour % 12) + 1}`;
    }

    state.exercises.push({
      type: "uhrzeit",
      hour,
      minute: mode === "voll" ? 0 : 30,
      displayText,
      answer,
      mode,
    });
  }
}

// ============ MONEY (Geld rechnen) ============

function generateGeld(config) {
  const count = config.count;
  for (let i = 0; i < count; i++) {
    const mode = pickRandom(["zusammenzaehlen", "rueckgeld"]);
    if (mode === "zusammenzaehlen") {
      const cents1 = randomInt(1, 5) * 10; // 10-50 cent
      const cents2 = randomInt(1, 5) * 10;
      const total = cents1 + cents2;
      const displayEuros = total >= 100;
      state.exercises.push({
        type: "geld",
        mode: "zusammenzaehlen",
        text: `${cents1} Cent + ${cents2} Cent = ?`,
        answer: total,
        unit: "cent",
      });
    } else {
      const price = randomInt(1, Math.min(config.maxNumber, 9));
      const paid = randomInt(price + 1, 10);
      state.exercises.push({
        type: "geld",
        mode: "rueckgeld",
        text: `Du kaufst etwas für ${price} €. Du zahlst mit ${paid} €. Wie viel bekommst du zurück?`,
        answer: paid - price,
        unit: "euro",
      });
    }
  }
}

// ============ MAIN GENERATE ============

export function generateExercises() {
  const config = DIFFICULTY[state.currentDifficulty];
  state.exercises = [];
  state.checked = false;
  state.attempts = [];

  if (state.currentOperation === "lesen") {
    generateLesen();
  } else if (state.currentOperation === "thema") {
    generateThema();
  } else if (state.currentOperation === "textaufgaben") {
    generateTextaufgaben(config);
  } else if (state.currentOperation === "uhrzeit") {
    generateUhrzeit(config);
  } else if (state.currentOperation === "geld") {
    generateGeld(config);
  } else if (state.currentOperation === "luecken") {
    generateLuecken(config);
  } else if (state.currentOperation === "zehner") {
    generateZehner(config);
  } else if (state.currentOperation === "vergleichen") {
    generateVergleichen(config);
  } else if (state.currentOperation === "verdoppeln") {
    generateVerdoppeln(config);
  } else if (state.currentOperation === "nachbarn") {
    generateNachbarn(config);
  } else if (state.currentOperation === "reihen") {
    generateReihen(config);
  } else {
    const repeatCount = Math.floor(config.count * 0.3);
    const repeats = getErrorRepeatExercises(config, repeatCount);
    repeats.forEach((ex) => state.exercises.push(ex));

    const remaining = config.count - state.exercises.length;
    generateNormal(config, remaining);

    shuffleArray(state.exercises);
  }

  state.attempts = new Array(state.exercises.length).fill(0);
}

// ============ MULTIPLE-CHOICE RESCUE ============

export function isRescueSupported(ex) {
  return ex && (ex.type === "normal" || ex.type === "luecke" || ex.type === "verdoppeln" || ex.type === "reihen" || ex.type === "textaufgabe" || ex.type === "geld");
}

export function buildRescueChoices(correct, config) {
  const max = Math.max(5, config?.maxResult ?? 20);
  const choices = new Set([correct]);
  const deltas = [1, 2, 3, 4, 5];

  while (choices.size < 3) {
    const delta = pickRandom(deltas);
    const sign = Math.random() < 0.5 ? -1 : 1;
    let cand = correct + sign * delta;
    if (cand < 0) cand = correct + delta;
    if (cand > max) cand = correct - delta;
    if (cand < 0) cand = 0;
    if (cand > max) cand = max;
    choices.add(cand);
  }

  const arr = Array.from(choices);
  shuffleArray(arr);
  return arr;
}
