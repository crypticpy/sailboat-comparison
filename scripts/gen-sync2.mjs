// Emit dollar-quoted RAW-JSON upserts for the two NEW boats (boreal55, boreal56).
// Rationale: base64 of 15 KB is high-entropy and error-prone to transcribe by hand;
// raw JSON is mostly natural-language prose, which reproduces far more reliably.
// Still self-verifying: md5(dollar-quoted text) == known json_md5, so any copy slip
// yields 0 rows (existing row untouched). One statement per line for easy Read+exec.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const boats = JSON.parse(
  readFileSync(new URL("../data/boats.json", import.meta.url), "utf8"),
);

const MAP = {
  id: "id", name: "name", builder: "builder", designer: "designer",
  color: "color", years: "years", material: "material", category: "category",
  cockpitType: "cockpit_type", loa: "loa", lwl: "lwl", beam: "beam",
  draftMin: "draft_min", draftMax: "draft_max", displacement: "displacement",
  ballast: "ballast", ballastRatio: "ballast_ratio", sailArea: "sail_area",
  airDraft: "air_draft", engine: "engine", drive: "drive", cabins: "cabins",
  keel: "keel", cockpit: "cockpit", fuel: "fuel", water: "water",
  loaN: "loa_n", lwlFt: "lwl_ft", beamFt: "beam_ft", dispLb: "disp_lb",
  draftMinN: "draft_min_n", sad: "sad", dl: "dl", fuelN: "fuel_n",
  waterN: "water_n", engineHp: "engine_hp", priceMinUSD: "price_min_usd",
  priceMaxUSD: "price_max_usd", budget: "budget", budgetN: "budget_n",
  bestFor: "best_for", protectionText: "protection_text", rig: "rig",
  handlingText: "handling_text", engineWorkshop: "engine_workshop",
  systems: "systems", storageText: "storage_text", rangeText: "range_text",
  accommodation: "accommodation", highLatText: "high_lat_text",
  tropicalText: "tropical_text", priceText: "price_text", priceNew: "price_new",
  priceUsed: "price_used", budgetText: "budget_text", notable: "notable",
  scores: "scores", tags: "tags", fun: "fun", priceExamples: "price_examples",
  sources: "sources", youtube: "youtube", pros: "pros", cons: "cons",
  awards: "awards", endorsements: "endorsements", badge: "badge", own: "own",
};
const cols = Object.values(MAP);
const setClause = cols.map((c) => `${c} = excluded.${c}`).join(", ");

let sql = "";
for (const id of ["boreal55", "boreal56"]) {
  const b = boats.find((x) => x.id === id);
  if (!b) throw new Error(`missing ${id}`);
  const snake = {};
  for (const [camel, col] of Object.entries(MAP)) {
    if (b[camel] !== undefined) snake[col] = b[camel];
  }
  const json = JSON.stringify(snake);
  const md5 = createHash("md5").update(json).digest("hex");
  const tag = `$${id}$`; // distinctive dollar-quote tag; never appears in content
  if (json.includes(tag)) throw new Error(`tag collision for ${id}`);
  sql +=
    `-- ${id}  json_md5=${md5}  json_len=${json.length}\n` +
    `WITH ok AS (SELECT j FROM (SELECT ${tag}${json}${tag} AS j) s WHERE md5(j) = '${md5}') ` +
    `INSERT INTO public.boats SELECT (jsonb_populate_record(null::public.boats, j::jsonb || jsonb_build_object('created_at', now(), 'updated_at', now()))).* FROM ok ` +
    `ON CONFLICT (id) DO UPDATE SET ${setClause}, updated_at = now() RETURNING id;\n\n`;
}

writeFileSync(new URL("../scripts/sync2.sql", import.meta.url), sql);
console.log(`Wrote scripts/sync2.sql (${sql.length} bytes)`);
