// Mikro-Vignetten pro Skill — 1-2-Satz-Story-Schnipsel, in denen die
// nackte Mathe-Frage steckt. Jede Vignette ist eine Funktion, die die
// konkreten Zahlen der Aufgabe entgegennimmt und einen passenden Satz
// liefert (gegendert/grammatikalisch korrekt für die Anneli-Welt).
//
// Pädagogisches Ziel: Mathe nicht als nackten Term, sondern eingebettet
// in die Sky-Kingdom-Welt — Vögel, Eier, Federn, Wind, Wolken. Mehrere
// Templates pro Skill, randomisiert, damit es nicht repetitiv wirkt.
//
// Sky-Kingdom-Welt-Bestandteile: Vögel, Nest, Eier, Federn, Wolken-Inseln,
// Wind, Beeren, Zweige, Pip (der kleine Vogel-Begleiter), Vogelmama.

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

type CountingArgs = { total: number };

const COUNTING_TEMPLATES: VignetteFn<CountingArgs>[] = [
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
];

export function vignetteCounting(args: CountingArgs): string {
  return pickOne(COUNTING_TEMPLATES)(args);
}

// ---------- addition20 ----------

type AddArgs = { a: number; b: number; sum: number; form: "a+b" | "a+?" | "?+b" };

const ADD_TEMPLATES_FULL: VignetteFn<AddArgs>[] = [
  ({ a, b }) =>
    `Vogelmama zählt ${qty(a, "Ei", "Eier")} im Nest. Dann legt sie noch ${b} dazu. Wie viele sind es jetzt?`,
  ({ a, b }) =>
    `Pip findet ${qty(a, "Beere", "Beeren")} auf dem Zweig und ${qty(b, "Beere", "Beeren")} auf dem Boden. Wie viele zusammen?`,
  ({ a, b }) =>
    `Auf der ersten Wolke sitzen ${qty(a, "Vogel", "Vögel")}, auf der zweiten ${b}. Wie viele Vögel insgesamt?`,
  ({ a, b }) =>
    `Der Wind hat ${qty(a, "Feder", "Federn")} weggeweht. Später kommen ${b} neue zurück. Wie viele Federn liegen jetzt da?`,
];

const ADD_TEMPLATES_GAP_AB: VignetteFn<AddArgs>[] = [
  ({ a, sum }) =>
    `Vogelmama hat ${qty(a, "Ei", "Eier")}. Insgesamt sollen es ${sum} sein. Wie viele fehlen noch?`,
  ({ a, sum }) =>
    `Auf der Wolke sitzen schon ${qty(a, "Vogel", "Vögel")}. Plötzlich sind es ${sum}. Wie viele sind dazu geflogen?`,
];

const ADD_TEMPLATES_GAP_PB: VignetteFn<AddArgs>[] = [
  ({ b, sum }) =>
    `Pip kennt nicht die ganze Zahl. Er weiß nur: ein paar Beeren plus ${b} sind ${sum}. Wie viele waren am Anfang?`,
  ({ b, sum }) =>
    `Der Wind hat ein paar Federn weggetragen, dann kommen ${qty(b, "Feder", "Federn")} zurück — jetzt sind es ${sum}. Wie viele waren vorher schon da?`,
];

export function vignetteAddition(args: AddArgs): string {
  switch (args.form) {
    case "a+b":
      return pickOne(ADD_TEMPLATES_FULL)(args);
    case "a+?":
      return pickOne(ADD_TEMPLATES_GAP_AB)(args);
    case "?+b":
      return pickOne(ADD_TEMPLATES_GAP_PB)(args);
  }
}

// ---------- subtraction20 ----------

type SubArgs = { a: number; b: number; diff: number; form: "a-b" | "a-?" | "?-b" };

const SUB_TEMPLATES_FULL: VignetteFn<SubArgs>[] = [
  ({ a, b }) =>
    `${qty(a, "Feder", "Federn")} liegen auf der Brücke. Der Wind bläst ${b} weg. Wie viele bleiben übrig?`,
  ({ a, b }) =>
    `Im Nest sind ${qty(a, "Ei", "Eier")}. ${b} sind schon geschlüpft. Wie viele Eier liegen noch da?`,
  ({ a, b }) =>
    `Pip hat ${qty(a, "Beere", "Beeren")} gesammelt. Er teilt ${b} mit Vogelmama. Wie viele behält Pip?`,
  ({ a, b }) =>
    `${qty(a, "Vogel", "Vögel")} sitzen auf der Wolke. ${b} fliegen weg. Wie viele bleiben?`,
];

