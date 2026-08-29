# Roadmap — Anneli & das verzauberte Buch

> Diese Datei ist die **Quelle der Wahrheit** für Vision, Ziele und Backlog. Wenn etwas hier nicht steht, ist es noch nicht entschieden.

## Vision

Eine Lernplattform für Grundschul- und frühe Sek.-I-Kinder, die **Lust auf Lernen macht** — durch Geschichten, Rätsel, visuelle Muster und Spiele-Mechaniken statt durch Aufgabengeneratoren. Mathe, Deutsch, Sachkunde, fächerübergreifend.

Sie soll an zwei Stellen klar besser sein als Anton / Schlaukopf / Zahlenzorro: **echte Adaptivität** und **eine UX, die Kinder UND Eltern ernst nimmt**.

## Erfolgsmetriken

| Horizont | Metrik |
|---|---|
| Sofort | Anneli öffnet die App freiwillig 3× pro Woche. |
| 6 Monate | Andere Eltern fragen nach der App. |
| Langfristig | Multi-Fach-Plattform mit Inhalts-Autoren-Werkzeugen — neue Module ohne Code-Aufwand möglich. |

## Design-Persona

**Anneli** — 7 Jahre, im Übergang Klasse 1 → Klasse 2. Kann den Mathestoff sicher, mag aber Üben nicht. Liebt Geschichten und Kreativität. Die App muss sie *anfixen*, nicht trainieren. Sie ist die Design-North-Star — wenn die App bei ihr zündet, zündet sie bei ähnlichen Kindern.

Details: siehe Memory `design_persona_anneli`, `character_anneli`.

## Was die App ausdrücklich NICHT ist

- Kein Aufgabengenerator mit Belohnungsschicht
- Kein digitaler Übungsblock
- Kein Nachhilfe-Tool für Kinder, die Grundlagen lernen *müssen*

---

## Story-Backlog: 6 Kapitel über die Klasse-2-Mathe-Skills

Anneli findet ein magisches Buch, das sie in die **Bibliothek der Welten** zieht. Pro Kapitel betritt sie eine neue Welt, hilft den Bewohnern mit Mathe-eingebetteten Rätseln, und bringt eine **Buchseite** als Souvenir + ein **magisches Geschenk** zurück. Die Bibliothek wächst.

Reihenfolge orientiert am Klasse-2-Lehrplan, pädagogisch aufeinander aufbauend.

### Kapitel 1 — Das wackelige Himmelreich · *in Entwicklung*

| | |
|---|---|
| Welt | Sky Kingdom: schwebende Pastell-Inseln, Vögel-Volk |
| Mechanik | 6 wackelige Brücken auf freier Karte, Anneli wählt Reihenfolge |
| Skills | K1→K2-Übergang: Mengen bis 20, Plus/Minus bis 20 mit Zehnerübergang, Vergleichen bis 100, Zehnernachbarn, Verdoppeln/Halbieren |
| Ende | Vogel-Volk schenkt eine **Feder**, neue Seite im Buch |

Skill-Mapping pro Brücke: siehe Memory `story_concept_chapter1`.

### Kapitel 2 — Der Drache und sein verlorener Schatz

| | |
|---|---|
| Welt | Pfirsich-Wüste mit Kristallpflanzen, kleiner Drache |
| Mechanik | Schatzkarte mit Stationen, Karawanenmarkt, Wegstrecken |
| Skills | Plus/Minus bis 100, **Geld (€/Cent)**, Sachaufgaben mit Beträgen |
| Ende | Drachen-Schuppe als Talisman, Buchseite |

### Kapitel 3 — Der Korallengarten

| | |
|---|---|
| Welt | Unterwasser-Garten in Lavendel/Türkis, Lichtmuscheln |
| Mechanik | Lichtmuster wiederherstellen, Muscheln in richtiger Reihenfolge, gespiegelte Korallen |
| Skills | **Muster, Reihen, Symmetrie**, einfache Geometrie |
| Ende | Leuchtmuschel, Buchseite |

### Kapitel 4 — Die Erfinder-Werkstatt

| | |
|---|---|
| Welt | Steam-Fantasy-Werkstatt mit Zahnrädern, mechanischen Tieren |
| Mechanik | Maschinen reparieren — sie brauchen Zahnräder in Mengen-Vielfachen |
| Skills | **Kleines Einmaleins** (Multiplikation als wiederholte Addition) |
| Ende | Mechanisches Mini-Tier als Begleiter, Buchseite |

### Kapitel 5 — Das Pastell-Walddörfchen

