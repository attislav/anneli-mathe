# Content Folder Convention

Goal: keep content data **data-driven** and easy to extend.

## Path pattern

```
content/<locale>/<subject>/<grade>/
```

**Examples**
```
content/de/mathe/grade-1/
content/de/deutsch/grade-2/
```

## Naming rules

- `locale`: ISO language code (e.g. `de`, `en`).
- `subject`: lowercase slug (e.g. `mathe`, `deutsch`, `sachkunde`).
- `grade`: `grade-<number>` (e.g. `grade-1`, `grade-2`).

## File convention (minimal)

```
learning-path.json   // nodes + order + unlock rules
skilltree.json       // skill definitions + prerequisites + mastery thresholds
exercises.json       // raw exercise pool or generator config
```

Only include what is needed for the subject/grade; missing files are OK.

### Templates

Use `content/templates/exercises.template.json` as the starter file when creating a new `exercises.json`.
It includes small example blocks for:
- `mathGenerators`
- `readingItems`
- `topicCards`

### `skilltree.json` (minimal shape)

- `skills[]`: each skill has
  - `id` (stable)
  - `title`, `description`
  - `prerequisites[]` (skill ids)
  - `mastery` (`passScore`, `repetitions`)

Example file: `content/de/mathe/grade-1/skilltree.json`

## Data principles

- **No hardcoded content** in `script.js` once migrated.
- Content files are **small** and **human-editable**.
- Prefer **stable IDs** (e.g. `m1-add-10`) for skills/levels to allow tracking.
- Keep exercise content grouped by `skillId` so later runtime loading can map content to the skilltree without hardcoded switches.
