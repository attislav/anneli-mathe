import { LAB_TOPICS } from "./lab";
import { LAB_TOPIC_IDS, type LabTopic } from "./schoolSelection";

const keywords: Record<LabTopic, string> = {
  foldCorner:"rechter Winkel Innenwinkel Ecken Papier Geometrie",
  pencils:"Stifte Lager Bestellung Zehner Einer bündeln entbündeln",
  openVotes:"Abstimmung Umfrage Stimmen Gleichstand gewinnen sicher möglich",
  repack:"Schachteln Umpacken halbieren verdoppeln Einmaleins mal Gruppen",
  equalFence:"Beet Garten Zaun Umfang Fläche Rechteck",
  sharedTime:"Treffen verabreden Uhr Uhrzeit Freizeit", morning:"Uhr Uhrzeit Tagesplan Pause", bus:"Uhr Uhrzeit Fahrzeit Abfahrt",
  weekly:"Woche Termin Datum", calendar:"Datum Monate Tage", shopping:"Geld einkaufen Cent bezahlen",
  shops:"Geld Einkauf Preise sparen", receipt:"Geld Bon Kasse bezahlen", rope:"Länge Zentimeter messen",
  parcels:"Gewicht Gramm Kilogramm Paket", boxes:"Waage Gewicht schwer", fence:"Umfang Meter Rand", juice:"Liter Flüssigkeit messen",
  targetSteps:"plus minus Ziel", pairs:"Zehnerfreunde ergänzen", dotWays:"Punkte zerlegen Mengen", covered:"Menge schätzen reichen",
  window:"Hunderterfeld Nachbarzahlen", detective:"Geheimzahl Zahlenrätsel", machine:"Regel Zahlenfolge",
  packets:"Addition Summe Summanden", split:"mal multiplizieren Einmaleins", chocolate:"teilen gerecht Hälfte Viertel",
  portions:"Hälfte Viertel Schokolade", claims:"gerade ungerade beweisen", methods:"plus minus rechnen", family:"Umkehraufgaben plus minus",
  rest:"teilen Gruppen Rest", balance:"Waage Gleichgewicht", code:"Geheimzeichen Rätsel Ziffern", swap:"Zehner Einer Ziffern",
  estimateLine:"Zahlenstrahl schätzen Mitte", viewpoint:"Blickrichtung Tisch links rechts", pegs:"Gummiband Ecken Rechteck Quadrat",
  growth:"Figurenfolge Muster wachsen", ribbon:"Muster wiederholen", folds:"Falten spiegeln Symmetrie",
  tiles:"Fläche legen drehen", rollCube:"Würfel rollen drehen", cubes:"Würfel bauen Bauplan", tower:"Würfel Turm Seitenansicht",
  route:"Raster Pfeile Richtung", stairs:"Programmieren Schleife Pfeile", map:"Koordinaten Plan Legende",
  attributes:"sortieren Eigenschaften Formen", library:"Bücher ausleihen Bestand", wheelChance:"fair Glücksrad Wahrscheinlichkeit",
  survey:"Umfrage Stimmen zählen", strips:"Textaufgabe Sachaufgabe Streifen", bag:"Zufall Wahrscheinlichkeit Beutel",
  wheels:"Fahrrad Dreirad kombinieren", recipe:"Kochen Zutaten Portionen", pictures:"Diagramm Stimmen Bilder",
  questions:"Sachaufgabe Textaufgabe Frage erfinden", ways:"kombinieren Möglichkeiten Wege", clarify:"Sachaufgabe Textaufgabe Angaben",
};
export const suggestedTerms = ["Treffen", "Uhr", "Würfel", "fair", "Falten", "Geld"];
function normalize(text: string) {
  return text.normalize("NFC").toLowerCase().replaceAll("ä","ae").replaceAll("ö","oe").replaceAll("ü","ue")
    .replaceAll("ß","ss").replace(/[^a-z0-9]+/g," ").trim();
}
const index = LAB_TOPIC_IDS.map(topic => ({ topic, title: normalize(LAB_TOPICS[topic].title),
  words: [LAB_TOPICS[topic].title, keywords[topic], LAB_TOPICS[topic].prompt].map(text => normalize(text).split(" ")) }));
export function findLabTopics(query: string): LabTopic[] {
  const normalized = normalize(query);
  if (!normalized) return [];
  const terms = normalized.split(" ");
  return index.map(({topic,title,words}) => {
    if (title === normalized) return {topic,score:100000};
    let score = 0;
    for (const term of terms) {
      let best = 0;
      for (const [i,field] of words.entries()) {
        if (field.includes(term)) best = Math.max(best,[12,10,7][i]);
        else if (field.some(word => word.startsWith(term))) best = Math.max(best,[8,6,3][i]);
      }
      if (!best) return {topic,score:0};
      score += best;
    }
    return {topic,score};
  }).filter(hit => hit.score > 0).sort((a,b) => b.score-a.score || LAB_TOPICS[a.topic].title.localeCompare(LAB_TOPICS[b.topic].title,"de"))
    .map(hit => hit.topic);
}
