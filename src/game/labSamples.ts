import { pick } from "./random";
import { LAB_GROUPS, type LabTopic } from "./schoolSelection";

type Sample = { topic: LabTopic; question: string; options: string[]; answer: string; explanation: string;
  picture?: { label: string; rows: string[][] } };
export const samples: Sample[] = [
  { topic: "pairs", question: "Welche Zahl fehlt bis 10?", picture: { label: "7 plus eine fehlende Zahl ergibt 10", rows: [["7", "+", "?", "=", "10"]] },
    options: ["2", "3", "4"], answer: "3", explanation: "Zähle von 7 weiter: 8, 9, 10. Das sind drei Schritte." },
  { topic: "machine", question: "Die Maschine rechnet immer gleich. Was kommt bei 6 heraus?",
    picture: { label: "Die Rechenmaschine macht aus 2 eine 5 und aus 4 eine 7. Was macht sie aus 6?", rows: [["2", "→", "5"], ["4", "→", "7"], ["6", "→", "?"]] },
    options: ["8", "9", "10"], answer: "9", explanation: "Die Maschine zählt immer 3 dazu. Aus 6 wird 9." },
  { topic: "tiles", question: "Wie viele Dominosteine mit je 2 Kästchen bedecken das ganze Feld?",
    picture: { label: "Ein Rechteck aus zwei Reihen mit je drei Kästchen", rows: [["□","□","□"], ["□","□","□"]] },
    options: ["2", "3", "6"], answer: "3", explanation: "Lege in jede der drei Spalten einen Domino. Drei Steine bedecken alle sechs Kästchen." },
  { topic: "route", question: "Starte beim Stern. Gehe ein Feld nach rechts, dann eines nach unten. Wo landest du?",
    picture: { label: "Oben sind Stern und Mond, darunter Blatt und Ball", rows: [["Stern", "Mond"], ["Blatt", "Ball"]] },
    options: ["Mond", "Blatt", "Ball"], answer: "Ball", explanation: "Vom Stern geht es rechts zum Mond. Ein Feld darunter liegt der Ball." },
  { topic: "bus", question: "Wie lange bist du mit dem Bus unterwegs?",
    picture: { label: "Abfahrt an der Schule um 9:05 Uhr, Ankunft am Park um 9:20 Uhr", rows: [["Schule", "9:05"], ["Park", "9:20"]] },
    options: ["5 Minuten", "15 Minuten", "25 Minuten"], answer: "15 Minuten", explanation: "Von 9:05 bis 9:15 sind es 10 Minuten. Bis 9:20 kommen noch 5 dazu." },
  { topic: "shopping", question: "Du hast 20 Cent. Was kannst du zusammen mit dem Apfel für genau 20 Cent kaufen?",
    picture: { label: "Apfel 12 Cent, Birne 8 Cent, Pflaume 6 Cent, Kirsche 4 Cent", rows: [["Apfel","12 ct"],["Birne","8 ct"],["Pflaume","6 ct"],["Kirsche","4 ct"]] },
    options: ["Birne", "Pflaume", "Kirsche"], answer: "Birne", explanation: "Zum Apfel für 12 Cent fehlen 8 Cent bis 20. Die Birne kostet genau 8 Cent." },
  { topic: "survey", question: "Die Kinder stimmen über Obst ab. Wie viele Stimmen hat die Birne?",
    picture: { label: "Stimmzettel: Birne, Apfel, Birne, Birne, Apfel", rows: [["Birne", "Apfel", "Birne"], ["Birne", "Apfel"]] },
    options: ["2", "3", "5"], answer: "3", explanation: "Birne steht auf dem ersten, dritten und vierten Zettel. Das sind drei Stimmen." },
  { topic: "questions", question: "Im Korb liegen 5 Äpfel und 2 Birnen. Welche Rechnung beantwortet „Wie viele Früchte sind es zusammen?“",
    options: ["5 − 2", "5 + 2", "5 + 5"], answer: "5 + 2", explanation: "„Zusammen“ heißt hier: Beide Gruppen zählen. 5 Äpfel plus 2 Birnen sind 7 Früchte." },
];
export type SampleArea = typeof LAB_GROUPS[number]["title"];
export function areaSamples(area: SampleArea) {
  const topics: readonly LabTopic[] = LAB_GROUPS.find(group => group.title === area)!.topics;
  return samples.filter(sample => topics.includes(sample.topic));
}
export const sampleAction: Partial<Record<LabTopic, string>> = {
  pairs: "Zahlen ergänzen", machine: "Eine Rechenregel entdecken", tiles: "Ein Feld mit Dominosteinen füllen",
  route: "Einen Weg verfolgen", bus: "Eine Fahrdauer bestimmen", shopping: "Passend einkaufen",
  survey: "Stimmen auszählen", questions: "Die passende Rechnung finden",
};
export class SampleVisit {
  private history = new Map<SampleArea, Sample[]>();
  choose(area: SampleArea, sample: Sample) {
    const seen = this.history.get(area) ?? [];
    this.history.set(area, [...seen.filter(item => item !== sample), sample]);
    return sample;
  }
  next(area: SampleArea) {
    const pool = areaSamples(area);
    let seen = this.history.get(area) ?? [];
    if (seen.length === pool.length) seen = seen.slice(-1);
    const sample = pick(pool.filter(item => !seen.includes(item)));
    this.history.set(area, [...seen, sample]);
    return sample;
  }
}
export function sampleFeedback(sample: Sample, answer: string | null) {
  if (answer === null) return `So geht es: ${sample.explanation}`;
  if (answer === sample.answer) return `Richtig! ${sample.explanation}`;
  return `Hier passt „${sample.answer}“. ${sample.explanation}`;
}
