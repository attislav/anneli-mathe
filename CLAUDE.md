# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **First: read `AGENTS.md`** for the Next.js-16-breaking-changes notice.
> **Then: read `ROADMAP.md`** — it is the source of truth for vision, phases, and backlog. **Restart 2026-10-02:** the story mode is dropped; the app is now gamification-first (path, stars, coins, rewards, adaptive difficulty). Check the roadmap's current phase before deciding what to work on.

## Stack

- **Next.js 16.2** (App Router) + **React 19.2** + **TypeScript 5**
- **Tailwind CSS 4** (new engine, configured via `@tailwindcss/postcss`)
- **lucide-react** for UI icons (buttons, navigation, status — anything system-level)
- **All illustrations, characters, story art**: KI-generiert, custom. **Never** use stock icons, generic clipart, or emoji as placeholders for things meant to look polished. See [[content-pipeline-image-voice]] in memory.
- **Hosting**: Vercel
- **Source layout**: `src/`, import alias `@/*`

## Commands

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start (production)
npm run lint     # eslint
npm run smoke:game  # alle Aufgaben-Generatoren gegen Invarianten prüfen
```

## Code-Landkarte (neue App)

- `src/game/` — Engine ohne UI: Kompetenzen + Generatoren (`skills.ts`), Welten/Pfad (`worlds.ts`), Adaptivität (`adaptive.ts`), Spielstand (`state.ts`), Sammelbares, Ausmalbilder, Sound, Vorlesen
- `src/lesson/` — Lektions-Ablauf (`engine.ts`), Aufgaben-Formate, Ergebnis, Rechentrick
- `src/screens/`, `src/games/`, `src/ui/` — Bildschirme, Mini-Spiele, Bausteine
- Kopfrechen-Training (aus der ersten Version, eigenständig): Route `/training`, Code in `src/components/Training*`, `src/data/training/`, `src/lib/useSpeech.ts`
- Der alte Story-Modus liegt nur noch auf dem Branch `archive/story-mode`

## Secrets / API keys

`OPENAI_API_KEY` lives in `.env.local` (gitignored). **Never prefix it with `NEXT_PUBLIC_`** — anything with that prefix is bundled into the client and readable by every visitor. The key is only used in:

- Server-side code (Server Components, Route Handlers in `src/app/api/...`)
- Build-time / one-off Node scripts (e.g. asset generation)

If a feature requires the key in client code, the design is wrong — proxy it through a Route Handler instead.

## Vision and project context

The **vision, phases, and Definition of Done** live in `ROADMAP.md` (repo root). Read it. If you're picking work without checking the roadmap, you're guessing.

The memory files below describe the **old story mode** (pre-2026-10-02). Persona and pipeline notes are still useful; story/chapter notes are historical:

- `project_vision` — what the app is and is explicitly not
- `design_persona_anneli` — the North-Star kid (can the material, doesn't like drilling)
- `character_anneli` — Anneli as the in-story heroine (visual consistency)
- `story_concept_chapter1` — chapter 1 design (premise, book persona, bridges, skill mapping)
- `sprint_mathe_quest_story` — sprint mindset and validation hypothesis
- `content_pipeline_image_voice` — how visuals and voice are generated
- `tech_stack_nextjs` — why this stack and the greenfield reset

The memory index (`MEMORY.md`) lists them all and is auto-loaded.

## Legacy code

- `archive/story-mode` — die Story-Version („Anneli & das verzauberte Buch"), Stand vor dem Neustart.
- `archive/legacy-vanilla` — die Vanilla/Vite-App davor (Skill-Tree, Fehlerpool, Gamification).

Nur als Referenz nutzen, nicht 1:1 portieren.
