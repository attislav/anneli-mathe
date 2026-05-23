// Mikro-Vignetten pro Skill — 1-2-Satz-Story-Schnipsel, in denen die
// nackte Mathe-Frage steckt. Jede Vignette ist eine Funktion, die die
// konkreten Zahlen der Aufgabe entgegennimmt und einen passenden Satz
// liefert (grammatikalisch korrekt für die Anneli-Welt).
//
// Pädagogisches Ziel: Mathe nicht als nackten Term, sondern eingebettet
// in die Sky-Kingdom-Welt — Vögel, Eier, Federn, Wind, Wolken, Brücken.
// MIND. 8 Templates pro Skill (Plain-Form), zusätzlich Lücken-/Spezial-
// Templates für die jeweils passenden Varianten.
//
// Sky-Kingdom-Welt-Inventar:
//   Wesen:        Vogelmama, Pip, Pip's Geschwister, alte Eule,
//                 junger Falke, Kolibri, kleine Wolkenvögel
//   Orte:         Nest, Wolken-Insel, Brücke, Zweig, Felsen, Lichtung,
//                 Vogelbad, Wolkenwiese
//   Gegenstände:  Eier, Federn (bunt), Beeren, Würmer, Steine,
//                 Federkronen, Zweigchen, Wolken-Wolle
//   Phänomene:    Wind, Regenbogen, Mond, Sternchen, Glühwürmchen
//   Aktivitäten:  zählen, sortieren, verteilen, sammeln, fliegen,
//                 bauen, austauschen

import { pickOne } from "./types";

/** Ergebnis eines Vignetten-Generators: ein 1-2-Satz Story-Schnipsel. */
type VignetteFn<TArgs extends object> = (args: TArgs) => string;

/**
 * Plural-1-Helper für Mathe-Vignetten. „1 Federn" klingt schief —
 * mit den Hauptwörtern aus der Sky-Kingdom-Welt liefern wir Singular-Form
 * wenn n === 1.
 *
 * Verwendung: `${qty(1, "Feder", "Federn")}` → "1 Feder".
 */
