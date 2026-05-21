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

## Sprint-Plan (8 Wochen, Start 2026-05-21)

Anneli spielt variable Sitzungen, wann sie Lust hat. Sammelmechanik (Buchseiten, Geschenke) treibt Wiederkommen — kein Zeitbudget. Der Plan unten ist **Entwickler-Spur**, nicht Annelis Spielplan.

### Woche 1 (laufend) — Foundation: Mechanik vor Story

**Goal:** Eine Brücke ist *richtig* spielbar — nicht 1 Stub-Aufgabe, sondern echte Lern-Session.

- [x] Greenfield Next.js 16 + Tailwind 4 + MDX
- [x] Quest-Routen, Skelett, Stub-Brücken
- [x] OpenAI TTS (fable) integriert, alle Story-Beats vertont
- [ ] **Aufgaben-Generator pro Skill** (counting20, addition20, subtraction20, compare100, tensNeighbors, doubleHalf) — randomisiert, variantenreich
- [ ] **Multi-Task-Flow** in BridgeChallenge: 4–6 Aufgaben pro Brücke, Progressbar, Brücke gilt erst nach allen als repariert
- [ ] **Persistenz (localStorage)**: welche Brücken sind fertig, Anzeige auf Sky-Map

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

### Woche 4 — ElevenLabs-Migration + Eltern-View light

**Goal:** Erzählerstimme wird endgültig. Du kannst sehen, was Anneli gemacht hat.

- [ ] ElevenLabs-API anbinden (Key in `.env.local`), Stimme aussuchen
- [ ] `scripts/generate-narration.ts` neue Variante mit ElevenLabs-Backend
- [ ] **Eltern-View (`/parent`)**: was hat Anneli gespielt, welche Brücken geschafft, häufige Fehler
- [ ] Optional: Backend-Proxy (Vercel Function) für dynamische TTS-Calls vorbereiten (wenn nötig)

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

---

## Engineering-Spuren (parallel zu Story)

| Spur | Aktueller Stand | Nächstes |
|---|---|---|
| **App-Skelett** | Next.js 16, Routes, MDX, Tailwind | Aufgaben-Engine |
| **Aufgaben-Engine** | Stub: 1 fixe Aufgabe pro Brücke | Generator pro Skill, Multi-Task-Flow |
| **Persistenz** | nichts | localStorage (Sprint), Cloud-Sync (Backlog) |
| **Visuals (KI)** | gpt-image-2 Style-Test ✓ | Hero-Bilder Kapitel 1 |
| **Audio (KI)** | gpt-4o-mini-tts fable, 15 Audios | Wechsel zu ElevenLabs (Wo 4) |
| **Adaptive** | nichts | nach Sprint, basierend auf Eltern-View-Daten |
| **Hosting** | Dev lokal | Vercel (Wo 7–8) |

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
