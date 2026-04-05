#!/usr/bin/env node
/*
  Validate all content/<...>/skilltree.json files.

  Why:
  - Keep the app data-driven
  - Catch typos and broken prerequisites early
  - Prevent prerequisite cycles (learning path must stay a DAG)

  Usage:
    node tools/validate-skilltrees.js
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');

// Keep these in sync with the app defaults (script.js)
const ALLOWED_DIFFICULTY = new Set(['leicht', 'mittel', 'schwer']);
const ALLOWED_OPERATIONS = new Set([
  'plus',
  'minus',
  'gemischt',
  'nachbarn',
  'vergleichen',
  'reihen',
  'verdoppeln',
  'luecken',
  'zehner',
]);

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function fail(msg) {
  const err = new Error(msg);
  err.isValidationError = true;
  throw err;
}

function isPlainObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

function detectPrerequisiteCycles({ filePath, skills }) {
  // Graph edges: skill -> prereq
  const byId = new Map();
  for (const s of skills) byId.set(s.id, s);

  const state = new Map(); // id -> 0 unvisited, 1 visiting, 2 done
  const stack = [];

  function dfs(id) {
    const st = state.get(id) ?? 0;
    if (st === 1) {
      // cycle found: stack ... id
      const idx = stack.indexOf(id);
      const cycle = idx >= 0 ? stack.slice(idx).concat(id) : stack.concat(id);
      fail(`${filePath}: prerequisite cycle detected: ${cycle.join(' -> ')}`);
    }
    if (st === 2) return;

    state.set(id, 1);
    stack.push(id);

    const node = byId.get(id);
    const pres = Array.isArray(node?.prerequisites) ? node.prerequisites : [];
    for (const pre of pres) dfs(pre);

    stack.pop();
    state.set(id, 2);
  }

  for (const s of skills) dfs(s.id);
}

function validateSkilltree(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    fail(`${filePath}: invalid JSON (${e.message})`);
  }

  if (!isPlainObject(json)) fail(`${filePath}: root must be an object`);

  const requiredTop = ['version', 'locale', 'subject', 'grade', 'skills'];
  for (const k of requiredTop) {
    if (!(k in json)) fail(`${filePath}: missing top-level field '${k}'`);
  }

  if (typeof json.version !== 'number') fail(`${filePath}: 'version' must be a number`);
  if (typeof json.locale !== 'string' || !json.locale) fail(`${filePath}: 'locale' must be a non-empty string`);
  if (typeof json.subject !== 'string' || !json.subject) fail(`${filePath}: 'subject' must be a non-empty string`);
  if (typeof json.grade !== 'string' || !json.grade) fail(`${filePath}: 'grade' must be a non-empty string`);
  if (!Array.isArray(json.skills)) fail(`${filePath}: 'skills' must be an array`);

  const ids = new Set();
  for (let i = 0; i < json.skills.length; i++) {
    const s = json.skills[i];
    const loc = `${filePath}: skills[${i}]`;

    if (!isPlainObject(s)) fail(`${loc}: must be an object`);

    for (const k of ['id', 'title', 'description', 'prerequisites', 'mastery']) {
      if (!(k in s)) fail(`${loc}: missing field '${k}'`);
    }

    if (typeof s.id !== 'string' || !s.id) fail(`${loc}: 'id' must be a non-empty string`);
    if (ids.has(s.id)) fail(`${loc}: duplicate id '${s.id}'`);
    ids.add(s.id);

    if (typeof s.title !== 'string' || !s.title) fail(`${loc}: 'title' must be a non-empty string`);
    if (typeof s.description !== 'string' || !s.description) fail(`${loc}: 'description' must be a non-empty string`);

    if (!Array.isArray(s.prerequisites)) fail(`${loc}: 'prerequisites' must be an array`);
    for (const [pi, pre] of s.prerequisites.entries()) {
      if (typeof pre !== 'string' || !pre) fail(`${loc}: prerequisites[${pi}] must be a non-empty string`);
      if (pre === s.id) fail(`${loc}: prerequisite cannot reference itself ('${s.id}')`);
    }

    if (!isPlainObject(s.mastery)) fail(`${loc}: 'mastery' must be an object`);
    if (typeof s.mastery.passScore !== 'number') fail(`${loc}: mastery.passScore must be a number`);
    if (s.mastery.passScore <= 0 || s.mastery.passScore > 1) fail(`${loc}: mastery.passScore must be in (0, 1]`);
    if (!Number.isInteger(s.mastery.repetitions) || s.mastery.repetitions <= 0) {
      fail(`${loc}: mastery.repetitions must be a positive integer`);
    }

    // Optional fields (if present, validate)
    if ('icon' in s && !(typeof s.icon === 'string' && s.icon.trim())) {
      fail(`${loc}: 'icon' must be a non-empty string when provided`);
    }

    if ('difficulty' in s) {
      if (typeof s.difficulty !== 'string' || !ALLOWED_DIFFICULTY.has(s.difficulty)) {
        fail(`${loc}: 'difficulty' must be one of: ${Array.from(ALLOWED_DIFFICULTY).join(', ')}`);
      }
    }

    if ('operation' in s) {
      if (typeof s.operation !== 'string' || !ALLOWED_OPERATIONS.has(s.operation)) {
        fail(`${loc}: 'operation' must be one of: ${Array.from(ALLOWED_OPERATIONS).join(', ')}`);
      }
    }
  }

  // Second pass: prerequisites must exist.
  const idSet = new Set(ids);
  for (let i = 0; i < json.skills.length; i++) {
    const s = json.skills[i];
    const loc = `${filePath}: skills[${i}]`;
    for (const pre of s.prerequisites) {
      if (!idSet.has(pre)) {
        fail(`${loc}: prerequisite '${pre}' does not exist (typo?)`);
      }
    }
  }

  // Third pass: graph must be acyclic.
  detectPrerequisiteCycles({ filePath, skills: json.skills });

  return { filePath, skillCount: json.skills.length };
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log(`No content directory found at ${CONTENT_DIR} (nothing to validate).`);
    process.exit(0);
  }

  const files = walk(CONTENT_DIR).filter((p) => p.endsWith(`${path.sep}skilltree.json`));

  if (files.length === 0) {
    console.log('No skilltree.json files found (nothing to validate).');
    process.exit(0);
  }

  const results = [];
  for (const f of files) results.push(validateSkilltree(f));

  const totalSkills = results.reduce((sum, r) => sum + r.skillCount, 0);
  console.log(`OK: validated ${results.length} skilltree.json file(s), ${totalSkills} skill(s) total.`);
}

try {
  main();
} catch (e) {
  if (e && e.isValidationError) {
    console.error(`VALIDATION FAILED: ${e.message}`);
    process.exit(1);
  }
  console.error(e);
  process.exit(1);
}
