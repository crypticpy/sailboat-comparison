// Reusable boat-research workflow — versioned so we can re-run it any time we add
// boats or want to deepen coverage. Launch with:
//   Workflow({ scriptPath: "research/research-workflow.js",
//              args: { ids: ["outbound","hr44", ...] } })        // subset of CATALOG
//   Workflow({ scriptPath: "research/research-workflow.js",
//              args: { boats: [ {id,name,builder,years,category,price}, ... ] } })  // brand-new boats
//   args.models overrides the per-stage model tiers (defaults below).
//
// Pipeline per boat: web Research → adversarial Verify (citation gate) → rubric Score.
// The scoring rubric below MUST stay in sync with research/RUBRICS.md (the contract).
// Token policy: Haiku gathers, Sonnet verifies (the trust gate) and scores. Bump to
// opus only if a quality pass shows Haiku research is too thin.

export const meta = {
  name: "boat-research",
  description:
    "Web-research → adversarial-verify → rubric-score a set of boats; cited + confidence-scored, no fabrication",
  phases: [
    {
      title: "Research",
      detail: "web research per boat → cited facts + confidence",
    },
    {
      title: "Verify",
      detail: "adversarial citation gate: demote uncited claims to gaps",
    },
    {
      title: "Score",
      detail:
        "apply rubrics → cold/tropic/stability, storm verdict, refit, provisioning",
    },
  ],
};

