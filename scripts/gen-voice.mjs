// Feste Sätze der App-Stimme (Lob, Begrüßung, Truhe …) mit Gemini TTS erzeugen.
//
//   npm run gen:voice              → fehlende Sätze erzeugen
//   npm run gen:voice -- praise    → nur diese Gruppe (überschreibt)
//
// Der Schlüssel (GEMINI_API_KEY) kommt aus der Umgebung oder .env.local und
// wird NUR hier beim Erzeugen benutzt — die App spielt nur fertige mp3s ab.
// Jede Aufnahme wird zur Kontrolle wieder in Text umgewandelt: Liest die
// Stimme die Regie-Anweisung mit oder verschluckt etwas, wird neu erzeugt.
// Braucht ffmpeg (Stille abschneiden, Lautstärke angleichen, mp3).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
if (!KEY) {
  console.error("GEMINI_API_KEY fehlt. In .env.local eintragen oder als Umgebungsvariable setzen.");
  process.exit(1);
}
const TTS_MODEL = process.env.GEMINI_TTS_MODEL ?? "gemini-3.8-flash-tts";
const CHECK_MODEL = process.env.GEMINI_CHECK_MODEL ?? "gemini-2.5-flash";
const API = "https://generativelanguage.googleapis.com/v1beta/models";
const OUT = "public/stimme";
const LIST = "src/game/voiceLines.json";

const cfg = JSON.parse(readFileSync("scripts/voice/lines.json", "utf8"));
const only = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });

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

async function tts(text) {
  const json = await gemini(TTS_MODEL, {
    contents: [{ parts: [{ text: `# AUDIO PROFILE\n${cfg.style}\n\n#### TRANSCRIPT\n${text}` }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.voice } } } },
  });
  const b64 = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error("keine Audiodaten");
  return Buffer.from(b64, "base64");
}

async function transcribe(file) {
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

function encode(pcm, out) {
  const raw = `${out}.pcm`;
  writeFileSync(raw, pcm);
  // Stille vorne/hinten weg, Lautstärke angleichen, kleine mp3 (Mono).
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw,
    "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5,apad=pad_dur=0.05",
    "-ar", "24000", "-b:a", "64k", out,
  ]);
  rmSync(raw);
}

const counts = {};
for (const [group, lines] of Object.entries(cfg.lines)) {
  let n = 0;
  for (let i = 0; i < lines.length; i++) {
    const out = `${OUT}/${group}-${i}.mp3`;
    const want = only.length ? only.includes(group) : !existsSync(out);
    if (want) {
      process.stdout.write(`${group}-${i} „${lines[i]}“ … `);
      let ok = false;
      for (let attempt = 0; attempt < 3 && !ok; attempt++) {
        try {
          encode(await tts(lines[i]), out);
          // Zu lang = Regie-Text wurde (leise) mitgesprochen oder Geräusche davor.
          const secs = duration(out);
          const heard = await transcribe(out);
          ok = matches(heard, lines[i]) && secs <= 1.5 + lines[i].length * 0.11;
          if (!ok) process.stdout.write(`(gehört: „${heard.trim()}“, ${secs.toFixed(1)} s, nochmal) `);
        } catch (e) {
          process.stdout.write(`(${e.message}) `);
        }
      }
      if (!ok && existsSync(out)) rmSync(out);
      console.log(ok ? "ok" : "FEHLER");
    }
    // Nur lückenlos vorhandene Sätze zählen — die App wählt aus 0 … n-1.
    if (existsSync(out) && n === i) n++;
  }
  if (n) counts[group] = n;
}

writeFileSync(LIST, JSON.stringify(counts, null, 2) + "\n");
console.log(`${Object.values(counts).reduce((a, b) => a + b, 0)} Sätze fertig → ${LIST}`);
