// Erklärungen für die Hilfe-Karte („Soll ich's dir zeigen?“).
//
// Themen mit Rechentrick erklären sich über ihren Trick (skills.ts). Für alle
// anderen steht hier eine kurze Erklärung: Titel, ein Beispiel und 2–3
// Schritte in Kindersprache. Die Zahlen der eigenen Aufgabe kommen auf der
// Karte danach über den Tipp der Aufgabe dazu.

import { getSkill } from "./skills";

export type Explanation = { title: string; example?: string; steps: string[] };

const EXPLAIN: Record<string, Explanation> = {
  freunde10: {
    title: "Zahlenfreunde",
    example: "6 + ? = 10",
    steps: ["Zahlenfreunde sind zwei Zahlen, die zusammen 10 ergeben.", "Halte 10 Finger hoch und klapp 6 weg.", "4 Finger stehen noch. Also: 6 + 4 = 10."],
  },
  plus20: {
    title: "Plus und Minus bis 20",
    example: "6 − 3",
    steps: ["Bei Plus gehst du weiter, bei Minus gehst du zurück.", "Starte bei der 6 und mach 3 Schritte zurück: 5, 4, 3.", "Du landest bei 3. Also: 6 − 3 = 3."],
  },
  doppelt: {
    title: "Verdoppeln und Halbieren",
    example: "Doppelt von 6",
    steps: ["Verdoppeln heißt: die Zahl zweimal nehmen. 6 + 6 = 12.", "Halbieren heißt: gerecht in zwei Teile teilen.", "Die Hälfte von 12 ist 6, denn 6 + 6 = 12."],
  },
  zahlenstrahl: {
    title: "Der Zahlenstrahl",
    example: "Wo liegt die 20?",
    steps: ["Schau zuerst, wie groß ein Schritt von Strich zu Strich ist.", "Dann zählst du ab der 0 in diesen Schritten weiter.", "Bei der gesuchten Zahl hörst du auf und tippst dort hin."],
  },
  vergleichen: {
    title: "Größer oder kleiner?",
    example: "47 und 52",
    steps: ["Schau zuerst auf die Zehner: 4 Zehner und 5 Zehner.", "Mehr Zehner heißt: die Zahl ist größer. Also ist 52 größer.", "Sind die Zehner gleich, entscheiden die Einer."],
  },
  nachbarn: {
    title: "Nachbarzahlen",
    example: "74",
    steps: ["Jede Zahl hat zwei Nachbarn: einen davor und einen danach.", "Der Nachbar danach ist eins mehr: 75.", "Der Nachbar davor ist eins weniger: 73."],
  },
  reihen: {
    title: "Zahlenreihen",
    example: "8, 10, 12, 14, ?",
    steps: ["Schau dir zwei Zahlen nebeneinander an: von 8 zu 10.", "Der Sprung ist 2. Er ist bei jeder Zahl gleich.", "Mach den Sprung noch einmal: 14 + 2 = 16."],
  },
  geradeUngerade: {
    title: "Gerade und ungerade",
    example: "62",
    steps: ["Gerade Zahlen kann man gerecht in zwei Hälften teilen.", "Du musst nur auf die letzte Ziffer schauen.", "Endet die Zahl auf 0, 2, 4, 6 oder 8, ist sie gerade. Sonst ungerade."],
  },
  zehnerPlus: {
    title: "Mit Zehnern rechnen",
    example: "70 − 60",
    steps: ["70 sind 7 Zehner, 60 sind 6 Zehner.", "Rechne mit den Zehnern wie mit kleinen Zahlen: 7 − 6 = 1.", "1 Zehner sind 10. Also: 70 − 60 = 10."],
  },
  einerPlus: {
    title: "Einer dazu und weg",
    example: "93 − 1",
    steps: ["93 hat 9 Zehner und 3 Einer.", "Du nimmst nur Einer weg — die Zehner bleiben stehen.", "3 − 1 = 2. Also: 93 − 1 = 92."],
  },
  ergaenzen: {
    title: "Ergänzen",
    example: "30 + ? = 100",
    steps: ["Gefragt ist: Wie viel fehlt noch bis zur 100?", "Denk an die Zahlenfreunde: 3 + 7 = 10.", "Mit Zehnern genauso: 30 + 70 = 100."],
  },
  mauern: {
    title: "Zahlenmauern",
    example: "Stein über 8 und 5",
    steps: ["Zwei Steine nebeneinander ergeben zusammen den Stein darüber.", "Über 8 und 5 steht also 8 + 5 = 13.", "Fehlt unten ein Stein, rechnest du von oben minus den anderen."],
  },
  geldLegen: {
    title: "Geld legen",
    example: "41 ct",
    steps: ["Nimm zuerst das größte Geldstück, das noch passt: 20 ct.", "Noch eins: 20 ct. Jetzt hast du 40 ct.", "Es fehlt noch 1 ct. Fertig: 20 + 20 + 1 = 41 ct."],
  },
  euroCent: {
    title: "Euro und Cent",
    example: "300 ct",
    steps: ["Merke: 100 Cent sind genau 1 Euro.", "In 300 Cent steckt die 100 dreimal.", "Also: 300 ct = 3 €."],
  },
  geldVergleichen: {
    title: "Was ist mehr Geld?",
    example: "1 € oder 80 ct",
    steps: ["Rechne beide Beträge in Cent um.", "1 € sind 100 ct.", "100 ct ist mehr als 80 ct — also ist 1 € mehr."],
  },
  malVerstehen: {
    title: "Malnehmen verstehen",
    example: "5 · 3",
    steps: ["5 · 3 heißt: 5-mal die 3.", "Stell dir 5 Reihen mit je 3 Punkten vor.", "Zusammen: 3 + 3 + 3 + 3 + 3 = 15."],
  },
  tauschen: {
    title: "Tauschaufgaben",
    example: "7 · 8",
    steps: ["Beim Malnehmen darfst du die Zahlen tauschen: 7 · 8 = 8 · 7.", "Nimm die Aufgabe, die du leichter findest.", "Tipp: Von 5 · 8 = 40 aus noch 2-mal die 8 dazu: 56."],
  },
  malSach: {
    title: "Mal-Geschichten",
    example: "4 Seelöwen mit je 3 Ringen",
    steps: ["Such in der Geschichte: Wie viele Gruppen gibt es? 4 Seelöwen.", "Wie viele sind in jeder Gruppe? Je 3 Ringe.", "Gruppen mal Anzahl: 4 · 3 = 12 Ringe."],
  },
  verteilen: {
    title: "Gerecht verteilen",
    example: "15 Brezeln auf 3 Teller",
    steps: ["Gerecht heißt: Auf jedem Teller liegt gleich viel.", "Leg reihum auf jeden Teller eine Brezel.", "Mach weiter, bis nichts mehr übrig ist. Dann liegen 5 auf jedem Teller."],
  },
  umkehr: {
    title: "Mal und Geteilt gehören zusammen",
    example: "4 · 4 = 16",
    steps: ["In beiden Aufgaben stecken dieselben Zahlen: 4, 4 und 16.", "Beim Teilen steht die größte Zahl vorne.", "Also: 16 : 4 = 4."],
  },
  backSach: {
    title: "Teil-Geschichten",
    example: "9 Brötchen, immer 3 in einen Korb",
    steps: ["Gefragt ist: Wie oft passt die 3 in die 9?", "Zähl in 3er-Schritten: 3, 6, 9 — das sind 3 Schritte.", "Also werden 3 Körbe voll: 9 : 3 = 3."],
  },
  uhrLesen: {
    title: "Die Uhr lesen",
    example: "Wie spät ist es?",
    steps: ["Der kurze Zeiger zeigt die Stunde.", "Der lange Zeiger zeigt die Minuten. Steht er oben auf der 12, ist es eine volle Stunde.", "Steht er unten auf der 6, ist es halb — 30 Minuten nach der Stunde."],
  },
  uhrStellen: {
    title: "Die Uhr stellen",
    example: "1:30 Uhr",
    steps: ["Stell zuerst den langen Zeiger. 30 Minuten: ganz unten auf die 6.", "Dann den kurzen Zeiger: Bei halb steht er zwischen zwei Zahlen.", "Bei 1:30 Uhr steht er zwischen der 1 und der 2."],
  },
  zeitEinheiten: {
    title: "Stunden und Minuten",
    example: "Viertelstunde",
    steps: ["Eine Stunde hat 60 Minuten.", "Eine halbe Stunde ist die Hälfte: 30 Minuten.", "Eine Viertelstunde ist die Hälfte davon: 15 Minuten."],
  },
  formen: {
    title: "Formen erkennen",
    example: "Ecken zählen",
    steps: ["Fahr mit dem Finger am Rand entlang und zähl die Ecken.", "3 Ecken: Dreieck. 4 Ecken: Viereck — sind alle Seiten gleich lang, ist es ein Quadrat.", "Keine Ecken und ganz rund: Kreis."],
  },
  formenZaehlen: {
    title: "Formen zählen",
    example: "Wie viele Rechtecke?",
    steps: ["Such dir eine Ecke des Bildes aus und fang dort an.", "Tipp jede Form in Gedanken an und zähl laut mit.", "So zählst du keine doppelt und vergisst keine."],
  },
  muster: {
    title: "Muster fortsetzen",
    example: "rot, blau, rot, blau, …",
    steps: ["Such das Stück, das sich immer wiederholt.", "Hier ist es „rot, blau“.", "Sag das Muster laut weiter: rot, blau, rot, blau, rot …"],
  },
  koerper: {
    title: "Körper erkennen",
    example: "Ball, Würfel, Dose",
    steps: ["Ist der Körper ganz rund wie ein Ball? Dann ist es eine Kugel.", "Hat er 6 gleiche Quadrate als Flächen? Dann ist es ein Würfel.", "Rund mit zwei flachen Kreisen oben und unten, wie eine Dose: ein Zylinder."],
  },
  einheiten: {
    title: "Meter und Zentimeter",
    example: "900 cm",
    steps: ["Merke: 1 Meter sind 100 Zentimeter.", "Frag dich: Wie oft passen 100 cm in 900 cm?", "9-mal. Also: 900 cm = 9 m."],
  },
  schaetzen: {
    title: "Längen schätzen",
    example: "Wie lang ist ein Bus?",
    steps: ["Vergleiche mit Dingen, die du kennst.", "Ein Lineal ist 30 cm lang, eine Tür ist 2 m hoch.", "Ein Bus ist viel länger als eine Tür hoch ist — also viele Meter."],
  },
  laengenRechnen: {
    title: "Mit Längen rechnen",
    example: "12 cm + 34 cm",
    steps: ["Lass die Einheit kurz weg und rechne nur mit den Zahlen.", "12 + 34 = 46.", "Dann die Einheit wieder dran: 46 cm."],
  },
  laengenVergleichen: {
    title: "Längen vergleichen",
    example: "1 m oder 80 cm",
    steps: ["Rechne beide Längen in Zentimeter um.", "1 m sind 100 cm.", "100 cm ist mehr als 80 cm — also ist 1 m länger."],
  },
  fehlerDetektiv: {
    title: "Fehler-Detektiv",
    example: "Welche Rechnung stimmt nicht?",
    steps: ["Rechne jede Aufgabe selbst nach — ganz in Ruhe.", "Vergleiche dein Ergebnis mit dem, das dasteht.", "Wo es nicht passt, hat sich der Fehler versteckt!"],
  },
};

