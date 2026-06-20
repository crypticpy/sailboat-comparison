// Add the value-cluster Hanse aft-cockpit cruisers: 575, 588, 548, 545.
// Per the user: "Hanse 575 588 and other 50-60 ft Hanse that can be had used
// less than 700k." All four are Judel/Vrolijk performance cruisers from
// HanseYachts (Greifswald) — the 575 is the very hull under the Moody DS54.
// Sourced from four parallel offshore-research dossiers. Key cross-model
// correction: every one has a SINGLE spade rudder + twin wheels (NOT twin
// rudders). Deterministic transform of data/boats.json — run once.
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../data/boats.json", import.meta.url);
const boats = JSON.parse(readFileSync(path, "utf8"));
if (boats.some((b) => ["hanse575", "hanse588", "hanse548", "hanse545"].includes(b.id)))
  throw new Error("Hanse records already present — refusing to duplicate");

const hanse575 = {
  id: "hanse575",
  name: "Hanse 575",
  builder: "HanseYachts · Germany",
  designer: "Judel/Vrolijk & Co.",
  color: "#5a6b3b",
  years: "2012–c.2016 · succeeded by the 588",
  material: "GRP (cored hull, vinylester outer)",
  category: "Aft-cockpit bluewater",
  loa: "56'4\" (17.15 m)",
  loaN: 17.15,
  lwl: "49'8\" (15.15 m)",
  beam: "17'1\" (5.20 m)",
  beamFt: 17.06,
  lwlFt: 49.67,
  dispLb: 42990,
  draftMin: "7'5\" (2.25 m shoal)",
  draftMinN: 2.25,
  draftMax: "9'4\" (2.85 m deep)",
  displacement: "19,500 kg / 42,990 lb (light; shoal-spec ~20,400 kg)",
  ballast: "5,900 kg cast iron",
  ballastRatio: "~30%",
  sailArea: "161.5 m² / 1,738 ft² upwind (87.5 main + 63 self-tacking jib)",
  sad: "~22",
  dl: "~215",
  airDraft: "25.3 m / 83'",
  engine: "Volvo D3-110 (107 hp); D3-150 opt",
  drive: "Shaft",
  cabins: "3 cabins / 2 heads (up to 6/4 charter)",
  keel: "Cast-iron T-keel (deep 2.85 m / shoal 2.25 m) · SINGLE deep semi-balanced spade rudder (Jefa linkage) · twin wheels",
  cockpit: "Open aft cockpit, twin wheels; sprayhood/bimini optional; high bulwarks and secure side decks — no inside helm",
  cockpitType: "Aft cockpit (open)",
  bestFor:
    "The value-minded couple who want a fast, genuinely two-handed 57-footer with real ocean miles behind the design — accepting a production performance-cruiser's exposed cockpit in exchange for a lot of boat well under budget.",
  protectionText:
    "Moderate and honest. This is an open aft cockpit with twin wheels and no inside helm — watch-keeping is exposed (a sprayhood/bimini is a near-essential add). What it does well: high bulwarks, wide secure side decks and a deep cockpit. Reviewers call it \"fast, dry and pleasurable to sail short-handed,\" but for cold/heavy-weather watches it's nowhere near the shelter of the Moody DS built on this same hull.",
  rig: "9/10 fractional sloop on a keel-stepped Seldén spar; self-tacking jib on a curved under-deck track standard; optional genoa/Code 0 on a second forestay; in-mast furling common.",
  handlingText:
    "A real strength — \"easier to sail than boats half its size.\" Self-tacking jib, all lines led aft under the deck, electric winches at the helms; reefing and hoisting are one-person jobs from the wheel. The Jefa steering \"felt direct\" and \"steering from far aft proved a joy\" (Yachting World); owners confirm it's \"easy for two people to handle.\"",
  engineWorkshop:
    "Volvo D3-110 (107 hp; 150 hp optional) on a shaft under the companionway; access is adequate but reviewers flagged turbo/engine noise below decks. The autopilot drive is reliable (Jefa) but lives in a cramped void — owners report adjusting it underway was a knuckle-skinning job.",
  systems:
    "Production systems set: electric winches, B&G electronics, electric heads, optional genset/A-C/watermaker. Owners widely dislike the Jabsco electric toilets and note the powerful winches can over-tension halyards. Survey grounding/bonding (some boats lack keel/rudder/seacock bonding and a hull anode).",
  storageText:
    "Excellent — a huge, light interior with deep stowage; a liveaboard couple (the Williams) loaded 350 kg of gear and were \"pleasantly surprised by the ample storage.\" Walk-through transom/garage for tender and toys.",
  fuel: "520 L / 137 gal",
  fuelN: 520,
  water: "810 L / 214 gal",
  waterN: 810,
  rangeText:
    "Moderate fuel (520 L / 137 gal) for a 57-footer — plan fuel/jerry cans and a watermaker for ocean legs; ~700–900 nm motoring (estimate).",
  accommodation:
    "Voluminous 3-cabin / 2-head standard layout (up to 6/4 for charter), bright with big hull windows and high headroom. Aft-cockpit, companionway-down living — NOT single-level — so dogs use the transom/garage to board but face a companionway ladder below; freeboard is high (step-ladders are fitted to reach aft-cabin hatches).",
  highLatText:
    "Fair — CE Cat A and a stiff, dry hull (\"rock solid\" in 25 kt), but the exposed open cockpit with no inside helm makes cold/wet watch-keeping hard, and the big windows/high freeboard add windage. Capable in the hands of a well-dressed crew, but not a sheltered high-latitude platform.",
  tropicalText:
    "Good — a big, airy, light-filled interior, lots of opening hatches and a walk-through swim platform suit warm-climate anchorage life; add a bimini for cockpit shade. Deep standard keel (2.85 m) wants the shoal option (2.25 m) for thin water.",
  priceText: "$400k–$600k (used)",
  priceNew: "New ~$550,000 FOB Baltimore (2014, base)",
  priceUsed: "Used ~$300k–$600k; well-equipped 2014–2016 boats cluster $400k–$595k",
  priceMinUSD: 300000,
  priceMaxUSD: 600000,
  budget: "fit",
  budgetN: 1,
  budgetText:
    "Outstanding value — every 575 on the market sits well under $700k (typically $400k–$600k), leaving real headroom under a $1M budget for a proper bluewater refit. The most ocean-proven of the value Hanses, with the better Jefa steering.",
  priceExamples: [
    "2015 — US$595,000 (Fort Lauderdale, YachtWorld)",
    "2014 \"Burning Desire\" — ~US$442,000 (SYS, Phuket, bluewater-equipped)",
    "2013 — €295,000 (Boat24, EU)",
  ],
  scores: {
    protection: 3,
    handling: 4.5,
    dogs: 3,
    workshop: 3,
    storage: 4.5,
    tankage: 3,
    highlat: 3,
    tropical: 4,
    budget: 4.5,
  },
  tags: ["Value 57-footer", "Two-handed friendly", "Judel/Vrolijk hull", "ARC-proven"],
  fun: [
    "It's the hull under the Moody DS54: Dixon's deck-saloon line drawings came back so close to the Judel/Vrolijk 575 that Hanse used that hull — the Moody is essentially \"a two-storey Hanse.\"",
    "Barbie & Wayne Williams have lived aboard their 575 for a decade — \"about 17,000 nm in northern Europe and the Med so far… 99% of this distance two up.\"",
    "Hanse sold ~145 of them in the first two years; 575s like \"Ximera\" and \"Seaside\" are regular ARC Atlantic-crossing boats.",
  ],
  notable:
    "A fast, dry, genuinely two-handed 57-footer with multiple documented ARC crossings and an in-progress couple's circumnavigation — and the Judel/Vrolijk hull that the Moody Decksaloon 54 is built on.",
  sources: [
    { name: "Specs — Boat-Specs (standard)", url: "https://www.boat-specs.com/sailing/sailboats/hanse/hanse-575-standard" },
    { name: "Boat test — Yachting World (Toby Hodges)", url: "https://www.yachtingworld.com/reviews/boat-tests/hanse-575-review-impressive-home-comforts-from-the-archive" },
    { name: "Test (bluewater author) — SAILING / John Kretschmer", url: "https://sailingmagazine.net/article-permalink-1678.html" },
    { name: "Review (rudder/upwind) — Blue Water Sailing", url: "https://www.bwsailing.com/boat-reviews-hanse-575/" },
    { name: "Decade-long two-handed liveaboard — HanseYachts community", url: "https://hanseyachts.com/us/community/a-decade-long-liveaboard-journey/" },
    { name: "ARC 575s (Ximera, Seaside, Yarwood) — Yachting World", url: "https://www.yachtingworld.com/arc/preparing-for-an-atlantic-crossing-how-to-budget-and-avoid-expensive-late-discoveries-163121" },
    { name: "Owner pros & cons — myHanse forum", url: "https://www.myhanse.com/pros-and-cons-of-a-575_topic11472.html" },
    { name: "Atlantic crossing gear-failure log — A Yacht More to Life", url: "https://ayachtmoretolife.com/2017/01/07/atlantic-crossing-issues-and-gear-failure/" },
  ],
  youtube: [
    { name: "On test: Hanse 575 — Yachting World", url: "https://www.youtube.com/watch?v=oSSRsQp0uKQ", note: "Pro sea-trial video" },
  ],
  pros: [
    "Genuinely two-handed at 57 ft: self-tacking jib, all lines aft, electric winches, one-person reefing/hoisting — confirmed by reviewers and owners.",
    "Fast, close-winded and dry (SA/D ~22; 8+ kt upwind tacking ~90°); \"rock solid\" in 25 kt — a boat that actually sails.",
    "The better-steered value Hanse — robust Jefa linkage (the 588 downgraded to Lewmar); CE Cat A with documented ARC crossings and a couple's circumnavigation.",
    "Huge, light interior and massive stowage for long-term liveaboard with dogs and provisions.",
    "Strong value — typically $400k–$600k used, leaving budget for a proper offshore refit.",
  ],
  cons: [
    "Production performance-cruiser, not a dedicated bluewater boat — one offshore owner had a threaded stanchion/rail fitting shear (\"a really poor design detail\") and budgets a real prep list.",
    "No protected inside helm (unlike the Moody DS54 on the same hull) — the couple stands watch fully exposed in cold/heavy weather.",
    "Very high freeboard + windage: hatches unreachable from inside (step-ladders fitted), awkward in gusts and tight berths; harder dog/MOB re-boarding.",
    "Single deep spade rudder + 2.85 m keel — deep draft limits some grounds (shoal option helps); loss of the one rudder = loss of steering.",
    "Systems-heavy and noisy below (turbo/engine noise flagged); electric Jabsco heads widely disliked; survey osmosis, keel bolts, rudder, grounding and anodes.",
  ],
  awards: [],
  endorsements: [
    {
      who: "Yachting World (Toby Hodges)",
      note: "\"A very capable boat and indeed manageable by a couple… a fast, dry and pleasurable boat to sail short-handed.\"",
      url: "https://www.yachtingworld.com/reviews/boat-tests/hanse-575-review-impressive-home-comforts-from-the-archive",
    },
    {
      who: "John Kretschmer (SAILING)",
      note: "In a 25-knot easterly: \"We were a bit overpowered… and kicked up sheets of spray, but the 575 felt rock solid in the water\"; built to Germanischer Lloyd SE oceangoing standards.",
      url: "https://sailingmagazine.net/article-permalink-1678.html",
    },
  ],
  badge: "ARC-proven",
  own: {
    mastStep: "Keel-stepped (Seldén alloy)",
    keelRudder: "Bolted cast-iron T-keel (deep/shoal) · SINGLE deep semi-balanced spade rudder with Jefa linkage · cored GRP hull, vinylester outer",
    complexity: "Moderate–High — electric winches, B&G electronics, electric heads, optional genset/watermaker; the rig and sail handling are simple two-handed, but the systems count is high.",
    maintain: "Moderate — mainstream Volvo/Lewmar/Seldén/Jefa hardware and a wide Hanse dealer network help; the cored hull, deck/hull windows and electrics want regular attention.",
    partsText: "Good — HanseYachts is a large operating builder with broad dealer/parts coverage and strong hardware commonality across the range; Volvo engine. Model is discontinued but well supported.",
    problems: "Owner-reported: hatch/window leaks, stiff headsail furling, unreliable Jabsco electric heads, steering-cable tension loosening, and brand-level rudder-construction debate (sacrificial-tip foam-core blade) plus missing keel/rudder/seacock bonding on some hulls. Survey hard — owners say surveyors \"missed numerous items.\"",
    sentiment: "Owners love the sailing, speed and two-handed ease (\"fast, fun and easy to sail\"); the gripes are systems reliability, build-detail niggles and the exposed cockpit.",
    communities: [
      { name: "myHanse — Hanse Owners Forum (575 threads)", url: "https://www.myhanse.com/pros-and-cons-of-a-575_topic11472.html" },
      { name: "Cruisers Forum — 575 vs Amel 55 vs Moody 54DS", url: "https://www.cruisersforum.com/forums/f47/sailing-around-the-world-with-a-hanse-575-amel-55-or-moody-54ds-157232.html" },
    ],
    risks: [
      "Exposed open cockpit / no inside helm for ocean watches",
      "Single spade rudder + brand rudder-construction debate — survey it",
      "High freeboard/windage; systems-heavy, noisy below",
      "Production build needs a real offshore-prep budget",
    ],
    scores: { maintain: 3, simplicity: 3, parts: 4, community: 4 },
  },
  engineHp: 110,
};

