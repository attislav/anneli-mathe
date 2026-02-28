# Anneli Mathe (Anneli App)

Eine kleine, schnelle Lern-App für Kinder: **Mathe üben mit Spaß, kurzen Runden und Gamification**.

Aktueller Stand: reine **statische Web-App** (HTML/CSS/JS) – läuft komplett im Browser.

## Features (heute)
- Profile auf dem Gerät (localStorage)
- Lernpfad mit Levels/Stages + Unlocks
- Freies Üben (Schwierigkeit + Aufgabentyp)
- Gamification: Sterne, XP/Level, Streak, Achievements, Confetti
- Fehler-Pool: falsche Aufgaben kommen wieder
- Fortschritt exportieren/importieren (Code)

## Lokal starten
Am besten über einen kleinen lokalen Server:

```bash
python3 -m http.server
```

Dann öffnen: http://localhost:8000

## Deploy (statisch)
Du kannst das Projekt direkt als statische Seite deployen:
- Vercel (Static)
- Netlify
- GitHub Pages

## Roadmap-Idee
Kurzfristig (1–2 PRs):
- Content/Levels/Achievements als JSON auslagern (leichter neue Klassen/Fächer)
- Ordnung im Code: Module/Dateien statt alles in `script.js`

Mittelfristig:
- Weitere Klassenstufen
- Weitere Fächer (Deutsch/Englisch/Sachkunde)
- Optional: Cloud-Sync/Accounts + Eltern-/Lehreransicht

## Struktur (geplant)
Wir führen schrittweise eine Content-Struktur ein:

```
content/
  de/
    mathe/
      grade-1/
        learning-path.json
        exercises.json
```

So können neue Fächer/Klassen ergänzt werden, ohne die Logik umzuschreiben.
