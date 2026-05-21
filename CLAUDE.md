# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **First: read `AGENTS.md`.** It enforces that Next.js 16 has breaking changes versus older training data and points you at the docs in `node_modules/next/dist/docs/`. Trust the local docs over your prior knowledge of Next.

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

This is not a generic learning app. Read these memory files for the product context:

- `project_vision` — what the app is and is explicitly not
- `design_persona_anneli` — the North-Star kid (can the material, doesn't like drilling)
- `sprint_mathe_quest_story` — current sprint goal (one Mathe-Quest with story)
- `content_pipeline_image_voice` — how visuals and voice are generated
- `tech_stack_nextjs` — why this stack and the greenfield reset

The memory index (`MEMORY.md`) lists them all and is auto-loaded.

## Legacy code

The pre-greenfield Vanilla/Vite app (skill tree, error pool, gamification, achievements) lives on branch `archive/legacy-vanilla`. Pull patterns from there *as reference* — do not 1:1 port. The new UI model is different.