const hanse588 = {
  id: "hanse588",
  name: "Hanse 588",
  builder: "HanseYachts · Germany",
  designer: "Judel/Vrolijk & Co.",
  color: "#4f6340",
  years: "2016–c.2021 · successor to the 575",
  material: "GRP (balsa-cored, vinylester outer)",
  category: "Aft-cockpit bluewater",
  loa: "56'5\" (17.2 m)",
  loaN: 17.2,
  lwl: "49'8\" (15.15 m)",
  beam: "17'1\" (5.20 m)",
  beamFt: 17.06,
  lwlFt: 49.67,
  dispLb: 43000,
  draftMin: "7'5\" (2.27 m shoal)",
  draftMinN: 2.27,
  draftMax: "9'4\" (2.85 m deep)",
  displacement: "~19,200–19,800 kg light / ~42,300–43,650 lb (loaded ~22,800 kg)",
  ballast: "5,900–7,500 kg (keel-dependent)",
  ballastRatio: "~29–33%",
  sailArea: "157 m² / 1,690 ft² upwind (93 main + 64 self-tacking jib)",
  sad: "~20",
  dl: "~165–183",
  airDraft: "~25.9 m / 85'",
  engine: "Volvo 110 hp std; 150 hp opt",
  drive: "Shaft",
  cabins: "3–5 cabins / 2–5 heads",
  keel: "L-bulb (shoal/standard) or deep T-keel (2.27–2.85 m) · SINGLE central spade rudder (Lewmar quadrant) · twin wheels",
  cockpit: "Open aft cockpit, twin wheels; fixed GRP T-top option gives a well-protected cockpit; no inside helm",
  cockpitType: "Aft cockpit (open; T-top opt)",
  bestFor:
    "The value couple who want the newest big aft-cockpit Hanse with the optional protective T-top — provided they treat the single-quadrant Lewmar steering as a must-fix before going offshore.",
  protectionText:
    "Better than the 575 if you buy the fixed GRP T-top — an owner calls it \"a real and major advantage on a long trip, in bad weather and under the sun.\" High bulwarks add security. But it's still an open cockpit with no inside helm, so heavy-weather/cold watch-keeping is exposed compared with the Moody DS.",
  rig: "Fractional sloop on a keel-stepped Seldén spar; self-tacking jib + Code 0 on a second forestay; electric winches at both helms.",
  handlingText:
    "Excellent short-handed — self-tacking jib + Code 0, electric winches, retractable bow & stern thrusters; \"tack all day with minimal effort using just a finger on the carbon wheels.\" The serious asterisk is the steering system (see Cons): owners rate the helm feel good but the single Lewmar quadrant a weak point offshore.",
  engineWorkshop:
    "Volvo 110 hp (150 hp opt) on a shaft; quiet and strong under power (>9 kt at 2,150 rpm). A production fit-out with access behind joinery; the steering quadrant/autopilot share one gearbox — a documented single point of failure.",
  systems:
    "C-Zone digital switching, electric winches, big house bank, genset/A-C/watermaker typical. Owners advise offshore upgrades: bronze seacocks (the composite thru-hulls \"can snap\"), larger bilge pumps, and a Jefa steering retrofit + windvane/drogue backup.",
  storageText:
    "Generous — large, configurable interior (3–5 cabins), deep lockers and a transom garage; ample for a liveaboard couple with dogs and toys.",
  fuel: "520 L / 137 gal",
  fuelN: 520,
  water: "810 L / 214 gal",
  waterN: 810,
  rangeText:
    "Moderate fuel (520 L / 137 gal) for the size — plan fuel/jerry cans plus a watermaker for ocean legs; ~700–900 nm motoring (estimate).",
  accommodation:
    "Big, bright, highly configurable interior (3–5 cabins / 2–5 heads). Aft-cockpit, companionway-down living — not single-level — so dogs board via the transom/garage but face a ladder below; high freeboard and big hull windows light it beautifully.",
  highLatText:
    "Fair — CE Cat A and (with the T-top) a more sheltered cockpit than the 575, but still no inside helm and lots of glazing/windage. A capable, dry boat for a hardy crew rather than a cold-climate watch-keeping platform.",
  tropicalText:
    "Excellent — the fixed T-top shades the cockpit, the airy glazed interior and transom platform suit warm anchorages; choose the shoal keel (2.27 m) for thin water.",
  priceText: "$430k–$700k (used)",
  priceNew: "New ~$800,000 sailaway (US, 2018)",
  priceUsed: "Used: EU value ~$430k–$580k; US-flagged $750k–$949k; 2024 near-new ~$1.08M",
  priceMinUSD: 430000,
  priceMaxUSD: 700000,
  budget: "fit",
  budgetN: 1,
  budgetText:
    "Geography is the lever: European used examples (2016–2022) run ~$430k–$580k, comfortably under $700k — US-flagged and near-new (2024) boats push $750k–$1.08M. Most EU prices are ex-VAT, so budget VAT/import. Either way, fit a Jefa steering retrofit into the plan.",
  priceExamples: [
    "2017 — €399,800 ex-VAT (~$432k, Croatia)",
    "2019 — €485,000 ex-VAT (~$524k, Greece)",
    "2024 near-new — ~€1,000,000 (~$1.08M, Italy)",
  ],
  scores: {
    protection: 3.5,
    handling: 4,
    dogs: 3.5,
    workshop: 3,
    storage: 4.5,
    tankage: 3,
    highlat: 3,
    tropical: 4.5,
    budget: 4,
  },
  tags: ["Value 57-footer", "Protective T-top opt", "Two-handed friendly", "Steering caveat"],
  fun: [
    "A two-handed owner couple out of Mallorca logged \"around 20,000 nm between the Med and the Caribbean\" on their 588.",
    "Won 2018 SAIL Best Boats, Flagship Monohull — and launched \"€600k less than the flagship 675.\"",
    "Owners report the big hull windows \"have behaved very well in seas where other boats had window failures.\"",
  ],
  notable:
    "The 575's successor — faster-looking, more configurable, with an optional protective T-top — but carrying the single-quadrant Lewmar steering implicated in the 2021 ARC abandonment of \"Charlotte Jane III.\"",
  sources: [
    { name: "Specs — Boat-Specs (standard)", url: "https://www.boat-specs.com/sailing/sailboats/hanse/hanse-588-standard" },
    { name: "Boat review (sailed; 2018 SAIL Best) — SAIL / Charles Doane", url: "https://sailmagazine.com/boats/boat-review-hanse-588/" },
    { name: "Review — Cruising World", url: "https://www.cruisingworld.com/hanse-588-review/" },
    { name: "ARC 2021 abandonment (steering failure) — Sail-World/WCC", url: "https://www.sail-world.com/news/244418/ARC-2021-Yacht-Charlotte-Jane-III-abandoned" },
    { name: "Owner: steering-system failure & fix — myHanse", url: "https://www.myhanse.com/steering-system-failure-in-arc_topic13128.html" },
    { name: "588 as a world cruiser (owner offshore notes) — myHanse", url: "https://www.myhanse.com/588-as-a-world-cruiser_topic12122.html" },
    { name: "~20,000 nm two-handed owner — YBW forum", url: "https://forums.ybw.com/threads/new-member-hanse-588.621674/" },
  ],
  youtube: [
    { name: "Hanse 588 — guided tour", url: "https://www.youtube.com/watch?v=iPg45mcpu5k", note: "Walkthrough (no verified voyage channel)" },
  ],
  pros: [
    "Genuinely short-handed: self-tacking jib + Code 0, electric winches, bow & stern thrusters — a couple sails and docks it easily.",
    "Optional fixed GRP T-top gives a genuinely protected cockpit — owners call it a major long-trip advantage.",
    "CE Cat A, capsize screening ~1.85; documented ~20,000 nm two-handed owner and dry behaviour in 30-ft swell.",
    "Strong value in Europe (~$430k–$580k) and a hugely configurable liveaboard interior for a couple + dogs.",
    "Fast and quiet — ~8 kt upwind, 9+ kt reaching, and one of the quieter boats under power.",
  ],
  cons: [
    "The single-rudder + single Lewmar quadrant is the real Achilles' heel: the autopilot drives through the same gearbox, so one failure kills wheel AND pilot, with no direct emergency tiller — it contributed to the 2021 ARC abandonment of \"Charlotte Jane III.\" Budget a Jefa retrofit + windvane.",
    "A downgrade from the 575's robust Jefa steering (owners' own verdict).",
    "Production \"built to a price\": owners advise bronze seacocks (composite thru-hulls \"can snap\"), bigger bilge pumps and thruster-door security before ocean work.",
    "No protected inside helm; big hull windows + high freeboard mean windage and glazing to defend in heavy weather.",
    "High autopilot loads (up to ~1,000 lb of steering force cited) stress the very system that's the weak link.",
  ],
  awards: ["SAIL Best Boats 2018 — Flagship Monohull"],
  endorsements: [
    {
      who: "SAIL (Charles J. Doane)",
      note: "Sailed it for 2018 SAIL Best Boats: \"we comfortably pinched as high as 30 degrees off the apparent wind while maintaining boat speeds up to 7.5 knots\"; helm \"easy to find a groove and stay in it.\"",
      url: "https://sailmagazine.com/boats/boat-review-hanse-588/",
    },
    {
      who: "Owner \"Pzucchel\" (myHanse)",
      note: "\"You won't find a large cockpit as protected as the 588 version with the t-top. This is a real and major advantage on a long trip, in bad weather and under the sun.\"",
      url: "https://www.myhanse.com/588-as-a-world-cruiser_topic12122.html",
    },
  ],
  badge: "SAIL Best 2018",
  own: {
    mastStep: "Keel-stepped (Seldén alloy)",
    keelRudder: "Bolted L-bulb/T-keel · SINGLE central spade rudder driven through a single Lewmar quadrant (autopilot shares the same gearbox — a documented single point of failure) · balsa-cored GRP hull",
    complexity: "High — C-Zone digital switching, electric winches, retractable thrusters, big house bank and the usual genset/A-C/watermaker; lots to maintain.",
    maintain: "Lower–Moderate — mainstream hardware and a wide dealer network, but the steering system and systems density push many jobs to a yard, and offshore owners re-engineer the steering.",
    partsText: "Good — large operating builder, broad dealer/parts coverage, Volvo engine; strong commonality across the Hanse range.",
    problems: "The headline is the steering quadrant/gearbox failure (ARC 2021 + at least one other owner) with no direct emergency tiller — owners retrofit Jefa and add a windvane/drogue. Also: composite thru-hulls that can snap, undersized standard bilge pumps, and documented early-build defect clusters on some hulls. Survey hard.",
    sentiment: "Owners praise the sailing, the T-top cockpit and the value, but the steering is a recurring, serious worry that the community actively engineers around.",
    communities: [
      { name: "myHanse — steering-system failure thread", url: "https://www.myhanse.com/steering-system-failure-in-arc_topic13128.html" },
      { name: "myHanse — 588 as a world cruiser", url: "https://www.myhanse.com/588-as-a-world-cruiser_topic12122.html" },
    ],
    risks: [
      "Single-quadrant Lewmar steering — wheel + autopilot fail together; plan a Jefa retrofit + windvane",
      "Composite thru-hulls / undersized bilge pumps — offshore prep needed",
      "No inside helm; big glazing + high windage",
      "Build-quality variance — survey thoroughly",
    ],
    scores: { maintain: 2, simplicity: 2, parts: 4, community: 4 },
  },
  engineHp: 110,
};

