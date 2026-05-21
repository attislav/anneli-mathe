# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **First: read `AGENTS.md`** for the Next.js-16-breaking-changes notice.
> **Then: read `ROADMAP.md`** — it is the source of truth for vision, sprint, and backlog. There is an **active multi-week sprint** with concrete weekly milestones; check the roadmap before deciding what to work on. Memory files hold the rationale and persona/character details; the roadmap holds the plan.

## Stack

- **Next.js 16.2** (App Router) + **React 19.2** + **TypeScript 5**
- **Tailwind CSS 4** (new engine, configured via `@tailwindcss/postcss`)
- **MDX** via `@next/mdx` for story / quest content (`.md` and `.mdx` are page extensions; see `src/mdx-components.tsx` for global component overrides)
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
```

## Secrets / API keys

`OPENAI_API_KEY` lives in `.env.local` (gitignored). **Never prefix it with `NEXT_PUBLIC_`** — anything with that prefix is bundled into the client and readable by every visitor. The key is only used in:

- Server-side code (Server Components, Route Handlers in `src/app/api/...`)
- Build-time / one-off Node scripts (e.g. asset generation)

If a feature requires the key in client code, the design is wrong — proxy it through a Route Handler instead.

## Vision and project context

The **vision, sprint plan, weekly milestones, and Definition of Done** live in `ROADMAP.md` (repo root). Read it. If you're picking work without checking the roadmap, you're guessing.

The memory files hold the *why* (rationale, persona detail, design decisions):

- `project_vision` — what the app is and is explicitly not
- `design_persona_anneli` — the North-Star kid (can the material, doesn't like drilling)
- `character_anneli` — Anneli as the in-story heroine (visual consistency)
- `story_concept_chapter1` — chapter 1 design (premise, book persona, bridges, skill mapping)
- `sprint_mathe_quest_story` — sprint mindset and validation hypothesis
- `content_pipeline_image_voice` — how visuals and voice are generated
- `tech_stack_nextjs` — why this stack and the greenfield reset

The memory index (`MEMORY.md`) lists them all and is auto-loaded.

## Legacy code

The pre-greenfield Vanilla/Vite app (skill tree, error pool, gamification, achievements) lives on branch `archive/legacy-vanilla`. Pull patterns from there *as reference* — do not 1:1 port. The new UI model is different.
