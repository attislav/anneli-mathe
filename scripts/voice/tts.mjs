// Gemeinsame Technik für die App-Stimme (Gemini TTS): aufnehmen, sauber
// schneiden, als mp3 speichern und per Transkript kontrollieren.
// Benutzt von gen-voice.mjs (feste Sätze) und gen-task-audio.mjs (Aufgaben-Bausteine).

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";

const KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
if (!KEY) {
  console.error("GEMINI_API_KEY fehlt. In .env.local eintragen oder als Umgebungsvariable setzen.");
  process.exit(1);
}
const TTS_MODEL = process.env.GEMINI_TTS_MODEL ?? "gemini-3.8-flash-tts";
const CHECK_MODEL = process.env.GEMINI_CHECK_MODEL ?? "gemini-2.5-flash";
const API = "https://generativelanguage.googleapis.com/v1beta/models";

async function gemini(model, body) {
  for (let i = 0; i < 4; i++) {
    const res = await fetch(`${API}/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    if (res.status !== 429 && res.status < 500) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
  }
  throw new Error("Gemini antwortet nicht");
}

export async function tts(text, style, voice) {
  const json = await gemini(TTS_MODEL, {
    contents: [{ parts: [{ text: `# AUDIO PROFILE\n${style}\n\n#### TRANSCRIPT\n${text}` }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
  });
  const b64 = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error("keine Audiodaten");
  return Buffer.from(b64, "base64");
}

export async function transcribe(file) {
  const json = await gemini(CHECK_MODEL, {
    contents: [{ parts: [{ inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } }, { text: "Transcribe this German audio exactly, word for word. Output only the transcript." }] }],
  });
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

const letters = (s) => s.toLowerCase().replace(/[^a-zäöüß]/g, "");

function distance(a, b) {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

/** Passt das Gehörte zum Text? Keine Regie-Wörter, nichts verschluckt oder dazuerfunden.
 *  Verglichen werden nur Buchstaben, damit „noch mal“ = „nochmal“ und „probiers“ = „probier's“. */
function matches(heard, text) {
  if (/\b(say|warmly|cheerfully|teacher|lehrerin|german)\b/i.test(heard)) return false;
  const h = letters(heard);
  const t = letters(text);
  return distance(h, t) <= Math.max(2, Math.round(t.length * 0.25));
}

function duration(file) {
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());
}

/** Wo ist hörbarer Ton? Liste von [start, ende] in Sekunden (aus ffmpeg silencedetect). */
function soundParts(raw, total) {
  const log = spawnSync("ffmpeg", ["-hide_banner", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw, "-af", "silencedetect=n=-45dB:d=0.08", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const parts = [];
  let t = 0;
  starts.forEach((a, i) => {
    if (a > t + 0.001) parts.push([t, a]);
    t = ends[i] ?? total;
  });
  if (t < total - 0.001) parts.push([t, total]);
  return parts;
}

export function encode(pcm, out) {
  const raw = `${out}.pcm`;
  writeFileSync(raw, pcm);
  const total = pcm.length / 48000;
  // Gemini hängt oft einen kurzen, lauten Rausch-Stoß ans Ende (und manchmal
  // einen Knacks an den Anfang), jeweils durch eine Pause abgesetzt. Solche
  // winzigen Stücke vorne/hinten weglassen, dann nur die Sprache behalten.
  let parts = soundParts(raw, total);
  // Nur wenn eine echte Pause (≥ 0,15 s) davor/dahinter liegt — sonst wäre es
  // z. B. das „P“ von „Prima“.
  while (parts.length > 1 && parts[0][1] - parts[0][0] < 0.12 && parts[1][0] - parts[0][1] >= 0.15) parts = parts.slice(1);
  while (parts.length > 1 && parts.at(-1)[1] - parts.at(-1)[0] < 0.3 && parts.at(-1)[0] - parts.at(-2)[1] >= 0.15) parts = parts.slice(0, -1);
  const from = parts.length ? Math.max(0, parts[0][0] - 0.03) : 0;
  const to = parts.length ? Math.min(total, parts.at(-1)[1] + 0.06) : total;
  const len = to - from;
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw,
    "-af", `atrim=${from.toFixed(3)}:${to.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, len - 0.06).toFixed(3)}:d=0.06,loudnorm=I=-16:TP=-1.5,apad=pad_dur=0.05`,
    "-ar", "24000", "-b:a", "64k", out,
  ]);
  rmSync(raw);
}


/**
 * Text aufnehmen, bis Transkript und Länge passen (max. 3 Versuche).
 * `number`: der Text ist eine Zahl — dann zählt die Zahl im Transkript.
 * Gibt zurück, ob eine gute Aufnahme unter `out` liegt.
 */
export async function record(text, out, { style, voice, number, log = () => {} }) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      encode(await tts(text, style, voice), out);
      const secs = duration(out);
      const heard = await transcribe(out);
      const digits = heard.replace(/[^0-9]/g, "");
      const okText = number !== undefined ? digits === String(number) || (digits === "" && matches(heard, text)) : matches(heard, text);
      // Zu lang = Regie-Text wurde (leise) mitgesprochen oder Geräusche davor.
      if (okText && secs <= 1.5 + text.length * 0.11) return true;
      log(`(gehört: „${heard.trim()}“, ${secs.toFixed(1)} s, nochmal) `);
    } catch (e) {
      log(`(${e.message}) `);
    }
  }
  rmSync(out, { force: true });
  return false;
}