const hanse548 = {
  id: "hanse548",
  name: "Hanse 548",
  builder: "HanseYachts · Germany",
  designer: "Judel/Vrolijk & Co.",
  color: "#586b3c",
  years: "2017–c.2024",
  material: "GRP (balsa-cored, vinylester outer)",
  category: "Aft-cockpit bluewater",
  loa: "53'3\" (16.22 m)",
  loaN: 16.22,
  lwl: "48'11\" (14.9 m)",
  beam: "16'7\" (5.05 m)",
  beamFt: 16.57,
  lwlFt: 48.9,
  dispLb: 43200,
  draftMin: "7'3\" (2.2 m shoal)",
  draftMinN: 2.2,
  draftMax: "9'2\" (2.8 m deep)",
  displacement: "~19,600 kg / ~43,200 lb (keel-dependent)",
  ballast: "5,800–6,400 kg (keel-dependent)",
  ballastRatio: "~31%",
  sailArea: "138 m² / 1,485 ft² upwind (80.5 main + 57.5 self-tacking jib)",
  sad: "~19.7",
  dl: "~163",
  airDraft: "~26 m / 85' (est.)",
  engine: "Yanmar ~110 hp (Volvo on some US boats)",
  drive: "Shaft",
  cabins: "3–5 cabins / 2–4 heads",
  keel: "L/T-bulb keel (shoal 2.2 m / standard 2.55 m / deep 2.8 m) · SINGLE spade rudder · twin wheels",
  cockpit: "Open aft cockpit, twin wheels; fixed GRP T-top option; no inside helm",
  cockpitType: "Aft cockpit (open; T-top opt)",
  bestFor:
    "The value couple who want a slightly smaller, more affordable 588-generation Hanse and will accept a marginal (~110°) stability margin and single rudder in exchange for a fast, beautifully short-handed boat — ideally bought in Europe to stay under $700k.",
  protectionText:
    "Moderate — an open aft cockpit, but the fixed GRP T-top option gives genuine shade and shelter, and reviewers praise the \"high bulwark\" security. No inside helm, so heavy-weather watches are still exposed relative to the Moody DS.",
  rig: "Fractional sloop on a keel-stepped Seldén spar; self-tacking jib standard, Code 0 option; electric winches and \"Helmsman Control\" for short-handed work.",
  handlingText:
    "A genuine strength — \"an exceptionally easy yacht to sail single-handed,\" with a self-tacking jib (a 35-second push-button tack), electric winches and bow/stern thrusters. The single rudder gives \"reassuringly direct\" Jefa-feel helm that \"kept the boat on track until the gunwale was approaching the water\" — but reef early on a beamy stern.",
  engineWorkshop:
    "Yanmar ~110 hp (Volvo on some US boats) on a shaft with a folding prop; ~8.5–9 kt at 2,000 rpm. Production access behind joinery; balsa-cored hull wants a careful moisture survey around thru-hulls and windows.",
  systems:
    "C-Zone-style switching, electric winches, retractable bow thruster, optional genset/A-C/watermaker; cruise-spec boats carry lithium, watermakers and Starlink. An incoming owner flagged the retractable bow thruster, hydraulic door and gelcoat fade as watch items.",
  storageText:
    "Good — a large, configurable interior (3–5 cabins), deep lockers and a transom platform; comfortable liveaboard volume for a couple with dogs.",
  fuel: "520 L / 137 gal",
  fuelN: 520,
  water: "770 L / 203 gal",
  waterN: 770,
  rangeText:
    "Moderate fuel (520 L / 137 gal) — plan fuel/jerry cans and a watermaker for ocean legs; ~700–900 nm motoring (estimate).",
  accommodation:
    "Big, bright, configurable interior (3–5 cabins / 2–4 heads) with high freeboard and lots of glazing. Aft-cockpit, companionway-down living — not single-level — so dogs board via the transom but face a ladder below.",
  highLatText:
    "Fair — CE Cat A and a fast, dry hull, but a relatively modest ~110° AVS, lots of glazing/windage and no inside helm make it a hardy-crew boat rather than a cold-climate watch-keeping platform.",
  tropicalText:
    "Excellent — T-top shade, airy glazed interior, good ventilation and a bathing platform suit warm anchorages; shoal 2.2 m keel option helps in thin water.",
  priceText: "$500k–$750k (used)",
  priceNew: "New base ~£345,710 ex-VAT; ~$800,000 as-equipped (US)",
  priceUsed: "Used ~$450k–$750k (straddles the ceiling): cleaner/EU boats under $700k, loaded late boats over",
  priceMinUSD: 450000,
  priceMaxUSD: 750000,
  budget: "tight",
  budgetN: 2,
  budgetText:
    "Straddles the $700k line — cleaner European/ex-VAT and mid-spec US boats clear under it (a circumnavigation-prepped 2022 \"THE ESCAPE\" was €595k ex-VAT, ~$640k), while the loaded, ocean-ready late boats sit at or just over. Shop Europe to stay under budget; survey the rudder and cored hull.",
  priceExamples: [
    "2022 \"THE ESCAPE\" — €595,000 ex-VAT (~$640k, circumnav-prepped, Panama)",
    "2018 \"Catalyst\" — US$746,498 (San Diego, sold)",
    "2018–2019 — US$449,340–$685,532 (Greece/Turkey/Croatia/Bahamas)",
  ],
  scores: {
    protection: 3.5,
    handling: 4.5,
    dogs: 3.5,
    workshop: 3,
    storage: 4,
    tankage: 3,
    highlat: 3,
    tropical: 4.5,
    budget: 3,
  },
  tags: ["Value 54-footer", "Single-handed easy", "Protective T-top opt", "AVS ~110° caveat"],
  fun: [
    "A 2022 hull, \"THE ESCAPE,\" sailed Norway → the Med → the Canaries → over the Atlantic to Barbados and on through the Caribbean to Panama — a real 548 ocean cruise.",
    "World cruisers Frances & Michael Howarth: \"the Hanse 548 ticks all of our boxes and at a price point that is remarkable, given what you get.\"",
    "Yachting World clocked 8.1–8.2 kt punching upwind in 30 knots with a reefed main.",
  ],
  notable:
    "The 54-footer of the 588 generation — a fast, exceptionally short-handed couple's boat with one documented Atlantic/Caribbean cruise, balanced against a marginal ~110° AVS and single-rudder caveats for serious ocean work.",
  sources: [
    { name: "Specs — Boat-Specs (deep draft)", url: "https://www.boat-specs.com/sailing/sailboats/hanse/hanse-548-deep-draft" },
    { name: "Boat test (AVS ~110°, single rudder) — Yachting World", url: "https://www.yachtingworld.com/boat-test/hanse-548-review-120287" },
    { name: "Review (layup) — Cruising World", url: "https://www.cruisingworld.com/boat-review-hanse-548/" },
    { name: "Review (short-handed, world cruisers) — Boating NZ", url: "https://www.boatingnz.co.nz/boat-reviews/hanse-548/" },
    { name: "\"THE ESCAPE\" Atlantic/Caribbean cruise — Grabau International", url: "https://www.grabauinternational.com/news/new-listing-2022-hanse-548/" },
    { name: "Owner notes — myHanse forum", url: "https://www.myhanse.com/new-hanse-548_topic11172.html" },
  ],
  youtube: [
    { name: "Hanse 548 — yacht tour", url: "https://www.youtube.com/results?search_query=hanse+548+review", note: "Brokerage/tour clips (no verified voyage channel)" },
  ],
  pros: [
    "Exceptionally easy single-/two-handed: self-tacking jib (35-second push-button tack), electric winches, bow+stern thrusters.",
    "Fast and well-mannered — 8+ kt cruising, punched upwind at 8.1 kt in 30 kt; \"stable, well-mannered and very quick.\"",
    "Optional fixed T-top gives a genuinely protected, shaded cockpit; high bulwarks add security.",
    "CE Cat A with a documented Atlantic/Caribbean cruise (\"THE ESCAPE\"); strong value-per-foot.",
    "Big, configurable interior and a bathing platform — comfortable liveaboard for a couple + dogs.",
  ],
  cons: [
    "AVS only ~110° (Yachting World) — marginal for serious bluewater; reef early, this is not a heavy-displacement ocean hull.",
    "Single spade rudder on a very beamy stern (a same-era Hanse 531 lost its rudder mid-Atlantic) — inspect/upgrade before crossings.",
    "Balsa-cored hull — demands a careful moisture survey, especially around thru-hulls and hull windows.",
    "No inside helm; big windows + tall topsides mean windage and glazing to defend in heavy weather.",
    "Price ceiling pressure — the best-equipped, ocean-ready boats push to/over $700k; sub-$700k often means older/higher-hours or ex-VAT European boats with import logistics.",
  ],
  awards: [],
  endorsements: [
    {
      who: "Yachting World",
      note: "\"The push-button 50-footer that can be sailed by a couple\" — but \"the AVS… is relatively modest at around 110°.\"",
      url: "https://www.yachtingworld.com/boat-test/hanse-548-review-120287",
    },
    {
      who: "World cruisers Frances & Michael Howarth (Boating NZ)",
      note: "\"The Hanse 548 ticks all of our boxes and at a price point that is remarkable, given what you get.\"",
      url: "https://www.boatingnz.co.nz/boat-reviews/hanse-548/",
    },
  ],
  badge: "",
  own: {
    mastStep: "Keel-stepped (Seldén alloy)",
    keelRudder: "Bolted L/T-bulb keel (shoal/standard/deep) · SINGLE spade rudder · balsa-cored GRP hull",
    complexity: "High — electric winches, retractable bow thruster, C-Zone-style switching and the usual genset/A-C/watermaker on cruise-spec boats.",
    maintain: "Lower–Moderate — mainstream hardware and dealer support, but the cored hull, big glazing and systems density push work to a yard.",
    partsText: "Good — large operating builder with broad dealer/parts coverage; Yanmar/Volvo engines; strong Hanse-range commonality.",
    problems: "No systemic 548-specific defect documented (partly because owner reporting is thin). Generic and family concerns apply: single-rudder durability (same-era 531 rudder loss), Jefa/autopilot topics on the owners' forum, and an incoming owner's worries about the retractable bow thruster, hydraulic door and gelcoat fade.",
    sentiment: "Positive but a thin owner base — praised for short-handed ease, speed and value; the offshore record is lighter than for established bluewater brands.",
    communities: [
      { name: "myHanse — New Hanse 548 thread", url: "https://www.myhanse.com/new-hanse-548_topic11172.html" },
      { name: "myHanse — Hanse Owners Forum", url: "https://www.myhanse.com/" },
    ],
    risks: [
      "Marginal ~110° AVS for serious ocean work — reef early",
      "Single spade rudder on a beamy stern — inspect/upgrade",
      "Balsa-cored hull — careful moisture survey",
      "Loaded examples push over $700k; thin 548-specific offshore record",
    ],
    scores: { maintain: 2, simplicity: 2, parts: 4, community: 4 },
  },
  engineHp: 110,
};