const SUB_TEMPLATES_GAP_AB: VignetteFn<SubArgs>[] = [
  ({ a, diff }) =>
    `Es waren ${qty(a, "Feder", "Federn")} da. Jetzt sind nur noch ${diff} übrig. Wie viele hat der Wind weggeblasen?`,
  ({ a, diff }) =>
    `Im Nest waren ${qty(a, "Ei", "Eier")}. Jetzt sind nur noch ${diff} da. Wie viele sind geschlüpft?`,
];

const SUB_TEMPLATES_GAP_PB: VignetteFn<SubArgs>[] = [
  ({ b, diff }) =>
    `Eine unbekannte Zahl von Federn. ${b} fliegen weg, ${diff} bleiben. Wie viele waren am Anfang da?`,
  ({ b, diff }) =>
    `${qty(b, "Vogel", "Vögel")} fliegen los, ${diff} bleiben auf der Wolke. Wie viele waren es zuerst?`,
];

export function vignetteSubtraction(args: SubArgs): string {
  switch (args.form) {
    case "a-b":
      return pickOne(SUB_TEMPLATES_FULL)(args);
    case "a-?":
      return pickOne(SUB_TEMPLATES_GAP_AB)(args);
    case "?-b":
      return pickOne(SUB_TEMPLATES_GAP_PB)(args);
  }
}

// ---------- compare100 ----------

type CompareArgs = { left: number; right: number; askLarger: boolean };

const COMPARE_TEMPLATES: VignetteFn<CompareArgs>[] = [
  ({ left, right, askLarger }) =>
    askLarger
      ? `Zwei Inseln. Auf der einen liegen ${left} Federn, auf der anderen ${right}. Welche Insel hat mehr?`
      : `Zwei Inseln. ${left} Federn hier, ${right} Federn da. Welche Insel hat weniger?`,
  ({ left, right, askLarger }) =>
    askLarger
      ? `Auf Wolke A sitzen ${left} Vögel, auf Wolke B ${right}. Welche Wolke ist voller?`
      : `Wolke A hat ${left} Vögel, Wolke B hat ${right}. Welche Wolke hat weniger Vögel?`,
  ({ left, right, askLarger }) =>
    askLarger
      ? `Die Waagebrücke schwankt. Links liegen ${left} Beeren, rechts ${right}. Welche Seite ist schwerer?`
      : `Auf der Waagebrücke liegen ${left} Beeren links und ${right} rechts. Welche Seite ist leichter?`,
];

export function vignetteCompare(args: CompareArgs): string {
  return pickOne(COMPARE_TEMPLATES)(args);
}

// ---------- tensNeighbors ----------

type NeighborArgs = { value: number; neighbor: "before" | "after" };

const NEIGHBOR_TEMPLATES: VignetteFn<NeighborArgs>[] = [
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Pip steht auf Bohle ${value}. Welcher Zehner kommt direkt danach?`
      : `Pip steht auf Bohle ${value}. Welcher Zehner liegt direkt davor?`,
  ({ value, neighbor }) =>
    neighbor === "after"
      ? `Die Brücke hat nummerierte Bretter. Du bist bei ${value}. Wo ist der nächste Zehner-Pfosten?`
      : `Du stehst bei Bohle ${value} auf der Brücke. Wo war der letzte Zehner-Pfosten?`,
];

export function vignetteNeighbor(args: NeighborArgs): string {
  return pickOne(NEIGHBOR_TEMPLATES)(args);
}

// ---------- doubleHalf ----------

type DoubleHalfArgs = { value: number; mode: "double" | "half" };

const DOUBLE_TEMPLATES: VignetteFn<DoubleHalfArgs>[] = [
  ({ value }) =>
    `Auf einer Seite der Spiegelbrücke liegen ${value} Federn. Auf der anderen Seite muss das Doppelte liegen. Wie viele?`,
  ({ value }) =>
    `Pip hat ${value} Beeren. Vogelmama legt genauso viele dazu. Wie viele Beeren sind es zusammen?`,
];

const HALF_TEMPLATES: VignetteFn<DoubleHalfArgs>[] = [
  ({ value }) =>
    `Auf einer Seite der Spiegelbrücke liegen ${value} Federn. Auf der anderen muss die Hälfte liegen. Wie viele?`,
  ({ value }) =>
    `${value} Beeren sollen fair zwischen Pip und Vogelmama geteilt werden. Wie viele bekommt jeder?`,
];

export function vignetteDoubleHalf(args: DoubleHalfArgs): string {
  if (args.mode === "double") return pickOne(DOUBLE_TEMPLATES)(args);
  return pickOne(HALF_TEMPLATES)(args);
}
