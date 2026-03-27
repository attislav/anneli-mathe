#!/usr/bin/env node
/*
  Validate Anneli App skilltree JSON files.

  Usage:
    node scripts/validate-skilltree.js

  What it checks:
    - JSON parse errors
    - Duplicate skill IDs
    - Broken prerequisites (missing referenced IDs)
    - Cyclic prerequisites
    - Enum validation (difficulty, operation)
    - Mastery constraints (passScore, repetitions)

  This is intentionally dependency-free.
*/

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");

const ALLOWED_DIFFICULTY = new Set(["leicht", "mittel", "schwer"]);
const ALLOWED_OPERATION = new Set([
  "plus",
  "minus",
  "gemischt",
  "luecken",
  "zehner",
  "vergleichen",
  "verdoppeln",
  "nachbarn",
  "reihen",
]);

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function readJson(file) {
  const raw = fs.readFileSync(file, "utf8");
  try {
    return { ok: true, json: JSON.parse(raw) };
  } catch (err) {
    return { ok: false, error: err };
  }
}

function validateSkilltree(file, json) {
  const errors = [];

  if (!json || typeof json !== "object") {
    errors.push("root must be an object");
    return errors;
  }

  if (!Array.isArray(json.skills)) {
    errors.push('missing "skills" array');
    return errors;
  }

  const skills = json.skills;
  const idToIndex = new Map();

  // Basic shape + duplicates
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    const where = `skills[${i}]`;

    if (!s || typeof s !== "object") {
      errors.push(`${where} must be an object`);
      continue;
    }

    if (typeof s.id !== "string" || !s.id.trim()) {
      errors.push(`${where}.id must be a non-empty string`);
    } else {
      const id = s.id.trim();
      if (idToIndex.has(id)) {
        errors.push(`${where}.id duplicates id "${id}" (also at skills[${idToIndex.get(id)}])`);
      } else {
        idToIndex.set(id, i);
      }
    }

    if (s.difficulty !== undefined) {
      if (typeof s.difficulty !== "string" || !ALLOWED_DIFFICULTY.has(s.difficulty)) {
        errors.push(`${where}.difficulty must be one of: ${Array.from(ALLOWED_DIFFICULTY).join(", ")}`);
      }
    }

    if (s.operation !== undefined) {
      if (typeof s.operation !== "string" || !ALLOWED_OPERATION.has(s.operation)) {
        errors.push(`${where}.operation must be one of: ${Array.from(ALLOWED_OPERATION).join(", ")}`);
      }
    }

    if (s.prerequisites !== undefined) {
      if (!Array.isArray(s.prerequisites)) {
        errors.push(`${where}.prerequisites must be an array of skill IDs`);
      } else {
        for (let j = 0; j < s.prerequisites.length; j++) {
          const pre = s.prerequisites[j];
          if (typeof pre !== "string" || !pre.trim()) {
            errors.push(`${where}.prerequisites[${j}] must be a non-empty string`);
          }
        }
      }
    }

    if (s.mastery !== undefined) {
      if (!s.mastery || typeof s.mastery !== "object") {
        errors.push(`${where}.mastery must be an object`);
      } else {
        if (s.mastery.passScore !== undefined) {
          const ps = s.mastery.passScore;
          if (typeof ps !== "number" || !Number.isFinite(ps) || ps <= 0 || ps > 1) {
            errors.push(`${where}.mastery.passScore must be a number in (0, 1]`);
          }
        }
        if (s.mastery.repetitions !== undefined) {
          const r = s.mastery.repetitions;
          if (!Number.isInteger(r) || r <= 0 || r > 50) {
            errors.push(`${where}.mastery.repetitions must be an integer in [1, 50]`);
          }
        }
      }
    }
  }

  // Prereq references
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    if (!s || typeof s !== "object") continue;
    const where = `skills[${i}]`;
    if (!Array.isArray(s.prerequisites)) continue;

    for (let j = 0; j < s.prerequisites.length; j++) {
      const pre = s.prerequisites[j];
      if (typeof pre !== "string") continue;
      const id = pre.trim();
      if (!idToIndex.has(id)) {
        errors.push(`${where}.prerequisites[${j}] references missing id "${id}"`);
      }
    }
  }

  // Cycle detection
  const graph = new Map();
  for (const [id, idx] of idToIndex.entries()) {
    const s = skills[idx];
    const pres = Array.isArray(s?.prerequisites) ? s.prerequisites.map((x) => String(x).trim()).filter(Boolean) : [];
    graph.set(id, pres);
  }

  const VISITING = 1;
  const VISITED = 2;
  const state = new Map();

  function dfs(node, stack) {
    state.set(node, VISITING);
    stack.push(node);

    const neighbors = graph.get(node) || [];
    for (const n of neighbors) {
      if (!graph.has(n)) continue; // already reported as missing
      const st = state.get(n);
      if (st === VISITING) {
        const idx = stack.indexOf(n);
        const cycle = stack.slice(idx).concat(n);
        errors.push(`cycle detected: ${cycle.join(" -> ")}`);
      } else if (st !== VISITED) {
        dfs(n, stack);
      }
    }

    stack.pop();
    state.set(node, VISITED);
  }

  for (const id of graph.keys()) {
    if (state.get(id) !== VISITED) dfs(id, []);
  }

  return errors;
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`content directory not found: ${CONTENT_DIR}`);
    process.exit(2);
  }

  const files = walk(CONTENT_DIR).filter((p) => p.endsWith("skilltree.json"));
  if (files.length === 0) {
    console.log("No skilltree.json files found under content/");
    return;
  }

  let hadErrors = false;

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const parsed = readJson(file);
    if (!parsed.ok) {
      hadErrors = true;
      console.error(`\n❌ ${rel}`);
      console.error(`  JSON parse error: ${parsed.error.message}`);
      continue;
    }

    const errs = validateSkilltree(file, parsed.json);
    if (errs.length > 0) {
      hadErrors = true;
      console.error(`\n❌ ${rel}`);
      for (const e of errs) console.error(`  - ${e}`);
    } else {
      console.log(`✅ ${rel}`);
    }
  }

  if (hadErrors) process.exit(1);
}

main();
