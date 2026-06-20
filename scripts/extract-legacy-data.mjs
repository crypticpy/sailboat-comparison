// One-time migration: lift the 34 boats out of the legacy single-file site
// into a consolidated, schema-shaped data/boats.json.
//
// The legacy page keeps boat data in five parallel object literals (BOATS, PC,
// END, OWN, HP) and merges them by id at runtime (see lines ~1200/1311/1363/1384
// of the original). Rather than re-implement that merge by hand, we run the
// legacy script's own merge loops in a sandbox — truncated right before any DOM
// code — and capture the fully-merged BOATS array. Derived fields (missionFit,
// _p, selection, rangeNm) are intentionally NOT produced here; the app recomputes
// them from src/lib/metrics.ts.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const html = readFileSync(resolve(root, 'legacy/sailboat-comparison.html'), 'utf8');

// Grab the contents of the single <script> block.
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('No <script> block found in legacy file.');
let code = scriptMatch[1];

// Truncate before the first DOM reference so only data + merge loops execute.
const cut = code.indexOf('const grid=document.getElementById');
if (cut === -1) throw new Error('Could not find the DOM boot boundary to truncate at.');
code = code.slice(0, cut);

// Expose the merged array out of the script's const scope.
code += '\n;this.__BOATS = BOATS;\n';

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'legacy-data.js' });

const boats = sandbox.__BOATS;
if (!Array.isArray(boats) || boats.length === 0) {
  throw new Error('Extraction produced no boats.');
}

// Drop any runtime-derived fields if present (defensive — none expected here).
const DERIVED = new Set(['missionFit', '_p', 'selection', 'rangeNm']);
const clean = boats.map((b) => {
  const out = {};
  for (const k of Object.keys(b)) if (!DERIVED.has(k)) out[k] = b[k];
  return out;
});

const outPath = resolve(root, 'data/boats.json');
writeFileSync(outPath, JSON.stringify(clean, null, 2) + '\n', 'utf8');

// Report so the migration is verifiable, not assumed.
const required = ['id', 'name', 'scores', 'pros', 'cons', 'sources', 'youtube', 'engineHp'];
const missing = [];
for (const b of clean) {
  for (const key of required) {
    if (b[key] === undefined || b[key] === null) missing.push(`${b.id || '??'}.${key}`);
  }
}
console.log(`Wrote ${clean.length} boats to data/boats.json`);
console.log(`ids: ${clean.map((b) => b.id).join(', ')}`);
console.log(`own present: ${clean.filter((b) => b.own).length}/${clean.length}`);
console.log(`awards present: ${clean.filter((b) => b.awards && b.awards.length).length}/${clean.length}`);
if (missing.length) {
  console.error(`\nMISSING required fields:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log('All required fields present on every boat. ✓');