// ── Full 34-boat catalog (add new boats here, or pass them via args.boats) ────
const CATALOG = [
  {
    id: "ip485",
    name: "Island Packet 485",
    builder: "Island Packet Yachts (USA)",
    years: "2002–c.2017",
    category: "Centre-cockpit cruiser",
    price: "$250k–$500k",
  },
  {
    id: "pure42",
    name: "Pure 42",
    builder: "Pure Yachts (Germany)",
    years: "2024–present",
    category: "Aluminium expedition",
    price: "~$1.27M–$1.5M",
  },
  {
    id: "bestevaer49",
    name: "Bestevaer 49ST",
    builder: "KM Yachtbuilders (Netherlands)",
    years: "2009–present",
    category: "Aluminium expedition",
    price: "$550k–$850k",
  },
  {
    id: "alliage45",
    name: "Alliage 45",
    builder: "Alliage Yachting (France)",
    years: "~2000s (defunct 2011)",
    category: "Aluminium expedition",
    price: "$280k–$450k",
  },
  {
    id: "sirius40ds",
    name: "Sirius 40 DS",
    builder: "Sirius-Werft (Germany)",
    years: "2015–present",
    category: "Deck-saloon & pilothouse",
    price: "$450k–$800k",
  },
  {
    id: "pogo1250",
    name: "Pogo 12.50",
    builder: "Pogo Structures (France)",
    years: "2010–2022",
    category: "Aft-cockpit bluewater",
    price: "$150k–$450k",
  },
  {
    id: "enksail49",
    name: "Enksail Orion 49",
    builder: "Gebr. van Enkhuizen (Netherlands)",
    years: "2017–present",
    category: "Aluminium expedition",
    price: "$650k–$900k",
  },
  {
    id: "passport545",
    name: "Passport Vista 545",
    builder: "Passport Yachts (USA/China)",
    years: "2012–present",
    category: "Centre-cockpit cruiser",
    price: "$690k–$850k",
  },
  {
    id: "tayana58",
    name: "Tayana 58 Deck Salon",
    builder: "Ta Yang (Taiwan)",
    years: "~2000–present",
    category: "Deck-saloon & pilothouse",
    price: "$300k–$500k",
  },
  {
    id: "farr56",
    name: "Farr 56 Pilot House",
    builder: "BSI Marine (Sweden)",
    years: "2000–c.2008",
    category: "Deck-saloon & pilothouse",
    price: "$400k–$650k",
  },
  {
    id: "amel54",
    name: "Amel 54",
    builder: "Chantiers Amel (France)",
    years: "2005–2011",
    category: "Centre-cockpit cruiser",
    price: "$350k–$600k",
  },
  {
    id: "hylas54",
    name: "Hylas 54",
    builder: "Hylas Yachts (Taiwan)",
    years: "1999–2010",
    category: "Centre-cockpit cruiser",
    price: "$350k–$650k",
  },
  {
    id: "outbound52",
    name: "Outbound 52",
    builder: "Outbound Yachts (USA/China)",
    years: "2008–present",
    category: "Centre-cockpit cruiser",
    price: "$650k–$997k",
  },
  {
    id: "garcia52",
    name: "Garcia Exploration 52",
    builder: "Garcia Yachts (France)",
    years: "2016–present",
    category: "Aluminium expedition",
    price: "$1.0M–$2.0M",
  },
  {
    id: "boreal52",
    name: "Boréal 52",
    builder: "Boréal Yachts (France)",
    years: "2014–present",
    category: "Aluminium expedition",
    price: "$750k–$1.0M",
  },
  {
    id: "boreal",
    name: "Boréal 47.2",
    builder: "Boréal Yachts (France)",
    years: "2020–present",
    category: "Aluminium expedition",
    price: "$590k–$930k",
  },
  {
    id: "garcia",
    name: "Garcia Exploration 45",
    builder: "Garcia Yachts (France)",
    years: "2014–present",
    category: "Aluminium expedition",
    price: "$700k–$1.2M",
  },
  {
    id: "ovni490",
    name: "Ovni 490",
    builder: "Alubat (France)",
    years: "2024–present",
    category: "Aluminium expedition",
    price: "~$1.07M+",
  },
  {
    id: "outbound",
    name: "Outbound 46",
    builder: "Outbound Yachts (USA/China)",
    years: "2002–present",
    category: "Aft-cockpit bluewater",
    price: "$339k–$895k",
  },
  {
    id: "ovni450",
    name: "Ovni 450",
    builder: "Alubat (France)",
    years: "2018–present",
    category: "Aluminium expedition",
    price: "$400k–$650k",
  },
  {
    id: "allures519",
    name: "Allures 51.9",
    builder: "Allures Yachting (France)",
    years: "2021–present",
    category: "Aluminium expedition",
    price: "$1.05M–$1.55M",
  },
  {
    id: "hr44",
    name: "Hallberg-Rassy 44",
    builder: "Hallberg-Rassy (Sweden)",
    years: "2017–present",
    category: "Centre-cockpit cruiser",
    price: "$800k–$960k",
  },
  {
    id: "allures",
    name: "Allures 45.9",
    builder: "Allures Yachting (France)",
    years: "2018–present",
    category: "Aluminium expedition",
    price: "$590k–$1.0M",
  },
  {
    id: "amel",
    name: "Amel 50",
    builder: "Chantiers Amel (France)",
    years: "2017–~2021",
    category: "Centre-cockpit cruiser",
    price: "$900k–$1.75M",
  },
  {
    id: "wauquiez",
    name: "Wauquiez Pilot Saloon 48",
    builder: "Wauquiez (France)",
    years: "2016–present",
    category: "Deck-saloon & pilothouse",
    price: "$140k–$950k",
  },
  {
    id: "hr43",
    name: "Hallberg-Rassy 43 Mk III",
    builder: "Hallberg-Rassy (Sweden)",
    years: "2013–2016",
    category: "Centre-cockpit cruiser",
    price: "$450k–$650k",
  },
  {
    id: "oyster",
    name: "Oyster 495",
    builder: "Oyster Yachts (UK)",
    years: "2021–present",
    category: "Centre-cockpit cruiser",
    price: "$1.5M–$2M",
  },
  {
    id: "kraken",
    name: "Kraken 44",
    builder: "Kraken Yachts",
    years: "2025–present",
    category: "Aft-cockpit bluewater",
    price: "~$920k–$950k",
  },
  {
    id: "discovery55",
    name: "Discovery 55",
    builder: "Discovery Yachts (UK)",
    years: "2000–2021",
    category: "Centre-cockpit cruiser",
    price: "$475k–$870k",
  },
  {
    id: "contest50cs",
    name: "Contest 50CS",
    builder: "Contest Yachts / Conyplex (NL)",
    years: "2006–2021",
    category: "Centre-cockpit cruiser",
    price: "$380k–$650k",
  },
  {
    id: "hylas48",
    name: "Hylas 48 (H48)",
    builder: "Hylas Yachts (Taiwan)",
    years: "2018–present",
    category: "Centre-cockpit cruiser",
    price: "$350k–$700k",
  },
  {
    id: "tayana48",
    name: "Tayana 48 Deck Salon",
    builder: "Ta Yang (Taiwan)",
    years: "~2002–present",
    category: "Deck-saloon & pilothouse",
    price: "$250k–$675k",
  },
  {
    id: "moodyds54",
    name: "Moody Decksaloon 54",
    builder: "Moody / HanseYachts (Germany)",
    years: "2012–present",
    category: "Deck-saloon & pilothouse",
    price: "$650k–$950k",
  },
  {
    id: "najad460",
    name: "Najad 460",
    builder: "Najad (Sweden)",
    years: "~2000–2014",
    category: "Centre-cockpit cruiser",
    price: "$115k–$410k",
  },
  {
    id: "deerfoot50",
    name: "Deerfoot 50",
    builder: "Deerfoot Yachts (Steve & Linda Dashew, USA/NZ)",
    years: "~1981–1989",
    category: "Aluminium expedition",
    price: "$200k–$500k",
  },
  {
    id: "amel55",
    name: "Amel 55",
    builder: "Chantiers Amel (France)",
    years: "2011–2018",
    category: "Centre-cockpit cruiser",
    price: "$650k–$1.2M",
  },
  {
    id: "amel60",
    name: "Amel 60",
    builder: "Chantiers Amel (France)",
    years: "2019–present",
    category: "Centre-cockpit cruiser",
    price: "$1.5M–$2.4M",
  },
  {
    id: "oyster485",
    name: "Oyster 485",
    builder: "Oyster Marine (UK)",
    years: "1996–2004",
    category: "Centre-cockpit cruiser",
    price: "$220k–$450k",
  },
  {
    id: "oyster53",
    name: "Oyster 53",
    builder: "Oyster Marine (UK)",
    years: "2003–2008",
    category: "Centre-cockpit cruiser",
    price: "$450k–$800k",
  },
  {
    id: "oyster54",
    name: "Oyster 54",
    builder: "Oyster Marine (UK)",
    years: "2008–2014",
    category: "Centre-cockpit cruiser",
    price: "$650k–$1.2M",
  },
];

