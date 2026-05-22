// Smoke-Test für die Aufgaben-Generatoren.
// Erzeugt 200 Aufgaben pro (Skill, Level)-Kombination und prüft Invarianten.
// Aufruf: npx tsx scripts/smoke-generators.ts
//
// Nicht Teil des Build-Pipelines — ein Vitest-Setup steht noch aus.

import { generateExercise, type Level } from "../src/data/exercises/index";

const SKILLS = [
  "counting20",
  "addition20",
  "subtraction20",
  "compare100",
  "tensNeighbors",
  "doubleHalf",
] as const;
const LEVELS: Level[] = ["easy", "normal", "hard"];

let bad = 0;
for (const s of SKILLS) {
  for (const l of LEVELS) {
    for (let i = 0; i < 200; i++) {
      const ex = generateExercise(s, l);
      if (typeof ex.correctAnswer !== "number" || Number.isNaN(ex.correctAnswer)) {
        console.error("BAD answer:", s, l, ex);
        bad++;
      }
      if (ex.skill !== s) {
        console.error("SKILL mismatch:", ex);
        bad++;
      }
      if (!ex.prompt || ex.prompt.length < 2) {
        console.error("EMPTY prompt:", ex);
        bad++;
      }
      // Skill-spezifische Range-Checks.
      if (s === "counting20" && (ex.correctAnswer < 6 || ex.correctAnswer > 20)) {
        console.error("counting20 out of range:", ex);
        bad++;
      }
      if (s === "addition20" && (ex.correctAnswer < 0 || ex.correctAnswer > 20)) {
        console.error("addition20 out of range:", ex);
        bad++;
      }
      if (s === "subtraction20" && (ex.correctAnswer < 0 || ex.correctAnswer > 20)) {
        console.error("subtraction20 out of range:", ex);
        bad++;
      }
      if (s === "compare100" && (ex.correctAnswer < 2 || ex.correctAnswer > 99)) {
        console.error("compare100 out of range:", ex);
        bad++;
      }
      if (s === "tensNeighbors") {
        if (ex.correctAnswer % 10 !== 0 || ex.correctAnswer < 0 || ex.correctAnswer > 100) {
          console.error("tensNeighbors not a clean ten:", ex);
          bad++;
        }
      }
      if (s === "doubleHalf" && (ex.correctAnswer < 1 || ex.correctAnswer > 98)) {
        console.error("doubleHalf out of range:", ex);
        bad++;
      }
    }
    const sample = generateExercise(s, l);
    console.log(
      s,
      l,
      "→",
      JSON.stringify({
        prompt: sample.prompt.replace(/\n/g, " | "),
        vignette: sample.vignette?.slice(0, 90),
        answer: sample.correctAnswer,
        level: sample.level,
      })
    );
  }
}

console.log(`\nBAD count: ${bad}`);
if (bad > 0) process.exit(1);
