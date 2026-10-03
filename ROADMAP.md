# Roadmap — Mathe-Sternenpfad (Arbeitstitel)

> Diese Datei ist die **Quelle der Wahrheit** für Vision, Plan und Backlog. Wenn etwas hier nicht steht, ist es noch nicht entschieden.
>
> **Neustart 2026-10-02.** Der Story-Modus („Anneli & das verzauberte Buch") hat bei Anneli nicht gezündet. Die alte Roadmap liegt in der Git-History (Commit `fa45a19`).

---

## Warum der Neustart

**Was wir gelernt haben:** Eine Geschichte vor jeder Aufgabe bremst. Kinder in Klasse 2 wollen **sichtbaren Fortschritt, sammeln, schnelle Belohnung** — und dann noch eine Runde.

**Was bleibt:** kein roter Buzzer, Tipps statt Strafe, Rechentricks, Adaptivität, alles vorlesbar.

**Was sich ändert:** Belohnung ist ausdrücklich gewollt. Sterne, Münzen, ein Pfad, Sammeln, Freispiel. Die App ist ein **Spiel, in dem man rechnet** — nicht ein Übungsheft mit Stickern.

---

## Vision

Die Mathe-App für Klasse 2, die Kinder **freiwillig** öffnen. Größer, schöner und schlauer als Anton:

| Anspruch | Was das konkret heißt |
|---|---|
| **Fühlt sich an wie ein Spiel** | Animationen, Sounds, Combos, Bosse, Geheimnisse. Jede richtige Antwort „knallt". |
| **Passt sich wirklich an** | Jede Kompetenz hat einen eigenen Können-Wert. Die App zielt auf ~80 % Treffer: fordernd, nie frustrierend. |
| **Erkennt Denkfehler** | Zahlendreher, vergessener Zehner, falsche Rechenart → passende Erklärung statt nur „nochmal". |
| **Belohnt mit echtem Inhalt** | Ausmalbilder, Sticker-Album, eigenes Haustier, Baumhaus, Mini-Spiele. |
| **Macht neugierig** | Nebel auf der Karte, versteckte Wege, Überraschungs-Knoten, Events. |
| **Ist fair** | Keine Werbung, keine Echtgeld-Käufe, keine Tricks gegen Kinder. Freispielzeit stellen die Eltern ein. |

### Erfolg messen

| Horizont | Metrik |
|---|---|
| Nach MVP (Phase 1) | Anneli spielt **1 Woche lang freiwillig ≥ 4×**, ohne Erinnerung. |
| Nach Phase 3 | Der komplette Klasse-2-Stoff ist drin; Trefferquote pendelt bei 75–85 %. |
| Langfristig | Andere Eltern fragen nach dem Link. Mehrere Kinderprofile, Klasse 1–4. |

---

## Design-Regeln

1. **Erste Aufgabe in < 10 Sekunden** nach App-Start. Kein Intro, kein Text-Wall.
2. **Kurze Lektionen:** 6–8 Aufgaben, ~3 Minuten. „Nur noch eine" muss immer möglich sein.
3. **Juice:** Jede Aktion hat Animation + Sound. Combos (3, 5, 10 richtig in Folge) feiern sichtbar.
4. **Fehler kosten nichts.** Tipp → Rechenweg → weiter. Sterne gibt's für gutes Rechnen, aber verloren geht nie etwas.
5. **Abwechslung:** nie zehnmal dasselbe Format hintereinander.
6. **Alles vorlesbar** — Lesefähigkeit in Klasse 2 schwankt stark.
7. **Tablet zuerst**, große Touch-Ziele, eigene Zahlentastatur.
8. **Gesund:** Pause-Vorschlag nach 15–20 Min, Freispiel zeitlich begrenzt.

---

## Der Kern-Loop

```
App öffnen → Pfad → Lektion (6–8 Aufgaben)
     ↑                    ↓
Münzen ausgeben   ←   Sterne + Münzen + XP + Truhe
(Shop, Freispiel,         ↓
 Ausmalen, Haustier)   Pfad geht weiter, neue Welt in Sicht
```

---

## 1. Der Pfad

Eine große Weltkarte mit gewundenem Pfad. Jede Welt ist eine Insel mit eigenem Look.

**Knoten-Typen**

| Knoten | Was passiert |
|---|---|
| Lektion | 6–8 Aufgaben, 1–3 Sterne |
| Trick | Neuer Rechentrick als kurze animierte Erklärung, dann direkt anwenden |
| Schatzkiste | Belohnung (Münzen, Sticker, Ausmalbild) |
| Wiederholung | Adaptive Mischung aus wackeligen Kompetenzen |
| Boss | Weltende: animierter Gegner, Aufgaben = Angriffe. Gewinnen öffnet die nächste Welt |
| Geheimweg | Versteckter Abzweig, öffnet sich nur mit 3 Sternen davor |

**Sterne-Regeln:** ⭐ geschafft · ⭐⭐ ≥ 80 % beim ersten Versuch · ⭐⭐⭐ fast fehlerfrei. Wiederholen kann Sterne nur verbessern.

**Stufen pro Lektion:** Entdecker (Bronze) → Profi (Silber) → Meister (Gold). Nach 3 Sternen schaltet sich die nächste Stufe frei — gleiche Kompetenz, schwerere Zahlen. So gibt es **sichtbare Schwierigkeitsgrade** ohne den Pfad zu blockieren.

**Sternen-Tore:** Die nächste Welt braucht X Sterne. Unentdeckte Welten liegen im Nebel — man sieht nur Umrisse.

**Einstufung:** Beim ersten Start ein 5-Minuten-„Abenteuer" statt Test. Setzt Startpunkt und Können-Werte. Wer schon mehr kann, springt mit einem „Sprung-Stern" weiter.

**Schul-Modus:** Eltern wählen „Was macht ihr gerade in der Schule?" → die App empfiehlt passende Knoten zuerst.

---

## 2. Welten = Klasse-2-Lehrplan

| # | Welt | Inhalte |
|---|---|---|
| 0 | **Startinsel** | Wiederholung Klasse 1: Zahlenfreunde bis 10, Plus/Minus bis 20, Zehnerübergang |
| 1 | **Zahlenwald** | Zahlen bis 100: Zehner/Einer, Hunderterfeld, Zahlenstrahl, Vergleichen, Nachbarzahlen, Zehnernachbarn, gerade/ungerade |
| 2 | **Plus-Minus-Strand** | +/− bis 100 ohne Übergang, Tausch- und Umkehraufgaben, Ergänzen bis 100 |
| 3 | **Vulkaninsel** | +/− bis 100 mit Übergang, Rechenstrategien (schrittweise, Hilfsaufgabe, Fast-Zehner) |
| 4 | **Knobel-Labor** | Zahlenmauern, Rechendreiecke, Rechenketten, Platzhalter, Zahlenrätsel |
| 5 | **Piratenhafen** | Geld: Euro & Cent, bezahlen, Wechselgeld, Preise vergleichen |
| 6 | **Einmaleins-Zirkus** | Malnehmen verstehen, Kernaufgaben 2/5/10, alle Reihen, Tauschaufgabe |
| 7 | **Bäckerei** | Teilen & Aufteilen, Umkehraufgaben zum Einmaleins |
| 8 | **Uhrenschloss** | Uhrzeit (volle, halbe, Viertel, Minuten), Zeitspannen, Kalender |
| 9 | **Formen-Ozean** | Formen, Körper, Symmetrie, Muster, Würfelgebäude, Lagebeziehungen |
| 10 | **Mess-Werkstatt** | Längen m/cm, mit dem Lineal messen, schätzen |
| 11 | **Detektivbüro** | Sachaufgaben, Tabellen, Strichlisten, Diagramme, Kombinatorik |
| ★ | **Sternen-Expedition** | Klasse-3-Vorschau für Überflieger: bis 1000, halbschriftlich — keine Obergrenze |

Je Welt 15–25 Knoten → **~200 Lektionen**, durch Generatoren endlos wiederspielbar.

---

## 3. Schwierigkeit & Adaptivität

- **Kompetenz-Graph:** ~60 Kompetenzen mit Voraussetzungen (z. B. „Zehnerübergang bis 20" vor „Zehnerübergang bis 100"). Basis: `content/de/mathe/grade-2/skilltree.json` aus `archive/legacy-vanilla`.
- **Können-Wert pro Kompetenz** (Elo-artig): Kind-Wert vs. Aufgaben-Schwierigkeit. Die Engine wählt Aufgaben mit erwarteter Trefferquote **~80 %**.
- **Mikro-Anpassung in der Lektion:** 3 richtig in Folge → schwerer, 2 falsch → leichter (existiert schon im Training).
- **Fehler-Diagnose:** typische Muster erkennen (34 ↔ 43, Zehner vergessen, + statt −, um 1 daneben) → passender Tipp + gezielte Übungen im nächsten Wiederholungs-Knoten.
- **Spaced Repetition:** Wiederholungs-Knoten holen zurück, was lange nicht dran war oder wackelt.
- **Antwortzeit** zählt intern (Automatisierung), aber **nie sichtbarer Timer** — außer im freiwilligen Blitz-Modus.

---

## 4. Aufgabenformate (~20)

Abwechslung ist der wichtigste Hebel gegen Langeweile. Jede Kompetenz nutzt mehrere Formate.

| Gruppe | Formate |
|---|---|
| Eingeben | Zahlentastatur · Lücke füllen · Zahlenmauer · Rechendreieck |
| Tippen | Auswahl (2–4 Antworten) · Zahlenstrahl tippen · Fehler-Detektiv („welche Rechnung stimmt nicht?") · Schätzen |
| Ziehen | Zehnerstangen & Einer legen · Münzen ins Portemonnaie · Sortieren · Paare verbinden · Teilen auf Teller |
| Bauen | Uhrzeiger stellen · Symmetrie im Gitter ergänzen · Muster fortsetzen · Würfelgebäude zählen |
| Messen | Lineal anlegen · Diagramm ablesen |
| Spezial | Blitzrunde (freiwillig, auf Rekord) · Boss-Angriff · Rechen-Malbild |

---

## 5. Belohnungen & Gamification

**Drei Werte, nicht mehr** (sonst verwirrend):

| Wert | Woher | Wofür |
|---|---|---|
| ⭐ Sterne | Lektionen gut lösen | Sternen-Tore, Geheimwege |
| 🪙 Münzen | jede Aufgabe, Combos, Tagesziel, Truhen | Shop, Freispiel |
| XP → Level | alles | Spieler-Level mit Titel, Haustier wächst |

**Belohnungs-Inhalte**

- **Ausmalbilder** — pro Welt ein Set (~8). Digital ausmalen (Füllen, Pinsel, Glitzer, Sticker), Galerie, als PDF drucken. Highlight: **Rechen-Malbilder** — Farbe nach Ergebnis, Mathe und Belohnung in einem.
- **Sticker-Album** — Fabelwesen pro Welt, normal / selten / Glitzer. Doppelte gegen Münzen tauschen. Seiten füllen = Sammeltrieb.
- **Haustier** — am Anfang schlüpft ein Ei. Wächst mit dem Level (3 Entwicklungsstufen), will gefüttert und angezogen werden, feuert in Lektionen an.
- **Baumhaus** — eigenes Zimmer mit Möbeln aus dem Shop einrichten.
- **Avatar** — Kleidung, Frisur, Accessoires.
- **Freispiel-Arcade** — Mini-Spiele gegen Münzen, Spielzeit von Eltern begrenzt. Ideen: Ballon-Platzen, Zahlen-Snake, Memory, Zehner-Tetris, Murmelbahn bauen, Labyrinth, freies Malen, Musik-Baukasten.
- **Abzeichen** — ~50 Erfolge („100 Aufgaben", „Boss besiegt", „7 Tage dabei").
- **Tagesziel & Serie** — Flamme für Tage am Stück, mit Serien-Schutz. Erste Lektion am Tag öffnet den **Tagesschatz**.
- **Events** — Halloween, **Adventskalender** (24 Türchen), Ostern, Geburtstags-Überraschung.

---

## 6. Neugier-Mechaniken

- Nebel und Silhouetten auf der Karte — „was ist da hinten?"
- Versteckte Wege und Fundstücke, die man nur durch Spielen entdeckt
- Überraschungs-Knoten mit unbekanntem Inhalt
- „Wusstest du?"-Karten mit Zahlen-Fakten (Wie viele Zähne hat ein Hai?)
- Bosse mit eigener Persönlichkeit und Animation
- Rekordjagd gegen sich selbst (Blitzrunde)

---

## 7. Eltern-Bereich

Geschützt durch Eltern-Gate (Rechenaufgabe für Erwachsene oder PIN).

- Fortschritt pro Kompetenz als Ampel, Zeit pro Tag, häufige Fehlermuster
- Freispiel-Limit, Tageszeit-Limit, Pause-Erinnerung
- Schul-Modus (aktuelles Thema wählen)
- Mehrere Kinderprofile
- Wochenbericht (später per Mail/Telegram)

---

## 8. Technik

| Bereich | Entscheidung |
|---|---|
| Basis | bleibt: Next.js 16, React 19, TypeScript, Tailwind 4, statischer Export auf Vercel |
| Neu | **PWA** (installierbar, offline) · **Motion** für Animationen · Canvas für Mini-Spiele · Vitest + Playwright |
| Speicher | Phase 1–3 lokal (IndexedDB). Phase 4 Supabase (Eltern-Login, Sync, mehrere Geräte) — geht ohne eigenen Server |
| Inhalte als Daten | Welten, Knoten, Kompetenzen, Belohnungen als Daten-Dateien → neue Inhalte ohne neue Komponenten |
| Aufgaben-Engine | Generator je Kompetenz mit Schwierigkeits-Parametern; Aufgabe = Format + Zahlen + Lösung + Tipp + Rechenweg + Fehlermuster |
| Bilder | KI-generiert (gpt-image), einheitlicher Stil. Ausmalbilder als Linien-Art → vektorisiert für Tipp-zum-Füllen |
| Audio | Gemini TTS, komplett vorproduziert (Pipeline existiert). Sound-FX + Musik pro Welt |

**Was wir aus dem jetzigen Code übernehmen**

- Trainings-Generatoren + Rechentricks (`src/data/training/`) → werden Kompetenzen der Welten 0–3, 6, 7
- `NumberPad`, Audio-Baukasten (`useSpeech`, Speech-Manifest), `useSoundFx`, Pause-Hinweis
- Smoke-Tests für Generatoren

**Was rausgeht:** Story-Modus (`/quest`, Brücken, Buch, Vogel) → Branch `archive/story-mode`, aus `master` entfernt.

---

## 9. Phasen

### Phase 0 — Aufräumen & Fundament

- [ ] Alten Code entfernen (`src/components`, `src/data`, `src/lib`, `/quest`, `/training`, alte Skripte und Assets) — wartet auf Freigabe, steht bis dahin unverlinkt neben der neuen App
- [x] Design-System: Farben + 3D-Knöpfe in `globals.css`, Bausteine in `src/ui/`
- [x] Datenmodell: Spielstand in `src/game/state.ts` (localStorage, `sternenpfad.v1`)
- [x] PWA: Manifest, PNG-Icons, Service Worker (`scripts/build-sw.mjs`) — nach dem ersten Besuch läuft alles offline
- [x] Kompetenzen Klasse 2 als Daten: 15 Kompetenzen × 5 Stufen in `src/game/skills.ts`
- [~] Tests: `npm run smoke:game` (225.000 Aufgaben gegen Invarianten) — Klick-Test lief lokal mit Playwright, liegt noch nicht im Repo

### Phase 1 — MVP „Der Pfad" → Test mit Anneli

- [x] Weltkarte mit Pfad: Startinsel, Zahlenwald, Plus-Minus-Strand (26 Knoten), weitere Welten im Nebel
- [x] 6 Formate: Antippen, Zahlentastatur, Zehner legen, Zahlenstrahl, Zahlenmauer, Vergleichen
- [x] Sterne, Münzen, XP/Level, Combos, Ergebnis-Screen mit Truhe
- [x] Adaptive Engine v1 (`src/game/adaptive.ts`: +0,2/−0,8-Treppe → ~80 % Treffer)
- [x] Rechentricks als eigene Knoten, Tipp nach Fehler, Rechenweg nach 2. Fehler
- [x] Ausmalbilder v1: 6 Bilder, freies Malen + Rechen-Malbild mit Münz-Bonus
- [x] Haustier: Ei aussuchen, schlüpfen, taufen, wächst mit dem Level
- [x] Vorlesen (Gerätestimme) + Sound-FX (Web Audio, keine Dateien)
- [x] KI-Bilder für Haustiere, Eier, Bosse und 36 Sticker (GPT Image 2.5 Sunburst, als Sprite-Atlas) — Ausmalbilder folgen in AP-16
- [ ] **DoD:** Anneli spielt eine Woche freiwillig. Beobachten, notieren, nachschärfen.

### Phase 2 — Belohnungswelt

- [x] Laden mit Zubehör fürs Haustier
- [x] Sticker-Album (36 Sticker, seltene mit Glitzer, Doppelte → Münzen)
- [x] Spielhalle mit 2 Mini-Spielen (Ballon-Platzen, Rechen-Memory) + Tageslimit
- [x] Tagesziel, Serie (Flamme)
- [x] Boss-Kämpfe (3 Bosse)
- [ ] Baumhaus, Avatar, Abzeichen, Tagesschatz
- [ ] Mehr Mini-Spiele (Zehner-Turm, Sternen-Rakete)
- [ ] **Adventskalender bis 1. Dezember**

### Phase 3 — Voller Lehrplan (~4–6 Wochen)

- [ ] Welten 2–11 mit allen Kompetenzen und Formaten
- [ ] Fehler-Diagnose + Wiederholungs-Knoten (Spaced Repetition)
- [ ] Einstufungs-Abenteuer
- [ ] Rechen-Malbilder
- [ ] Musik pro Welt

### Phase 4 — Eltern & Cloud (~2 Wochen)

- [~] Eltern-Ecke (unter „Ich"): Rechen-Sperre, Können pro Thema, Spielhallen-Limit, Zurücksetzen — Schul-Modus fehlt
- [ ] Supabase: Eltern-Login, Sync, mehrere Kinderprofile
- [ ] Wochenbericht

### Phase 5 — Wachstum (laufend)

- [ ] Sternen-Expedition (Klasse 3)
- [ ] Weitere Events und Mini-Spiele
- [ ] Geschwister-/Freunde-Challenges
- [ ] Klasse 1 und 3 als eigene Pfade
- [ ] Zweites Fach (Deutsch)

---

## 10. Arbeits-Backlog (Arbeitspakete in Reihenfolge)

Die Phasen oben sagen *was*, dieses Backlog sagt *in welcher Reihenfolge* — jedes Paket ist für sich fertigstellbar, getestet und gepusht. Wer ohne Rückfrage weiterarbeitet, nimmt das oberste offene Paket.

**Regeln pro Paket:** `npm run smoke:game`, `npm run build`, `npm run lint` grün · Klicktest im Browser (Playwright) · Commit + Push · Häkchen hier setzen.

**Bilder:** GPT Image 2.5, Variante *Sunburst*, Qualität *low* (Sticker, kleine Dinge) oder *medium* (Haustiere, Bosse, Ausmalbilder), transparenter Hintergrund, einheitlicher Stil-Prompt (siehe `src/game/art.ts`). Immer mit Vektor-Fallback, falls ein Bild nicht lädt.

| # | Paket | Inhalt | Fertig, wenn … |
|---|---|---|---|
| AP-1 ✓ | **KI-Bilder Welle 1** | 3 Haustiere × 3 Stufen, 3 Eier, 3 Bosse | Bilder in App sichtbar, Vektor-Fallback greift |
| AP-2 ✓ | **KI-Sticker** | 36 Sticker-Wesen | Album zeigt Bilder, Silhouette für fehlende |
| AP-3 ✓ | **Offline-App (PWA)** | Service Worker, PNG-Icons, Bilder cachen | App startet ohne Netz auf dem Tablet |
| AP-4 | **Welt 4: Piratenhafen (Geld)** | Kompetenzen €/ct, neues Format „Münzen legen" | 9 Knoten spielbar, Smoke-Test grün |
| AP-5 | **Welt 5: Einmaleins-Zirkus** | Malnehmen verstehen, Kernaufgaben, Reihen; Format „Punktefeld" | 9 Knoten spielbar |
| AP-6 | **Welt 6: Bäckerei (Teilen)** | Aufteilen, Umkehraufgaben; Format „Verteilen auf Teller" | 9 Knoten spielbar |
| AP-7 | **Welt 7: Uhrenschloss** | volle/halbe/Viertelstunden, Minuten, Zeitspannen; Format „Uhr stellen" | 9 Knoten spielbar |
| AP-8 | **Abzeichen + Tagesschatz** | ~30 Erfolge, Truhe für die erste Lektion am Tag | Abzeichen-Seite unter „Ich" |
| AP-9 | **Übungskiste (Fehler-Wiederholung)** | falsch gelöste Aufgaben kommen nach 1/3/7 Tagen zurück | eigener Knoten „Übungskiste" auf dem Pfad |
| AP-10 | **Einstufungs-Abenteuer** | 5 Minuten, setzt Startwelt + Können-Werte | ersetzt die Startfrage im Onboarding |
| AP-11 | **Saison: Halloween + Adventskalender** | Event-Rahmen; Halloween-Deko im Oktober; 24 Türchen ab 1.12. | Eltern können Kalender vorab ansehen |
| AP-12 | **Welt 8: Formen-Ozean** | Formen, Symmetrie, Muster; Format „Spiegeln im Gitter" | 9 Knoten spielbar |
| AP-13 | **Welt 9: Mess-Werkstatt** | cm/m, Lineal; Format „Lineal anlegen" | 9 Knoten spielbar |
| AP-14 | **Welt 10: Detektivbüro** | Sachaufgaben, Diagramme | 9 Knoten spielbar |
| AP-15 | **Schul-Modus** | Eltern wählen Schulthema → Empfehlung auf dem Pfad | in der Eltern-Ecke einstellbar |
| AP-16 | **KI-Ausmalbilder** | Linienbilder + Ausmalen per Flood-Fill | 6 neue Bilder in Truhen |
| AP-17 | **Klicktest im Repo** | Playwright-Skript `npm run e2e` | läuft lokal grün |
| AP-18 | **Mehr Mini-Spiele** | Zehner-Turm, Sternen-Rakete | in der Spielhalle |
| AP-19 | **Baumhaus** | Zimmer mit Möbeln aus dem Laden | unter „Ich" |
| AP-20 | **Cloud-Sync** | Supabase, Eltern-Login, mehrere Kinder | braucht Zugangsdaten → mit Papa klären |

**Blockiert / braucht Entscheidung:**
- Alten Code löschen (`src/components`, `src/data`, `src/lib`, `/quest`, `/training`) — wartet auf Freigabe
- Bilder ins Repo laden: `cloudfront.net` ist freigegeben (gilt ab der nächsten Sitzung) → dort `npm run art:fetch` ausführen und `public/art/` committen. Die App bevorzugt lokale Kopien automatisch.
- Vorproduzierte Stimme (Gemini-TTS) braucht `GEMINI_API_KEY` in der Umgebung

## Offene Entscheidungen

- **Name** der App (Arbeitstitel „Mathe-Sternenpfad")
- **Grafik-Stil** — Vorschlag: bunt, rund, freundliche Fabelwesen (kein Pastell-Buch-Look mehr). Vor Phase 1 drei Stil-Tests generieren und mit Anneli auswählen.
- **Hauptgerät** — Tablet (iPad?) oder auch Handy
- **Haustier-Art** — Anneli entscheiden lassen