/**
 * Minus wird anders erklärt als Plus: rückwärts gehen, wegnehmen, Pause am
 * Zehner auf dem Weg nach unten. Gilt für Minus-Aufgaben in Themen, deren
 * Trick bzw. Erklärung von Plus handelt.
 */
const MINUS_SMALL: Explanation = {
  title: "Rückwärts mit Zehner-Pause",
  example: "13 − 5",
  steps: ["Minus heißt: wegnehmen — du gehst rückwärts.", "Geh erst zurück bis zur 10: 13 − 3 = 10. Pause am Zehner!", "Von der 5 musst du noch 2 wegnehmen: 10 − 2 = 8."],
};
const MINUS_BIG: Explanation = {
  title: "Minus: erst Zehner weg, dann Einer",
  example: "63 − 27",
  steps: ["Minus heißt: wegnehmen. Zerlege die 27 in 20 und 7.", "Erst die Zehner weg: 63 − 20 = 43.", "Dann die 7 Einer weg — mit Pause am Zehner: 43 − 3 = 40, 40 − 4 = 36."],
};

/** Erklärung für ein Thema: der Rechentrick, sonst die Erklärung von oben. Bei Minus-Aufgaben die Minus-Erklärung. */
export function explanationFor(skillId: string, term?: string): Explanation | null {
  const trick = getSkill(skillId).trick;
  const base: Explanation | null = trick ? { title: trick.title, example: trick.example, steps: trick.steps } : (EXPLAIN[skillId] ?? null);
  const minus = term?.match(/^(\d+)(?: \w+)? − (\d+)/);
  if (minus && base && !/−/.test(`${base.example ?? ""} ${base.steps.join(" ")}`)) {
    return Number(minus[2]) >= 10 ? MINUS_BIG : MINUS_SMALL;
  }
  return base;
}