// args may arrive as a live object or (depending on the launcher) a JSON string.
let ARGS = args;
if (typeof ARGS === "string") {
  try {
    ARGS = JSON.parse(ARGS);
  } catch {
    ARGS = undefined;
  }
}
const MODELS = {
  research: "haiku",
  verify: "sonnet",
  score: "sonnet",
  ...(ARGS?.models || {}),
};
const boats = ARGS?.boats?.length
  ? ARGS.boats
  : ARGS?.ids?.length
    ? CATALOG.filter((b) => ARGS.ids.includes(b.id))
    : null;
if (!boats?.length) {
  throw new Error(
    "Pass args.ids (subset of CATALOG) or args.boats (full {id,name,builder,years,category,price} objects).",
  );
}

const FACT_KEYS = [
  "stability.avs",
  "stability.stix",
  "stability.ce_category",
  "stability.ballast_type",
  "cold.heating",
  "cold.insulation",
  "cold.keel_stepped_mast",
  "cold.watertight_bulkheads",
  "cold.inside_helm",
  "tropical.ventilation",
  "tropical.shade",
  "tropical.refrigeration",
  "tropical.watermaker",
  "tropical.airflow",
  "self_steering.windvane_option",
  "self_steering.autopilot",
  "self_steering.electrical_autonomy",
  "ergonomics.transom",
  "ergonomics.freeboard",
  "ergonomics.side_decks",
  "ergonomics.mob_recovery",
  "heavy_weather.storm_report",
  "heavy_weather.cutter_staysail",
  "refit.standing_rigging_age",
  "refit.known_issues",
  "parts.availability",
].join(", ");

