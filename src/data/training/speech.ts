// Sprach-Zerlegung für das Kopfrechen-Training.
//
// Ziel: JEDER Text im Training soll vorlesbar sein — auch die Aufgaben und
// Tipps, die zur Laufzeit gewürfelt werden. Zur Laufzeit eine TTS-API zu
// rufen ist hier keine Option (die App ist ein statischer Export, es gibt
// keinen Server), und die Sätze vollständig vorzurendern auch nicht:
// allein Modul 6 hat mehrere zehntausend Aufgaben-Kombinationen.
//
// Der Ausweg: Alle dynamischen Texte sind Schablonen mit eingesetzten
// Zahlen. Trennt man an den Zahlen, bleibt eine ENDLICHE Menge Textbausteine
// übrig ("Von ", " bis ", " fehlen "), plus die Zahlen 0–100. Beides wird
// einmal vertont und zur Laufzeit hintereinander abgespielt.
//
//   "Von 8 bis 10 fehlen 2."  →  ["Von", 8, "bis", 10, "fehlen", 2]
//
// `scripts/collect-speech.ts` sammelt die Bausteine aus zehntausenden
// generierten Aufgaben ein, `scripts/generate-training-audio.ts` vertont sie.

/**
 * Ein Sprech-Baustein: eine Zahl, ein Stück Text — oder eine Pause.
 *
 * Pausen entstehen aus Satzzeichen, die zwischen zwei Zahlen stehen und
 * sonst spurlos verschwinden würden: „5, 10, 15 …" wäre ohne sie ein
 * zusammengeklebtes „fünfzehnzwanzig". Sie tragen kein Audio, sondern nur
 * eine Wartezeit.
 */
export type SpeechPart =
  | { kind: "number"; value: number }
  | { kind: "fragment"; text: string }
  | { kind: "pause"; ms: number };

/** Pausenlängen: Satzende atmet länger als ein Komma. */
const PAUSE_SENTENCE_MS = 320;
const PAUSE_CLAUSE_MS = 180;

/** Zahlen außerhalb dieses Bereichs kommen im Training nicht vor. */
export const MAX_SPOKEN_NUMBER = 100;

/**
 * Mathematische Zeichen und Kurzformen, die anders gesprochen als geschrieben
 * werden. Wird auf den reinen Baustein-Text angewendet, BEVOR daraus ein
 * Schlüssel bzw. eine Audio-Datei wird.
 */
/**
 * Das „?" der Lückenaufgabe steht IMMER neben einem Rechenzeichen, einem „="
 * oder einem „ist" („9 + ? = 10", „Das Doppelte von ? ist 30") und wird zu
 * „wie viel". Jedes andere „?" ist ein echtes Fragezeichen und verschwindet.
 *
 * Diese Regeln gelten nur für die zur Laufzeit gewürfelten Texte. Feste Sätze
 * („Wie weit ist es von 8 bis 10? 2 Schritte.") behalten ihr Fragezeichen —
 * sie werden am Stück vertont, und die Frage soll auch wie eine klingen.
 */
const PLACEHOLDER_RULES: [RegExp, string][] = [
  [/\?\s*=/g, " wie viel ist "],
  [/=\s*\?/g, " ist wie viel "],
  [/\?\s*(?=[+−·×:])/g, " wie viel "],
  [/(?<=[+−·×:])\s*\?/g, " wie viel "],
  [/\?(?=\s+ist\b)/g, " wie viel "],
  [/\?/g, " "],
];

/** Rechenzeichen als Wort — gilt für alle Texte. */
const SYMBOL_RULES: [RegExp, string][] = [
  [/·/g, " mal "],
  [/×/g, " mal "],
  [/−/g, " minus "],
  [/\+/g, " plus "],
  // Doppelpunkt nur als Geteilt-Zeichen, wenn er frei steht („24 : 4").
  // In „Such die Malaufgabe: 4 · ?" bleibt er ein Doppelpunkt.
  [/(?<!\w):(?!\w)/g, " geteilt durch "],
  [/=/g, " ist "],
  // Gedankenstrich wird zum Komma statt zu verschwinden — er trennt zwei
  // Aussagen („1 + 9 = 10 — 1 und 9 sind Zahlenfreunde") und muss als Pause
  // hörbar bleiben, sonst kleben die Zahlen aneinander.
  [/[—–]/g, ", "],
  [/…/g, " "],
  [/„|"|"/g, ""],
];

