// Generate the lightweight grid index from the per-boat research records.
//   node scripts/gen-research.mjs
// Reads research/data/<id>.json -> writes src/data/research-index.json (Record<id, ResearchIndexEntry>).
// The heavy per-boat detail is NOT bundled here; the app lazy-loads research/data/<id>.json
// on demand (import.meta.glob in src/lib/research.ts). Re-run after any research fan-out.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "research", "data");
const outFile = join(root, "src", "data", "research-index.json");

const factBy = (facts, needle) =>
  facts.find((f) => (f.key || "").toLowerCase().includes(needle));

function ceCategory(facts) {
  const f = factBy(facts, "ce_category");
  if (!f) return null;
  const m = String(f.value).match(/category\s*([abc])\b/i);
  return m ? m[1].toUpperCase() : null;
}

function hasHeating(facts) {
  const f = factBy(facts, "cold.heating");
  if (!f) return null;
  // present unless the value explicitly opens with a negation
  return !/^\s*(no\b|none\b|not\s)/i.test(String(f.value));
}

function avs(facts) {
  const f = factBy(facts, "stability.avs");
  if (!f) return null;
  if (/not\s+(published|available|found)/i.test(String(f.value))) return null;
  const m = String(f.value).match(/\b(1[0-5]\d)(?:\s*(?:°|deg))/i) || String(f.value).match(/\bAVS[^0-9]{0,8}(1[0-5]\d)\b/i);
  return m ? parseInt(m[1], 10) : null;
}

const index = {};
const ids = readdirSync(dataDir).filter((f) => f.endsWith(".json")).sort();
for (const file of ids) {
  const j = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  const id = j.id || file.replace(/\.json$/, "");
  const facts = j.verify?.cleaned_facts || [];
  const s = j.scores || {};
  index[id] = {
    id,
    name: j.name || id,
    cold: s.cold_score?.value ?? 0,
    coldConf: s.cold_score?.confidence ?? 0,
    tropic: s.tropic_score?.value ?? 0,
    tropicConf: s.tropic_score?.confidence ?? 0,
    stability: s.stability_score?.value ?? 0,
    stabilityConf: s.stability_score?.confidence ?? 0,
    stabilityBasis: s.stability_score?.basis ?? null,
    stormCited: !!s.storm_verdict?.cited,
    refitLow: s.refit_projection?.total_low_usd ?? 0,
    refitHigh: s.refit_projection?.total_high_usd ?? 0,
    ceCategory: ceCategory(facts),
    hasHeating: hasHeating(facts),
    avs: avs(facts),
    factCount: facts.length,
    removedCount: (j.verify?.removed || []).length,
    flagCount: (j.verify?.fabrication_flags || []).length,
    overallConfidence: j.research?.overall_confidence ?? j.verify?.verified_confidence ?? 0,
  };
}

writeFileSync(outFile, JSON.stringify(index, null, 2) + "\n");
console.log(`wrote ${outFile} — ${Object.keys(index).length} boats`);
for (const e of Object.values(index)) {
  console.log(
    `  ${e.id.padEnd(12)} cold ${String(e.cold).padStart(3)}(${e.coldConf}) tropic ${String(e.tropic).padStart(3)} stab ${String(e.stability).padStart(3)} CE:${e.ceCategory ?? "-"} heat:${e.hasHeating ?? "-"} AVS:${e.avs ?? "-"} storm:${e.stormCited ? "✓" : "-"} refit $${Math.round(e.refitLow / 1000)}-${Math.round(e.refitHigh / 1000)}k`,
  );
}
