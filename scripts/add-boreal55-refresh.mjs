// One-shot data edit: refresh Garcia Exploration 52 + Boréal 52 pricing/years
// from cited 2026 market research, and add the Boréal 55 as a new record.
// Run: node scripts/add-boreal55-refresh.mjs
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../data/boats.json", import.meta.url);
const boats = JSON.parse(readFileSync(path, "utf8"));
const byId = (id) => boats.find((b) => b.id === id);

// ---------------------------------------------------------------------------
// 1) GARCIA EXPLORATION 52 — honest reprice (used floor is ~$1.5M, not $1.0M)
// ---------------------------------------------------------------------------
const g = byId("garcia52");
g.years = "2015–present";
g.engine = "Volvo D3-110"; // dropped unverified "(150 opt)"
g.priceText = "$1.5M–$2.0M (used)";
g.priceNew =
  "New POA — base ex-shipyard ~€830k (2020); cruise-ready orders ~€1.3–1.8M";
g.priceUsed = "Used ~$1.5M–$2.0M (median ~$1.75M)";
g.priceMinUSD = 1500000;
g.priceMaxUSD = 2050000;
g.budgetText =
  "Well over budget — even the cheapest used hulls now ask ~$1.5M (a 2021 ex-Antarctica boat at €1.35M ex-VAT ≈ $1.56M), and outfitted examples reach $2M+. The in-budget Garcia is the Exploration 45.";
g.priceExamples = [
  "2021 'HEBE' (ex-Antarctica) — €1,350,000 ex-VAT (~$1.56M, GL Yachting)",
  "2018/2019 used — ~$1.56M–$2.0M (Swiftsure / YachtWorld)",
  "12-month median asking ~$1.75M–$2.0M",
  "New base ex-shipyard ~€830k (2020); cruise-ready ~€1.3–1.8M",
];
g.scores.budget = 1;
g.cons[0] =
  "Price — well over the $1M budget (used ~$1.5–2.0M); the single biggest disqualifier here.";
g.own.risks[0] = "Price — well over the $1M budget (the biggest disqualifier here)";

// ---------------------------------------------------------------------------
// 2) BORÉAL 52 — pricing band confirmed in/near budget; mark supersession + fix
// ---------------------------------------------------------------------------
const b52 = byId("boreal52");
b52.years = "2014–c.2024 (succeeded by the Boréal 56)";
b52.airDraft = "~23 m / 75' (est.)"; // no published air-draft figure found
b52.priceExamples = [
  "2020 'BRAVO' — €885,000 +VAT (~$1.0M asking, Berthon)",
  "~2014–16 hull (Nanni 85) — €750,000 (~$863k, France)",
  "Launch base €685k ex-VAT (2015)",
];