/**
 * Zerlegt einen Text in Zahlen und Textbausteine.
 *
 * Zahlen werden als eigene Teile herausgezogen; alles dazwischen ist ein
 * Baustein. Leere und rein interpunktierende Zwischenstücke fallen weg —
 * sie tragen nichts zum Gesprochenen bei und würden nur die Baustein-Menge
 * aufblähen.
 */
export function splitSpeech(input: string): SpeechPart[] {
  // WICHTIG: Die Zeichen-Ersetzungen laufen auf dem GANZEN Text, nicht auf
  // den einzelnen Bausteinen. Sonst fehlt ihnen der Kontext — das „:" in
  // „19 − 8: 10 bleibt" sähe nach dem Zerlegen wie ein frei stehendes
  // Geteilt-Zeichen aus und würde als „geteilt durch" gesprochen.
  const text = toSpokenText(input);

  const parts: SpeechPart[] = [];
  const regex = /\d+/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    pushFragment(parts, text.slice(lastIndex, match.index));
    const value = Number(match[0]);
    // Zahlen jenseits des Trainings-Zahlenraums (sollte es nicht geben)
    // bleiben als Text stehen, damit nichts stumm verschluckt wird.
    if (Number.isFinite(value) && value >= 0 && value <= MAX_SPOKEN_NUMBER) {
      parts.push({ kind: "number", value });
    } else {
      pushFragment(parts, match[0]);
    }
    lastIndex = match.index + match[0].length;
  }
  pushFragment(parts, text.slice(lastIndex));

  return parts;
}

function pushFragment(parts: SpeechPart[], raw: string): void {
  const text = normalizeFragment(raw);
  if (text) {
    // Beginnt der Baustein mit einem Satzzeichen („. Zerlege die"), lag dort
    // eine Satzgrenze direkt hinter einer Zahl. Die geht beim Trimmen
    // verloren — als Pause bleibt sie hörbar.
    const lead = /^\s*([.!?…;,:])/.exec(raw);
    if (lead && parts.length > 0 && parts[parts.length - 1].kind !== "pause") {
      const ms = /[.!?]/.test(lead[1]) ? PAUSE_SENTENCE_MS : PAUSE_CLAUSE_MS;
      parts.push({ kind: "pause", ms });
    }
    parts.push({ kind: "fragment", text });
    return;
  }
  // Kein sprechbarer Text übrig — aber vielleicht ein Satzzeichen, das als
  // Pause hörbar bleiben soll. Am Anfang der Sequenz bringt das nichts.
  if (parts.length === 0) return;
  if (parts[parts.length - 1].kind === "pause") return;
  if (/[.!?]/.test(raw)) parts.push({ kind: "pause", ms: PAUSE_SENTENCE_MS });
  else if (/[,;:…]/.test(raw)) parts.push({ kind: "pause", ms: PAUSE_CLAUSE_MS });
}

/**
 * Wendet alle Zeichen-Ersetzungen auf einen vollständigen Text an —
 * aus „8 + 7 = ?" wird „8 plus 7 ist wie viel".
 */
export function toSpokenText(
  raw: string,
  options: { placeholders?: boolean } = {}
): string {
  const placeholders = options.placeholders ?? true;
  let text = raw;
  if (placeholders) {
    for (const [pattern, replacement] of PLACEHOLDER_RULES) text = text.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of SYMBOL_RULES) text = text.replace(pattern, replacement);
  return tidy(text);
}

