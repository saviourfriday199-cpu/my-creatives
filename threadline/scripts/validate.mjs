#!/usr/bin/env node
/**
 * Dataset validator for the Threadline course platform.
 *
 * Validates, for every course in data/courses.json:
 *   - each dataset file parses and matches the JSON Schemas in schema/
 *   - no orphaned topic references in dependencies.json (from/to must exist)
 *   - no circular dependencies (the prerequisite graph must be a valid DAG)
 *   - every topic has a course_id matching a course in courses.json
 *   - topic ids are unique within a course and courses.topic_count is accurate
 *
 * Zero runtime dependencies: a small JSON Schema subset is implemented inline,
 * which is enough for the schemas we ship. Exits non-zero on any error.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "data");
const SCHEMA = join(ROOT, "schema");

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(`Cannot read/parse ${rel(path)}: ${e.message}`);
    return null;
  }
}
const rel = (p) => p.replace(ROOT + "/", "");

/* ---------- minimal JSON Schema validator (subset we use) ---------- */
function validateSchema(schema, value, path, label) {
  const t = schema.type;
  if (t === "array") {
    if (!Array.isArray(value)) return fail(`${label}: expected an array at ${path}`);
    value.forEach((item, i) => validateSchema(schema.items, item, `${path}[${i}]`, label));
    return;
  }
  if (t === "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value))
      return fail(`${label}: expected an object at ${path}`);
    for (const key of schema.required || []) {
      if (!(key in value)) fail(`${label}: missing required field "${key}" at ${path}`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in (schema.properties || {})))
          fail(`${label}: unexpected field "${key}" at ${path}`);
      }
    }
    for (const [key, sub] of Object.entries(schema.properties || {})) {
      if (key in value) validateSchema(sub, value[key], `${path}.${key}`, label);
    }
    return;
  }
  if (t === "string") {
    if (typeof value !== "string") return fail(`${label}: expected string at ${path}`);
    if (schema.minLength != null && value.length < schema.minLength)
      fail(`${label}: "${path}" shorter than ${schema.minLength} chars`);
    if (schema.maxLength != null && value.length > schema.maxLength)
      fail(`${label}: "${path}" longer than ${schema.maxLength} chars`);
    if (schema.enum && !schema.enum.includes(value))
      fail(`${label}: "${path}" = "${value}" not one of ${schema.enum.join(", ")}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value))
      fail(`${label}: "${path}" = "${value}" does not match /${schema.pattern}/`);
    return;
  }
  if (t === "integer") {
    if (!Number.isInteger(value)) return fail(`${label}: expected integer at ${path}`);
    if (schema.minimum != null && value < schema.minimum)
      fail(`${label}: "${path}" = ${value} below minimum ${schema.minimum}`);
    if (schema.maximum != null && value > schema.maximum)
      fail(`${label}: "${path}" = ${value} above maximum ${schema.maximum}`);
    return;
  }
}

/* ---------- cycle detection (DFS on the full edge set) ---------- */
function findCycle(topicIds, deps) {
  const adj = new Map(topicIds.map((id) => [id, []]));
  for (const d of deps) {
    if (adj.has(d.from) && adj.has(d.to)) adj.get(d.from).push(d.to);
  }
  const WHITE = 0, GREY = 1, BLACK = 2;
  const color = new Map(topicIds.map((id) => [id, WHITE]));
  const stack = [];

  function dfs(u) {
    color.set(u, GREY);
    stack.push(u);
    for (const v of adj.get(u)) {
      if (color.get(v) === GREY) {
        const from = stack.indexOf(v);
        return [...stack.slice(from), v];
      }
      if (color.get(v) === WHITE) {
        const cyc = dfs(v);
        if (cyc) return cyc;
      }
    }
    stack.pop();
    color.set(u, BLACK);
    return null;
  }
  for (const id of topicIds) {
    if (color.get(id) === WHITE) {
      const cyc = dfs(id);
      if (cyc) return cyc;
    }
  }
  return null;
}

/* ---------- run ---------- */
console.log("Validating Threadline datasets\n");

const coursesSchema = readJSON(join(SCHEMA, "courses.schema.json"));
const topicsSchema = readJSON(join(SCHEMA, "topics.schema.json"));
const depsSchema = readJSON(join(SCHEMA, "dependencies.schema.json"));
const courses = readJSON(join(DATA, "courses.json"));

if (coursesSchema && courses) validateSchema(coursesSchema, courses, "courses.json", "courses.json");

if (Array.isArray(courses)) {
  const courseIds = new Set(courses.map((c) => c.id));
  if (courseIds.size !== courses.length) fail("courses.json: duplicate course id(s)");

  for (const course of courses) {
    const dir = join(DATA, course.id);
    const topicsPath = join(dir, "topics.json");
    const depsPath = join(dir, "dependencies.json");
    if (!existsSync(topicsPath)) { fail(`${course.id}: missing ${rel(topicsPath)}`); continue; }
    if (!existsSync(depsPath)) { fail(`${course.id}: missing ${rel(depsPath)}`); continue; }

    const topics = readJSON(topicsPath);
    const deps = readJSON(depsPath);
    if (!Array.isArray(topics) || !Array.isArray(deps)) continue;

    if (topicsSchema) validateSchema(topicsSchema, topics, "topics", `${course.id}/topics.json`);
    if (depsSchema) validateSchema(depsSchema, deps, "deps", `${course.id}/dependencies.json`);

    // unique topic ids
    const ids = topics.map((t) => t.id);
    const idSet = new Set(ids);
    if (idSet.size !== ids.length)
      fail(`${course.id}: duplicate topic id(s) in topics.json`);

    // every topic's course_id matches this course
    for (const t of topics) {
      if (t.course_id !== course.id)
        fail(`${course.id}: topic "${t.id}" has course_id "${t.course_id}" (expected "${course.id}")`);
    }

    // topic_count accuracy
    if (course.topic_count !== topics.length)
      fail(`${course.id}: courses.json topic_count = ${course.topic_count} but topics.json has ${topics.length}`);

    // no orphaned references
    for (const d of deps) {
      if (!idSet.has(d.from))
        fail(`${course.id}: dependency references unknown "from" topic "${d.from}"`);
      if (!idSet.has(d.to))
        fail(`${course.id}: dependency references unknown "to" topic "${d.to}"`);
      if (d.from === d.to)
        fail(`${course.id}: self-dependency on topic "${d.from}"`);
    }

    // valid DAG
    const cyc = findCycle(ids, deps);
    if (cyc) fail(`${course.id}: circular dependency detected: ${cyc.join(" -> ")}`);

    // soft advisory: topics with no incoming and no outgoing edge are isolated
    const referenced = new Set();
    deps.forEach((d) => { referenced.add(d.from); referenced.add(d.to); });
    for (const t of topics) {
      if (!referenced.has(t.id)) warn(`${course.id}: topic "${t.id}" has no prerequisite links (isolated node)`);
    }

    if (errors.length === 0)
      console.log(`  ok  ${course.id.padEnd(16)} ${topics.length} topics, ${deps.length} edges`);
  }
}

console.log("");
for (const w of warnings) console.log(`  warning: ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\nAll datasets valid${warnings.length ? ` (${warnings.length} warning(s))` : ""}.`);
