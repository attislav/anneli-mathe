// Vertont das Kopfrechen-Training mit Gemini TTS.
//
// Vorlage ist `src/data/training/speech-manifest.json` (erzeugt von
// `npm run collect:speech`). Drei Sorten Audio:
//   num/<n>.mp3      — die Zahlen 0–100
//   frag/<key>.mp3   — die Textbausteine zwischen den Zahlen
//   text/<id>.mp3    — feste Sätze am Stück (Trick-Erklärungen, Modul-Texte)
//
// Aufgaben und Tipps werden zur Laufzeit aus num/ und frag/ zusammengesetzt,
// weil sie zu viele Zahlenkombinationen haben, um sie fertig zu rendern.
//
// Aufruf:
//   npm run gen:training-audio              # alles Fehlende erzeugen
//   npm run gen:training-audio -- --limit 5 # erst mal fünf zum Reinhören
//   npm run gen:training-audio -- --force   # auch vorhandene neu erzeugen
//   npm run gen:training-audio -- --dry-run # nur zeigen, was fehlt
//
// Der Key kommt aus .env.local (GEMINI_API_KEY) — er wird NUR hier beim
// Erzeugen gebraucht. Die fertigen mp3s liegen im Repo, die App auf Vercel
// braucht keinen Key und ruft zur Laufzeit keine API.

import fs from "node:fs";
import path from "node:path";
import { Mp3Encoder } from "@breezystack/lamejs";

const API_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error(
    "GEMINI_API_KEY fehlt.\n" +
      "Leg ihn in .env.local an (GEMINI_API_KEY=...) — die Datei ist gitignored."
  );
  process.exit(1);
}

const MODEL = process.env.GEMINI_TTS_MODEL ?? "gemini-2.5-flash-preview-tts";
/** Stimme: warm und jung, passend zur Zielgruppe. Über Env austauschbar. */
const VOICE = process.env.GEMINI_TTS_VOICE ?? "Leda";

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");
const LIMIT = readLimit(args);
/** Gleichzeitige Requests. Konservativ — TTS-Quotas sind knapper als Text. */
const CONCURRENCY = 3;

// Gemini-TTS liefert rohes PCM: 16 Bit, mono, 24 kHz.
const SAMPLE_RATE = 24000;
const MP3_KBPS = 64;

const OUT_ROOT = path.resolve("public/audio/training");

type Job = { file: string; text: string; kind: "num" | "frag" | "text"; label: string };

/** `--limit N` — nur N Dateien erzeugen, zum Reinhören vor dem großen Lauf. */
function readLimit(argv: string[]): number | null {
  const index = argv.indexOf("--limit");
  if (index === -1) return null;
  const value = Number(argv[index + 1]);
  if (!Number.isInteger(value) || value < 1) {
    console.error("--limit braucht eine positive ganze Zahl.");
    process.exit(1);
  }
  return value;
}

// ----- Manifest → Job-Liste --------------------------------------------------

type Manifest = {
  numbers: number[];
  fragments: { key: string; text: string }[];
  texts: { id: string; text: string }[];
};

const manifest: Manifest = JSON.parse(
  fs.readFileSync(path.resolve("src/data/training/speech-manifest.json"), "utf8")
);

const jobs: Job[] = [
  ...manifest.numbers.map((n) => ({
    file: path.join(OUT_ROOT, "num", `${n}.mp3`),
    text: String(n),
    kind: "num" as const,
    label: String(n),
  })),
  ...manifest.fragments.map((f) => ({
    file: path.join(OUT_ROOT, "frag", `${f.key}.mp3`),
    text: f.text,
    kind: "frag" as const,
    label: f.text,
  })),
  ...manifest.texts.map((t) => ({
    file: path.join(OUT_ROOT, "text", `${t.id}.mp3`),
    text: t.text,
    kind: "text" as const,
    label: t.id,
  })),
];

let pending = jobs.filter((j) => FORCE || !fs.existsSync(j.file));
if (LIMIT !== null) pending = pending.slice(0, LIMIT);

console.log(`Modell:  ${MODEL}`);
console.log(`Stimme:  ${VOICE}`);
console.log(`Offen:   ${pending.length} von ${jobs.length} Dateien\n`);

if (DRY_RUN) {
  for (const j of pending) console.log(`  [${j.kind}] ${j.label}`);
  process.exit(0);
}
if (pending.length === 0) {
  console.log("Nichts zu tun — alles schon vertont.");
  process.exit(0);
}

for (const dir of ["num", "frag", "text"]) {
  fs.mkdirSync(path.join(OUT_ROOT, dir), { recursive: true });
}

// ----- Sprech-Anweisung ------------------------------------------------------

/**
 * Die Bausteine werden später aneinandergehängt. Damit das nicht wie drei
 * verschiedene Sprecher klingt, bekommt jeder Clip DIESELBE Anweisung:
 * gleiches Tempo, gleiche Grundstimmung, kein Auf- oder Abschwung am Ende.
 * Ganze Sätze dürfen dagegen normal betont werden.
 */