const hanse545 = {
  id: "hanse545",
  name: "Hanse 545",
  builder: "HanseYachts · Germany",
  designer: "Judel/Vrolijk & Co.",
  color: "#62703f",
  years: "2009–2013",
  material: "GRP (foam-cored, vinylester; epoxy opt)",
  category: "Aft-cockpit bluewater",
  loa: "53'3\" (16.2 m)",
  loaN: 16.2,
  lwl: "47'11\" (14.6 m)",
  beam: "16'1\" (4.91 m)",
  beamFt: 16.11,
  lwlFt: 47.9,
  dispLb: 41226,
  draftMin: "6'5\" (1.95 m shoal)",
  draftMinN: 1.95,
  draftMax: "9'2\" (2.80 m deep)",
  displacement: "18,700 kg / 41,226 lb",
  ballast: "5,300 kg",
  ballastRatio: "~28%",
  sailArea: "156 m² / 1,679 ft² upwind (87 main + 57 self-tacking jib)",
  sad: "~22",
  dl: "~167",
  airDraft: "24.95 m / 82'",
  engine: "Volvo D3-110 / Yanmar 4JH4-HTE 110 hp",
  drive: "Shaft",
  cabins: "3–4 cabins / 2–4 heads",
  keel: "Cast-iron T-keel/bulb-fin (deep 2.80 m / shoal 1.95 m) · SINGLE high-aspect spade rudder · twin wheels",
  cockpit: "Open aft cockpit, twin wheels; a dodger/bimini is an offshore essential; no inside helm",
  cockpitType: "Aft cockpit (open)",
  bestFor:
    "The budget-first couple who want the most boat-per-dollar in a 50-something-foot Hanse — the cheapest of the line — and will put the savings into a thorough rudder/rig survey and offshore prep.",
  protectionText:
    "Modest — an open aft cockpit with twin wheels and no inside helm; reviewers say a dodger/hard top is \"an essential addition\" for offshore to protect the crew. Wide secure side decks and good visibility help on deck.",
  rig: "Fractional sloop on a keel-stepped Seldén spar; self-tacking jib on an under-deck track standard, optional genoa; lines led aft to twin helms, electric winches common.",
  handlingText:
    "A genuine highlight — \"easier to sail than many boats half its size.\" Self-tacking jib runs out and tensions from the cockpit; the big high-aspect spade rudder makes \"responsive steering,\" and the boat can be \"easily sailed by one person.\"",
  engineWorkshop:
    "Volvo D3-110 or Yanmar 4JH4-HTE (110 hp) on a shaft; ~100 US gal fuel. Production access behind joinery; on a 2009–2013 boat budget for rig, rudder-bearing and electronics scrutiny at survey.",
  systems:
    "12V/220V with electric winches common, B&G/Raymarine electronics, optional genset/A-C/watermaker; modular \"Individual Cabin Concept\" interior. Survey grounding/bonding and hatch/window seals (leak-prone with age).",
  storageText:
    "Good — a big, modular, light interior (3–4 cabins) with a large galley and ample stowage; wide stern and swim platform for dog/dinghy boarding.",
  fuel: "400 L / 106 gal",
  fuelN: 400,
  water: "700 L / 185 gal",
  waterN: 700,
  rangeText:
    "Smaller fuel tank (400 L / ~106 gal) limits motoring range in calms — its weakest passage spec; plan jerry cans/watermaker for ocean legs.",
  accommodation:
    "Voluminous, modular 3–4 cabin interior with cherry joinery and a big galley. Aft-cockpit, companionway-down living — not single-level — so dogs board via the wide transom but face a ladder below.",
  highLatText:
    "Fair — CE Cat A and a stiff hull, but an exposed open cockpit (dodger \"essential\"), no inside helm, and big windows/freeboard make it a hardy-crew boat, not a cold-climate watch-keeping platform.",
  tropicalText:
    "Good — a big, airy, light-filled interior, plenty of hatches and a wide swim platform suit warm anchorages; add a bimini for shade. Choose the shoal 1.95 m keel for thin water.",
  priceText: "$280k–$450k (used)",
  priceNew: "New ~$440,000 base / $500,000+ sailaway (2010)",
  priceUsed: "Used ~$280k–$450k; EU boats €259k–€295k (~$280k–$320k); turn-key US boats to ~$549k",
  priceMinUSD: 280000,
  priceMaxUSD: 450000,
  budget: "fit",
  budgetN: 1,
  budgetText:
    "The value floor of the 50–60 ft Hanse line — sound boats trade ~$280k–$450k, far under both $700k and a $1M budget, leaving the most room for a full bluewater refit. The trade-off is age: a 2009–2013 boat needs rig, sails, electronics and especially rudder scrutiny.",
  priceExamples: [
    "2010 — €259,500 (~$280k, Preveza, Greece)",
    "2012 — €295,000 (~$320k, Mallorca, De Valk)",
    "2011 — US$549,000 (Worth Avenue, turn-key US boat)",
  ],
  scores: {
    protection: 3,
    handling: 4.5,
    dogs: 3,
    workshop: 3,
    storage: 4,
    tankage: 2.5,
    highlat: 3,
    tropical: 4,
    budget: 5,
  },
  tags: ["Cheapest 50+ Hanse", "Two-handed friendly", "Value pick", "Survey the rudder"],
  fun: [
    "On test it pointed \"at a very tight 25 degrees\" doing 9.3 kt, and took \"gusty winds of up to 30 kts… all in her stride.\"",
    "SAIL called it \"one of those large boats that may look intimidating, but is in fact easier to sail than many boats half its size.\"",
    "Owner Christoph Ganswindt's 545 \"Pachmo\" logged 3,500+ nm and a deep cruising refit (furling boom, twin electric furling headsails, lithium).",
  ],
  notable:
    "The cheapest 50–60 ft Hanse and the 575's predecessor — a fast, easy-to-handle production cruiser whose single deep spade rudder is the one thing to survey hard before ocean work.",
  sources: [
    { name: "Specs — Boat-Specs (standard)", url: "https://www.boat-specs.com/sailing/sailboats/hanse/hanse-545-standard" },
    { name: "Review (build/handling) — SAIL / Adam Cort", url: "https://sailmagazine.com/boats/hanse-545/" },
    { name: "Sea trial (9.3 kt, 30 kt) — boatsales.com.au / Kevin Green", url: "https://www.boatsales.com.au/editorial/details/hanse-545-22795/" },
    { name: "Mini-review — Cruising World", url: "https://www.cruisingworld.com/sailboats/hanse-545-mini-review/" },
    { name: "Owner refit/cruise \"Pachmo\" — YACHT", url: "https://www.yacht.de/en/yachts/cruising-yachts/pachmo-refit-turns-hanse-545-into-a-unique-cruising-yacht/" },
    { name: "Rudder-durability caution (same-era 531 DOVE II) — PBO", url: "https://www.pbo.co.uk/news/family-appeal-find-yacht-abandoned-mid-atlantic-47627" },
    { name: "Buying a 545 (owner survey advice) — myHanse", url: "https://www.myhanse.com/buying-hanse-545_topic4377.html" },
  ],
  youtube: [
    { name: "Hanse 545 — refit & sailing clips", url: "https://www.youtube.com/watch?v=wnAfT5pyvK8", note: "Owner refit (no verified voyage channel)" },
  ],
  pros: [
    "The cheapest way into a 50+ ft Hanse — sound boats ~$280k–$450k, maximum length/volume per dollar.",
    "Genuinely short-handed: self-tacking jib, lines aft to twin helms, electric winches — \"easily sailed by one person.\"",
    "Fast and forgiving (SA/D ~22): 9.3 kt at a tight 25°, and handled 30 kt \"in her stride\"; CE Cat A, capsize screening 1.87.",
    "Huge, modular, well-finished interior (Individual Cabin Concept) and a wide swim platform — good liveaboard volume for a couple + dogs.",
    "Leaves the most budget of any Hanse here for a proper bluewater refit.",
  ],
  cons: [
    "Single deep spade rudder is the key survey item — recurring early-Hanse rudder-delamination reports and a same-era 531 (\"DOVE II\") lost its rudder mid-Atlantic.",
    "Oldest of the group (2009–2013): budget for standing rigging, sails, electronics and rudder-bearing scrutiny.",
    "No protected inside helm; open cockpit needs a dodger/hard top for offshore — exposed watches for a couple and dogs.",
    "Smallest fuel here (~106 gal) limits motoring range in calms; production performance-cruiser, not a heavy bluewater hull (comfort ratio ~31.8).",
    "Big vertical hull windows + high freeboard: windage and a leak/seal maintenance burden with age.",
  ],
  awards: [],
  endorsements: [
    {
      who: "SAIL (Adam Cort)",
      note: "\"This is one of those large boats that may look intimidating, but is in fact easier to sail than many boats half its size\"; the big high-aspect rudder \"makes for responsive steering.\"",
      url: "https://sailmagazine.com/boats/hanse-545/",
    },
    {
      who: "boatsales / Kevin Green",
      note: "\"9.3 kts while pointing at a very tight 25 degrees\"; in \"gusty winds of up to 30 kts… the 545 took this all in her stride\" — but for offshore \"an essential addition would be a dodger.\"",
      url: "https://www.boatsales.com.au/editorial/details/hanse-545-22795/",
    },
  ],
  badge: "Value pick",
  own: {
    mastStep: "Keel-stepped (Seldén alloy)",
    keelRudder: "Bolted cast-iron T-keel/bulb-fin (deep/shoal) · SINGLE high-aspect spade rudder · foam-cored GRP hull (epoxy optional)",
    complexity: "Moderate — self-tacking rig and electric winches keep sailing simple; systems are lighter than the newer 588/548 but it's still a big production cruiser.",
    maintain: "Moderate — mainstream Volvo/Yanmar/Lewmar/Seldén hardware and dealer support; an older boat, so factor age-related rig/electronics/rudder work.",
    partsText: "Good — large operating builder with broad parts coverage and Hanse-range commonality; the model is discontinued but well supported.",
    problems: "Recurring single-spade-rudder durability concern (early-Hanse delamination reports; the same-era 531 DOVE II rudder loss), helm/bearing play, and hatch/window leaks with age. Owners' buy checklist: \"osmosis, keel bolts, rudder hanging, grounding, folding prop, anodes\" — and survey hard.",
    sentiment: "Owners and reviewers love the sailing, ease and value; the consistent cautions are the rudder, the exposed cockpit and age-related upkeep.",
    communities: [
      { name: "myHanse — Buying a Hanse 545", url: "https://www.myhanse.com/buying-hanse-545_topic4377.html" },
      { name: "myHanse — rudder delamination thread", url: "https://www.myhanse.com/rudder-delamination_topic8074.html" },
    ],
    risks: [
      "Single spade rudder — early-Hanse delamination history; survey/upgrade it",
      "Oldest boat here — rig/sails/electronics/rudder-bearing budget",
      "Exposed open cockpit / no inside helm; small fuel tank",
      "Window/hatch leaks and grounding/bonding gaps with age",
    ],
    scores: { maintain: 3, simplicity: 3, parts: 3, community: 4 },
  },
  engineHp: 110,
};

// Insert the four Hanse records after the Moody DS group (keep Hanse-built cluster together)
const anchor = boats.findIndex((b) => b.id === "moodyds41");
const at = anchor >= 0 ? anchor + 1 : boats.length;
boats.splice(at, 0, hanse575, hanse588, hanse548, hanse545);

writeFileSync(path, JSON.stringify(boats, null, 2) + "\n");
console.log(`Wrote data/boats.json: ${boats.length} boats`);
console.log("New Hanse:", ["hanse575", "hanse588", "hanse548", "hanse545"].join(", "));