| | |
|---|---|
| Welt | Cozy Wald-Dorf mit Tieren, Festtag wird vorbereitet |
| Mechanik | Geschenke fair aufteilen, Hütten ausmessen, Festtafel decken |
| Skills | **Division (Aufteilen)**, **Längen (m/cm)** messen |
| Ende | Festschleife, Buchseite |

### Kapitel 6 — Der Uhrenturm

| | |
|---|---|
| Welt | Verzauberter Uhrenturm mit kaputten Zahnrädern, falsch laufende Uhren |
| Mechanik | Uhrzeiten lesen, Zeitspannen berechnen, Uhren synchronisieren |
| Skills | **Uhrzeit** (Stunden, Minuten), Zeitspannen |
| Ende | Goldene Taschenuhr, Buchseite — Buch ist nach Kapitel 6 vollständig |

Pro Kapitel: ~20–40 Aufgaben, randomisiert, beliebig wiederholbar. Insgesamt mehrere Stunden frischer Inhalt plus quasi-unbegrenztes Re-Play durch Aufgaben-Variation.

---

## Zweiter Weg: Kopfrechnen-Training (2026-08-29)

Die Startseite ist seitdem eine **Weggabelung**: Geschichte oder Kopfrechnen. Beide Wege sind vollständig unabhängig — eigener Spielstand (`anneli.training.v1` neben `anneli.progress.v1`), eigene Aufgaben-Generatoren, eigene Route (`/training`). Wer nur rechnen will, muss nicht durch die Geschichte; wer nur die Geschichte will, sieht nie eine Übungsrunde.

