"use client";

// Vorlesen über die Sprachausgabe des Geräts.
//
// Abgeschaltet (DEVICE_VOICE): Die Gerätestimmen klingen zu schlecht. Aufgaben
// sollen später aus aufgenommenen Bausteinen (Zahlen + Satzteile) vorgelesen
// werden; bis dahin gibt es keine Vorlese-Knöpfe. Lob & Co. spricht `voice.ts`.
//
// Mathe-Zeichen werden in Wörter übersetzt, damit „38 + 7 = ?" als
// „38 plus 7 gleich wie viel" ankommt. Vorproduzierte Stimmen (wie im
// alten Training) kommen später dazu — die Gerätestimme ist der Boden.

const WORDS: [RegExp, string][] = [
  [/\+/g, " plus "],
  [/−/g, " minus "],
  [/·/g, " mal "],
  [/=/g, " gleich "],
  [/\?/g, " wie viel "],
  [/</g, " ist kleiner als "],
  [/>/g, " ist größer als "],
  [/…/g, " "],
  [/\bZ\b/g, " Zehner "],
  [/\bE\b/g, " Einer "],
];

export const DEVICE_VOICE = false;

export function toSpeech(text: string): string {
  let out = text;
  for (const [re, word] of WORDS) out = out.replace(re, word);
  return out.replace(/\s+/g, " ").trim();
}

let voice: SpeechSynthesisVoice | null | undefined;

function germanVoice(): SpeechSynthesisVoice | null {
  if (voice !== undefined) return voice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  voice = voices.find((v) => v.lang.startsWith("de") && /female|anna|petra|helena|katja/i.test(v.name)) ?? voices.find((v) => v.lang.startsWith("de")) ?? null;
  return voice;
}

export function speak(...parts: (string | undefined)[]): void {
  if (!DEVICE_VOICE || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const text = parts.filter(Boolean).map((p) => toSpeech(p!)).join(". ");
  if (!text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = 0.95;
  u.pitch = 1.1;
  const v = germanVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