const SOURCE = {
  type: "object",
  required: ["title", "url"],
  properties: {
    title: { type: "string" },
    url: { type: "string" },
    quote: { type: "string" },
  },
};
const RESEARCH_SCHEMA = {
  type: "object",
  required: [
    "id",
    "facts",
    "sentiment",
    "refit_items",
    "provisioning_specific",
    "gaps",
    "overall_confidence",
  ],
  properties: {
    id: { type: "string" },
    facts: {
      type: "array",
      items: {
        type: "object",
        required: ["key", "value", "confidence", "sources"],
        properties: {
          key: { type: "string" },
          value: { type: "string" },
          confidence: { type: "number" },
          sources: { type: "array", items: SOURCE },
        },
      },
    },
    sentiment: {
      type: "object",
      required: ["praise", "complaints", "known_issues", "forums"],
      properties: {
        praise: { type: "array", items: { type: "string" } },
        complaints: { type: "array", items: { type: "string" } },
        known_issues: { type: "array", items: { type: "string" } },
        forums: { type: "array", items: SOURCE },
      },
    },
    refit_items: {
      type: "array",
      items: {
        type: "object",
        required: [
          "system",
          "action",
          "cost_low_usd",
          "cost_high_usd",
          "confidence",
        ],
        properties: {
          system: { type: "string" },
          action: { type: "string" },
          age_relevant: { type: "boolean" },
          cost_low_usd: { type: "number" },
          cost_high_usd: { type: "number" },
          confidence: { type: "number" },
          sources: { type: "array", items: SOURCE },
        },
      },
    },
    provisioning_specific: {
      type: "array",
      items: {
        type: "object",
        required: ["item", "category", "why"],
        properties: {
          item: { type: "string" },
          category: { type: "string" },
          why: { type: "string" },
        },
      },
    },
    gaps: { type: "array", items: { type: "string" } },
    overall_confidence: { type: "number" },
  },
};
const VERIFY_SCHEMA = {
  type: "object",
  required: [
    "id",
    "cleaned_facts",
    "removed",
    "fabrication_flags",
    "verified_confidence",
    "verdict",
  ],
  properties: {
    id: { type: "string" },
    cleaned_facts: {
      type: "array",
      items: {
        type: "object",
        required: ["key", "value", "confidence", "sources"],
        properties: {
          key: { type: "string" },
          value: { type: "string" },
          confidence: { type: "number" },
          sources: { type: "array", items: SOURCE },
        },
      },
    },
    removed: {
      type: "array",
      items: {
        type: "object",
        required: ["key", "reason"],
        properties: { key: { type: "string" }, reason: { type: "string" } },
      },
    },
    fabrication_flags: { type: "array", items: { type: "string" } },
    verified_confidence: { type: "number" },
    verdict: { type: "string" },
  },
};
const SCORE = (extra) => ({
  type: "object",
  required: ["value", "confidence", "rationale"],
  properties: {
    value: { type: "number" },
    confidence: { type: "number" },
    rationale: { type: "string" },
    ...extra,
  },
});
const SCORE_SCHEMA = {
  type: "object",
  required: [
    "id",
    "cold_score",
    "tropic_score",
    "stability_score",
    "storm_verdict",
    "refit_projection",
    "provisioning_specific",
  ],
  properties: {
    id: { type: "string" },
    cold_score: SCORE({ basis: { type: "string" } }),
    tropic_score: SCORE({ basis: { type: "string" } }),
    stability_score: SCORE({ basis: { type: "string" } }),
    storm_verdict: {
      type: "object",
      required: ["text", "confidence", "cited"],
      properties: {
        text: { type: "string" },
        confidence: { type: "number" },
        cited: { type: "boolean" },
      },
    },
    refit_projection: {
      type: "object",
      required: ["total_low_usd", "total_high_usd", "by_item", "assumptions"],
      properties: {
        total_low_usd: { type: "number" },
        total_high_usd: { type: "number" },
        by_item: {
          type: "array",
          items: {
            type: "object",
            required: ["system", "low", "high", "note"],
            properties: {
              system: { type: "string" },
              low: { type: "number" },
              high: { type: "number" },
              note: { type: "string" },
            },
          },
        },
        assumptions: { type: "string" },
      },
    },
    provisioning_specific: {
      type: "array",
      items: {
        type: "object",
        required: ["item", "category", "why"],
        properties: {
          item: { type: "string" },
          category: { type: "string" },
          why: { type: "string" },
        },
      },
    },
  },
};

// Keep in sync with research/RUBRICS.md
const RUBRICS = `
COLD (0-100), weighted over SOURCED inputs only, re-normalise over what's known, confidence = coverage:
 heating present 25 · insulation 15 · inside/sheltered helm 20 · keel-stepped mast 10 · watertight bulkhead 10 · hard cockpit shelter 10 · cold tankage 10.
TROPIC (0-100): opening hatches/ventilation 20 · shade 15 · refrigeration 15 · watermaker 15 · airflow 15 · light-air SA/D 20.
STABILITY (0-100): AVS>=130 ->90-100; 120-129 ->75-89; 110-119 ->55-74; <110 -> <=45. Only CE: A->80 B->60 C->40. Neither -> value 0, basis "not published", confidence 0.
STORM VERDICT: one honest paragraph ONLY from cited heavy-weather reports; if none, text="insufficient sourced data", cited=false. Never assert unsupported seamanship.
REFIT "buy today -> passage-ready" USD ranges, age-based vs service intervals (standing rigging ~15-20yr $8k-30k; running rig ~8-10yr $2k-6k; sails ~8-12yr $15k-45k; engine repower ~25-30yr/high hrs $25k-70k; electronics ~10-15yr $8k-30k; batteries/solar ~6-10yr $5k-20k; ground tackle $3k-10k; seacocks ~25yr $3k-9k; liferaft/safety $4k-12k; canvas ~10-15yr $4k-12k; watermaker if absent $6k-15k). Always a RANGE, labelled our estimate, age logic stated.`;