**Warum überhaupt ein Drill-Zweig, wo die App ausdrücklich kein Aufgabengenerator sein will?** Weil Kopfrechnen Automatisierung braucht und Automatisierung Wiederholung. Der Unterschied zu Anton/Zahlenzorro liegt nicht darin, dass wir *nicht* üben lassen — sondern **wie**: Jedes Modul lehrt zuerst eine **Strategie** („erst zur 10, dann der Rest"), und die Aufgaben-Hinweise wenden genau diese Strategie auf die konkreten Zahlen an. Geübt wird ein Denkweg, nicht das Abarbeiten von Zeilen.

### Modul-Leiter (Zahlenraum wächst, Klasse 2 → 3)

| # | Modul | Zahlenraum | Trick(s) |
|---|---|---|---|
| 1 | Zahlenfreunde bis 10 | bis 10 | die fünf Zehner-Paare |
| 2 | Plus und Minus bis 20 | bis 20, ohne Übergang | „die Zehn bleibt stehen" |
| 3 | Über die Zehn springen | bis 20, mit Übergang | Zwischenstopp auf der 10 (vor- und rückwärts) |
| 4 | Verdoppeln und Halbieren | bis 100 | Nachbaraufgaben, stellenweise halbieren |
| 5 | Volle Zehner bis 100 | volle Zehner | „rechne klein, häng die Null an" |
| 6 | Plus und Minus bis 100 | bis 100 | erst Zehner, dann Einer · am Zehner Pause |
| 7 | Der Fast-Zehner-Trick | bis 100 | +9 = +10−1, −9 = −10+1 |
| 8 | Kernaufgaben im Einmaleins | 2er, 5er, 10er | 5er = halbe 10er · malnehmen ist springen |
| 9 | Das ganze Einmaleins | bis 10 · 10 | Tauschaufgabe · Nachbaraufgabe · 9er-Trick |
| 10 | Teilen und Umkehraufgaben | 1×1 rückwärts | „such die Malaufgabe" |

Module sind **nicht gesperrt** — wer bis 20 sicher rechnet, springt weiter. Sperren wäre genau die Bevormundung, die diese App nicht sein will.

### Regeln der Übungsrunde

- **Trick zuerst.** Beim Öffnen eines Moduls steht die Erklärung, die Runde startet man selbst. Während der Runde ist der Trick jederzeit wieder aufklappbar.
- **Kein Timer, keine Stoppuhr, kein Game-Over.** Auch hier gilt „atmosphärischer Druck, nie Stress".
- **Kein rotes „Falsch"**. Bei einer falschen Antwort kommt der Trick-Tipp mit genau diesen Zahlen. Nach 12 Sek Ruhe kommt er von selbst.
- **Nach 3 Fehlversuchen** zeigt die App den Rechenweg und geht weiter — Festhängen gibt es nicht.
- **Adaptiv innerhalb der Runde**: 3 richtig in Folge → eine Stufe schwerer, 2 falsch in Folge → eine Stufe leichter. Level wird pro Modul persistiert.
- **Gezählt wird „dran sein"**: Die Punkte auf der Modul-Karte zählen Runden, nicht Fehlerfreiheit. Ein Abbruch schreibt die gerechneten Aufgaben trotzdem gut.
- **Eigene Zahlentastatur** statt `<input type="number">` — die System-Tastatur schiebt auf dem Tablet die halbe Seite weg. Physische Tastatur (Ziffern, Backspace, Enter) funktioniert trotzdem.

### Dateien

- `src/data/training/modules.ts` — Module + Tricks (Quelle der Wahrheit)
- `src/data/training/generators/*.ts` — ein Generator je Modulgruppe, Level-fähig
- `src/data/trainingProgress.ts` — Persistenz, getrennt vom Story-Fortschritt
- `src/components/TrainingHome|TrainingModuleView|TrainingSession|NumberPad|TrickCard.tsx`
- `src/app/training/` — Route mit statischer Generierung pro Modul
- `scripts/smoke-training.ts` (`npm run smoke:training`) — 15.000 generierte Aufgaben gegen Zahlenraum-, Text- und Lösungs-Invarianten

### Vertonung des Trainings (2026-08-29)

Alles im Training ist vorlesbar: die Aufgabe, der Tipp, der Rechenweg, die Trick-Erklärungen und die Modulbeschreibungen. Vertont wird mit **Gemini TTS**, und zwar **vollständig im Voraus** — die App ruft zur Laufzeit keine API.

**Warum im Voraus?** Die App ist ein statischer Export (`output: "export"`), es gibt keinen Server, der einen API-Key halten könnte. Ein Key in den Vercel-Variablen wäre zur Laufzeit für niemanden lesbar.

**Wie das trotz gewürfelter Aufgaben geht.** Alle dynamischen Texte sind Schablonen mit eingesetzten Zahlen. Trennt man an den Zahlen, bleibt eine endliche Menge Textbausteine übrig:

```
"Von 8 bis 10 fehlen 2."  →  ["Von", 8, "bis", 10, "fehlen", 2]
```

Gemessen über 120.000 generierte Aufgaben sind das **155 Bausteine**. Zusammen mit den Zahlen 0–100 und den 101 festen Sätzen ergibt das **358 Audio-Dateien** statt der ~30.000, die vollständig ausgeschriebene Sätze bräuchten. Zur Laufzeit werden die Clips hintereinander abgespielt; Satzzeichen zwischen zwei Zahlen werden zu echten Sprechpausen, damit „5, 10, 15" nicht zusammenklebt.

| | |
|---|---|
| `num/0–100.mp3` | die Zahlen, einzeln |
| `frag/<key>.mp3` | die Textbausteine dazwischen |
| `text/<id>.mp3` | feste Sätze am Stück — beste Betonung, weil ungeschnitten |

**Ablauf:**

```bash
npm run collect:speech        # Manifest aus den Generatoren einsammeln
npm run gen:training-audio    # Gemini TTS → public/audio/training/**
git add public/audio/training && git commit && git push
```

`GEMINI_API_KEY` gehört dafür in `.env.local` (gitignored) — **nicht** zu Vercel. Modell und Stimme sind über `GEMINI_TTS_MODEL` / `GEMINI_TTS_VOICE` austauschbar (Default: `gemini-2.5-flash-preview-tts`, Stimme `Leda`). Das Skript schneidet Stille an den Rändern weg und gleicht die Lautstärke an — ohne das zerfiele der zusammengesetzte Satz in Einzelwörter. Kodiert wird als MP3 rein in JS (`@breezystack/lamejs`), also ohne ffmpeg.

**Fallback:** Fehlt eine Datei, liest die Sprachausgabe des Geräts den ganzen Satz vor. Die App ist damit nie stumm — auch nicht zwischen Code-Stand und Audio-Stand.

**Bedienung:** Lautsprecher-Knopf an Aufgabe, Tipp, Rechenweg, jedem Trick-Schritt und der Modulbeschreibung; „Vorlesen" auf der Trick-Karte liest die ganze Erklärung am Stück; ein Schalter in der Übungsrunde liest jede neue Aufgabe automatisch vor (Default aus, Einstellung wird gemerkt).

### Offen (Training)

- [ ] **Audio erzeugen und committen** (`npm run gen:training-audio`) — bis dahin läuft die Gerätestimme
- [ ] Trick-Beispiele (`trick.example`) vertonen — bei Modul 1 ist das „·" dort ein Listentrenner, kein Malzeichen, das braucht eine Sonderbehandlung
- [ ] Eigenes KI-Bild für die Trainings-Kachel auf der Startseite (aktuell typografische Rechen-Kachel)
- [ ] Trainings-Daten in den Eltern-View / Skill-Heatmap (Wo 4) einspeisen
- [ ] Später: Sachaufgaben-Modul und Geld-Modul, sobald Kapitel 2 die Generatoren dafür hat

---

## UX-Konzept & Lernpsychologie (Erweiterung 2026-05-21)

Diese Sektion definiert *wie* Anneli mit der App interagiert — die operative Antwort auf die Vision-Forderung „Lust auf Lernen, kein Aufgabengenerator mit Belohnungsschicht".

### Eingabe-Modi: jede Brücke anders

Nicht 6× dieselbe Number-Input. Pro Brücke ein anderer Mechanismus — Abwechslung und Skill-spezifisch:

| Brücke | Skill | Eingabe-Modus |
|---|---|---|
| 1 | `counting20` | **Tap-zähle-mit** — Anneli tippt Objekte einzeln an, Counter zählt mit hoch, finale Auswahl als 4 Number-Buttons |
| 2 | `addition20` | **Sprechen via Whisper** — Mikro-Button, „Sag wie viel". Whisper erkennt Zahlen 1-20 zuverlässig |
| 3 | `subtraction20` | **On-Screen-Zahlentastatur** — klassisches Tippen, „ich-kann-Zahlen-schreiben"-Stolz |
| 4 | `compare100` | **Drag-Symbol auf <, =, >** — visuell direkt, kein Begriff-Vokabular nötig |
| 5 | `tensNeighbors` | **Zahlenstrahl-Tap** — Anneli tippt auf der richtigen Stelle des Zahlenstrahls |
| 6 | `doubleHalf` | **Spiegel-Mechanik** — visuell verdoppeln / halbieren durch Tap/Drag |

### Story + Mathe: atmosphärischer Druck, nie Stress

- Vor jeder Aufgabe: **1-Satz Story-Beat** („Die Brücke wackelt! Hilf den Vögeln!")
- Während: Brücke wackelt **visuell** leise. KEIN Timer, KEIN Game-Over.
- Bei richtig: Buch erzählt weiter, Brücke wird fest, Vögel-Sound + Animation.
- Bei falsch: **kein „falsch!"-Feedback**. Buch sagt „Probier nochmal — der Vogel hilft dir." Nach 3 Sek Tipp einblenden.
- Nach 3× falsch in einer Aufgabe: leichtere Variante derselben Aufgabe.
- Nach allen 6 Brücken: Abschluss-Animation, Feder, neue Buchseite, Bibliothek wächst sichtbar.

### Mathe in Mikro-Vignetten verpackt

Statt nackter `3 + 5 = ?` → eine Mini-Welt-Vignette:
- „Vogelmama zählt 3 Eier im Nest. Dann legt sie noch 5 dazu. Wie viele jetzt?"
- „Der Wind hat 7 Federn weggeblasen. 2 sind wiedergekommen. Wie viele fehlen noch?"

Format: 1-2 Sätze, immer eingebettet in die aktuelle Brücken-Welt. Der Generator liefert nicht nur Zahlen, sondern auch passende Story-Schnipsel. Mehrere Vignetten-Templates pro Skill, randomisiert.

### Belohnung für „dran sein", nicht für „richtig sein"

- Brücke öffnet sich **immer**, egal wie viele Versuche.
- Geschwindigkeit/Schönheit der Animation kann sich unterscheiden, aber Anneli wird **nie bestraft**.
- Kein „Falsch! Sterne verloren!" — das ist Anton/Schlaukopf. Wir nicht.

### Vogel-Begleiter mit Namen

- Beim ersten Öffnen von Kapitel 1: „Wie soll dein Vogel heißen?" → Anneli tippt/spricht → der Name persistiert (localStorage + ggf. später Supabase).
- Buch-Charakter spricht den Vogel ab jetzt mit Namen an („Pip wartet schon auf dich!").
- Mikro-Personalisierung, große Bindung.

### Adaptive Schwierigkeit innerhalb einer Brücke

- 3 Aufgaben in Folge richtig → nächste Aufgabe **1 Stufe schwerer** (im selben Skill, z.B. größere Zahlen / mehr Zehnerübergang bei `addition20`).
- 2 Aufgaben in Folge falsch → **1 Stufe leichter**.
- Anton/Schlaukopf machen das nicht so feingranular — echter USP.

### Sound-Design pro Brücke (Foundation startet 2026-05-21, ausgebaut bis Wo 4)

**Voice-Rollen** (verschiedene Stimmen — sonst klingt die Welt nicht lebendig):

| Rolle | Charakter | Verwendung |
|---|---|---|
| `narrator` | warme, weibliche Lese-Stimme | Erzähler-Sätze („Anneli öffnete das Buch…"), Hauptstimme |
| `book` | etwas älter, weise-freundlich, leicht magisch | wenn das verzauberte Buch direkt mit Anneli spricht |
| `bird_mother` | warm, mütterlich, etwas älter | Vogelmutter (Brücke 1) |
| `bird_pip` | heller, jünger, verspielt | Vogel-Begleiter Pip (Name kann variieren) |
| `dragon` | tief, freundlich-bärenmäßig (Wo 5-6) | Drache in Kapitel 2 |

Im Code: jeder Story-Beat trägt ein `speaker`-Field. Audio-Files sortiert nach Speaker (`public/audio/narrator/*`, `public/audio/book/*`, etc.). Voice-IDs in zentraler Map `src/data/voices.ts`, damit Stimmen-Wechsel ohne Code-Änderung möglich ist.

**Foundation 2026-05-21/22 (erledigt):**
- ✓ 3 Voice-Rollen definiert (`narrator`, `book`, `bird_pip`) in `src/data/voices.ts`
- ✓ `narration.ts` mit `speaker`-Field, Audio-Pfade nach Speaker sortiert (`public/audio/<speaker>/<id>.mp3`)
- ✓ **17 Voice-Audios** generiert: 9 × Book (Story-Beats + alle 6 Brücken-Hints), 1 × Narrator (Opening), 7 × Pip (Intro + 4 Retry-Quips + 2 Success-Quips)
- ✓ **Note**: ElevenLabs Free-Tier blockt unsere VPS-IP-Range (`detected_unusual_activity` 401). Fallback auf **OpenAI gpt-4o-mini-tts** mit `sage` (narrator), `ballad` (book), `coral` (bird_pip) — Generator: `npm run gen:narration` (Default). ElevenLabs-Generator bleibt als `gen:narration:el` für lokalen Run / Creator-Tier-Upgrade.
- ✓ **4 Sound-FX** via ElevenLabs Sound-Generation (Sound-Gen funktioniert vom VPS): `bird-chirp`, `wind-soft`, `bridge-creak`, `magic-chime` → `public/audio/fx/`
- ✓ `useSoundFx` Hook + Integration in `BridgeChallenge` (creak beim Betreten, chime bei jeder richtigen Aufgabe, chirp bei Brücke-fertig)
- ✓ `AmbientPlayer` Komponente mit Mute-Persist (`localStorage`), bereit für Ambient-Drop in `public/audio/ambient/sky-kingdom.mp3` (Slot 4 / Wo 4)

**Voll-Ausbau Wo 4:**
- **Erzähler-Stimme** als Default, alle existierenden 15 fable-Audios neu vertonen
- **Sound-FX-Library** ausgebaut (Erfolgs-Glocke, Falsch-Hint-Sound „sanft", Brücken-Reparatur-Sound, Feder-Geschenk-Sound)
- **Ambient-Musik** pro Welt via Pixabay/Mixkit (royalty-free). Sky-Kingdom = soft pastel pad music. KEIN ElevenLabs für Musik (Free hat das nicht; Creator-Tier in Wo 4 dazu).
- KEIN „Falsch"-Buzzer-Sound, nirgends. Nur sanfte Hint-Sounds.

**ElevenLabs Free-Tier (Stand 2026-05-21):** 10k chars/Monat, ~9.5k frei. Sound-Generation-API ist auf Free verfügbar (probiert). Voice-Clones (3 frei) NICHT nutzen für Anneli (würde 1 Slot pro Charakter brennen — lieber die kuratierten Default-Stimmen). Upgrade auf Creator-Tier in Wo 4 wenn Erzähler-Vertonung Vollausbau startet.

### Pause-Mechanik (10 Min)

Nach 10 Min App-Zeit: Buch sagt „Wir haben heute viel geschafft. Morgen weiter?"
Kein hartes Lockout — Anneli kann weiterspielen. Aber die App **schlägt von sich aus eine Pause vor** — gesund, und Eltern lieben es.

### Wöchentlicher Eltern-Report per Telegram

Sonntags 19:00 (Cron, analog `maraskitchen-report.py`):
- 1 Bild: Anneli's Skill-Heatmap (grün = sicher, gelb = wackelt, rot = neu/hakt)
- 3 Sätze: was diese Woche lief, wo's hakt, was als nächstes kommt
- Empfänger: attiar via Telegram (`chat_id` 1256503034)
- Datenbasis: Supabase-Tabelle `cc_anneli_progress` (oder `an_progress` mit eigenem Prefix)

### Story-Engine als Daten (Architektur-Entscheidung)

Brücken NICHT hardcoden in TS, sondern als JSON/YAML pro Brücke:

```json
{
  "id": "steinzaehl",
  "skill": "counting20",
  "input_mode": "tap-count",
  "story_intro": "Die Vogelmutter weiß nicht mehr wie viele Eier in ihrem Nest sind…",
  "task_count": 5,
  "hint_chain": ["Schau genau hin.", "Zähl mit dem Finger.", "Pip hilft dir."],
  "completion_beat": "Toll! Die Vogelmutter atmet auf — jetzt weiß sie's wieder."
}
```

Vorteil: später Content-Editor (Vision-Punkt „Multi-Fach-Plattform mit Inhalts-Autoren-Werkzeugen") ohne Code möglich.

### Wow-Backlog (wenn Zeit / nach Wo 8)

- **Magisches Buch-Cover via Device-Motion-API**: Tablet neigen → Buchseiten blättern animiert um. Echtes Physik-Gefühl, Eltern-Wow.
- **Vogel-Begleiter im Stand-by**: zwischen Sessions sitzt der Vogel auf dem Splash und schaut Anneli an. Sie kann ihn füttern. Daily-Engagement ohne Mathe-Druck.
- **Co-Op**: zwei Kinder am selben Tablet, eine Brücke zusammen lösen.

---

## Sprint-Plan (8 Wochen, Start 2026-05-21)

Anneli spielt variable Sitzungen, wann sie Lust hat. Sammelmechanik (Buchseiten, Geschenke) treibt Wiederkommen — kein Zeitbudget. Der Plan unten ist **Entwickler-Spur**, nicht Annelis Spielplan.

### Woche 1 (laufend) — Foundation: Mechanik vor Story

**Goal:** Eine Brücke ist *richtig* spielbar — nicht 1 Stub-Aufgabe, sondern echte Lern-Session.

- [x] Greenfield Next.js 16 + Tailwind 4 + MDX
- [x] Quest-Routen, Skelett, Stub-Brücken
- [x] OpenAI TTS (fable) integriert, alle Story-Beats vertont
- [x] **Aufgaben-Generator pro Skill** (counting20, addition20, subtraction20, compare100, tensNeighbors, doubleHalf) — randomisiert, variantenreich, Level-fähig (easy/normal/hard)
- [x] **Story-Mikro-Vignetten** pro Aufgabe (`src/data/exercises/vignettes.ts` — mehrere Templates pro Skill und Aufgabenform, Sky-Kingdom-Welt: Vogelmama, Pip, Eier, Federn, Wolken, Beeren)
- [x] **Multi-Task-Flow** in BridgeChallenge: `bridge.totalTasks` Aufgaben pro Brücke (4–6), Progressbar, Brücke gilt erst nach allen Aufgaben als repariert
- [ ] **Input-Mode pro Brücke** (Tap-Count, Speech, Number-Keypad, Drag-Symbol, Zahlenstrahl-Tap, Spiegel-Mechanik — Component-Switch nach `input_mode`-Feld der Brücke)
- [x] **Hinweis-System statt Falsch-Feedback** (kein roter Buzzer; nach 8 Sek ohne Eingabe Tipp einblenden; nach falscher Antwort sofort Tipp; nach 3× falsch leichtere Variante)
- [x] **Adaptive within bridge** (3 richtig in Folge → 1 Stufe schwerer / 2 falsch in Folge → 1 Stufe leichter; Level pro Skill persistiert)
- [x] **Vogel-Begleiter mit Namen** (Onboarding-Modal beim ersten Sky-Map-Besuch, 6 Namens-Vorschläge + Free-Text, Persistenz via `progress.birdName`, in SkyMap-Header und Retry-Quips als `{bird}`-Platzhalter eingesetzt)
- [x] **Pause-Mechanik** (nach 10 Min sichtbarer App-Zeit Modal vom Buch mit „Pause machen" oder „Weiterspielen", 30-Min-Cooldown nach Pause; im Quest-Layout aktiv, also auf allen Quest-Seiten)
- [x] **Persistenz (localStorage)**: `src/data/progress.ts` — Brücken-Status, Vogel-Name, Adaptive-Level pro Skill; SkyMap zeigt "fertig"-State mit Häkchen + Aufgaben-Score
- [ ] **Story-Engine als Daten**: Brücken als JSON-Files in `src/data/bridges/*.json` statt hardcoded TS-Const

### Woche 2 — Visuals: aus Pastell-Boxen wird Welt

**Goal:** Es fühlt sich nach Hilda-Buch an, nicht nach Webpage.

- [x] **Hero-Bilder erste Welle**: Anneli mit Buch (`/hero/anneli-with-book.png`, Home-Hero), Bibliothek der Welten (`/hero/library-of-worlds.png`, Library-Page), Sky-Kingdom-Vista (`/hero/sky-kingdom-vista.png`, SkyMap-Hero) — generiert via `scripts/generate-hero-images.mjs` (gpt-image-2, quality low)
- [x] **Brücken-Visuals**: pro Brücke ein Zustand-Bild (kaputt / repariert) — 12 Bilder unter `/public/bridges/<id>/{broken,repaired}.png`, eingebettet in SkyMap (Status-Bild pro Karte) und BridgeChallenge (Wackel-Animation während Spielens, repariert beim Abschluss). Script: `npm run gen:bridge-images`.
- [x] Bilder in Home + Library + SkyMap eingebettet, Pastell-Boxen ersetzt
- [x] **Buch-Charakter** sichtbar: nicht mehr nur lucide-Icon, sondern echtes Asset (`/characters/book.png`) — in Intro-Page, Book-Komponente (schwebend) und BookSays-Komponente (inline) verwendet.

### Woche 3 — Kapitel-1-Abschluss

**Goal:** Anneli kann Kapitel 1 komplett durchspielen, von Buch öffnen bis Geschenk.

- [ ] **Story-Texte feinschleifen** (aktuell sind sie Skizzen)
- [ ] **Abschluss-Sequenz**: nach Brücke 6 → Feier mit Vogel-Volk → Feder-Geschenk → Buchseite zur Sammlung
- [ ] **Buchseiten-Sammlung**: Anneli kann zurückblättern und Kapitel 1 wiedererleben
- [ ] **Smoke-Test mit Anneli**: erste echte User-Session, was funktioniert / was nicht

### Woche 4 — ElevenLabs + Sound-FX + Eltern-View

**Goal:** Welt klingt nach Welt. Du siehst was Anneli gemacht hat. Wöchentliche Reports starten.

- [ ] ElevenLabs-API anbinden (Key in `.env.local` + `/root/.claude/credentials/elevenlabs.env`), Stimme aussuchen (Default „Sage" oder ähnliche warme weibliche)
- [ ] `scripts/generate-narration.ts` neue Variante mit ElevenLabs-Backend
- [ ] **Sound-FX über ElevenLabs Sound-FX-API**: Vogel-Zwitschern, Wind, Brücken-Knarzen, Magic-Chimes, Erfolgs-Glocke (max 11s pro Clip, loopbar)
- [ ] **Ambient-Musik pro Welt** via Pixabay/Mixkit (royalty-free), Sky-Kingdom = soft pastel pad
- [ ] **Eltern-View (`/parent`)**: was hat Anneli gespielt, welche Brücken geschafft, häufige Fehler, Skill-Heatmap
- [ ] **Wöchentlicher Eltern-Report** als VPS-Cron (`/root/.claude/scripts/anneli-report.py`, Sonntags 19:00, Telegram an `chat_id` 1256503034)
- [ ] Supabase-Tabelle `an_progress` für Skill-Daten (oder Prefix `cc_anneli_*` analog Schema-Konvention)

### Woche 5–6 — Kapitel 2: Pfirsich-Wüste & Drachenschatz

**Goal:** Zweites Kapitel komplett spielbar. Die Vision-Hypothese ("ein Modul, dann das nächste mit demselben Muster") ist validiert.

- [ ] Story-Konzept Kapitel 2 schreiben (Setting, NPCs, Beats)
- [ ] Mathe-Mechanik: Schatzkarten mit Stationen, Marktbuden mit Münzen
- [ ] Neue Aufgaben-Generatoren: `addSub100`, `money`, `wordProblems100`
- [ ] Bilder: Wüsten-Setting, Drache, Marktbuden, Karawane
- [ ] Audio: neue Story-Beats, Drache-Stimme (zweite TTS-Stimme?)
- [ ] Sammlung: Drachenschuppe, neue Buchseite

### Woche 7–8 — Polishing + Adaptive + Sharing-Ready

**Goal:** Das, was steht, ist gut genug, um es anderen Eltern zu zeigen.

- [ ] **Adaptive Schwierigkeit (light)**: häufige Fehler → leichter, schnelle Erfolge → schwerer (im Skill-Bereich)
- [ ] **Onboarding für andere Kinder**: nicht alles ist Anneli-spezifisch, der Name wird konfigurierbar
- [ ] **Deployment auf Vercel** mit echter Subdomain
- [ ] **Sharing-Ready**: README updaten, Screenshots, Demo-Link für Eltern-Freunde

### Backlog (nach Sprint)

- Kapitel 3 (Korallengarten — Muster/Symmetrie)
- Kapitel 4 (Erfinder-Werkstatt — Einmaleins)
- Kapitel 5 (Pastell-Wald — Division/Längen)
- Kapitel 6 (Uhrenturm — Uhrzeit)
- Cloud-Sync / Login (multi-device)
- Deutsch-Modul (zweites Fach, eigenes Story-Universum)
- Sachkunde / fächerübergreifend
- Video-Sequenzen für Portal-Übergänge (Sora / Veo)
- Content-Authoring für Nicht-Coder
- **Wow: Magisches Buch via Device-Motion-API** (Tablet neigen → Buchseiten blättern)
- **Wow: Vogel-Begleiter im Stand-by** (Daily-Engagement-Hook ohne Mathe)
- **Wow: Co-Op-Modus** (zwei Kinder am selben Tablet, eine Brücke zusammen)

---

## Engineering-Spuren (parallel zu Story)

| Spur | Aktueller Stand | Nächstes |
|---|---|---|
| **App-Skelett** | Next.js 16, Routes, MDX, Tailwind | Aufgaben-Engine |
| **Kopfrechnen-Zweig** | 10 Module + Tricks, eigene Persistenz, Zahlentastatur, Smoke-Test ✓ · Vertonung verdrahtet (358 Clips, Gerätestimme als Fallback) ✓ | Gemini-Audio erzeugen und committen, Trainings-Daten im Eltern-View |
| **Aufgaben-Engine** | 6 Generatoren + Vignetten + Multi-Task-Flow + Adaptive ✓ | Input-Modes pro Brücke, Story-Engine als Daten |
| **Persistenz** | localStorage (`progress.v1`) + Bird-Onboarding-Flag ✓ | Cloud-Sync (Backlog) |
| **Visuals (KI)** | gpt-image-2 Style-Test ✓ · 3 Hero-Bilder live ✓ · 12 Brücken-Status-Bilder ✓ · Buch-Charakter-Asset ✓ | Eltern-View / Skill-Heatmap (Wo 4), Wüsten-Setting (Wo 5) |
| **Pause-Mechanik** | 10-Min-Soft-Suggest ✓ | — |
| **Audio (KI)** | OpenAI TTS, 3 Voices (sage/ballad/coral), 17 Audios, speaker-aware Paths · 4 ElevenLabs Sound-FX · Ambient-Player bereit ✓ | Ambient-Music droppen (Pixabay), ElevenLabs-Upgrade Wo 4 |
| **Adaptive** | nichts | within-bridge (Wo 1), skill-übergreifend (Wo 7-8) |
| **Hosting** | Dev lokal | Vercel (Wo 7–8) |
| **Input-Modi** | nichts (klassisches Input-Feld) | 6 Modi pro Brücke (Wo 1) |
| **Eltern-Telegram-Report** | nichts | VPS-Cron sonntags 19:00 (Wo 4) |

---

## Definition of Done — Sprint (Wo 8)

Der Sprint ist erfolgreich, wenn am Ende von Woche 8 **alles davon** wahr ist:

1. Anneli spielt Kapitel 1 + Kapitel 2 freiwillig durch.
2. Die Aufgaben fordern sie (kein "zu leicht"-Feedback mehr).
3. Visuals sind durchgehend Hilda-Style, kein Pastell-Box-Look mehr.
4. Erzählerstimme ist final (ElevenLabs), eine zweite Charakter-Stimme existiert.
5. Du kannst im Eltern-View sehen, was sie gespielt hat.
6. App läuft öffentlich auf einer Vercel-Domain.
7. Du kannst einem anderen Elternteil den Link schicken, ohne dass es peinlich ist.

Wenn 1–7 nicht alle wahr sind, ist der Sprint **nicht** abgeschlossen — der Backlog wartet.

---

## Wo steht weitere Information?

Die ausführlichen Konzepte liegen im Memory-System (`./claude-memory/` über die Claude-Code-Integration):

- `project_vision` — große Vision und USP-Begründung
- `design_persona_anneli` — Anneli als North-Star-Kind
- `character_anneli` — Anneli als Heldin der Quest, Visual-Konsistenz
- `story_concept_chapter1` — Kapitel 1 im Detail (Premise, Buch-Charakter, Mechanik, Skills)
- `content_pipeline_image_voice` — wie KI-Bilder und Audio entstehen
- `tech_stack_nextjs` — Stack-Entscheid und Begründung
- `sprint_mathe_quest_story` — Sprint-Geist und Validierungs-Hypothese

Die **CLAUDE.md** verweist auf alle davon.
