// Add the Boréal 56 (current scow-bowed flagship that replaced the 52/55).
// Idempotent: skips if boreal56 already present. Run: node scripts/add-boreal56.mjs
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../data/boats.json", import.meta.url);
const boats = JSON.parse(readFileSync(path, "utf8"));
if (boats.some((b) => b.id === "boreal56")) {
  console.log("boreal56 already present — nothing to do.");
  process.exit(0);
}

const boreal56 = {
  id: "boreal56",
  name: "Boréal 56",
  builder: "Boréal Yachts · France",
  designer: "Jean-François Delvoye",
  color: "#2a7396",
  years: "2025–present (replaced the 52 & 55)",
  material: "Aluminium",
  category: "Aluminium expedition",
  loa: "56'2\" (17.12 m)",
  loaN: 17.12,
  lwl: "47'6\" (14.47 m)",
  beam: "16'2\" (4.94 m)",
  beamFt: 16.21,
  lwlFt: 47.5,
  dispLb: 45194,
  draftMin: "3'11\" (1.20 m up)",
  draftMinN: 1.2,
  draftMax: "10'5\" (3.18 m down)",
  displacement: "20,500 kg / 45,194 lb (light); ~24,700 kg loaded",
  ballast: "6,600 kg lead",
  ballastRatio: "~32%",
  sailArea: "143 m² / 1,540 ft² (74 main + 69 genoa + 49 staysail)",
  sad: "~18.9",
  dl: "~189",
  airDraft: "~23.2 m / 76'",
  engine: "Yanmar 4JH80 (80 hp; 110 hp opt)",
  drive: "Shaft",
  cabins: "3 cabins / 2 heads (4th opt)",
  keel: "Lifting NACA centreboard in a long welded keel-trunk with internal lead ballast + a grounding plate (dries out upright) · single aluminium NACA rudder flanked by two lifting daggerboards",
  cockpit:
    "Permanent welded aluminium doghouse (watertight \"closes-like-a-safe\" door, two-person watch seat + oilskin locker) with the sailing cockpit separated from an enlarged guest cockpit and a clear run aft to a fold-down bathing platform",
  cockpitType: "Aft + hard doghouse",
  bestFor:
    "The well-funded couple who want Boréal's go-anywhere aluminium expedition formula in its newest, roomiest and fastest form — the brand-new scow-bowed flagship that replaced the 52 and 55.",
  protectionText:
    "Boréal's signature welded alloy doghouse — a watertight \"closes-like-a-safe\" door, a two-person watch seat and an oilskin drying locker — now paired with a sailing cockpit separated from an enlarged guest cockpit (a layout proven on the 47.2). A sheltered all-weather inside watch position is the brand's defining high-latitude feature.",
  rig: "Fractional sloop convertible to cutter (optional furling staysail on running checkstays); deck-stepped anodised aluminium mast, twin swept spreaders, rigid vang; main + genoa + spinnaker/gennaker options.",
  handlingText:
    "Short-handed by design — most lines led to a central electric Antal winch, twin steering columns, a single-line centreboard hoist and optional twin autopilots. The taller fractional rig and scow bow make it faster and drier than the 52/55: on test it made 7.5 kn upwind in 20 kn and surfed to 11.5 kn. Yachting World: \"not the most exciting to helm, but it'll outperform most others in this voyager sector.\"",
  engineWorkshop:
    "A workbench with heavy-duty tool drawers and a removable vice sits in the passage to the forward cabin, with an optional technical/workshop cabin to starboard aft; engine access is from both aft cabins and the companionway.",
  systems:
    "12V + 220V circuits; central electric winch, all-LED nav lights, a 40 L calorifier and 4× electric + 1 manual bilge pump; optional Refleks diesel stove or Eberspächer heating, plus nav/autopilot packages — most polar/expedition kit is optional and adds materially to the price.",
  storageText:
    "Exceptional — over 12 m³ of stowage across fore and aft peaks and deck lockers, a large rear cargo hold with two access panels, a dedicated twin gas-bottle locker and a forward sail locker.",
  fuel: "1,150 L / 304 gal",
  fuelN: 1150,
  water: "1,500 L / 396 gal",
  waterN: 1500,
  rangeText:
    "Big tankage — 1,150 L fuel and 1,500 L water for long autonomy under power and sail (theoretical hull speed ~9.2 kn).",
  accommodation:
    "Raised U-shape deck saloon with a wraparound double-glazed window strip; a forward master that exploits the scow-bow volume (peninsula berth + office desk), two aft cabins (the starboard convertible to twin bunks or a workshop), two heads with showers, and a long galley with a 144 L fridge. Three cabins standard, a fourth optional; 8 berths.",
  highLatText:
    "Built for it — a fully welded, insulated, twin-watertight-bulkhead \"practically unsinkable\" alloy hull, a heated enclosed doghouse, a grounding keel for drying out, and Refleks/Eberspächer heating options. Boréal's pedigree is proven (a Boréal 47 ran the Northwest Passage in 2024), though the 56 itself is too new for its own polar log.",
  tropicalText:
    "Capable — shoal 1.20 m board-up draft for reefs and lagoons, 1,500 L water, a big fridge and opening hatches/ports; as with all bare-alloy boats the hull and dark doghouse need awnings and ventilation in the heat. Model-specific tropical detail is thin beyond the brand's \"from the Tropics to extreme cold\" positioning.",
  priceText: "~$1.6M–$1.9M (new)",
  priceNew:
    "Base €1,486,900 ex-VAT (~$1.6M); ready-to-sail €1.51M, comfort pack €1.57M; Yachting World test boat ~€1.45M + ~€220k options (2025)",
  priceUsed: "None yet — brand-new model (first hulls 2025); no second-hand market",
  priceMinUSD: 1600000,
  priceMaxUSD: 1900000,
  budget: "over",
  budgetN: 3,
  budgetText:
    "Well over budget — the flagship lists at €1.49M+ ex-VAT (~$1.6M, dearer optioned and with VAT) and has no used market yet. The in-budget Boréals are the 47.2 or a used 52.",
  priceExamples: [
    "Base ex-shipyard €1,486,900 ex-VAT (2025, YACHT.de)",
    "Ready-to-sail €1,509,780 / comfort pack €1,567,730 ex-VAT",
    "Yachting World test boat ~€1.45M + ~€220k options",
  ],
  scores: {
    protection: 5,
    handling: 4.5,
    dogs: 4.5,
    workshop: 4.5,
    storage: 5,
    tankage: 5,
    highlat: 5,
    tropical: 4,
    budget: 1,
  },
  tags: ["Hard doghouse", "Scow bow", "Aluminium centreboard", "New flagship"],
  fun: [
    "The 56's scow bow was borrowed from IMOCA 60 ocean racers — Delvoye: \"We tried an extreme one and it worked.\"",
    "Ten customers cancelled their Boréal 55 orders and switched to the 56 before it had even launched.",
    "On its delivery trip the test boat crossed Brittany to Holland in 35–50 kn winds and reportedly \"ran like it was on rails.\"",
  ],
  notable:
    "Boréal's new flagship — the natural evolution of the 52/55/55 OC; first revealed mid-2025 with the second hull on test that autumn. Nominated for European Yacht of the Year 2026 (over-16 m). Builder pedigree includes a Boréal 47 completing the Northwest Passage in 2024 and EYOTY wins for the 47.2 (2021) and 52 (2015).",
  sources: [
    {
      name: "Boréal 56 spec sheet (PDF, 2025)",
      url: "https://www.boreal-yachts.com/wp-content/uploads/2025/03/SPECIFICATIONS-BOREAL-56-2025.pdf",
    },
    {
      name: "Boréal 56 review — Yachting World",
      url: "https://www.yachtingworld.com/reviews/boat-tests/boreal-56-review-aluminium-explorer-yacht-with-a-scow-influenced-shape",
    },
    {
      name: "Boréal 56 test — YACHT.de",
      url: "https://www.yacht.de/en/yachts/cruising-yachts/boreal-56-globetrotter-for-extreme-areas-in-the-test/",
    },
    {
      name: "Boréal Yachts — builder",
      url: "https://www.boreal-yachts.com/?lang=en",
    },
    {
      name: "European Yacht of the Year 2026 nominees",
      url: "https://www.yacht.de/en/yachts/shipyards/european-yacht-of-the-year-2026-the-nominees-for-european-yacht-of-the-year/",
    },
  ],
  youtube: [
    {
      name: "BOREAL 56 — blue water expedition perfection",
      url: "https://www.youtube.com/watch?v=Tt-RtyEZ1Ww",
      note: "Builder feature",
    },
    {
      name: "BOREAL 56 : le nouveau Boréal! / The new Boréal!",
      url: "https://www.youtube.com/watch?v=TXElLQqnvC0",
      note: "2025 reveal",
    },
    {
      name: "Boréal Yachts — channel",
      url: "https://www.youtube.com/channel/UC8dePDAyqXwVKYsQlI_AQgg",
      note: "Official channel",
    },
  ],
  pros: [
    "More space and a better-organised cockpit than the 52/55 — the scow bow opens up a forward master and separates the sailing cockpit from an enlarged guest area with a clear run to the bathing platform.",
    "Faster and drier than its predecessors — a taller fractional rig + symmetric scow hull; surfed to 11.5 kn on test.",
    "Genuinely go-anywhere build — fully welded 5083/5086 alloy, a 12 mm keel and twin watertight bulkheads (\"practically unsinkable\"), with a grounding keel for drying out.",
    "Serious expedition autonomy — 1,150 L fuel + 1,500 L water, >12 m³ stowage, a workbench/vice and an optional technical cabin.",
    "Proven builder pedigree for high latitudes — a Boréal 47 ran the Northwest Passage in 2024; multiple Yacht-of-the-Year wins across the range.",
    "Strong expert reception — Yachting World: it \"leads by the nose\" for far-reaching voyaging.",
  ],
  cons: [
    "Very expensive and dearer fast — ~€1.49M base ex-VAT (~$1.6M); the test boat carried ~€220k of options, and an optioned spec is listed at €1.6M.",
    "Brand-new model with almost no track record — only ~2 hulls launched and no owner-voyage history or used market yet.",
    "Long wait — a ~3-year build slot, with up to 12 boats in build at once.",
    "Not a thrilling helm — Yachting World calls it \"not the most exciting to helm.\"",
    "A heavy, deep-when-down passagemaker (20.5 t light / 24.7 t loaded, 3.18 m board-down) — not a coastal sportboat.",
    "Many expedition essentials are options (cutter staysail, heating, 110 hp engine, autopilot/nav packages), inflating the real cruising price.",
  ],
  awards: [],
  endorsements: [
    {
      who: "Yachting World",
      note: "\"For those with far-reaching voyaging aspirations, the Boréal 56 leads by the nose… it'll outperform most others in this voyager sector.\"",
      url: "https://www.yachtingworld.com/reviews/boat-tests/boreal-56-review-aluminium-explorer-yacht-with-a-scow-influenced-shape",
    },
    {
      who: "YACHT (Jochen Rieker)",
      note: "Delivered the test boat through 35–50 kn winds: \"ran like it was on rails… behind the raw, ultra-rugged shell she hides more finesse than before.\"",
      url: "https://www.yacht.de/en/yachts/cruising-yachts/boreal-56-globetrotter-for-extreme-areas-in-the-test/",
    },
  ],
  badge: "EYOTY 2026 nominee",
  own: {
    mastStep: "Deck-stepped",
    keelRudder:
      "Lifting NACA centreboard in a long welded keel-trunk with internal lead ballast (no bolt-on keel) + a grounding plate · single aluminium NACA rudder flanked by two lifting daggerboards",
    complexity:
      "Moderate–high — a robust welded-alloy platform, but a fully-outfitted expedition 56 layers on heating, a watermaker, multiple charging sources and nav/autopilot packages.",
    maintain:
      "Good for a hands-on owner — a dedicated workbench/vice, engine access from both aft cabins, and an alloy hull any competent welder can repair; aluminium electrolysis/anode discipline is required.",
    partsText:
      "Active, well-regarded builder (up to 12 boats in build, ~113 delivered), but boat-specific/alloy support routes through France; mainstream gear (Yanmar, B&G, Lewmar, Antal) is easy worldwide.",
    problems:
      "Too new for a defect record. Watch items: the usual aluminium galvanic/anode discipline and a long build-slot wait; the builder document is internally inconsistent on ballast and the sail-area split (verify the as-built spec).",
    sentiment:
      "Early reviews are strongly positive on build, seaworthiness and the roomier, faster scow hull; the main reservations are price, the brand-new track record and a sedate helm feel.",
    communities: [
      {
        name: "Boréal Yachts (YouTube)",
        url: "https://www.youtube.com/channel/UC8dePDAyqXwVKYsQlI_AQgg",
      },
      { name: "Boréal blog", url: "https://www.boreal-yachts.com/boreal-blog/?lang=en" },
      {
        name: "Cruisers Forum — Boréal",
        url: "https://www.cruisersforum.com/forums/f47/boreal-sailboats-165018.html",
      },
    ],
    risks: [
      "Price well over budget (~€1.49M+ ex-VAT, ~$1.6M)",
      "Brand-new model — no track record or used market yet",
      "~3-year build-slot wait",
      "Aluminium electrolysis/anode discipline required",
    ],
    scores: { maintain: 4, simplicity: 3, parts: 3, community: 3 },
  },
  engineHp: 80,
};

const at = boats.findIndex((b) => b.id === "boreal55");
const insertAt = at >= 0 ? at + 1 : boats.length;
boats.splice(insertAt, 0, boreal56);
writeFileSync(path, JSON.stringify(boats, null, 2) + "\n");
console.log(
  `OK — fleet now ${boats.length} boats; boreal56 inserted at index ${insertAt}.`,
);
