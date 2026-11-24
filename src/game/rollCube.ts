import { pick } from "./random";
import type { Level, RollCubeTask } from "./types";

export const faceNames = {
  top: "oben", bottom: "unten", left: "links", right: "rechts",
  front: "vorne (zu dir)", back: "hinten (von dir weg)",
};
export const moveNames = {
  left: "nach links", right: "nach rechts", front: "nach vorne zu dir", back: "nach hinten von dir weg",
};
export type Face = keyof typeof faceNames;
export type Move = keyof typeof moveNames;
export type CubePath = { start: Face; moves: Move[] };
const directions: Move[] = ["left", "right", "front", "back"];
const cycles: Record<Move, Face[]> = {
  right: ["top", "right", "bottom", "left"],
  left: ["top", "left", "bottom", "right"],
  front: ["top", "front", "bottom", "back"],
  back: ["top", "back", "bottom", "front"],
};
export function tiltStar(face: Face, move: Move): Face {
  const rotation = cycles[move];
  const position = rotation.indexOf(face);
  return position < 0 ? face : rotation[(position + 1) % 4];
}
export function positions(path: CubePath): Face[] {
  const trace = [path.start];
  for (const move of path.moves) trace.push(tiltStar(trace[trace.length - 1], move));
  return trace;
}
export const endFace = (path: CubePath) => positions(path).at(-1)!;
function routes(length: number): Move[][] {
  let paths: Move[][] = [[]];
  for (let step = 0; step < length; step++) {
    paths = paths.flatMap(path => directions.map(move => [...path, move]));
  }
  return paths;
}
export function rollCube(level: Level): Omit<RollCubeTask, "id" | "level" | "skillId"> {
  const length = level === 1 ? 1 : level <= 3 ? 2 : 3;
  const starts: Face[] = level <= 2 ? ["top"] : level === 3 ? ["top", "left", "front"] : ["top", "bottom", "left", "right", "front", "back"];
  const start = pick(starts);
  const options = routes(length).filter(moves => tiltStar(start, moves[0]) !== start);
  const practice = { start, moves: pick(options) };
  const transfer = { start, moves: pick(options.filter(moves => endFace({ start, moves }) !== endFace(practice))) };
  return { format: "roll-cube", practice, transfer, question: "Wohin kippt die Sternfläche?",
    hint: "Starte noch einmal bei der gezeigten Sternfläche. Verfolge bei jedem Kippen nur diese eine Fläche.",
    solution: "Der Stern beginnt " + faceNames[start] + ". " + transfer.moves.map((move, index) =>
      "Nach dem Kippen " + moveNames[move] + " liegt er " + faceNames[positions(transfer)[index + 1]] + ".").join(" ") };
}

export type GuidedState = { phase: "predict" | "roll" | "transfer"; prediction: Face | null; completed: number };
export const guidedStart: GuidedState = { phase: "predict", prediction: null, completed: 0 };
export function nextGuided(state: GuidedState, path: CubePath, action: Face | "start" | "tilt" | "continue" | "repeat"): GuidedState {
  if (action in faceNames && state.phase === "predict") return { ...state, prediction: action as Face };
  if (action === "start" && state.phase === "predict" && state.prediction) return { ...state, phase: "roll" };
  if (state.phase !== "roll") return state;
  if (action === "tilt" && state.completed < path.moves.length) return { ...state, completed: state.completed + 1 };
  if (state.completed !== path.moves.length) return state;
  if (action === "repeat") return { ...state, completed: 0 };
  if (action === "continue") return { ...state, phase: "transfer" };
  return state;
}