/** Whitespace einsammeln und Satzzeichen wieder ansaugen („10 ," → „10,"). */
function tidy(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/([.,;:!?])\1+/g, "$1")
    .trim();
}

/**
 * Putzt ein Zwischenstück: Whitespace normalisieren, Satzzeichen an den
 * Rändern abschneiden. Zeichen-Ersetzungen sind hier schon passiert.
 */
export function normalizeFragment(raw: string): string {
  let text = raw;
  // Satzzeichen INNERHALB des Bausteins bleiben stehen — sie geben der
  // Sprachausgabe die Pausen und die Satzmelodie. Nur außen wird getrimmt.
  text = text.replace(/\s+/g, " ").trim();
  text = text.replace(/^[.,;:!]+\s*/, "").replace(/\s*[.,;!]+$/, "").trim();
  if (!text) return "";
  // Nur noch Satzzeichen übrig → nichts zu sprechen.
  if (!/[a-zA-ZäöüÄÖÜß]/.test(text)) return "";
  return text;
}

/**
 * Stabiler Dateiname für einen Baustein. Umlaute werden transliteriert,
 * alles andere zu `-`; ein kurzer Hash hängt hinten dran, damit zwei
 * Bausteine mit gleichem Slug (aber unterschiedlichem Text) nicht kollidieren.
 */
export function fragmentKey(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${slug || "x"}-${shortHash(text)}`;
}

/** Kleiner, stabiler Hash (FNV-1a, 32 Bit) als 6-stelliger Base-36-String. */
function shortHash(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36).padStart(6, "0").slice(0, 6);
}

// ----- Pfade -----------------------------------------------------------------

const BASE = "/audio/training";

export function numberAudioSrc(value: number): string {
  return `${BASE}/num/${value}.mp3`;
}

export function fragmentAudioSrc(text: string): string {
  return `${BASE}/frag/${fragmentKey(text)}.mp3`;
}

/** Feste Texte (Trick-Erklärungen, Modul-Beschreibungen) — ganze Sätze. */
export function staticAudioSrc(id: string): string {
  return `${BASE}/text/${id}.mp3`;
}

/**
 * Audio-IDs der festen Texte. EINE Quelle für den Sammler
 * (scripts/collect-speech.ts) und die App — sonst erzeugt das Skript
 * Dateien, die die Oberfläche nie anfragt, und umgekehrt.
 */
export const staticAudioId = {
  summary: (moduleId: string) => `${moduleId}--summary`,
  trickTitle: (moduleId: string, trickIndex: number) =>
    `${moduleId}--trick-${trickIndex + 1}--title`,
  trickIdea: (moduleId: string, trickIndex: number) =>
    `${moduleId}--trick-${trickIndex + 1}--idea`,
  trickStep: (moduleId: string, trickIndex: number, stepIndex: number) =>
    `${moduleId}--trick-${trickIndex + 1}--step-${stepIndex + 1}`,
};

/** Audio-Datei eines Teils — `null` für Pausen, die nur Wartezeit sind. */
export function partAudioSrc(part: SpeechPart): string | null {
  if (part.kind === "number") return numberAudioSrc(part.value);
  if (part.kind === "fragment") return fragmentAudioSrc(part.text);
  return null;
}

/** Alle Audio-Quellen einer Sequenz, in Abspielreihenfolge (ohne Pausen). */
export function speechSources(parts: SpeechPart[]): string[] {
  return parts.map(partAudioSrc).filter((src): src is string => src !== null);
}

/**
 * Der komplette gesprochene Text am Stück — Grundlage für die Gerätestimme,
 * wenn eine Audio-Datei fehlt. Pausen werden zu Satzzeichen zurückübersetzt,
 * damit auch die eingebaute Stimme sinnvoll betont.
 */
export function speechPlainText(parts: SpeechPart[]): string {
  return parts
    .map((p) => {
      if (p.kind === "number") return ` ${p.value}`;
      if (p.kind === "fragment") return ` ${p.text}`;
      return p.ms >= PAUSE_SENTENCE_MS ? "." : ",";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