// ---------------------------------------------------------------------------
// 3) BORÉAL 55 — new record (built from cited research; honest gaps flagged)
// ---------------------------------------------------------------------------
const boreal55 = {
  id: "boreal55",
  name: "Boréal 55",
  builder: "Boréal Yachts · France",
  designer: "Jean-François Delvoye",
  color: "#356a86",
  years: "2014–c.2023 · OC from ~2019 · succeeded by the Boréal 56",
  material: "Aluminium",
  category: "Aluminium expedition",
  loa: "53'10\" (16.40 m)",
  loaN: 16.4,
  lwl: "45'4\" (13.82 m)",
  beam: "15'4\" (4.65 m)",
  beamFt: 15.26,
  lwlFt: 45.4,
  dispLb: 36376,
  draftMin: "3'9\" (1.14 m up)",
  draftMinN: 1.14,
  draftMax: "10'3\" (3.13 m down)",
  displacement: "16,500 kg / 36,376 lb (light); ~17,800 kg loaded (sources vary)",
  ballast: "4,800 kg lead",
  ballastRatio: "~29%",
  sailArea: "130 m² / 1,399 ft² (61 main + 69 genoa + 26 staysail)",
  sad: "~20",
  dl: "~175",
  airDraft: "~24 m / 79' (est.)",
  engine: "Volvo D2-75 (Nanni 85 / 100 hp opt)",
  drive: "Shaft",
  cabins: "3–4 cabins / 2 heads",
  keel: "Lifting ballasted NACA centreboard in a flat keel-stub (dries out upright); integral internal lead ballast — no bolt-on keel · single NACA rudder (+ balancing daggerboards on the 55 OC)",
  cockpit:
    "Permanent welded aluminium doghouse with wraparound glazing + watertight door (standard); the later '55 OC' opens the cockpit and stern for warm-climate sailing",
  cockpitType: "Aft + hard doghouse (OC: open cockpit)",
  bestFor:
    "The couple who want the welded-doghouse expedition formula of the Boréal 52 with a little more length and stern volume — though it's now a rare, discontinued model (≈3 open-cockpit hulls built) superseded by the Boréal 56.",
  protectionText:
    "A permanent welded alloy doghouse with wraparound glazing and a solid watertight \"bye-bye weather\" door gives a sheltered inside helm/nav station — Attainable Adventure Cruising called it \"pure luxury in the cold and wet… one of the best features ever for high latitudes.\" The later \"55 OC\" (Open Cockpit) trades some of that enclosure for an open, warm-climate cockpit.",
  rig: "Cutter (masthead) — fully-battened main + furling genoa + self-tacking staysail on an inner forestay; deck-stepped aluminium mast (Seldén).",
  handlingText:
    "Short-handed focus shared with the 52 — the cutter rig splits the sail plan into manageable sails, lines led aft, twin wheels, optional electric winches; the 80°N boat 'Bushpoint' adds twin autopilots and bow/stern thrusters. Yachting World on the same hull: \"surprisingly nimble… a very easy boat to handle.\"",
  engineWorkshop:
    "Engine centralised over the keel with access via the companionway/aft (good, not a walk-in room); a large aft lazarette swallows expedition gear — the standard 55 even stowed a dive compressor there.",
  systems:
    "12V + 220V circuits, shore power and charger; the heavily-outfitted 55 OC 'Bushpoint' carries ~800 Ah lithium, 1,100 W solar, hydro- and wind-generators, a watermaker, and Eberspächer + Refleks heating — illustrating how owners spec these for self-sufficiency.",
  storageText:
    "Strong for the size — a big aft lazarette, a forward sail locker, gas-bottle stowage and the deep bilges of a centreboarder; up to ~1,400 L fuel and 1,470 L water give long autonomy.",
  fuel: "879 L / 232 gal (up to ~1,400 opt)",
  fuelN: 879,
  water: "1,470 L / 388 gal",
  waterN: 1470,
  rangeText:
    "Big tankage — up to ~1,400 L fuel and 1,470 L water; ~1,000–1,200+ nm under power (estimate).",
  accommodation:
    "Deck-saloon layout with the signature near-360° doghouse, 3–4 cabins / 2 heads. The welded doghouse is a safe, warm indoor space; the lifting ballasted centreboard (1.14 m board-up) lets her take the ground for beach access. The '55 OC' opens the cockpit and adds a fold-down bathing platform for warm-climate living.",
  highLatText:
    "Excellent and proven — insulated alloy hull, a heated enclosed doghouse, double-glazed windows for condensation control, a Refleks/Eberspächer heating provision, watertight bulkheads and a dry-out keel. The 55 OC 'Bushpoint' reached 80°N at Svalbard in 2022 after cruising Ireland, the Hebrides, the Faroes and Norway.",
  tropicalText:
    "Capable — shoal 1.14 m board-up draft for reefs and lagoons, big water tankage and good ventilation; the '55 OC' open-cockpit variant was created specifically for warm-climate, sun-friendly cruising. As with all bare-alloy boats, the dark doghouse and topsides need awnings/ventilation in the heat.",
  priceText: "~$1.3M–$1.4M (used OC)",
  priceNew:
    "New POA (never published) — bracketed by the 52 (€685k, 2015) and the successor 56 (€1.45M ex-VAT)",
  priceUsed:
    "Used 55 OC ~€1.2M–€1.29M (~$1.3–1.4M); very few built, thin market",
  priceMinUSD: 1300000,
  priceMaxUSD: 1400000,
  budget: "over",
  budgetN: 3,
  budgetText:
    "Over budget and rare — only a handful built (≈3 of the open-cockpit '55 OC'); used examples ask €1.2–1.29M (~$1.3–1.4M). For a couple at ~$1M the Boréal 47.2 or a used 52 is the realistic in-budget Boréal.",
  priceExamples: [
    "2021 'Bushpoint' (55 OC, hull #3, →80°N) — €1,290,000 (~$1.39M, Berthon)",
    "2020 Boréal 55 OC — €1,200,000 (~$1.3M, boat24)",
    "New POA — bracketed by the 52 (€685k '15) & the 56 (€1.45M ex-VAT)",
  ],
  scores: {
    protection: 5,
    handling: 4,
    dogs: 4.5,
    workshop: 4,
    storage: 5,
    tankage: 5,
    highlat: 5,
    tropical: 4,
    budget: 2,
  },
  tags: [
    "Hard doghouse",
    "Aluminium centreboard",
    "80°N proven",
    "Discontinued → 56",
  ],
  fun: [
    "'Bushpoint' (55 OC, hull #3) sailed to 80°N at Svalbard in 2022 — about as far north as a cruising yacht can practically go.",
    "Boréal took seven orders for the 55 Open Cockpit — and every one was switched to the new Boréal 56 before the 55 OC could become a series.",
    "The standard 55's aft locker was sized to stow a dive compressor — a nod to its go-anywhere expedition brief.",
  ],
  notable:
    "Maiden 55 'Eala Bhan' was delivered in 2016 (her homecoming voyage documented by Attainable Adventure Cruising); the open-cockpit '55 OC' Bushpoint reached 80°N at Svalbard in 2022. Only about three 55 OCs were built before the model was superseded by the Boréal 56.",
  sources: [
    {
      name: "Boréal 55 — Boat-Specs",
      url: "https://www.boat-specs.com/sailing/sailboats/boreal/boreal-55",
    },
    {
      name: "Boréal 55 — SailboatData",
      url: "https://sailboatdata.com/sailboat/boreal-55/",
    },
    {
      name: "Boréal 55 OC review — No Frills Sailing",
      url: "https://no-frills-sailing.com/boreal-55oc-sailing-yacht/",
    },
    {
      name: "'Bushpoint' 55 OC spec — Berthon Scandinavia",
      url: "https://berthonscandinavia.se/en/sold-yachts/boreal-55-oc/",
    },
    {
      name: "'Eala Bhan' maiden voyage — Attainable Adventure Cruising",
      url: "https://www.morganscloud.com/2016/01/21/eala-bhan-sails-home-the-maiden-voyage-of-the-boreal-55/",
    },
    {
      name: "Boréal 56 review (supersession) — Yachting World",
      url: "https://www.yachtingworld.com/reviews/boat-tests/boreal-56-review-aluminium-explorer-yacht-with-a-scow-influenced-shape",
    },
  ],
  youtube: [
    {
      name: "Bushpoint Sailing — channel",
      url: "https://www.youtube.com/@bushpoint",
      note: "55 OC owners, Arctic to 80°N",
    },
    {
      name: "Launch of Bushpoint (Boréal 55 OC) — Ep 1",
      url: "https://www.youtube.com/watch?v=xIsyjNfunCk",
      note: "Splash / launch",
    },
    {
      name: "Beaching the boat — Ep 2",
      url: "https://www.youtube.com/watch?v=nWJUPv0I7kM",
      note: "Demonstrates dry-out / beaching",
    },
    {
      name: "Boat tour of Bushpoint — Ep 3",
      url: "https://www.youtube.com/watch?v=6sBVpBP708M",
      note: "Interior + doghouse tour",
    },
    {
      name: "Landfall Svalbard (Spitsbergen) — Ep 41",
      url: "https://www.youtube.com/watch?v=I5w-qMGLXZY",
      note: "Arctic high-latitude sailing",
    },
  ],
  pros: [
    "The welded alloy doghouse gives a sheltered, heated inside helm/nav — outstanding all-weather protection for a short-handed couple.",
    "Genuinely proven in the high latitudes: a 55 OC reached 80°N at Svalbard.",
    "Lifting ballasted centreboard — 1.14 m board-up draft for gunkholing/beaching, 3.13 m down for upwind grip.",
    "Big tankage (up to ~1,400 L fuel / 1,470 L water) for long-range autonomy.",
    "Aluminium hull tolerates ice, grounding and remote-coast abuse; dry-out keel for beach inspection.",
    "Easily-handled cutter rig with the option of heavy automation (twin pilots, thrusters).",
  ],
  cons: [
    "Discontinued — superseded by the Boréal 56; only ~3 open-cockpit 55s were built, so the used market is tiny.",
    "Expensive and rare: used 55 OCs ask €1.2–1.29M (~$1.3–1.4M), well over a $1M budget; no published new price.",
    "The standard 55's cockpit is small (\"a little bit hardcore\") — exactly why the open-cockpit OC was created.",
    "Bare-aluminium discipline (anodes, antifouling, stray-current control) is non-negotiable.",
    "Spec databases conflate the 52 and 55 (shared hull) — verify each individual hull's exact build and displacement.",
    "Versus the 52 it adds relatively little; the bigger real step up is the successor Boréal 56 (taller rig, more ballast, scow bow).",
  ],
  awards: [],
  endorsements: [
    {
      who: "Attainable Adventure Cruising (John Harries)",
      note: "On the 55's doghouse: \"pure luxury in the cold and wet, that makes you glad to be 'in the doghouse' — one of the best features ever for high latitudes.\"",
      url: "https://www.morganscloud.com/2016/01/21/eala-bhan-sails-home-the-maiden-voyage-of-the-boreal-55/",
    },
    {
      who: "Yachting World",
      note: "On Boréal generally: \"not simply aluminium tanks for off-piste cruising… a practical sailing cockpit and enough focus on performance and handling to be a proper sailing yacht.\"",
      url: "https://www.yachtingworld.com/reviews/boat-tests/boreal-56-review-aluminium-explorer-yacht-with-a-scow-influenced-shape",
    },
  ],
  badge: "80°N proven",
  own: {
    mastStep: "Deck-stepped",
    keelRudder:
      "Integral aluminium keel-stub with internal lead ballast and a lifting NACA centreboard (no bolt-on keel) · single NACA spade rudder (balancing daggerboards on the 55 OC)",
    complexity:
      "Moderate — the doghouse boat is deliberately robust/simple, but expedition examples like 'Bushpoint' layer on lithium, multiple charging sources, a watermaker and redundant heating.",
    maintain:
      "Good for a hands-on owner — accessible systems and an alloy hull any competent welder can repair; aluminium electrolysis/anode management demands discipline.",
    partsText:
      "Active builder (now up to the 56/70), but the 55 is out of production and only a few were built — boat-specific/alloy support routes back through France. Mainstream marine gear is easy worldwide.",
    problems:
      "No widespread defect pattern; the main themes are aluminium galvanic/electrolysis management and the thin parts/service footprint outside Europe, plus the small-cockpit critique that led to the OC.",
    sentiment:
      "Strongly positive — owners and reviewers praise the build, the doghouse and the seaworthiness; the 80°N voyage is the headline credential.",
    communities: [
      {
        name: "Bushpoint Sailing (YouTube)",
        url: "https://www.youtube.com/@bushpoint",
      },
      {
        name: "AAC — Boréal coverage",
        url: "https://www.morganscloud.com/2016/01/21/eala-bhan-sails-home-the-maiden-voyage-of-the-boreal-55/",
      },
      {
        name: "Cruisers Forum — Boréal",
        url: "https://www.cruisersforum.com/forums/f47/boreal-sailboats-165018.html",
      },
    ],
    risks: [
      "Discontinued/rare — tiny used market, parts route through France",
      "Price well over a $1M budget (used ~$1.3–1.4M)",
      "Aluminium electrolysis/anode discipline required",
      "Standard 55's small cockpit; verify variant (55 vs 55 OC)",
    ],
    scores: { maintain: 4, simplicity: 4, parts: 2, community: 3 },
  },
  engineHp: 75,
};

// Insert the new record right after boreal52 so the Boréals group together.
const at = boats.findIndex((b) => b.id === "boreal52");
boats.splice(at + 1, 0, boreal55);

writeFileSync(path, JSON.stringify(boats, null, 2) + "\n");
console.log(
  `OK — fleet now ${boats.length} boats; boreal55 inserted at index ${at + 1}.`,
);