function qty(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

// ---------- counting20 ----------

type CountingArgs = {
  total: number;
  /** "plain" = einfach zählen, "missing" = wie viele fehlen bis 20,
   *  "even-only" = nur Gerade zählen */
  variant?: "plain" | "missing" | "even-only";
};

const COUNTING_TEMPLATES_PLAIN: VignetteFn<CountingArgs>[] = [
  ({ total }) =>
    `Vogelmama schaut ins Nest. Es liegen ${total} Eier — aber sie hat sich verzählt. Hilf ihr.`,
  ({ total }) =>
    `Der Wind hat ${total} Federn auf die Brücke geweht. Wie viele liegen da?`,
  ({ total }) =>
    `Pip sammelt Beeren. Auf dem Zweig liegen ${total} Stück. Kannst du sie auf einen Blick erkennen?`,
  ({ total }) =>
    `Die Wolke trägt ${total} kleine Vögel. Zähl sie schnell, bevor sie wegfliegen.`,
  ({ total }) =>
    `Auf dem Holzplankenbrett liegen ${total} Steine. Wie viele sind es?`,
  ({ total }) =>
    `Die alte Eule hat ${total} Sternchen aus der Nacht gesammelt. Wie viele leuchten in ihrem Korb?`,
  ({ total }) =>
    `Pip's Geschwister verteilen ${total} Federkronen auf der Wolkenwiese. Wie viele sind das?`,
  ({ total }) =>
    `Auf dem Felsen sitzen ${total} Glühwürmchen. Sie blinken im Takt — zähl sie.`,
  ({ total }) =>
    `Der junge Falke hat ${total} Würmer gefangen. Wie viele liegen auf dem Zweig?`,
  ({ total }) =>
    `Im Vogelbad schwimmen ${total} bunte Federn. Wie viele zählst du?`,
  ({ total }) =>
    `Auf der Lichtung wachsen ${total} kleine Wolken-Wolle-Büschel. Wie viele sind es?`,
  ({ total }) =>
    `Der Kolibri hat ${total} winzige Beeren gepflückt. Wie viele hängen am Stiel?`,
];

const COUNTING_TEMPLATES_MISSING: VignetteFn<CountingArgs>[] = [
  ({ total }) =>
    `Pip braucht 20 Federn für eine große Krone. Er hat schon ${total}. Wie viele fehlen ihm noch?`,
  ({ total }) =>
    `Vogelmama will 20 Eier zählen, hat aber erst ${total} im Nest. Wie viele fehlen?`,
  ({ total }) =>
    `Der Mond fragt die Eule: „Hast du schon 20 Sternchen?" Sie hat ${total}. Wie viele fehlen bis 20?`,
  ({ total }) =>
    `Auf der Wolke sollen 20 Beeren liegen. Bisher sind es ${total}. Wie viele fehlen noch?`,
  ({ total }) =>
    `Pip sammelt für ein Fest 20 Glühwürmchen. Er hat ${total}. Wie viele muss er noch finden?`,
];

const COUNTING_TEMPLATES_EVEN: VignetteFn<CountingArgs>[] = [
  ({ total }) =>
    `Auf der Brücke liegen viele Federn — nur die GERADEN Stellen darfst du zählen. Es sind ${total} gerade Federn. Stimmt das?`,
  ({ total }) =>
    `Pip ordnet die Steine paarweise. Es passen ${total} ins Paar-Spiel. Wie viele Paar-Steine sind das?`,
  ({ total }) =>
    `Vogelmama nimmt nur jedes zweite Ei aus dem Nest — es sind ${total} gerade Stück. Stimmt das?`,
];

export function vignetteCounting(args: CountingArgs): string {
  const v = args.variant ?? "plain";
  if (v === "missing") return pickOne(COUNTING_TEMPLATES_MISSING)(args);
  if (v === "even-only") return pickOne(COUNTING_TEMPLATES_EVEN)(args);
  return pickOne(COUNTING_TEMPLATES_PLAIN)(args);
}

// ---------- addition20 ----------

type AddArgs = {
  a: number;
  b: number;
  sum: number;
  form: "a+b" | "a+?" | "?+b" | "commutative";
};

const ADD_TEMPLATES_FULL: VignetteFn<AddArgs>[] = [
  ({ a, b }) =>
    `Vogelmama zählt ${qty(a, "Ei", "Eier")} im Nest. Dann legt sie noch ${b} dazu. Wie viele sind es jetzt?`,
  ({ a, b }) =>
    `Pip findet ${qty(a, "Beere", "Beeren")} auf dem Zweig und ${qty(b, "Beere", "Beeren")} auf dem Boden. Wie viele zusammen?`,
  ({ a, b }) =>
    `Auf der ersten Wolke sitzen ${qty(a, "Vogel", "Vögel")}, auf der zweiten ${b}. Wie viele Vögel insgesamt?`,
  ({ a, b }) =>
    `Der Wind hat ${qty(a, "Feder", "Federn")} weggeweht. Später kommen ${b} neue zurück. Wie viele Federn liegen jetzt da?`,
  ({ a, b }) =>
    `Die alte Eule hat ${qty(a, "Sternchen", "Sternchen")} im Körbchen und fängt noch ${b} ein. Wie viele Sternchen sind es jetzt?`,
  ({ a, b }) =>
    `Pip's Geschwister bauen ein Nest aus ${qty(a, "Zweigchen", "Zweigchen")}. Vogelmama bringt ${b} dazu. Wie viele Zweigchen liegen jetzt im Nest?`,
  ({ a, b }) =>
    `Auf dem Felsen sitzen ${qty(a, "Glühwürmchen", "Glühwürmchen")}. ${b} weitere fliegen dazu. Wie viele leuchten jetzt zusammen?`,
  ({ a, b }) =>
    `Der junge Falke fängt am Morgen ${qty(a, "Wurm", "Würmer")} und am Mittag ${b}. Wie viele hat er insgesamt?`,
  ({ a, b }) =>
    `Im Vogelbad schwimmen ${qty(a, "Feder", "Federn")}. Der Wind weht ${b} dazu. Wie viele Federn schwimmen jetzt?`,
  ({ a, b }) =>
    `Kolibri sammelt ${qty(a, "Tropfen", "Tropfen")} Tau und Pip findet ${b} weitere. Wie viele Tropfen haben sie zusammen?`,
  ({ a, b }) =>
    `Auf der Lichtung blühen ${qty(a, "Wolken-Wolle-Blüte", "Wolken-Wolle-Blüten")} und Vogelmama pflanzt ${b} dazu. Wie viele Blüten stehen jetzt da?`,
  ({ a, b }) =>
    `Pip findet ${qty(a, "bunten Stein", "bunte Steine")} am Vormittag und ${b} am Nachmittag. Wie viele Steine hat er insgesamt?`,
];

const ADD_TEMPLATES_GAP_AB: VignetteFn<AddArgs>[] = [
  ({ a, sum }) =>
    `Vogelmama hat ${qty(a, "Ei", "Eier")}. Insgesamt sollen es ${sum} sein. Wie viele fehlen noch?`,
  ({ a, sum }) =>
    `Auf der Wolke sitzen schon ${qty(a, "Vogel", "Vögel")}. Plötzlich sind es ${sum}. Wie viele sind dazu geflogen?`,
  ({ a, sum }) =>
    `Pip hat ${qty(a, "Beere", "Beeren")} gesammelt. Er braucht insgesamt ${sum} für das Fest. Wie viele muss er noch finden?`,
  ({ a, sum }) =>
    `Die Eule hat ${qty(a, "Sternchen", "Sternchen")}. Bis zur ganzen Konstellation fehlen welche — sie braucht ${sum}. Wie viele muss sie noch sammeln?`,
  ({ a, sum }) =>
    `Im Nest liegen ${qty(a, "Zweigchen", "Zweigchen")}. Für die Wand brauchen wir ${sum}. Wie viele fehlen?`,
  ({ a, sum }) =>
    `Der Kolibri hat ${qty(a, "Tropfen", "Tropfen")} Tau. ${sum} Tropfen passen in seine Schale. Wie viele Tropfen fehlen?`,
];

const ADD_TEMPLATES_GAP_PB: VignetteFn<AddArgs>[] = [
  ({ b, sum }) =>
    `Pip kennt nicht die ganze Zahl. Er weiß nur: ein paar Beeren plus ${b} sind ${sum}. Wie viele waren am Anfang?`,
  ({ b, sum }) =>
    `Der Wind hat ein paar Federn weggetragen, dann kommen ${qty(b, "Feder", "Federn")} zurück — jetzt sind es ${sum}. Wie viele waren vorher schon da?`,
  ({ b, sum }) =>
    `Im Nest waren erst einige Eier, dann legt Vogelmama ${qty(b, "Ei", "Eier")} dazu — jetzt sind es ${sum}. Wie viele waren am Anfang?`,
  ({ b, sum }) =>
    `Auf dem Zweig saßen Vögel, ${b} weitere kommen. Jetzt sind es ${sum}. Wie viele waren zuerst da?`,
  ({ b, sum }) =>
    `Die Eule hatte Sternchen, dann fängt sie noch ${b} ein. Jetzt hat sie ${sum}. Wie viele Sternchen hatte sie vorher?`,
];

const ADD_TEMPLATES_COMMUTATIVE: VignetteFn<AddArgs>[] = [
  ({ a, b, sum }) =>
    `Vogelmama sagt: ${a} + ${b} = ${sum}. Pip fragt: Wäre ${b} + ${a} auch ${sum}? Tipp die Summe.`,
  ({ a, b, sum }) =>
    `Erst ${a} Beeren, dann ${b} Beeren — oder erst ${b}, dann ${a}: bleibt die Anzahl gleich? Tipp den Wert.`,
];

export function vignetteAddition(args: AddArgs): string {
  switch (args.form) {
    case "a+b":
      return pickOne(ADD_TEMPLATES_FULL)(args);
    case "a+?":
      return pickOne(ADD_TEMPLATES_GAP_AB)(args);
    case "?+b":
      return pickOne(ADD_TEMPLATES_GAP_PB)(args);
    case "commutative":
      return pickOne(ADD_TEMPLATES_COMMUTATIVE)(args);
  }
}

// ---------- subtraction20 ----------

type SubArgs = {
  a: number;
  b: number;
  diff: number;
  form: "a-b" | "a-?" | "?-b" | "context";
};

const SUB_TEMPLATES_FULL: VignetteFn<SubArgs>[] = [
  ({ a, b }) =>
    `${qty(a, "Feder", "Federn")} liegen auf der Brücke. Der Wind bläst ${b} weg. Wie viele bleiben übrig?`,
  ({ a, b }) =>
    `Im Nest sind ${qty(a, "Ei", "Eier")}. ${b} sind schon geschlüpft. Wie viele Eier liegen noch da?`,
  ({ a, b }) =>
    `Pip hat ${qty(a, "Beere", "Beeren")} gesammelt. Er teilt ${b} mit Vogelmama. Wie viele behält Pip?`,
  ({ a, b }) =>
    `${qty(a, "Vogel", "Vögel")} sitzen auf der Wolke. ${b} fliegen weg. Wie viele bleiben?`,
  ({ a, b }) =>
    `Die Eule hatte ${qty(a, "Sternchen", "Sternchen")} im Korb. ${b} sind durch ein Loch gefallen. Wie viele leuchten noch?`,
  ({ a, b }) =>
    `Auf dem Felsen lagen ${qty(a, "Glühwürmchen", "Glühwürmchen")}. ${b} sind in die Nacht geflogen. Wie viele leuchten noch?`,
  ({ a, b }) =>
    `Der junge Falke hatte ${qty(a, "Wurm", "Würmer")}. ${b} sind ihm entwischt. Wie viele bleiben?`,
  ({ a, b }) =>
    `Im Vogelbad schwammen ${qty(a, "Feder", "Federn")}. Der Wind nimmt ${b} mit. Wie viele schwimmen noch?`,
  ({ a, b }) =>
    `Pip's Geschwister hatten ${qty(a, "Zweigchen", "Zweigchen")} im Nest. Beim Sturm fallen ${b} runter. Wie viele bleiben drin?`,
  ({ a, b }) =>
    `Auf der Lichtung blühten ${qty(a, "Wolken-Wolle-Blüte", "Wolken-Wolle-Blüten")}. ${b} schließen sich abends. Wie viele bleiben offen?`,
  ({ a, b }) =>
    `Vogelmama hatte ${qty(a, "Beere", "Beeren")}. Sie verschenkt ${b} an die Nachbarn. Wie viele behält sie?`,
  ({ a, b }) =>
    `Der Kolibri trinkt von ${qty(a, "Tropfen", "Tropfen")} Tau. ${b} verdunsten in der Sonne. Wie viele bleiben?`,
];

const SUB_TEMPLATES_GAP_AB: VignetteFn<SubArgs>[] = [
  ({ a, diff }) =>
    `Es waren ${qty(a, "Feder", "Federn")} da. Jetzt sind nur noch ${diff} übrig. Wie viele hat der Wind weggeblasen?`,
  ({ a, diff }) =>
    `Im Nest waren ${qty(a, "Ei", "Eier")}. Jetzt sind nur noch ${diff} da. Wie viele sind geschlüpft?`,
  ({ a, diff }) =>
    `Pip hatte ${qty(a, "Beere", "Beeren")}. Er hat ${diff} übrig. Wie viele hat er gegessen?`,
  ({ a, diff }) =>
    `Auf dem Felsen saßen ${qty(a, "Glühwürmchen", "Glühwürmchen")}. ${diff} leuchten noch. Wie viele sind weg?`,
  ({ a, diff }) =>
    `Die Eule hatte ${qty(a, "Sternchen", "Sternchen")}. Sie zählt nur noch ${diff}. Wie viele fehlen?`,
];

const SUB_TEMPLATES_GAP_PB: VignetteFn<SubArgs>[] = [
  ({ b, diff }) =>
    `Eine unbekannte Zahl von Federn. ${b} fliegen weg, ${diff} bleiben. Wie viele waren am Anfang da?`,
  ({ b, diff }) =>
    `${qty(b, "Vogel", "Vögel")} fliegen los, ${diff} bleiben auf der Wolke. Wie viele waren es zuerst?`,
  ({ b, diff }) =>
    `Pip teilt ${qty(b, "Beere", "Beeren")} aus und behält ${diff}. Mit wie vielen Beeren hat er angefangen?`,
  ({ b, diff }) =>
    `Der Wind nimmt ${qty(b, "Zweigchen", "Zweigchen")} weg. ${diff} bleiben im Nest. Wie viele waren vorher da?`,
];

const SUB_TEMPLATES_CONTEXT: VignetteFn<SubArgs>[] = [
  ({ a, diff }) =>
    `Anneli hatte ${qty(a, "Feder", "Federn")} im Beutel. Jetzt findet sie nur noch ${diff} darin. Wie viele hat sie verloren?`,
  ({ a, diff }) =>
    `Vogelmama hatte ${qty(a, "Ei", "Eier")} gezählt. Beim Sturm sind welche verschwunden — jetzt sind es ${diff}. Wie viele Eier sind weg?`,
  ({ a, diff }) =>
    `Pip startete mit ${qty(a, "Beere", "Beeren")} und kommt mit ${diff} zurück. Wie viele hat er unterwegs verloren?`,
];

export function vignetteSubtraction(args: SubArgs): string {
  switch (args.form) {
    case "a-b":
      return pickOne(SUB_TEMPLATES_FULL)(args);
    case "a-?":
      return pickOne(SUB_TEMPLATES_GAP_AB)(args);
    case "?-b":
      return pickOne(SUB_TEMPLATES_GAP_PB)(args);
    case "context":
      return pickOne(SUB_TEMPLATES_CONTEXT)(args);
  }
}

// ---------- compare100 ----------

type CompareArgs = {
  left: number;
  right: number;
  askLarger: boolean;
  /** "pair" = klassisch zwei Zahlen, "multi-pick" = aus 3 wählen,
   *  "set" = zwei Mengen vergleichen */
  variant?: "pair" | "multi-pick" | "set";
  /** für multi-pick: gefragt nach größte oder kleinste */
  pick?: "largest" | "smallest";
};

const COMPARE_TEMPLATES_PAIR: VignetteFn<CompareArgs>[] = [
  ({ left, right }) =>
    `Zwei Inseln. Auf der einen liegen ${left} Federn, auf der anderen ${right}. Setz das richtige Zeichen dazwischen.`,
  ({ left, right }) =>
    `Auf Wolke A sitzen ${left} Vögel, auf Wolke B ${right}. Welche Seite ist schwerer? Stell die Waage richtig.`,
  ({ left, right }) =>
    `Die Waagebrücke schwankt. Links ${left} Beeren, rechts ${right} Beeren. Welches Zeichen passt zwischen die Zahlen?`,
  ({ left, right }) =>
    `Im Nest A liegen ${left} Eier, im Nest B ${right}. Welches Nest ist voller?`,
  ({ left, right }) =>
    `Die Eule sortiert Sternchen: ${left} im linken Topf, ${right} im rechten. Welches Zeichen gehört dazwischen?`,
  ({ left, right }) =>
    `Pip zählt ${left} Würmer am Morgen und ${right} am Abend. Welche Zahl ist größer?`,
  ({ left, right }) =>
    `Auf zwei Wolkenwiesen blühen ${left} und ${right} Wolken-Wolle-Blüten. Setz das passende Zeichen.`,
  ({ left, right }) =>
    `Der junge Falke fängt ${left} Mücken, der Kolibri ${right}. Wer hat mehr?`,
  ({ left, right }) =>
    `Links auf dem Felsen sitzen ${left} Glühwürmchen, rechts ${right}. Welches Zeichen gehört dazwischen?`,
  ({ left, right }) =>
    `Auf der Lichtung wachsen ${left} Beerensträucher, auf der anderen Seite ${right}. Welche Zahl ist größer?`,
];

const COMPARE_TEMPLATES_MULTI: VignetteFn<CompareArgs & { values?: number[] }>[] = [
  ({ values, pick }) =>
    `Drei Nester voller Eier: ${values?.join(", ")}. Welches Nest hat die ${pick === "smallest" ? "wenigsten" : "meisten"} Eier?`,
  ({ values, pick }) =>
    `Pip sieht drei Federhaufen: ${values?.join(", ")}. ${pick === "smallest" ? "Welcher ist der kleinste?" : "Welcher ist der größte?"}`,
  ({ values, pick }) =>
    `Die Eule hat drei Körbe Sternchen: ${values?.join(", ")}. ${pick === "smallest" ? "Welcher Korb ist am leersten?" : "Welcher Korb ist am vollsten?"}`,
];

const COMPARE_TEMPLATES_SET: VignetteFn<CompareArgs>[] = [
  ({ left, right }) =>
    `Nest A hat ${left} bunte Federn, Nest B hat ${right}. Welches Nest hat mehr?`,
  ({ left, right }) =>
    `Wolkeninsel A trägt ${left} Vögel, Wolkeninsel B ${right}. Welche Insel ist voller?`,
];

export function vignetteCompare(args: CompareArgs & { values?: number[] }): string {
  const v = args.variant ?? "pair";
  if (v === "multi-pick") return pickOne(COMPARE_TEMPLATES_MULTI)(args);
  if (v === "set") return pickOne(COMPARE_TEMPLATES_SET)(args);
  return pickOne(COMPARE_TEMPLATES_PAIR)(args);
}

// ---------- tensNeighbors ----------

type NeighborArgs = {
  value: number;
  neighbor: "before" | "after";
  /** "tens" = Standard-Zehnernachbar, "step-5" = 5 vor/nach,
   *  "closer-tens" = welcher Zehner ist näher */
  variant?: "tens" | "step-5" | "closer-tens";
};

const NEIGHBOR_TEMPLATES_TENS: VignetteFn<NeighborArgs>[] = [
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Pip steht auf Bohle ${value}. Welcher Zehner kommt direkt danach?`
      : `Pip steht auf Bohle ${value}. Welcher Zehner liegt direkt davor?`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Die Brücke hat nummerierte Bretter. Du bist bei ${value}. Wo ist der nächste Zehner-Pfosten?`
      : `Du stehst bei Bohle ${value} auf der Brücke. Wo war der letzte Zehner-Pfosten?`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Anneli zählt von ${value} weiter — welcher volle Zehner kommt als nächstes?`
      : `Anneli geht von ${value} rückwärts — welcher volle Zehner liegt direkt davor?`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Der Wind weht Anneli zur nächsten Zehner-Wolke. Sie ist bei ${value}. Welche Wolke kommt?`
      : `Der Wind trägt Anneli rückwärts. Sie startet bei ${value}. Welche Zehner-Wolke liegt direkt davor?`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Die alte Eule fragt: "Welcher Zehner kommt nach ${value}?"`
      : `Die alte Eule fragt: "Welcher Zehner kommt vor ${value}?"`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Pip hüpft auf Bohle ${value}. Drei Schritte vor — fast ein voller Zehner. Welcher?`
      : `Pip hüpft auf Bohle ${value}. Drei Schritte zurück — fast ein voller Zehner. Welcher?`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Auf der Felsen-Treppe ist Stufe ${value}. Welche Zehner-Stufe kommt als nächstes?`
      : `Auf der Felsen-Treppe ist Stufe ${value}. Welche Zehner-Stufe liegt direkt unter dir?`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Der Kolibri zählt von ${value} bis zum nächsten Zehner. Wo landet er?`
      : `Der Kolibri zählt von ${value} rückwärts bis zum vorherigen Zehner. Wo landet er?`,
];

const NEIGHBOR_TEMPLATES_STEP5: VignetteFn<NeighborArgs>[] = [
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Pip springt 5 Bohlen nach vorne. Er startet bei ${value}. Wo landet er?`
      : `Pip springt 5 Bohlen zurück. Er startet bei ${value}. Wo landet er?`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Der Wind trägt Anneli 5 Schritte nach vorne. Sie war bei ${value}. Wo ist sie jetzt?`
      : `Der Wind trägt Anneli 5 Schritte zurück. Sie war bei ${value}. Wo ist sie jetzt?`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Welche Zahl liegt 5 NACH ${value}?`
      : `Welche Zahl liegt 5 VOR ${value}?`,
];

const NEIGHBOR_TEMPLATES_CLOSER: VignetteFn<NeighborArgs>[] = [
  ({ value }) =>
    `Pip steht auf Bohle ${value}. Welcher Zehner ist NÄHER — der davor oder der danach? Tipp den näheren.`,
  ({ value }) =>
    `Anneli muss zur nächsten Wolken-Insel. Sie ist bei ${value}. Welcher Zehner ist kürzer entfernt?`,
];

export function vignetteNeighbor(args: NeighborArgs): string {
  const v = args.variant ?? "tens";
  if (v === "step-5") return pickOne(NEIGHBOR_TEMPLATES_STEP5)(args);
  if (v === "closer-tens") return pickOne(NEIGHBOR_TEMPLATES_CLOSER)(args);
  return pickOne(NEIGHBOR_TEMPLATES_TENS)(args);
}

// ---------- doubleHalf ----------

type DoubleHalfArgs = {
  value: number;
  mode: "double" | "half";
  /** "plain" = einfach verdoppeln/halbieren, "quarter" = halb-halb,
   *  "quadruple" = doppelt-doppelt, "mix" = Anneli verdoppelt, Pip halbiert */
  variant?: "plain" | "quarter" | "quadruple" | "mix";
};

const DOUBLE_TEMPLATES: VignetteFn<DoubleHalfArgs>[] = [
  ({ value }) =>
    `Auf einer Seite der Spiegelbrücke liegen ${value} Federn. Auf der anderen Seite muss das Doppelte liegen. Wie viele?`,
  ({ value }) =>
    `Pip hat ${value} Beeren. Vogelmama legt genauso viele dazu. Wie viele Beeren sind es zusammen?`,
  ({ value }) =>
    `${value} Glühwürmchen leuchten — plötzlich kommen genauso viele dazu. Wie viele sind es jetzt?`,
  ({ value }) =>
    `Anneli sieht ${value} Sternchen im Spiegel. Im echten Himmel doppelt so viele. Wie viele Sternchen am Himmel?`,
  ({ value }) =>
    `Die Eule hat ${value} Würmer im Korb. Der Falke hat doppelt so viele. Wie viele hat der Falke?`,
  ({ value }) =>
    `Pip's Geschwister bauen mit ${value} Zweigchen. Vogelmama doppelt so viele. Wie viele Zweigchen hat Vogelmama?`,
  ({ value }) =>
    `Auf der Wolkenwiese liegen ${value} Wolken-Wolle-Büschel. Im Spiegel sieht man doppelt so viele. Wie viele?`,
  ({ value }) =>
    `Der Kolibri trinkt ${value} Tropfen. Der junge Falke doppelt so viele. Wie viele Tropfen trinkt der Falke?`,
];

const HALF_TEMPLATES: VignetteFn<DoubleHalfArgs>[] = [
  ({ value }) =>
    `Auf einer Seite der Spiegelbrücke liegen ${value} Federn. Auf der anderen muss die Hälfte liegen. Wie viele?`,
  ({ value }) =>
    `${value} Beeren sollen fair zwischen Pip und Vogelmama geteilt werden. Wie viele bekommt jeder?`,
  ({ value }) =>
    `Die Eule hat ${value} Sternchen. Sie schenkt die Hälfte dem Mond. Wie viele bekommt der Mond?`,
  ({ value }) =>
    `Im Nest liegen ${value} Eier. Vogelmama bewacht die Hälfte, Pip den Rest. Wie viele bewacht Pip?`,
  ({ value }) =>
    `Auf dem Felsen sitzen ${value} Glühwürmchen. Die Hälfte fliegt zur Wolke. Wie viele fliegen?`,
  ({ value }) =>
    `Pip hat ${value} Würmer und teilt sie gerecht mit seinem Geschwister. Wie viele bekommt jeder?`,
  ({ value }) =>
    `Anneli sammelt ${value} Federn und gibt die Hälfte an Vogelmama. Wie viele Federn behält Anneli?`,
  ({ value }) =>
    `Auf der Lichtung wachsen ${value} Wolken-Wolle-Büschel. Der Wind verteilt die Hälfte. Wie viele bleiben stehen?`,
];

const QUARTER_TEMPLATES: VignetteFn<DoubleHalfArgs>[] = [
  ({ value }) =>
    `Vogelmama hat ${value} Federn. Sie halbiert den Haufen — und nochmal die Hälfte. Wie viele bleiben am Ende?`,
  ({ value }) =>
    `${value} Beeren werden geteilt: zuerst halbiert, dann nochmal halbiert. Wie viele bleiben am Ende?`,
  ({ value }) =>
    `Pip nimmt die Hälfte von der Hälfte von ${value} Sternchen. Wie viele Sternchen hat er?`,
];

const QUADRUPLE_TEMPLATES: VignetteFn<DoubleHalfArgs>[] = [
  ({ value }) =>
    `Pip hat ${value} Zweigchen. Er verdoppelt — dann nochmal verdoppelt. Wie viele Zweigchen?`,
  ({ value }) =>
    `Die Eule hat ${value} Sternchen. Sie verdoppelt ihre Sammlung — und nochmal. Wie viele leuchten jetzt?`,
  ({ value }) =>
    `Anneli sieht ${value} Federn im ersten Spiegel — doppelt. Im zweiten Spiegel nochmal doppelt. Wie viele am Ende?`,
];

const MIX_TEMPLATES: VignetteFn<DoubleHalfArgs>[] = [
  ({ value }) =>
    `Anneli verdoppelt ${value} Federn. Dann halbiert Pip das Ergebnis. Was bleibt?`,
  ({ value }) =>
    `Vogelmama verdoppelt ${value} Beeren — Pip teilt das Ergebnis brav durch zwei. Was bleibt?`,
  ({ value }) =>
    `Erst doppelt, dann halbiert: was passiert mit ${value}? Tipp die Endzahl.`,
];

export function vignetteDoubleHalf(args: DoubleHalfArgs): string {
  const v = args.variant ?? "plain";
  if (v === "quarter") return pickOne(QUARTER_TEMPLATES)(args);
  if (v === "quadruple") return pickOne(QUADRUPLE_TEMPLATES)(args);
  if (v === "mix") return pickOne(MIX_TEMPLATES)(args);
  if (args.mode === "double") return pickOne(DOUBLE_TEMPLATES)(args);
  return pickOne(HALF_TEMPLATES)(args);
}