const researchPrompt = (
  b,
) => `You are a meticulous bluewater-yacht researcher. Research the ${b.name} (${b.builder}, ${b.years}, ${b.category}, ~${b.price}).
Use the web: load WebSearch and WebFetch via ToolSearch (query "select:WebSearch,WebFetch") and Ref docs if useful. Search builder pages, SailboatData, Practical Sailor, Yachting World / SAIL / Cruising World reviews, cruisersforum.com, forums.ybw.com, YouTube owner channels, brokerage listings.
Collect these fact keys (omit any you cannot source, and list them in gaps): ${FACT_KEYS}.
RULES: every fact needs a real source URL (no invented URLs, numbers, or quotes). Confidence 0-1 (>=0.85 spec or 2+ sources; 0.6-0.84 one credible source; 0.3-0.59 anecdotal/inferred-say-so; <0.3 = gap). Also gather owner sentiment (praise/complaints/known_issues/forums), age-relevant refit_items with USD cost ranges + sources, and boat-specific provisioning spares. Return ONLY the structured object.`;

const verifyPrompt = (b, research) =>
  `Adversarially verify this researched record for the ${b.name}. For EACH fact, confirm the source URL plausibly supports the claim (spot-check with WebFetch via ToolSearch where doubtful). Demote any fact lacking a credible source, or whose number looks fabricated/implausible, into "removed" with a reason and drop it from cleaned_facts. Flag anything invented (too-precise AVS with no source, a generated-looking quote, a dead/irrelevant URL). Recompute verified_confidence (coverage- and source-weighted). Default to skepticism: if uncertain, remove. Record:\n${JSON.stringify(research)}`;

const scorePrompt = (
  b,
  acc,
) => `Apply OUR scoring rubrics to the VERIFIED facts for the ${b.name}. Use ONLY the verified cleaned_facts (cited). Where an input is missing, re-normalise and lower confidence — never assume a feature is present.
RUBRICS:${RUBRICS}
Verified facts (authoritative — cited):\n${JSON.stringify(acc.verify)}
Original research context (sentiment + draft refit_items, for refit/provisioning detail only — do NOT treat as verified facts):\n${JSON.stringify({ refit_items: acc.research?.refit_items, sentiment: acc.research?.sentiment, gaps: acc.research?.gaps })}
Return the structured scores, storm verdict, refit projection (itemised low/high + assumptions), and any boat-specific provisioning you can justify.`;

log(
  `Researching ${boats.length} boats · models research=${MODELS.research} verify=${MODELS.verify} score=${MODELS.score}`,
);
phase("Research");
// Each stage MERGES into an accumulator so the final record keeps the cited
// research facts/sentiment + verify cleaned_facts + scores together — a pipeline
// otherwise only returns the last stage's output and the citations are lost.
const results = await pipeline(
  boats,
  (b) =>
    agent(researchPrompt(b), {
      label: `research:${b.id}`,
      phase: "Research",
      agentType: "general-purpose",
      model: MODELS.research,
      schema: RESEARCH_SCHEMA,
    }).then((research) => ({ research })),
  (acc, b) =>
    agent(verifyPrompt(b, acc.research), {
      label: `verify:${b.id}`,
      phase: "Verify",
      agentType: "general-purpose",
      model: MODELS.verify,
      schema: VERIFY_SCHEMA,
    }).then((verify) => ({ ...acc, verify })),
  (acc, b) =>
    agent(scorePrompt(b, acc), {
      label: `score:${b.id}`,
      phase: "Score",
      model: MODELS.score,
      schema: SCORE_SCHEMA,
    }).then((scores) => ({ ...acc, scores })),
);

const merged = boats.map((b, i) =>
  results[i]
    ? { id: b.id, name: b.name, ...results[i] }
    : { id: b.id, name: b.name, failed: true },
);
log(
  `Done · output tokens spent this turn: ${Math.round(budget.spent() / 1000)}k`,
);
return {
  count: merged.length,
  models: MODELS,
  tokens_spent_k: Math.round(budget.spent() / 1000),
  boats: merged,
};
