// Transform data/boats.json into an array of snake_case row objects suitable for
// a PostgREST bulk insert (POST /rest/v1/boats). Values pass through unchanged —
// strings/numbers as-is, text[] as JSON arrays, jsonb as JSON objects — only the
// keys are renamed via the shared COLUMNS map. Writes to a path given as argv[2]
// (default /tmp/boats-rows.json) so the payload never has to round-trip through
// the agent's context.
//
//   node scripts/gen-rows.mjs /tmp/boats-rows.json

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { COLUMNS } from "./columns.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const boats = JSON.parse(readFileSync(resolve(root, "data/boats.json"), "utf8"));
const out = process.argv[2] || "/tmp/boats-rows.json";

const rows = boats.map((b) => {
  const row = {};
  for (const [col, key] of COLUMNS) row[col] = b[key];
  return row;
});

writeFileSync(out, JSON.stringify(rows));
console.log(`Wrote ${out}: ${rows.length} rows, ${COLUMNS.length} columns each.`);