function instruction(job: Job): string {
  const common =
    "Du bist eine warme, freundliche Erzählerin für Grundschulkinder. " +
    "Sprich Hochdeutsch, ruhig und deutlich, in normalem Tempo. " +
    "Gib ausschließlich den Text wieder — keine Begrüßung, kein Kommentar, keine Wiederholung.";

  if (job.kind === "text") {
    return `${common}\nSprich diesen Satz natürlich betont:\n\n${job.text}`;
  }
  // Zahlen und Bausteine sind Satzteile: gleichmäßig, ohne Schlussmelodie,
  // damit sie sich sauber zu einem Satz zusammensetzen lassen.
  return (
    `${common}\n` +
    "Das hier ist ein Satzteil, der später mit anderen zu einem Satz verbunden wird. " +
    "Sprich ihn gleichmäßig, ohne die Stimme am Ende zu heben oder zu senken, " +
    "und mache keine Pause davor oder danach:\n\n" +
    job.text
  );
}

// ----- Gemini-Aufruf ---------------------------------------------------------

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function synthesize(job: Job): Promise<Buffer> {
  const body = {
    contents: [{ parts: [{ text: instruction(job) }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } },
      },
    },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": API_KEY! },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${detail.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
  };
  const base64 = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
  if (!base64) throw new Error(`Antwort ohne Audio: ${JSON.stringify(json).slice(0, 300)}`);

  return Buffer.from(base64, "base64");
}

// ----- PCM aufbereiten -------------------------------------------------------

/**
 * Stille am Anfang und Ende abschneiden. Ohne das klaffen zwischen den
 * zusammengesetzten Bausteinen hörbare Löcher — der Satz zerfiele in
 * Einzelwörter.
 */
function trimSilence(pcm: Int16Array): Int16Array {
  const threshold = 500; // ~1.5 % Vollaussteuerung
  const keep = Math.round(SAMPLE_RATE * 0.02); // 20 ms Luft stehen lassen
  let start = 0;
  let end = pcm.length - 1;
  while (start < pcm.length && Math.abs(pcm[start]) < threshold) start++;
  while (end > start && Math.abs(pcm[end]) < threshold) end--;
  if (start >= end) return pcm; // komplett still — lieber unverändert lassen
  return pcm.subarray(Math.max(0, start - keep), Math.min(pcm.length, end + keep));
}

/**
 * Lautstärke angleichen. Gemini liefert Clip zu Clip unterschiedlich laut;
 * aneinandergehängt fiele das sofort auf.
 */
function normalize(pcm: Int16Array): Int16Array {
  let peak = 0;
  for (const s of pcm) peak = Math.max(peak, Math.abs(s));
  if (peak === 0) return pcm;
  const gain = Math.min(4, (0.89 * 32767) / peak);
  if (gain <= 1.02) return pcm;
  const out = new Int16Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    out[i] = Math.max(-32768, Math.min(32767, Math.round(pcm[i] * gain)));
  }
  return out;
}

function toMp3(pcm: Int16Array): Buffer {
  const encoder = new Mp3Encoder(1, SAMPLE_RATE, MP3_KBPS);
  const chunks: Buffer[] = [];
  const block = 1152;
  for (let i = 0; i < pcm.length; i += block) {
    const encoded = encoder.encodeBuffer(pcm.subarray(i, i + block));
    if (encoded.length > 0) chunks.push(Buffer.from(encoded));
  }
  const tail = encoder.flush();
  if (tail.length > 0) chunks.push(Buffer.from(tail));
  return Buffer.concat(chunks);
}

function pcmFromBuffer(raw: Buffer): Int16Array {
  // Node-Buffer können ungerade ausgerichtet sein — deshalb kopieren.
  const copy = Buffer.from(raw);
  return new Int16Array(copy.buffer, copy.byteOffset, Math.floor(copy.length / 2));
}

// ----- Lauf ------------------------------------------------------------------

let done = 0;
let failed = 0;
let bytes = 0;

async function run(job: Job): Promise<void> {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const raw = await synthesize(job);
      const mp3 = toMp3(normalize(trimSilence(pcmFromBuffer(raw))));
      fs.writeFileSync(job.file, mp3);
      bytes += mp3.length;
      done++;
      const secs = (raw.length / 2 / SAMPLE_RATE).toFixed(1);
      console.log(
        `[${done + failed}/${pending.length}] ${job.kind}/${job.label.slice(0, 46)} — ${secs}s, ${(mp3.length / 1024).toFixed(0)} kB`
      );
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const retriable = /HTTP (429|5\d\d)/.test(message);
      if (attempt === 4 || !retriable) {
        failed++;
        console.error(`FEHLER bei ${job.kind}/${job.label}: ${message}`);
        return;
      }
      const waitMs = 2000 * 2 ** (attempt - 1);
      console.warn(`  … ${message.slice(0, 80)} — neuer Versuch in ${waitMs / 1000}s`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
}

async function main(): Promise<void> {
  const queue = [...pending];
  // CONCURRENCY Arbeiter teilen sich eine Warteschlange.
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length > 0) {
        const job = queue.shift();
        if (job) await run(job);
      }
    })
  );

  console.log(
    `\nFertig: ${done} erzeugt, ${failed} fehlgeschlagen, ${(bytes / 1024 / 1024).toFixed(1)} MB geschrieben.`
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
