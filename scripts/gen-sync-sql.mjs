// Generate UPSERT SQL for the 3 changed boats, sourced from boats.json (the
// authoritative copy). Uses jsonb_populate_record so we never hand-escape the
// long prose/jsonb fields. Camel→snake mapping mirrors rowToBoat in src/lib/data.ts.
import { readFileSync, writeFileSync } from "node:fs";

const boats = JSON.parse(
  readFileSync(new URL("../data/boats.json", import.meta.url), "utf8"),
);

// camelCase field -> snake_case column (inverse of rowToBoat)
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

import { createHash } from "node:crypto";
const ids = ["garcia52", "boreal52", "boreal55", "boreal56"];
const cols = Object.values(MAP);
const setClause = cols.map((c) => `${c} = excluded.${c}`).join(", ");

let sql = "";
for (const id of ids) {
  const b = boats.find((x) => x.id === id);
  if (!b) throw new Error(`missing ${id}`);
  const snake = {};
  for (const [camel, col] of Object.entries(MAP)) {
    if (b[camel] !== undefined) snake[col] = b[camel];
  }
  const json = JSON.stringify(snake);
  const b64 = Buffer.from(json, "utf8").toString("base64");
  const md5 = createHash("md5").update(json).digest("hex");
  // Base64 keeps the statement ASCII-only; the row is rebuilt via
  // jsonb_populate_record from the decoded JSON. The statement is self-verifying:
  // the `ok` CTE only yields a row when md5(decoded payload) matches the known
  // hash, so any transcription error in the (long) base64 produces 0 affected
  // rows (RETURNING id is empty) and the existing row is left untouched — never
  // silently corrupted. created_at/updated_at are NOT NULL with no default and
  // are absent from the JSON, so we inject them into the populated record; the
  // SET clause omits created_at, so existing rows keep theirs and new rows get now().
  sql +=
    `-- ${id}  json_md5=${md5}  b64_len=${b64.length}\n` +
    `WITH raw AS (SELECT convert_from(decode('${b64}','base64'),'UTF8') AS t), ` +
    `ok AS (SELECT t::jsonb AS j FROM raw WHERE md5(t) = '${md5}') ` +
    `INSERT INTO public.boats SELECT (jsonb_populate_record(null::public.boats, j || jsonb_build_object('created_at', now(), 'updated_at', now()))).* FROM ok ` +
    `ON CONFLICT (id) DO UPDATE SET ${setClause}, updated_at = now() RETURNING id;\n\n`;
}

writeFileSync(new URL("../scripts/sync.sql", import.meta.url), sql);
console.log(`Wrote scripts/sync.sql for: ${ids.join(", ")} (${sql.length} bytes)`);
