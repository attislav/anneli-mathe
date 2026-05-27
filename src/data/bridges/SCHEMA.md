# Bridge-Schema (Kapitel 1: Sky Kingdom)

Jede Brücke lebt als eigene JSON-Datei in diesem Ordner. Beim Build werden alle JSONs von `index.ts` statisch importiert, validiert und als `BRIDGES`-Array exportiert.

Der Schritt zu Daten-Files (statt hardcoded TS-Const) ist die architektonische Vorbereitung für **Content-Authoring ohne Code** — das ist ein expliziter Vision-Punkt der Roadmap („Multi-Fach-Plattform mit Inhalts-Autoren-Werkzeugen"). Pro Kapitel kommt später ein weiterer Loader (z.B. `src/data/desert/*.json` für Kapitel 2).

---

## Feld-Übersicht

| Feld | Pflicht | Typ | Beschreibung |
|---|---|---|---|
| `id` | ja | string | URL-Slug & Datei-Name (z.B. `"steinzaehl"`). Eindeutig. |
| `order` | ja | int | Reihenfolge auf der Sky-Map (1–6). |
| `name` | ja | string | Anzeige-Name („Steinzählbrücke"). |
| `skill` | ja | `Skill` | siehe `Skill`-Union in `index.ts`. |
| `skillLabel` | ja | string | menschenlesbar („Mengen erfassen bis 20"). |
| `description` | ja | string | 1-2 Sätze für SkyMap & Brücken-Header. |
| `inputMode` | ja | `InputMode` | welcher Eingabe-Mechanismus (siehe unten). |
| `totalTasks` | ja | int | Anzahl Aufgaben für die Reparatur (7–10, seit M4 2026-05-27 — vorher 4–6). |
| `story_intro` | ja | string | 1-Satz-Beat VOR der ersten Aufgabe (Roadmap: „atmosphärischer Druck"). |
| `hint_chain` | ja | string[] | 1–3 gestaffelte Tipps. `[0]` ist der primäre Hint (von `book`-Stimme vertont — Audio-ID `bridge-<id>-hint`). |
| `completion_beat` | ja | string | Story-Beat NACH der letzten Aufgabe (in CompleteCard sichtbar). |

Felder mit Präfix `_` (z.B. `_inputMode_note`) sind **erlaubte Inline-Kommentare** — der Loader ignoriert sie.

---

## `Skill` — erlaubte Werte (Kapitel 1)

```ts
"counting20" | "addition20" | "subtraction20" | "compare100" | "tensNeighbors" | "doubleHalf"
```

Jede `Skill` braucht einen passenden Aufgaben-Generator in `src/data/exercises/<skill>.ts` und Vignetten-Templates in `src/data/exercises/vignettes.ts`. Beides liefert pro `Level` (`easy` / `normal` / `hard`) eine zufällige Aufgabe — vom Loader entkoppelt.

## `InputMode` — erlaubte Werte

```ts
"tap-count" | "speech" | "keypad" | "compare-symbol" | "number-line" | "mirror"
```

`speech` braucht eine API-Route (Whisper) und ist auf der Static-Export-Production aktuell deaktiviert (Roadmap-Note). Brücken die eigentlich Speech wollen, fallen vorerst auf `keypad` zurück — siehe Inline-Kommentar in `holzplanken.json`.

---

## Beispiel (Minimum)

```json
{
  "id": "steinzaehl",
  "order": 1,
  "name": "Steinzählbrücke",
  "skill": "counting20",
  "skillLabel": "Mengen erfassen bis 20",
  "description": "Eine breite Brücke aus Steinen.",
  "inputMode": "tap-count",
  "totalTasks": 4,
  "story_intro": "Die Vogelmutter zählt ihre Eier — hilf ihr.",
  "hint_chain": [
    "Schau die Gruppen an — Fünfer, Zehner.",
    "Zähl mit dem Finger.",
    "Mach kleine Gruppen."
  ],
  "completion_beat": "Toll! Die Vogelmutter atmet auf — die Brücke hält."
}
```

---

## Wie eine neue Brücke anlegen

1. Neue Datei `src/data/bridges/<id>.json` mit allen Pflichtfeldern oben.
2. `src/data/bridges/index.ts` öffnen — JSON oben importieren, in das `BRIDGES`-Array einfügen. (Der Loader sortiert nach `order`, also reicht der Eintrag — Position im Array egal.)
3. Falls neue `skill`-Werte: passenden Generator in `src/data/exercises/` ergänzen.
4. Audios vertonen: `npm run gen:narration` (deckt automatisch alle `bridge-<id>-hint`-Audios ab, sobald die Brücke in `BRIDGES` ist).
5. Brücken-Bild generieren: `npm run gen:bridge-images` (erwartet `<id>` als Slug).

---

## Warum JSON statt YAML

- Bauen ohne extra Loader-Plugin (resolveJsonModule reicht).
- TypeScript versteht JSON sofort, ohne Cast-Tricks.
- Eindeutige Syntax — kein „Tabs vs. Spaces"-Drama für nicht-technische Autor:innen, wenn sie es später per CMS-Form befüllen.

Wenn YAML später nötig wird (lange mehrzeilige Texte): umstellen ist trivial, JSON-Schema bleibt identisch.
