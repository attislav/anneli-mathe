# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Anneli Mathe — a static, browser-only learning app for children (German UI: Mathe / Deutsch / Sachkunde, Klasse 1–2). No backend; all state is in `localStorage`, namespaced per profile and subject.

## Commands

```bash
npm run dev        # Vite dev server (opens browser automatically)
npm run build      # Production build → dist/
npm run preview    # Preview the built bundle
npm run validate   # Validate every content/**/skilltree.json (schema, dup IDs, broken/cyclic prerequisites, enum values, mastery constraints)
npm run prepare    # One-time: points git core.hooksPath at .githooks (runs automatically on `npm install`)
```

The `.githooks/pre-commit` hook runs `npm run validate` and blocks the commit on failure. Do not bypass with `--no-verify`; fix the skilltree instead.

There is no test suite, no linter, and no type checker. "Correctness" for content changes = `npm run validate` passes. For UI/logic changes, exercise the feature in `npm run dev`.

Two validators exist: `scripts/validate-skilltree.cjs` (canonical, wired into `npm run validate` and the pre-commit hook) and `tools/validate-skilltrees.cjs` (older, referenced in `content/README.md`). Prefer the `scripts/` one.

## Architecture

### Entry point and module graph

`index.html` loads exactly one script: `<script type="module" src="src/app.js">`. That ES module wires the DOM and pulls in all other modules in `src/`. The legacy `script.js` at the repo root is **not** loaded by `index.html` — it's the pre-modularization monolith kept around for reference during the migration described in `README.md`. Don't edit `script.js` to add features; edit modules in `src/`.

### Shared state + event bus (`src/state.js`)

There is **one** mutable `state` object exported from `src/state.js`; every module imports it and mutates fields directly. This is intentional — it's the single source of truth and replaces a global. Constants (`DIFFICULTY`, `LEVELS`, `ACHIEVEMENTS`, `DEFAULT_LEARNING_PATH`) live in the same file.

`state.js` also exports a tiny `events` bus (`events.on` / `events.emit`). It exists to break **circular import cycles** between modules that would otherwise reference each other (notably `ui.js` ↔ `checker.js` ↔ `learning-path.js`). `app.js` also injects `selectStage` / `showMapView` / `checkAnswers` into `ui.js` via `setCallbacks(...)` for the same reason — when adding cross-module calls, prefer events or callback injection over new direct imports if it would close a cycle.

### Module responsibilities

- `app.js` — DOM event wiring, navigation between map ↔ exercise view, the only place that talks to top-level buttons
- `accounts.js` — profile creation, login, export/import codes
- `state.js` — state object, constants, event bus
- `storage.js` — every `localStorage` key goes through `profileKey()` / `subjectKey()`; never call `localStorage` directly elsewhere
- `learning-path.js` — loads `content/<locale>/<subject>/<grade>/skilltree.json`, converts it into the runtime `state.LEARNING_PATH`, handles prerequisite unlocks and mastery progression
- `exercises.js` — generators per operation type (`plus`, `minus`, `luecken`, `zehner`, `vergleichen`, `verdoppeln`, `nachbarn`, `reihen`, plus Deutsch/Sachkunde types)
- `checker.js` — grades answers, updates streak/stars/XP, triggers rescue MC, calls `completeStage`
- `gamification.js` — stars, XP, level, streak, achievements
- `error-pool.js` — wrong answers re-enter the rotation
- `practice-log.js` — per-round timing for the parent view
- `ui.js` — all rendering (learning path map, exercise list, parent view, toasts)
- `effects.js` — confetti, sounds-adjacent visuals, number-line help
- `audio.js` — WebAudio sound effects

### Data-driven content (`content/`)

Path pattern: `content/<locale>/<subject>/<grade>/`. The app fetches these JSON files at runtime — there is no build step that bakes them in. See `content/README.md` for the convention.

- `skilltree.json` — drives the learning path. Each skill has `id`, `title`, `description`, `prerequisites[]`, `mastery: { passScore, repetitions }`, and optional `icon` / `difficulty` / `operation`. Missing `difficulty`/`operation` are inferred from the skill `id` by `inferStageConfigFromSkillId` in `learning-path.js` — so naming matters (e.g. an id containing `add` + `20` infers `plus` + `schwer`).
- `exercises.json` / `reading.json` / `topics.json` / `rechtschreibung.json` / `lueckentexte.json` / `silben.json` — subject-specific exercise pools. Only the files needed for a subject/grade have to exist.
- Templates live in `content/templates/`. Use them as starting points for new subjects/grades.

The allowed `operation` enum is defined in `scripts/validate-skilltree.cjs` (`ALLOWED_OPERATION`). Adding a new operation requires updating the validator **and** adding a generator in `exercises.js`.

### Persistence model

All progress is in `localStorage` only. Keys are namespaced `mathe-<profile>-<subject>-<key>` (see `storage.js`). The "Fortschritt sichern / importieren" buttons serialize a profile's keys into a single base64-ish code — that's the only way to move progress between devices. When changing the shape of persisted data, consider migration logic for existing profiles (see `migrateMasteryProgressFromOldMasteredStages` in `learning-path.js` for the pattern).

### UI language

User-facing strings are German. Keep that.
