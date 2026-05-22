// Gemeinsame Prop-Shape für alle Input-Modi der Brücke.
//
// Jeder Input-Modus rendert seine eigene UI (Tastatur, Buttons, Symbole),
// schickt aber am Ende über `onSubmit(answer)` einen `number` zurück.
// Das hält die Schnittstelle zwischen BridgeChallenge und Input-Komponenten
// stabil — egal ob der Modus per Tap, Drag oder Sprache funktioniert.

import type { Exercise } from "@/data/exercises";

/**
 * Status der aktuellen Aufgabe — von BridgeChallenge geliefert.
 * Input-Komponenten reagieren darauf z.B. mit Disabled-State während
 * der Erfolgs-Animation, oder mit visuellem "shake" nach `retry`.
 */
export type InputStatus = "asking" | "retry" | "step-success" | "complete";

export type InputProps = {
  /** Die aktuelle Aufgabe (skill, prompt, correctAnswer, visual, ...). */
  exercise: Exercise;
  /** Status der Frage — siehe InputStatus. */
  status: InputStatus;
  /** Aufruf, sobald Anneli ihre Antwort eingegeben/getippt hat.
   *  BridgeChallenge prüft `answer === exercise.correctAnswer`. */
  onSubmit: (answer: number) => void;
  /** Wird true, wenn der Submit-Button gedrückt wurde, aber noch keine
   *  neue Aufgabe da ist. Dient als Lock gegen Doppel-Klicks. */
  disabled?: boolean;
};
