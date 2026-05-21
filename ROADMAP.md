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

### Sound-Design pro Brücke (ab Wo 4)

- **Erzähler-Stimme**: ElevenLabs (Voice „Sage" oder ähnliche warme Stimme, ggf. Voice-Clone für Buch-Charakter).
- **Sound-FX**: ElevenLabs Sound-FX-API (Vogel-Zwitschern, Wind, Brücken-Knarzen, Magic-Chimes, Erfolgs-Glocke).
- **Ambient-Musik** pro Welt via Pixabay/Mixkit (royalty-free). Sky-Kingdom = soft pastel pad music.
- KEIN „Falsch"-Buzzer-Sound. Nur sanfte Hint-Sounds.

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
- [ ] **Aufgaben-Generator pro Skill** (counting20, addition20, subtraction20, compare100, tensNeighbors, doubleHalf) — randomisiert, variantenreich
- [ ] **Story-Mikro-Vignetten** pro Aufgabe (Generator liefert 1-2 Sätze Story-Kontext zur Aufgabe, mehrere Templates pro Skill)
- [ ] **Multi-Task-Flow** in BridgeChallenge: 4–6 Aufgaben pro Brücke, Progressbar, Brücke gilt erst nach allen als repariert
- [ ] **Input-Mode pro Brücke** (Tap-Count, Speech, Number-Keypad, Drag-Symbol, Zahlenstrahl-Tap, Spiegel-Mechanik — Component-Switch nach `input_mode`-Feld der Brücke)
- [ ] **Hinweis-System statt Falsch-Feedback** (kein roter Buzzer; nach 3 Sek Tipp einblenden; nach 3× falsch leichtere Variante)
- [ ] **Adaptive within bridge** (3 richtig → schwerer / 2 falsch → leichter, im selben Skill-Bereich)
- [ ] **Vogel-Begleiter mit Namen** (Onboarding-Frage „Wie soll dein Vogel heißen?", Persistenz, im Story-Text verwendet)
- [ ] **Pause-Mechanik** (nach 10 Min App-Zeit: Buch schlägt Pause vor, kein hartes Lockout)
- [ ] **Persistenz (localStorage)**: welche Brücken sind fertig, Vogel-Name, Adaptive-State pro Skill, Anzeige auf Sky-Map
- [ ] **Story-Engine als Daten**: Brücken als JSON-Files in `src/data/bridges/*.json` statt hardcoded TS-Const

### Woche 2 — Visuals: aus Pastell-Boxen wird Welt

**Goal:** Es fühlt sich nach Hilda-Buch an, nicht nach Webpage.

- [ ] **Hero-Bilder generieren**: Anneli mit Buch (Intro), Bibliothek der Welten (großes Hero), Sky-Map als illustrierte Karte, sprechendes Buch als Charakter-Asset
- [ ] **Brücken-Visuals**: pro Brücke ein Zustand-Bild (kaputt / repariert)
- [ ] Bilder in Pages einbetten, Pastell-Boxen ersetzen
- [ ] **Buch-Charakter** sichtbar: nicht mehr nur lucide-Icon, sondern echtes Asset

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
| **Aufgaben-Engine** | Stub: 1 fixe Aufgabe pro Brücke | Generator pro Skill, Multi-Task-Flow |
| **Persistenz** | nichts | localStorage (Sprint), Cloud-Sync (Backlog) |
| **Visuals (KI)** | gpt-image-2 Style-Test ✓ | Hero-Bilder Kapitel 1 |
| **Audio (KI)** | gpt-4o-mini-tts fable, 15 Audios | Wechsel zu ElevenLabs + Sound-FX (Wo 4) |
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
